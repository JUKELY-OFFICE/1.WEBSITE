import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Outils disponibles pour Claude ───────────────────────────
const tools = [
  {
    name: 'add_menu_item',
    description: 'Ajoute un nouvel item dans le menu (cocktail, plat, bière, tapas, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['breakfast_item','cocktail','happy_hour_cocktail','beer','happy_hour_beer','tapas','planche','lunch_main'] },
        type: { type: 'string', enum: ['food','cocktail','drink','beer','tapas'] },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        featured: { type: 'boolean' },
      },
      required: ['category', 'type', 'name', 'price'],
    },
  },
  {
    name: 'update_menu_item',
    description: 'Modifie un item existant du menu (prix, nom, description, visibilité)',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nom actuel de l\'item à modifier' },
        updates: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            active: { type: 'boolean' },
            featured: { type: 'boolean' },
          },
        },
      },
      required: ['name', 'updates'],
    },
  },
  {
    name: 'delete_menu_item',
    description: 'Supprime (désactive) un item du menu',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_schedule',
    description: 'Modifie les horaires d\'ouverture (petit-déjeuner, déjeuner, happy hour)',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['breakfast','lunch','happy_hour'] },
        start: { type: 'string', description: 'Heure de début HH:MM' },
        end: { type: 'string', description: 'Heure de fin HH:MM' },
      },
      required: ['period'],
    },
  },
  {
    name: 'add_breakfast_formula',
    description: 'Ajoute une nouvelle formule petit-déjeuner',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        description: { type: 'string' },
        items: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'price'],
    },
  },
  {
    name: 'update_breakfast_formula',
    description: 'Modifie une formule petit-déjeuner (prix, items inclus)',
    input_schema: {
      type: 'object',
      properties: {
        formula_key: { type: 'string', enum: ['basique','gourmand','audacieux','brunch'] },
        updates: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['formula_key', 'updates'],
    },
  },
];

// ── Exécution des outils ──────────────────────────────────────
async function executeTool(venueId: string, toolName: string, input: any): Promise<string> {
  switch (toolName) {
    case 'add_menu_item': {
      const { error } = await supabase.from('wf_menu_items').insert({
        venue_id: venueId,
        category: input.category,
        type: input.type,
        name: input.name,
        description: input.description || null,
        price: input.price,
        featured: input.featured ?? false,
        active: true,
        sort_order: 99,
        tags: [],
      });
      if (error) return `Erreur: ${error.message}`;
      return `Item "${input.name}" ajouté avec succès.`;
    }

    case 'update_menu_item': {
      const { data: items } = await supabase
        .from('wf_menu_items')
        .select('id')
        .eq('venue_id', venueId)
        .ilike('name', `%${input.name}%`)
        .limit(1);

      if (!items?.length) return `Item "${input.name}" introuvable.`;

      const { error } = await supabase
        .from('wf_menu_items')
        .update(input.updates)
        .eq('id', items[0].id);

      if (error) return `Erreur: ${error.message}`;
      return `Item "${input.name}" mis à jour.`;
    }

    case 'delete_menu_item': {
      const { error } = await supabase
        .from('wf_menu_items')
        .update({ active: false })
        .eq('venue_id', venueId)
        .ilike('name', `%${input.name}%`);

      if (error) return `Erreur: ${error.message}`;
      return `Item "${input.name}" supprimé du menu.`;
    }

    case 'update_schedule': {
      const updates: any = {};
      if (input.start) updates[`${input.period}_start`] = input.start;
      if (input.end)   updates[`${input.period}_end`]   = input.end;

      const { error } = await supabase
        .from('wf_venues')
        .update(updates)
        .eq('venue_id', venueId);

      if (error) return `Erreur: ${error.message}`;
      return `Horaires ${input.period} mis à jour.`;
    }

    case 'add_breakfast_formula': {
      const formulaKey = input.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { error } = await supabase.from('wf_breakfast_formulas').insert({
        venue_id: venueId,
        formula_key: formulaKey,
        name: input.name,
        price: input.price,
        description: input.description || null,
        items: input.items ?? [],
        active: true,
        sort_order: 99,
      });
      if (error) return `Erreur: ${error.message}`;
      return `Formule "${input.name}" ajoutée avec succès.`;
    }

    case 'update_breakfast_formula': {
      const { error } = await supabase
        .from('wf_breakfast_formulas')
        .update(input.updates)
        .eq('venue_id', venueId)
        .eq('formula_key', input.formula_key);

      if (error) return `Erreur: ${error.message}`;
      return `Formule "${input.formula_key}" mise à jour.`;
    }

    default:
      return 'Outil inconnu.';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { message, venueId, history = [] } = await req.json();

    // Contexte actuel du menu
    const [venueRes, itemsRes, formulasRes] = await Promise.all([
      supabase.from('wf_venues').select('*').eq('venue_id', venueId).single(),
      supabase.from('wf_menu_items').select('name,category,price,active').eq('venue_id', venueId).eq('active', true).order('category').order('sort_order'),
      supabase.from('wf_breakfast_formulas').select('formula_key,name,price,items').eq('venue_id', venueId).eq('active', true),
    ]);

    const systemPrompt = `Tu es l'assistant du restaurant "${venueRes.data?.name || 'The Saint Placide'}".
Tu aides le propriétaire à gérer son menu TV via des outils.
Menu actuel (résumé):
- Formules petit-déjeuner: ${(formulasRes.data || []).map((f: any) => `${f.name} ${f.price}€`).join(', ')}
- Items: ${(itemsRes.data || []).map((i: any) => `${i.name} (${i.category})`).join(', ')}
Réponds toujours en français. Confirme ce que tu as fait après chaque action.
Quand le message commence par "add_menu_item:", extrait les paramètres et appelle directement add_menu_item — price est toujours un nombre.
Quand le message commence par "add_breakfast_formula:", extrait les paramètres et appelle directement add_breakfast_formula — price est toujours un nombre.
Quand le message commence par "update_menu_item:", extrait current_name, name, price (nombre), description et appelle update_menu_item avec name=current_name pour trouver l'item, updates={name, price, description}.
Quand le message commence par "update_breakfast_formula:", extrait formula_key, name, price (nombre), description et appelle update_breakfast_formula avec ces valeurs exactes — ne jamais arrondir ou modifier le price.`;

    const claudeMessages = [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    let changed = false;
    let reply = '';

    // Appel Claude avec tool use
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: claudeMessages,
      }),
    });

    const claudeData = await response.json();

    // Traiter les tool calls
    if (claudeData.stop_reason === 'tool_use') {
      const toolResults = [];

      for (const block of claudeData.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(venueId, block.name, block.input);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
          changed = true;
        }
      }

      // Second appel pour avoir la réponse finale
      const followUp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: systemPrompt,
          tools,
          messages: [
            ...claudeMessages,
            { role: 'assistant', content: claudeData.content },
            { role: 'user', content: toolResults },
          ],
        }),
      });

      const followUpData = await followUp.json();
      reply = followUpData.content?.find((b: any) => b.type === 'text')?.text || 'Fait !';
    } else {
      reply = claudeData.content?.find((b: any) => b.type === 'text')?.text || 'Je n\'ai pas compris.';
    }

    return Response.json({ reply, changed }, { headers: corsHeaders });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: 'Erreur serveur.', changed: false }, { status: 500, headers: corsHeaders });
  }
});

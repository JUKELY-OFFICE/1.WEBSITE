# Jukely Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build jukely.fr — a bilingual (FR/EN) presentation website for a modular restaurant software studio, targeting restaurateurs and investors.

**Architecture:** Next.js 14 App Router with `next-intl` for i18n (FR default at `/`, EN at `/en/...`). Homepage is a long-scroll page with summary sections linking to dedicated sub-pages (`/modules`, `/pricing`, `/about`, `/contact`). All data (bricks, pricing) stored as typed TypeScript constants. Dark-mode-only design with amber accent.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, next-intl, Inter font (next/font), Vercel deployment.

---

## File Structure

```
src/
  app/
    [locale]/
      layout.tsx           # Root layout: font, dark bg, Navbar, Footer
      page.tsx             # Homepage (all 7 sections)
      modules/page.tsx     # Full brick catalogue
      pricing/page.tsx     # Pricing table + FAQ
      about/page.tsx       # Team + vision
      contact/page.tsx     # Contact form
  components/
    layout/
      Navbar.tsx           # Logo + nav links + language toggle
      Footer.tsx           # Links + legal
    ui/
      Button.tsx           # Reusable CTA button (primary / secondary variants)
      Badge.tsx            # Status badge (active / dev / soon)
    home/
      Hero.tsx
      PainPoints.tsx
      Solution.tsx
      BricksPreview.tsx
      PricingSummary.tsx
      AboutTeaser.tsx
      FinalCTA.tsx
    modules/
      BrickCard.tsx        # Single brick card with badge + description
    pricing/
      PricingTable.tsx     # 3-column table
      PricingFAQ.tsx       # Objection FAQ
    about/
      TeamCard.tsx         # Placeholder team member card
    contact/
      ContactForm.tsx      # Controlled form with validation
  lib/
    bricks.ts              # Typed brick data
    pricing.ts             # Typed pricing data
  messages/
    fr.json                # French copy
    en.json                # English copy
  middleware.ts            # next-intl routing middleware
```

---

## Task 1: Project bootstrap

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `.gitignore`

- [ ] **Step 1: Initialise Next.js project**

```bash
cd /Users/corentindesjars/Documents/code/resto
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Accept all defaults when prompted.

- [ ] **Step 2: Install next-intl**

```bash
npm install next-intl
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 + Tailwind + next-intl"
```

---

## Task 2: i18n setup

**Files:**
- Create: `src/middleware.ts`
- Create: `src/messages/fr.json`
- Create: `src/messages/en.json`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create routing config**

Create `src/i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});
```

- [ ] **Step 2: Create request config**

Create `src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'fr' | 'en')) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware**

Create `src/middleware.ts`:

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 4: Update next.config.ts**

Replace the contents of `next.config.ts` with:

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Create French messages**

Create `src/messages/fr.json`:

```json
{
  "nav": {
    "modules": "Modules",
    "pricing": "Tarifs",
    "about": "À propos",
    "contact": "Contact"
  },
  "hero": {
    "tagline": "Des outils qui font le travail que votre PoS ne fait pas.",
    "sub": "Des briques logicielles modulaires pour restaurants indépendants — vous activez ce dont vous avez besoin, quand vous en avez besoin.",
    "cta_primary": "Découvrir les modules",
    "cta_secondary": "Prendre rendez-vous"
  },
  "pain": {
    "title": "Les vrais problèmes du terrain",
    "item1_title": "Des heures perdues en admin",
    "item1_desc": "Saisie manuelle, Excel qui crashe, paie à corriger chaque mois. Vos soirées méritent mieux.",
    "item2_title": "Des outils qui ne se parlent pas",
    "item2_desc": "PoS, planning, paie, résa… chacun dans son silo. L'information ne circule pas.",
    "item3_title": "Impossible de piloter à distance",
    "item3_desc": "Ouvrir un deuxième établissement sans visibilité sur le premier, c'est voler à l'aveugle."
  },
  "solution": {
    "title": "La solution modulaire",
    "item1_title": "Vous payez ce que vous activez",
    "item1_desc": "Pas de pack tout-inclus dont vous n'utilisez que 20%. Chaque brique s'active et se désactive à la demande.",
    "item2_title": "Branché sur votre PoS existant",
    "item2_desc": "On ne remplace pas Tiller, Lightspeed ou Zelty. On comble les trous qu'ils laissent.",
    "item3_title": "Sur-mesure si besoin",
    "item3_desc": "Un besoin hors catalogue ? On le développe. Et ça devient une brique pour les autres."
  },
  "bricks_preview": {
    "title": "Nos modules",
    "cta": "Voir tous les modules"
  },
  "pricing_summary": {
    "title": "Un modèle simple",
    "setup_label": "Setup",
    "setup_desc": "Installation + formation, one-shot",
    "monthly_label": "Mensuel",
    "monthly_desc": "Par brique activée, sans engagement",
    "custom_label": "Sur-mesure",
    "custom_desc": "Besoin hors catalogue, sur devis",
    "cta": "Voir les tarifs"
  },
  "about_teaser": {
    "title": "Un studio parisien",
    "desc": "Jukely est un studio tech parisien qui construit des outils opérationnels pour la restauration indépendante. Nous ne faisons pas du SaaS généraliste — nous réglons des problèmes précis.",
    "cta": "En savoir plus"
  },
  "final_cta": {
    "title": "Prêt à tester ?",
    "desc": "Démarrez un pilote de 3 mois sur une seule brique. Sans engagement, avec un accompagnement complet.",
    "cta": "Démarrer un pilote"
  },
  "modules_page": {
    "title": "Nos modules",
    "subtitle": "Des briques opérationnelles qui s'activent à la demande.",
    "active": "Actif",
    "in_dev": "En développement",
    "soon": "Bientôt",
    "cta": "Nous contacter"
  },
  "pricing_page": {
    "title": "Tarifs",
    "subtitle": "Un modèle pensé pour les restaurateurs : vous payez ce que vous utilisez.",
    "setup_title": "Setup",
    "setup_price": "500 € – 2 500 €",
    "setup_type": "One-shot",
    "setup_includes": "Audit + installation + formation équipe",
    "monthly_title": "Abonnement",
    "monthly_price": "40 € – 150 € / mois",
    "monthly_type": "Par brique, sans engagement",
    "monthly_includes": "Support inclus, activation/désactivation libre",
    "custom_title": "Sur-mesure",
    "custom_price": "Sur devis",
    "custom_type": "Forfait",
    "custom_includes": "Développement spécifique, livré et documenté",
    "faq_title": "Questions fréquentes",
    "faq1_q": "C'est trop cher.",
    "faq1_a": "Comparé à quoi ? Combien perdez-vous en heures admin chaque mois ? Nos clients récupèrent généralement leur investissement en moins de 90 jours.",
    "faq2_q": "Je n'ai pas le temps de changer mes outils.",
    "faq2_a": "On ne change rien. On se branche sur ce que vous avez déjà. L'installation prend 2 heures.",
    "faq3_q": "Vous êtes trop petits, si vous fermez je suis coincé.",
    "faq3_a": "Tous nos contrats prévoient une clause de récupération de données en format standard. Et c'est vous qui avez le pouvoir : abonnement mensuel, résiliable à tout moment.",
    "faq4_q": "J'attends de voir.",
    "faq4_a": "Parfait. On propose un pilote 3 mois sur une seule brique, à tarif réduit. Vous jugez sur pièce avant de vous engager davantage."
  },
  "about_page": {
    "title": "À propos",
    "mission_title": "Notre mission",
    "mission_desc": "Nous construisons des outils opérationnels précis pour les restaurants indépendants et les petits groupes. Pas un SaaS généraliste — un studio qui règle de vrais problèmes terrain, brique par brique.",
    "team_title": "L'équipe",
    "member1_name": "Membre 1",
    "member1_role": "Co-fondateur",
    "member2_name": "Membre 2",
    "member2_role": "Co-fondateur",
    "diff_title": "Ce qui nous différencie",
    "diff1": "Modulaire : vous payez ce que vous activez",
    "diff2": "Branché sur votre PoS existant",
    "diff3": "Sur-mesure possible",
    "diff4": "Français, joignables, réactifs"
  },
  "contact_page": {
    "title": "Contact",
    "subtitle": "Une question, un projet, une démo ? Écrivez-nous.",
    "name_label": "Nom",
    "email_label": "Email",
    "restaurant_label": "Nom du restaurant",
    "message_label": "Message",
    "submit": "Envoyer",
    "success": "Message envoyé ! On vous répond sous 24h.",
    "error": "Une erreur est survenue. Réessayez ou écrivez-nous directement."
  },
  "footer": {
    "legal": "Mentions légales",
    "tagline": "Solutions logicielles pour restaurants indépendants."
  }
}
```

- [ ] **Step 6: Create English messages**

Create `src/messages/en.json`:

```json
{
  "nav": {
    "modules": "Modules",
    "pricing": "Pricing",
    "about": "About",
    "contact": "Contact"
  },
  "hero": {
    "tagline": "The tools your POS doesn't provide.",
    "sub": "Modular software bricks for independent restaurants — activate what you need, when you need it.",
    "cta_primary": "Explore modules",
    "cta_secondary": "Book a call"
  },
  "pain": {
    "title": "Real operational pain points",
    "item1_title": "Hours lost on admin",
    "item1_desc": "Manual data entry, crashing spreadsheets, payroll corrections every month. Your evenings deserve better.",
    "item2_title": "Tools that don't talk to each other",
    "item2_desc": "POS, scheduling, payroll, reservations — each in its own silo. Information doesn't flow.",
    "item3_title": "No visibility when you're not there",
    "item3_desc": "Opening a second location without visibility on the first is flying blind."
  },
  "solution": {
    "title": "The modular solution",
    "item1_title": "Pay only for what you activate",
    "item1_desc": "No all-inclusive pack you only use 20% of. Each brick activates and deactivates on demand.",
    "item2_title": "Plugs into your existing POS",
    "item2_desc": "We don't replace Tiller, Lightspeed, or Zelty. We fill the gaps they leave.",
    "item3_title": "Custom when needed",
    "item3_desc": "A need outside the catalogue? We build it. And it becomes a brick for others."
  },
  "bricks_preview": {
    "title": "Our modules",
    "cta": "View all modules"
  },
  "pricing_summary": {
    "title": "A simple model",
    "setup_label": "Setup",
    "setup_desc": "Installation + training, one-time",
    "monthly_label": "Monthly",
    "monthly_desc": "Per active brick, no commitment",
    "custom_label": "Custom",
    "custom_desc": "Out-of-catalogue needs, quoted"
  },
  "about_teaser": {
    "title": "A Parisian studio",
    "desc": "Jukely is a Parisian tech studio building operational tools for independent restaurants. We don't do generic SaaS — we solve precise problems.",
    "cta": "Learn more"
  },
  "final_cta": {
    "title": "Ready to try it?",
    "desc": "Start a 3-month pilot on a single brick. No commitment, full support included.",
    "cta": "Start a pilot"
  },
  "modules_page": {
    "title": "Our modules",
    "subtitle": "Operational bricks that activate on demand.",
    "active": "Live",
    "in_dev": "In development",
    "soon": "Coming soon",
    "cta": "Contact us"
  },
  "pricing_page": {
    "title": "Pricing",
    "subtitle": "A model built for restaurateurs: pay for what you use.",
    "setup_title": "Setup",
    "setup_price": "€500 – €2,500",
    "setup_type": "One-time",
    "setup_includes": "Audit + installation + team training",
    "monthly_title": "Subscription",
    "monthly_price": "€40 – €150 / month",
    "monthly_type": "Per brick, no commitment",
    "monthly_includes": "Support included, activate/deactivate freely",
    "custom_title": "Custom",
    "custom_price": "Quoted",
    "custom_type": "Fixed price",
    "custom_includes": "Specific development, delivered and documented",
    "faq_title": "FAQ",
    "faq1_q": "It's too expensive.",
    "faq1_a": "Compared to what? How much do you lose in admin hours each month? Our clients typically recover their investment within 90 days.",
    "faq2_q": "I don't have time to change my tools.",
    "faq2_a": "We don't change anything. We plug into what you already have. Installation takes 2 hours.",
    "faq3_q": "You're too small — what if you shut down?",
    "faq3_a": "All contracts include a data export clause in standard format. And you hold the power: monthly subscription, cancellable anytime.",
    "faq4_q": "I want to wait and see.",
    "faq4_a": "Perfect. We offer a 3-month pilot on a single brick at a reduced rate. Judge for yourself before committing further."
  },
  "about_page": {
    "title": "About",
    "mission_title": "Our mission",
    "mission_desc": "We build precise operational tools for independent restaurants and small groups. Not generic SaaS — a studio that solves real field problems, brick by brick.",
    "team_title": "The team",
    "member1_name": "Member 1",
    "member1_role": "Co-founder",
    "member2_name": "Member 2",
    "member2_role": "Co-founder",
    "diff_title": "What sets us apart",
    "diff1": "Modular: pay only for what you activate",
    "diff2": "Plugs into your existing POS",
    "diff3": "Custom development available",
    "diff4": "French, reachable, responsive"
  },
  "contact_page": {
    "title": "Contact",
    "subtitle": "A question, a project, a demo? Write to us.",
    "name_label": "Name",
    "email_label": "Email",
    "restaurant_label": "Restaurant name",
    "message_label": "Message",
    "submit": "Send",
    "success": "Message sent! We'll get back to you within 24h.",
    "error": "Something went wrong. Try again or email us directly."
  },
  "footer": {
    "legal": "Legal notice",
    "tagline": "Software solutions for independent restaurants."
  }
}
```

- [ ] **Step 7: Restructure app directory for i18n**

Move `src/app` contents into `src/app/[locale]/`:

```bash
mkdir -p src/app/\[locale\]
mv src/app/page.tsx src/app/\[locale\]/page.tsx
mv src/app/layout.tsx src/app/\[locale\]/layout.tsx
```

- [ ] **Step 8: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add next-intl i18n setup (FR default, EN at /en)"
```

---

## Task 3: Global layout (Navbar + Footer)

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Create Navbar**

Create `src/components/layout/Navbar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  // Build the equivalent path in the other locale
  const switchLocalePath = () => {
    if (locale === 'fr') {
      return `/en${pathname}`;
    }
    // Remove /en prefix
    return pathname.replace(/^\/en/, '') || '/';
  };

  const navLinks = [
    { href: '/modules', label: t('modules') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  const localizedHref = (href: string) =>
    locale === 'en' ? `/en${href}` : href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={locale === 'en' ? '/en' : '/'}
          className="text-xl font-bold tracking-tight text-white"
        >
          Jukely
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={localizedHref(link.href)}
              className="text-sm text-white/70 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={switchLocalePath()}
            className="rounded border border-white/20 px-3 py-1 text-xs text-white/60 transition hover:border-white/40 hover:text-white"
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Footer**

Create `src/components/layout/Footer.tsx`:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-white/10 bg-black py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm font-bold text-white">Jukely</p>
          <p className="text-xs text-white/40">{t('tagline')}</p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="#" className="hover:text-white/70 transition">
              {t('legal')}
            </Link>
            <span>© {new Date().getFullYear()} Jukely</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update root layout**

Replace contents of `src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jukely — Solutions logicielles pour restaurants',
  description:
    'Des briques logicielles modulaires pour restaurants indépendants et petits groupes.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Navbar and Footer layout components"
```

---

## Task 4: UI primitives (Button + Badge)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-black font-semibold hover:bg-amber-400 active:bg-amber-600',
  secondary:
    'border border-white/30 text-white hover:border-white/60 hover:bg-white/5',
  ghost: 'text-white/60 hover:text-white',
};

export default function Button({
  href,
  onClick,
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded px-5 py-2.5 text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create Badge component**

Create `src/components/ui/Badge.tsx`:

```tsx
type BadgeStatus = 'active' | 'dev' | 'soon';

const statusClasses: Record<BadgeStatus, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  dev: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  soon: 'bg-white/10 text-white/50 border-white/20',
};

interface BadgeProps {
  status: BadgeStatus;
  label: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Button and Badge UI primitives"
```

---

## Task 5: Data layer

**Files:**
- Create: `src/lib/bricks.ts`
- Create: `src/lib/pricing.ts`

- [ ] **Step 1: Create bricks data**

Create `src/lib/bricks.ts`:

```typescript
export type BrickStatus = 'active' | 'dev' | 'soon';

export interface Brick {
  id: string;
  nameKey: string;
  descKey: string;
  status: BrickStatus;
}

export const BRICKS: Brick[] = [
  {
    id: 'menu-board-tv',
    nameKey: 'menuBoardTV',
    descKey: 'menuBoardTVDesc',
    status: 'active',
  },
  {
    id: 'pointage-nfc',
    nameKey: 'pointageNFC',
    descKey: 'pointageNFCDesc',
    status: 'dev',
  },
  {
    id: 'kds',
    nameKey: 'kds',
    descKey: 'kdsDesc',
    status: 'soon',
  },
  {
    id: 'borne-commande',
    nameKey: 'borneCommande',
    descKey: 'borneCommandeDesc',
    status: 'soon',
  },
  {
    id: 'food-cost',
    nameKey: 'foodCost',
    descKey: 'foodCostDesc',
    status: 'soon',
  },
  {
    id: 'dashboard-manager',
    nameKey: 'dashboardManager',
    descKey: 'dashboardManagerDesc',
    status: 'soon',
  },
];

export const PREVIEW_BRICKS = BRICKS.slice(0, 3);
```

- [ ] **Step 2: Add brick translations to fr.json**

In `src/messages/fr.json`, add a `bricks` key at the top level:

```json
"bricks": {
  "menuBoardTV": "Menu Board TV",
  "menuBoardTVDesc": "Affichage dynamique de la carte sur télévision, multi-écran, mise à jour temps réel depuis le back-office.",
  "pointageNFC": "Pointage équipes (NFC / QR)",
  "pointageNFCDesc": "Badgeuse moderne sur tablette, export paie, conformité code du travail et convention HCR.",
  "kds": "Affichage Cuisine (KDS)",
  "kdsDesc": "Écrans cuisine avec commandes en temps réel, priorisation, timing.",
  "borneCommande": "Borne de commande self-service",
  "borneCommandeDesc": "Commande et paiement par le client depuis une borne tactile.",
  "foodCost": "Pilotage food cost",
  "foodCostDesc": "Suivi des marges par plat, alerte quand un prix fournisseur explose la rentabilité.",
  "dashboardManager": "Dashboard manager",
  "dashboardManagerDesc": "Écran TV en back-office avec CA temps réel, comparaison vs prévu, couverts en cours."
}
```

- [ ] **Step 3: Add brick translations to en.json**

In `src/messages/en.json`, add a `bricks` key at the top level:

```json
"bricks": {
  "menuBoardTV": "Menu Board TV",
  "menuBoardTVDesc": "Dynamic menu display on TV screens, multi-screen, real-time update from back-office.",
  "pointageNFC": "Team Time Tracking (NFC / QR)",
  "pointageNFCDesc": "Modern time-tracking on tablet, payroll export, French labour law compliance.",
  "kds": "Kitchen Display System (KDS)",
  "kdsDesc": "Kitchen screens with real-time orders, prioritisation, and timing.",
  "borneCommande": "Self-order kiosk",
  "borneCommandeDesc": "Customer-facing order and payment kiosk.",
  "foodCost": "Food cost management",
  "foodCostDesc": "Per-dish margin tracking, alert when a supplier price kills profitability.",
  "dashboardManager": "Manager dashboard",
  "dashboardManagerDesc": "Back-office TV screen with real-time revenue, vs. target, live covers."
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add bricks data layer and translations"
```

---

## Task 6: Homepage — Hero + Pain Points + Solution

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/PainPoints.tsx`
- Create: `src/components/home/Solution.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Create Hero**

Create `src/components/home/Hero.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          {t('tagline')}
        </h1>
        <p className="mb-10 text-lg text-white/60 md:text-xl">{t('sub')}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href={localizedHref('/modules')} variant="primary">
            {t('cta_primary')}
          </Button>
          <Button href={localizedHref('/contact')} variant="secondary">
            {t('cta_secondary')}
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create PainPoints**

Create `src/components/home/PainPoints.tsx`:

```tsx
import { useTranslations } from 'next-intl';

const icons = ['⏱', '🔌', '📍'];

export default function PainPoints() {
  const t = useTranslations('pain');

  const items = [
    { icon: icons[0], title: t('item1_title'), desc: t('item1_desc') },
    { icon: icons[1], title: t('item2_title'), desc: t('item2_desc') },
    { icon: icons[2], title: t('item3_title'), desc: t('item3_desc') },
  ];

  return (
    <section className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-3xl font-bold text-white">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/5 p-8"
            >
              <div className="mb-4 text-3xl">{item.icon}</div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Solution**

Create `src/components/home/Solution.tsx`:

```tsx
import { useTranslations } from 'next-intl';

export default function Solution() {
  const t = useTranslations('solution');

  const items = [
    { title: t('item1_title'), desc: t('item1_desc') },
    { title: t('item2_title'), desc: t('item2_desc') },
    { title: t('item3_title'), desc: t('item3_desc') },
  ];

  return (
    <section className="border-t border-white/10 bg-amber-500/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-3xl font-bold text-white">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update homepage**

Replace contents of `src/app/[locale]/page.tsx`:

```tsx
import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import Solution from '@/components/home/Solution';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <Solution />
    </>
  );
}
```

- [ ] **Step 5: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000` — verify Hero, PainPoints, Solution render without errors. Check `http://localhost:3000/en` for English.

- [ ] **Step 6: Stop dev server and commit**

```bash
git add -A
git commit -m "feat: homepage Hero, PainPoints, Solution sections"
```

---

## Task 7: Homepage — BricksPreview + PricingSummary + AboutTeaser + FinalCTA

**Files:**
- Create: `src/components/home/BricksPreview.tsx`
- Create: `src/components/home/PricingSummary.tsx`
- Create: `src/components/home/AboutTeaser.tsx`
- Create: `src/components/home/FinalCTA.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Create BricksPreview**

Create `src/components/home/BricksPreview.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import { PREVIEW_BRICKS } from '@/lib/bricks';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function BricksPreview() {
  const t = useTranslations('bricks_preview');
  const tb = useTranslations('bricks');
  const tm = useTranslations('modules_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const statusLabel = (status: 'active' | 'dev' | 'soon') => {
    if (status === 'active') return tm('active');
    if (status === 'dev') return tm('in_dev');
    return tm('soon');
  };

  return (
    <section className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-3xl font-bold text-white">
          {t('title')}
        </h2>
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {PREVIEW_BRICKS.map((brick) => (
            <div
              key={brick.id}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-3">
                <Badge status={brick.status} label={statusLabel(brick.status)} />
              </div>
              <h3 className="mb-2 font-semibold text-white">
                {tb(brick.nameKey as Parameters<typeof tb>[0])}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {tb(brick.descKey as Parameters<typeof tb>[0])}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={localizedHref('/modules')} variant="secondary">
            {t('cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create PricingSummary**

Create `src/components/home/PricingSummary.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function PricingSummary() {
  const t = useTranslations('pricing_summary');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const items = [
    { label: t('setup_label'), desc: t('setup_desc') },
    { label: t('monthly_label'), desc: t('monthly_desc') },
    { label: t('custom_label'), desc: t('custom_desc') },
  ];

  return (
    <section className="border-t border-white/10 bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-3xl font-bold text-white">
          {t('title')}
        </h2>
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 p-6 text-center"
            >
              <p className="mb-2 text-lg font-semibold text-amber-400">
                {item.label}
              </p>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={localizedHref('/pricing')} variant="secondary">
            {t('cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create AboutTeaser**

Create `src/components/home/AboutTeaser.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function AboutTeaser() {
  const t = useTranslations('about_teaser');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-6 text-3xl font-bold text-white">{t('title')}</h2>
        <p className="mb-8 text-lg leading-relaxed text-white/60">{t('desc')}</p>
        <Button href={localizedHref('/about')} variant="ghost">
          {t('cta')} →
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create FinalCTA**

Create `src/components/home/FinalCTA.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function FinalCTA() {
  const t = useTranslations('final_cta');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="border-t border-white/10 bg-amber-500/10 px-6 py-32 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-4xl font-bold text-white">{t('title')}</h2>
        <p className="mb-10 text-lg text-white/60">{t('desc')}</p>
        <Button href={localizedHref('/contact')} variant="primary" className="px-8 py-3 text-base">
          {t('cta')}
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update homepage**

Replace contents of `src/app/[locale]/page.tsx`:

```tsx
import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import Solution from '@/components/home/Solution';
import BricksPreview from '@/components/home/BricksPreview';
import PricingSummary from '@/components/home/PricingSummary';
import AboutTeaser from '@/components/home/AboutTeaser';
import FinalCTA from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <Solution />
      <BricksPreview />
      <PricingSummary />
      <AboutTeaser />
      <FinalCTA />
    </>
  );
}
```

- [ ] **Step 6: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:3000` — scroll through all 7 sections. Check no TypeScript errors in terminal.

- [ ] **Step 7: Stop server and commit**

```bash
git add -A
git commit -m "feat: complete homepage with all 7 sections"
```

---

## Task 8: Modules page

**Files:**
- Create: `src/components/modules/BrickCard.tsx`
- Create: `src/app/[locale]/modules/page.tsx`

- [ ] **Step 1: Create BrickCard**

Create `src/components/modules/BrickCard.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import type { Brick } from '@/lib/bricks';

interface BrickCardProps {
  brick: Brick;
}

export default function BrickCard({ brick }: BrickCardProps) {
  const tb = useTranslations('bricks');
  const tm = useTranslations('modules_page');

  const statusLabel = (status: 'active' | 'dev' | 'soon') => {
    if (status === 'active') return tm('active');
    if (status === 'dev') return tm('in_dev');
    return tm('soon');
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-white">
          {tb(brick.nameKey as Parameters<typeof tb>[0])}
        </h3>
        <Badge status={brick.status} label={statusLabel(brick.status)} />
      </div>
      <p className="text-sm leading-relaxed text-white/60">
        {tb(brick.descKey as Parameters<typeof tb>[0])}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create modules page**

Create `src/app/[locale]/modules/page.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import { BRICKS } from '@/lib/bricks';
import BrickCard from '@/components/modules/BrickCard';
import Button from '@/components/ui/Button';

export default function ModulesPage() {
  const t = useTranslations('modules_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const active = BRICKS.filter((b) => b.status === 'active');
  const inDev = BRICKS.filter((b) => b.status === 'dev');
  const soon = BRICKS.filter((b) => b.status === 'soon');

  const groups = [
    { label: t('active'), bricks: active },
    { label: t('in_dev'), bricks: inDev },
    { label: t('soon'), bricks: soon },
  ].filter((g) => g.bricks.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('title')}</h1>
        <p className="text-lg text-white/60">{t('subtitle')}</p>
      </div>

      <div className="space-y-16">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-amber-400">
              {group.label}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {group.bricks.map((brick) => (
                <BrickCard key={brick.id} brick={brick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <Button href={localizedHref('/contact')} variant="primary">
          {t('cta')}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:3000/modules` — verify bricks grouped by status. Check `http://localhost:3000/en/modules` for English.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add modules page with brick catalogue"
```

---

## Task 9: Pricing page

**Files:**
- Create: `src/app/[locale]/pricing/page.tsx`

- [ ] **Step 1: Create pricing page**

Create `src/app/[locale]/pricing/page.tsx`:

```tsx
import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function PricingPage() {
  const t = useTranslations('pricing_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const plans = [
    {
      title: t('setup_title'),
      price: t('setup_price'),
      type: t('setup_type'),
      includes: t('setup_includes'),
    },
    {
      title: t('monthly_title'),
      price: t('monthly_price'),
      type: t('monthly_type'),
      includes: t('monthly_includes'),
      highlight: true,
    },
    {
      title: t('custom_title'),
      price: t('custom_price'),
      type: t('custom_type'),
      includes: t('custom_includes'),
    },
  ];

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('title')}</h1>
        <p className="text-lg text-white/60">{t('subtitle')}</p>
      </div>

      {/* Pricing cards */}
      <div className="mb-24 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`flex flex-col gap-4 rounded-xl border p-8 ${
              plan.highlight
                ? 'border-amber-500/40 bg-amber-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              {plan.title}
            </p>
            <p className="text-2xl font-bold text-white">{plan.price}</p>
            <p className="text-xs text-white/40">{plan.type}</p>
            <hr className="border-white/10" />
            <p className="text-sm leading-relaxed text-white/60">{plan.includes}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-10 text-2xl font-bold text-white">{t('faq_title')}</h2>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <p className="mb-2 font-semibold text-white">{faq.q}</p>
              <p className="text-sm leading-relaxed text-white/60">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <Button href={localizedHref('/contact')} variant="primary">
          {locale === 'en' ? 'Start a pilot' : 'Démarrer un pilote'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Open `http://localhost:3000/pricing` and `http://localhost:3000/en/pricing`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add pricing page with plans and FAQ"
```

---

## Task 10: About page

**Files:**
- Create: `src/components/about/TeamCard.tsx`
- Create: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Create TeamCard**

Create `src/components/about/TeamCard.tsx`:

```tsx
interface TeamCardProps {
  name: string;
  role: string;
}

export default function TeamCard({ name, role }: TeamCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
      {/* Placeholder avatar */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white/30">
        {name[0]}
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-sm text-amber-400">{role}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create about page**

Create `src/app/[locale]/about/page.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import TeamCard from '@/components/about/TeamCard';

export default function AboutPage() {
  const t = useTranslations('about_page');

  const differentiators = [
    t('diff1'),
    t('diff2'),
    t('diff3'),
    t('diff4'),
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('title')}</h1>
      </div>

      {/* Mission */}
      <section className="mb-20">
        <h2 className="mb-6 text-2xl font-bold text-white">{t('mission_title')}</h2>
        <p className="text-lg leading-relaxed text-white/60">{t('mission_desc')}</p>
      </section>

      {/* Team */}
      <section className="mb-20">
        <h2 className="mb-10 text-2xl font-bold text-white">{t('team_title')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TeamCard name={t('member1_name')} role={t('member1_role')} />
          <TeamCard name={t('member2_name')} role={t('member2_role')} />
        </div>
      </section>

      {/* Differentiators */}
      <section>
        <h2 className="mb-8 text-2xl font-bold text-white">{t('diff_title')}</h2>
        <ul className="space-y-4">
          {differentiators.map((diff) => (
            <li key={diff} className="flex items-start gap-3">
              <span className="mt-1 text-amber-400">✓</span>
              <span className="text-white/70">{diff}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:3000/about` and `http://localhost:3000/en/about`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add about page with team placeholders and differentiators"
```

---

## Task 11: Contact page

**Files:**
- Create: `src/components/contact/ContactForm.tsx`
- Create: `src/app/[locale]/contact/page.tsx`

- [ ] **Step 1: Create ContactForm**

Create `src/components/contact/ContactForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const t = useTranslations('contact_page');
  const [state, setState] = useState<FormState>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    restaurant: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');
    // Placeholder: replace with actual form submission (e.g. Resend, Formspree)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setState('success');
  };

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-400">
        {t('success')}
      </div>
    );
  }

  const fields = [
    { name: 'name', label: t('name_label'), type: 'text' as const },
    { name: 'email', label: t('email_label'), type: 'email' as const },
    { name: 'restaurant', label: t('restaurant_label'), type: 'text' as const },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="mb-2 block text-sm text-white/60" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            required
            value={form[field.name as keyof typeof form]}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>
      ))}

      <div>
        <label className="mb-2 block text-sm text-white/60" htmlFor="message">
          {t('message_label')}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
        />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-400">{t('error')}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={state === 'submitting'}
        className="w-full py-3"
      >
        {state === 'submitting' ? '...' : t('submit')}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create contact page**

Create `src/app/[locale]/contact/page.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {
  const t = useTranslations('contact_page');

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('title')}</h1>
        <p className="text-lg text-white/60">{t('subtitle')}</p>
      </div>
      <ContactForm />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:3000/contact` — fill and submit the form, verify success state appears. Check `http://localhost:3000/en/contact`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add contact page with form"
```

---

## Task 12: Production build verification + Vercel config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with all 10 routes listed (/, /modules, /pricing, /about, /contact for both locales).

- [ ] **Step 2: Fix any TypeScript or lint errors**

If `npm run build` reports errors, fix them before continuing. Run `npx tsc --noEmit` for type-only check.

- [ ] **Step 3: Create Vercel config**

Create `vercel.json`:

```json
{
  "framework": "nextjs"
}
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production build verified, add Vercel config"
```

---

## Self-Review Checklist (for implementer)

Before declaring done:
- [ ] All 5 pages render in FR (`/`, `/modules`, `/pricing`, `/about`, `/contact`)
- [ ] All 5 pages render in EN (`/en`, `/en/modules`, `/en/pricing`, `/en/about`, `/en/contact`)
- [ ] Language toggle in Navbar switches locale without 404
- [ ] `npm run build` passes with no errors
- [ ] No hardcoded strings outside `messages/*.json`

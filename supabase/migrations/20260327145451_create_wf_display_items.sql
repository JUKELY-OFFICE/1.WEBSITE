-- Table unifiée pour tous les items du menu TV
create table if not exists wf_display_items (
  id          uuid         not null default gen_random_uuid() primary key,
  venue_id    text         not null,
  page        text         not null,  -- breakfast | lunch | happy_hour
  section     text         not null,  -- formules | a_la_carte | oeufs | plats | cocktails | bieres | tapas | planches
  name        text         not null,
  description text,
  prix        numeric(10,2),
  active      boolean      not null default true,
  sort_order  integer      not null default 99,
  created_at  timestamptz  not null default now()
);

create index if not exists wf_display_items_venue_page_section_active_sort_idx on wf_display_items (venue_id, page, section, active, sort_order);

alter table wf_display_items enable row level security;

-- Supprimer les politiques existantes si elles existent
drop policy if exists "anon_select" on wf_display_items;
drop policy if exists "auth_select" on wf_display_items;
drop policy if exists "auth_insert" on wf_display_items;
drop policy if exists "auth_update" on wf_display_items;
drop policy if exists "auth_delete" on wf_display_items;

-- Politiques RLS
create policy "anon_select"  on wf_display_items for select to anon          using (true);
create policy "auth_select"  on wf_display_items for select to authenticated  using (true);
create policy "auth_insert"  on wf_display_items for insert to authenticated  with check (true);
create policy "auth_update"  on wf_display_items for update to authenticated  using (true) with check (true);
create policy "auth_delete"  on wf_display_items for delete to authenticated  using (true);

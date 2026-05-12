-- Table pour les utilisateurs WebFront (gestionnaires de restaurants)
create table if not exists wf_users (
  id          uuid         not null default gen_random_uuid() primary key,
  user_id     uuid         not null,  -- Référence vers auth.users.id
  email       text         not null,
  venue_id    text,
  venue_name  text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- Supprimer la contrainte si elle existe déjà
alter table wf_users drop constraint if exists wf_users_user_id_unique;

-- Contrainte d'unicité sur user_id
alter table wf_users add constraint wf_users_user_id_unique unique (user_id);

-- Index pour les recherches (ne pas recréer s'ils existent)
create index if not exists wf_users_user_id_idx on wf_users (user_id);

-- RLS (Row Level Security)
alter table wf_users enable row level security;

-- Supprimer les politiques existantes si elles existent
drop policy if exists "users_select_own" on wf_users;
drop policy if exists "users_insert_own" on wf_users;
drop policy if exists "users_update_own" on wf_users;

-- Politiques RLS basiques
create policy "users_select_own" on wf_users for select to authenticated using (auth.uid() = user_id);
create policy "users_insert_own" on wf_users for insert to authenticated with check (auth.uid() = user_id);
create policy "users_update_own" on wf_users for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
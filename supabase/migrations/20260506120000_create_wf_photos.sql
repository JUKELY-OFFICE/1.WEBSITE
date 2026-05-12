-- Table pour les photos du carousel TV
create table if not exists wf_photos (
  id          uuid         not null default gen_random_uuid() primary key,
  venue_id    text         not null,
  page        text         not null,  -- 'lunch_weekend', extensible
  url         text         not null,
  sort_order  integer      not null default 99,
  active      boolean      not null default true,
  created_at  timestamptz  not null default now()
);

create index if not exists wf_photos_venue_page_idx on wf_photos (venue_id, page, active, sort_order);

alter table wf_photos enable row level security;

create policy "anon_select"  on wf_photos for select to anon          using (true);
create policy "auth_select"  on wf_photos for select to authenticated  using (true);
create policy "auth_insert"  on wf_photos for insert to authenticated  with check (true);
create policy "auth_update"  on wf_photos for update to authenticated  using (true) with check (true);
create policy "auth_delete"  on wf_photos for delete to authenticated  using (true);

-- Bucket Storage pour les photos TV
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'photos');

create policy "auth_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos');

create policy "auth_delete_storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos');

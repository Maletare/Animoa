-- ANIMOA V2 — À exécuter une seule fois dans Supabase > SQL Editor
-- Ce script crée le stockage privé des données et des fichiers de chaque utilisateur.

create table if not exists public.animoa_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"version":4,"activePetId":null,"pets":[],"health":[],"expenses":[],"weights":[],"memories":[]}'::jsonb,
  settings jsonb not null default '{"currency":"EUR","weightUnit":"kg","language":"fr","theme":"system","palette":"animoa"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.animoa_user_data enable row level security;
revoke all on public.animoa_user_data from anon;
grant select, insert, update, delete on public.animoa_user_data to authenticated;
grant select on public.animoa_user_data to service_role;

drop policy if exists "Animoa lire ses donnees" on public.animoa_user_data;
drop policy if exists "Animoa creer ses donnees" on public.animoa_user_data;
drop policy if exists "Animoa modifier ses donnees" on public.animoa_user_data;
drop policy if exists "Animoa supprimer ses donnees" on public.animoa_user_data;

create policy "Animoa lire ses donnees"
on public.animoa_user_data for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Animoa creer ses donnees"
on public.animoa_user_data for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Animoa modifier ses donnees"
on public.animoa_user_data for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Animoa supprimer ses donnees"
on public.animoa_user_data for delete to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'animoa-media',
  'animoa-media',
  false,
  15728640,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Animoa voir ses fichiers" on storage.objects;
drop policy if exists "Animoa ajouter ses fichiers" on storage.objects;
drop policy if exists "Animoa modifier ses fichiers" on storage.objects;
drop policy if exists "Animoa supprimer ses fichiers" on storage.objects;

create policy "Animoa voir ses fichiers"
on storage.objects for select to authenticated
using (
  bucket_id = 'animoa-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Animoa ajouter ses fichiers"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'animoa-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Animoa modifier ses fichiers"
on storage.objects for update to authenticated
using (
  bucket_id = 'animoa-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'animoa-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Animoa supprimer ses fichiers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'animoa-media'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

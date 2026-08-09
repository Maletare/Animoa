-- ANIMOA 3.13.1 — Publications Facebook privées dans l’Administration
-- À exécuter une seule fois dans l’éditeur SQL Supabase.
-- Ce script n’altère aucune table métier existante.

create extension if not exists pgcrypto;

create table if not exists public.animoa_facebook_publications (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'error')),
  angle_key text not null,
  content_kind text,
  format text not null default 'portrait' check (format in ('square', 'portrait')),
  visual_style text not null default 'photo-card',
  hook text not null,
  image_text text not null,
  description text not null,
  hashtags text not null default '',
  media_id text,
  media_thumbnail_url text,
  media_source_url text,
  media_label text,
  focus_x numeric(5,4) not null default 0.5000 check (focus_x between 0.05 and 0.95),
  focus_y numeric(5,4) not null default 0.4200 check (focus_y between 0.05 and 0.95),
  media_zoom numeric(4,2) not null default 1.00 check (media_zoom between 1.00 and 1.80),
  image_path text,
  facebook_post_id text,
  facebook_permalink_url text,
  error_message text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Compatibilité si une première version de ce script a déjà été testée.
alter table public.animoa_facebook_publications
  drop constraint if exists animoa_facebook_publications_media_id_fkey;
alter table public.animoa_facebook_publications
  alter column media_id type text using media_id::text;
alter table public.animoa_facebook_publications
  add column if not exists focus_x numeric(5,4) not null default 0.5000,
  add column if not exists focus_y numeric(5,4) not null default 0.4200,
  add column if not exists media_zoom numeric(4,2) not null default 1.00;

create index if not exists animoa_facebook_publications_status_idx
  on public.animoa_facebook_publications(status, updated_at desc);
create index if not exists animoa_facebook_publications_created_idx
  on public.animoa_facebook_publications(created_at desc);

alter table public.animoa_facebook_publications enable row level security;
revoke all on public.animoa_facebook_publications from public, anon, authenticated;
grant select, insert, update, delete on public.animoa_facebook_publications to authenticated;
grant all on public.animoa_facebook_publications to service_role;

drop policy if exists "Only Animoa admin can read Facebook publications" on public.animoa_facebook_publications;
drop policy if exists "Only Animoa admin can insert Facebook publications" on public.animoa_facebook_publications;
drop policy if exists "Only Animoa admin can update Facebook publications" on public.animoa_facebook_publications;
drop policy if exists "Only Animoa admin can delete Facebook publications" on public.animoa_facebook_publications;

create policy "Only Animoa admin can read Facebook publications"
on public.animoa_facebook_publications for select to authenticated
using ((select public.is_animoa_admin()));

create policy "Only Animoa admin can insert Facebook publications"
on public.animoa_facebook_publications for insert to authenticated
with check (
  (select public.is_animoa_admin())
  and created_by = (select auth.uid())
);

create policy "Only Animoa admin can update Facebook publications"
on public.animoa_facebook_publications for update to authenticated
using ((select public.is_animoa_admin()))
with check ((select public.is_animoa_admin()));

create policy "Only Animoa admin can delete Facebook publications"
on public.animoa_facebook_publications for delete to authenticated
using ((select public.is_animoa_admin()));

-- Stockage privé des affiches finales. Aucun fichier n’est public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animoa-facebook-publications', 'animoa-facebook-publications', false, 10485760, array['image/png']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Only Animoa admin can read Facebook artwork" on storage.objects;
drop policy if exists "Only Animoa admin can insert Facebook artwork" on storage.objects;
drop policy if exists "Only Animoa admin can update Facebook artwork" on storage.objects;
drop policy if exists "Only Animoa admin can delete Facebook artwork" on storage.objects;

create policy "Only Animoa admin can read Facebook artwork"
on storage.objects for select to authenticated
using (
  bucket_id = 'animoa-facebook-publications'
  and (select public.is_animoa_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Only Animoa admin can insert Facebook artwork"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'animoa-facebook-publications'
  and (select public.is_animoa_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Only Animoa admin can update Facebook artwork"
on storage.objects for update to authenticated
using (
  bucket_id = 'animoa-facebook-publications'
  and (select public.is_animoa_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'animoa-facebook-publications'
  and (select public.is_animoa_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Only Animoa admin can delete Facebook artwork"
on storage.objects for delete to authenticated
using (
  bucket_id = 'animoa-facebook-publications'
  and (select public.is_animoa_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

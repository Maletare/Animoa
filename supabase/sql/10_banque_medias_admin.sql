-- ANIMOA 3.12.0 — Banque de médias privée réservée à l'administratrice
-- À exécuter une seule fois dans l'éditeur SQL Supabase avant de déployer
-- la fonction Edge « animoa-media-library ».

create extension if not exists pgcrypto;

-- Connexion Google Drive : le jeton reste exclusivement côté serveur.
create table if not exists public.animoa_media_drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token text not null,
  google_account_email text,
  granted_scopes text[] not null default array[]::text[],
  root_folder_id text,
  root_folder_url text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.animoa_media_drive_connections enable row level security;
revoke all on public.animoa_media_drive_connections from public, anon, authenticated;
grant all on public.animoa_media_drive_connections to service_role;

-- Catalogue des vidéos choisies et envoyées dans le Drive Animoa.
create table if not exists public.animoa_media_library (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('pexels', 'pixabay')),
  source_id text not null,
  source_page_url text not null,
  creator_name text,
  thumbnail_url text,
  original_video_url text,
  species text,
  theme text,
  orientation text check (orientation is null or orientation in ('portrait', 'landscape', 'square')),
  duration_seconds integer,
  width integer,
  height integer,
  file_size_bytes bigint,
  file_name text not null,
  drive_file_id text,
  drive_web_url text,
  drive_folder_id text,
  status text not null default 'available' check (status in ('available', 'used', 'archived')),
  imported_by uuid not null references auth.users(id) on delete cascade,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists animoa_media_library_imported_idx
  on public.animoa_media_library(imported_at desc);
create index if not exists animoa_media_library_status_idx
  on public.animoa_media_library(status, imported_at desc);

alter table public.animoa_media_library enable row level security;
revoke all on public.animoa_media_library from public, anon, authenticated;
grant select, insert, update, delete on public.animoa_media_library to authenticated;
grant all on public.animoa_media_library to service_role;

-- Même un utilisateur connecté ne peut rien voir : il faut être présent dans
-- public.animoa_admins, qui contient uniquement le compte administrateur Animoa.
drop policy if exists "Only Animoa admin can read media library" on public.animoa_media_library;
drop policy if exists "Only Animoa admin can insert media library" on public.animoa_media_library;
drop policy if exists "Only Animoa admin can update media library" on public.animoa_media_library;
drop policy if exists "Only Animoa admin can delete media library" on public.animoa_media_library;

create policy "Only Animoa admin can read media library"
on public.animoa_media_library for select to authenticated
using ((select public.is_animoa_admin()));

create policy "Only Animoa admin can insert media library"
on public.animoa_media_library for insert to authenticated
with check (
  (select public.is_animoa_admin())
  and imported_by = (select auth.uid())
);

create policy "Only Animoa admin can update media library"
on public.animoa_media_library for update to authenticated
using ((select public.is_animoa_admin()))
with check ((select public.is_animoa_admin()));

create policy "Only Animoa admin can delete media library"
on public.animoa_media_library for delete to authenticated
using ((select public.is_animoa_admin()));

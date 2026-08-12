-- ANIMOA 3.15.0 — Parcours utilisateur / tunnel de conversion
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Le script est idempotent et peut être relancé sans dupliquer les données.
--
-- Étapes suivies :
--   landing_view       : arrivée sur la page publique
--   signup_click       : clic sur « Créer un compte »
--   signup_success     : compte réellement créé
--   first_pet_created  : premier animal créé
--
-- Les visiteurs ne peuvent pas lire ces événements. Seul un compte déclaré
-- dans public.animoa_admins peut les consulter depuis l'Admin Animoa.

create extension if not exists pgcrypto;

-- Référence versionnée du profil léger utilisé par l'Administration.
-- Cette table existe déjà sur le projet en production ; ces instructions la
-- rendent reproductible sans modifier les données existantes.
create table if not exists public.animoa_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  provider text not null default 'email',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.animoa_profiles
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists provider text not null default 'email',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now();

alter table public.animoa_profiles enable row level security;
revoke all on public.animoa_profiles from anon, authenticated;
grant select, insert, update on public.animoa_profiles to authenticated;
grant all on public.animoa_profiles to service_role;

drop policy if exists "Animoa profil lire le sien" on public.animoa_profiles;
drop policy if exists "Animoa profil creer le sien" on public.animoa_profiles;
drop policy if exists "Animoa profil modifier le sien" on public.animoa_profiles;
drop policy if exists "Animoa admin lire profils" on public.animoa_profiles;

create policy "Animoa profil lire le sien"
on public.animoa_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Animoa profil creer le sien"
on public.animoa_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Animoa profil modifier le sien"
on public.animoa_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Animoa admin lire profils"
on public.animoa_profiles for select to authenticated
using ((select public.is_animoa_admin()));

-- Les profils sont aussi alimentés côté base afin que l'Admin liste les comptes
-- même si l'utilisateur ferme la page juste après son inscription.
create or replace function public.sync_animoa_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.animoa_profiles (
    user_id, email, display_name, provider, created_at, last_seen_at
  ) values (
    new.id,
    lower(coalesce(new.email, '')),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'given_name',
      ''
    )), ''),
    coalesce(nullif(new.raw_app_meta_data ->> 'provider', ''), 'email'),
    coalesce(new.created_at, now()),
    coalesce(new.last_sign_in_at, new.created_at, now())
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.animoa_profiles.display_name),
    provider = excluded.provider;
  return new;
end;
$$;

revoke all on function public.sync_animoa_profile_from_auth() from public, anon, authenticated;

drop trigger if exists animoa_sync_profile_after_auth_change on auth.users;
create trigger animoa_sync_profile_after_auth_change
after insert or update of email, raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute function public.sync_animoa_profile_from_auth();

-- Rattrape les comptes déjà existants sans écraser leur historique de dernière connexion.
insert into public.animoa_profiles (user_id, email, display_name, provider, created_at, last_seen_at)
select
  u.id,
  lower(coalesce(u.email, '')),
  nullif(trim(coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    u.raw_user_meta_data ->> 'given_name',
    ''
  )), ''),
  coalesce(nullif(u.raw_app_meta_data ->> 'provider', ''), 'email'),
  coalesce(u.created_at, now()),
  coalesce(u.last_sign_in_at, u.created_at, now())
from auth.users u
on conflict (user_id) do update set
  email = excluded.email,
  display_name = coalesce(excluded.display_name, public.animoa_profiles.display_name),
  provider = excluded.provider;

create table if not exists public.animoa_funnel_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text not null,
  user_id uuid,
  path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint animoa_funnel_event_name_check check (
    event_name in ('landing_view','signup_click','signup_success','first_pet_created')
  ),
  constraint animoa_funnel_session_length check (char_length(session_id) between 8 and 100),
  constraint animoa_funnel_path_length check (path is null or char_length(path) <= 500),
  constraint animoa_funnel_referrer_length check (referrer is null or char_length(referrer) <= 500)
);

-- Si un compte est supprimé, ses événements de conversion associés sont supprimés aussi.
alter table public.animoa_funnel_events
  drop constraint if exists animoa_funnel_events_user_id_fkey;
alter table public.animoa_funnel_events
  add constraint animoa_funnel_events_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists animoa_funnel_created_idx
  on public.animoa_funnel_events(created_at desc);
create index if not exists animoa_funnel_event_created_idx
  on public.animoa_funnel_events(event_name, created_at desc);
create index if not exists animoa_funnel_user_idx
  on public.animoa_funnel_events(user_id, created_at desc)
  where user_id is not null;

-- Une arrivée et un clic d'inscription maximum par session.
create unique index if not exists animoa_funnel_session_event_unique
  on public.animoa_funnel_events(event_name, session_id)
  where event_name in ('landing_view','signup_click');

-- Une conversion et un premier animal maximum par compte.
create unique index if not exists animoa_funnel_user_event_unique
  on public.animoa_funnel_events(event_name, user_id)
  where user_id is not null and event_name in ('signup_success','first_pet_created');

alter table public.animoa_funnel_events enable row level security;
revoke all on public.animoa_funnel_events from public, anon, authenticated;
grant select on public.animoa_funnel_events to authenticated;
grant all on public.animoa_funnel_events to service_role;

drop policy if exists "Animoa admin lire parcours" on public.animoa_funnel_events;
create policy "Animoa admin lire parcours"
on public.animoa_funnel_events for select to authenticated
using ((select public.is_animoa_admin()));

-- Enregistrement sécurisé : le navigateur ne reçoit jamais de droit INSERT direct.
create or replace function public.track_animoa_funnel_event(
  p_event_name text,
  p_session_id text,
  p_path text default null,
  p_referrer text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event text := trim(coalesce(p_event_name, ''));
  v_session text := left(trim(coalesce(p_session_id, '')), 100);
  v_user uuid := auth.uid();
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
begin
  if v_event not in ('landing_view','signup_click','signup_success','first_pet_created') then
    raise exception 'Événement de parcours invalide';
  end if;

  if char_length(v_session) < 8 then
    raise exception 'Session de parcours invalide';
  end if;

  if v_event in ('signup_success','first_pet_created') and v_user is null then
    raise exception 'Utilisateur connecté requis';
  end if;

  -- Limite les métadonnées à un objet JSON raisonnable.
  if jsonb_typeof(v_metadata) <> 'object' or pg_column_size(v_metadata) > 8192 then
    v_metadata := '{}'::jsonb;
  end if;

  insert into public.animoa_funnel_events (
    event_name, session_id, user_id, path, referrer, metadata
  ) values (
    v_event,
    v_session,
    v_user,
    nullif(left(coalesce(p_path, ''), 500), ''),
    nullif(left(coalesce(p_referrer, ''), 500), ''),
    v_metadata
  )
  on conflict do nothing;
end;
$$;

revoke all on function public.track_animoa_funnel_event(text,text,text,text,jsonb) from public;
grant execute on function public.track_animoa_funnel_event(text,text,text,text,jsonb) to anon, authenticated;

-- Résumé directement exploitable par le tableau de bord Admin.
create or replace function public.get_animoa_funnel_summary(p_days integer default 30)
returns table (
  period_days integer,
  landing_visits bigint,
  signup_clicks bigint,
  signup_successes bigint,
  first_pet_creations bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 365);
begin
  if not public.is_animoa_admin() then
    raise exception 'Accès administrateur requis';
  end if;

  return query
  select
    v_days,
    count(distinct e.session_id) filter (where e.event_name = 'landing_view'),
    count(distinct e.session_id) filter (where e.event_name = 'signup_click'),
    count(distinct e.user_id) filter (where e.event_name = 'signup_success'),
    count(distinct e.user_id) filter (where e.event_name = 'first_pet_created')
  from public.animoa_funnel_events e
  where e.created_at >= now() - make_interval(days => v_days);
end;
$$;

revoke all on function public.get_animoa_funnel_summary(integer) from public, anon;
grant execute on function public.get_animoa_funnel_summary(integer) to authenticated;

-- Contrôle final sans exposer de données privées.
select 'animoa_funnel_events' as objet, count(*) as evenements_enregistres
from public.animoa_funnel_events;

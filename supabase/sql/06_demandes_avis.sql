-- ANIMOA 3.10.0 — Demandes d'avis publiques et suivi administrateur
-- À exécuter UNE FOIS dans Supabase > SQL Editor avant de déployer le nouveau app.js.
--
-- Principe :
-- - comptes déjà présents au moment de l'exécution : premier message dans 7 jours ;
-- - nouveaux comptes : compteur démarré lors de leur première ouverture d'Animoa ;
-- - « Plus tard » après le 1er affichage : nouvelle demande 7 jours après ;
-- - « Plus tard » après le 2e affichage : nouvelle demande 30 jours après ;
-- - le 3e affichage est le dernier ;
-- - « Ne plus afficher » et « Donner mon avis » arrêtent les relances.

create extension if not exists pgcrypto;

create table if not exists public.animoa_review_config (
  id boolean primary key default true check (id = true),
  enabled boolean not null default false,
  platform text not null default 'Google',
  review_url text not null default '',
  feature_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint animoa_review_config_platform_length check (char_length(platform) between 1 and 60),
  constraint animoa_review_config_url_length check (char_length(review_url) <= 1000),
  constraint animoa_review_config_url_format check (
    review_url = '' or review_url ~* '^https://'
  )
);

insert into public.animoa_review_config (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.animoa_review_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cohort text not null default 'new_user'
    check (cohort in ('existing_at_launch', 'new_user')),
  started_at timestamptz not null default now(),
  next_prompt_at timestamptz,
  prompt_count integer not null default 0
    check (prompt_count between 0 and 3),
  snooze_count integer not null default 0
    check (snooze_count between 0 and 3),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'clicked', 'dismissed', 'closed')),
  last_prompted_at timestamptz,
  last_action text
    check (last_action is null or last_action in ('shown', 'later', 'review', 'never', 'closed')),
  last_action_at timestamptz,
  clicked_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists animoa_review_requests_next_prompt_idx
  on public.animoa_review_requests(status, next_prompt_at)
  where status = 'scheduled';

create index if not exists animoa_review_requests_updated_idx
  on public.animoa_review_requests(updated_at desc);

-- Tous les comptes déjà existants commencent leur délai à la mise en place de cette évolution.
insert into public.animoa_review_requests (
  user_id,
  cohort,
  started_at,
  next_prompt_at,
  created_at,
  updated_at
)
select
  users.id,
  'existing_at_launch',
  config.feature_started_at,
  config.feature_started_at + interval '7 days',
  now(),
  now()
from auth.users as users
cross join public.animoa_review_config as config
where config.id = true
  and users.created_at <= config.feature_started_at
  and not exists (
    select 1
    from public.animoa_admins as admins
    where admins.user_id = users.id
  )
on conflict (user_id) do nothing;

alter table public.animoa_review_config enable row level security;
alter table public.animoa_review_requests enable row level security;

revoke all on public.animoa_review_config from anon, authenticated;
revoke all on public.animoa_review_requests from anon, authenticated;

grant select on public.animoa_review_config to authenticated;
grant select on public.animoa_review_requests to authenticated;
grant update on public.animoa_review_config to authenticated;
grant all on public.animoa_review_config, public.animoa_review_requests to service_role;

drop policy if exists "Animoa lire configuration avis" on public.animoa_review_config;
drop policy if exists "Administrateur modifier configuration avis" on public.animoa_review_config;
drop policy if exists "Utilisateur lire sa demande avis" on public.animoa_review_requests;
drop policy if exists "Administrateur lire demandes avis" on public.animoa_review_requests;

create policy "Animoa lire configuration avis"
on public.animoa_review_config for select to authenticated
using (id = true);

create policy "Administrateur modifier configuration avis"
on public.animoa_review_config for update to authenticated
using ((select public.is_animoa_admin()))
with check ((select public.is_animoa_admin()));

create policy "Utilisateur lire sa demande avis"
on public.animoa_review_requests for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Administrateur lire demandes avis"
on public.animoa_review_requests for select to authenticated
using ((select public.is_animoa_admin()));

create or replace function public.set_animoa_review_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists animoa_review_config_updated_at on public.animoa_review_config;
create trigger animoa_review_config_updated_at
before update on public.animoa_review_config
for each row execute function public.set_animoa_review_updated_at();

drop trigger if exists animoa_review_requests_updated_at on public.animoa_review_requests;
create trigger animoa_review_requests_updated_at
before update on public.animoa_review_requests
for each row execute function public.set_animoa_review_updated_at();

-- Crée le suivi d'un nouveau compte lors de sa première ouverture de l'application.
create or replace function public.ensure_animoa_review_request()
returns public.animoa_review_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  result public.animoa_review_requests;
begin
  if current_user_id is null then
    raise exception 'Authentification requise.';
  end if;

  if public.is_animoa_admin() then
    return null;
  end if;

  insert into public.animoa_review_requests (
    user_id,
    cohort,
    started_at,
    next_prompt_at,
    created_at,
    updated_at
  )
  values (
    current_user_id,
    'new_user',
    now(),
    now() + interval '7 days',
    now(),
    now()
  )
  on conflict (user_id) do nothing;

  select * into result
  from public.animoa_review_requests
  where user_id = current_user_id;

  return result;
end;
$$;

revoke all on function public.ensure_animoa_review_request() from public, anon;
grant execute on function public.ensure_animoa_review_request() to authenticated;

-- Réserve atomiquement un affichage lorsqu'il est réellement arrivé à échéance.
-- La prochaine échéance est déjà préparée afin qu'une fermeture brutale du navigateur
-- ne puisse ni bloquer le suivi ni provoquer un nouvel affichage immédiat.
create or replace function public.claim_animoa_review_prompt()
returns public.animoa_review_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  config public.animoa_review_config;
  current_row public.animoa_review_requests;
  next_count integer;
  result public.animoa_review_requests;
begin
  if current_user_id is null then
    raise exception 'Authentification requise.';
  end if;

  select * into config
  from public.animoa_review_config
  where id = true;

  if not found then
    return null;
  end if;

  if config.enabled is not true
     or nullif(trim(config.review_url), '') is null then
    return null;
  end if;

  perform public.ensure_animoa_review_request();

  select * into current_row
  from public.animoa_review_requests
  where user_id = current_user_id
  for update;

  if not found then
    return null;
  end if;

  if current_row.status <> 'scheduled'
     or current_row.next_prompt_at is null
     or current_row.next_prompt_at > now()
     or current_row.prompt_count >= 3 then
    return null;
  end if;

  next_count := current_row.prompt_count + 1;

  update public.animoa_review_requests
  set
    prompt_count = next_count,
    last_prompted_at = now(),
    last_action = 'shown',
    last_action_at = now(),
    next_prompt_at = case
      when next_count = 1 then now() + interval '7 days'
      when next_count = 2 then now() + interval '30 days'
      else null
    end,
    status = case when next_count >= 3 then 'closed' else 'scheduled' end
  where user_id = current_user_id
  returning * into result;

  return result;
end;
$$;

revoke all on function public.claim_animoa_review_prompt() from public, anon;
grant execute on function public.claim_animoa_review_prompt() to authenticated;

-- Enregistre le choix explicite de l'utilisateur.
create or replace function public.record_animoa_review_action(p_action text)
returns public.animoa_review_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  normalized_action text := lower(trim(coalesce(p_action, '')));
  current_row public.animoa_review_requests;
  result public.animoa_review_requests;
begin
  if current_user_id is null then
    raise exception 'Authentification requise.';
  end if;

  if normalized_action not in ('later', 'review', 'never') then
    raise exception 'Action de demande d''avis invalide.';
  end if;

  select * into current_row
  from public.animoa_review_requests
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Aucune demande d''avis active.';
  end if;

  if current_row.prompt_count = 0 then
    raise exception 'Aucune demande d''avis active.';
  end if;

  if current_row.status in ('clicked', 'dismissed') then
    return current_row;
  end if;

  if normalized_action = 'review' then
    update public.animoa_review_requests
    set
      status = 'clicked',
      next_prompt_at = null,
      last_action = 'review',
      last_action_at = now(),
      clicked_at = coalesce(clicked_at, now())
    where user_id = current_user_id
    returning * into result;

  elsif normalized_action = 'never' then
    update public.animoa_review_requests
    set
      status = 'dismissed',
      next_prompt_at = null,
      last_action = 'never',
      last_action_at = now(),
      dismissed_at = coalesce(dismissed_at, now())
    where user_id = current_user_id
    returning * into result;

  else
    update public.animoa_review_requests
    set
      snooze_count = least(3, snooze_count + 1),
      last_action = case when prompt_count >= 3 then 'closed' else 'later' end,
      last_action_at = now(),
      status = case when prompt_count >= 3 then 'closed' else 'scheduled' end,
      next_prompt_at = case
        when prompt_count = 1 then now() + interval '7 days'
        when prompt_count = 2 then now() + interval '30 days'
        else null
      end
    where user_id = current_user_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.record_animoa_review_action(text) from public, anon;
grant execute on function public.record_animoa_review_action(text) to authenticated;

-- Contrôle rapide après exécution.
select
  (select count(*) from public.animoa_review_requests) as comptes_initialises,
  enabled,
  platform,
  review_url,
  feature_started_at
from public.animoa_review_config
where id = true;

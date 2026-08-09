-- ANIMOA 3.14.0 — Publication directe + programmation Facebook
-- À exécuter APRÈS le script 11_publications_facebook_admin.sql.
-- Ce script est idempotent : il peut être relancé sans dupliquer le Cron.
-- Il réutilise les secrets Vault déjà créés par 03_rappels_24h.sql :
--   animoa_project_url et animoa_cron_secret.
-- Aucun token Facebook n’est stocké dans PostgreSQL.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.animoa_facebook_publications
  add column if not exists scheduled_at timestamptz,
  add column if not exists scheduled_timezone text not null default 'Europe/Paris',
  add column if not exists publish_attempts integer not null default 0,
  add column if not exists publishing_started_at timestamptz,
  add column if not exists last_publish_attempt_at timestamptz;

-- La contrainte créée par le script 11 ne connaissait pas encore les états
-- « scheduled » et « publishing ».
alter table public.animoa_facebook_publications
  drop constraint if exists animoa_facebook_publications_status_check;

alter table public.animoa_facebook_publications
  add constraint animoa_facebook_publications_status_check
  check (status in ('draft', 'ready', 'scheduled', 'publishing', 'published', 'error'));

alter table public.animoa_facebook_publications
  drop constraint if exists animoa_facebook_publications_scheduled_timezone_check;

alter table public.animoa_facebook_publications
  add constraint animoa_facebook_publications_scheduled_timezone_check
  check (scheduled_timezone = 'Europe/Paris');

create index if not exists animoa_facebook_publications_schedule_idx
  on public.animoa_facebook_publications(status, scheduled_at)
  where status = 'scheduled';

-- Les états « publishing » et « published » sont pilotés uniquement côté serveur.
-- Cela évite qu’un navigateur avec un état devenu obsolète remette une publication
-- déjà prise par le Cron dans la file, ce qui pourrait provoquer un doublon.
drop policy if exists "Only Animoa admin can insert Facebook publications" on public.animoa_facebook_publications;
drop policy if exists "Only Animoa admin can update Facebook publications" on public.animoa_facebook_publications;
drop policy if exists "Only Animoa admin can delete Facebook publications" on public.animoa_facebook_publications;

create policy "Only Animoa admin can insert Facebook publications"
on public.animoa_facebook_publications for insert to authenticated
with check (
  (select public.is_animoa_admin())
  and created_by = (select auth.uid())
  and status in ('draft', 'ready', 'scheduled', 'error')
);

create policy "Only Animoa admin can update Facebook publications"
on public.animoa_facebook_publications for update to authenticated
using (
  (select public.is_animoa_admin())
  and status not in ('publishing', 'published')
)
with check (
  (select public.is_animoa_admin())
  and status in ('draft', 'ready', 'scheduled', 'error')
);

create policy "Only Animoa admin can delete Facebook publications"
on public.animoa_facebook_publications for delete to authenticated
using (
  (select public.is_animoa_admin())
  and status <> 'publishing'
);

-- Table technique pour ne pas envoyer plusieurs fois l’e-mail J-7.
create table if not exists public.animoa_facebook_connection_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_key text not null unique,
  kind text not null check (kind in ('data_access_j7')),
  expires_at timestamptz not null,
  status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
  attempts integer not null default 1,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.animoa_facebook_connection_alerts enable row level security;
revoke all on public.animoa_facebook_connection_alerts from public, anon, authenticated;
grant all on public.animoa_facebook_connection_alerts to service_role;

-- Réservation atomique des publications arrivées à échéance.
-- FOR UPDATE SKIP LOCKED empêche deux exécutions du Cron de prendre la même ligne.
create or replace function public.claim_animoa_facebook_publications(p_limit integer default 5)
returns setof public.animoa_facebook_publications
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select p.id
    from public.animoa_facebook_publications p
    where p.status = 'scheduled'
      and p.scheduled_at is not null
      and p.scheduled_at <= now()
    order by p.scheduled_at asc
    limit least(greatest(coalesce(p_limit, 5), 1), 20)
    for update skip locked
  )
  update public.animoa_facebook_publications p
  set status = 'publishing',
      publishing_started_at = now(),
      last_publish_attempt_at = now(),
      publish_attempts = p.publish_attempts + 1,
      error_message = null,
      updated_at = now()
  from candidates c
  where p.id = c.id
  returning p.*;
end;
$$;

revoke all on function public.claim_animoa_facebook_publications(integer)
from public, anon, authenticated;
grant execute on function public.claim_animoa_facebook_publications(integer)
to service_role;

-- Vérifie que le projet possède déjà les deux secrets Vault utilisés par
-- les Crons Animoa. Le script 03 les installe normalement déjà.
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'animoa_project_url') then
    raise exception 'Secret Vault animoa_project_url absent. Exécutez d''abord le script 03_rappels_24h.sql ou recréez ce secret.';
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'animoa_cron_secret') then
    raise exception 'Secret Vault animoa_cron_secret absent. Il doit contenir la même valeur que le secret Edge ANIMOA_CRON_SECRET.';
  end if;
end;
$$;

-- Remplace proprement les jobs Facebook si le script est relancé.
do $$
declare
  job_name text;
begin
  foreach job_name in array array[
    'animoa-facebook-dispatch-every-minute',
    'animoa-facebook-due-every-minute',
    'animoa-facebook-health-daily'
  ]
  loop
    if exists (select 1 from cron.job where jobname = job_name) then
      perform cron.unschedule(job_name);
    end if;
  end loop;
end;
$$;

-- Vérification toutes les minutes dans PostgreSQL, mais appel de l’Edge Function
-- uniquement lorsqu’une publication est réellement due ou qu’un envoi bloqué doit
-- être récupéré. On évite ainsi des milliers d’appels Edge inutiles chaque mois.
select cron.schedule(
  'animoa-facebook-due-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'animoa_project_url'
    ) || '/functions/v1/animoa-facebook-dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-animoa-cron-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'animoa_cron_secret'
      )
    ),
    body := jsonb_build_object(
      'source', 'supabase-cron-due',
      'requested_at', now()
    ),
    timeout_milliseconds := 20000
  )
  where exists (
    select 1
    from public.animoa_facebook_publications p
    where (p.status = 'scheduled' and p.scheduled_at is not null and p.scheduled_at <= now())
       or (p.status = 'publishing' and p.publishing_started_at is not null and p.publishing_started_at < now() - interval '30 minutes')
  );
  $$
);

-- Un contrôle quotidien suffit pour le rappel d’échéance Facebook J-7.
-- La même fonction est réutilisée : elle n’envoie l’e-mail qu’une seule fois grâce
-- à animoa_facebook_connection_alerts.
select cron.schedule(
  'animoa-facebook-health-daily',
  '17 7 * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'animoa_project_url'
    ) || '/functions/v1/animoa-facebook-dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-animoa-cron-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'animoa_cron_secret'
      )
    ),
    body := jsonb_build_object(
      'source', 'supabase-cron-health',
      'requested_at', now()
    ),
    timeout_milliseconds := 20000
  );
  $$
);

-- Contrôle final : les deux lignes doivent apparaître actives.
select jobid, jobname, schedule, active
from cron.job
where jobname in ('animoa-facebook-due-every-minute', 'animoa-facebook-health-daily')
order by jobname;

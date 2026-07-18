-- ANIMOA — Rappels automatiques par e-mail la veille / 24 h avant
-- À exécuter dans Supabase > SQL Editor APRÈS avoir déployé l'Edge Function.
--
-- IMPORTANT :
-- 1) Remplacez ANIMOA_CRON_SECRET_A_REMPLACER par le même secret que celui
--    enregistré dans Edge Functions > Secrets sous le nom ANIMOA_CRON_SECRET.
-- 2) Ne mettez jamais votre clé Brevo ni une clé sb_secret_ directement ici.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.animoa_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_date date not null,
  event_title text not null default '',
  reminder_kind text not null default '24h',
  status text not null default 'processing'
    check (status in ('processing', 'sent', 'failed')),
  attempts integer not null default 1,
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id, event_date, reminder_kind)
);

alter table public.animoa_reminder_deliveries enable row level security;

revoke all on public.animoa_reminder_deliveries from anon, authenticated;
grant all on public.animoa_reminder_deliveries to service_role;

create or replace function public.claim_animoa_reminder(
  p_user_id uuid,
  p_event_id text,
  p_event_date date,
  p_event_title text,
  p_reminder_kind text default '24h'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  insert into public.animoa_reminder_deliveries (
    user_id,
    event_id,
    event_date,
    event_title,
    reminder_kind,
    status,
    attempts,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    p_event_id,
    p_event_date,
    coalesce(p_event_title, ''),
    coalesce(p_reminder_kind, '24h'),
    'processing',
    1,
    now(),
    now()
  )
  on conflict (user_id, event_id, event_date, reminder_kind)
  do update set
    status = 'processing',
    attempts = public.animoa_reminder_deliveries.attempts + 1,
    event_title = excluded.event_title,
    last_error = null,
    updated_at = now()
  where (
    public.animoa_reminder_deliveries.status = 'failed'
    and public.animoa_reminder_deliveries.attempts < 5
  ) or (
    public.animoa_reminder_deliveries.status = 'processing'
    and public.animoa_reminder_deliveries.updated_at < now() - interval '30 minutes'
    and public.animoa_reminder_deliveries.attempts < 5
  )
  returning id into claimed_id;

  return claimed_id;
end;
$$;

revoke all on function public.claim_animoa_reminder(uuid, text, date, text, text)
from public, anon, authenticated;

grant execute on function public.claim_animoa_reminder(uuid, text, date, text, text)
to service_role;

-- Stockage sécurisé dans Supabase Vault.
-- Le projet Animoa utilise cette URL :
select vault.create_secret(
  'https://lwnhzssdtylknhidcuil.supabase.co',
  'animoa_project_url'
)
where not exists (
  select 1 from vault.decrypted_secrets where name = 'animoa_project_url'
);

-- REMPLACER LA VALEUR CI-DESSOUS AVANT D'EXÉCUTER CE SCRIPT.
select vault.create_secret(
  'ANIMOA_CRON_SECRET_A_REMPLACER',
  'animoa_cron_secret'
)
where not exists (
  select 1 from vault.decrypted_secrets where name = 'animoa_cron_secret'
);

-- Supprime l'ancien planning portant le même nom, s'il existe.
do $$
begin
  if exists (
    select 1 from cron.job
    where jobname = 'animoa-reminders-24h-hourly'
  ) then
    perform cron.unschedule('animoa-reminders-24h-hourly');
  end if;
end;
$$;

-- Exécution toutes les heures à la 5e minute.
-- Les événements avec une heure seront détectés dans les 24 heures précédentes.
-- Les événements sans heure partiront la veille à partir de 8 h, heure de Paris.
select cron.schedule(
  'animoa-reminders-24h-hourly',
  '5 * * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'animoa_project_url'
    ) || '/functions/v1/animoa-reminders-24h',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-animoa-cron-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'animoa_cron_secret'
      )
    ),
    body := jsonb_build_object(
      'source', 'supabase-cron',
      'requested_at', now()
    ),
    timeout_milliseconds := 20000
  );
  $$
);

-- Vérification : cette requête doit afficher le nouveau job.
select jobid, jobname, schedule, active
from cron.job
where jobname = 'animoa-reminders-24h-hourly';

-- ANIMOA 3.11.0 — Avis internes et note moyenne
-- À exécuter UNE FOIS après 06_demandes_avis.sql et 07_avis_direct_parametres.sql.
--
-- Cette évolution :
-- - remplace l'envoi vers une plateforme externe par un formulaire interne ;
-- - conserve la cadence 7 jours, puis 7 jours, puis 30 jours ;
-- - enregistre une note sur 5 et un commentaire facultatif ;
-- - rend chaque avis individuel visible uniquement par l'administrateur ;
-- - expose aux utilisateurs uniquement la moyenne et le nombre total d'avis ;
-- - active les demandes internes dès l'exécution du script.

create extension if not exists pgcrypto;

begin;

-- Table d'avis interne. Elle existe déjà sur les installations récentes ; les ALTER
-- permettent aussi d'installer proprement la fonction sur une base plus ancienne.
create table if not exists public.animoa_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  rating integer,
  comment text,
  liked text,
  missing text,
  issue text,
  status text not null default 'nouveau',
  private_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint animoa_feedback_rating_valid check (rating is null or rating between 1 and 5),
  constraint animoa_feedback_email_length check (email is null or char_length(email) <= 180),
  constraint animoa_feedback_comment_length check (comment is null or char_length(comment) <= 2000)
);

alter table public.animoa_feedback
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists email text,
  add column if not exists rating integer,
  add column if not exists comment text,
  add column if not exists liked text,
  add column if not exists missing text,
  add column if not exists issue text,
  add column if not exists status text not null default 'nouveau',
  add column if not exists private_note text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Un avis est supprimé avec le compte qui l'a envoyé.
alter table public.animoa_feedback
  drop constraint if exists animoa_feedback_user_id_fkey;

alter table public.animoa_feedback
  add constraint animoa_feedback_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists animoa_feedback_created_idx
  on public.animoa_feedback(created_at desc);

create index if not exists animoa_feedback_user_idx
  on public.animoa_feedback(user_id, updated_at desc)
  where user_id is not null;

alter table public.animoa_feedback enable row level security;

-- Les utilisateurs passent uniquement par les fonctions sécurisées ci-dessous.
-- Les lignes et commentaires restent donc invisibles aux autres utilisateurs.
revoke all on public.animoa_feedback from anon, authenticated;
grant select, update, delete on public.animoa_feedback to authenticated;
grant all on public.animoa_feedback to service_role;

drop policy if exists "Authenticated can submit feedback" on public.animoa_feedback;
drop policy if exists "Only admin can read feedback" on public.animoa_feedback;
drop policy if exists "Only admin can update feedback" on public.animoa_feedback;
drop policy if exists "Only admin can delete feedback" on public.animoa_feedback;

create policy "Only admin can read feedback"
on public.animoa_feedback for select to authenticated
using ((select public.is_animoa_admin()));

create policy "Only admin can update feedback"
on public.animoa_feedback for update to authenticated
using ((select public.is_animoa_admin()))
with check ((select public.is_animoa_admin()));

create policy "Only admin can delete feedback"
on public.animoa_feedback for delete to authenticated
using ((select public.is_animoa_admin()));

-- Mise à jour automatique de updated_at.
create or replace function public.set_animoa_feedback_updated_at()
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

drop trigger if exists animoa_feedback_updated_at on public.animoa_feedback;
create trigger animoa_feedback_updated_at
before update on public.animoa_feedback
for each row execute function public.set_animoa_feedback_updated_at();

-- Le suivi des demandes sait désormais distinguer un avis réellement envoyé.
alter table public.animoa_review_requests
  add column if not exists submitted_at timestamptz;

alter table public.animoa_review_requests
  drop constraint if exists animoa_review_requests_status_check;

alter table public.animoa_review_requests
  add constraint animoa_review_requests_status_check
  check (status in ('scheduled', 'clicked', 'dismissed', 'closed', 'submitted'));

alter table public.animoa_review_requests
  drop constraint if exists animoa_review_requests_last_action_check;

alter table public.animoa_review_requests
  add constraint animoa_review_requests_last_action_check
  check (last_action is null or last_action in ('shown', 'later', 'review', 'never', 'closed', 'submitted'));

-- Résumé public : seulement la moyenne et le nombre d'avis, jamais les commentaires.
create or replace function public.get_animoa_review_summary()
returns table (
  review_count bigint,
  average_rating numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with latest_reviews as (
    select distinct on (feedback.user_id)
      feedback.user_id,
      feedback.rating
    from public.animoa_feedback as feedback
    where feedback.user_id is not null
      and feedback.rating between 1 and 5
    order by feedback.user_id, feedback.updated_at desc, feedback.created_at desc
  )
  select
    count(*)::bigint as review_count,
    coalesce(round(avg(rating)::numeric, 1), 0::numeric) as average_rating
  from latest_reviews;
$$;

revoke all on function public.get_animoa_review_summary() from public, anon;
grant execute on function public.get_animoa_review_summary() to authenticated;

-- L'utilisateur peut relire uniquement son propre avis afin de le modifier depuis les Paramètres.
create or replace function public.get_my_animoa_internal_review()
returns table (
  rating integer,
  comment text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select feedback.rating, feedback.comment, feedback.updated_at
  from public.animoa_feedback as feedback
  where feedback.user_id = (select auth.uid())
  order by feedback.updated_at desc, feedback.created_at desc
  limit 1;
$$;

revoke all on function public.get_my_animoa_internal_review() from public, anon;
grant execute on function public.get_my_animoa_internal_review() to authenticated;

-- Crée ou met à jour l'avis courant de l'utilisateur.
create or replace function public.submit_animoa_internal_review(
  p_rating integer,
  p_comment text default null
)
returns table (
  rating integer,
  comment text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  normalized_comment text := nullif(trim(coalesce(p_comment, '')), '');
  existing_id uuid;
  result public.animoa_feedback;
begin
  if current_user_id is null then
    raise exception 'Authentification requise.';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'La note doit être comprise entre 1 et 5.';
  end if;

  if normalized_comment is not null and char_length(normalized_comment) > 1200 then
    raise exception 'Le commentaire ne peut pas dépasser 1200 caractères.';
  end if;

  select users.email into current_email
  from auth.users as users
  where users.id = current_user_id;

  select feedback.id into existing_id
  from public.animoa_feedback as feedback
  where feedback.user_id = current_user_id
  order by feedback.updated_at desc, feedback.created_at desc
  limit 1
  for update;

  if existing_id is null then
    insert into public.animoa_feedback (
      user_id,
      email,
      rating,
      comment,
      status,
      created_at,
      updated_at
    )
    values (
      current_user_id,
      current_email,
      p_rating,
      normalized_comment,
      'nouveau',
      now(),
      now()
    )
    returning * into result;
  else
    update public.animoa_feedback
    set
      email = current_email,
      rating = p_rating,
      comment = normalized_comment,
      status = 'nouveau',
      updated_at = now()
    where id = existing_id
    returning * into result;

  end if;

  perform public.ensure_animoa_review_request();

  update public.animoa_review_requests
  set
    status = 'submitted',
    next_prompt_at = null,
    last_action = 'submitted',
    last_action_at = now(),
    submitted_at = now()
  where user_id = current_user_id;

  return query
  select result.rating, result.comment, result.updated_at;
end;
$$;

revoke all on function public.submit_animoa_internal_review(integer, text) from public, anon;
grant execute on function public.submit_animoa_internal_review(integer, text) to authenticated;

-- Réserve le message interne arrivé à échéance. Aucun lien externe n'est requis.
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

  if not found or config.enabled is not true then
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

-- Conserve les actions « Plus tard » et « Ne plus afficher » tout en protégeant
-- un avis déjà envoyé contre une ancienne fenêtre encore ouverte dans un autre onglet.
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

  perform public.ensure_animoa_review_request();

  select * into current_row
  from public.animoa_review_requests
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Aucune demande d''avis active.';
  end if;

  if current_row.prompt_count = 0 and normalized_action <> 'review' then
    raise exception 'Aucune demande d''avis active.';
  end if;

  if current_row.status in ('clicked', 'submitted')
     or (current_row.status = 'dismissed' and normalized_action <> 'review') then
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

-- Active le nouveau formulaire interne. Les échéances déjà calculées sont conservées.
update public.animoa_review_config
set
  enabled = true,
  platform = 'Animoa',
  review_url = '',
  updated_at = now()
where id = true;

commit;

-- Contrôle rapide après exécution.
select
  config.enabled,
  config.platform,
  (select count(*) from public.animoa_review_requests) as comptes_suivis,
  summary.review_count,
  summary.average_rating
from public.animoa_review_config as config
cross join public.get_animoa_review_summary() as summary
where config.id = true;

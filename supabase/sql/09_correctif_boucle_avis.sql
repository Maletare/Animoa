-- ANIMOA 3.11.4 — Correctif anti-boucle des demandes d'avis
-- À exécuter UNE FOIS après 08_avis_internes.sql.
--
-- Ce correctif :
-- - ne présente jamais la demande automatique à un administrateur ;
-- - reconnaît un avis déjà enregistré même si l'ancienne ligne de suivi est incohérente ;
-- - rend « Plus tard » et « Ne plus afficher » tolérants aux anciennes lignes ;
-- - conserve la cadence : 7 jours avant le premier message, puis 7 jours, puis 30 jours.

begin;

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

  if public.is_animoa_admin() then
    return null;
  end if;

  select * into config
  from public.animoa_review_config
  where id = true;

  if not found or config.enabled is not true then
    return null;
  end if;

  perform public.ensure_animoa_review_request();

  -- Un avis interne existant est toujours prioritaire sur l'ancien suivi.
  if exists (
    select 1
    from public.animoa_feedback as feedback
    where feedback.user_id = current_user_id
      and feedback.rating between 1 and 5
  ) then
    update public.animoa_review_requests
    set
      status = 'submitted',
      next_prompt_at = null,
      last_action = 'submitted',
      last_action_at = now(),
      submitted_at = coalesce(submitted_at, now())
    where user_id = current_user_id;
    return null;
  end if;

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
  effective_prompt_count integer;
  result public.animoa_review_requests;
begin
  if current_user_id is null then
    raise exception 'Authentification requise.';
  end if;

  if normalized_action not in ('later', 'review', 'never') then
    raise exception 'Action de demande d''avis invalide.';
  end if;

  if public.is_animoa_admin() then
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

  if current_row.status in ('clicked', 'submitted')
     or (current_row.status = 'dismissed' and normalized_action <> 'review') then
    return current_row;
  end if;

  effective_prompt_count := greatest(1, coalesce(current_row.prompt_count, 0));

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
      snooze_count = least(3, coalesce(snooze_count, 0) + 1),
      last_action = case when effective_prompt_count >= 3 then 'closed' else 'later' end,
      last_action_at = now(),
      status = case when effective_prompt_count >= 3 then 'closed' else 'scheduled' end,
      next_prompt_at = case
        when effective_prompt_count = 1 then now() + interval '7 days'
        when effective_prompt_count = 2 then now() + interval '30 days'
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

commit;

-- Contrôle rapide : les deux fonctions doivent être présentes.
select
  to_regprocedure('public.claim_animoa_review_prompt()') as claim_function,
  to_regprocedure('public.record_animoa_review_action(text)') as action_function;

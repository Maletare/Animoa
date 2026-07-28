-- ANIMOA 3.10.1 — Avis spontané depuis les Paramètres
-- À exécuter une seule fois après 06_demandes_avis.sql.
-- Autorise « Donner mon avis » avant le premier affichage automatique et arrête les futures relances.

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

  -- Un avis spontané depuis les Paramètres est possible avant le premier message automatique.
  if current_row.prompt_count = 0 and normalized_action <> 'review' then
    raise exception 'Aucune demande d''avis active.';
  end if;

  if current_row.status = 'clicked'
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

select proname
from pg_proc
where proname = 'record_animoa_review_action';

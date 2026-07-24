-- ANIMOA — RÉFÉRENCE VERSIONNÉE : administration, questionnaires et avis
-- Le projet actuellement en ligne possède déjà ces éléments.
-- Conserver ce fichier dans Git permet de ne plus dépendre des requêtes « Untitled query ».
-- Ne pas réexécuter sans sauvegarde et sans vérifier le résultat de 90_audit_securite_lecture_seule.sql.

create extension if not exists pgcrypto;

create table if not exists public.animoa_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.animoa_admins enable row level security;
revoke all on public.animoa_admins from anon, authenticated;
grant all on public.animoa_admins to service_role;

create or replace function public.is_animoa_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.animoa_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_animoa_admin() from public, anon;
grant execute on function public.is_animoa_admin() to authenticated;

-- Questionnaire : colonnes de suivi administrateur.
alter table if exists public.animoa_survey_responses
  add column if not exists status text not null default 'nouveau',
  add column if not exists private_note text,
  add column if not exists updated_at timestamptz not null default now();

-- Avis utilisateurs.
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

create index if not exists animoa_feedback_created_idx
  on public.animoa_feedback(created_at desc);

alter table public.animoa_survey_responses enable row level security;
alter table public.animoa_feedback enable row level security;

revoke all on public.animoa_survey_responses from anon, authenticated;
revoke all on public.animoa_feedback from anon, authenticated;

grant insert on public.animoa_survey_responses to anon, authenticated;
grant insert on public.animoa_feedback to authenticated;
grant select, update, delete on public.animoa_survey_responses to authenticated;
grant select, update, delete on public.animoa_feedback to authenticated;
grant all on public.animoa_survey_responses, public.animoa_feedback to service_role;

grant usage, select on sequence public.animoa_survey_responses_id_seq to anon, authenticated, service_role;

-- Questionnaire public.
drop policy if exists "Public can submit survey responses" on public.animoa_survey_responses;
drop policy if exists "Only admin can read survey responses" on public.animoa_survey_responses;
drop policy if exists "Only admin can update survey responses" on public.animoa_survey_responses;
drop policy if exists "Only admin can delete survey responses" on public.animoa_survey_responses;

create policy "Public can submit survey responses"
on public.animoa_survey_responses for insert to anon, authenticated
with check (
  cardinality(animals) between 1 and 8
  and cardinality(useful_features) between 1 and 12
  and testing_interest in ('Oui','Peut-être','Non')
  and (testing_interest = 'Non' or email is not null)
);

create policy "Only admin can read survey responses"
on public.animoa_survey_responses for select to authenticated
using ((select public.is_animoa_admin()));

create policy "Only admin can update survey responses"
on public.animoa_survey_responses for update to authenticated
using ((select public.is_animoa_admin()))
with check ((select public.is_animoa_admin()));

create policy "Only admin can delete survey responses"
on public.animoa_survey_responses for delete to authenticated
using ((select public.is_animoa_admin()));

-- Avis : envoi par un utilisateur connecté, gestion uniquement par l'administrateur.
drop policy if exists "Authenticated can submit feedback" on public.animoa_feedback;
drop policy if exists "Only admin can read feedback" on public.animoa_feedback;
drop policy if exists "Only admin can update feedback" on public.animoa_feedback;
drop policy if exists "Only admin can delete feedback" on public.animoa_feedback;

create policy "Authenticated can submit feedback"
on public.animoa_feedback for insert to authenticated
with check (
  (user_id is null or user_id = (select auth.uid()))
  and status = 'nouveau'
  and private_note is null
);

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

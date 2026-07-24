-- ANIMOA — AUDIT DE SÉCURITÉ EN LECTURE SEULE
-- Ce script ne modifie rien. Il affiche l'état réel des tables, RLS, politiques,
-- droits, fonctions sensibles, stockage et tâches planifiées.

with expected_tables(table_schema, table_name) as (
  values
    ('public','animoa_user_data'),
    ('public','animoa_survey_responses'),
    ('public','animoa_feedback'),
    ('public','animoa_admins'),
    ('public','animoa_reminder_deliveries'),
    ('public','animoa_push_subscriptions'),
    ('public','animoa_push_deliveries'),
    ('public','calendar_preferences'),
    ('public','calendar_event_links')
),
table_checks as (
  select
    'TABLE_RLS'::text as categorie,
    e.table_schema || '.' || e.table_name as element,
    case
      when c.oid is null then 'ABSENT'
      when c.relrowsecurity then 'OK'
      else 'A_CORRIGER'
    end as statut,
    case
      when c.oid is null then 'Table absente ou créée sous un autre nom.'
      when c.relrowsecurity then 'RLS activée.'
      else 'RLS désactivée : table potentiellement exposée via l’API.'
    end as details
  from expected_tables e
  left join pg_namespace n on n.nspname = e.table_schema
  left join pg_class c on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind in ('r','p')
),
policy_checks as (
  select
    'POLITIQUE_RLS'::text as categorie,
    schemaname || '.' || tablename || ' — ' || policyname as element,
    'INFO'::text as statut,
    'Commande=' || cmd || ' ; rôles=' || array_to_string(roles, ', ') ||
      ' ; USING=' || coalesce(qual, '—') || ' ; CHECK=' || coalesce(with_check, '—') as details
  from pg_policies
  where (schemaname = 'public' and (tablename like 'animoa_%' or tablename like 'calendar_%'))
     or (schemaname = 'storage' and tablename = 'objects')
),
grant_checks as (
  select
    'DROIT_TABLE'::text as categorie,
    table_schema || '.' || table_name || ' — ' || grantee as element,
    case
      when grantee = 'anon'
       and bool_or(privilege_type in ('SELECT','UPDATE','DELETE'))
      then 'A_VERIFIER'
      else 'INFO'
    end as statut,
    string_agg(privilege_type, ', ' order by privilege_type) as details
  from information_schema.role_table_grants
  where grantee in ('anon','authenticated','service_role')
    and table_schema in ('public','storage')
    and (table_name like 'animoa_%' or table_name like 'calendar_%' or table_name = 'objects')
  group by table_schema, table_name, grantee
),
function_checks as (
  select
    'FONCTION'::text as categorie,
    n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as element,
    case
      when p.prosecdef and coalesce(array_to_string(p.proconfig, ','), '') not like '%search_path=%' then 'A_VERIFIER'
      else 'INFO'
    end as statut,
    'security_definer=' || p.prosecdef::text ||
      ' ; config=' || coalesce(array_to_string(p.proconfig, ', '), '—') as details
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and (p.proname like '%animoa%' or p.proname like '%google_calendar%')
),
function_grants as (
  select
    'DROIT_FONCTION'::text as categorie,
    routine_schema || '.' || routine_name || ' — ' || grantee as element,
    case
      when grantee in ('PUBLIC','anon') then 'A_VERIFIER'
      else 'INFO'
    end as statut,
    string_agg(privilege_type, ', ' order by privilege_type) as details
  from information_schema.role_routine_grants
  where routine_schema = 'public'
    and (routine_name like '%animoa%' or routine_name like '%google_calendar%')
  group by routine_schema, routine_name, grantee
),
storage_checks as (
  select
    'STOCKAGE'::text as categorie,
    id::text as element,
    case when public then 'A_CORRIGER' else 'OK' end as statut,
    'public=' || public::text ||
      ' ; limite=' || coalesce(file_size_limit::text, '—') ||
      ' ; types=' || coalesce(array_to_string(allowed_mime_types, ', '), '—') as details
  from storage.buckets
  where id like 'animoa%'
),
extensions_checks as (
  select
    'EXTENSION'::text as categorie,
    extname::text as element,
    'INFO'::text as statut,
    extversion::text as details
  from pg_extension
  where extname in ('pg_cron','pg_net','vault','pgcrypto')
)
select * from table_checks
union all select * from policy_checks
union all select * from grant_checks
union all select * from function_checks
union all select * from function_grants
union all select * from storage_checks
union all select * from extensions_checks
order by categorie, element;

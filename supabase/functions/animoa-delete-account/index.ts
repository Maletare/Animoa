import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

function missingTable(error: { code?: string; message?: string } | null) {
  const message = String(error?.message || '')
  return error?.code === '42P01' || error?.code === 'PGRST205' || /relation .* does not exist|could not find the table/i.test(message)
}

async function removeUserFiles(admin: ReturnType<typeof createClient>, bucket: string, userId: string) {
  while (true) {
    const { data, error } = await admin.storage.from(bucket).list(userId, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw error
    if (!data?.length) return

    const paths = data
      .filter((item) => item?.name)
      .map((item) => `${userId}/${item.name}`)

    if (!paths.length) return
    const { error: removeError } = await admin.storage.from(bucket).remove(paths)
    if (removeError) throw removeError
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ ok: false, error: 'Méthode non autorisée.' }, 405)

  try {
    const authorization = req.headers.get('Authorization') || ''
    if (!authorization.startsWith('Bearer ')) {
      return json({ ok: false, error: 'Connexion requise.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('Variables Supabase absentes pour animoa-delete-account')
      return json({ ok: false, error: 'Service de suppression indisponible.' }, 500)
    }

    const payload = await req.json().catch(() => ({}))
    if (String(payload?.confirmation || '').trim().toUpperCase() !== 'SUPPRIMER') {
      return json({ ok: false, error: 'Confirmation incorrecte.' }, 400)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) {
      return json({ ok: false, error: 'Session invalide ou expirée.' }, 401)
    }

    const userId = userData.user.id
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Les fichiers doivent être retirés avant la suppression de l'utilisateur Auth.
    await removeUserFiles(admin, 'animoa-media', userId)

    // Nettoyage explicite des deux tables utilisées par Animoa.
    for (const table of ['animoa_user_data', 'animoa_profiles']) {
      const { error } = await admin.from(table).delete().eq('user_id', userId)
      if (error && !missingTable(error)) throw error
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId, false)
    if (deleteUserError) throw deleteUserError

    return json({ ok: true })
  } catch (error) {
    console.error('animoa-delete-account', error)
    return json({
      ok: false,
      error: error instanceof Error ? error.message : 'Suppression impossible.',
    }, 500)
  }
})

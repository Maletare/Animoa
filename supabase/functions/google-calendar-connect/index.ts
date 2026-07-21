import { createClient } from "npm:@supabase/supabase-js@2";

const SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
    },
  });
}

async function googleJson(url: string, accessToken: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Google Calendar: ${response.status}`);
  return payload;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Identifiants Google absents.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Autorisation Google expirée.");
  }
  return String(payload.access_token);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Méthode non autorisée." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SB_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    console.error("Variables Supabase manquantes.");
    return json({ ok: false, error: "Configuration serveur incomplète." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const accessJwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!accessJwt || !accessJwt.includes(".")) {
    return json({ ok: false, error: "Session Animoa absente ou invalide." }, 401);
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser(accessJwt);
  const userId = userData?.user?.id;

  if (userError || !userId) {
    console.error("Validation de session refusée :", userError);
    return json({ ok: false, error: "Votre session Animoa a expiré. Reconnectez-vous." }, 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");

  try {
    if (action === "connect") {
      const code = String(body.code || "");
      const redirectUri = String(body.redirectUri || "");
      if (!code || !redirectUri) return json({ ok: false, error: "Code Google manquant." }, 400);

      const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
      const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.access_token) {
        throw new Error(tokens.error_description || "Google a refusé la connexion.");
      }
      if (!tokens.refresh_token) {
        throw new Error("Google n’a pas fourni d’autorisation durable. Retirez l’accès Animoa de votre compte Google puis recommencez.");
      }

      const accessToken = String(tokens.access_token);
      const info = await googleJson("https://openidconnect.googleapis.com/v1/userinfo", accessToken).catch(() => ({}));

      const { data: pref } = await supabaseAdmin
        .from("calendar_preferences")
        .select("google_calendar_id")
        .eq("user_id", userId)
        .maybeSingle();

      let calendarId = pref?.google_calendar_id || "";
      if (!calendarId) {
        const cal = await googleJson(`${CALENDAR_API}/calendars`, accessToken, {
          method: "POST",
          body: JSON.stringify({
            summary: "Animoa 🐾",
            description: "Rendez-vous et rappels enregistrés depuis Animoa.",
            timeZone: "Europe/Paris",
          }),
        });
        calendarId = String(cal.id);
      }

      const { error: saveError } = await supabaseAdmin.rpc("save_google_calendar_connection", {
        p_user_id: userId,
        p_refresh_token: String(tokens.refresh_token),
        p_google_account_email: typeof info?.email === "string" ? info.email : null,
        p_granted_scopes: [SCOPE],
      });
      if (saveError) throw saveError;

      const { error: prefError } = await supabaseAdmin.from("calendar_preferences").upsert({
        user_id: userId,
        provider: "google",
        is_connected: true,
        auto_sync: true,
        google_calendar_id: calendarId,
        google_calendar_name: "Animoa 🐾",
        permission_requested_at: new Date().toISOString(),
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      }, { onConflict: "user_id" });
      if (prefError) throw prefError;

      return json({ ok: true, connected: true, calendarId, calendarName: "Animoa 🐾" });
    }

    if (action === "disconnect") {
      await supabaseAdmin.rpc("delete_google_calendar_connection", { p_user_id: userId });
      await supabaseAdmin
        .from("calendar_preferences")
        .update({ is_connected: false, disconnected_at: new Date().toISOString() })
        .eq("user_id", userId);
      return json({ ok: true });
    }

    const { data: rows, error: connectionError } = await supabaseAdmin.rpc(
      "get_google_calendar_connection",
      { p_user_id: userId },
    );
    if (connectionError) throw connectionError;

    const connection = Array.isArray(rows) ? rows[0] : rows;
    if (!connection?.refresh_token) {
      return json({ ok: false, error: "Google Agenda doit être reconnecté." }, 401);
    }

    const accessToken = await refreshAccessToken(String(connection.refresh_token));
    const { data: pref, error: prefError } = await supabaseAdmin
      .from("calendar_preferences")
      .select("google_calendar_id")
      .eq("user_id", userId)
      .single();

    if (prefError || !pref?.google_calendar_id) throw new Error("Calendrier Animoa introuvable.");
    const calendarId = encodeURIComponent(pref.google_calendar_id);

    if (action === "sync") {
      const eventId = String(body.eventId || "");
      const eventPayload = body.event;
      if (!eventPayload) return json({ ok: false, error: "Rendez-vous manquant." }, 400);

      const url = eventId
        ? `${CALENDAR_API}/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`
        : `${CALENDAR_API}/calendars/${calendarId}/events`;

      const event = await googleJson(url, accessToken, {
        method: eventId ? "PATCH" : "POST",
        body: JSON.stringify(eventPayload),
      });

      await supabaseAdmin.from("calendar_event_links").upsert({
        user_id: userId,
        source_id: String(body.sourceId || ""),
        source_type: "appointment",
        provider: "google",
        external_calendar_id: pref.google_calendar_id,
        external_event_id: event.id,
        sync_status: "synced",
        last_error: null,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: "user_id,source_type,source_id,provider" });

      return json({ ok: true, eventId: event.id, htmlLink: event.htmlLink || "" });
    }

    if (action === "delete") {
      const eventId = String(body.eventId || "");
      if (eventId) {
        await googleJson(
          `${CALENDAR_API}/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`,
          accessToken,
          { method: "DELETE" },
        ).catch((error) => {
          if (!String(error.message).includes("404")) throw error;
        });
      }

      await supabaseAdmin
        .from("calendar_event_links")
        .delete()
        .eq("user_id", userId)
        .eq("source_id", String(body.sourceId || ""));

      return json({ ok: true });
    }

    return json({ ok: false, error: "Action inconnue." }, 400);
  } catch (error) {
    console.error("google-calendar-connect", error);
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "Erreur Google Agenda.",
    }, 500);
  }
});

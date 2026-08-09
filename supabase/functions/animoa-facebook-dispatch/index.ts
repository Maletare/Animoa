import { withSupabase } from "npm:@supabase/server@^1";

const GRAPH_API = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v26.0";
const BUCKET = "animoa-facebook-publications";
const SUPPORT_EMAIL = "contact@animoa.fr";
const DAY_MS = 86_400_000;

class HttpError extends Error {
  status: number;
  graphCode: number;
  graphSubcode: number;
  uncertain: boolean;
  constructor(status: number, message: string, graphCode = 0, graphSubcode = 0, uncertain = false) {
    super(message);
    this.status = status;
    this.graphCode = graphCode;
    this.graphSubcode = graphSubcode;
    this.uncertain = uncertain;
  }
}

function env(name: string, fallback = ""): string {
  return (Deno.env.get(name) || fallback).trim();
}

function safeString(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function constantTimeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function graphVersion(): string {
  const raw = env("META_GRAPH_API_VERSION", DEFAULT_API_VERSION);
  return /^v\d+\.\d+$/.test(raw) ? raw : DEFAULT_API_VERSION;
}

function facebookConfig() {
  return {
    pageId: env("FACEBOOK_PAGE_ID"),
    pageToken: env("FACEBOOK_PAGE_ACCESS_TOKEN"),
    version: graphVersion(),
    dataAccessExpiresAt: env("FACEBOOK_DATA_ACCESS_EXPIRES_AT"),
  };
}

async function graphJson(url: string, token: string, init: RequestInit = {}): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
    });
  } catch (error) {
    throw new HttpError(502, `Connexion à Facebook impossible : ${safeString(error instanceof Error ? error.message : error, 300) || "erreur réseau"}.`, 0, 0, true);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const graphCode = Number(payload?.error?.code || 0);
    const graphSubcode = Number(payload?.error?.error_subcode || 0);
    const message = safeString(payload?.error?.message, 500) || `Facebook a répondu avec l’erreur ${response.status}.`;
    throw new HttpError(response.status || 502, message, graphCode, graphSubcode, response.status >= 500);
  }
  return payload;
}

async function sendBrevoExpiryReminder(expiresAt: Date): Promise<void> {
  const apiKey = env("BREVO_API_KEY");
  if (!apiKey) throw new Error("Le secret BREVO_API_KEY est absent.");
  const senderEmail = env("ANIMOA_SENDER_EMAIL", SUPPORT_EMAIL);
  const senderName = env("ANIMOA_SENDER_NAME", "Animoa");
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(expiresAt);

  const subject = "[Animoa] Connexion Facebook à renouveler dans 7 jours";
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${subject}</title></head>
<body style="margin:0;background:#f3f8f7;font-family:Arial,Helvetica,sans-serif;color:#173733">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f3f8f7"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;padding:28px;border:1px solid #dce9e7"><tr><td>
<div style="font-size:13px;font-weight:800;color:#087d78;text-transform:uppercase;letter-spacing:.08em">Animoa · Facebook</div>
<h1 style="margin:10px 0 12px;font-size:24px;color:#153b3a">Connexion Facebook à renouveler</h1>
<p style="margin:0 0 14px;line-height:1.6;color:#45605d">L’accès aux données de la Page Facebook Animoa arrive à échéance dans environ 7 jours.</p>
<p style="margin:0 0 14px;line-height:1.6;color:#45605d"><strong>Échéance estimée :</strong> ${dateLabel}</p>
<p style="margin:0;line-height:1.6;color:#45605d">Ouvrez Administration → Publications Facebook dans Animoa. Le bandeau de connexion vous indiquera qu’un renouvellement est nécessaire. Pensez à renouveler l’accès avant l’échéance afin que les publications programmées continuent de partir automatiquement.</p>
</td></tr></table></td></tr></table></body></html>`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: SUPPORT_EMAIL, name: "Animoa" }],
      subject,
      htmlContent: html,
    }),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Brevo ${response.status}: ${text.slice(0, 500)}`);
}

async function maybeSendExpiryReminder(ctx: any): Promise<{ checked: boolean; sent: boolean; error?: string }> {
  const raw = env("FACEBOOK_DATA_ACCESS_EXPIRES_AT");
  const expiresAt = raw ? new Date(raw) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) return { checked: false, sent: false };

  const remainingMs = expiresAt.getTime() - Date.now();
  const days = Math.ceil(remainingMs / DAY_MS);
  if (remainingMs <= 0 || days > 7) return { checked: true, sent: false };

  const alertKey = `facebook-data-access-j7:${expiresAt.toISOString()}`;
  const { data: existing } = await ctx.supabaseAdmin
    .from("animoa_facebook_connection_alerts")
    .select("id,status,attempts,updated_at")
    .eq("alert_key", alertKey)
    .maybeSingle();

  if (existing?.status === "sent") return { checked: true, sent: false };
  if (existing?.status === "failed" && Number(existing.attempts || 0) >= 3) return { checked: true, sent: false };
  if (existing?.updated_at && Date.now() - new Date(existing.updated_at).getTime() < 6 * 60 * 60 * 1000) return { checked: true, sent: false };

  const now = new Date().toISOString();
  if (existing?.id) {
    await ctx.supabaseAdmin.from("animoa_facebook_connection_alerts").update({
      status: "processing",
      attempts: Number(existing.attempts || 0) + 1,
      last_error: null,
      updated_at: now,
    }).eq("id", existing.id);
  } else {
    const { error } = await ctx.supabaseAdmin.from("animoa_facebook_connection_alerts").insert({
      alert_key: alertKey,
      kind: "data_access_j7",
      expires_at: expiresAt.toISOString(),
      status: "processing",
      attempts: 1,
      updated_at: now,
    });
    if (error) return { checked: true, sent: false, error: safeString(error.message, 500) };
  }

  try {
    await sendBrevoExpiryReminder(expiresAt);
    await ctx.supabaseAdmin.from("animoa_facebook_connection_alerts").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("alert_key", alertKey);
    return { checked: true, sent: true };
  } catch (error) {
    const message = safeString(error instanceof Error ? error.message : error, 1000) || "Envoi du rappel impossible.";
    await ctx.supabaseAdmin.from("animoa_facebook_connection_alerts").update({
      status: "failed",
      last_error: message,
      updated_at: new Date().toISOString(),
    }).eq("alert_key", alertKey);
    return { checked: true, sent: false, error: message };
  }
}

async function recoverStalePublishing(ctx: any): Promise<number> {
  const staleBefore = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data, error } = await ctx.supabaseAdmin
    .from("animoa_facebook_publications")
    .update({
      status: "error",
      error_message: "L’envoi a été interrompu avant confirmation. Vérifiez la Page Facebook avant de relancer afin d’éviter un doublon.",
      publishing_started_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("status", "publishing")
    .lt("publishing_started_at", staleBefore)
    .select("id");
  if (error) throw error;
  return Array.isArray(data) ? data.length : 0;
}

async function publishClaimed(ctx: any, publication: any, config: ReturnType<typeof facebookConfig>): Promise<Record<string, unknown>> {
  if (!publication.image_path) throw new HttpError(409, "L’affiche finale est absente du stockage Animoa.");
  if (!publication.description) throw new HttpError(409, "La description Facebook est vide.");

  const { data: imageBlob, error: downloadError } = await ctx.supabaseAdmin.storage
    .from(BUCKET)
    .download(String(publication.image_path));
  if (downloadError || !imageBlob) throw new HttpError(502, "Impossible de récupérer l’affiche finale depuis le stockage Animoa.");

  const caption = [safeString(publication.description, 5000), safeString(publication.hashtags, 1200)]
    .filter(Boolean)
    .join("\n\n");
  const form = new FormData();
  form.append("caption", caption);
  form.append("published", "true");
  form.append("source", imageBlob, `animoa-facebook-${publication.id}.png`);

  const payload = await graphJson(
    `${GRAPH_API}/${config.version}/${encodeURIComponent(config.pageId)}/photos`,
    config.pageToken,
    { method: "POST", body: form },
  );
  const photoId = safeString(payload?.id, 120);
  const postId = safeString(payload?.post_id, 180) || photoId;
  let permalinkUrl = "";
  if (photoId) {
    try {
      const detail = await graphJson(
        `${GRAPH_API}/${config.version}/${encodeURIComponent(photoId)}?fields=permalink_url`,
        config.pageToken,
      );
      const candidate = safeString(detail?.permalink_url, 1000);
      if (candidate.startsWith("https://www.facebook.com/") || candidate.startsWith("https://facebook.com/")) permalinkUrl = candidate;
    } catch {}
  }

  const publishedAt = new Date().toISOString();
  const { error: updateError } = await ctx.supabaseAdmin
    .from("animoa_facebook_publications")
    .update({
      status: "published",
      facebook_post_id: postId || null,
      facebook_permalink_url: permalinkUrl || null,
      error_message: null,
      scheduled_at: null,
      publishing_started_at: null,
      published_at: publishedAt,
      updated_at: publishedAt,
    })
    .eq("id", publication.id)
    .eq("status", "publishing");
  if (updateError) {
    throw new HttpError(500, `Facebook a accepté la publication${postId ? ` (${postId})` : ""}, mais Animoa n’a pas pu enregistrer la confirmation.`, 0, 0, true);
  }
  return { id: publication.id, postId, permalinkUrl, publishedAt };
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if (request.method !== "POST") return json({ ok: false, error: "Méthode non autorisée." }, 405);
    const expected = env("ANIMOA_CRON_SECRET");
    const provided = request.headers.get("x-animoa-cron-secret") || "";
    if (!expected || !constantTimeEqual(expected, provided)) return json({ ok: false, error: "Accès refusé." }, 401);

    const stats = { claimed: 0, published: 0, failed: 0, staleRecovered: 0 };
    const failures: Array<{ id: string; error: string; connectionIssue: boolean }> = [];
    const reminder = await maybeSendExpiryReminder(ctx).catch((error) => ({ checked: true, sent: false, error: safeString(error instanceof Error ? error.message : error, 500) }));

    try {
      stats.staleRecovered = await recoverStalePublishing(ctx);
      const config = facebookConfig();
      if (!config.pageId || !config.pageToken) {
        return json({ ok: false, error: "Secrets Facebook incomplets.", stats, reminder }, 503);
      }

      const expiresAt = config.dataAccessExpiresAt ? new Date(config.dataAccessExpiresAt) : null;
      if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
        return json({ ok: false, error: "L’accès aux données Facebook est arrivé à échéance. Renouvelez la connexion avant les prochains envois.", stats, reminder }, 503);
      }

      const { data: claimed, error: claimError } = await ctx.supabaseAdmin.rpc("claim_animoa_facebook_publications", { p_limit: 5 });
      if (claimError) throw claimError;
      const rows = Array.isArray(claimed) ? claimed : [];
      stats.claimed = rows.length;

      for (const publication of rows) {
        try {
          await publishClaimed(ctx, publication, config);
          stats.published += 1;
        } catch (error) {
          stats.failed += 1;
          const message = safeString(error instanceof Error ? error.message : error, 1000) || "Publication Facebook impossible.";
          const graphCode = error instanceof HttpError ? error.graphCode : 0;
          const connectionIssue = graphCode === 190 || graphCode === 102;
          const uncertain = error instanceof HttpError ? error.uncertain : false;
          const storedMessage = uncertain
            ? `Envoi Facebook non confirmé. Vérifiez la Page avant de relancer pour éviter un doublon. Détail : ${message}`
            : (connectionIssue ? `Connexion Facebook à renouveler : ${message}` : message);
          failures.push({ id: String(publication.id), error: storedMessage, connectionIssue });
          await ctx.supabaseAdmin
            .from("animoa_facebook_publications")
            .update({
              status: "error",
              error_message: storedMessage,
              publishing_started_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", publication.id)
            .eq("status", "publishing");
        }
      }

      return json({ ok: true, stats, failures, reminder, apiVersion: config.version, now: new Date().toISOString() });
    } catch (error) {
      console.error("animoa-facebook-dispatch", error);
      return json({ ok: false, error: safeString(error instanceof Error ? error.message : error, 1000) || "Répartiteur Facebook indisponible.", stats, failures, reminder }, 500);
    }
  }),
};

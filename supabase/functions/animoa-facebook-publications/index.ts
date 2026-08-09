import { withSupabase } from "npm:@supabase/server@^1";

const GRAPH_API = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v26.0";
const BUCKET = "animoa-facebook-publications";
const DAY_MS = 86_400_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

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

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}

function safeString(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function graphVersion(): string {
  const raw = safeString(Deno.env.get("META_GRAPH_API_VERSION"), 20) || DEFAULT_API_VERSION;
  return /^v\d+\.\d+$/.test(raw) ? raw : DEFAULT_API_VERSION;
}

function facebookConfig(): { pageId: string; pageToken: string; version: string; dataAccessExpiresAt: string } {
  return {
    pageId: safeString(Deno.env.get("FACEBOOK_PAGE_ID"), 80),
    pageToken: safeString(Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN"), 2000),
    version: graphVersion(),
    dataAccessExpiresAt: safeString(Deno.env.get("FACEBOOK_DATA_ACCESS_EXPIRES_AT"), 80),
  };
}

function dataAccessInfo(raw: string): {
  dataAccessExpiresAt: string;
  dataAccessDaysRemaining: number | null;
  dataAccessAlertLevel: "unknown" | "ok" | "warning" | "urgent" | "critical" | "expired";
} {
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { dataAccessExpiresAt: "", dataAccessDaysRemaining: null, dataAccessAlertLevel: "unknown" };
  }
  const remainingMs = parsed.getTime() - Date.now();
  const days = Math.ceil(remainingMs / DAY_MS);
  const level = remainingMs <= 0
    ? "expired"
    : days <= 3
      ? "critical"
      : days <= 7
        ? "urgent"
        : days <= 14
          ? "warning"
          : "ok";
  return {
    dataAccessExpiresAt: parsed.toISOString(),
    dataAccessDaysRemaining: days,
    dataAccessAlertLevel: level,
  };
}

async function requireAdmin(ctx: any, userId: string): Promise<void> {
  const { data, error } = await ctx.supabaseAdmin
    .from("animoa_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(403, "Cette rubrique est réservée au compte administrateur Animoa.");
}

async function graphJson(url: string, token: string, init: RequestInit = {}): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
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

async function pageStatus(): Promise<Record<string, unknown>> {
  const config = facebookConfig();
  const access = dataAccessInfo(config.dataAccessExpiresAt);
  if (!config.pageId || !config.pageToken) {
    return {
      configured: false,
      pageName: "",
      pageId: config.pageId,
      apiVersion: config.version,
      connectionError: "Les secrets Facebook de la Page Animoa sont incomplets.",
      connectionIssue: true,
      ...access,
    };
  }

  try {
    const payload = await graphJson(
      `${GRAPH_API}/${config.version}/${encodeURIComponent(config.pageId)}?fields=id,name`,
      config.pageToken,
    );
    return {
      configured: true,
      pageName: safeString(payload?.name, 180) || "Animoa",
      pageId: safeString(payload?.id, 80) || config.pageId,
      apiVersion: config.version,
      connectionError: "",
      connectionIssue: false,
      ...access,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "La connexion Facebook ne répond pas.";
    const graphCode = error instanceof HttpError ? error.graphCode : 0;
    return {
      configured: false,
      pageName: "",
      pageId: config.pageId,
      apiVersion: config.version,
      connectionError: safeString(message, 700),
      connectionIssue: graphCode === 190 || graphCode === 102,
      ...access,
    };
  }
}

async function loadPublication(ctx: any, publicationId: string): Promise<any> {
  const { data, error } = await ctx.supabaseAdmin
    .from("animoa_facebook_publications")
    .select("*")
    .eq("id", publicationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Publication Facebook introuvable.");
  return data;
}

async function markPublishing(ctx: any, publication: any): Promise<any> {
  if (publication.status === "published") return publication;
  if (publication.status === "publishing") {
    throw new HttpError(409, "Cette publication est déjà en cours d’envoi vers Facebook.");
  }

  const now = new Date().toISOString();
  const { data, error } = await ctx.supabaseAdmin
    .from("animoa_facebook_publications")
    .update({
      status: "publishing",
      scheduled_at: null,
      publishing_started_at: now,
      last_publish_attempt_at: now,
      publish_attempts: Number(publication.publish_attempts || 0) + 1,
      error_message: null,
      updated_at: now,
    })
    .eq("id", publication.id)
    .neq("status", "published")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const fresh = await loadPublication(ctx, publication.id);
    if (fresh.status === "published") return fresh;
    throw new HttpError(409, "La publication a changé d’état. Rechargez l’historique avant de réessayer.");
  }
  return data;
}

async function publishPhoto(ctx: any, publicationId: string): Promise<Record<string, unknown>> {
  const config = facebookConfig();
  if (!config.pageId || !config.pageToken) {
    throw new HttpError(503, "La Page Facebook Animoa n’est pas configurée dans les secrets Supabase.");
  }
  const access = dataAccessInfo(config.dataAccessExpiresAt);
  if (access.dataAccessAlertLevel === "expired") {
    throw new HttpError(503, "L’accès aux données Facebook est arrivé à échéance. Renouvelez la connexion avant de publier.", 190);
  }

  let publication = await loadPublication(ctx, publicationId);
  if (publication.status === "published") {
    return {
      ok: true,
      alreadyPublished: true,
      postId: safeString(publication.facebook_post_id, 180),
      permalinkUrl: safeString(publication.facebook_permalink_url, 1000),
      publishedAt: publication.published_at || "",
      apiVersion: config.version,
    };
  }
  if (!publication.image_path) throw new HttpError(409, "L’affiche finale n’a pas encore été enregistrée.");
  if (!publication.description) throw new HttpError(409, "La description Facebook est vide.");

  publication = await markPublishing(ctx, publication);
  if (publication.status === "published") {
    return {
      ok: true,
      alreadyPublished: true,
      postId: safeString(publication.facebook_post_id, 180),
      permalinkUrl: safeString(publication.facebook_permalink_url, 1000),
      publishedAt: publication.published_at || "",
      apiVersion: config.version,
    };
  }

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
  form.append("source", imageBlob, `animoa-facebook-${publicationId}.png`);

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
    } catch {
      // L’envoi Facebook a réussi. L’absence de lien ne doit pas transformer le succès en erreur.
    }
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
    .eq("id", publicationId);
  if (updateError) {
    throw new HttpError(500, `Facebook a accepté la publication${postId ? ` (${postId})` : ""}, mais Animoa n’a pas pu enregistrer la confirmation.`, 0, 0, true);
  }

  return { ok: true, photoId, postId, permalinkUrl, publishedAt, apiVersion: config.version };
}

const authenticatedHandler = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method !== "POST") return json({ ok: false, error: "Méthode non autorisée." }, 405);
  const userId = safeString(ctx.userClaims?.sub || ctx.userClaims?.id, 80);
  if (!userId) return json({ ok: false, error: "Compte Animoa introuvable." }, 401);

  let publicationId = "";
  try {
    await requireAdmin(ctx, userId);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = safeString(body.action, 40);

    if (action === "status") {
      const status = await pageStatus();
      return json({ ok: true, ...status });
    }

    if (action === "publish") {
      publicationId = safeString(body.publicationId, 80);
      if (!publicationId) throw new HttpError(400, "Identifiant de publication manquant.");
      const result = await publishPhoto(ctx, publicationId);
      return json(result);
    }

    throw new HttpError(400, "Action inconnue.");
  } catch (error) {
    console.error("animoa-facebook-publications", error);
    const message = error instanceof Error ? error.message : "La publication Facebook est indisponible.";
    const graphCode = error instanceof HttpError ? error.graphCode : 0;
    const graphSubcode = error instanceof HttpError ? error.graphSubcode : 0;
    const uncertain = error instanceof HttpError ? error.uncertain : false;
    const storedMessage = uncertain
      ? `Envoi Facebook non confirmé. Vérifiez la Page avant de relancer pour éviter un doublon. Détail : ${message}`
      : message;
    if (publicationId) {
      try {
        const current = await loadPublication(ctx, publicationId);
        if (current.status !== "published") {
          await ctx.supabaseAdmin
            .from("animoa_facebook_publications")
            .update({
              status: "error",
              error_message: safeString(storedMessage, 1000),
              publishing_started_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", publicationId);
        }
      } catch {}
    }
    const status = error instanceof HttpError ? error.status : 500;
    return json({
      ok: false,
      error: storedMessage,
      uncertain,
      connectionIssue: graphCode === 190 || graphCode === 102,
      graphCode: graphCode || null,
      graphSubcode: graphSubcode || null,
    }, status);
  }
});

export default {
  fetch: async (request: Request) => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    return authenticatedHandler(request);
  },
};

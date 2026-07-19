import { withSupabase } from "npm:@supabase/server@^1";

const SUPPORT_EMAIL = "contact@animoa.fr";
const MAX_MESSAGE_LENGTH = 4000;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const recentRequests = new Map<string, number[]>();

type Screenshot = {
  name?: unknown;
  type?: unknown;
  content?: unknown;
};

function env(name: string, fallback = ""): string {
  return (Deno.env.get(name) || fallback).trim();
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function response(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}

function validEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254;
}

function allowedCategory(value: string): string {
  const categories = new Set([
    "Question",
    "Problème technique",
    "Suggestion",
    "Compte et données",
    "Autre",
  ]);
  return categories.has(value) ? value : "Autre";
}

function cleanFileName(value: string): string {
  const safe = value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90);
  return safe || "capture-animoa.png";
}

function decodeBase64Size(content: string): number {
  const padding = content.endsWith("==") ? 2 : content.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor(content.length * 3 / 4) - padding);
}

function parseScreenshot(value: unknown): { name: string; type: string; content: string } | null {
  if (!value || typeof value !== "object") return null;
  const screenshot = value as Screenshot;
  const name = cleanFileName(safeString(screenshot.name));
  const type = safeString(screenshot.type).toLowerCase();
  const content = safeString(screenshot.content).replace(/\s/g, "");

  if (!content) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
    throw new Error("La capture doit être une image JPG, PNG ou WebP.");
  }
  if (!/^[a-zA-Z0-9+/]+={0,2}$/.test(content)) {
    throw new Error("La capture est invalide.");
  }
  if (decodeBase64Size(content) > MAX_ATTACHMENT_BYTES) {
    throw new Error("La capture dépasse 2 Mo.");
  }

  return { name, type, content };
}

function rateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (recentRequests.get(userId) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    recentRequests.set(userId, recent);
    return false;
  }
  recent.push(now);
  recentRequests.set(userId, recent);
  return true;
}

async function sendBrevoEmail(params: {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  replyEmail: string;
  subject: string;
  html: string;
  attachment: { name: string; content: string } | null;
}) {
  const payload: Record<string, unknown> = {
    sender: { name: params.senderName, email: params.senderEmail },
    to: [{ email: SUPPORT_EMAIL, name: "Support Animoa" }],
    replyTo: { email: params.replyEmail },
    subject: params.subject,
    htmlContent: params.html,
  };

  if (params.attachment) {
    payload.attachment = [{
      name: params.attachment.name,
      content: params.attachment.content,
    }];
  }

  const result = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": params.apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await result.text();
  if (!result.ok) {
    throw new Error(`Brevo ${result.status}: ${text.slice(0, 500)}`);
  }
}

const authenticatedHandler = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method !== "POST") return response({ error: "Méthode non autorisée." }, 405);

  try {
    const userId = safeString(ctx.userClaims?.id);
    const accountEmail = safeString(ctx.userClaims?.email);
    if (!userId || !accountEmail) return response({ error: "Compte utilisateur introuvable." }, 401);
    if (!rateLimit(userId)) return response({ error: "Trop de messages ont été envoyés. Réessaie dans quelques minutes." }, 429);

    const body = await request.json() as Record<string, unknown>;
    const category = allowedCategory(safeString(body.category));
    const replyEmail = safeString(body.replyEmail) || accountEmail;
    const message = safeString(body.message);
    const appVersion = safeString(body.appVersion).slice(0, 30) || "inconnue";
    const screenshot = parseScreenshot(body.screenshot);

    if (!validEmail(replyEmail)) return response({ error: "L’adresse e-mail n’est pas valide." }, 400);
    if (message.length < 10) return response({ error: "Le message doit contenir au moins 10 caractères." }, 400);
    if (message.length > MAX_MESSAGE_LENGTH) return response({ error: "Le message est trop long." }, 400);

    const brevoApiKey = env("BREVO_API_KEY");
    if (!brevoApiKey) throw new Error("Le secret BREVO_API_KEY est absent.");

    const senderEmail = env("ANIMOA_SENDER_EMAIL", SUPPORT_EMAIL);
    const senderName = env("ANIMOA_SENDER_NAME", "Animoa");
    const subject = `[Animoa · ${category}] Message de ${replyEmail}`;
    const sentAt = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(new Date());

    const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f3f8f7;font-family:Arial,Helvetica,sans-serif;color:#173733">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f3f8f7"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:650px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 12px 38px rgba(23,55,51,.10)">
      <tr><td style="padding:26px 30px;background:#173733;color:#fff"><div style="font-size:25px;font-weight:800">Nouveau message Animoa</div><div style="margin-top:6px;color:#aee8e2">${escapeHtml(category)}</div></td></tr>
      <tr><td style="padding:28px 30px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">
          <tr><td style="padding:7px 0;color:#687976;width:145px">Adresse de réponse</td><td style="padding:7px 0;font-weight:700">${escapeHtml(replyEmail)}</td></tr>
          <tr><td style="padding:7px 0;color:#687976">Compte Animoa</td><td style="padding:7px 0;font-weight:700">${escapeHtml(accountEmail)}</td></tr>
          <tr><td style="padding:7px 0;color:#687976">Identifiant utilisateur</td><td style="padding:7px 0">${escapeHtml(userId)}</td></tr>
          <tr><td style="padding:7px 0;color:#687976">Version</td><td style="padding:7px 0">${escapeHtml(appVersion)}</td></tr>
          <tr><td style="padding:7px 0;color:#687976">Envoyé le</td><td style="padding:7px 0">${escapeHtml(sentAt)}</td></tr>
        </table>
        <div style="margin-top:22px;padding:20px;border:1px solid #d9efec;border-radius:16px;background:#f5fbfa;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
        <p style="margin:22px 0 0;color:#81908d;font-size:12px">Réponds directement à cet e-mail : la réponse sera adressée à l’utilisateur.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

    await sendBrevoEmail({
      apiKey: brevoApiKey,
      senderEmail,
      senderName,
      replyEmail,
      subject,
      html,
      attachment: screenshot ? { name: screenshot.name, content: screenshot.content } : null,
    });

    return response({ ok: true });
  } catch (error) {
    console.error("contact-animoa", error);
    return response({ error: error instanceof Error ? error.message : "Envoi impossible." }, 500);
  }
});

export default {
  fetch: async (request: Request) => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    return authenticatedHandler(request);
  },
};

import { withSupabase } from "npm:@supabase/server@^1";
import webpush from "npm:web-push@3.6.7";

type Payload = {
  action?: "config" | "subscribe" | "unsubscribe" | "test";
  endpoint?: string;
  timezone?: string;
  userAgent?: string;
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
};

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function env(name: string) {
  return (Deno.env.get(name) || "").trim();
}

function configureWebPush() {
  const publicKey = env("ANIMOA_VAPID_PUBLIC_KEY");
  const privateKey = env("ANIMOA_VAPID_PRIVATE_KEY");
  const subject = env("ANIMOA_VAPID_SUBJECT") || "mailto:contact@animoa.fr";
  if (!publicKey || !privateKey) throw new Error("Clés VAPID absentes.");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return publicKey;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (request, ctx) => {
    if (request.method !== "POST") return response({ ok: false, error: "Méthode non autorisée." }, 405);
    const userId = ctx.userClaims?.sub;
    if (!userId) return response({ ok: false, error: "Utilisateur non authentifié." }, 401);

    let payload: Payload = {};
    try { payload = await request.json(); } catch { return response({ ok: false, error: "Requête invalide." }, 400); }

    try {
      const publicKey = configureWebPush();
      if (payload.action === "config") return response({ ok: true, publicKey });

      if (payload.action === "subscribe") {
        const endpoint = String(payload.subscription?.endpoint || "").trim();
        const p256dh = String(payload.subscription?.keys?.p256dh || "").trim();
        const authKey = String(payload.subscription?.keys?.auth || "").trim();
        if (!endpoint || !p256dh || !authKey) return response({ ok: false, error: "Abonnement incomplet." }, 400);
        const { error } = await ctx.supabaseAdmin.from("animoa_push_subscriptions").upsert({
          user_id: userId,
          endpoint,
          p256dh,
          auth_key: authKey,
          user_agent: String(payload.userAgent || "").slice(0, 1000),
          timezone: String(payload.timezone || "Europe/Paris").slice(0, 100),
          enabled: true,
          last_seen_at: new Date().toISOString()
        }, { onConflict: "endpoint" });
        if (error) throw error;
        return response({ ok: true, subscribed: true });
      }

      if (payload.action === "unsubscribe") {
        const endpoint = String(payload.endpoint || "").trim();
        if (!endpoint) return response({ ok: false, error: "Appareil introuvable." }, 400);
        const { error } = await ctx.supabaseAdmin.from("animoa_push_subscriptions")
          .update({ enabled: false }).eq("user_id", userId).eq("endpoint", endpoint);
        if (error) throw error;
        return response({ ok: true, subscribed: false });
      }

      if (payload.action === "test") {
        const endpoint = String(payload.endpoint || "").trim();
        const { data: subscription, error } = await ctx.supabaseAdmin.from("animoa_push_subscriptions")
          .select("id,endpoint,p256dh,auth_key").eq("user_id", userId).eq("endpoint", endpoint).eq("enabled", true).maybeSingle();
        if (error || !subscription) return response({ ok: false, error: "Abonnement actif introuvable." }, 404);
        const message = {
          title: "Notifications Animoa activées 🐾",
          body: "Vous recevrez ici les rendez-vous, vaccins, traitements et anniversaires importants.",
          tag: "animoa-test",
          kind: "test",
          url: "/?page=home"
        };
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth_key }
        }, JSON.stringify(message), { TTL: 300, urgency: "normal" });
        await ctx.supabaseAdmin.from("animoa_push_deliveries").upsert({
          user_id: userId,
          subscription_id: subscription.id,
          notification_key: `test:${Date.now()}`,
          category: "test",
          title: message.title,
          body: message.body,
          status: "sent",
          sent_at: new Date().toISOString()
        });
        return response({ ok: true, sent: true });
      }

      return response({ ok: false, error: "Action inconnue." }, 400);
    } catch (error) {
      console.error("animoa-push-subscription", error);
      return response({ ok: false, error: error instanceof Error ? error.message : "Erreur serveur." }, 500);
    }
  })
};

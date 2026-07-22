import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const ALLOWED_ORIGINS = new Set([
  "https://animoa.fr",
  "https://www.animoa.fr",
  "http://127.0.0.1:3001",
  "http://localhost:3001",
]);

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://animoa.fr",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function jsonResponse(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Méthode non autorisée." }, 405);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) {
    return jsonResponse(request, { error: "Requête trop volumineuse." }, 413);
  }

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(request, { error: "Session administrateur absente." }, 401);
    }

    const accessToken = authorization.replace("Bearer ", "").trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey =
      Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !publishableKey) {
      console.error("Variables Supabase manquantes.");
      return jsonResponse(request, { error: "Configuration Supabase incomplète." }, 500);
    }

    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("Session utilisateur invalide :", userError);
      return jsonResponse(
        request,
        { error: "Votre session a expiré. Déconnectez-vous puis reconnectez-vous." },
        401,
      );
    }

    const { data: isAdmin, error: adminError } = await userClient.rpc(
      "is_animoa_admin",
    );

    if (adminError) {
      console.error("Vérification administrateur impossible :", adminError);
      return jsonResponse(
        request,
        { error: "Impossible de vérifier votre accès administrateur." },
        500,
      );
    }

    if (isAdmin !== true) {
      return jsonResponse(request, { error: "Accès réservé à l’administrateur." }, 403);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(request, { error: "Le contenu de la demande est invalide." }, 400);
    }

    const requestId = String(body.requestId || "").trim();
    const invitationCode = String(body.invitationCode || "").trim();

    if (!requestId || requestId.length > 100) {
      return jsonResponse(request, { error: "La demande d’accès est invalide." }, 400);
    }
    if (!invitationCode || invitationCode.length > 100) {
      return jsonResponse(request, { error: "Le code d’invitation est obligatoire." }, 400);
    }

    const { data: accessRequest, error: requestError } = await userClient
      .from("animoa_access_requests")
      .select("id, first_name, email, status")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError) {
      console.error("Lecture de la demande impossible :", requestError);
      return jsonResponse(
        request,
        { error: "Impossible de récupérer cette demande d’accès." },
        500,
      );
    }
    if (!accessRequest) {
      return jsonResponse(request, { error: "Demande d’accès introuvable." }, 404);
    }
    if (accessRequest.status === "accepte") {
      return jsonResponse(
        request,
        { error: "L’accès a déjà été envoyé pour cette demande." },
        409,
      );
    }

    const email = String(accessRequest.email || "").trim();
    const firstName = String(accessRequest.first_name || "").trim();
    if (!isValidEmail(email)) {
      return jsonResponse(request, { error: "Adresse e-mail invalide." }, 400);
    }

    const brevoApiKey = Deno.env.get("BREVO_ACCESS_API_KEY");
    const senderEmail = Deno.env.get("ANIMOA_EMAIL_FROM");
    const senderName = Deno.env.get("ANIMOA_EMAIL_FROM_NAME") || "Animoa";
    if (!brevoApiKey || !senderEmail) {
      console.error("Secrets Brevo incomplets.");
      return jsonResponse(request, { error: "Configuration d’envoi incomplète." }, 500);
    }

    const greetingName = firstName || "à vous";
    const safeFirstName = escapeHtml(greetingName);
    const safeCode = escapeHtml(invitationCode);

    const htmlContent = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Votre accès à Animoa</title></head>
<body style="margin:0;padding:0;background:#f4fbf9;font-family:Arial,Helvetica,sans-serif;color:#173b37">
  <div style="max-width:600px;margin:0 auto;padding:28px 16px">
    <div style="background:#fff;border-radius:24px;padding:32px 26px;box-shadow:0 12px 35px rgba(23,59,55,.10)">
      <div style="text-align:center;margin-bottom:26px">
        <div style="font-size:34px;font-weight:800;color:#28b9ac">Animoa</div>
        <div style="margin-top:5px;font-size:14px;color:#71827f">Toute sa vie, près de vous.</div>
      </div>
      <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3">Votre demande d’accès est acceptée</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Bonjour ${safeFirstName},</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Votre demande pour essayer Animoa a été acceptée.</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Utilisez le code d’invitation ci-dessous lors de votre inscription :</p>
      <div style="margin:24px 0;padding:18px 12px;text-align:center;background:#e7f7f4;border-radius:16px;font-size:25px;font-weight:800;letter-spacing:3px;color:#147f77;overflow-wrap:anywhere">${safeCode}</div>
      <p style="margin:0 0 16px;padding:14px 16px;border-radius:14px;background:#fff6ef;font-size:15px;line-height:1.6;color:#5d514b"><strong>Ce code vous sera demandé une seule fois</strong>, lors de votre première inscription, afin d’activer votre accès à Animoa. Ensuite, vous vous connecterez normalement avec votre adresse e-mail et votre mot de passe.</p>
      <div style="margin:28px 0;text-align:center"><a href="https://animoa.fr" style="display:inline-block;padding:15px 24px;border-radius:14px;background:#17867c;color:#fff;text-decoration:none;font-size:16px;font-weight:700">Accéder à Animoa</a></div>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#617873">Ce code est personnel. Merci de ne pas le diffuser.</p>
      <p style="margin:0;font-size:16px;line-height:1.6">À bientôt sur Animoa.</p>
    </div>
  </div>
</body></html>`;

    const textContent = [
      `Bonjour ${greetingName},`,
      "",
      "Votre demande pour essayer Animoa a été acceptée.",
      "",
      "Votre code d’invitation :",
      invitationCode,
      "",
      "Ce code vous sera demandé une seule fois lors de votre première inscription afin d’activer votre accès à Animoa.",
      "Ensuite, vous vous connecterez normalement avec votre adresse e-mail et votre mot de passe.",
      "",
      "Accédez à Animoa : https://animoa.fr",
      "",
      "Ce code est personnel. Merci de ne pas le diffuser.",
      "",
      "À bientôt sur Animoa.",
    ].join("\n");

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, ...(firstName ? { name: firstName } : {}) }],
        subject: "Votre demande d’accès à Animoa est acceptée",
        htmlContent,
        textContent,
        tags: ["animoa", "demande-acces"],
      }),
    });

    const brevoResult = await brevoResponse.json().catch(() => ({}));
    if (!brevoResponse.ok) {
      console.error("Erreur Brevo :", brevoResponse.status, brevoResult);
      return jsonResponse(request, { error: "Brevo n’a pas pu envoyer l’e-mail." }, 502);
    }

    const { error: updateError } = await userClient
      .from("animoa_access_requests")
      .update({ status: "accepte", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateError) {
      console.error("E-mail envoyé, statut non actualisé :", updateError);
      return jsonResponse(request, {
        success: true,
        warning: "L’e-mail a été envoyé, mais le statut n’a pas pu être actualisé.",
        messageId:
          typeof brevoResult?.messageId === "string" ? brevoResult.messageId : null,
      });
    }

    return jsonResponse(request, {
      success: true,
      message: "L’accès a bien été envoyé par e-mail.",
      messageId:
        typeof brevoResult?.messageId === "string" ? brevoResult.messageId : null,
    });
  } catch (error) {
    console.error("send-access-email :", error);
    return jsonResponse(
      request,
      { error: "Une erreur inattendue est survenue pendant l’envoi." },
      500,
    );
  }
});

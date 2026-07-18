import { withSupabase } from "npm:@supabase/server@^1";

type JsonObject = Record<string, unknown>;

type UserBundle = {
  user_id: string;
  data: {
    pets?: Array<Record<string, unknown>>;
    health?: Array<Record<string, unknown>>;
  } | null;
  settings: {
    language?: string;
    timezone?: string;
  } | null;
};

const DEFAULT_TIME_ZONE = "Europe/Paris";
const DEFAULT_SEND_HOUR = 8;
const PAGE_SIZE = 500;
const MAX_ERROR_LENGTH = 1000;
const MAX_REPORTED_ERRORS = 50;

function env(name: string, fallback = ""): string {
  return (Deno.env.get(name) || fallback).trim();
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function jsonResponse(body: JsonObject, status = 200): Response {
  return Response.json(body, { status });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function constantTimeEqual(first: string, second: string): boolean {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

function validIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validTimeZone(value: string): boolean {
  if (!value) return false;

  try {
    new Intl.DateTimeFormat("fr-FR", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function datePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function isoDateInTimeZone(date: Date, timeZone: string): string {
  const parts = datePartsInTimeZone(date, timeZone);

  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return result.toISOString().slice(0, 10);
}

function zonedDateTimeToUtc(
  dateValue: string,
  timeValue: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  let guess = targetAsUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const represented = datePartsInTimeZone(new Date(guess), timeZone);
    const representedAsUtc = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute,
      0,
    );

    const correction = targetAsUtc - representedAsUtc;
    guess += correction;

    if (correction === 0) break;
  }

  return new Date(guess);
}

function eventIsDue(
  event: Record<string, unknown>,
  now: Date,
  timeZone: string,
  sendHour: number,
): boolean {
  const eventDate = safeString(event.date);
  if (!validIsoDate(eventDate)) return false;

  const eventTime = safeString(event.time);

  // Compatible avec une future heure d'événement au format HH:MM.
  if (validTime(eventTime)) {
    const eventUtc = zonedDateTimeToUtc(eventDate, eventTime, timeZone);
    const remainingMs = eventUtc.getTime() - now.getTime();

    return remainingMs > 0 && remainingMs <= 24 * 60 * 60 * 1000;
  }

  // Animoa enregistre actuellement une date sans heure.
  // Le rappel part donc la veille à partir de l'heure configurée.
  const localNow = datePartsInTimeZone(now, timeZone);
  const today = isoDateInTimeZone(now, timeZone);
  const tomorrow = addDaysToIsoDate(today, 1);

  return eventDate === tomorrow && localNow.hour >= sendHour;
}

function formatEventDate(
  dateValue: string,
  language: string,
  timeZone: string,
): string {
  const locale = language === "en" ? "en-GB" : "fr-FR";
  const safeDate = new Date(`${dateValue}T12:00:00Z`);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone,
  }).format(safeDate);
}

function translatedEventType(value: string, language: string): string {
  if (language !== "en") return value;

  const translations: Record<string, string> = {
    Vaccin: "Vaccine",
    "Rendez-vous": "Appointment",
    Traitement: "Treatment",
    Médicament: "Medication",
    Analyse: "Test",
    Document: "Document",
    Autre: "Other",
  };

  return translations[value] || value;
}

function buildEmail(params: {
  language: string;
  petName: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  professional: string;
  note: string;
  appUrl: string;
  logoUrl: string;
  timeZone: string;
}) {
  const isEnglish = params.language === "en";
  const fallbackPet = isEnglish ? "your pet" : "votre animal";
  const fallbackTitle = isEnglish ? "Important event" : "Événement important";

  const plainPetName = params.petName || fallbackPet;
  const plainTitle = params.eventTitle || fallbackTitle;

  const petName = escapeHtml(plainPetName);
  const title = escapeHtml(plainTitle);
  const type = escapeHtml(
    translatedEventType(params.eventType, params.language),
  );
  const professional = escapeHtml(params.professional);
  const note = escapeHtml(params.note).replaceAll("\n", "<br>");
  const formattedDate = escapeHtml(
    formatEventDate(params.eventDate, params.language, params.timeZone),
  );
  const formattedTime = validTime(params.eventTime)
    ? escapeHtml(params.eventTime)
    : "";
  const appUrl = escapeHtml(params.appUrl);
  const logoUrl = escapeHtml(params.logoUrl);

  const subject = isEnglish
    ? `An important event is coming up for ${plainPetName}`
    : `Un événement important arrive bientôt pour ${plainPetName}`;

  const intro = isEnglish
    ? `A reminder has been scheduled for <strong>${petName}</strong>.`
    : `Un rappel a été programmé pour <strong>${petName}</strong>.`;

  const dateLabel = "Date";
  const timeLabel = isEnglish ? "Time" : "Heure";
  const typeLabel = isEnglish ? "Category" : "Catégorie";
  const professionalLabel = isEnglish ? "Professional" : "Professionnel";
  const noteLabel = isEnglish ? "Useful note" : "Note utile";
  const buttonLabel = isEnglish ? "Open Animoa" : "Ouvrir Animoa";

  const footer = isEnglish
    ? "This automatic reminder was sent because reminders are enabled for this event."
    : "Ce rappel automatique a été envoyé car les rappels sont activés pour cet événement.";

  const rows = [
    `<tr><td style="padding:8px 0;color:#687976;width:120px">${dateLabel}</td><td style="padding:8px 0;font-weight:700;color:#173733">${formattedDate}</td></tr>`,
    formattedTime
      ? `<tr><td style="padding:8px 0;color:#687976">${timeLabel}</td><td style="padding:8px 0;font-weight:700;color:#173733">${formattedTime}</td></tr>`
      : "",
    type
      ? `<tr><td style="padding:8px 0;color:#687976">${typeLabel}</td><td style="padding:8px 0;font-weight:700;color:#173733">${type}</td></tr>`
      : "",
    professional
      ? `<tr><td style="padding:8px 0;color:#687976">${professionalLabel}</td><td style="padding:8px 0;font-weight:700;color:#173733">${professional}</td></tr>`
      : "",
    note
      ? `<tr><td style="padding:8px 0;color:#687976;vertical-align:top">${noteLabel}</td><td style="padding:8px 0;color:#173733;line-height:1.5">${note}</td></tr>`
      : "",
  ].join("");

  const html = `<!doctype html>
<html lang="${isEnglish ? "en" : "fr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;background:#f3f8f7;font-family:Arial,Helvetica,sans-serif;color:#173733">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(subject)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f8f7;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(23,55,51,.10)">
          <tr>
            <td align="center" style="padding:30px 26px 18px">
              <img src="${logoUrl}" width="230" alt="Animoa" style="display:block;max-width:75%;height:auto;border:0">
            </td>
          </tr>
          <tr>
            <td style="padding:8px 34px 34px">
              <div style="display:inline-block;background:#e4f8f5;color:#118d84;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">
                ${isEnglish ? "Reminder · 24 hours" : "Rappel · 24 heures"}
              </div>

              <h1 style="font-size:28px;line-height:1.2;margin:18px 0 10px;color:#173733">
                ${escapeHtml(subject)}
              </h1>

              <p style="font-size:16px;line-height:1.65;margin:0 0 22px;color:#526763">
                ${intro}
              </p>

              <div style="background:#f5fbfa;border:1px solid #d9efec;border-radius:18px;padding:20px 22px">
                <div style="font-size:20px;font-weight:800;color:#173733;margin-bottom:8px">
                  ${title}
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px">
                  ${rows}
                </table>
              </div>

              <div style="text-align:center;margin:28px 0 10px">
                <a href="${appUrl}" style="display:inline-block;background:#23b9ad;color:#ffffff;text-decoration:none;font-weight:800;border-radius:14px;padding:14px 24px">
                  ${buttonLabel}
                </a>
              </div>

              <p style="font-size:12px;line-height:1.55;margin:24px 0 0;color:#81908d;text-align:center">
                ${footer}<br>
                Animoa — ${isEnglish ? "Their whole life, close to you." : "Toute sa vie, près de vous."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

async function sendBrevoEmail(params: {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": params.apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: params.senderName,
        email: params.senderEmail,
      },
      to: [{
        email: params.recipientEmail,
        name: params.recipientName || params.recipientEmail,
      }],
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  const responseText = await response.text();
  let responseBody: Record<string, unknown> = {};

  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseBody = { raw: responseText };
  }

  if (!response.ok) {
    throw new Error(
      `Brevo ${response.status}: ${JSON.stringify(responseBody).slice(0, MAX_ERROR_LENGTH)}`,
    );
  }

  return responseBody;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Méthode non autorisée." }, 405);
    }

    try {
      const expectedCronSecret = env("ANIMOA_CRON_SECRET");
      const providedCronSecret =
        request.headers.get("x-animoa-cron-secret") || "";

      if (
        !expectedCronSecret ||
        !constantTimeEqual(providedCronSecret, expectedCronSecret)
      ) {
        return jsonResponse({ error: "Accès refusé." }, 401);
      }

      let body: Record<string, unknown> = {};

      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const dryRun = body.dryRun === true;
      const now = new Date();
      const brevoApiKey = env("BREVO_API_KEY");
      const appUrl = env("ANIMOA_APP_URL", "https://animoa.fr")
        .replace(/\/+$/, "");
      const senderEmail = env(
        "ANIMOA_SENDER_EMAIL",
        "contact@animoa.fr",
      );
      const senderName = env("ANIMOA_SENDER_NAME", "Animoa");
      const logoUrl = env(
        "ANIMOA_LOGO_URL",
        `${appUrl}/assets/animoa-logo-email.png`,
      );

      const configuredHour = Number(
        env("ANIMOA_REMINDER_SEND_HOUR", String(DEFAULT_SEND_HOUR)),
      );

      const sendHour =
        Number.isInteger(configuredHour) &&
          configuredHour >= 0 &&
          configuredHour <= 23
          ? configuredHour
          : DEFAULT_SEND_HOUR;

      if (!dryRun && !brevoApiKey) {
        throw new Error("Le secret BREVO_API_KEY est absent.");
      }

      const supabase = ctx.supabaseAdmin;

      const stats = {
        function: "animoa-reminders-24h",
        dryRun,
        scannedUsers: 0,
        scannedEvents: 0,
        dueEvents: 0,
        wouldSend: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        errors: [] as Array<Record<string, string>>,
      };

      const reportError = (details: Record<string, string>) => {
        if (stats.errors.length < MAX_REPORTED_ERRORS) {
          stats.errors.push(details);
        }
      };

      for (let from = 0; ; from += PAGE_SIZE) {
        const { data: rows, error } = await supabase
          .from("animoa_user_data")
          .select("user_id,data,settings")
          .order("user_id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        const bundles = (rows || []) as UserBundle[];
        if (!bundles.length) break;

        for (const bundle of bundles) {
          stats.scannedUsers += 1;

          const health = Array.isArray(bundle.data?.health)
            ? bundle.data.health
            : [];

          const pets = Array.isArray(bundle.data?.pets)
            ? bundle.data.pets
            : [];

          const language = bundle.settings?.language === "en" ? "en" : "fr";
          const configuredTimeZone = safeString(bundle.settings?.timezone);
          const timeZone = validTimeZone(configuredTimeZone)
            ? configuredTimeZone
            : DEFAULT_TIME_ZONE;

          const dueEvents = health.filter((event) => {
            stats.scannedEvents += 1;

            return safeString(event.status) === "planned" &&
              event.reminder === true &&
              eventIsDue(event, now, timeZone, sendHour);
          });

          if (!dueEvents.length) continue;
          stats.dueEvents += dueEvents.length;

          const { data: userResult, error: userError } =
            await supabase.auth.admin.getUserById(bundle.user_id);

          const user = userResult?.user;

          if (
            userError ||
            !user?.email ||
            !user.email_confirmed_at
          ) {
            stats.skipped += dueEvents.length;

            reportError({
              userId: bundle.user_id,
              error:
                userError?.message ||
                "Adresse e-mail absente ou non confirmée.",
            });

            continue;
          }

          const recipientEmail = user.email;
          const recipientName =
            safeString(user.user_metadata?.full_name) ||
            safeString(user.user_metadata?.name) ||
            recipientEmail.split("@")[0];

          for (const event of dueEvents) {
            const eventId = safeString(event.id);
            const eventDate = safeString(event.date);

            if (!eventId || !validIsoDate(eventDate)) {
              stats.skipped += 1;
              continue;
            }

            const petId = safeString(event.petId);

            const pet = pets.find(
              (candidate) => safeString(candidate.id) === petId,
            );

            const petName =
              safeString(pet?.name) ||
              (language === "en" ? "your pet" : "votre animal");

            const eventTitle =
              safeString(event.title) ||
              (language === "en"
                ? "Important event"
                : "Événement important");

            if (dryRun) {
              stats.wouldSend += 1;
              continue;
            }

            const { data: deliveryId, error: claimError } =
              await supabase.rpc("claim_animoa_reminder", {
                p_user_id: bundle.user_id,
                p_event_id: eventId,
                p_event_date: eventDate,
                p_event_title: eventTitle,
                p_reminder_kind: "24h",
              });

            if (claimError) {
              stats.failed += 1;

              reportError({
                userId: bundle.user_id,
                eventId,
                error: claimError.message,
              });

              continue;
            }

            if (!deliveryId) {
              stats.skipped += 1;
              continue;
            }

            try {
              const email = buildEmail({
                language,
                petName,
                eventTitle,
                eventType: safeString(event.type),
                eventDate,
                eventTime: safeString(event.time),
                professional: safeString(event.professional),
                note: safeString(event.note),
                appUrl,
                logoUrl,
                timeZone,
              });

              const brevoResult = await sendBrevoEmail({
                apiKey: brevoApiKey,
                senderName,
                senderEmail,
                recipientEmail,
                recipientName,
                subject: email.subject,
                html: email.html,
              });

              const { error: updateError } = await supabase
                .from("animoa_reminder_deliveries")
                .update({
                  status: "sent",
                  sent_at: new Date().toISOString(),
                  provider_message_id: safeString(
                    brevoResult.messageId,
                  ),
                  last_error: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deliveryId);

              if (updateError) throw updateError;
              stats.sent += 1;
            } catch (sendError) {
              const message = sendError instanceof Error
                ? sendError.message
                : String(sendError);

              await supabase
                .from("animoa_reminder_deliveries")
                .update({
                  status: "failed",
                  last_error: message.slice(0, MAX_ERROR_LENGTH),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deliveryId);

              stats.failed += 1;

              reportError({
                userId: bundle.user_id,
                eventId,
                error: message.slice(0, MAX_ERROR_LENGTH),
              });
            }
          }
        }

        if (bundles.length < PAGE_SIZE) break;
      }

      return jsonResponse(stats);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : String(error);

      console.error("[animoa-reminders-24h]", error);

      return jsonResponse({ error: message }, 500);
    }
  }),
};

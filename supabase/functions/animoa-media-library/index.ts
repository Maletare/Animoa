import { withSupabase } from "npm:@supabase/server@^1";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const OPENID_SCOPES = ["openid", "email", DRIVE_SCOPE];
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const ROOT_FOLDER_NAME = "ANIMOA - MÉDIATHÈQUE";
const MAX_RESULTS = 18;
const MAX_VIDEO_BYTES = 70 * 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type MediaItem = {
  source: "pexels" | "pixabay";
  sourceId: string;
  sourcePageUrl: string;
  creatorName: string;
  thumbnailUrl: string;
  videoUrl: string;
  width: number;
  height: number;
  duration: number;
  fileSize: number;
  orientation: "portrait" | "landscape" | "square";
  fileName: string;
  savedToDrive?: boolean;
  driveWebUrl?: string;
};

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}

function safeString(value: unknown, max = 180): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeNumber(value: unknown): number {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
}

function orientationOf(width: number, height: number): "portrait" | "landscape" | "square" {
  if (!width || !height) return "landscape";
  const ratio = width / height;
  if (ratio < 0.86) return "portrait";
  if (ratio > 1.16) return "landscape";
  return "square";
}

function slug(value: string, fallback = "media"): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 58);
  return cleaned || fallback;
}

function buildFileName(source: string, sourceId: string, species: string, theme: string): string {
  return `${slug(species, "animal")}_${slug(theme, "video")}_${source}_${slug(sourceId, "media")}.mp4`;
}

function safeHttpsUrl(value: unknown, allowedHosts?: RegExp): string {
  const raw = safeString(value, 2000);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    if (allowedHosts && !allowedHosts.test(url.hostname)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function fileScore(file: Record<string, unknown>, wanted: string): number {
  const width = safeNumber(file.width);
  const height = safeNumber(file.height);
  const size = safeNumber(file.file_size ?? file.size);
  const orientation = orientationOf(width, height);
  let score = orientation === wanted ? 100_000 : wanted === "all" ? 25_000 : 0;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  if (shortSide >= 720) score += 20_000;
  if (longSide >= 1080 && longSide <= 2200) score += 12_000;
  if (size && size <= MAX_VIDEO_BYTES) score += 10_000;
  if (size > MAX_VIDEO_BYTES) score -= 100_000;
  score -= Math.abs(longSide - 1920);
  return score;
}

function chooseFile(files: Record<string, unknown>[], wanted: string): Record<string, unknown> | null {
  const usable = files
    .filter((file) => safeHttpsUrl(file.link ?? file.url, /(^|\.)(pexels\.com|pixabay\.com)$/i))
    .filter((file) => {
      const size = safeNumber(file.file_size ?? file.size);
      return !size || size <= MAX_VIDEO_BYTES;
    })
    .sort((a, b) => fileScore(b, wanted) - fileScore(a, wanted));
  return usable[0] || null;
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

async function markSavedItems(ctx: any, items: MediaItem[]): Promise<MediaItem[]> {
  if (!items.length) return items;
  const sources = [...new Set(items.map((item) => item.source))];
  const ids = items.map((item) => item.sourceId);
  const { data } = await ctx.supabaseAdmin
    .from("animoa_media_library")
    .select("source,source_id,drive_web_url")
    .in("source", sources)
    .in("source_id", ids);
  const saved = new Map<string, string>((data || []).map((row: any) => [`${row.source}:${row.source_id}`, String(row.drive_web_url || "")]));
  return items.map((item) => ({
    ...item,
    savedToDrive: saved.has(`${item.source}:${item.sourceId}`),
    driveWebUrl: saved.get(`${item.source}:${item.sourceId}`) || "",
  }));
}

async function searchPexels(query: string, orientation: string, species: string, theme: string): Promise<MediaItem[]> {
  const apiKey = safeString(Deno.env.get("PEXELS_API_KEY"), 300);
  if (!apiKey) throw new HttpError(503, "La clé Pexels n’est pas encore configurée dans Supabase.");
  const params = new URLSearchParams({ query, per_page: "18", page: "1", locale: "fr-FR", size: "medium" });
  if (["portrait", "landscape", "square"].includes(orientation)) params.set("orientation", orientation);
  const response = await fetch(`https://api.pexels.com/v1/videos/search?${params}`, {
    headers: { Authorization: apiKey },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(response.status, safeString(payload?.error, 300) || `Pexels a répondu avec l’erreur ${response.status}.`);

  const items: MediaItem[] = [];
  for (const video of Array.isArray(payload?.videos) ? payload.videos : []) {
    const file = chooseFile(Array.isArray(video?.video_files) ? video.video_files : [], orientation);
    if (!file) continue;
    const videoUrl = safeHttpsUrl(file.link, /(^|\.)pexels\.com$/i);
    const sourcePageUrl = safeHttpsUrl(video.url, /(^|\.)pexels\.com$/i);
    const thumbnailUrl = safeHttpsUrl(video.image, /(^|\.)pexels\.com$/i);
    const width = safeNumber(file.width || video.width);
    const height = safeNumber(file.height || video.height);
    if (!videoUrl || !sourcePageUrl || !width || !height) continue;
    const sourceId = String(video.id || "");
    items.push({
      source: "pexels",
      sourceId,
      sourcePageUrl,
      creatorName: safeString(video?.user?.name, 120) || "Créateur Pexels",
      thumbnailUrl,
      videoUrl,
      width,
      height,
      duration: safeNumber(video.duration),
      fileSize: safeNumber(file.file_size),
      orientation: orientationOf(width, height),
      fileName: buildFileName("pexels", sourceId, species, theme),
    });
  }
  return items;
}

async function searchPixabay(query: string, orientation: string, species: string, theme: string): Promise<MediaItem[]> {
  const apiKey = safeString(Deno.env.get("PIXABAY_API_KEY"), 300);
  if (!apiKey) throw new HttpError(503, "La clé Pixabay n’est pas encore configurée dans Supabase.");
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    lang: "fr",
    category: "animals",
    video_type: "film",
    safesearch: "true",
    per_page: "20",
    page: "1",
  });
  const response = await fetch(`https://pixabay.com/api/videos/?${params}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(response.status, safeString(payload?.message, 300) || `Pixabay a répondu avec l’erreur ${response.status}.`);

  const items: MediaItem[] = [];
  for (const hit of Array.isArray(payload?.hits) ? payload.hits : []) {
    const variants = Object.values(hit?.videos || {}).filter(Boolean) as Record<string, unknown>[];
    const normalized = variants.map((variant) => ({
      ...variant,
      link: variant.url,
      file_size: variant.size,
    }));
    const file = chooseFile(normalized, orientation);
    if (!file) continue;
    const videoUrl = safeHttpsUrl(file.link, /(^|\.)pixabay\.com$/i);
    const sourcePageUrl = safeHttpsUrl(hit.pageURL, /(^|\.)pixabay\.com$/i);
    const thumbnailUrl = safeHttpsUrl(file.thumbnail || hit.userImageURL, /(^|\.)pixabay\.com$/i);
    const width = safeNumber(file.width);
    const height = safeNumber(file.height);
    if (!videoUrl || !sourcePageUrl || !width || !height) continue;
    const actualOrientation = orientationOf(width, height);
    if (orientation !== "all" && actualOrientation !== orientation) continue;
    const sourceId = String(hit.id || "");
    items.push({
      source: "pixabay",
      sourceId,
      sourcePageUrl,
      creatorName: safeString(hit.user, 120) || "Créateur Pixabay",
      thumbnailUrl,
      videoUrl,
      width,
      height,
      duration: safeNumber(hit.duration),
      fileSize: safeNumber(file.file_size),
      orientation: actualOrientation,
      fileName: buildFileName("pixabay", sourceId, species, theme),
    });
  }
  return items;
}

function interleave<T>(left: T[], right: T[]): T[] {
  const result: T[] = [];
  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    if (left[index]) result.push(left[index]);
    if (right[index]) result.push(right[index]);
  }
  return result;
}

async function exchangeGoogleCode(code: string, redirectUri: string): Promise<Record<string, any>> {
  const clientId = safeString(Deno.env.get("GOOGLE_CLIENT_ID"), 300);
  const clientSecret = safeString(Deno.env.get("GOOGLE_CLIENT_SECRET"), 300);
  if (!clientId || !clientSecret) throw new HttpError(503, "Les identifiants Google d’Animoa ne sont pas configurés.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new HttpError(400, safeString(payload.error_description, 400) || "Google a refusé la connexion Drive.");
  return payload;
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const clientId = safeString(Deno.env.get("GOOGLE_CLIENT_ID"), 300);
  const clientSecret = safeString(Deno.env.get("GOOGLE_CLIENT_SECRET"), 300);
  if (!clientId || !clientSecret) throw new HttpError(503, "Les identifiants Google d’Animoa ne sont pas configurés.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new HttpError(401, safeString(payload.error_description, 400) || "L’autorisation Google Drive a expiré.");
  return String(payload.access_token);
}

async function googleJson(url: string, accessToken: string, init: RequestInit = {}): Promise<any> {
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
  if (!response.ok) throw new HttpError(response.status, payload?.error?.message || `Google Drive a répondu avec l’erreur ${response.status}.`);
  return payload;
}

function escapeDriveQuery(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function findOrCreateFolder(accessToken: string, name: string, parentId?: string): Promise<{ id: string; webViewLink: string }> {
  const conditions = [
    `name = '${escapeDriveQuery(name)}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    "trashed = false",
  ];
  if (parentId) conditions.push(`'${escapeDriveQuery(parentId)}' in parents`);
  const params = new URLSearchParams({
    q: conditions.join(" and "),
    fields: "files(id,name,webViewLink)",
    spaces: "drive",
    pageSize: "10",
  });
  const list = await googleJson(`${DRIVE_API}/files?${params}`, accessToken);
  const existing = Array.isArray(list?.files) ? list.files[0] : null;
  if (existing?.id) return { id: String(existing.id), webViewLink: String(existing.webViewLink || `https://drive.google.com/drive/folders/${existing.id}`) };

  const folder = await googleJson(`${DRIVE_API}/files?fields=id,name,webViewLink`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  return { id: String(folder.id), webViewLink: String(folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`) };
}

async function ensureMediaFolder(ctx: any, userId: string, accessToken: string, species: string, theme: string): Promise<{ rootId: string; rootUrl: string; folderId: string }> {
  const { data: connection } = await ctx.supabaseAdmin
    .from("animoa_media_drive_connections")
    .select("root_folder_id,root_folder_url")
    .eq("user_id", userId)
    .maybeSingle();

  let rootId = safeString(connection?.root_folder_id, 300);
  let rootUrl = safeString(connection?.root_folder_url, 1000);
  if (!rootId) {
    const root = await findOrCreateFolder(accessToken, ROOT_FOLDER_NAME);
    rootId = root.id;
    rootUrl = root.webViewLink;
    await ctx.supabaseAdmin.from("animoa_media_drive_connections").update({ root_folder_id: rootId, root_folder_url: rootUrl, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }

  const animalFolder = await findOrCreateFolder(accessToken, safeString(species, 80) || "Animaux", rootId);
  const themeFolder = await findOrCreateFolder(accessToken, safeString(theme, 80) || "Autres", animalFolder.id);
  return { rootId, rootUrl, folderId: themeFolder.id };
}

async function uploadRemoteVideo(media: MediaItem, folderId: string, accessToken: string): Promise<any> {
  const allowed = media.source === "pexels" ? /(^|\.)pexels\.com$/i : /(^|\.)pixabay\.com$/i;
  const videoUrl = safeHttpsUrl(media.videoUrl, allowed);
  if (!videoUrl) throw new HttpError(400, "L’adresse de cette vidéo n’est pas autorisée.");

  const sourceUrl = new URL(videoUrl);
  if (media.source === "pixabay") sourceUrl.searchParams.set("download", "1");
  const source = await fetch(sourceUrl, { headers: { "User-Agent": "Animoa-Media-Library/1.0" } });
  if (!source.ok || !source.body) throw new HttpError(502, `Téléchargement de la vidéo impossible (${source.status}).`);
  const contentType = safeString(source.headers.get("content-type"), 120) || "video/mp4";
  const contentLength = safeNumber(source.headers.get("content-length")) || media.fileSize;
  if (!contentType.startsWith("video/")) throw new HttpError(415, "Le fichier récupéré n’est pas une vidéo.");
  if (contentLength && contentLength > MAX_VIDEO_BYTES) throw new HttpError(413, "Cette vidéo dépasse la limite de 70 Mo choisie pour Animoa.");

  const metadata = {
    name: media.fileName,
    parents: [folderId],
    description: `Source : ${media.sourcePageUrl}\nCréateur : ${media.creatorName}\nImporté par la Banque de médias Animoa.`,
  };
  const init = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=id,name,webViewLink,webContentLink,size`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": contentType,
      ...(contentLength ? { "X-Upload-Content-Length": String(contentLength) } : {}),
    },
    body: JSON.stringify(metadata),
  });
  const location = init.headers.get("location");
  if (!init.ok || !location) {
    const details = await init.text().catch(() => "");
    throw new HttpError(init.status || 502, `Google Drive n’a pas pu préparer l’import. ${details.slice(0, 180)}`.trim());
  }

  const upload = await fetch(location, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      ...(contentLength ? { "Content-Length": String(contentLength) } : {}),
    },
    body: source.body,
  });
  const payload = await upload.json().catch(() => ({}));
  if (!upload.ok || !payload?.id) throw new HttpError(upload.status || 502, payload?.error?.message || "L’import de la vidéo dans Google Drive a échoué.");
  return payload;
}

const authenticatedHandler = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method !== "POST") return json({ ok: false, error: "Méthode non autorisée." }, 405);
  const userId = safeString(ctx.userClaims?.sub || ctx.userClaims?.id, 80);
  if (!userId) return json({ ok: false, error: "Compte Animoa introuvable." }, 401);

  try {
    await requireAdmin(ctx, userId);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = safeString(body.action, 40);

    if (action === "status") {
      const { data, error } = await ctx.supabaseAdmin
        .from("animoa_media_drive_connections")
        .select("google_account_email,root_folder_url,connected_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return json({ ok: true, connected: Boolean(data), email: data?.google_account_email || "", rootFolderUrl: data?.root_folder_url || "", connectedAt: data?.connected_at || "" });
    }

    if (action === "connect") {
      const code = safeString(body.code, 1500);
      const redirectUri = safeString(body.redirectUri, 1000);
      if (!code || !redirectUri) throw new HttpError(400, "Code Google Drive manquant.");
      const tokens = await exchangeGoogleCode(code, redirectUri);
      const accessToken = String(tokens.access_token);
      const granted = safeString(tokens.scope, 2000).split(/\s+/).filter(Boolean);
      if (!granted.includes(DRIVE_SCOPE)) throw new HttpError(403, "L’autorisation Google Drive n’a pas été accordée.");

      let refreshToken = safeString(tokens.refresh_token, 2000);
      if (!refreshToken) {
        const { data: existing } = await ctx.supabaseAdmin
          .from("animoa_media_drive_connections")
          .select("refresh_token")
          .eq("user_id", userId)
          .maybeSingle();
        refreshToken = safeString(existing?.refresh_token, 2000);
      }
      if (!refreshToken) {
        const { data: rows } = await ctx.supabaseAdmin.rpc("get_google_calendar_connection", { p_user_id: userId });
        const calendarConnection = Array.isArray(rows) ? rows[0] : rows;
        refreshToken = safeString(calendarConnection?.refresh_token, 2000);
      }
      if (!refreshToken) throw new HttpError(400, "Google n’a pas fourni d’autorisation durable. Retirez l’accès Animoa de votre compte Google puis recommencez.");

      const info = await googleJson("https://openidconnect.googleapis.com/v1/userinfo", accessToken).catch(() => ({}));
      const root = await findOrCreateFolder(accessToken, ROOT_FOLDER_NAME);
      const { error } = await ctx.supabaseAdmin.from("animoa_media_drive_connections").upsert({
        user_id: userId,
        refresh_token: refreshToken,
        google_account_email: safeString(info?.email, 254) || null,
        granted_scopes: [...new Set([...OPENID_SCOPES, ...granted])],
        root_folder_id: root.id,
        root_folder_url: root.webViewLink,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      return json({ ok: true, connected: true, email: info?.email || "", rootFolderUrl: root.webViewLink });
    }

    if (action === "disconnect") {
      const { error } = await ctx.supabaseAdmin.from("animoa_media_drive_connections").delete().eq("user_id", userId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "search") {
      const source = ["all", "pexels", "pixabay"].includes(safeString(body.source, 20)) ? safeString(body.source, 20) : "all";
      const species = safeString(body.species, 60) || "Animaux";
      const theme = safeString(body.theme, 60) || "Vie quotidienne";
      const orientation = ["all", "portrait", "landscape", "square"].includes(safeString(body.orientation, 20)) ? safeString(body.orientation, 20) : "portrait";
      const customQuery = safeString(body.query, 100);
      const query = customQuery || `${species} ${theme}`;
      if (query.length < 2) throw new HttpError(400, "Indiquez un animal ou un thème à rechercher.");

      const warnings: string[] = [];
      let pexels: MediaItem[] = [];
      let pixabay: MediaItem[] = [];
      if (source === "all" || source === "pexels") {
        try { pexels = await searchPexels(query, orientation, species, theme); }
        catch (error) {
          if (source === "pexels") throw error;
          warnings.push(error instanceof Error ? error.message : "Pexels est indisponible.");
        }
      }
      if (source === "all" || source === "pixabay") {
        try { pixabay = await searchPixabay(query, orientation, species, theme); }
        catch (error) {
          if (source === "pixabay") throw error;
          warnings.push(error instanceof Error ? error.message : "Pixabay est indisponible.");
        }
      }
      const combined = source === "pexels" ? pexels : source === "pixabay" ? pixabay : interleave(pexels, pixabay);
      const items = await markSavedItems(ctx, combined.slice(0, MAX_RESULTS));
      return json({ ok: true, query, items, warnings });
    }

    if (action === "save") {
      const raw = body.media && typeof body.media === "object" ? body.media as Record<string, unknown> : {};
      const source = safeString(raw.source, 20) as "pexels" | "pixabay";
      if (!['pexels', 'pixabay'].includes(source)) throw new HttpError(400, "Source vidéo invalide.");
      const sourceId = safeString(raw.sourceId, 100);
      const species = safeString(body.species, 60) || "Animaux";
      const theme = safeString(body.theme, 60) || "Autres";
      const media: MediaItem = {
        source,
        sourceId,
        sourcePageUrl: safeHttpsUrl(raw.sourcePageUrl, source === "pexels" ? /(^|\.)pexels\.com$/i : /(^|\.)pixabay\.com$/i),
        creatorName: safeString(raw.creatorName, 120),
        thumbnailUrl: safeHttpsUrl(raw.thumbnailUrl),
        videoUrl: safeHttpsUrl(raw.videoUrl, source === "pexels" ? /(^|\.)pexels\.com$/i : /(^|\.)pixabay\.com$/i),
        width: safeNumber(raw.width),
        height: safeNumber(raw.height),
        duration: safeNumber(raw.duration),
        fileSize: safeNumber(raw.fileSize),
        orientation: orientationOf(safeNumber(raw.width), safeNumber(raw.height)),
        fileName: safeString(raw.fileName, 180) || buildFileName(source, sourceId, species, theme),
      };
      if (!media.sourceId || !media.sourcePageUrl || !media.videoUrl) throw new HttpError(400, "Informations de vidéo incomplètes.");

      const { data: already } = await ctx.supabaseAdmin
        .from("animoa_media_library")
        .select("id,drive_web_url,file_name")
        .eq("source", source)
        .eq("source_id", sourceId)
        .maybeSingle();
      if (already?.id) return json({ ok: true, alreadySaved: true, item: already });

      const { data: connection, error: connectionError } = await ctx.supabaseAdmin
        .from("animoa_media_drive_connections")
        .select("refresh_token")
        .eq("user_id", userId)
        .maybeSingle();
      if (connectionError) throw connectionError;
      if (!connection?.refresh_token) throw new HttpError(409, "Connectez d’abord votre Google Drive depuis la Banque de médias.");
      const accessToken = await refreshGoogleAccessToken(String(connection.refresh_token));
      const folders = await ensureMediaFolder(ctx, userId, accessToken, species, theme);
      const driveFile = await uploadRemoteVideo(media, folders.folderId, accessToken);

      const { data: saved, error: saveError } = await ctx.supabaseAdmin
        .from("animoa_media_library")
        .insert({
          source,
          source_id: sourceId,
          source_page_url: media.sourcePageUrl,
          creator_name: media.creatorName || null,
          thumbnail_url: media.thumbnailUrl || null,
          original_video_url: media.videoUrl,
          species,
          theme,
          orientation: media.orientation,
          duration_seconds: media.duration || null,
          width: media.width || null,
          height: media.height || null,
          file_size_bytes: safeNumber(driveFile.size) || media.fileSize || null,
          file_name: media.fileName,
          drive_file_id: String(driveFile.id),
          drive_web_url: safeString(driveFile.webViewLink, 1000) || `https://drive.google.com/file/d/${driveFile.id}/view`,
          drive_folder_id: folders.folderId,
          status: "available",
          imported_by: userId,
        })
        .select("*")
        .single();
      if (saveError) throw saveError;
      return json({ ok: true, item: saved, rootFolderUrl: folders.rootUrl });
    }

    throw new HttpError(400, "Action inconnue.");
  } catch (error) {
    console.error("animoa-media-library", error);
    const status = error instanceof HttpError ? error.status : 500;
    return json({ ok: false, error: error instanceof Error ? error.message : "La Banque de médias est indisponible." }, status);
  }
});

export default {
  fetch: async (request: Request) => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    return authenticatedHandler(request);
  },
};

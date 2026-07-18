(() => {
  'use strict';

  const TABLE_NAME = 'animoa_user_data';
  const BUCKET_NAME = 'animoa-media';
  const CLOUD_PREFIX = 'cloud:';
  const signedUrlCache = new Map();

  function auth() { return window.AnimoaAuth; }
  function client() { return auth()?.getClient?.() || null; }
  function user() { return auth()?.getUser?.() || null; }
  function available() { return Boolean(client() && user() && !auth()?.isLocalPreview?.()); }

  async function loadBundle() {
    if (!available()) return null;
    const { data, error } = await client()
      .from(TABLE_NAME)
      .select('data, settings, updated_at')
      .eq('user_id', user().id)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function saveBundle(data, settings) {
    if (!available()) return;
    const payload = {
      user_id: user().id,
      data,
      settings,
      updated_at: new Date().toISOString()
    };
    const { error } = await client().from(TABLE_NAME).upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
  }

  function safeExtension(fileName = '', fallback = 'bin') {
    const match = String(fileName).toLowerCase().match(/\.([a-z0-9]{1,8})$/);
    return match?.[1] || fallback;
  }

  function makeFileName(fileName = 'file.bin') {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${user().id}/${id}.${safeExtension(fileName)}`;
  }

  async function uploadFile(blob, fileName = 'file.bin') {
    if (!available()) return null;
    const path = makeFileName(fileName);
    const { error } = await client().storage.from(BUCKET_NAME).upload(path, blob, {
      contentType: blob.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    return `${CLOUD_PREFIX}${path}`;
  }

  async function uploadImage(blob) {
    return uploadFile(blob, 'image.webp');
  }

  async function getImageUrl(ref) {
    if (!available() || !ref?.startsWith(CLOUD_PREFIX)) return null;
    const cached = signedUrlCache.get(ref);
    if (cached && cached.expiresAt > Date.now() + 60000) return cached.url;
    const path = ref.slice(CLOUD_PREFIX.length);
    const { data, error } = await client().storage.from(BUCKET_NAME).createSignedUrl(path, 3600);
    if (error) throw error;
    signedUrlCache.set(ref, { url: data.signedUrl, expiresAt: Date.now() + 3500_000 });
    return data.signedUrl;
  }

  async function deleteImage(ref) {
    if (!available() || !ref?.startsWith(CLOUD_PREFIX)) return;
    const path = ref.slice(CLOUD_PREFIX.length);
    const { error } = await client().storage.from(BUCKET_NAME).remove([path]);
    if (error) throw error;
    signedUrlCache.delete(ref);
  }

  async function clearUserImages() {
    if (!available()) return;
    const folder = user().id;
    const paths = [];
    let offset = 0;
    while (true) {
      const { data, error } = await client().storage.from(BUCKET_NAME).list(folder, { limit: 100, offset });
      if (error) throw error;
      if (!data?.length) break;
      paths.push(...data.map((item) => `${folder}/${item.name}`));
      if (data.length < 100) break;
      offset += data.length;
    }
    if (paths.length) {
      const { error } = await client().storage.from(BUCKET_NAME).remove(paths);
      if (error) throw error;
    }
    signedUrlCache.clear();
  }

  window.AnimoaCloud = {
    available,
    loadBundle,
    saveBundle,
    uploadImage,
    uploadFile,
    getImageUrl,
    deleteImage,
    clearUserImages,
    CLOUD_PREFIX
  };
})();

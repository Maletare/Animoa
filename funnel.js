(() => {
  'use strict';

  const SESSION_KEY = 'animoa_funnel_session_v1';
  const TRACKED_KEY_PREFIX = 'animoa_funnel_tracked_v1:';
  const ALLOWED = new Set(['landing_view', 'signup_click', 'signup_success', 'first_pet_created']);

  function randomId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  function sessionId() {
    try {
      let value = sessionStorage.getItem(SESSION_KEY);
      if (!value) {
        value = randomId();
        sessionStorage.setItem(SESSION_KEY, value);
      }
      return value;
    } catch {
      return randomId();
    }
  }

  function client() {
    return window.AnimoaAuth?.getClient?.() || null;
  }

  function currentUser() {
    return window.AnimoaAuth?.getUser?.() || null;
  }

  function onceKey(eventName) {
    const userId = currentUser()?.id || 'anonymous';
    if (eventName === 'signup_success' || eventName === 'first_pet_created') return `${TRACKED_KEY_PREFIX}${eventName}:${userId}`;
    return `${TRACKED_KEY_PREFIX}${eventName}:${sessionId()}`;
  }

  function alreadyTracked(eventName) {
    try { return sessionStorage.getItem(onceKey(eventName)) === '1' || localStorage.getItem(onceKey(eventName)) === '1'; }
    catch { return false; }
  }

  function rememberTracked(eventName) {
    try {
      if (eventName === 'signup_success' || eventName === 'first_pet_created') localStorage.setItem(onceKey(eventName), '1');
      else sessionStorage.setItem(onceKey(eventName), '1');
    } catch {}
  }

  function campaignMetadata(extra = {}) {
    const params = new URLSearchParams(location.search);
    const metadata = { ...extra };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = params.get(key);
      if (value) metadata[key] = value.slice(0, 180);
    });
    metadata.device = window.matchMedia?.('(max-width: 760px)')?.matches ? 'mobile' : 'desktop';
    return metadata;
  }

  async function track(eventName, metadata = {}) {
    if (!ALLOWED.has(eventName) || alreadyTracked(eventName)) return false;
    const supabase = client();
    if (!supabase || window.AnimoaAuth?.isLocalPreview?.()) return false;

    try {
      const { error } = await supabase.rpc('track_animoa_funnel_event', {
        p_event_name: eventName,
        p_session_id: sessionId(),
        p_path: `${location.pathname || '/'}${location.search || ''}`.slice(0, 500),
        p_referrer: String(document.referrer || '').slice(0, 500) || null,
        p_metadata: campaignMetadata(metadata)
      });
      if (error) throw error;
      rememberTracked(eventName);
      return true;
    } catch (error) {
      // Le suivi ne doit jamais bloquer l'inscription ni l'utilisation d'Animoa.
      console.debug('Suivi du parcours Animoa indisponible', error?.message || error);
      return false;
    }
  }

  window.AnimoaFunnel = Object.freeze({ track, sessionId });
})();

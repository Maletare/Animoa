(() => {
  'use strict';

  const landingPage = document.getElementById('landingPage');
  const authShell = document.getElementById('authShell');
  const appShell = document.querySelector('.app-shell');
  const config = window.ANIMOA_CONFIG || {};
  const i18n = window.AnimoaI18n;
  let client = null;
  let currentUser = null;
  let localPreview = false;
  let readyResolved = false;
  let readyUserId = null;
  let pendingAuthMode = 'login';
  let authListenerReady = false;
  let resolveReady;
  const readyPromise = new Promise((resolve) => { resolveReady = resolve; });

  const copy = {
    fr: {
      tagline: 'Toute sa vie, près de vous.',
      chooseLanguage: 'Choisissez votre langue',
      chooseLanguageHelp: 'Vous pourrez la modifier plus tard dans les paramètres.',
      continue: 'Continuer',
      welcome: 'Bienvenue sur Animoa',
      login: 'Se connecter',
      signup: 'Créer un compte',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      passwordHelp: '8 caractères minimum',
      invitationCode: 'Code d’invitation',
      invitationHelp: 'Animoa est actuellement accessible uniquement sur invitation.',
      invitationRequired: 'Indiquez le code d’invitation.',
      invitationInvalid: 'Le code d’invitation est incorrect.',
      forgot: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ?',
      alreadyAccount: 'Déjà un compte ?',
      confirmTitle: 'Vérifiez votre boîte e-mail',
      confirmText: 'Un lien de confirmation vient de vous être envoyé. Cliquez dessus pour activer votre compte Animoa.',
      back: 'Retour à la connexion',
      forgotTitle: 'Réinitialiser le mot de passe',
      forgotText: 'Indiquez votre adresse e-mail. Nous vous enverrons un lien sécurisé.',
      sendLink: 'Envoyer le lien',
      resetSent: 'Le lien de réinitialisation a été envoyé.',
      newPassword: 'Nouveau mot de passe',
      updatePassword: 'Enregistrer le nouveau mot de passe',
      passwordUpdated: 'Votre mot de passe a été modifié.',
      configuration: 'Configuration Supabase nécessaire',
      configurationText: 'Les écrans de compte sont prêts. Renseignez les deux valeurs publiques dans supabase-config.js pour activer la connexion et la synchronisation.',
      preview: 'Ouvrir en mode local pour vérifier l’application',
      configWarning: 'N’utilisez jamais la clé service_role dans ce fichier.',
      loading: 'Chargement…',
      invalid: 'Adresse e-mail ou mot de passe incorrect.',
      genericError: 'Une erreur est survenue. Réessayez dans un instant.',
      passwordLength: 'Le mot de passe doit contenir au moins 8 caractères.',
      emailRequired: 'Indiquez une adresse e-mail valide.',
      accountCreated: 'Compte créé. Vérifiez maintenant votre boîte e-mail.',
      googleContinue: 'Continuer avec Google',
      googleExistingOnly: 'Google est disponible pour les comptes Animoa déjà créés. Pour une première inscription, utilisez le code d’invitation.',
      googleUnavailable: 'La connexion Google n’est pas encore activée. Utilisez votre adresse e-mail pour le moment.',
      googleNewAccountBlocked: 'Ce compte Google n’est pas encore inscrit. Créez d’abord votre compte Animoa avec le code d’invitation, puis utilisez Google avec la même adresse e-mail.',
      or: 'ou',
      terms: 'En continuant, vous accédez à votre carnet Animoa personnel et sécurisé.',
      backPublic: 'Retour à la présentation'
    },
    en: {
      tagline: 'Their whole life, close to you.',
      chooseLanguage: 'Choose your language',
      chooseLanguageHelp: 'You can change it later in Settings.',
      continue: 'Continue',
      welcome: 'Welcome to Animoa',
      login: 'Sign in',
      signup: 'Create an account',
      email: 'Email address',
      password: 'Password',
      passwordHelp: 'At least 8 characters',
      invitationCode: 'Invitation code',
      invitationHelp: 'Animoa is currently available by invitation only.',
      invitationRequired: 'Enter the invitation code.',
      invitationInvalid: 'The invitation code is incorrect.',
      forgot: 'Forgot your password?',
      noAccount: 'Don’t have an account yet?',
      alreadyAccount: 'Already have an account?',
      confirmTitle: 'Check your email',
      confirmText: 'A confirmation link has just been sent to you. Open it to activate your Animoa account.',
      back: 'Back to sign in',
      forgotTitle: 'Reset your password',
      forgotText: 'Enter your email address and we will send you a secure link.',
      sendLink: 'Send link',
      resetSent: 'The reset link has been sent.',
      newPassword: 'New password',
      updatePassword: 'Save new password',
      passwordUpdated: 'Your password has been updated.',
      configuration: 'Supabase configuration required',
      configurationText: 'The account screens are ready. Add the two public values to supabase-config.js to enable sign-in and syncing.',
      preview: 'Open local preview to check the app',
      configWarning: 'Never use the service_role key in this file.',
      loading: 'Loading…',
      invalid: 'Incorrect email address or password.',
      genericError: 'Something went wrong. Please try again in a moment.',
      passwordLength: 'The password must contain at least 8 characters.',
      emailRequired: 'Enter a valid email address.',
      accountCreated: 'Account created. Now check your email.',
      googleContinue: 'Continue with Google',
      googleExistingOnly: 'Google is available for existing Animoa accounts. For a first sign-up, use the invitation code.',
      googleUnavailable: 'Google sign-in is not enabled yet. Use your email address for now.',
      googleNewAccountBlocked: 'This Google account is not registered yet. First create your Animoa account with the invitation code, then use Google with the same email address.',
      or: 'or',
      terms: 'By continuing, you access your personal and secure Animoa journal.',
      backPublic: 'Back to the presentation'
    }
  };

  function lang() { return i18n?.getLanguage?.() || 'fr'; }
  function c(key) { return copy[lang()]?.[key] || copy.fr[key] || key; }

  function redirectBaseUrl() {
    const localHost = ['127.0.0.1', 'localhost'].includes(location.hostname);
    const preferred = localHost ? location.origin : (config.appUrl || location.origin);
    return String(preferred).replace(/\/$/, '');
  }

  function isConfigured() {
    return Boolean(
      window.supabase?.createClient &&
      /^https:\/\//.test(config.supabaseUrl || '') &&
      !String(config.supabaseUrl).includes('REMPLACER_') &&
      String(config.supabaseAnonKey || '').length > 40 &&
      !String(config.supabaseAnonKey).includes('REMPLACER_')
    );
  }

  function showLanding() {
    if (landingPage) landingPage.hidden = false;
    authShell.hidden = true;
    appShell.hidden = true;
    document.body.classList.remove('auth-visible');
    document.body.classList.add('landing-visible');
  }

  function showShell() {
    if (landingPage) landingPage.hidden = true;
    authShell.hidden = false;
    appShell.hidden = true;
    document.body.classList.remove('landing-visible');
    document.body.classList.add('auth-visible');
  }

  function showApp() {
    if (landingPage) landingPage.hidden = true;
    authShell.hidden = true;
    appShell.hidden = false;
    document.body.classList.remove('auth-visible', 'landing-visible');
  }

  function logo() {
    return '<img class="auth-logo" src="assets/animoa-logo-official.png" alt="Animoa" width="1200" height="361" decoding="async" />';
  }

  function renderLanguageChoice() {
    showShell();
    authShell.innerHTML = `<section class="auth-card auth-language-card">
      ${logo()}
      <div class="auth-copy"><p class="eyebrow">Animoa</p><h1>${c('chooseLanguage')}</h1><p>${c('chooseLanguageHelp')}</p></div>
      <div class="language-choice-grid">
        <button type="button" class="language-choice ${lang() === 'fr' ? 'active' : ''}" data-auth-language="fr"><strong>Français</strong><span>FR</span></button>
        <button type="button" class="language-choice ${lang() === 'en' ? 'active' : ''}" data-auth-language="en"><strong>English</strong><span>EN</span></button>
      </div>
      <button type="button" class="primary-button auth-submit" data-auth-action="confirm-language">${c('continue')}</button>
    </section>`;
    decorateRequiredAuthFields();
  }

  function renderConfiguration() {
    showShell();
    authShell.innerHTML = `<section class="auth-card">
      ${logo()}
      <div class="auth-copy"><p class="eyebrow">Animoa</p><h1>${c('configuration')}</h1><p>${c('configurationText')}</p></div>
      <div class="auth-notice"><strong>supabase-config.js</strong><span>${c('configWarning')}</span></div>
      <button type="button" class="primary-button auth-submit" data-auth-action="local-preview">${c('preview')}</button>
    </section>`;
  }

  function renderLogin(mode = 'login', message = '') {
    if (!isConfigured()) return renderConfiguration();
    showShell();
    const signup = mode === 'signup';
    authShell.innerHTML = `<section class="auth-card">
      ${logo()}
      <div class="auth-copy"><p class="eyebrow">Animoa</p><h1>${c('welcome')}</h1><p>${c('tagline')}</p></div>
      <div class="auth-tabs" role="tablist">
        <button type="button" class="${!signup ? 'active' : ''}" data-auth-action="show-login">${c('login')}</button>
        <button type="button" class="${signup ? 'active' : ''}" data-auth-action="show-signup">${c('signup')}</button>
      </div>
      ${message ? `<div class="auth-message" role="status">${escapeHtml(message)}</div>` : ''}
      ${!signup ? `<button class="google-auth-button" type="button" data-auth-action="google"><span class="google-auth-icon" aria-hidden="true">G</span><span>${c('googleContinue')}</span></button><p class="google-auth-help">${c('googleExistingOnly')}</p><div class="auth-divider" aria-hidden="true"><span>${c('or')}</span></div>` : ''}
      <form id="authForm" class="auth-form" data-mode="${signup ? 'signup' : 'login'}">
        <label><span>${c('email')}</span><input name="email" type="email" autocomplete="email" required placeholder="nom@exemple.fr" /></label>
        <label><span>${c('password')}</span><input name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" minlength="8" required placeholder="••••••••" /><small>${c('passwordHelp')}</small></label>
        ${signup ? `<label><span>${c('invitationCode')}</span><input name="invitationCode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" required placeholder="ANIMOA-••••" /><small>${c('invitationHelp')}</small></label>` : ''}
        <button class="primary-button auth-submit" type="submit">${signup ? c('signup') : c('login')}</button>
      </form>
      ${!signup ? `<button type="button" class="auth-text-button" data-auth-action="forgot">${c('forgot')}</button>` : ''}
      <button class="auth-text-button auth-back-public" type="button" data-auth-action="public-home">${c('backPublic')}</button>
    </section>`;
    decorateRequiredAuthFields();
  }

  function renderConfirmation() {
    showShell();
    authShell.innerHTML = `<section class="auth-card auth-success-card">${logo()}<div class="auth-success-icon">✓</div><div class="auth-copy"><h1>${c('confirmTitle')}</h1><p>${c('confirmText')}</p></div><button type="button" class="secondary-button auth-submit" data-auth-action="show-login">${c('back')}</button></section>`;
  }

  function renderForgot(message = '') {
    showShell();
    authShell.innerHTML = `<section class="auth-card">${logo()}<div class="auth-copy"><p class="eyebrow">Animoa</p><h1>${c('forgotTitle')}</h1><p>${c('forgotText')}</p></div>${message ? `<div class="auth-message" role="status">${escapeHtml(message)}</div>` : ''}<form id="forgotForm" class="auth-form"><label><span>${c('email')}</span><input name="email" type="email" autocomplete="email" required /></label><button class="primary-button auth-submit" type="submit">${c('sendLink')}</button></form><button type="button" class="auth-text-button" data-auth-action="show-login">${c('back')}</button></section>`;
    decorateRequiredAuthFields();
  }

  function renderRecovery(message = '') {
    showShell();
    authShell.innerHTML = `<section class="auth-card">${logo()}<div class="auth-copy"><p class="eyebrow">Animoa</p><h1>${c('newPassword')}</h1></div>${message ? `<div class="auth-message" role="status">${escapeHtml(message)}</div>` : ''}<form id="recoveryForm" class="auth-form"><label><span>${c('newPassword')}</span><input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="••••••••" /><small>${c('passwordHelp')}</small></label><button class="primary-button auth-submit" type="submit">${c('updatePassword')}</button></form></section>`;
    decorateRequiredAuthFields();
  }

  function escapeHtml(value = '') {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function setBusy(form, busy) {
    const button = form?.querySelector('[type="submit"]');
    if (!button) return;
    if (busy) {
      button.dataset.label = button.textContent;
      button.textContent = c('loading');
      button.disabled = true;
    } else {
      button.textContent = button.dataset.label || button.textContent;
      button.disabled = false;
    }
  }

  function normaliseError(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('invalid login') || message.includes('invalid credentials')) return c('invalid');
    if (message.includes('password') && message.includes('characters')) return c('passwordLength');
    if (message.includes('code d’invitation') || message.includes("code d'invitation") || message.includes('invitation code')) return c('invitationInvalid');
    if (message.includes('provider') && (message.includes('enabled') || message.includes('unsupported'))) return c('googleUnavailable');
    return error?.message || c('genericError');
  }

  async function signInWithGoogle(button) {
    if (!client) return renderLogin('login', c('genericError'));
    const original = button?.innerHTML || '';
    if (button) {
      button.disabled = true;
      button.innerHTML = `<span class="google-auth-icon" aria-hidden="true">G</span><span>${c('loading')}</span>`;
    }
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${redirectBaseUrl()}/` }
      });
      if (error) throw error;
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.innerHTML = original;
      }
      const message = normaliseError(error);
      renderLogin('login', message === c('invitationInvalid') ? c('googleNewAccountBlocked') : message);
    }
  }

  function authRedirectError() {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
    const raw = searchParams.get('error_description') || hashParams.get('error_description') || searchParams.get('error') || hashParams.get('error');
    if (!raw) return '';
    ['error', 'error_code', 'error_description'].forEach((key) => searchParams.delete(key));
    const nextSearch = searchParams.toString();
    history.replaceState({}, document.title, `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`);
    const message = normaliseError({ message: String(raw).replace(/\+/g, ' ') });
    return message === c('invitationInvalid') ? c('googleNewAccountBlocked') : message;
  }

  function resolveAppReady() {
    const nextUserId = currentUser?.id || (localPreview ? 'local-preview' : null);
    if (readyResolved && readyUserId && readyUserId !== nextUserId) {
      location.reload();
      return;
    }
    showApp();
    if (!readyResolved) {
      readyResolved = true;
      readyUserId = nextUserId;
      resolveReady({ user: currentUser, client, localPreview, configured: isConfigured() });
    }
  }

  function ensureClient() {
    if (!isConfigured()) return null;
    if (!client) {
      client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    if (!authListenerReady) {
      authListenerReady = true;
      client.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        if (event === 'PASSWORD_RECOVERY') {
          setTimeout(() => renderRecovery(), 0);
          return;
        }
        if (currentUser) resolveAppReady();
        else if (event === 'SIGNED_OUT') location.reload();
      });
    }
    return client;
  }

  function openAuthentication(mode = 'login') {
    pendingAuthMode = mode === 'signup' ? 'signup' : 'login';
    const languageChosen = localStorage.getItem('animoa_language_selected') === '1';
    if (!languageChosen) return renderLanguageChoice();
    if (!ensureClient()) return renderConfiguration();
    renderLogin(pendingAuthMode);
  }

  async function initialise() {
    if (!isConfigured()) {
      showLanding();
      return;
    }

    ensureClient();
    const redirectError = authRedirectError();
    const { data, error } = await client.auth.getSession();
    if (error) console.warn('Session Animoa indisponible', error);
    currentUser = data?.session?.user || null;
    if (currentUser) resolveAppReady();
    else if (redirectError || new URLSearchParams(location.search).has('reset')) renderLogin('login', redirectError);
    else showLanding();
  }

  document.addEventListener('click', async (event) => {
    const publicTarget = event.target.closest('[data-public-action]');
    if (publicTarget) {
      event.preventDefault();
      const publicAction = publicTarget.dataset.publicAction;
      if (publicAction === 'login' || publicAction === 'signup') openAuthentication(publicAction);
      return;
    }

    const languageButton = event.target.closest('[data-auth-language]');
    if (languageButton) {
      i18n.setLanguage(languageButton.dataset.authLanguage);
      renderLanguageChoice();
      return;
    }
    const target = event.target.closest('[data-auth-action]');
    if (!target) return;
    const action = target.dataset.authAction;
    if (action === 'confirm-language') {
      localStorage.setItem('animoa_language_selected', '1');
      if (!ensureClient()) renderConfiguration();
      else renderLogin(pendingAuthMode);
    }
    if (action === 'local-preview') {
      localPreview = true;
      currentUser = null;
      resolveAppReady();
    }
    if (action === 'show-login') renderLogin('login');
    if (action === 'show-signup') renderLogin('signup');
    if (action === 'public-home') showLanding();
    if (action === 'forgot') renderForgot();
    if (action === 'google') {
      await signInWithGoogle(target);
      return;
    }
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.id === 'authForm') {
      event.preventDefault();
      const form = event.target;
      const values = new FormData(form);
      const email = String(values.get('email') || '').trim();
      const password = String(values.get('password') || '');
      const invitationCode = String(values.get('invitationCode') || '').trim();
      if (!email.includes('@')) return renderLogin(form.dataset.mode, c('emailRequired'));
      if (password.length < 8) return renderLogin(form.dataset.mode, c('passwordLength'));
      if (form.dataset.mode === 'signup' && !invitationCode) return renderLogin(form.dataset.mode, c('invitationRequired'));
      setBusy(form, true);
      try {
        if (form.dataset.mode === 'signup') {
          const redirectTo = `${redirectBaseUrl()}/`;
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectTo,
              data: { language: lang(), invitation_code: invitationCode }
            }
          });
          if (error) throw error;
          if (data.session) {
            currentUser = data.user;
            resolveAppReady();
          } else renderConfirmation();
        } else {
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          currentUser = data.user;
          resolveAppReady();
        }
      } catch (error) {
        renderLogin(form.dataset.mode, normaliseError(error));
      } finally {
        setBusy(form, false);
      }
    }

    if (event.target.id === 'forgotForm') {
      event.preventDefault();
      const form = event.target;
      const email = String(new FormData(form).get('email') || '').trim();
      setBusy(form, true);
      try {
        const redirectTo = `${redirectBaseUrl()}/?reset=1`;
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        renderForgot(c('resetSent'));
      } catch (error) {
        renderForgot(normaliseError(error));
      } finally { setBusy(form, false); }
    }

    if (event.target.id === 'recoveryForm') {
      event.preventDefault();
      const form = event.target;
      const password = String(new FormData(form).get('password') || '');
      if (password.length < 8) return renderRecovery(c('passwordLength'));
      setBusy(form, true);
      try {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        history.replaceState({}, document.title, location.pathname);
        renderRecovery(c('passwordUpdated'));
        setTimeout(resolveAppReady, 900);
      } catch (error) {
        renderRecovery(normaliseError(error));
      } finally { setBusy(form, false); }
    }
  });

  async function signOut() {
    if (localPreview || !client) {
      location.reload();
      return;
    }
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  window.AnimoaAuth = {
    ready: () => readyPromise,
    getClient: () => client,
    getUser: () => currentUser,
    isConfigured,
    isLocalPreview: () => localPreview,
    signOut
  };

  initialise().catch((error) => {
    console.error('Initialisation du compte Animoa impossible', error);
    renderLogin('login', normaliseError(error));
  });
})();

(() => {
  'use strict';
  const modal = document.getElementById('accessRequestModal');
  const backdrop = document.getElementById('accessRequestBackdrop');
  const form = document.getElementById('accessRequestForm');
  const success = document.getElementById('accessRequestSuccess');
  const errorBox = document.getElementById('accessRequestError');
  if (!modal || !backdrop || !form) return;
  let openedAt = 0;
  function open() {
    openedAt = Date.now(); form.hidden = false; success.hidden = true; errorBox.textContent = '';
    modal.hidden = false; backdrop.hidden = false; modal.setAttribute('aria-hidden','false');
    document.body.classList.add('access-request-open');
    requestAnimationFrame(() => { modal.classList.add('open'); backdrop.classList.add('open'); form.elements.first_name?.focus(); });
  }
  function close() {
    modal.classList.remove('open'); backdrop.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('access-request-open');
    setTimeout(() => { modal.hidden = true; backdrop.hidden = true; }, 180);
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-public-action="request-access"]')) { event.preventDefault(); open(); }
    if (event.target.closest('[data-access-close]') || event.target === backdrop) close();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) close(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); errorBox.textContent='';
    const button=form.querySelector('button[type="submit"]');
    const data=Object.fromEntries(new FormData(form).entries());
    if (Date.now()-openedAt < 1200) return;
    button.disabled=true; button.textContent='Envoi en cours…';
    try {
      const client=window.AnimoaAuth?.getClient?.();
      if (!client) throw new Error('Le service est momentanément indisponible.');
      const payload={first_name:String(data.first_name||'').trim(),email:String(data.email||'').trim().toLowerCase(),animals:String(data.animals||'').trim(),animal_count:Number(data.animal_count||0),reason:String(data.reason||'').trim(),contact_consent:data.contact_consent==='on'};
      const {error}=await client.from('animoa_access_requests').insert(payload);
      if (error) throw error;
      form.reset(); form.hidden=true; success.hidden=false;
    } catch (error) { errorBox.textContent=error.message || 'La demande n’a pas pu être envoyée.'; }
    finally { button.disabled=false; button.textContent='Envoyer ma demande'; }
  });
})();

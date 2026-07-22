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
    if (String(data.website || '').trim()) {
      form.reset(); form.hidden=true; success.hidden=false;
      return;
    }
    if (Date.now()-openedAt < 1200) return;
    const firstName=String(data.first_name||'').trim();
    const email=String(data.email||'').trim().toLowerCase();
    const animals=String(data.animals||'').trim();
    const animalCount=Number(data.animal_count||0);
    const reason=String(data.reason||'').trim();
    const contactConsent=data.contact_consent==='on';
    if (!firstName || firstName.length > 80) return void (errorBox.textContent='Indiquez un prénom valide.');
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 180) return void (errorBox.textContent='Indiquez une adresse e-mail valide.');
    if (!animals || animals.length > 180) return void (errorBox.textContent='Précisez les animaux concernés.');
    if (!Number.isInteger(animalCount) || animalCount < 1 || animalCount > 99) return void (errorBox.textContent='Indiquez un nombre d’animaux valide.');
    if (!reason || reason.length > 800) return void (errorBox.textContent='Précisez brièvement votre demande.');
    if (!contactConsent) return void (errorBox.textContent='Votre accord est nécessaire pour pouvoir vous recontacter.');
    button.disabled=true; button.textContent='Envoi en cours…';
    try {
      const client=window.AnimoaAuth?.getClient?.();
      if (!client) throw new Error('Le service est momentanément indisponible.');
      const payload={first_name:firstName,email,animals,animal_count:animalCount,reason,contact_consent:contactConsent};
      const {error}=await client.from('animoa_access_requests').insert(payload);
      if (error) throw error;
      form.reset(); form.hidden=true; success.hidden=false;
    } catch (error) { errorBox.textContent=error.message || 'La demande n’a pas pu être envoyée.'; }
    finally { button.disabled=false; button.textContent='Envoyer ma demande'; }
  });
})();

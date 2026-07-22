(() => {
  'use strict';

  const form = document.getElementById('publicSurveyForm');
  const card = document.getElementById('publicSurveyCard');
  if (!form || !card) return;

  const steps = [...form.querySelectorAll('[data-survey-step]')];
  const previousButton = document.getElementById('surveyPreviousButton');
  const nextButton = document.getElementById('surveyNextButton');
  const submitButton = document.getElementById('surveySubmitButton');
  const stepLabel = document.getElementById('surveyStepLabel');
  const progressPercent = document.getElementById('surveyProgressPercent');
  const progressBar = document.getElementById('surveyProgressBar');
  const success = document.getElementById('surveySuccess');
  const emailField = document.getElementById('surveyEmailField');
  const emailInput = form.elements.email;
  const otherAnimalToggle = form.querySelector('[data-survey-toggle="otherAnimal"]');
  const otherAnimalField = document.getElementById('otherAnimalField');
  const desiredUse = form.elements.desired_use;
  const characterCount = document.getElementById('surveyCharacterCount');
  const openedAt = Date.now();
  let currentStep = 1;
  let submitting = false;

  function errorNode(step = currentStep) {
    return form.querySelector(`[data-survey-error="${step}"]`);
  }

  function setError(message = '', step = currentStep) {
    const node = errorNode(step);
    if (node) node.textContent = message;
  }

  function selectedValues(name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
  }

  function selectedValue(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function updateConditionalFields() {
    const wantsContact = Boolean(form.querySelector('input[name="testing_interest"]:checked[data-survey-contact="true"]'));
    emailField.hidden = !wantsContact;
    emailInput.required = wantsContact;
    if (!wantsContact) {
      emailInput.value = '';
      emailInput.setCustomValidity('');
    }
    const otherSelected = Boolean(otherAnimalToggle?.checked);
    otherAnimalField.hidden = !otherSelected;
    if (!otherSelected) form.elements.other_animal.value = '';
  }

  function updateCounter() {
    characterCount.textContent = String(desiredUse.value.length);
  }

  function renderStep({ focus = false } = {}) {
    steps.forEach((step) => {
      const active = Number(step.dataset.surveyStep) === currentStep;
      step.hidden = !active;
      step.classList.toggle('active', active);
    });
    const percent = Math.round((currentStep / steps.length) * 100);
    stepLabel.textContent = `Question ${currentStep} sur ${steps.length}`;
    progressPercent.textContent = `${percent} %`;
    progressBar.style.width = `${percent}%`;
    previousButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === steps.length;
    submitButton.hidden = currentStep !== steps.length;
    setError('', currentStep);
    if (focus) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => steps[currentStep - 1]?.querySelector('h3')?.focus?.({ preventScroll: true }), 350);
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  function validateStep(step = currentStep) {
    setError('', step);
    if (step === 1 && selectedValues('animals').length === 0) {
      setError('Sélectionnez au moins une réponse.', step);
      return false;
    }
    if (step === 2 && !selectedValue('current_method')) {
      setError('Choisissez une réponse pour continuer.', step);
      return false;
    }
    if (step === 3 && selectedValues('features').length === 0) {
      setError('Sélectionnez au moins une fonctionnalité.', step);
      return false;
    }
    if (step === 4) {
      const interest = selectedValue('testing_interest');
      if (!interest) {
        setError('Indiquez si vous souhaitez participer aux tests.', step);
        return false;
      }
      const wantsContact = interest === 'Oui' || interest === 'Peut-être';
      const email = String(emailInput.value || '').trim();
      if (wantsContact && !validateEmail(email)) {
        setError('Indiquez une adresse e-mail valide.', step);
        emailInput.focus();
        return false;
      }
    }
    return true;
  }

  function payload() {
    return {
      animals: selectedValues('animals'),
      other_animal: String(form.elements.other_animal.value || '').trim() || null,
      current_method: selectedValue('current_method'),
      useful_features: selectedValues('features'),
      testing_interest: selectedValue('testing_interest'),
      email: String(emailInput.value || '').trim().toLowerCase() || null,
      desired_use: String(desiredUse.value || '').trim() || null,
      source: 'animoa.fr'
    };
  }

  async function saveResponse(data) {
    let client = window.AnimoaAuth?.getClient?.();
    if (!client && window.supabase?.createClient && window.ANIMOA_CONFIG?.supabaseUrl && window.ANIMOA_CONFIG?.supabaseAnonKey) {
      client = window.supabase.createClient(window.ANIMOA_CONFIG.supabaseUrl, window.ANIMOA_CONFIG.supabaseAnonKey);
    }
    if (!client) throw new Error('Le formulaire ne peut pas encore être envoyé. Réessayez dans quelques instants.');
    const { error } = await client.from('animoa_survey_responses').insert(data);
    if (error) {
      console.error('Enregistrement du questionnaire impossible', error);
      if (error.code === '42P01' || error.code === '42501') {
        throw new Error('Le questionnaire doit encore être activé sur le serveur Animoa.');
      }
      throw new Error('Impossible d’enregistrer vos réponses pour le moment. Réessayez plus tard.');
    }
  }

  function showSuccess() {
    submitButton.removeAttribute('aria-busy');
    form.removeAttribute('aria-busy');
    form.hidden = true;
    card.querySelector('.survey-progress-block').hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetForm() {
    form.reset();
    currentStep = 1;
    submitting = false;
    form.hidden = false;
    card.querySelector('.survey-progress-block').hidden = false;
    success.hidden = true;
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
    form.removeAttribute('aria-busy');
    submitButton.textContent = 'Envoyer mes réponses';
    updateConditionalFields();
    updateCounter();
    steps.forEach((_, index) => setError('', index + 1));
    renderStep({ focus: true });
  }

  form.addEventListener('change', (event) => {
    if (event.target.matches('input[name="testing_interest"], [data-survey-toggle="otherAnimal"]')) updateConditionalFields();
    setError('', currentStep);
  });

  desiredUse.addEventListener('input', updateCounter);

  card.addEventListener('click', (event) => {
    const action = event.target.closest('[data-survey-action]')?.dataset.surveyAction;
    if (!action) return;
    if (action === 'next') {
      if (!validateStep()) return;
      currentStep = Math.min(steps.length, currentStep + 1);
      renderStep({ focus: true });
    }
    if (action === 'previous') {
      currentStep = Math.max(1, currentStep - 1);
      renderStep({ focus: true });
    }
    if (action === 'restart') resetForm();
    if (action === 'discover') window.location.assign('index.html#inscription');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !validateStep(5)) return;
    const honeypot = String(form.elements.website.value || '').trim();
    if (honeypot || Date.now() - openedAt < 2500) {
      showSuccess();
      return;
    }
    submitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Envoi en cours…';
    setError('', 5);
    try {
      await saveResponse(payload());
      showSuccess();
    } catch (error) {
      setError(error.message || 'Impossible d’envoyer vos réponses.', 5);
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      form.removeAttribute('aria-busy');
      submitButton.textContent = 'Envoyer mes réponses';
    } finally {
      submitting = false;
    }
  });

  updateConditionalFields();
  updateCounter();
  renderStep();
})();

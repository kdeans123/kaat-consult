/* Kaat Consult website — header, accordion, contact form. */

// Form backend: Netlify Function that emails the enquiry via Resend (netlify/functions/contact.mjs).
// When the page is opened as a local file there is no server, so the form only shows the thank-you state.
const FORM_ENDPOINT = location.protocol === 'file:' ? '' : '/api/contact';

// Google Ads conversion: fill in once the conversion action exists, e.g. 'AW-123456789/AbC-D_efG-h12_34-567'.
const ADS_CONVERSION_SEND_TO = '';

(function () {
  // Footer year
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Sticky header: blur + hairline once scrolled
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Accordion: one open at a time
  document.querySelectorAll('[data-accordion]').forEach(acc => {
    const triggers = acc.querySelectorAll('.accordion__trigger');
    triggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const wasOpen = btn.getAttribute('aria-expanded') === 'true';
        triggers.forEach(other => {
          other.setAttribute('aria-expanded', 'false');
          document.getElementById(other.getAttribute('aria-controls')).classList.remove('is-open');
        });
        if (!wasOpen) {
          btn.setAttribute('aria-expanded', 'true');
          document.getElementById(btn.getAttribute('aria-controls')).classList.add('is-open');
        }
      });
    });
  });

  // Contact form
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-success');
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.querySelector('.btn__label');
  const defaultLabel = submitLabel.textContent;

  const setError = (name, message) => {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!message);
    const input = form.elements[name];
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    const msg = wrap.querySelector('.field__error');
    if (msg) msg.textContent = message || '';
  };

  const getErrors = data => {
    const errors = {};
    if (!String(data.get('name') || '').trim()) errors.name = 'Please add your name';
    if (!/^\S+@\S+\.\S+$/.test(String(data.get('email') || '').trim())) errors.email = 'Please enter a valid email';
    if (!data.get('consent')) errors.consent = 'Please agree to the privacy policy';
    return errors;
  };

  const validate = data => {
    const errors = getErrors(data);
    ['name', 'email', 'consent'].forEach(k => setError(k, errors[k]));
    return errors;
  };

  const trackLead = () => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'generate_lead');
    if (ADS_CONVERSION_SEND_TO) window.gtag('event', 'conversion', { send_to: ADS_CONVERSION_SEND_TO });
  };

  const showSuccess = () => {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    trackLead();
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.hidden = true;
    const data = new FormData(form);
    const errors = validate(data);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.elements[firstError].focus();
      return;
    }

    if (!FORM_ENDPOINT) {
      console.warn('Local preview: the form is not sent. It sends once the site runs on Netlify.');
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      showSuccess();
    } catch (err) {
      status.textContent = 'Sorry, your message could not be sent. Please try again in a moment.';
      status.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = defaultLabel;
    }
  });

  // Clear an error as soon as the field is fixed
  form.addEventListener('input', e => {
    const name = e.target.name;
    if (['name', 'email', 'consent'].includes(name)) {
      const wrap = form.querySelector(`[data-field="${name}"]`);
      if (wrap && wrap.classList.contains('has-error')) setError(name, getErrors(new FormData(form))[name]);
    }
  });

  document.getElementById('form-reset').addEventListener('click', () => {
    form.reset();
    ['name', 'email', 'consent'].forEach(k => setError(k, ''));
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();

// Contact: the register form's states. Progressive enhancement: without this script the form still
// posts to Formspree through its action and method (pages/contact.astro).
// Empty and per-field errors: on submit every field is checked; each invalid one gets its deck error
//   under its rule, aria-invalid, and aria-describedby, and focus moves to the first. After the first
//   attempt an error clears the moment its field becomes valid.
// Sending: the button reads "Sending" and takes no second press (aria-disabled, so focus stays on it).
// Sent: the coda replaces the form inside a live region and takes focus; it fades in once (CSS).
// Send failed: the deck line appears above the button inside a live region; every value stays.
// No motion but the coda's fade, and none at all with reduced motion.
// Turnstile guards the form but never blocks it: whatever it does, a valid note is sent, and Formspree
// decides.
import { contactForm as copy, formspreeEndpoint, turnstileSiteKey } from '../data/contact';

type Field = HTMLInputElement | HTMLTextAreaElement;

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string | null | undefined;
  reset: (widget?: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

// Loaded here, so only /contact ever fetches it. render=explicit: the widget draws into the form's
// container, and its token goes in as the hidden field cf-turnstile-response, so it rides in the
// FormData with every send. A blocked script, a domain Cloudflare does not allow, or no token yet each
// leave the form sending as before. reset() gets a fresh token after a failed send.
const TURNSTILE_API = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function initTurnstile(container: HTMLElement) {
  let widget: string | null | undefined;
  const render = () => {
    try {
      widget = window.turnstile?.render(container, {
        sitekey: turnstileSiteKey,
        'response-field-name': 'cf-turnstile-response',
        // The container holds no room (contact.css) until a person must interact; only then it opens
        appearance: 'interaction-only',
        'before-interactive-callback': () => container.setAttribute('data-shown', ''),
        'after-interactive-callback': () => container.removeAttribute('data-shown'),
        // Turnstile still logs the error; the form carries on without a token
        'error-callback': () => {},
      });
    } catch {
      widget = null;
    }
  };
  const script = document.createElement('script');
  script.src = TURNSTILE_API;
  script.async = true;
  script.addEventListener('load', render);
  document.head.append(script);

  return () => {
    if (!widget) return;
    try {
      window.turnstile?.reset(widget);
    } catch {
      // nothing to reset; the next send goes without a token
    }
  };
}

// The last two words of a line travel together, so no message ever ends on one word alone
const pair = (text: string) => text.replace(/ (\S+)$/, ' $1');

// type="email" alone accepts an address with no dot in its domain; a reply needs one
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorFor(field: Field): string | null {
  const value = field.value.trim();
  switch (field.name) {
    case 'name':
      return value ? null : copy.errors.nameEmpty;
    case 'email':
      if (!value) return copy.errors.emailEmpty;
      return EMAIL.test(value) && !(field as HTMLInputElement).validity.typeMismatch ? null : copy.errors.emailInvalid;
    case 'message':
      return value ? null : copy.errors.messageEmpty;
  }
  return null;
}

export function initContact() {
  const form = document.querySelector<HTMLFormElement>('[data-register-form]');
  const done = document.querySelector<HTMLElement>('[data-done]');
  const fail = form?.querySelector<HTMLElement>('[data-fail]');
  const submit = form?.querySelector<HTMLButtonElement>('[data-submit]');
  const check = form?.querySelector<HTMLElement>('[data-turnstile]');
  if (!form || !done || !fail || !submit || !check) return;

  const resetTurnstile = initTurnstile(check);

  const fields = ['name', 'email', 'message'].map((n) => form.elements.namedItem(n) as Field);
  const labels = submit.querySelectorAll<HTMLElement>('.btn__label, .btn__hover > span');
  let attempted = false;
  let sending = false;

  const show = (field: Field, message: string | null) => {
    const error = field.parentElement?.querySelector<HTMLElement>('[data-error]');
    if (!error) return;
    if (message) {
      error.textContent = pair(message);
      error.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', error.id);
    } else {
      error.textContent = '';
      error.hidden = true;
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  };

  const setLabel = (text: string) => labels.forEach((l) => (l.textContent = text));

  const setSending = (on: boolean) => {
    sending = on;
    setLabel(on ? copy.sending : copy.submit);
    if (on) submit.setAttribute('aria-disabled', 'true');
    else submit.removeAttribute('aria-disabled');
  };

  // A repeat failure clears the line first, so the live region announces it again
  const showFailed = () => {
    setSending(false);
    const line = pair(copy.sendFailed);
    if (fail.textContent === line) {
      fail.textContent = '';
      setTimeout(() => (fail.textContent = line), 100);
    } else {
      fail.textContent = line;
    }
  };

  const showSent = () => {
    const coda = document.createElement('p');
    coda.className = 'display register__coda';
    coda.tabIndex = -1;
    coda.textContent = pair(copy.sent);
    form.remove();
    done.append(coda);
    coda.focus();
  };

  // After the first attempt, an error keeps pace with its field: it clears once the field is valid,
  // and an email error follows the field from empty to not valid
  fields.forEach((field) =>
    field.addEventListener('input', () => {
      if (!attempted || field.getAttribute('aria-invalid') !== 'true') return;
      show(field, errorFor(field));
    }),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    attempted = true;

    const invalid = fields.filter((field) => {
      const message = errorFor(field);
      show(field, message);
      return Boolean(message);
    });
    if (invalid.length) {
      fail.textContent = '';
      invalid[0].focus();
      return;
    }

    setSending(true);
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Formspree ${response.status}`);
      showSent();
    } catch {
      showFailed();
      resetTurnstile();
    }
  });
}

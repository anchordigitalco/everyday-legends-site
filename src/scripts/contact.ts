// Contact: the register form's states. Progressive enhancement: without this script the form still
// posts to Formspree through its action and method (pages/contact.astro).
// Empty and per-field errors: on submit every field is checked; each invalid one gets its deck error
//   under its rule, aria-invalid, and aria-describedby, and focus moves to the first. After the first
//   attempt an error clears the moment its field becomes valid.
// Sending: the button reads "Sending" and takes no second press (aria-disabled, so focus stays on it).
// Sent: the coda replaces the form inside a live region and takes focus; it fades in once (CSS).
// Send failed: the deck line appears above the button inside a live region; every value stays.
// No motion but the coda's fade, and none at all with reduced motion.
// Turnstile: Formspree verifies its token and rejects a send without one, so a send never goes out
// with an empty token. With a token in hand it posts at once; without one it waits, in its Sending
// state, for Turnstile to issue one (a challenge included), then posts on its own.
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
// container, always visible above the button, at its normal size in the light theme.
const TURNSTILE_API = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// How long a send waits for a token before it gives up and reads as failed
const TOKEN_WAIT = 30_000;

type Check = {
  // A token to post now, or a promise of one; it rejects on a Turnstile error or after TOKEN_WAIT
  token: () => string | Promise<string>;
  // A fresh token for the next try: each token works once
  reset: () => void;
};

function initTurnstile(container: HTMLElement): Check {
  let widget: string | null | undefined;
  let token = '';
  // A blocked script or a failed render: no token will ever come, so a send fails at once
  let broken = false;
  let waiting: { resolve: (token: string) => void; reject: () => void; timer: number } | null = null;

  const settle = (value: string | null) => {
    if (!waiting) return;
    const { resolve, reject, timer } = waiting;
    waiting = null;
    clearTimeout(timer);
    if (value) resolve(value);
    else reject();
  };

  const render = () => {
    try {
      widget = window.turnstile?.render(container, {
        sitekey: turnstileSiteKey,
        size: 'normal',
        theme: 'light',
        'response-field-name': 'cf-turnstile-response',
        callback: (value: string) => {
          token = value;
          settle(value);
        },
        'expired-callback': () => {
          token = '';
        },
        // Handled here (a true return keeps Turnstile from throwing); a waiting send fails
        'error-callback': () => {
          token = '';
          settle(null);
          return true;
        },
      });
      if (!widget) broken = true;
    } catch {
      broken = true;
    }
  };
  const script = document.createElement('script');
  script.src = TURNSTILE_API;
  script.async = true;
  script.addEventListener('load', render);
  script.addEventListener('error', () => (broken = true));
  document.head.append(script);

  return {
    token: () => {
      if (token) return token;
      if (broken) return Promise.reject();
      return new Promise<string>((resolve, reject) => {
        waiting = { resolve, reject, timer: window.setTimeout(() => settle(null), TOKEN_WAIT) };
      });
    },
    reset: () => {
      token = '';
      if (!widget) return;
      try {
        window.turnstile?.reset(widget);
      } catch {
        // nothing to reset; the next send waits for a token as usual
      }
    },
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

  const turnstile = initTurnstile(check);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    // The values sent are the ones just checked
    const body = new FormData(form);
    try {
      let token = turnstile.token();
      if (typeof token !== 'string') {
        // No token yet: bring the widget into view in case it asks for a click, and post when it lands
        check.scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'auto' : 'smooth' });
        token = await token;
      }
      body.set('cf-turnstile-response', token);
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Formspree ${response.status}`);
      showSent();
    } catch {
      showFailed();
      turnstile.reset();
    }
  });
}

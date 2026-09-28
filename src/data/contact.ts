// The Contact register (everyday-legends-copy.md, section 6, "Contact form"). Pending client approval:
// every string on the form lives here, verbatim from the deck, so each one swaps in one place.
// The form is the site's only channel to the foundation: no email address and no email link, anywhere.

// The foundation's Formspree form (the part after /f/ in its endpoint). Messages reach its inbox from
// there; the address itself never appears in the site.
export const formspreeId = 'mdekyelo';

export const formspreeEndpoint = `https://formspree.io/f/${formspreeId}`;

// Cloudflare Turnstile, set to Invisible in Cloudflare. A site key is public by design; the secret key
// never enters this repo. Its token rides in the form as cf-turnstile-response (scripts/contact.ts).
export const turnstileSiteKey = '0x4AAAAAAFH5byucUdyIuMZn';

// Formspree reads these hidden fields: the subject line of every notification, and the honeypot.
export const formspreeSubject = 'Contact form, everydaylegend.com';

// The foundation's Instagram, one URL for the footer (layouts/Base.astro) and the Contact marginalia.
export const instagramUrl = 'https://www.instagram.com/everydaylegendsfoundation/';

export const contactForm = {
  // "Name · Email · Message", one label per field
  labels: { name: 'Name', email: 'Email', message: 'Message' },
  submit: 'Send message',
  sending: 'Sending',
  errors: {
    nameEmpty: 'Please add your name.',
    emailEmpty: 'Please add your email.',
    emailInvalid: 'Please check your email address.',
    messageEmpty: 'Please write a short message.',
  },
  sendFailed: 'Your note did not send. Please try again, or reach us on Instagram.',
  sent: 'Thank you. Your note is with us, and we will reply soon.',
};

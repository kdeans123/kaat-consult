# kaat-consult

Website for Kaat Consult: a single-page Google Ads landing page with a free audit contact form, plus a privacy policy page.

- Static HTML, CSS and JavaScript (no build step): `index.html`, `privacy.html`, `css/`, `js/`, `assets/`
- Contact form is sent by a Netlify Function via Resend: `netlify/functions/contact.mjs`

## Deploy (Netlify)
1. Connect this repository in Netlify (no build command; publish directory is the repo root, set in `netlify.toml`).
2. Add environment variables in Netlify → Site configuration → Environment variables:
   - `RESEND_API_KEY` (required)
   - `CONTACT_TO` (optional, defaults to kat@kaatconsult.com)
   - `CONTACT_FROM` (optional; set to `Kaat Consult website <website@kaatconsult.com>` once kaatconsult.com is verified in Resend)

Never commit API keys to this repository.

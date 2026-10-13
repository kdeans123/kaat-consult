# kaat-consult

Website for Kaat Consult: a single-page Google Ads landing page with a free audit contact form, plus a privacy policy page.

- Static HTML, CSS and JavaScript (no build step): `index.html`, `privacy.html`, `css/`, `js/`, `assets/`
- The contact form posts to `/api/contact`, which emails the enquiry via Resend. The logic lives in `lib/contact-handler.mjs`, wrapped for Vercel (`api/contact.mjs`) and Netlify (`netlify/functions/contact.mjs`).

## Deploy on Vercel
1. Import this repository in Vercel. Framework preset: **Other**. Leave Build Command and Output Directory empty.
2. Project → Settings → Environment Variables:
   - `RESEND_API_KEY` (required)
   - `CONTACT_TO` (optional, defaults to kat@kaatconsult.com)
   - `CONTACT_FROM` (optional; set to `Kaat Consult website <website@kaatconsult.com>` once kaatconsult.com is verified in Resend)
3. Redeploy after adding or changing environment variables.

Netlify also works: `netlify.toml` is included; add the same environment variables there.

Never commit API keys to this repository.

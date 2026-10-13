// Contact form handler: validates the enquiry and emails it via Resend.
// Set these in Netlify → Site configuration → Environment variables (never in the site files):
//   RESEND_API_KEY  required
//   CONTACT_TO      optional, defaults to kat@kaatconsult.com
//   CONTACT_FROM    optional, defaults to Resend's test sender onboarding@resend.dev, which can only
//                   deliver to the Resend account's own address. After verifying kaatconsult.com, set it to
//                   e.g. "Kaat Consult website <website@kaatconsult.com>"

const FIELDS = ['name', 'email', 'website', 'type', 'budget', 'message', 'consent'];
const LABELS = { name: 'Name', email: 'Email', website: 'Website', type: 'Type of business', budget: 'Monthly ad budget', message: 'What would you like to grow?' };

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let form;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: 'Invalid form data' });
  }

  // Honeypot: real visitors never see or fill this field
  if (String(form.get('company') || '').trim()) return json(200, { ok: true });

  const data = {};
  for (const f of FIELDS) data[f] = String(form.get(f) || '').trim().slice(0, f === 'message' ? 5000 : 300);

  const errors = {};
  if (!data.name) errors.name = 'Please add your name';
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Please enter a valid email';
  if (!data.consent) errors.consent = 'Please agree to the privacy policy';
  if (Object.keys(errors).length) return json(422, { errors });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return json(500, { error: 'Email is not configured' });
  }

  const rows = Object.entries(LABELS).filter(([k]) => data[k]);
  const text = rows.map(([k, label]) => `${label}: ${data[k]}`).join('\n\n');
  const html = `<h2 style="font-family:sans-serif">New free audit request</h2>` +
    rows.map(([k, label]) => `<p style="font-family:sans-serif"><strong>${label}</strong><br>${escapeHtml(data[k]).replace(/\n/g, '<br>')}</p>`).join('') +
    `<p style="font-family:sans-serif;color:#777;font-size:13px">Consent to be contacted: yes. Reply to this email to answer ${escapeHtml(data.name)} directly.</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Kaat Consult website <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO || 'kat@kaatconsult.com'],
      reply_to: data.email,
      subject: `Free audit request from ${data.name}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json(502, { error: 'Could not send email' });
  }
  return json(200, { ok: true });
};

export const config = { path: '/api/contact' };

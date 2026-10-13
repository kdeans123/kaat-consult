// Netlify Function: served at /api/contact
import handler from '../../lib/contact-handler.mjs';

export default handler;
export const config = { path: '/api/contact' };

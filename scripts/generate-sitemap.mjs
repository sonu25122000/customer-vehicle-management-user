// Writes public/sitemap.xml (served at /sitemap.xml) — runs automatically before every build
// (npm "prebuild"), and by hand with `npm run sitemap`.
//
// Lists the site's public pages plus one page per car on the site, fetched from the API. If the API
// can't be reached the sitemap still gets the fixed pages, and the build carries on.
//
//   SITE_URL     the website's address (default: the Vercel URL below)
//   SITEMAP_API  the backend API base (default: the deployed backend)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://customer-vehicle-management-user.vercel.app').replace(/\/+$/, '');
const API = (process.env.SITEMAP_API || 'https://customer-vehicle-management-backend.vercel.app/api').replace(/\/+$/, '');
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');

const today = new Date().toISOString().slice(0, 10);
const pages = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/cars', changefreq: 'daily', priority: '0.9' },
  { loc: '/signup', changefreq: 'monthly', priority: '0.5' },
  { loc: '/login', changefreq: 'monthly', priority: '0.4' },
];

async function carPages() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API}/portal/vehicles`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    return data.map((car) => ({ loc: `/cars/${car._id}`, changefreq: 'weekly', priority: '0.8' }));
  } catch (err) {
    console.warn(`sitemap: could not load cars (${err.message}) — writing the fixed pages only`);
    return [];
  }
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urls = [...pages, ...(await carPages())];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escape(SITE_URL + u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(OUT, xml);
console.log(`sitemap: wrote ${urls.length} URLs to public/sitemap.xml (${SITE_URL})`);

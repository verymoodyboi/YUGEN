// Import required Node.js modules using ES module syntax
import fs from 'fs';
import { create } from 'xmlbuilder2';

// Set the base URL for your website
const baseUrl = 'https://www.try-yugen.com';
const routes = ['/', 'about', 'login'];

// Create XML document
const urlset = create({ version: '1.0' }).ele('urlset', {
  xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
});

routes.forEach(route => {
  const url = urlset.ele('url');
  url.ele('loc').txt(baseUrl + route);
  url.ele('lastmod').txt(new Date().toISOString());
});

const xml = urlset.end({ prettyPrint: true });

// Write to sitemap.xml
fs.writeFileSync('./public/sitemap.xml', xml);

console.log('✅ Sitemap generated successfully!');

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://gigilcoiffure.be";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="nl" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />
  </url>
  <url>
    <loc>${BASE_URL}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/galerie</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/reservations</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url><loc>${BASE_URL}/vlechten-tongeren</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/nagels-tongeren</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/microshading-tongeren</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/beauty-salon-tongeren</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/kapster-tongeren</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/kapsalon-tongeren</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/box-braids-tongeren</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/extensions-tongeren</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/salon-coiffure-tongres</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/coiffeuse-tongres</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/braids-limburg</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/prijzen</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

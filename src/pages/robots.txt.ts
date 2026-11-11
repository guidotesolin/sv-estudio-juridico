import type { APIRoute } from "astro";

// Built from `site` so the sitemap URL can't drift from the domain in astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("robots.txt needs `site` in astro.config.mjs");

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site).href}\n`,
  );
};

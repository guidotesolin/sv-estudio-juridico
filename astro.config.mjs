import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  // B5: the domain is registered; it serves once DNS is delegated to Cloudflare.
  site: "https://estudiovidoni.com.ar",
  integrations: [sitemap()],
  // External stylesheets only, so the CSP can keep `style-src 'self'` (ARCHITECTURE.md "Security").
  build: { inlineStylesheets: "never" },
});

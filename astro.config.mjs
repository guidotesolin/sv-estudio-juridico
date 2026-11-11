import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: "https://estudiovidoni.com.ar",
  integrations: [sitemap()],
  // External stylesheets and scripts only, so the CSP keeps `style-src 'self'` and
  // `script-src 'self'` (ARCHITECTURE.md "Security"). Astro inlines a script under Vite's
  // assetsInlineLimit (4 KB) into the HTML; 0 turns that off.
  build: { inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
});

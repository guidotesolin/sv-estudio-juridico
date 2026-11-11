# SV | Estudio Jurídico

Website for a law practice in Santa Fe, Argentina. Static Astro site: a visitor understands what the
firm does, gets an indicative fee range and books a consultation.

Design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Task board: [docs/TASKS.md](docs/TASKS.md).

## Install

Requires Node from `.nvmrc` (current LTS; `nvm use` picks it up).

```bash
nvm use
npm ci
git config core.hooksPath .githooks
```

The last line enables the pre-commit hook, which refuses `.env` files and runs
[gitleaks](https://github.com/gitleaks/gitleaks) when it is installed.

## Scripts

| Script                            | Does                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Dev server                                            |
| `npm run build`                   | Static build into `dist/`                             |
| `npm run preview`                 | Serve the build                                       |
| `npm run lint`                    | ESLint, then Oxlint with the vendored anti-slop rules |
| `npm run format` / `format:check` | Prettier write / check                                |
| `npm run check`                   | `astro check` (types)                                 |

## Deploy

Cloudflare Pages builds the site from GitHub through its Git integration, so there is no deploy
token anywhere. One-time setup in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**, authorize the Cloudflare GitHub app for
   this repository only, and pick it.
2. Production branch: `main`. Framework preset: Astro. Build command: `npm run build`. Build
   output directory: `dist`. No environment variables: the build image reads the Node version
   from `.nvmrc`, so don't set `NODE_VERSION` (it would override `.nvmrc` and drift from it).
3. Save and deploy. Every push to `main` deploys production; every PR gets a preview URL.
4. **Custom domains → Set up a custom domain** → `estudiovidoni.com.ar`, then the same for
   `www.estudiovidoni.com.ar`. This needs the domain's DNS on Cloudflare: add the site to
   Cloudflare and replace the nameservers at NIC Argentina with the two Cloudflare gives
   (backlog B5).
5. A custom domain only serves the site, it doesn't redirect, so `www` would be a duplicate. In
   the domain's zone: **Rules → Redirect Rules → Create rule** → template "Redirect from WWW to
   root", status 301, preserve query string.

`public/_headers` sets the security headers (CSP, HSTS and the rest). `robots.txt` is generated
from `site` in `astro.config.mjs` (`src/pages/robots.txt.ts`) and points to the sitemap that
`@astrojs/sitemap` writes at build time, so a domain change is that one line.

After the first deploy, check [securityheaders.com](https://securityheaders.com) (grade A or
better), Lighthouse on `/` and `/cotizar`, and the browser console while completing a quote (no
CSP violations).

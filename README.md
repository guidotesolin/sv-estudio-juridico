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

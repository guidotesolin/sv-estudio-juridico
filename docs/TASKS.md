# SV | Estudio Jurídico — Task board

> The design and its reasoning live in [ARCHITECTURE.md](./ARCHITECTURE.md). Read it before
> executing any task: the cards here give scope, not the why.

## Workflow

- `main` starts with the skeleton (T0). Every task gets its own branch: `t1-<slug>`, `t2-<slug>`…
  The maintainer creates it, or orders Claude to.
- Each task is executed in an independent session that reads ARCHITECTURE.md and its own card.
  Every card states scope, dependencies and acceptance without relying on any prior conversation.
- Claude does not commit. It proposes the commit message and the ticket description; the
  maintainer reviews and runs it.
- Code is written with ponytail and must pass anti-slop.
- Values the client hasn't provided yet (fees, WhatsApp, email, Cal.com username) are never
  invented: fees are `null`, contact values are clearly fake placeholders listed in the backlog.

## Board

| ID | Branch | Depends on |
| -- | ------ | ---------- |
| T0 | `main` | — |
| T1 | `t1-design-system` | T0 |
| T2 | `t2-home` | T1 |
| T3 | `t3-service-pages` | T1 |
| T4 | `t4-quote-engine` | T0 |
| T5 | `t5-quote-ui` | T1, T4 |
| T6 | `t6-booking` | T5 |
| T7 | `t7-studio-faq-legal` | T1 |
| T8 | `t8-visual-identity` | T2, T3, T5, T6, T7 |
| T9 | `t9-seo-deploy` | T8 |

---

### T0 — Skeleton

Create the Astro project (latest stable) with **TypeScript strict** (`astro/tsconfigs/strict`) and
`output: "static"`. Add ESLint (flat config, `eslint-plugin-astro`, `typescript-eslint`), Prettier
(with `prettier-plugin-astro`), and **anti-slop** ([dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)):
install its skill with `npx skills add dmmulroy/anti-slop --skill install-anti-slop`, then run it
("install anti-slop in this repo"). It copies the rules into `tools/oxlint/anti-slop/`, installs
`oxlint` and `@oxlint/plugins` at the same exact version, creates `oxlint.config.ts` and enables the
generic rules. If a rule doesn't fit, turn it off in `oxlint.config.ts` and write why in
ARCHITECTURE.md. Fix order: `oxlint --fix`, Prettier, lint again. Scripts: `dev`, `build`, `preview`, `lint` (`eslint && oxlint`),
`format`, `format:check`, `check` (`astro check`). Add `tsx` as a dev dependency for future smoke
scripts.

Add: `.gitignore` (node_modules, dist, .astro, env files except `.env.example`, `.superpowers/`),
`.env.example` (comment saying the site needs no secrets; every config value is public and lives in
`src/data/site.ts`), `.githooks/pre-commit` and `.claude/settings.json` hooks exactly as in the
maintainer's manual (copied in the appendix below), `.claude/skills/task/SKILL.md` and
`.claude/skills/propose-commit/SKILL.md` (appendix), `.nvmrc` with the current Node LTS,
`.github/workflows/ci.yml` (on push to `main` and PRs: `npm ci`, lint, `format:check`, `check`,
build), `.github/dependabot.yml` (weekly, `npm` and `github-actions`), and a README with install
steps including `git config core.hooksPath .githooks`. `docs/` and `CLAUDE.md` already exist —
don't rewrite them.

A single placeholder `src/pages/index.astro` ("SV | Estudio Jurídico — en construcción") is enough.

_Output_: project skeleton, configs, hooks, CI, README.
_Acceptance_: `npm ci && npm run lint && npm run format:check && npm run check && npm run build`
all exit 0; `.githooks/pre-commit` is executable (`chmod +x`); after
`git config core.hooksPath .githooks`, `touch .env && git add -f .env && git commit -m test` fails
with the env-guard message (then `git rm --cached .env && rm .env`); `cat .github/dependabot.yml` lists both ecosystems.
_Commit_: `chore: scaffold astro project with lint, hooks and ci`

---

### T1 — Design system and base layout

Implement the tokens from ARCHITECTURE.md "Visual design" as CSS custom properties in
`src/styles/global.css` (names as in the tokens table). Self-host Figtree 400/600/700/800 with
`@fontsource/figtree` — **no Google Fonts link** (CSP). Build `src/layouts/BaseLayout.astro`
(`lang="es"`, title/description props, sticky header with the text wordmark "SV | Estudio Jurídico",
nav to Servicios (`/#servicios`) · Cómo trabajamos (`/#como-trabajamos`) · Sobre el estudio
(`/estudio`) · Preguntas (`/preguntas`), a "Reservar consulta" button → `calUrl("consulta-inicial")`,
and the footer with WhatsApp, email, "Atención presencial y remota · Santa Fe", privacy note and
disclaimer from ARCHITECTURE.md "Legal notices"). Components: `Button.astro` (primary, ghost, and
beige-on-dark variants, renders `<a>` when given `href`), `Card.astro`, `Band.astro` (full-bleed,
`dark` and `beige` variants).

Create `src/data/site.ts` with `whatsappNumber`, `email`, `calUsername`, and the three Cal.com event
slugs from ARCHITECTURE.md "Booking", using obvious placeholders (`"5490000000000"`,
`"contacto@example.com"`, `"sv-estudio"`) — backlog B4/B6 tracks the real ones. Add
`src/lib/booking.ts` with `calUrl(eventSlug)` → `https://cal.com/<calUsername>/<eventSlug>` (T6
extends it with notes). Match
[design/mockup-v1.html](./design/mockup-v1.html). Mobile first; works at 360px with a 16px gutter.
The nav collapses to a `<details>`-based menu on mobile (no JS).

_Output_: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{Button,Card,Band}.astro`, `src/data/site.ts`, `src/lib/booking.ts`.
_Acceptance_: lint, check and build pass; the placeholder index uses `BaseLayout` and renders all
three Button variants, a Card and both Band variants; `grep -r "fonts.googleapis" src` is empty;
by hand at 360px and 1280px: no horizontal scroll, keyboard focus visible on every link and button;
contrast of beige-on-dark and white-on-primary ≥ 4.5:1 (any contrast checker).
_Commit_: `feat(ui): add design tokens, base layout and core components`

---

### T2 — Home page

Build `/` per ARCHITECTURE.md "Site map": hero (label "Asesoramiento · Estrategia · Gestión",
headline, subtitle, three CTAs), four area cards linking to `/servicios/<area>` in a section with
`id="servicios"`, "Cómo trabajamos" 4-step beige band with `id="como-trabajamos"`, dark band
"¿Ya tenés un expediente en curso?" → `/expediente`. "Reservar una consulta" uses
`calUrl("consulta-inicial")` from T1. Icons: inline SVG or `astro-icon` — no icon CDN.

_Output_: `src/pages/index.astro`.
_Acceptance_: lint, check and build pass; `dist/index.html` contains the three CTA hrefs
(`/cotizar`, `https://cal.com/…/consulta-inicial`, `/expediente`) and four `/servicios/` links;
side by side with the mockup at 1280px the structure matches.
_Commit_: `feat(home): add landing page`

---

### T3 — Service pages

Define a content collection `services` (`src/content.config.ts`, Zod schema: `title`, `headline`,
`summary`, `order`, `documentation: string[]`, `notIncluded: string[]`) with one Markdown file per
area: `sucesiones`, `laboral`, `danos`, `civil`. Copy comes from ARCHITECTURE.md "Draft copy per
area"; the services list on each page is read from `src/data/prices.ts` if T4 is merged, otherwise
from a local list with the same ids/labels as ARCHITECTURE.md "Services per area" (and replace it
with the import once T4 lands — note it in the card on delivery). Page `src/pages/servicios/[area].astro` with the fixed
structure: what it solves, what's included, documentation, how it's charged ("Honorarios según ley
arancelaria, expresados en JUS. Pagable en cuotas."), not included, CTA "Cotizá tu caso" →
`/cotizar?area=<area>`. The daños page shows "No se garantiza un resultado".

_Output_: `src/content.config.ts`, `src/content/services/*.md`, `src/pages/servicios/[area].astro`.
_Acceptance_: lint, check and build pass; `ls dist/servicios` shows exactly 4 directories; each page
has the `/cotizar?area=<area>` link; a missing required frontmatter field fails the build (try it).
_Commit_: `feat(services): add service pages from content collection`
_Delivered_: T4 was not merged, so the services list is a local copy in
`src/pages/servicios/[area].astro` (`ponytail:` comment); replace it with the `prices.ts` import
once T4 lands.

---

### T4 — Fee table and quote engine

Implement ARCHITECTURE.md "Fees" and "Quote model" as pure logic, no UI. `src/data/prices.ts`:
`JUS_VALUE_ARS = 150062.72`, `CONSULTATION_FEE_JUS: number | null = null`,
`CASE_FILE_REVIEW_FEE_JUS: number | null = null`, and the services per area with
`fee: { minJus, maxJus } | null`. **Only `sucesiones/declaratoria` has a number (6–6 JUS); every
other fee is `null`.** Draft each service's `includes`/`excludes` (2–4 short Spanish items each,
from the area copy in ARCHITECTURE.md); B9 has the lawyer review them. When the fee is `null`,
`estimate` returns `{ unconfirmed: true, includes, excludes }` so the result screen still lists
them. `src/lib/quote.ts`: types for answers, `estimate(answers)` with the
complexity factors, `formatArs(n)` using `Intl.NumberFormat("es-AR", { style: "currency",
currency: "ARS" })`, and `buildSummary(answers, estimate)` → plain-text summary for booking notes
(Spanish, one line per item, no personal data).

`tools/quote-smoke.ts` (run with `tsx`, wired as `npm run quote:smoke`) asserts with
`node:assert`:
- declaratoria + sencillo → 6–6 JUS and `formatArs` gives `$ 900.376,32` (normalize the
  non-breaking space Intl inserts before comparing);
- declaratoria + conflicto → min 6 JUS, max 9 JUS;
- any `fee: null` service → `unconfirmed: true` with non-empty `includes`;
- `buildSummary` contains the area, service label and estimate.

_Output_: `src/data/prices.ts`, `src/lib/quote.ts`, `tools/quote-smoke.ts`, `package.json` script.
_Acceptance_: `npm run quote:smoke` exits 0 and prints the cases it checked; changing
`JUS_VALUE_ARS` makes the first assertion fail (try, then revert); lint, check and build pass; add
`quote:smoke` to CI.
_Commit_: `feat(quote): add jus fee table and estimate engine`

---

### T5 — Quote stepper UI

`src/pages/cotizar.astro` with one island (`<script>` in plain TS, imported from `src/lib/quote.ts`)
implementing the four steps in ARCHITECTURE.md "Quote model": Área → Servicio → Preguntas del área
→ Situación, then the result screen. `?area=` preselects step 1. Each step is a `<fieldset>` with
`<legend>` and real radio/checkbox inputs with labels; Atrás / Siguiente buttons; "paso N de 4";
a step can't advance without an answer (inline error, focus moves to it). Result screen: amount or
range in pesos with JUS below (one amount when min = max), "Honorarios a confirmar en la consulta"
when unconfirmed, "Pagable en cuotas", includes / excludes, "Tasas, aportes y gastos aparte",
consultation-fee notice, the disclaimer from ARCHITECTURE.md "Legal notices", and a "Reservar
consulta" button (href wired in T6; for now `calUrl("consulta-inicial")`). If "Plazo próximo" = sí,
the result leads with the urgent-deadline warning and a WhatsApp button. Nothing is stored
(no localStorage, no network calls).

_Output_: `src/pages/cotizar.astro`, island script.
_Acceptance_: lint, check and build pass; by hand: sucesiones → declaratoria → any answers →
sencillo shows `$ 900.376,32` and "6 JUS"; laboral → any service shows "a confirmar"; urgent
deadline shows the warning first; the whole flow works with keyboard only; `/cotizar?area=danos`
starts with daños selected; the Network tab shows no request after page load.
_Commit_: `feat(quote): add quote stepper page`

---

### T6 — Booking links and case-file page

Extend `calUrl(eventSlug, notes?)` in `src/lib/booking.ts` to append **only** `notes`
(URL-encoded `buildSummary` output). **Name and email never go in the URL.** First confirm in
Cal.com's current docs the query parameter that prefills the notes/"Additional notes" field and
record the doc URL in a comment. The quote result picks `consulta-revision-documental` when
complexity = "sencillo, con documentación", otherwise `consulta-inicial`. Build `/expediente` per
ARCHITECTURE.md "Site map" and "Draft copy per area": what the review covers (análisis del
expediente, segunda opinión, revisión de resoluciones y notificaciones, evaluación de alternativas,
escritos puntuales, revisión de liquidaciones y acuerdos), fee from `CASE_FILE_REVIEW_FEE_JUS`
(`null` → "a confirmar"), consultation-fee notice, scope disclaimer, CTA to `revision-expediente`.
Add a smoke check `tools/booking-smoke.ts` (`npm run booking:smoke`, added to CI): the URL contains
`notes=`, does not contain `name=` or `email=`, and round-trips a summary with accents and newlines.

_Output_: `src/lib/booking.ts`, `src/pages/expediente.astro`, `tools/booking-smoke.ts`.
_Acceptance_: `npm run booking:smoke` exits 0; lint, check and build pass; by hand with a real or
test Cal.com account: the booking page opens with the summary in the notes field and the created
event in Google Calendar shows it (if no account exists yet, say so in the delivery note and leave
B6 open).
_Commit_: `feat(booking): link quote result to cal.com and add case-file page`

---

### T7 — About, FAQ and legal

`/estudio`: profile, experience, training, how the firm works; one portrait slot that renders a
neutral placeholder block until the photo exists (B1). `/preguntas`: FAQ as `<details>` elements
covering costs and JUS (what a JUS is, that the value changes), consultation fee and its deduction,
installments, timelines, jurisdictions (Santa Fe; others case by case), what documentation to
bring, in-person vs video call, data privacy. Footer privacy note and disclaimers as in
ARCHITECTURE.md "Legal notices". Lawyer-specific facts (name, matrícula, bio) use clearly marked
placeholders `[Nombre de la abogada]`, `[Matrícula]`.

_Output_: `src/pages/estudio.astro`, `src/pages/preguntas.astro`, footer copy.
_Acceptance_: lint, check and build pass; `grep -rn "\[Nombre de la abogada\]\|\[Matrícula\]" src`
lists every placeholder (paste the output in the delivery note so B1 knows what to replace); FAQ
opens and closes with keyboard.
_Commit_: `feat(pages): add about, faq and legal notices`

---

### T8 — Visual identity and launch content

The last pass before going live: every page gets the finish the home got in T2, and the client
values that the site cannot launch without replace their placeholders. Read
[design/cord-style-reference.md](./design/cord-style-reference.md) and ARCHITECTURE.md "Visual
design" (Motion, Touch) first; the home (`src/pages/index.astro`) is the reference implementation.

**Identity assets.** An SVG of the text wordmark (Figtree 800 "SV" + 400 "| Estudio Jurídico", as
in the header) and an "SV" monogram derived from it, both in `src/assets/` — unless the client
provides a logo, in which case use that and note it. From them: the favicon set
(`public/favicon.svg` + a 180px `apple-touch-icon.png`) and the Open Graph image (1200×630, wordmark
on `--color-dark`, static PNG in `public/`). T9 only wires the tags.

**Every page to the home's bar.** `/servicios/*`, `/cotizar`, `/expediente`, `/estudio`,
`/preguntas`: section heading scale, cards with gated hover and `:active` feedback, the inset dark
banner where a page closes on a CTA, motion and touch rules from ARCHITECTURE.md. Fixes to shared
components go in the component, not per page. Run the `review-animations` and `mobile-native`
skills over every page and fix what they flag (or note why not).

**Footer.** Replace the T1 footer with cord's column layout: wordmark + one-line description;
Servicios (the four areas); Estudio (`/estudio`, `/preguntas`, `/expediente`); Contacto (WhatsApp,
email, "Atención presencial y remota · Santa Fe"). Privacy note and disclaimer stay below the
columns, unchanged.

**Launch content from the backlog.** Requires the client's answers before starting; any item not
provided stays a placeholder, keeps its backlog row open, and is listed in the delivery note.
- B1: lawyer's name, matrícula and bio replace the T7 placeholders; the portrait goes in
  `src/assets/` through `astro:assets` (`<Image>`, responsive, 20px radius, natural color).
- B4: real WhatsApp number and email in `src/data/site.ts`.
- B6: real `calUsername` in `src/data/site.ts`, once the account and the three event types exist.
- B9: apply the client's corrections to the draft copy (home, service pages, quote questions).
- B2, only if provided: fees in `src/data/prices.ts`. Not a launch blocker — `null` already shows
  "a confirmar".

_Output_: `src/assets/` (wordmark, monogram, portrait), `public/favicon.svg`,
`public/apple-touch-icon.png`, `public/og.png`, footer in `src/layouts/BaseLayout.astro`, page and
component polish, `src/data/site.ts`, updated ARCHITECTURE.md "Visual design" (mockup marked as
superseded), backlog rows closed.
_Acceptance_: lint, check and build pass; side by side at 360px and 1280px every page reads as the
same site as the home (no horizontal scroll, visible focus, AA contrast on every new pair); no
ungated `:hover` in `dist/_astro/*.css`; the `review-animations` verdict is Approve for every page;
`grep -rn "\[Nombre de la abogada\]\|\[Matrícula\]\|5490000000000\|contacto@example.com" src`
is empty, or each remaining hit is a value the client hasn't provided and is listed in the delivery
note; on a real phone (maintainer): no sticky hover, no tap flash, press feedback on every control.
_Commit_: `feat(ui): finish visual identity and launch content`

---

### T9 — SEO, security headers and deploy

Per-page `<title>` and meta description, Open Graph tags using T8's `public/og.png`,
`@astrojs/sitemap` (needs `site` in `astro.config` — use a placeholder domain until B5),
`robots.txt` (the favicon links went in with T8). `public/_headers` with
the headers in ARCHITECTURE.md "Security"; set `build.inlineStylesheets: "never"` or allow
`style-src 'self' 'unsafe-inline'` — decide by checking `dist/` and note the choice in
ARCHITECTURE.md. **`script-src` must be `'self'` only**: if Astro inlines a script, move it to an
external module. Write the deploy steps in the README: Cloudflare Pages → connect the GitHub repo
(Git integration, no API token), build `npm run build`, output `dist`, Node version from `.nvmrc`.
The maintainer does the dashboard part; Claude writes the steps.

_Output_: SEO tags, `public/_headers`, `public/robots.txt`, sitemap config, README deploy section.
_Acceptance_: lint, check and build pass; `dist/sitemap-index.xml` exists; `grep -rnP '<script(?![^>]*\bsrc=)[^>]*>' dist`
finds no inline scripts (JSON-LD, if added, is the only allowed exception); once deployed (maintainer): securityheaders.com grade A or better,
Lighthouse ≥ 95 in Performance, Accessibility, Best Practices and SEO on `/` and `/cotizar`, and the
browser console shows no CSP violations while completing a quote. If LCP misses the bar, check the
hero's load fade (it starts at `opacity: 0`) first.
_Commit_: `feat(seo): add meta, sitemap and security headers`

---

## Backlog

Things found while executing the board and deliberately left. Each one says why it was left and
who it belongs to. Shortcuts inside code are `ponytail:` comments instead.

| ID | What | Why it was left | Belongs to |
| -- | ---- | --------------- | ---------- |
| B1 | ~~Lawyer's name, matrícula, bio and portrait~~ | Done in T8: profile in `/estudio`, portrait in `src/assets/portrait.jpg` through `astro:assets` (WebP, 320/640w, 4:5 crop) | — |
| B2 | ~~Real fees in JUS~~ | Done in T8: every fee she gave, the consultation and the case-file review (0.5 JUS each), one open-ended ("desde 1 JUS"); four stay "a confirmar" by her decision | — |
| B3 | ~~Consultation payment method and timing~~ | Done in T8: paid at the end of the meeting, transfer preferred, cash if in person; in the two consultation descriptions on Cal.com, the review fee (0.5 JUS) in the third; profile name "SV & Asociados · Estudio Jurídico" | — |
| B4 | ~~WhatsApp number and contact email~~ | Done in T8: real WhatsApp and the firm's Gmail in `src/data/site.ts` | — |
| B5 | ~~Domain `estudiovidoni.com.ar`: DNS delegation to Cloudflare and `site` in `astro.config`~~ | Done in T9: delegated to Cloudflare (maintainer's account), served by Pages with `www` → apex 301; registered at NIC Argentina in the lawyer's name | — |
| B6 | ~~Cal.com account and event types~~ | Done in T8: account, Google Calendar, three event types, end-to-end test booking, profile photo | — |
| B7 | Fee amounts vs Santa Fe fee law minimums and bar ethics rules | Legal responsibility of the lawyer, not enforced by code | Client |
| B8 | 2FA and password manager on GitHub, Cloudflare, Cal.com, Google, NIC Argentina | Not code; the real attack surface | Maintainer and client |
| B9 | ~~Review of all draft copy~~ | Done in T8: profile copy, "Civil y comercial", succession card; the rest approved as drafted | — |
| B10 | Online payment of the consultation | Out of v1 scope ("up to the booking") | When the client wants to stop confirming transfers by hand |
| B11 | ~~Admin panel for fees~~ | Won't do: the maintainer edits `src/data/prices.ts` directly (`JUS_VALUE_ARS` covers JUS updates) | — |
| B12 | Monthly retainer for businesses ("abono") | Out of v1 scope | After v1 is live |
| B13 | Area answers moving the estimate | v1 sends them as notes only | When the lawyer defines how they weigh |
| B14 | Email on own domain | Optional cost | When the domain exists (Cloudflare Email Routing for receiving is free) |
| B15 | SMS/WhatsApp booking reminders | Paid in Cal.com; email reminders are free | If no-shows become a problem |
| B16 | Blog, analytics, CRM/case management | Out of v1 scope | When there's a concrete need |

---

## Appendix: files T0 copies verbatim

### `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path'); case \"$f\" in *.env|*.env.local|*.env.*) [ \"${f##*/}\" = \".env.example\" ] || { echo \"blocked: real env file. Use .env.example.\" >&2; exit 2; };; esac"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path'); case \"$f\" in *.ts|*.tsx|*.astro|*.css|*.mjs|*.json) npx prettier --write \"$f\" >/dev/null;; esac 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### `.githooks/pre-commit`

```sh
#!/bin/sh
# Keeps secrets out of history. Two layers:
#   1. hard guard on .env files, except the committable .env.example
#   2. gitleaks full content scan, when installed

staged=$(git diff --cached --name-only --diff-filter=ACM)

offenders=$(printf '%s\n' "$staged" \
  | grep -E '(^|/)\.env($|\.)' \
  | grep -vE '(^|/)\.env\.example$')

if [ -n "$offenders" ]; then
  echo "pre-commit: refusing to commit an env file:" >&2
  printf '%s\n' "$offenders" | sed 's/^/  /' >&2
  exit 1
fi

if command -v gitleaks >/dev/null 2>&1; then
  if ! gitleaks git --staged --redact 2>/dev/null && ! gitleaks protect --staged --redact; then
    echo "pre-commit: gitleaks found a secret. Nothing was committed." >&2
    exit 1
  fi
else
  echo "pre-commit: gitleaks not installed - only the env guard ran." >&2
fi
```

### `.claude/skills/task/SKILL.md`

```markdown
---
name: task
description: Start a task card from docs/TASKS.md (e.g. /task T7). Loads ARCHITECTURE.md and that one card, invokes ponytail.
disable-model-invocation: true
---

# Start a task card

The argument is a card ID (`T7`) or a branch name. Without one, print the board's pending rows
from `docs/TASKS.md` and stop.

1. **Read the card**: its board row (`Depends on`) and its `### T<n>` section. Read
   `docs/ARCHITECTURE.md` in full. Those two plus the card are the brief.
2. **Check dependencies.** If one is not marked done, say so and stop.
3. **Branch off an up-to-date `main`** (standing order from the maintainer): `git switch main`,
   `git pull`, `git switch -c <branch>` with the card's `Branch` from the board. If the tree is
   dirty or the branch already exists, stop and report it — do not stash.
4. **Invoke ponytail** before writing any code.
5. **Build to the card's acceptance criteria**, not beyond them. Shortcuts get a `ponytail:` comment.
6. **Verify** against `_Acceptance_`, then lint (ESLint and oxlint) and build. Report what ran and
   what it printed.
7. **Do not commit.** Finish with `/propose-commit`.
```

### `.claude/skills/propose-commit/SKILL.md`

````markdown
---
name: propose-commit
description: Propose the commit message and ticket description for the finished task. Claude does not commit; the maintainer reviews and runs it.
disable-model-invocation: true
---

# Propose the commit

The maintainer commits, never you. Produce the text they will use, and stop.

1. **Verify first.** `git status --porcelain` and `git diff`. Lint and build must have passed this
   session; if not, run them and report the real output.
2. **Take the message from the card's `_Commit_` line.** If the delivered scope diverged, propose
   the corrected message and explain the divergence in one line.
3. **English, conventional commits**, one short subject line, no trailer.
4. **Output exactly two blocks:** the `git add … && git commit -m "…"` command in a `bash` block,
   and the ticket description in a `markdown` block, ready to paste as the GitHub PR description
   (the PR title is the commit subject). English, this template, no prose outside it:

   ```markdown
   ## Summary

   - <what changed, one bullet per component or behavior, paths in `code`>

   ## Acceptance

   - [x] <criterion from the card's _Acceptance_>: <what it printed or showed>
   - [ ] <criterion not verified>: <why>

   ## Notes

   - <`ponytail:` shortcuts, backlog items earned, decisions the reviewer must make>
   ```

   Drop `## Notes` when it would be empty. Inline code only inside the description: no fences.

5. Flag anything the pre-commit hook will reject before they run it.
````

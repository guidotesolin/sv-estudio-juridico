# SV | Estudio Jurídico — Architecture

> Source of truth for the design. The task board lives in [TASKS.md](./TASKS.md).
> Each task is executed by an independent session that reads these two documents and nothing else.

## Context

A lawyer in Santa Fe, Argentina, wants a website for her practice, "SV | Estudio Jurídico". Today
there is nothing: no site, logo, photos, domain, or published fee table. Prospective clients reach
her by word of mouth and WhatsApp, and every inquiry starts with the same back-and-forth: what can
you do for me, how much does it cost, when can we meet.

The site replaces that exchange. A visitor arrives with a concrete problem (an inheritance, a
dismissal, an accident, a contract), understands what the firm can do, **sees an indicative fee
range, and books a paid consultation on their own**. It is not a classic "areas of practice"
brochure.

The idea comes from a ChatGPT conversation the client had
(<https://chatgpt.com/share/6adb67fd-c848-83e9-8d0c-a0634f6d5d92>). Everything a task needs from it
is copied into this document; no task has to open that link.

**Success for v1**: a visitor can go from the home page to a booked consultation in Google Calendar
without writing a single message, and the lawyer receives the quote summary inside the calendar
event.

**Anti-goals**: publishing fee numbers the lawyer has not confirmed; asking for sensitive case
details before a consultation; looking like an old-fashioned law-firm site.

## Language conventions

| Layer | Language |
| ----- | -------- |
| All code and documentation: identifiers, comments, commits, branch names, `docs/`, README | **English** |
| Conversation with Claude | **Spanish** (Rioplatense, voseo) |
| User-facing product copy | **Spanish (Argentina), voseo** — "Cotizá tu caso", "Reservá una consulta" |

- No hybrids: `getServiceBySlug`, never `getServicioBySlug`. CSS class names are identifiers too.
- Route slugs are user-facing, so they are Spanish: `/cotizar`, `/servicios/sucesiones`,
  `/expediente`, `/estudio`, `/preguntas`. The code that defines them is English.
- Legal terms with no clean English equivalent keep the Spanish word inside English identifiers'
  _values_, never in identifiers: `{ id: "declaratoria", label: "Declaratoria de herederos" }` is fine;
  the type is `Service`, not `Tramite`.

## Stack

All rows are Claude's calls (the maintainer delegated the stack), except where noted.

| Layer | Choice | Why |
| ----- | ------ | --- |
| Framework | Astro + TypeScript strict, `output: "static"` | Content site with one interactive island; no server needed |
| Interactivity | One Astro island in plain TypeScript (no UI framework) | A single stepper does not justify React |
| Content | Astro content collection (Markdown) for the 4 service pages | Repeatable structure per area |
| Fees | `src/data/prices.ts`, typed, in **JUS** units | Santa Fe fee law sets fees in JUS (maintainer/client decision) |
| Booking | Cal.com free plan, connected to the lawyer's Google Calendar, reached by **outbound link** | She already uses Google Calendar (client decision); no backend |
| Contact | WhatsApp link + `mailto:` | No form backend |
| Font | Figtree, **self-hosted** via `@fontsource/figtree` | Strict CSP with no third-party origins |
| Hosting | Cloudflare Pages (free), deployed through its Git integration | Free tier allows commercial use (Vercel Hobby does not); no deploy token to leak |
| Lint | ESLint + Oxlint with [anti-slop](https://github.com/dmmulroy/anti-slop) rules copied into the repo, Prettier | Maintainer's standard |
| Checks | `tools/*-smoke.ts` run with `tsx`, wired as `npm run <thing>:smoke` | One runnable check per non-trivial logic, no test framework |

## Scope: "up to the booking"

Maintainer decision. The visitor quotes, sees a range, and books. **No online payment** in v1.

Out of scope for v1 (each is a backlog item): online payment, admin panel, CRM or case management,
monthly retainer for businesses ("abono"), blog, analytics.

## Visual design

The palette is the one ChatGPT proposed (dark green, beige, white) — maintainer decision. Structure
and components follow the Refero "cord.com" style
(<https://styles.refero.design/style/485ae5fb-8f25-4aa3-a4e4-1deb1590d7d6>): centered stacked hero,
heavy display headlines, rounded cards, one inset dark banner near the end, sticky top bar with a
text wordmark. The full extraction, with notes from the live site, is
[design/cord-style-reference.md](./design/cord-style-reference.md): it is the reference for scale,
spacing and interaction; its navy/blue palette does not apply.

The approved mockup is [design/mockup-v1.html](./design/mockup-v1.html): it fixes the structure and
copy of the home. It is a compressed preview, so for proportions (hero size, section headings,
banner) the cord reference wins. Its copy and amounts are placeholders.

### Tokens

| Token | Value | Use |
| ----- | ----- | --- |
| `--color-canvas` | `#fbf8f2` | Page background |
| `--color-card` | `#ffffff` | Cards, inputs |
| `--color-beige` | `#efe6d8` | Process band, quote result, button on dark band |
| `--color-border` | `#e8e0d2` | All hairlines and borders |
| `--color-text` | `#1d3329` | Body and headings — never pure black |
| `--color-text-secondary` | `#4d6359` | Supporting copy |
| `--color-text-muted` | `#6b7f74` | Labels, meta |
| `--color-primary` | `#24493b` | Primary buttons, active states, icons — the only accent |
| `--color-dark` | `#1f3d33` | Dark closing banner (gradient from `--color-primary`) |
| `--color-selected` | `#eef3ef` | Selected option background, icon tiles, ghost button hover |
| `--color-primary-hover` | `#1b382d` | Primary button hover |
| `--color-beige-hover` | `#e4d7c2` | Beige button hover |

- **Type**: Figtree 400 body, 600 emphasis and buttons, 700 subheadings, 800 display. Display uses
  negative tracking (about −0.5px). Home hero `clamp(40px, 6vw, 72px)` at line-height 1 (cord uses
  100px; our headline is longer and 72px is the most that keeps it on two lines); section headings
  `clamp(32px, 5vw, 48px)` weight 700 with an 18px lead line. Body line-height 1.5.
- **Shape**: cards 20px radius, buttons and inputs 24px, options 14px. No corner under 8px.
- **Shadows**: tinted green, `rgba(31, 61, 51, 0.04–0.08)`; e.g. cards `0 12px 48px`. No gray shadows.
- **Layout**: max width 1200px, 4px spacing base, 64px between sections, 16px side gutter on mobile.
  Home hero padding `clamp(64px, 14vw, 180px)`. The dark banner is inset in the container (radius
  up to 80px, padding up to 60px), not full-bleed.
- **Motion** (rules from the `emil-design-eng` / `review-animations` skills): hover and color
  changes use `--transition` (0.15s `ease`); entrances and movement use `--ease-out`
  (`cubic-bezier(0.23, 1, 0.32, 1)`). Every pressable gets `:active` feedback (`scale(0.97)`, cards
  `0.98`, 160ms). Hero and area cards enter with opacity + 8px `translateY` (400ms, 80ms stagger);
  card arrows nudge 4px on hover. `prefers-reduced-motion` keeps the fades and drops every
  transform. No `transition: all`, no `ease-in`, UI motion under 300ms.
- **Touch** (`mobile-native` skill): every `:hover` lives inside
  `@media (hover: hover) and (pointer: fine)` and has an `:active` twin; `global.css` sets
  `-webkit-tap-highlight-color: transparent`, `-webkit-text-size-adjust: 100%`,
  `touch-action: manipulation` on `a, button, summary` and `user-select: none` on controls only.
  Inputs (T5) use at least 16px text. `theme-color` matches the header (`#fbf8f2`).
- **One accent only.** No second brand color.
- **Logo**: text wordmark "SV | Estudio Jurídico" (no logo exists).
- **Imagery**: the design works without photos. `/estudio` keeps one slot for a portrait.
- **Accessibility**: beige-on-green and green-on-beige pairs must pass WCAG AA; visible focus rings;
  every option in the quote stepper is a real `<input type="radio">` with a `<label>`.

## Site map

| Route | Content |
| ----- | ------- |
| `/` | Hero ("Soluciones jurídicas claras. Un camino concreto para avanzar.") with three CTAs: **Cotizar mi caso** → `/cotizar`, **Reservar una consulta** → Cal.com, **Ya tengo un expediente** → `/expediente`. Four area cards → `/servicios/<area>`. "Cómo trabajamos" in 4 steps (Contanos tu situación · Recibí un rango · Elegí día y hora · Definí cómo avanzar). Dark band "¿Ya tenés un expediente en curso?". Footer. |
| `/servicios/sucesiones`, `/servicios/laboral`, `/servicios/danos`, `/servicios/civil` | Fixed structure per area: what it solves, what's included (the area's services), documentation to bring, how it's charged, what's not included, CTA to `/cotizar?area=<area>`. |
| `/cotizar` | The quote stepper (see "Quote model"). |
| `/expediente` | Review of an ongoing case file: what the review covers, fixed fee, scope disclaimer, CTA to the Cal.com "Revisión de expediente" event. |
| `/estudio` | About the firm: profile, experience, training, how they work. Portrait slot. |
| `/preguntas` | FAQ: costs and JUS, consultation fee, installments, timelines, jurisdictions, documentation, in-person vs remote. |
| Footer (all pages) | WhatsApp, email, "Atención presencial y remota · Santa Fe", privacy note, legal disclaimer. |

### Draft copy per area

Copy below is a **draft taken from the ChatGPT conversation**; the lawyer reviews it (backlog B9).

- **Sucesiones** — "Resolvé una herencia con claridad y acompañamiento jurídico." Te acompañamos en
  la organización y tramitación de sucesiones, desde el análisis inicial de la documentación hasta
  las gestiones necesarias para avanzar con la transmisión de los bienes.
- **Laboral** — "Conocé tus opciones antes de tomar una decisión laboral." Analizamos tu situación
  laboral, revisamos la documentación disponible y te explicamos las alternativas para reclamar tus
  derechos o resolver un conflicto. Also serves employers.
- **Daños y perjuicios** — "Evaluá tu reclamo y las posibilidades de reparación del daño."
  Estudiamos los hechos, la documentación y las pruebas para determinar las alternativas frente a un
  accidente o un daño sufrido, y acompañamos las gestiones extrajudiciales o judiciales. No result is
  guaranteed — say so.
- **Civil y otros asuntos** — "Asesoramiento jurídico para tomar decisiones con respaldo."
  Orientación y estrategias para prevenir conflictos, revisar documentación y gestionar controversias
  personales, patrimoniales y comerciales.
- **Expediente en curso** — Podemos ayudarte a comprender el estado de tu proceso, revisar
  documentación y evaluar los pasos que podrían corresponder. Must state: reviewing a file does not
  mean taking over the case or replacing the current lawyer; scope is agreed beforehand.

## Fees

Client decision: fees are charged **in JUS** as Santa Fe's fee law sets them. Example given by the
client: _declaratoria de herederos_ = 6 JUS; with 1 JUS = $150.062,72 that is **$900.376,32**.
Installment plans exist. The maintainer (not the client) edits the table in the repo; there is no
admin panel.

`src/data/prices.ts` holds:

- `JUS_VALUE_ARS` — one number (today `150062.72`). When the JUS changes, this is the only edit.
- `CONSULTATION_FEE_JUS` and `CASE_FILE_REVIEW_FEE_JUS` — `number | null`.
- Per area, a list of services: `{ id, label, fee: { minJus, maxJus } | null, includes, excludes }`.

**`fee: null` means "not confirmed by the lawyer"** and the UI shows "Honorarios a confirmar en la
consulta" instead of a number. This is the guard against the main anti-goal: **no invented amount
ever ships**. Only fees the client has given go in as numbers; today that is declaratoria = 6 JUS.

Amounts must respect the minimums of Santa Fe's fee law and bar ethics rules. That is the lawyer's
responsibility; the code does not enforce it.

### Services per area (draft)

| Area | Services (`id` — label) |
| ---- | ----------------------- |
| `sucesiones` | `inicio` — Inicio de sucesión · `declaratoria` — Declaratoria de herederos (**6 JUS**) · `inscripcion` — Inscripción de inmuebles y vehículos · `adjudicacion` — Inscripción y adjudicación de bienes · `conflicto` — Sucesión con conflicto entre herederos |
| `laboral` | `telegramas` — Intercambio telegráfico · `liquidacion` — Liquidación y revisión de indemnización · `acuerdo` — Revisión de acuerdo o propuesta · `conciliacion` — Conciliación o reclamo administrativo · `judicial` — Representación judicial |
| `danos` | `aseguradora` — Reclamo ante la aseguradora · `negociacion` — Negociación de acuerdo · `judicial` — Demanda y representación judicial |
| `civil` | `contrato` — Revisión o redacción de contrato · `intimacion` — Carta documento o intimación · `cobro` — Cobro extrajudicial de deuda · `informe` — Informe jurídico o segunda opinión · `escrito` — Escrito o presentación puntual |

## Quote model

Claude's call; rules are a draft for the lawyer to review (backlog B9).

**Steps** in `/cotizar` (an `?area=` query param preselects step 1):

1. **Área** — sucesiones · laboral · daños · civil.
2. **Servicio** — the area's services from the table above.
3. **Preguntas del área** — see below. They go into the booking notes; **they do not move the price**
   in v1.
4. **Situación** — common questions:
   - _Etapa_: no inicié nada · ya hay un expediente en curso · necesito una etapa puntual.
   - _Complejidad_: sencillo, con documentación · varias personas o reclamos · conflicto, oposición o
     cuestiones técnicas · no sé.
   - _Plazo próximo_: no · sí, tengo una audiencia, notificación o vencimiento.

**`estimate(answers)`** is a pure function in `src/lib/quote.ts`:

- Returns `{ unconfirmed: false, minJus, maxJus, minArs, maxArs, includes, excludes }` or
  `{ unconfirmed: true, includes, excludes }`.
- `fee: null` → the unconfirmed shape.
- `minJus` = the service's `minJus` (the legal floor — complexity never lowers it).
- `maxJus` = the service's `maxJus` × complexity factor: sencillo 1 · varias personas 1.25 ·
  conflicto 1.5 · no sé 1.5.
- ARS = JUS × `JUS_VALUE_ARS`, rounded to cents, formatted with `Intl.NumberFormat("es-AR",
  { style: "currency", currency: "ARS" })`.
- When min = max, the UI shows one amount, not a range.

**Result screen** shows: the amount or range (pesos, with JUS underneath), "Pagable en cuotas",
what's included and not, "Tasas, aportes y gastos aparte", the consultation-fee notice (see
"Consultation fee"), the disclaimer, and the **Reservar consulta** button.

If _Plazo próximo_ = sí, the result screen leads with a warning: "Si tenés un plazo corriendo,
escribinos ya por WhatsApp para verificarlo" + WhatsApp button.

### Area questions (draft)

None of these ask for names, ID numbers, amounts of money, or documents.

- **Sucesiones**: ¿Cuántas personas fallecieron? (una · más de una) · ¿Cuántos herederos hay?
  (1 a 3 · 4 o más · no sé) · ¿Hay testamento? (sí · no · no sé) · ¿Hay desacuerdo entre herederos?
  (sí · no) · ¿Qué bienes hay? (multi: inmuebles · vehículos · cuentas o dinero · otros) ·
  ¿Dónde? (Santa Fe · otra provincia).
- **Laboral**: ¿Consultás como trabajador o empleador? · ¿Cómo estaba registrada la relación?
  (registrada · no registrada · registrada en parte) · ¿Hubo despido o desvinculación? (sí · no) ·
  ¿Hubo telegramas, acuerdos o reclamos previos? (sí · no).
- **Daños**: ¿Qué pasó? (accidente de tránsito · otro hecho) · ¿Hubo lesiones? (sí · no) ·
  ¿Hubo daños materiales? (sí · no) · ¿Interviene una aseguradora? (sí · no · no sé) ·
  ¿Ya hay denuncia, reclamo o expediente? (sí · no) · ¿Tenés fotos, presupuestos o informes?
  (sí · algunos · no).
- **Civil**: ¿Hay otra parte involucrada? (persona · empresa · organismo) · ¿Ya hubo intimaciones o
  reclamos? (sí · no).

## Booking

Client decision: bookings land in the lawyer's **Google Calendar**. Claude's call: **Cal.com** (free
individual plan) connected to that calendar, reached by an **outbound link** — no embed, so no
third-party script or cookies on the site.

**Event types** (created in Cal.com by the client or maintainer — Claude does not create accounts):
`consulta-inicial`, `consulta-revision-documental`, `revision-expediente`. Each offers in-person
(Santa Fe) or video call.

- The quote result links to `consulta-inicial`, or `consulta-revision-documental` when the visitor
  said documentation is available (_Complejidad_ = sencillo, con documentación).
- `/expediente` links to `revision-expediente`.
- The home "Reservar una consulta" links to `consulta-inicial` with no notes.

**Prefill**: the link carries **only `notes`** — the quote summary (area, service, stage,
complexity, deadline flag, area answers, estimate). **Name and email never go in the URL**; the
visitor types them in Cal.com. Rationale: URLs end up in browser history, server logs and referrers.
The `notes` prefill parameter must be verified against Cal.com's current docs in T6.

Public booking/contact values (Cal.com username, event slugs, WhatsApp number, email) live in
`src/data/site.ts`. They are public, not secrets, so they are not env vars.

## Consultation fee

Client decision: **the consultation is paid, and its amount is deducted from the total if the client
then hires the firm**. The quote result and `/expediente` show: "La consulta se abona y se descuenta
del total si iniciás el trabajo con el estudio." The amount comes from `CONSULTATION_FEE_JUS`
(`null` → "a confirmar").

How and when it is paid (transfer alias, before or at the meeting) is written by the lawyer in the
Cal.com confirmation text, so she changes it without touching code.

## Legal notices

Always visible where they apply:

- On the quote result: "Esta estimación es orientativa. No crea una relación profesional ni implica
  la aceptación del caso. Los honorarios no incluyen tasas, aportes ni gastos."
- On `/expediente`: the review does not imply taking over the case or replacing the current lawyer.
- On daños pages: no result is guaranteed.
- Footer privacy note: the site stores no personal data; booking data is handled by Cal.com and
  Google Calendar; the quote form asks for no sensitive information (Ley 25.326).

## Security

The site is static: no server, database, login, or stored form data. What remains:

- **No personal data in URLs** (see "Booking").
- **No secrets in the repo**: there are none to begin with (every config value is public), and the
  pre-commit hook still refuses `.env` files and runs gitleaks. Claude's hooks block reading real env
  files.
- **No deploy token**: Cloudflare Pages builds from GitHub through its Git integration.
- **Security headers** in `public/_headers`: `Content-Security-Policy` (`default-src 'self'`; no
  third-party origins — hence self-hosted fonts), `Strict-Transport-Security`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (camera, microphone, geolocation off), `X-Content-Type-Options: nosniff`. Astro must not emit
  inline scripts that would force `'unsafe-inline'` in `script-src`.
- **Dependabot** (`.github/dependabot.yml`) for npm and GitHub Actions.
- **Accounts**: 2FA on GitHub, Cloudflare, Cal.com, Google and NIC Argentina, plus a password
  manager. That is the real attack surface (whoever takes the domain takes the site and the email).
  Not code — owned by the maintainer and the client (backlog B8).

## Costs

Everything is free except the domain (`.com.ar`, yearly, NIC Argentina). Optional: email on the own
domain (receiving is free with Cloudflare Email Routing; sending from it needs a paid service), and
SMS/WhatsApp reminders in Cal.com (paid; email confirmations are free). The Cal.com free plan shows
its own branding on the booking page.

## Open items with the client

Tracked as backlog items in [TASKS.md](./TASKS.md#backlog):

- Lawyer's full name, matrícula, bio, photo.
- Real fees in JUS per service; consultation fee; case-file review fee; installment terms.
- Consultation payment method and timing (goes in the Cal.com confirmation text).
- Domain, WhatsApp number, email.
- Cal.com account and event types.
- Review of all draft copy and quote questions.

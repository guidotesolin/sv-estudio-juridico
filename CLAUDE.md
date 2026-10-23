# SV | Estudio Jurídico — CLAUDE.md

Design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Task board: [docs/TASKS.md](docs/TASKS.md).
Start a task with `/task T<n>`; finish with `/propose-commit`.

Sections 1–4 below are translated from the maintainer's project manual.

---

## 1. Ground rules for Claude

They take precedence over any default behavior **and over any skill or plugin**. They go verbatim
into the project's `CLAUDE.md` (or `AGENTS.md`) and into Claude's memory.

1. **Never commit.** Not even when asked for "a commit". Asking for a commit means writing the
   message, giving the exact command, and stopping there. The maintainer reviews the diff and runs
   it.
2. **No action that changes history or leaves the machine without an explicit order in that same
   message**: `git commit`, `git push`, `git reset` over committed work, rebases, PRs, merges.
3. **Never create a branch or a worktree unless asked**, under any circumstances. Not as
   preparation, not "to keep things tidy". A fix found while working on a task goes on that task's
   branch.
4. **Do only what was asked.** If something related is worth doing, mention it in one line of the
   reply and let the maintainer decide.
5. **If something was committed by mistake**: `git reset --mixed` back to the maintainer's last
   commit (the changes stay in the working tree) and say so plainly.
6. **Report what actually ran.** Never claim lint, build or a check passed without having run it in
   this session and seen the output.

## 2. Language conventions

| Layer | Language |
| ----- | -------- |
| **All code and documentation**: identifiers, tables, columns, comments, commits, branch names, `docs/`, README | **English** |
| **Conversation with Claude** | **Spanish** (Rioplatense, voseo) |
| **User-facing product copy** | The audience's language; decided per project in `ARCHITECTURE.md` |

- No hybrids: `getPhotoBySlug`, never `getFotoBySlug`. CSS class names are identifiers too.
- A task report is mixed on purpose: Spanish prose around an English commit message. That is
  correct, not an oversight.
- The README may have a translated version (`README.es.md`); `docs/` stays in English.

## 3. Commit messages

- A single conventional-commits line, in English, imperative mood, under ~70 characters, no final
  period: `feat(admin): …`, `fix(gallery): …`, `perf(cache): …`, `docs: …`, `chore: …`.
- A body only if there is something the diff doesn't show (a migration to run, a pending backlog
  item), and then one line.
- **No `Co-Authored-By`, no `Generated with`, no trailer of any kind**, even if the environment
  suggests one.
- Reasoning lives in code comments and in `docs/`, not in `git log`.

Claude hands it over like this and stops:

```bash
git add <paths> && git commit -m "feat(scope): imperative summary"
```

## 4. Skills and plugins

Installed once, at user level, and available in every project. Anti-slop is the exception: it is
copied into each repo.

**Precedence rule:** the rules in sections 1 to 3 override any skill. Several of these skills
include `git commit`, branch or worktree steps; Claude skips them and proposes the commit instead
(section 3).

### Ponytail: write the least code that works

Every task session invokes it before writing code (`Skill: ponytail:ponytail`).

- YAGNI first. Reuse what's already in the repo, then the standard library, then native platform
  features, then already-installed dependencies. A new dependency needs a reason.
- No abstraction nobody asked for, no structure "for later", the shortest diff that works, once the
  problem is truly understood.
- Fixing a bug = fixing the root cause: find every caller of a shared function before touching it.
- Deliberate shortcuts get a `ponytail:` comment naming the limit and the way out:
  `// ponytail: O(n) scan, add an index when rows > 10k`. `grep -rn "ponytail:" src tools` lists
  them (or `/ponytail-debt`).
- Every piece of non-trivial logic leaves **one** runnable check (a `tools/<thing>-smoke.ts` wired
  as `npm run <thing>:smoke`), not a test framework.
- Never simplified away: validation at trust boundaries, error handling that prevents data loss,
  security, and basic accessibility.

### Superpowers: the work process ([obra/superpowers](https://github.com/obra/superpowers))

```bash
claude plugin install superpowers@claude-plugins-official
```

Process skills Claude invokes on its own depending on the situation. The ones used most in this
workflow:

| Skill | When |
| ----- | ---- |
| `brainstorming` | When planning the project or a new task, before designing |
| `writing-plans` | To break a large task into steps |
| `systematic-debugging` | For any bug or failing test, before proposing a fix |
| `test-driven-development` | Non-trivial logic: the check first |
| `verification-before-completion` | Before saying "done": run and show the output |
| `requesting-code-review` | When closing a task, before `/propose-commit` |
| `receiving-code-review` | When processing what a review returned |

Conflicts with the rules, resolved in favor of section 1:

- `writing-plans` and `subagent-driven-development` add a "Commit" step to each task: it is
  replaced by "propose the commit".
- `using-git-worktrees` and `finishing-a-development-branch` create worktrees, merge or open PRs:
  only with an explicit order.
- Plans generated by `writing-plans` go in `docs/`, in English, and do not replace `TASKS.md`.

### Caveman: short replies ([JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman))

```bash
claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
```

Compresses the prose of replies (less filler, fewer tokens) without touching code, commands, paths
or error messages. Turned on with `/caveman` (levels `lite`, `full`, `ultra`) and off with
"normal mode".

- **It respects the language**: it keeps replying in Spanish; it compresses the style, not the
  language.
- Complements ponytail: ponytail trims what Claude _builds_, caveman what it _says_.
- The skill only. The proxy (`caveman setup --install`) changes `ANTHROPIC_BASE_URL` in
  `~/.claude/settings.json` and breaks Remote Control; it is not installed.
- Explanations explicitly asked for (a report, a ticket description, the docs) are written in full.

### Anti-slop: lint rules against sloppy code ([dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop))

Only for TypeScript/JavaScript projects. It is not an npm package: it is a set of
[Oxlint](https://oxc.rs) rules **copied into the repo** (`tools/oxlint/anti-slop/`) that become
project code, editable. Installed with its skill:

```bash
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

and then asking Claude "install anti-slop in this repo". The skill copies the rules, installs
`oxlint` and `@oxlint/plugins` at the same exact version, creates or completes `oxlint.config.ts`,
enables all generic rules and validates it. If the repo uses Effect, it enables that group too.

What it rejects, in short:

- **Types without evidence**: `unknown` in parameters, returns or aliases,
  `Record<string, unknown>`, `object` as a parameter, chained `as`, widening to `unknown` to cast
  back.
- **Unjustified casts**: every `as` needs a `// SAFETY: <invariant>` comment next to it.
- **Loose `typeof`**: external data is parsed at the boundary (with a schema), not checked along
  the way.
- **Expensive or noisy patterns**: chained `.filter().map()`, reducers that copy the accumulator,
  `Reflect.get`/`Reflect.apply`, conditional spreads `...(x ? {x} : {})`.
- **Tests with module mocks** (`vi.mock`, `jest.mock`): injecting the real dependency is
  preferred.
- **Names with `Shape`** and missing blank lines between blocks (the latter with autofix).

How it fits:

- It goes in **T0**, alongside ESLint and Prettier. The lint script runs both:
  `"lint": "eslint && oxlint"`. Fix order: `oxlint --fix`, then Prettier, then lint again.
- CI and every task's verification step run it.
- It is opinionated on purpose. If a rule doesn't fit the project, turn it off in
  `oxlint.config.ts` and write down why in `ARCHITECTURE.md`. `no-runtime-typeof` pushes toward a
  schema library (e.g. Zod): if the project doesn't want one, enable `allowInTypeGuards`.
- To update the rules, ask Claude "update anti-slop keeping local changes"; the skill merges, it
  doesn't overwrite the copy.

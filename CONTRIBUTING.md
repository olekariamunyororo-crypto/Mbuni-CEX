# Contributing to Mbuni CEX

Thanks for taking the time to contribute! 🦬 (Yes, that's an ostrich emoji — close enough.)

This document covers everything you need to know to set up the project, make changes, and get them merged.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Storybook](#storybook)
- [Changelog](#changelog)
- [Database Changes](#database-changes)
- [Working on Specific Areas](#working-on-specific-areas)
  - [Matching Engine](#matching-engine)
  - [Auth & Sessions](#auth--sessions)
  - [UI Components](#ui-components)
  - [Infra / Helm / Docker](#infra--helm--docker)
- [Releasing](#releasing)
- [Getting Help](#getting-help)

---

## Code of Conduct

Be kind. Be patient. Assume good intent. Disagreements happen — focus on the work, not the person. Personal attacks, harassment, or discrimination of any kind will not be tolerated.

By participating, you agree to abide by the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Project Setup

You'll need:

| Tool | Version | Why |
|---|---|---|
| Node.js | 20+ | Next.js 16 runtime |
| Bun | 1.1+ | Recommended package manager + script runner |
| Git | any | Version control |

### First-time setup

```bash
# 1. Fork + clone the repo (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/Mbuni-CEX.git
cd Mbuni-CEX
git remote add upstream https://github.com/olekariamunyororo-crypto/Mbuni-CEX.git

# 2. Install dependencies
bun install
# ↑ This also installs the husky pre-commit hook automatically (via the
#   "prepare" script in package.json). The hook runs lint-staged + unit
#   tests + a secret scan before every commit.

# 3. Configure env
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET (any 32+ char string for dev is fine)

# 4. Set up the database
bun run db:push

# 5. (Optional) Seed demo users
bun run db:seed

# 6. Start the dev server
bun run dev
```

Open <http://localhost:3000> — you should see the splash screen, then the welcome carousel.

### Useful dev scripts

```bash
bun run dev          # Hot-reloading dev server on :3000
bun run lint         # ESLint check
bun run db:push      # Apply schema changes to local DB
bun run db:generate  # Regenerate Prisma Client after editing schema.prisma
bunx tsx scripts/check-db.ts    # Inspect users + onboarding state
```

---

## Development Workflow

We use a **fork + feature-branch** workflow:

```bash
# Sync your fork with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Create a feature branch
git checkout -b feat/my-new-thing

# Make changes, commit, push
git add .
git commit -m "feat(trading): add stop-limit order type"
git push -u origin feat/my-new-thing

# Open a PR on GitHub: your-fork:feat/my-new-thing → upstream:main
```

### Branch naming

Use a prefix that matches the type of change:

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code reorganization, no behavior change |
| `docs/` | Documentation only |
| `chore/` | Build, deps, CI, tooling |
| `perf/` | Performance improvements |
| `test/` | Test additions or fixes |
| `infra/` | Docker, Helm, k8s, deployment |

Examples: `feat/stop-limit-orders`, `fix/splash-loop-on-reload`, `docs/deployment-guide`.

---

## Code Style

### Enforced by ESLint

Run `bun run lint` before pushing. The config lives in `eslint.config.mjs` and uses `eslint-config-next` + `@typescript-eslint`.

Key rules:

- **TypeScript strict mode** — no implicit `any`, no unchecked index access.
- **`react-hooks/exhaustive-deps`** — every dependency of `useEffect` / `useMemo` / `useCallback` must be in the dep array.
- **`react-hooks/set-state-in-effect`** — don't call `setState` directly inside `useEffect`. Compute state during render instead, or move the side-effect to an event handler.
- **No `@ts-ignore`** — use `@ts-expect-error` with a comment if you absolutely must suppress a TS error, and only as a last resort.

### Formatting

The project doesn't use Prettier — ESLint handles formatting. General conventions:

- **2-space indentation**
- **Double quotes** for strings (matches the existing codebase)
- **Semicolons** — always
- **Trailing commas** in multi-line objects/arrays
- **`const` over `let`** unless you actually reassign
- **Named exports** for components (`export function MyComponent()`), default exports only for Next.js pages
- **One component per file** — extract sub-components into named functions in the same file if they're tightly coupled

### File naming

- **Components**: `kebab-case.tsx` (e.g. `order-book.tsx`, `mobile-nav.tsx`)
- **Lib modules**: `kebab-case.ts` (e.g. `format.ts`, `engine.ts`)
- **Types**: co-located in the same file or in `types.ts` next to the module
- **Tests**: `*.test.ts` next to the source (Vitest) or under `e2e/` (Playwright)

### Imports

Use the `@/` path alias (maps to `src/`):

```ts
import { useOpenCEX } from "@/lib/opencex/store";
import { Button } from "@/components/ui/button";
```

Prefer relative imports only for sibling files in the same directory.

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes (examples):** `trading`, `engine`, `auth`, `wallet`, `admin`, `ui`, `db`, `ci`, `helm`, `docs`

**Examples:**

```
feat(engine): support stop-limit orders
fix(auth): prevent splash loop when session is loading
docs(readme): document Helm values for DATABASE_URL
chore(deps): bump next to 16.1.1
```

Keep the summary ≤ 72 characters. Use the body for *why*, not *what*.

Breaking changes: add `!` after the type/scope (`feat(engine)!: change fill event shape`) and a `BREAKING CHANGE:` footer.

---

## Pull Request Process

1. **Open a PR early** — draft PRs are welcome so reviewers can follow along.
2. **Fill in the PR template** — describe the problem, the solution, and how to test.
3. **Keep PRs focused** — one concern per PR. Large refactors should be separate from feature work.
4. **CI must be green** — lint, unit tests, and e2e must pass. Fix failures before requesting review.
5. **Request review** from a CODEOWNER for the touched paths (see `.github/CODEOWNERS`).
6. **Address feedback** with follow-up commits (prefer not force-pushing during review).
7. **Squash-merge** is the default — keep your commit history clean or rely on the squash message.

### PR checklist (copy into description)

- [ ] `bun run lint` passes
- [ ] `bun run test:unit` passes
- [ ] New/changed behavior has tests where practical
- [ ] Docs updated if user-facing or ops-facing
- [ ] No secrets committed; `.env` stays local
- [ ] Schema changes include a migration under `prisma/migrations/`
- [ ] CHANGELOG.md updated for user-visible changes

---

## Testing

```bash
# Unit + property tests (Vitest)
bun run test:unit

# E2E (Playwright) — install browsers once
bunx playwright install
bun run test:e2e

# Everything
bun run test
```

### What to test

| Area | Prefer |
|---|---|
| Matching engine | Unit + property tests (`engine.test.ts`, `engine.property.test.ts`) |
| Format / pure helpers | Unit tests |
| Auth / API routes | Unit or route-level tests; critical paths in e2e |
| UI flows (login → trade) | Playwright e2e |
| Visual components | Storybook stories + optional visual regression |

When you change the engine, add or extend tests that lock the behavior (especially edge cases: FOK with insufficient liquidity, POST_ONLY that would cross, fee rounding).

### Property tests

The engine uses `fast-check` for property-based tests. Prefer properties that must always hold (conservation of quantity, no negative balances, price-time priority) over one-off examples alone.

---

## Storybook

```bash
bun run storybook          # http://localhost:6006
bun run build-storybook    # static build
```

Add a `*.stories.tsx` next to new presentational components under `src/components/opencex/`.

---

## Changelog

User-visible changes go in [CHANGELOG.md](CHANGELOG.md) under **Unreleased**, following [Keep a Changelog](https://keepachangelog.com/).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security.

Release process: move Unreleased entries into a versioned section when tagging.

---

## Database Changes

1. Edit `prisma/schema.prisma`
2. Create a migration: `bun run db:migrate -- --name describe_change`
3. Commit the generated files under `prisma/migrations/`
4. Production applies with `bun run db:migrate:deploy` (not `db:push`)

**Rules:**

- Prefer additive, backward-compatible migrations.
- Money amounts: store as **strings** (or Decimal) — never IEEE floats for balances.
- Never commit `.env` or real credentials.
- Seed data stays in `prisma/seed.ts` and is **dev-only**.

---

## Working on Specific Areas

### Matching Engine

- Source of truth: `src/lib/opencex/engine.ts` + types in `types.ts`
- Keep price-time priority and order-type semantics intact
- Property tests should still pass after changes
- Avoid leaking floating-point money math into balances

### Auth & Sessions

- NextAuth config: `src/lib/auth/config.ts`
- API: `src/app/api/auth/`, `signup`, `onboarding`, `session`
- Passwords: bcrypt only; never log secrets
- Session strategy is JWT; be careful with claims shape

### UI Components

- App shell and terminal: `src/components/opencex/`
- Primitives: `src/components/ui/` (shadcn-style)
- Prefer existing tokens/classes over one-off colors
- Mobile + desktop layouts both matter

### Infra / Helm / Docker

- Chart: `infra/k8s/`
- Workflows: `.github/workflows/`
- Image defaults should stay pointed at `ghcr.io/olekariamunyororo-crypto/mbuni-cex` unless intentionally changing the publish target
- Secrets via env / sealed secrets — never hardcoded

---

## Releasing

1. Update `CHANGELOG.md` (version section)
2. Bump `package.json` version if applicable
3. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z"` and push tags
4. GitHub Actions / release notes as configured in the repo

Breaking changes and security fixes should be called out in the changelog / release notes.

---

## Getting Help

- **Bugs / features:** [GitHub Issues](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/issues)
- **Questions:** [GitHub Discussions](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/discussions)
- **Security:** [Security advisories](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/security/advisories/new) — do **not** open a public issue for vulnerabilities

Thanks for building Mbuni CEX with us. 🦬

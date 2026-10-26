# Mbuni CEX

[![CI/CD](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/ci-cd.yml)
[![Preview Envs](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/preview.yml/badge.svg)](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/preview.yml)
[![Pages](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/pages.yml/badge.svg?branch=main)](https://olekariamunyororo-crypto.github.io/Mbuni-CEX/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Policy-blue?logo=shieldedperson&logoColor=white)](SECURITY.md)
[![Made with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/tests-57%20passing-brightgreen)](#testing)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)](#storybook)
[![Changelog](https://img.shields.io/badge/CHANGELOG-up_to_date-success)](CHANGELOG.md)

A modern, high-performance spot cryptocurrency exchange — TypeScript matching-engine reference, Next.js CLOB terminal, Prisma + PostgreSQL, Docker/Helm packaging. Branded **Mbuni CEX** (Swahili for "ostrich").

![Mbuni CEX](public/ostrich.svg)

> **Note:** Live trading UI state is primarily **in-memory** (Zustand + engine). Durable `Order` / `Trade` / `Balance` / `TradingPair` Prisma models exist for the next integration step.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start (Local Dev)](#quick-start-local-dev)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Available Scripts](#available-scripts)
8. [Project Structure](#project-structure)
9. [Auth & Onboarding Flow](#auth--onboarding-flow)
10. [Production Build](#production-build)
11. [Deployment](#deployment)
12. [Production Hardening Checklist](#production-hardening-checklist)
13. [Database Migrations](#database-migrations)
14. [Testing](#testing)
15. [Storybook](#storybook)
16. [Analytics (Mixpanel)](#analytics-mixpanel)
17. [Security](#security)
18. [Community](#community)
19. [Troubleshooting](#troubleshooting)
20. [License](#license)

---

## Overview

Mbuni CEX is a fullstack cryptocurrency exchange demo with:

- **Matching engine** — price-time priority; LIMIT, MARKET, IOC, FOK, POST_ONLY (`src/lib/opencex/engine.ts`)
- **CLOB terminal** — order book, trade tape, chart, order entry, open orders
- **Swap** — multi-hop spot convert with slippage control
- **Wallet** — balances, deposits/withdrawals (demo), address whitelist patterns
- **Admin** — health, users, pairs, fees, event stream
- **Auth + onboarding** — splash → welcome → login/signup → 4-step wizard
- **Responsive UI** — mobile bottom nav + desktop layouts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | NextAuth.js v4 (Credentials, JWT) |
| Database | Prisma ORM + PostgreSQL (prod) / SQLite (dev option) |
| Password hashing | bcryptjs |
| State | Zustand + `useSession()` |
| Analytics | Mixpanel (optional client SDK) |
| Tests | Vitest + Playwright |
| Containers | Docker multi-stage + Compose |
| K8s | Helm chart under `infra/k8s/` |

---

## Prerequisites

| Tool | Min version |
|---|---|
| Node.js | 20+ |
| Bun | 1.1+ (recommended) |
| Git | any |
| PostgreSQL | 14+ for production-like local |

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Quick Start (Local Dev)

```bash
git clone https://github.com/olekariamunyororo-crypto/Mbuni-CEX.git
cd Mbuni-CEX
bun install
cp .env.example .env
# Set DATABASE_URL + NEXTAUTH_SECRET (see below)
bun run db:push          # or: bun run db:migrate:deploy
bun run db:seed          # optional demo users
bun run dev
```

Open http://localhost:3000

### Demo accounts (after seed)

| Email | Password | Tier |
|---|---|---|
| `admin@mbuni.cex` | `adminpass123` | 5 (Institutional) |
| `alex.demo@mbuni.cex` | `testpass123` | 3 (Pro) |
| `bobby.trader@example.com` | `testpass123` | 2 (Intermediate) |
| `carol.newbie@example.com` | `testpass123` | 0 (onboarding incomplete) |

Also available: `just` / `make` aliases (`just dev`, `just test`, `just up`, …).

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mbuni_cex?schema=public
# Dev SQLite alternative: file:./db/custom.db

# NextAuth — REQUIRED in production
NEXTAUTH_SECRET=replace-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Mixpanel (optional — client no-ops when token unset)
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_MIXPANEL_API_HOST=https://api-eu.mixpanel.com
NEXT_PUBLIC_MIXPANEL_DEBUG=false
```

Generate secret: `openssl rand -base64 32`

---

## Database Setup

Prisma schema: `prisma/schema.prisma`

- Auth: `User`, `Account`, `Session`, `VerificationToken`, `Onboarding`
- Ledger: `TradingPair`, `Balance`, `Order`, `Trade` (decimal **strings**)

```bash
bun run db:generate
bun run db:push                 # dev
bun run db:migrate              # create migration
bun run db:migrate:deploy       # prod / CI deploy path
bunx tsx scripts/check-db.ts    # inspect users
```

Initial migration: `prisma/migrations/20261025231500_init_ledger/`

---

## Available Scripts

| Script | Purpose |
|---|---|
| `dev` | Next dev server :3000 |
| `build` | prisma generate + next build + standalone static/public copy |
| `start` | production standalone server |
| `lint` | ESLint |
| `test:unit` / `test:e2e` / `test` | Vitest / Playwright / both |
| `db:push` / `db:migrate` / `db:migrate:deploy` / `db:seed` | Database |
| `storybook` / `build-storybook` | Component explorer |

---

## Project Structure

```
src/app/                 # App Router pages + API routes
src/components/opencex/  # Terminal UI, auth screens, views
src/lib/opencex/         # engine, store, types, format, seed
src/lib/auth/            # NextAuth config
src/lib/analytics/       # Mixpanel helper
prisma/                  # schema, migrations, seed
infra/k8s/               # Helm chart
.github/workflows/       # CI/CD, pages, preview
```

---

## Auth & Onboarding Flow

1. **Splash** (~2s)
2. **Welcome** carousel (unauthenticated)
3. **Auth** — login / signup (bcrypt + JWT)
4. **Onboarding** — experience → markets → security → review
5. **App** — trading terminal

Passkey UI is simulated for demo purposes.

---

## Production Build

```bash
bun run build
bun run start
# or: NODE_ENV=production bun .next/standalone/server.js
```

`build` runs `prisma generate`, `next build`, and copies `.next/static` + `public` into the standalone output.

**Do not** run `prisma migrate deploy` inside `next build` — apply migrations at deploy time.

---

## Deployment

### Vercel

1. Import `olekariamunyororo-crypto/Mbuni-CEX`
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
3. Optional: Mixpanel `NEXT_PUBLIC_*` vars
4. Deploy; run `db:migrate:deploy` against prod DB once

### Docker

```bash
docker compose up -d --build
```

App + Postgres (+ Caddy when configured).

### Kubernetes + Helm

```bash
helm upgrade --install mbuni-cex infra/k8s/ \
  --namespace mbuni-cex --create-namespace \
  --set image.repository=ghcr.io/olekariamunyororo-crypto/mbuni-cex \
  --set envSecrets.DATABASE_URL="…" \
  --set envSecrets.NEXTAUTH_SECRET="…"
```

See [infra/k8s/README.md](infra/k8s/README.md).

---

## Production Hardening Checklist

- [ ] Strong unique `NEXTAUTH_SECRET`
- [ ] PostgreSQL only; no demo seed on prod
- [ ] Rate-limit signup / credentials
- [ ] TLS + locked-down ingress
- [ ] Wire durable balances (do not trust client balances)
- [ ] Complete or remove simulated passkey claims
- [ ] Secrets via sealed secrets / external secrets — never git

---

## Database Migrations

```bash
# Dev
bun run db:migrate -- --name describe_change

# Prod / release job
bun run db:migrate:deploy
```

Money: store amounts as **strings** (or Decimal); never IEEE floats for balances.

---

## Testing

```bash
bun run test:unit
bunx playwright install && bun run test:e2e
bun run test
```

Engine coverage: `engine.test.ts` + property tests (`fast-check`).

---

## Storybook

```bash
bun run storybook          # :6006
bun run build-storybook
```

---

## Analytics (Mixpanel)

Client helper: `src/lib/analytics/mixpanel.ts` — **no-op** without `NEXT_PUBLIC_MIXPANEL_TOKEN`.

Events include: App Opened, Splash/Welcome Completed, Signup/Login, Onboarding steps, Pair Selected, Order Placed/Rejected, View Changed, Logout.

Default API host is **EU**: `https://api-eu.mixpanel.com`.

---

## Security

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/security/advisories/new) — see [SECURITY.md](SECURITY.md).

Known demo gaps: simulated passkey, no email verification / password reset, no rate limits on auth.

---

## Community

- [Issues](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/issues)
- [Discussions](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/discussions)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CHANGELOG.md](CHANGELOG.md)

---

## Troubleshooting

| Symptom | Likely fix |
|---|---|
| Prisma / migrate fails in CI build | Migrations belong in deploy job, not `next build` |
| Bun lockfile version mismatch in CI | Use Bun `latest` in workflows |
| Turbopack unsupported (e.g. Termux) | `next dev --webpack` |
| No Mixpanel events | Set `NEXT_PUBLIC_MIXPANEL_TOKEN`; check EU host |
| Auth redirect loops | Verify `NEXTAUTH_URL` matches public URL |

---

## License

MIT

---

*Mbuni CEX — modern spot exchange demo with a TypeScript matching-engine reference. Branded with the ostrich logo (Swahili: mbuni).*

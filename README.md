# Mbuni CEX

[![CI/CD](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/ci-cd.yml)
[![Preview Envs](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/preview.yml/badge.svg)](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/preview.yml)
[![Pages](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/actions/workflows/pages.yml/badge.svg?branch=main)](https://olekariamunyororo-crypto.github.io/Mbuni-CEX/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Policy-blue)](SECURITY.md)
[![Made with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

A modern spot cryptocurrency exchange **demo** — TypeScript matching-engine reference, Next.js terminal UI, Prisma + PostgreSQL, Docker/Helm packaging.

![Mbuni CEX](public/ostrich.svg)

> **Note:** Trading state in the UI is primarily in-memory (Zustand + engine). Schema now includes durable `Order` / `Trade` / `Balance` / `TradingPair` models for the next integration step.

---

## Quick Start

```bash
git clone https://github.com/olekariamunyororo-crypto/Mbuni-CEX.git mbuni-cex
cd mbuni-cex
bun install   # or: npm install
cp .env.example .env
# DATABASE_URL=postgresql://...  and NEXTAUTH_SECRET=...
bun run db:push    # or: bun run db:migrate:deploy after migrations exist
bun run db:seed    # optional
bun run dev
```

Open http://localhost:3000

### Demo accounts (after seed)

| Email | Password | Tier |
|---|---|---|
| `admin@mbuni.cex` | `adminpass123` | Institutional |
| `alex.demo@mbuni.cex` | `testpass123` | Pro |
| `bobby.trader@example.com` | `testpass123` | Intermediate |

---

## Tech stack

Next.js 16 · TypeScript 5 · Tailwind 4 · shadcn/ui · NextAuth · Prisma · PostgreSQL · Vitest · Playwright · Docker · Helm

## Matching engine

`src/lib/opencex/engine.ts` — price-time priority, LIMIT / MARKET / IOC / FOK / POST_ONLY.

## Database

PostgreSQL via Prisma. Models: auth (`User`, sessions) + ledger (`TradingPair`, `Balance`, `Order`, `Trade`).

```bash
bun run db:migrate          # create migration
bun run db:migrate:deploy   # apply in prod
```

Initial migration: `prisma/migrations/20261025231500_init_ledger/`

## Deploy

- **Vercel** — set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Docker** — `docker compose up -d --build`
- **Kubernetes** — `helm upgrade --install mbuni-cex infra/k8s/ ...`

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CHANGELOG.md](CHANGELOG.md)
- [infra/k8s/README.md](infra/k8s/README.md)

## License

MIT

# Contributing to Mbuni CEX

Thanks for taking the time to contribute!

## Project Setup

| Tool | Version | Why |
|---|---|---|
| Node.js | 20+ | Next.js 16 runtime |
| Bun | 1.1+ | Recommended package manager |
| Git | any | Version control |

### First-time setup

```bash
git clone https://github.com/YOUR_USERNAME/Mbuni-CEX.git
cd Mbuni-CEX
git remote add upstream https://github.com/olekariamunyororo-crypto/Mbuni-CEX.git

bun install
cp .env.example .env
# Set DATABASE_URL (PostgreSQL) and NEXTAUTH_SECRET

bun run db:push   # or: bun run db:migrate
bun run db:seed   # optional demo users
bun run dev
```

Open http://localhost:3000

### Useful scripts

```bash
bun run dev / lint / test:unit / test:e2e / build
bun run db:push / db:migrate / db:migrate:deploy / db:seed
```

## Workflow

Fork + feature branch → PR into `olekariamunyororo-crypto/Mbuni-CEX` `main`.

Branch prefixes: `feat/`, `fix/`, `docs/`, `chore/`, `ci/`, `infra/`.

Commits: [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(trading): add stop-limit`.

## Testing

```bash
bun run test:unit
bunx playwright install && bun run test:e2e
bun run test
```

## Database changes

1. Edit `prisma/schema.prisma`
2. `bun run db:migrate -- --name describe_change`
3. Commit `prisma/migrations/`
4. Production: `bun run db:migrate:deploy`

## Getting help

- Issues: https://github.com/olekariamunyororo-crypto/Mbuni-CEX/issues
- Discussions: https://github.com/olekariamunyororo-crypto/Mbuni-CEX/discussions

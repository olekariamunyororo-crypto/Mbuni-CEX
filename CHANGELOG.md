# Changelog

All notable changes to Mbuni CEX are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For a complete diff between any two versions, see the
[GitHub releases page](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/releases).

---

## [Unreleased]

### Added — Documentation & Community
- `SECURITY.md`, CODEOWNERS, Discussions templates updated for `olekariamunyororo-crypto/Mbuni-CEX`

### Added — Database
- Durable ledger models: `TradingPair`, `Balance`, `Order`, `Trade`
- Prisma migration `20261025231500_init_ledger`

### Fixed — CI
- Bun lockfile version (use `bun-version: latest`)
- Unit tests run without requiring `@vitest/coverage-v8`
- `postbuild` no longer runs migrate during image build (migrations at deploy)

### Planned
- Real WebAuthn passkey enrollment
- Email verification / password reset
- Wire API write path to durable Order/Trade/Balance tables

---

## [1.0.0] — 2026-10-24

Initial release. See full history in prior commits for matching engine, terminal UI, auth, Helm, and CI/CD.

---

[Unreleased]: https://github.com/olekariamunyororo-crypto/Mbuni-CEX/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olekariamunyororo-crypto/Mbuni-CEX/releases/tag/v1.0.0

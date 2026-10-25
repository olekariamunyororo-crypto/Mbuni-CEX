# Security Policy

## Supported versions

Mbuni CEX is pre-1.0 software. We currently provide security updates for the
latest minor release only.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

### Preferred: GitHub Security Advisories

1. Go to <https://github.com/olekariamunyororo-crypto/Mbuni-CEX/security/advisories/new>
2. Click **"Report a vulnerability"**
3. Fill in the template and submit — only maintainers will see it.

### Alternative: Email

Send reports to the maintainer via GitHub private vulnerability reporting above.

---

## Response timeline

| Stage | Target SLA |
|---|---|
| **Acknowledgment** | Within 48 hours |
| **Initial assessment** | Within 5 business days |
| **Fix released** | Within 90 days for critical, 180 days for high |

---

## Scope

### In scope
- Application code (`src/`)
- API routes (`src/app/api/`)
- Database schema (`prisma/`)
- Deployment manifests (`Dockerfile`, `infra/`)
- CI/CD (`.github/workflows/`)
- Auth + session handling

### Out of scope
- Third-party dependency CVEs (Dependabot/Renovate)
- Demo seed passwords (`adminpass123`, `testpass123`) — intentional for local only
- Theoretical issues without PoC

### Known limitations (no need to report)
- Passkey/WebAuthn is simulated
- No email verification or password reset yet
- No rate limiting on signup/login yet
- CSRF gap on signup endpoint

Help welcome via issues labeled [good first issue](https://github.com/olekariamunyororo-crypto/Mbuni-CEX/labels/good%20first%20issue).

---

## Contact

- Security reports: GitHub Security Advisories
- Discussions: https://github.com/olekariamunyororo-crypto/Mbuni-CEX/discussions
- Maintainer: @olekariamunyororo-crypto

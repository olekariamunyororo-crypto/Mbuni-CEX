#!/usr/bin/env bash
# Restore verbatim README + CONTRIBUTING from the full import commit,
# applying only your-org → olekariamunyororo-crypto (and repo casing).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
COMMIT=5e393e8e52b5ecfb55b417241aa7d667db5b83d9

git show "${COMMIT}:README.md" > README.md
git show "${COMMIT}:CONTRIBUTING.md" > CONTRIBUTING.md

if sed --version >/dev/null 2>&1; then
  # GNU sed
  sed -i \
    -e 's/your-org/olekariamunyororo-crypto/g' \
    -e 's|olekariamunyororo-crypto/mbuni-cex|olekariamunyororo-crypto/Mbuni-CEX|g' \
    -e 's|olekariamunyororo-crypto.github.io/mbuni-cex|olekariamunyororo-crypto.github.io/Mbuni-CEX|g' \
    README.md CONTRIBUTING.md
else
  # BSD sed (macOS)
  sed -i '' \
    -e 's/your-org/olekariamunyororo-crypto/g' \
    -e 's|olekariamunyororo-crypto/mbuni-cex|olekariamunyororo-crypto/Mbuni-CEX|g' \
    -e 's|olekariamunyororo-crypto.github.io/mbuni-cex|olekariamunyororo-crypto.github.io/Mbuni-CEX|g' \
    README.md CONTRIBUTING.md
fi

echo "Restored $(wc -l < README.md | tr -d ' ') line README and $(wc -l < CONTRIBUTING.md | tr -d ' ') line CONTRIBUTING"
echo "Next:"
echo "  git add README.md CONTRIBUTING.md"
echo "  git commit -m 'docs: restore verbatim README + CONTRIBUTING (org rename only)'"
echo "  git push origin main"

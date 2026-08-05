#!/usr/bin/env bash
# PGP-Signaturen für ein bestehendes GitHub-Release erzeugen und hochladen.
# Nutzung: ./scripts/sign-release.sh vX.Y.Z
set -euo pipefail

TAG="${1:?Nutzung: sign-release.sh vX.Y.Z}"
REPO="0xGI0/aurelius-android"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Lade Assets von $TAG …"
gh release download "$TAG" --repo "$REPO" --dir "$TMP"

cd "$TMP"
for f in *; do
  [[ "$f" == *.asc ]] && continue
  echo "Signiere $f"
  gpg --detach-sign --armor "$f"
done

echo "Lade Signaturen hoch …"
gh release upload "$TAG" --repo "$REPO" ./*.asc --clobber
echo "Fertig: $(ls ./*.asc | wc -l) Signaturen an $TAG angehängt."

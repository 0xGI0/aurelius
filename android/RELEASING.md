# Release-Ablauf

## 1. Version taggen — CI baut und veröffentlicht

```bash
# versionCode/versionName in app/build.gradle.kts erhöhen, committen, dann:
git tag -a android-vX.Y.Z -m "Kurzbeschreibung"
git push && git push --tags
```

Die GitHub-Actions-Pipeline (`.github/workflows/android-release.yml` am
Monorepo-Root) läuft automatisch: Tests → signiertes APK (Keystore aus den
Repo-Secrets) → `SHA256SUMS.txt` → **Sigstore-Build-Attestierung** →
GitHub-Release. Die Assets heißen `stoa-vX.Y.Z.apk` bzw.
`stoa-vX.Y.Z-sbom.cdx.json`.

## 2. PGP-Signaturen lokal anfügen

Der private PGP-Schlüssel bleibt auf dem Rechner des Maintainers — die
Signaturen entstehen deshalb **nach** dem CI-Release lokal:

```bash
./scripts/sign-release.sh android-vX.Y.Z
```

Das Skript lädt die Release-Assets, signiert jedes mit
`gpg --detach-sign --armor` und lädt die `.asc`-Dateien zum Release hoch.

Der zugehörige Public Key ist unter <https://tertlidis.com/pgp.asc>
abrufbar (Fingerprint `D251 773E 1DF7 0C1D 0476 1CB0 F92A F40D 80E8 5351`);
die Prüf-Kommandos stehen im README unter „Download prüfen".

## Android-Signatur-Keystore

`~/aurelius-signing/aurelius-release.keystore` (Passwort in
`WICHTIG-LESEN.txt` daneben) — Backup nicht vergessen. In CI liegt er
base64-kodiert als Secret `AURELIUS_KEYSTORE_B64` + `AURELIUS_KEYSTORE_PASS`.
Secret-/Env-Namen und der Key-Alias `aurelius` behalten bewusst das alte
Präfix: Der Keystore stammt aus der Aurelius-Zeit, und eine Umbenennung
würde nur Neu-Eingabe der Secrets erzwingen, ohne etwas zu verbessern.

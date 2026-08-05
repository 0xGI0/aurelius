# Security Policy

This policy covers all parts of the Stoa monorepo: the web app (`web/`),
the Android app (`android/`) and the backend (`backend/`).

## Supported Versions

- **Web & backend:** only the current `main` branch (the deployed state)
  receives fixes.
- **Android:** only the
  [latest release](https://github.com/0xGI0/stoa/releases/latest)
  receives fixes.

## Reporting a Vulnerability

Please do **not** open a public issue for security reports. Use one of:

- **GitHub private vulnerability reporting** (preferred):
  [Report a vulnerability](https://github.com/0xGI0/stoa/security/advisories/new)
- **E-mail:** georgios@tertlidis.com — optionally PGP-encrypted
  (key: <https://tertlidis.com/pgp.asc>, fingerprint
  `D251 773E 1DF7 0C1D 0476 1CB0 F92A F40D 80E8 5351`)

You can expect an initial response within a few days.

## Release integrity (Android)

Every Android release (tags `android-v*`) ships:

- an **APK signed** with the project's Android signing key,
- **SHA-256 checksums** (`SHA256SUMS.txt`),
- a **Sigstore build-provenance attestation** (proves the APK was built by
  the public CI pipeline from this exact source),
- **PGP signatures** (`*.asc`) made with the maintainer key above,
- a **CycloneDX SBOM** (`*-sbom.cdx.json`) listing all runtime dependencies.

See "Verify your download" in `android/README.md` for the exact commands.
Releases up to `v0.3.0` (as "Aurelius") remain available in the archived
repo [`aurelius-android`](https://github.com/0xGI0/aurelius-android).

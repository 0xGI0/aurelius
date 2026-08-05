# Security Policy

## Supported Versions

Only the [latest release](https://github.com/0xGI0/aurelius-android/releases/latest)
receives fixes.

## Reporting a Vulnerability

Please do **not** open a public issue for security reports. Use one of:

- **GitHub private vulnerability reporting** (preferred):
  [Report a vulnerability](https://github.com/0xGI0/aurelius-android/security/advisories/new)
- **E-mail:** georgios@tertlidis.com — optionally PGP-encrypted
  (key: <https://tertlidis.com/pgp.asc>, fingerprint
  `D251 773E 1DF7 0C1D 0476 1CB0 F92A F40D 80E8 5351`)

You can expect an initial response within a few days.

## Release integrity

Every release ships:

- an **APK signed** with the project's Android signing key,
- **SHA-256 checksums** (`SHA256SUMS.txt`),
- a **Sigstore build-provenance attestation** (proves the APK was built by
  the public CI pipeline from this exact source),
- **PGP signatures** (`*.asc`) made with the maintainer key above.

See "Verify your download" in the README for the exact commands.

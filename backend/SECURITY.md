# Security Policy

## Supported Versions

Only the current `main` branch (the deployed version) receives fixes.

## Reporting a Vulnerability

Please do **not** open a public issue for security reports. Use one of:

- **GitHub private vulnerability reporting** (preferred):
  [Report a vulnerability](https://github.com/0xGI0/aurelius-backend/security/advisories/new)
- **E-mail:** georgios@tertlidis.com — optionally PGP-encrypted
  (key: <https://tertlidis.com/pgp.asc>, fingerprint
  `D251 773E 1DF7 0C1D 0476 1CB0 F92A F40D 80E8 5351`)

You can expect an initial response within a few days.

## Hardening notes

- All commits are GPG-signed with the maintainer key above.
- Secrets (Django `SECRET_KEY`, DB, SMTP) live exclusively in environment
  variables; production refuses to start without a real `DJANGO_SECRET_KEY`.
- Auth endpoints are rate-limited; passwords are hashed with Django's
  defaults; tokens are revocable server-side.

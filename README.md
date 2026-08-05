<p align="center">
  <img src="web/docs/logo.png" width="140" alt="Stoa-Logo: Lorbeerkranz">
</p>
<h1 align="center">Stoa</h1>
<p align="center">
  <a href="#deutsch">Deutsch</a> · <a href="#english">English</a>
</p>
<p align="center">
  <img src="web/assets/images/marcus-portrait.jpg" width="180" alt="Büste des Marc Aurel (Glyptothek München)">
  &nbsp;
  <img src="web/assets/images/epictetus.jpg" width="152" alt="Epiktet (Kupferstich, Oxford 1715)">
  &nbsp;
  <img src="web/assets/images/seneca.jpg" width="168" alt="Pseudo-Seneca-Büste (Foto: Marie-Lan Nguyen, CC BY 2.5)">
</p>

---

## Deutsch

Die drei großen Stoiker — **Marc Aurel**, **Epiktet**, **Seneca** — als App:
die *Selbstbetrachtungen* (486 Abschnitte), das *Handbüchlein der Moral*
(53 Kapitel) und *Von der Kürze des Lebens* (20 Kapitel), jeweils auf
Deutsch, Englisch und im Original (Altgriechisch bzw. Latein). Mit
Themen-Filtern, Favoriten (lokal oder per Konto synchronisiert) und
optionaler KI-Erklärung als Live-Stream.

**Live:** https://die-stoa.vercel.app

| Teilprojekt | Verzeichnis | Stack |
|---|---|---|
| Web-App (PWA) | [`web/`](web/) | Expo / React Native Web, Vercel |
| Android-App | [`android/`](android/) | Kotlin, Jetpack Compose |
| Backend | [`backend/`](backend/) | Django (Konten & Favoriten-Sync) |

**Android-APK:** signierte Builds unter
[Releases](https://github.com/0xGI0/stoa/releases) (Tags `android-v*`) —
mit SHA-256-Checksummen, Sigstore-Attestierung, PGP-Signaturen und SBOM.
Details, Build- und Release-Anleitungen stehen in den READMEs der
Teilprojekte. Sicherheitshinweise: [SECURITY.md](SECURITY.md).

> Bis August 2026 hieß dieses Projekt **Aurelius** und lebte in drei
> getrennten Repos (`aurelius`, `aurelius-android`, `aurelius-backend`).
> Die vollständige History aller drei ist in dieses Monorepo übernommen.

---

## English

The three great Stoics — **Marcus Aurelius**, **Epictetus**, **Seneca** —
as an app: the *Meditations* (486 sections), the *Enchiridion* (53
chapters) and *On the Shortness of Life* (20 chapters), each in German,
English and the original language (Ancient Greek or Latin). With topic
filters, favorites (local or synced via account) and optional AI
explanations streamed live.

**Live:** https://die-stoa.vercel.app

| Subproject | Directory | Stack |
|---|---|---|
| Web app (PWA) | [`web/`](web/) | Expo / React Native Web, Vercel |
| Android app | [`android/`](android/) | Kotlin, Jetpack Compose |
| Backend | [`backend/`](backend/) | Django (accounts & favorites sync) |

**Android APK:** signed builds under
[Releases](https://github.com/0xGI0/stoa/releases) (tags `android-v*`) —
with SHA-256 checksums, Sigstore attestation, PGP signatures and an SBOM.
Details and build/release guides live in the subproject READMEs.
Security policy: [SECURITY.md](SECURITY.md).

> Until August 2026 this project was called **Aurelius** and lived in three
> separate repos (`aurelius`, `aurelius-android`, `aurelius-backend`).
> Their full history has been merged into this monorepo.

---

<p align="center">
  Bildnachweise / image credits: Marc-Aurel-Büste — Bibi Saint-Pol,
  Wikimedia Commons, gemeinfrei · Epiktet — Kupferstich, Oxford 1715,
  gemeinfrei · Pseudo-Seneca — Foto: Marie-Lan Nguyen, CC BY 2.5.
</p>

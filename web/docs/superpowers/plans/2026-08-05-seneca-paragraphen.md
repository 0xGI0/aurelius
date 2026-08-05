# Seneca-Paragraphen + Lücken-Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Senecas *De brevitate vitae* wird von 20 Kapitel-Blöcken auf klassische Paragraphen (`s-<kap>-<par>`, Latein-Wikisource-Zählung) umgestellt und die deutschen Lücken (Apelt) geschlossen — durchgängig in Web, Quote-API, Backend und Android (Release 0.4.1).

**Architecture:** Latein (la.wikisource, `[1] [2]`-Zählung) liefert das Paragraphen-Raster. Deutsch/Englisch werden Satz für Satz inhaltlich zugeordnet; die geprüften Zuordnungen liegen als committete Alignment-Dateien in `data-sources/seneca-align/` und sind die alleinige Quelle des Builds. Build-Gates (Vollzähligkeit, keine Leerslots, Längenkorridore) brechen bei Verstößen ab.

**Tech Stack:** TypeScript/tsx (Pipeline, Jest), Expo/React Native (Web), Django (Backend), Kotlin/Room (Android), GitHub Actions (Release).

**Spec:** `web/docs/superpowers/specs/2026-08-05-seneca-paragraphen-design.md`

## Global Constraints

- ID-Schema: **`s-<kap>-<par>`** (z. B. `s-4-2`); alte `s-1…s-20` entfallen, Migration überall `s-N` → `s-N-1`
- `grc`-Slot trägt bei Seneca weiterhin das **Latein** (App-Konvention, SOURCES.md)
- Referenzen: App **„De brevitate 4,2"**, API `ref` **„Kap. 4,2" / „Ch. 4,2"**
- **Nichts Unbelegtes in den Korpus**: jede Textquelle mit PD-Nachweis in `data/SOURCES.md`
- Build-Gates je Paragraph: kein leerer Slot, de/la ∈ [1,1–2,0], en/la ∈ [1,1–1,7]; je Kapitel de/la ∈ [1,3–1,7]; Paragraphenzahl = Latein-Zählung
- Backend akzeptiert übergangsweise **alte UND neue** IDs (Android-0.4.0-Clients); `quote_id.max_length` 6 → **8** (Migration!)
- Android: `versionCode 6`, `versionName "0.4.1"`, Room-Schema **version 2** mit Migration
- Sandbox-Hinweise: `git commit` (GPG), `npm`/`pip`/`gradle`/`curl`/`gh` mit Bypass; Android-Builds mit `JAVA_HOME=$(echo ~/.jdks/jdk-21*)`
- Commits im stoa-Repo direkt auf `main`; Push deployt Web automatisch

---

### Task 1: Quellen beschaffen und verifizieren

**Files:**
- Create: `web/data-sources/seneca-brevitate-la-numbered.html` (Wikisource-Volltext mit Zählung)
- Create/Replace: `web/data-sources/seneca-brevitate-de.txt` (vollständiger Apelt)
- Modify: `web/data/SOURCES.md` (Quellen fortschreiben)

**Interfaces:**
- Produces: vollständige, verifizierte Rohquellen; die EN-Quelle `seneca-brevitate-en.json` bleibt unverändert (bereits vollständig, en/la 1,27–1,43 in allen 20 Kapiteln).

- [ ] **Step 1: Latein mit Zählung ziehen**

```bash
cd /home/x/Dokumente/Github/stoa/web
curl -sL "https://la.wikisource.org/wiki/De_brevitate_vitae" -o data-sources/seneca-brevitate-la-numbered.html
grep -c "De brevitate" data-sources/seneca-brevitate-la-numbered.html   # > 0
```

- [ ] **Step 2: Struktur-Stichprobe** — Kapitel IV muss `[1]`-Marker und „Potentissimis" enthalten:

```bash
python3 - <<'EOF'
import re, html
h = open('data-sources/seneca-brevitate-la-numbered.html').read()
t = html.unescape(re.sub(r'<[^>]+>', '\n', h))
assert 'Potentissimis' in t, 'Kapitel IV fehlt'
assert 'Diuus Augustus' in t or 'Divus Augustus' in t, 'Augustus-Absatz fehlt'
print('LA-Quelle ok')
EOF
```

- [ ] **Step 3: Vollständigen Apelt beschaffen** — Reihenfolge der Versuche, jeweils mit demselben Akzeptanztest (Step 4):
  1. `curl -sL "https://archive.org/download/von-der-kuerze-des-lebens-seneca/Von_der_Kuerze_des_Lebens_Seneca.html"` (HTML-Fassung des dokumentierten Items; Text extrahieren, Fußnoten-/Anmerkungsapparat wie bisher verwerfen)
  2. Falls weiterhin lückenhaft: `Von_der_Kuerze_des_Lebens_Seneca.pdf` desselben Items ziehen, Text mit `pdftotext` extrahieren
  3. Falls das Item selbst gekürzt ist: Text von `https://www.seneca.pushpak.de/von-der-kuerze-des-lebens.html` ziehen und den Übersetzer identifizieren (Wortlaut-Abgleich Kapitel 1 gegen Apelt-Archive und gegen Moser 1829 via Google-Books-/MDZ-Scan). Nur mit identifiziertem, gemeinfreiem Übersetzer übernehmen; SOURCES.md entsprechend umschreiben. Gelingt keine Identifikation: **STOPP, Nutzer fragen.**

- [ ] **Step 4: Akzeptanztest Deutsch** (gegen die schon lokal vorhandene Latein-Länge):

```bash
python3 - <<'EOF'
# Kapiteltexte aus dem neuen de-Rohtext ziehen (Muster "N. Text") und
# gegen die Latein-Kapitel aus data/debrevitate.json (Feld grc) messen.
import json, re
raw = open('data-sources/seneca-brevitate-de.txt').read()
notes = re.search(r'^Anmerkungen\s*$', raw, re.M)
if notes: raw = raw[:notes.start()]
chap = {int(m.group(1)): re.sub(r'\s+', ' ', m.group(2)).strip()
        for m in re.finditer(r'^(\d{1,2})\.\s+([\s\S]*?)(?=^\d{1,2}\.\s+|\Z)', raw, re.M)}
la = {q['chapter']: len(q['texts']['grc']) for q in json.load(open('data/debrevitate.json'))}
bad = []
for n in range(1, 21):
    r = len(chap.get(n, '')) / la[n]
    if not 1.2 <= r <= 1.8: bad.append((n, round(r, 2)))
print('Verhältnisse ok' if not bad else f'AUSSERHALB: {bad}')
assert not bad
EOF
```

Expected: `Verhältnisse ok` — insbesondere für die heutigen Lücken-Kapitel 2, 4, 7, 9, 10, 17.

- [ ] **Step 5: SOURCES.md fortschreiben** — im Seneca-Block: neue Latein-Datei (mit Zählung) statt der alten, Herkunft der vervollständigten deutschen Fassung (Fundweg dokumentieren), ID-Schema `s-<kap>-<par>` erwähnen. Alte `seneca-brevitate-la.html` per `git rm` entfernen.

- [ ] **Step 6: Commit**

```bash
git add data-sources data/SOURCES.md && git rm -q data-sources/seneca-brevitate-la.html
git commit -m "data: vollständige Seneca-Quellen (Apelt komplett, Latein mit Paragraphen-Zählung)"
```

---

### Task 2: Latein-Paragraphen-Parser (TDD)

**Files:**
- Modify: `web/scripts/parsers/brevitate.ts` (neu: `parseBrevLaNumbered`)
- Test: `web/scripts/parsers/__tests__/brevitate.test.ts` (erweitern)

**Interfaces:**
- Produces: `parseBrevLaNumbered(html: string): { chapter: number; paragraph: number; text: string }[]` — flache Liste aller Latein-Paragraphen in Dokumentreihenfolge. Task 3/4 verlassen sich auf exakt diese Form.

- [ ] **Step 1: Failing Test** — in `brevitate.test.ts` ergänzen:

```ts
import { readFileSync } from 'node:fs';
import { parseBrevLaNumbered } from '../brevitate';

describe('parseBrevLaNumbered', () => {
  const paras = parseBrevLaNumbered(
    readFileSync('data-sources/seneca-brevitate-la-numbered.html', 'utf8'),
  );

  it('liefert 20 Kapitel in Dokumentreihenfolge', () => {
    expect(new Set(paras.map((p) => p.chapter)).size).toBe(20);
    expect(paras[0]).toMatchObject({ chapter: 1, paragraph: 1 });
  });

  it('nummeriert Paragraphen pro Kapitel lückenlos ab 1', () => {
    for (let c = 1; c <= 20; c++) {
      const nums = paras.filter((p) => p.chapter === c).map((p) => p.paragraph);
      expect(nums).toEqual(Array.from({ length: nums.length }, (_, i) => i + 1));
      expect(nums.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Kapitel 4 enthält den Augustus-Paragraphen', () => {
    const ch4 = paras.filter((p) => p.chapter === 4);
    expect(ch4.length).toBeGreaterThanOrEqual(3);
    expect(ch4.some((p) => /Augustus/.test(p.text))).toBe(true);
  });

  it('Texte sind bereinigt (kein Markup, keine Marker)', () => {
    for (const p of paras) {
      expect(p.text).not.toMatch(/<|\[\d+\]/);
      expect(p.text.length).toBeGreaterThan(40);
    }
  });
});
```

- [ ] **Step 2: Rot sehen** — `npx jest scripts/parsers/__tests__/brevitate.test.ts` → FAIL (Export fehlt)

- [ ] **Step 3: Implementieren** — in `brevitate.ts`:

```ts
export interface BrevParagraph {
  chapter: number;
  paragraph: number;
  text: string;
}

/**
 * la.wikisource-Volltext: Kapitel als römische Überschriften (I…XX),
 * Paragraphen als "[n]"-Marker im Fließtext. Wir arbeiten auf dem in
 * Text konvertierten HTML; Wikisource-Chrome vor Kapitel I und nach
 * Kapitel XX wird verworfen.
 */
export function parseBrevLaNumbered(html: string): BrevParagraph[] {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, '\n');
  const unescaped = text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#160;|&nbsp;/g, ' ');

  const ROMAN = ['', 'I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
  const out: BrevParagraph[] = [];
  // Kapitelblöcke: von der römischen Zeile bis zur nächsten
  for (let c = 1; c <= 20; c++) {
    const start = new RegExp(`^\\s*${ROMAN[c]}\\.?\\s*$`, 'm');
    const end = c < 20 ? new RegExp(`^\\s*${ROMAN[c + 1]}\\.?\\s*$`, 'm') : null;
    const s = unescaped.search(start);
    if (s < 0) continue;
    const rest = unescaped.slice(s);
    const e = end ? rest.slice(1).search(end) + 1 : rest.length;
    const block = rest.slice(0, e > 0 ? e : undefined);
    // Paragraphen: "[1] … [2] …"
    const re = /\[(\d{1,2})\]\s*([\s\S]*?)(?=\[\d{1,2}\]|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(block)) !== null) {
      const t = m[2].replace(/\s+/g, ' ').trim();
      if (t) out.push({ chapter: c, paragraph: Number(m[1]), text: t });
    }
  }
  return out;
}
```

(Die konkreten Regexes ggf. an die echte Seitenstruktur anpassen — der Test ist der Schiedsrichter; bei Abweichung Struktur inspizieren statt Test aufweichen.)

- [ ] **Step 4: Grün sehen** — `npx jest scripts/parsers/__tests__/brevitate.test.ts` → PASS

- [ ] **Step 5: Commit** — `git add scripts && git commit -m "feat(pipeline): Latein-Paragraphen-Parser (Wikisource-Zählung)"`

---

### Task 3: Alignment-Gerüst + Build mit Gates (TDD)

**Files:**
- Create: `web/scripts/build-align-skeleton.ts` (einmaliges Hilfsskript)
- Rewrite: `web/scripts/build-brevitate.ts`
- Create: `web/data-sources/seneca-align/kap-01.json` … `kap-20.json`
- Test: `web/scripts/__tests__/build-brevitate.test.ts`

**Interfaces:**
- Consumes: `parseBrevLaNumbered` (Task 2), vollständige de-/en-Kapiteltexte (Task 1)
- Produces: Alignment-Dateiformat `{ id: string; la: string; de: string; en: string }[]` pro Kapitel; `data/debrevitate.json` mit `{ id, chapter, paragraph, texts: { de, en, grc } }`. Task 4 füllt die de/en-Felder, Tasks 5–8 konsumieren das JSON.

- [ ] **Step 1: Skeleton-Generator schreiben** — `build-align-skeleton.ts`: erzeugt pro Kapitel `kap-NN.json` mit `la` gefüllt (aus Task 2) und `de`/`en` = `""`; zusätzlich je Kapitel eine Arbeitskopie der vollständigen de-/en-Kapiteltexte als Kommentarfeld `_deChapter`/`_enChapter` (wird beim Build ignoriert), damit das Alignment im Editor ohne Quellenwechsel machbar ist.

- [ ] **Step 2: Failing Build-Test** — `build-brevitate.test.ts`:

```ts
import { buildBrevitate, GateError } from '../build-brevitate';

const para = (id: string, la: number, de: number, en: number) => ({
  id, la: 'x'.repeat(la), de: 'y'.repeat(de), en: 'z'.repeat(en),
});

describe('buildBrevitate Gates', () => {
  it('akzeptiert plausible Paragraphen', () => {
    const out = buildBrevitate([[para('s-1-1', 100, 150, 130)]]);
    expect(out[0]).toMatchObject({ id: 's-1-1', chapter: 1, paragraph: 1 });
    expect(out[0].texts.grc).toHaveLength(100);
  });
  it('wirft bei leerem Slot', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 0, 130)]])).toThrow(GateError);
  });
  it('wirft bei de/la außerhalb [1.1, 2.0]', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 90, 130)]])).toThrow(GateError);
    expect(() => buildBrevitate([[para('s-1-1', 100, 210, 130)]])).toThrow(GateError);
  });
  it('wirft bei en/la außerhalb [1.1, 1.7]', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 150, 180)]])).toThrow(GateError);
  });
  it('wirft bei ID-Sprung in der Paragraphenfolge', () => {
    expect(() =>
      buildBrevitate([[para('s-1-1', 100, 150, 130), para('s-1-3', 100, 150, 130)]]),
    ).toThrow(GateError);
  });
});
```

- [ ] **Step 3: Rot sehen**, dann **Step 4: `build-brevitate.ts` neu schreiben**:

```ts
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

export class GateError extends Error {}

interface AlignPara { id: string; la: string; de: string; en: string }

export function buildBrevitate(chapters: AlignPara[][]) {
  const entries = [];
  for (const [ci, paras] of chapters.entries()) {
    paras.forEach((p, pi) => {
      const [, chap, par] = p.id.match(/^s-(\d+)-(\d+)$/) ?? [];
      if (!chap) throw new GateError(`${p.id}: ID-Format`);
      if (Number(par) !== pi + 1) throw new GateError(`${p.id}: Paragraphen-Sprung`);
      for (const k of ['la', 'de', 'en'] as const) {
        if (!p[k].trim()) throw new GateError(`${p.id}: ${k} leer`);
      }
      const rDe = p.de.length / p.la.length;
      const rEn = p.en.length / p.la.length;
      if (rDe < 1.1 || rDe > 2.0) throw new GateError(`${p.id}: de/la=${rDe.toFixed(2)}`);
      if (rEn < 1.1 || rEn > 1.7) throw new GateError(`${p.id}: en/la=${rEn.toFixed(2)}`);
      entries.push({
        id: p.id, chapter: Number(chap), paragraph: Number(par),
        texts: { de: p.de, en: p.en, grc: p.la },
      });
    });
  }
  return entries;
}

if (require.main === module || process.argv[1]?.endsWith('build-brevitate.ts')) {
  const files = readdirSync('data-sources/seneca-align').filter((f) => /^kap-\d\d\.json$/.test(f)).sort();
  if (files.length !== 20) throw new GateError(`${files.length} Kapitel-Dateien, erwartet 20`);
  const chapters = files.map((f) =>
    (JSON.parse(readFileSync(`data-sources/seneca-align/${f}`, 'utf8')) as AlignPara[])
      .filter((p) => p.id),
  );
  const entries = buildBrevitate(chapters);
  writeFileSync('data/debrevitate.json', JSON.stringify(entries));
  console.log(`data/debrevitate.json: ${entries.length} Paragraphen ✓`);
}
```

Kapitel-Korridor (de/la 1,3–1,7 je Kapitel) als zusätzliche Prüfung im CLI-Teil ergänzen (Summe je Kapitel), Verstoß → `GateError` mit Kapitel und Verhältnis.

- [ ] **Step 5: Grün sehen** — `npx jest scripts/__tests__/build-brevitate.test.ts` → PASS

- [ ] **Step 6: Skeleton erzeugen + committen**

```bash
npx tsx scripts/build-align-skeleton.ts && ls data-sources/seneca-align | wc -l   # 20
git add scripts data-sources/seneca-align && git commit -m "feat(pipeline): Alignment-Gerüst + Build mit Qualitäts-Gates"
```

---

### Task 4: Alignment füllen — Satz für Satz, kapitelweise

**Files:**
- Modify: `web/data-sources/seneca-align/kap-01.json` … `kap-20.json`

**Interfaces:**
- Consumes: Skeleton (Task 3) mit `la` gefüllt und `_deChapter`/`_enChapter` als Arbeitsmaterial
- Produces: vollständig gefüllte Alignment-Dateien; `npx tsx scripts/build-brevitate.ts` läuft ohne GateError durch

**Verfahren (für JEDES Kapitel identisch):**

- [ ] **Step 1 (×20): Kapitel N zuordnen** — Latein-Paragraphen des Kapitels lesen; die de-/en-Kapiteltexte an den inhaltlich entsprechenden Satzgrenzen aufteilen (Eigennamen, Zitate, Gedankenwechsel als Fixpunkte; kein Satz darf doppelt oder gar nicht zugeordnet sein — die Konkatenation aller de-Felder muss den Kapiteltext bis auf Whitespace ergeben, dito en). `_deChapter`/`_enChapter` nach Abschluss des Kapitels entfernen.
- [ ] **Step 2 (×20): Kapitel-Gate lokal prüfen** — `npx tsx scripts/build-brevitate.ts` (bricht mit GateError samt Paragraph ab, solange etwas nicht passt; Ausreißer inhaltlich prüfen: fehlt Text, oder ist die Übersetzung an der Stelle wirklich so frei? Nur mit Begründung im Commit-Text tolerieren — dafür Gate-Korridor NICHT aufweichen, sondern den Satz der Nachbar-Zuordnung prüfen).
- [ ] **Step 3: Nach je 5 Kapiteln committen** — `git add data-sources/seneca-align && git commit -m "data: Seneca-Alignment Kapitel N–M (Satz für Satz geprüft)"` (4 Commits).
- [ ] **Step 4: Endlauf** — Build ohne Fehler, Ausgabe notieren (Gesamtzahl Paragraphen); `data/debrevitate.json` committen: `git add data/debrevitate.json && git commit -m "data: De brevitate auf Paragraphen-Einheiten umgestellt"`.

---

### Task 5: Themen-Tagging neu

**Files:**
- Modify: `web/data/topics.json` (Seneca-Einträge), ggf. `web/scripts/tag-topics.ts` (ID-Muster)

- [ ] **Step 1:** `tag-topics.ts` prüfen: matcht es Seneca über `s-`-Präfix? (`grep -n "s-" scripts/tag-topics.ts`) — Muster auf `s-\d+-\d+` anpassen, alte `s-N`-Einträge aus topics.json entfernen lassen.
- [ ] **Step 2:** Lauf: `npx tsx scripts/tag-topics.ts`; danach Konsistenz: jede Seneca-ID in topics.json existiert in debrevitate.json (kleines Inline-Python prüft das).
- [ ] **Step 3:** Stichprobe: je Thema 2 zufällige neue Seneca-Zuordnungen lesen — passt das Thema inhaltlich? Grobe Fehltreffer → Heuristik-Stellschraube statt Handedit.
- [ ] **Step 4:** Commit `data: Themen-Tagging auf Seneca-Paragraphen`.

---

### Task 6: Web-Umbau (corpus, Referenzen, Ansichten, Favoriten-Shim)

**Files:**
- Modify: `web/lib/corpus.ts` (Seneca-Mapping + `referenceLabel`), `web/lib/storage-migration.ts` (+ `s-N`-Schritt), `web/lib/__tests__/storage-migration.test.ts`, Lese-/Bücher-Ansicht (`app/(tabs)/…`, `app/book/[book].tsx`, `app/read/[id].tsx` — konkrete Stellen per `grep -rn "seneca" app/ components/`)
- Test: bestehende `web/lib/__tests__/*`

- [ ] **Step 1: corpus.ts** — `asQuotes` für Seneca ersetzen: neue Rohform `{ id, chapter, paragraph, texts }` → `Quote { book: chapter, section: paragraph }`; Epiktet bleibt unverändert. `referenceLabel`: Seneca → `` `De brevitate ${q.book},${q.section}` `` (beide UI-Sprachen gleich).
- [ ] **Step 2: Failing Tests zuerst** — bestehende Corpus-/Quotes-Tests auf neue Formate erweitern (SENECA_QUOTES-Länge > 20 statt == 20; `referenceLabel(byId('s-4-2')!, …) === 'De brevitate 4,2'`); rot sehen, dann Step 1 fertig implementieren, grün sehen.
- [ ] **Step 3: storage-migration** — Test ergänzen: `stoa.favorites` mit `["s-4","1-1"]` wird zu `["s-4-1","1-1"]`; implementieren: beim Migrationslauf Favoriten-JSON lesen, `/^s-(\d+)$/` → `s-$1-1` mappen, zurückschreiben (idempotent). Grün sehen.
- [ ] **Step 4: Ansichten** — Bücher-Tab: Seneca zeigt 20 Kapitel, Kapitel öffnet Paragraphenliste (Bauart der Aurel-Bücher; `authorOf`/`quotesFor` liefern die Daten schon); Lese-Ansicht `read/[id]` funktioniert mit neuen IDs. `grep -rn "s-1\|chapter" app/ components/ | grep -i seneca` auf Hartkodierungen prüfen.
- [ ] **Step 5: Gesamt** — `npx tsc --noEmit && npm test -- --ci` grün; `npx expo export -p web` läuft.
- [ ] **Step 6: Commit** `feat(web)!: Seneca auf Paragraphen (IDs s-k-p, neue Leseansicht, Favoriten-Shim)`.

---

### Task 7: Quote-API-Erwartungen nachziehen

**Files:**
- Modify: `web/lib/quote-pick.ts` (nichts Strukturelles — nur Verifikation), `web/api/quote.ts` (Seneca-`ref`)
- Test: `web/lib/__tests__/quote-pick.test.ts`

- [ ] **Step 1:** Test ergänzen: Seneca-Pick liefert ID im Muster `/^s-\d+-\d+$/`; `maxLen: 300` liefert für Seneca jetzt NICHT null (Paragraphen sind kurz genug). Rot/grün je nach Datenstand.
- [ ] **Step 2:** `api/quote.ts`: Seneca-`ref` → `{ de: \`Kap. ${q.book},${q.section}\`, en: \`Ch. ${q.book},${q.section}\` }` (book=Kapitel, section=Paragraph — Epiktet behält `Kap. ${q.section}`; Implementierung über `authorOf`-Dreiweiche wie bisher).
- [ ] **Step 3:** `npx jest lib/__tests__/quote-pick.test.ts` grün; Commit `feat(api): Paragraphen-Referenzen für Seneca`.

---

### Task 8: Backend (Regex, max_length, Daten-Migration)

**Files:**
- Modify: `backend/favorites/models.py:6-16`
- Create: `backend/favorites/migrations/0004_*.py` (AlterField) und `0005_*.py` (Daten-Migration)
- Test: `backend/favorites/tests.py`

- [ ] **Step 1: Failing Tests** — in `tests.py` ergänzen: `s-4-2` wird akzeptiert; `s-4` wird (übergangsweise) akzeptiert; `s-4-` und `s-0-1`-artige Formen nicht zwingend prüfen — Kern: `^(\d{1,2}-\d{1,3}|e-\d{1,2}|s-\d{1,2}(-\d{1,2})?)$` und ein 7-Zeichen-Wert (`s-20-13`) übersteht die Feld-Länge.
- [ ] **Step 2:** `models.py`: Regex wie oben, `max_length=8`.
- [ ] **Step 3:** Migrationen: `python manage.py makemigrations favorites` (AlterField); Daten-Migration von Hand:

```python
from django.db import migrations

def forwards(apps, schema_editor):
    Favorite = apps.get_model("favorites", "Favorite")
    for fav in Favorite.objects.filter(quote_id__regex=r"^s-\d{1,2}$"):
        fav.quote_id = f"{fav.quote_id}-1"
        fav.save(update_fields=["quote_id"])

class Migration(migrations.Migration):
    dependencies = [("favorites", "0004_alter_favorite_quote_id")]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
```

(Kollisionsfall Nutzer hat `s-4` UND `s-4-1`: vorher `s-4` löschen — im forwards mit `exists()`-Check.)
- [ ] **Step 4:** `.venv/bin/python manage.py test --verbosity 2` grün; Commit `feat(backend): Paragraphen-IDs (Regex alt+neu, max_length 8, Favoriten-Migration)`.

---

### Task 9: Android (Modell, Ansichten, Room-Migration, 0.4.1)

**Files:**
- Copy: `web/data/debrevitate.json`, `web/data/topics.json` → `android/app/src/main/assets/` und `android/app/src/test/resources/`
- Modify: `android/app/src/main/java/io/github/oxgi0/stoa/data/Quote.kt` (`EnchEntry`-Analogon für Paragraphen), `data/QuoteRepository.kt`, `ui/screens/BooksScreen.kt`, `ui/screens/BookScreen.kt`, `db/AppDatabase.kt` (version 2 + Migration), `app/build.gradle.kts` (versionCode 6, versionName 0.4.1)
- Test: bestehende `QuoteRepositoryTest.kt` u. a. erweitern

- [ ] **Step 1: Assets synchen** (beide Zielorte!), dann **Failing Tests**: Repository liefert für Seneca Quotes mit `book`>0 und IDs `s-\d+-\d+`; Referenzformat „De brevitate 4,2".
- [ ] **Step 2:** `Quote.kt`: Seneca-Rohform `{ id, chapter, paragraph, texts }` deserialisieren (neue `BrevEntry`-Klasse), Mapping auf `Quote(book=chapter, section=paragraph)`; Referenzformat-Funktion anpassen.
- [ ] **Step 3:** `AppDatabase.kt`:

```kotlin
@Database(entities = [FavoriteEntity::class, PendingOpEntity::class], version = 2, exportSchema = true)
// …
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        // Kapitel-Favoriten auf den ersten Paragraphen heben; Kollision: alte Zeile verwerfen
        db.execSQL("DELETE FROM favorites WHERE quote_id GLOB 's-[0-9]*' AND quote_id NOT GLOB 's-*-*' AND (quote_id || '-1') IN (SELECT quote_id FROM favorites)")
        db.execSQL("UPDATE favorites SET quote_id = quote_id || '-1' WHERE quote_id GLOB 's-[0-9]*' AND quote_id NOT GLOB 's-*-*'")
    }
}
```

(Tabellen-/Spaltennamen vorher in `FavoriteEntity` nachschlagen und exakt übernehmen; `pending_ops` analog behandeln, Room-Builder `.addMigrations(MIGRATION_1_2)`.)
- [ ] **Step 4:** BooksScreen/BookScreen: Seneca wie Aurel (Kapitelliste → Paragraphenliste); `versionCode 6`, `versionName "0.4.1"`.
- [ ] **Step 5:** `JAVA_HOME=$(echo ~/.jdks/jdk-21*) ./gradlew test assembleDebug --no-daemon` grün (neues Room-Schema `2.json` entsteht unter `app/schemas/`); Commit `feat(android)!: Seneca-Paragraphen + Room-Migration, 0.4.1`.

---

### Task 10: Deploy, Release 0.4.1, Endabnahme

- [ ] **Step 1:** Push `main`; Web-CI + Vercel-Deploy grün; danach live prüfen:

```bash
curl -s "https://die-stoa.vercel.app/api/quote?author=seneca&maxLen=300" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['id'], d['ref']['de'], len(d['texts']['de']))"
# erwartet: s-K-P · "Kap. K,P" · ≤300
```

- [ ] **Step 2:** /geist-Stichprobe im Browser (Seneca-Chip): Referenz „Kap. K,P", in der Regel keine Kürzung.
- [ ] **Step 3:** Release: `git tag -a android-v0.4.1 -m "Seneca-Paragraphen + vollständiges Deutsch" && git push origin android-v0.4.1`; `gh run watch`; danach `cd android && ./scripts/sign-release.sh android-v0.4.1`.
- [ ] **Step 4:** Endabnahme gegen die 6 Spec-Kriterien (Paragraphenzahl/Verhältnisse, Tests aller drei Teile, Web-Ansicht, API, Favoriten-Migrationen, Release-Assets); Memory `aurelius-projekt-stand` aktualisieren.

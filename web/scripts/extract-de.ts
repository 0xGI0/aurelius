import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseDe } from './parsers/de';

const PDF = 'data-sources/Selbstbetrachtungen-Wittstock-Reclam.pdf';
const raw = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', PDF, '-'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const sections = parseDe(raw);

const perBook = new Map<number, number>();
for (const s of sections) perBook.set(s.book, (perBook.get(s.book) ?? 0) + 1);
console.log('Abschnitte pro Buch:', Object.fromEntries([...perBook.entries()].sort((a, b) => a[0] - b[0])));
console.log('Gesamt:', sections.length);

mkdirSync('data-sources/extracted', { recursive: true });
writeFileSync('data-sources/extracted/de.json', JSON.stringify(sections, null, 1));

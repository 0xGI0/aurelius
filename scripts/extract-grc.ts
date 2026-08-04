import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseGrc } from './parsers/grc';

const raw = readFileSync('data-sources/tlg0562.tlg001.xml', 'utf8');
const sections = parseGrc(raw);

const perBook = new Map<number, number>();
for (const s of sections) perBook.set(s.book, (perBook.get(s.book) ?? 0) + 1);
console.log('Abschnitte pro Buch:', Object.fromEntries([...perBook.entries()].sort((a, b) => a[0] - b[0])));
console.log('Gesamt:', sections.length);

mkdirSync('data-sources/extracted', { recursive: true });
writeFileSync('data-sources/extracted/grc.json', JSON.stringify(sections, null, 1));

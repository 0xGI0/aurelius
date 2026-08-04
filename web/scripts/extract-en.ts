import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseEn } from './parsers/en';

const raw = readFileSync('data-sources/pg-long.txt', 'utf8');
const sections = parseEn(raw);

const perBook = new Map<number, number>();
for (const s of sections) perBook.set(s.book, (perBook.get(s.book) ?? 0) + 1);
console.log('Abschnitte pro Buch:', Object.fromEntries([...perBook.entries()].sort((a, b) => a[0] - b[0])));
console.log('Gesamt:', sections.length);

mkdirSync('data-sources/extracted', { recursive: true });
writeFileSync('data-sources/extracted/en.json', JSON.stringify(sections, null, 1));

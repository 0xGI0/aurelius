import { readFileSync, writeFileSync } from 'node:fs';

interface Quote {
  id: string;
  book: number;
  section: number;
  texts: { de: string; en: string; grc: string };
}

interface TopicDef {
  id: string;
  label: string;
  de: RegExp;
  en: RegExp;
}

// Schlagwort-Heuristik über Wittstock (de) und Long (en). Ein Abschnitt gehört
// zu einem Thema, wenn deutsche ODER englische Fassung das Muster enthält —
// zwei unabhängige Übersetzungen als gegenseitige Absicherung.
const TOPICS: TopicDef[] = [
  {
    id: 'tod',
    label: 'Tod & Vergänglichkeit',
    de: /\btod\b|\btode\b|sterb|gestorben|leichnam|\bgrab\b|vergäng|verweslich|\basche\b|entschlafen/i,
    en: /\bdeath\b|\bdying\b|\bdies?\b|\bdead\b|mortal|corpse|\bgrave\b|perish/i,
  },
  {
    id: 'wut',
    label: 'Wut & Vergebung',
    de: /zorn|zürn|erzürn|\bärger|beleidig|verzeih|vergeb|rache|unwill/i,
    en: /anger|angry|wrath|offend|forgiv|revenge|resent|indign/i,
  },
  {
    id: 'trauer',
    label: 'Trauer & Trost',
    de: /trauer|traurig|betrüb|\bweinen\b|\bklage|\bjammer|\btrost\b|tröst|verlust/i,
    en: /grief|griev|mourn|sorrow|lament|\bweep|console|comfort\b/i,
  },
  {
    id: 'angst',
    label: 'Angst & Mut',
    de: /furcht|fürcht|\bangst\b|\bbange\b|schrecken|verzag|\bmut\b|beherzt|tapfer/i,
    en: /\bfear|afraid|\bdread|terror|courage|\bbrave|cowar/i,
  },
  {
    id: 'familie',
    label: 'Familie & Mitmenschen',
    de: /\bvater\b|\bmutter\b|\bbruder\b|brüder|\bkind\b|\bkinder\b|familie|verwandt|\bfreund/i,
    en: /\bfather\b|\bmother\b|\bbrother|\bchild\b|children|family|kinsm|\bfriend/i,
  },
  {
    id: 'besitz',
    label: 'Besitz & Ruhm',
    de: /besitz|reichtum|\bgold\b|vermögen|eigentum|\bruhm\b|nachruhm|\behre\b|beifall|\blob\b|berühmt/i,
    en: /wealth|riches|\bgold\b|possession|property|\bfame\b|glory|praise|applause|reputation/i,
  },
  {
    id: 'gelassenheit',
    label: 'Gelassenheit & Widrigkeit',
    de: /ertrag|erduld|geduld|hindernis|unglück|widerwärtig|gleichmut|heiterkeit|gelassen/i,
    en: /endure|\bbear\b|patien|obstacle|misfortune|adversity|tranquil|equanimity|serene/i,
  },
  {
    id: 'pflicht',
    label: 'Pflicht & Handeln',
    de: /pflicht|handeln|handlung|tätigkeit|\bwerk\b|\barbeit\b|gemeinwohl|\bnutzen\b|\btat\b/i,
    en: /\bduty\b|\baction|\bact\b|\bacts\b|\bwork\b|labou?r|common good|useful/i,
  },
  {
    id: 'natur',
    label: 'Natur & Schicksal',
    de: /\bnatur\b|weltall|schicksal|vorsehung|götter|weltordnung|verhängnis|\ball\b/i,
    en: /\bnature\b|universe|\bfate\b|providence|\bgods\b|destiny|cosmos/i,
  },
];

const quotes = JSON.parse(readFileSync('data/quotes.json', 'utf8')) as Quote[];
// Epiktet (e-1..e-53) und Seneca (s-1..s-20) laufen durch dieselbe Heuristik
const enchiridion = JSON.parse(readFileSync('data/enchiridion.json', 'utf8')) as Quote[];
const debrevitate = JSON.parse(readFileSync('data/debrevitate.json', 'utf8')) as Quote[];
const all = [...quotes, ...enchiridion, ...debrevitate];

const result = TOPICS.map((t) => {
  const quoteIds = all
    .filter((q) => t.de.test(q.texts.de) || t.en.test(q.texts.en))
    .map((q) => q.id);
  return { id: t.id, label: t.label, quoteIds };
});

for (const t of result) {
  const ench = t.quoteIds.filter((id) => id.startsWith('e-')).length;
  console.log(`${t.label.padEnd(28)} ${t.quoteIds.length} Abschnitte (davon Epiktet: ${ench})`);
}
const untagged = all.filter((q) => !result.some((t) => t.quoteIds.includes(q.id)));
console.log(`Ohne Thema: ${untagged.length}`);

writeFileSync('data/topics.json', JSON.stringify(result));

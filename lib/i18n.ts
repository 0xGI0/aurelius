import { useSyncExternalStore } from 'react';
import { getItem, setItem } from './storage';

export type UiLang = 'de' | 'en';

const K_UI_LANG = 'aurelius.uiLang';

// Kleiner externer Store statt React-Context: Subscriptions über
// useSyncExternalStore erreichen jede Komponente unabhängig von ihrer
// Position im Baum — auch die Tab-Bar im statischen Web-Export.
let current: UiLang = 'de';
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getUiLang(): UiLang {
  return current;
}

export function setUiLang(lang: UiLang): void {
  current = lang;
  void setItem(K_UI_LANG, lang);
  emit();
}

export async function initUiLang(): Promise<void> {
  const v = await getItem(K_UI_LANG);
  if (v === 'de' || v === 'en') {
    current = v;
    emit();
  }
}

export function useUiLang(): UiLang {
  return useSyncExternalStore(subscribe, getUiLang, getUiLang);
}

const de = {
  // Tabs
  tabQuote: 'Zitat',
  tabBooks: 'Bücher',
  tabFavorites: 'Ausgewählt',
  tabAurel: 'Marc Aurel',
  tabStoa: 'Stoa',
  // Home
  hintTap: 'Tippe auf die Karte für den nächsten Gedanken',
  btnNext: 'Neuer Gedanke',
  btnExplain: 'Erklären',
  topicAll: 'Alle',
  refBook: 'Buch',
  // Zitat-Sprachen
  langDe: 'Deutsch',
  langEn: 'English',
  langGrc: 'Altgriechisch',
  // Themen
  topic_tod: 'Tod & Vergänglichkeit',
  topic_wut: 'Wut & Vergebung',
  topic_trauer: 'Trauer & Trost',
  topic_angst: 'Angst & Mut',
  topic_familie: 'Familie & Mitmenschen',
  topic_besitz: 'Besitz & Ruhm',
  topic_gelassenheit: 'Gelassenheit & Widrigkeit',
  topic_pflicht: 'Pflicht & Handeln',
  topic_natur: 'Natur & Schicksal',
  // Fehler
  errOffline: 'Keine Verbindung — die Erklärung braucht Internet.',
  errAuth: 'Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.',
  errRate: 'Gerade ausgelastet. Versuch es gleich nochmal — oder hinterlege einen eigenen Key.',
  errNotConfigured:
    'Der Gratis-Modus ist noch nicht eingerichtet. Hinterlege deinen eigenen Claude-API-Key in den Einstellungen.',
  errServer: 'Da ging etwas schief. Versuch es nochmal.',
  // Einstellungen
  setTitle: 'Einstellungen',
  setDone: 'Fertig',
  setUiLang: 'App-Sprache',
  setQuoteLang: 'Zitat-Sprache',
  setAppearance: 'Erscheinungsbild',
  setLight: 'Hell',
  setDark: 'Dunkel',
  setSystem: 'System',
  setAI: 'KI-Erklärung',
  setAIHint:
    'Mit eigenem Anthropic-API-Key nutzt die App Claude direkt von deinem Gerät. Ohne Key springt der eingebaute Gratis-Modus ein (sofern verfügbar).',
  setKeyStored: 'Key hinterlegt ✓',
  setKeyDelete: 'Löschen',
  setKeySave: 'Key speichern',
  setKeySaved: 'Gespeichert.',
  setWebNote: 'Hinweis: Im Browser wird der Key unverschlüsselt im localStorage abgelegt.',
  setSources: 'Quellen',
  setSourcesText:
    'Deutsch: Albert Wittstock (1879, gemeinfrei) · Englisch: George Long (1862, gemeinfrei) · Altgriechisch: Perseus Digital Library / PerseusDL canonical-greekLit, Lizenz CC BY-SA 4.0. Details: data/SOURCES.md im Repository.',
  // Ausgewählt
  favTitle: 'Ausgewählte Gedanken',
  favOne: 'Abschnitt',
  favMany: 'Abschnitte',
  favEmptyTitle: 'Noch nichts ausgewählt',
  favEmptyText: 'Tippe beim Lesen auf den Stern, um einen Gedanken hier abzulegen.',
  favAdd: 'Zur Auswahl hinzufügen',
  favRemove: 'Aus Auswahl entfernen',
  // Bücher
  booksTitle: 'Die zwölf Bücher',
  booksSub: 'Selbstbetrachtungen · Τὰ εἰς ἑαυτόν',
  sections: 'Abschnitte',
  libTitle: 'Stoische Bibliothek',
  libSub: 'Zum Weiterlesen — von der Antike bis heute',
  eraAncient: 'Antike',
  eraModern: 'Modern',
  back: 'Zurück',
  bookNotFound: 'Buch nicht gefunden.',
  sectionNotFound: 'Abschnitt nicht gefunden.',
  // Marc Aurel
  aurelSub: '121–180 n. Chr. · Römischer Kaiser und Stoiker',
  aurelS1Title: 'Der Kaiser',
  aurelS1:
    'Marcus Aurelius Antoninus wurde 121 in Rom geboren, früh von Kaiser Hadrian gefördert und von Antoninus Pius adoptiert. Ab 161 regierte er das Römische Reich — in einer Zeit, die ihm wenig Ruhe ließ: die Markomannenkriege an der Donau, eine verheerende Seuche, Missernten und Aufstände. Er starb 180 im Feldlager bei Vindobona, dem heutigen Wien.',
  aurelS2Title: 'Der Philosoph',
  aurelS2:
    'Schon als Junge fühlte er sich der Stoa verbunden — er schlief zeitweise auf bloßen Brettern, sehr zum Ärger seiner Mutter. Sein Lehrer Junius Rusticus gab ihm die Lehrgespräche Epiktets in die Hand, die ihn nie wieder losließen. Die Nachwelt nannte ihn den „Philosophen auf dem Kaiserthron": ein Mann mit größter Macht, der täglich übte, sie nicht zu missbrauchen.',
  aurelS3Title: 'Die Selbstbetrachtungen',
  aurelS3:
    'Sein Werk „Τὰ εἰς ἑαυτόν" — wörtlich „An sich selbst" — schrieb er auf Griechisch, abends im Feldlager, unter anderem in Carnuntum an der Donau. Es war nie zur Veröffentlichung gedacht: keine Lehre, sondern ein Selbstgespräch. Zwölf Bücher lang erinnert sich ein müder Mann daran, was er sein will — geduldig, gerecht, unbestechlich gegenüber Ruhm und Angst. Gerade weil er nur für sich schrieb, liest es sich bis heute, als spräche er mit uns.',
  aurelCredit: 'Büste: Glyptothek München · Foto: Bibi Saint-Pol, Wikimedia Commons (gemeinfrei)',
  // Stoa
  stoaTitle: 'Die Stoa',
  stoaSub: 'Eine Schule der Gelassenheit · seit ca. 300 v. Chr.',
  stoaIntro:
    'Um 300 v. Chr. begann Zenon von Kition in Athen zu lehren — in der Stoa Poikile, der „bemalten Säulenhalle", die der Schule ihren Namen gab. Aus dem Kreis seiner Schüler wurde eine der einflussreichsten Philosophien der Antike: eine Anleitung, in einer Welt voller Zufälle ein aufrechtes, ruhiges Leben zu führen.',
  stoaI1Title: 'Unterscheide',
  stoaI1:
    'Manches liegt in deiner Macht: dein Urteil, dein Wille, dein Handeln. Das meiste nicht: dein Ruf, Krankheit, das Verhalten anderer. Gelassenheit beginnt dort, wo man beides sauber auseinanderhält — und seine Kraft nur auf das Erste richtet.',
  stoaI2Title: 'Tugend genügt',
  stoaI2:
    'Das einzige wirklich Gute ist der eigene Charakter: Weisheit, Gerechtigkeit, Mut und Maß. Reichtum, Gesundheit, Ansehen sind angenehm — aber weder gut noch schlecht. Wer das ernst nimmt, kann viel verlieren, ohne verloren zu sein.',
  stoaI3Title: 'Im Einklang mit der Natur',
  stoaI3:
    'Die Stoiker sahen die Welt von Vernunft durchzogen — dem Logos. Gut leben heißt: der eigenen Vernunft folgen und sich als Teil eines Ganzen begreifen. Der Mensch ist für den Menschen da, „wie die Zähne der oberen und unteren Reihe füreinander".',
  stoaI4Title: 'Übung, nicht Theorie',
  stoaI4:
    'Stoa ist tägliche Praxis: morgens sich vornehmen, wem man begegnen wird; abends den Tag prüfen; die Dinge betrachten, wie sie sind. Genau dafür schrieb Marc Aurel seine Notizen — nicht als Buch, sondern als Training.',
  stoaHeadsTitle: 'Die Köpfe',
  stoaHeads:
    'Zenon begründete die Schule, Chrysipp gab ihr das System. In Rom wurde sie praktisch: Seneca, der Berater und Essayist. Epiktet, der freigelassene Sklave, dessen Lehrgespräche Marc Aurel prägten. Und Marc Aurel selbst — der Kaiser, der sie nachts im Feldlager übte.',
  stoaTodayTitle: 'Und heute',
  stoaToday:
    'Die stoische Grundidee — nicht die Dinge beunruhigen uns, sondern unsere Urteile über sie — lebt in der modernen kognitiven Verhaltenstherapie weiter. Wer die Stoa liest, liest keine Ruinen: Sie ist eine Werkbank, und sie steht jedem offen.',
};

const en: typeof de = {
  tabQuote: 'Quote',
  tabBooks: 'Books',
  tabFavorites: 'Selected',
  tabAurel: 'Marcus Aurelius',
  tabStoa: 'Stoa',
  hintTap: 'Tap the card for the next thought',
  btnNext: 'New thought',
  btnExplain: 'Explain',
  topicAll: 'All',
  refBook: 'Book',
  langDe: 'German',
  langEn: 'English',
  langGrc: 'Ancient Greek',
  topic_tod: 'Death & Impermanence',
  topic_wut: 'Anger & Forgiveness',
  topic_trauer: 'Grief & Consolation',
  topic_angst: 'Fear & Courage',
  topic_familie: 'Family & Fellow Humans',
  topic_besitz: 'Possessions & Fame',
  topic_gelassenheit: 'Equanimity & Adversity',
  topic_pflicht: 'Duty & Action',
  topic_natur: 'Nature & Fate',
  errOffline: 'No connection — the explanation needs internet access.',
  errAuth: 'The API key was rejected. Check it in the settings.',
  errRate: 'Busy right now. Try again in a moment — or add your own key.',
  errNotConfigured: 'The free mode is not set up yet. Add your own Claude API key in the settings.',
  errServer: 'Something went wrong. Please try again.',
  setTitle: 'Settings',
  setDone: 'Done',
  setUiLang: 'App language',
  setQuoteLang: 'Quote language',
  setAppearance: 'Appearance',
  setLight: 'Light',
  setDark: 'Dark',
  setSystem: 'System',
  setAI: 'AI explanation',
  setAIHint:
    'With your own Anthropic API key, the app talks to Claude directly from your device. Without a key, the built-in free mode steps in (if available).',
  setKeyStored: 'Key stored ✓',
  setKeyDelete: 'Delete',
  setKeySave: 'Save key',
  setKeySaved: 'Saved.',
  setWebNote: 'Note: in the browser, the key is stored unencrypted in localStorage.',
  setSources: 'Sources',
  setSourcesText:
    'German: Albert Wittstock (1879, public domain) · English: George Long (1862, public domain) · Ancient Greek: Perseus Digital Library / PerseusDL canonical-greekLit, licensed CC BY-SA 4.0. Details: data/SOURCES.md in the repository.',
  favTitle: 'Selected thoughts',
  favOne: 'section',
  favMany: 'sections',
  favEmptyTitle: 'Nothing selected yet',
  favEmptyText: 'While reading, tap the star to keep a thought here.',
  favAdd: 'Add to selection',
  favRemove: 'Remove from selection',
  booksTitle: 'The Twelve Books',
  booksSub: 'Meditations · Τὰ εἰς ἑαυτόν',
  sections: 'sections',
  libTitle: 'Stoic Library',
  libSub: 'Further reading — from antiquity to today',
  eraAncient: 'Ancient',
  eraModern: 'Modern',
  back: 'Back',
  bookNotFound: 'Book not found.',
  sectionNotFound: 'Section not found.',
  aurelSub: '121–180 AD · Roman emperor and Stoic',
  aurelS1Title: 'The Emperor',
  aurelS1:
    'Marcus Aurelius Antoninus was born in Rome in 121, noticed early by the emperor Hadrian and adopted by Antoninus Pius. From 161 he ruled the Roman Empire — through years that gave him little rest: the Marcomannic Wars on the Danube, a devastating plague, failed harvests and revolts. He died in 180 in the army camp at Vindobona, today’s Vienna.',
  aurelS2Title: 'The Philosopher',
  aurelS2:
    'Even as a boy he was drawn to the Stoa — for a while he slept on bare boards, much to his mother’s dismay. His teacher Junius Rusticus put Epictetus’ Discourses into his hands, and they never let him go. Posterity called him the “philosopher on the throne”: a man of supreme power who practiced, daily, not to abuse it.',
  aurelS3Title: 'The Meditations',
  aurelS3:
    'He wrote his work “Τὰ εἰς ἑαυτόν” — literally “To Himself” — in Greek, at night in army camps, among them Carnuntum on the Danube. It was never meant for publication: not a doctrine, but a conversation with himself. Across twelve books, a tired man keeps reminding himself of who he wants to be — patient, just, incorruptible by fame and fear. Precisely because he wrote only for himself, it still reads as if he were speaking to us.',
  aurelCredit: 'Bust: Glyptothek Munich · Photo: Bibi Saint-Pol, Wikimedia Commons (public domain)',
  stoaTitle: 'The Stoa',
  stoaSub: 'A school of equanimity · since ca. 300 BC',
  stoaIntro:
    'Around 300 BC, Zeno of Citium began teaching in Athens — in the Stoa Poikile, the “painted colonnade” that gave the school its name. From his circle of students grew one of the most influential philosophies of antiquity: a guide to living an upright, calm life in a world full of chance.',
  stoaI1Title: 'Distinguish',
  stoaI1:
    'Some things are in your power: your judgment, your will, your actions. Most things are not: your reputation, illness, other people’s behavior. Equanimity begins where you keep the two cleanly apart — and spend your strength only on the first.',
  stoaI2Title: 'Virtue suffices',
  stoaI2:
    'The only true good is your own character: wisdom, justice, courage and moderation. Wealth, health and standing are pleasant — but neither good nor bad. Whoever takes this seriously can lose much without being lost.',
  stoaI3Title: 'In accord with nature',
  stoaI3:
    'The Stoics saw the world as pervaded by reason — the Logos. To live well means to follow your own reason and to understand yourself as part of a whole. We exist for one another, “like the rows of upper and lower teeth.”',
  stoaI4Title: 'Practice, not theory',
  stoaI4:
    'Stoicism is daily practice: in the morning, anticipate whom you will meet; in the evening, review the day; see things as they are. This is exactly what Marcus Aurelius wrote his notes for — not as a book, but as training.',
  stoaHeadsTitle: 'The Minds',
  stoaHeads:
    'Zeno founded the school, Chrysippus gave it its system. In Rome it became practical: Seneca, the adviser and essayist. Epictetus, the freed slave whose Discourses shaped Marcus Aurelius. And Marcus himself — the emperor who practiced it at night in army camps.',
  stoaTodayTitle: 'And today',
  stoaToday:
    'The core Stoic idea — that it is not things that trouble us, but our judgments about them — lives on in modern cognitive behavioral therapy. Whoever reads the Stoics reads no ruins: it is a workbench, and it is open to everyone.',
};

export type StringKey = keyof typeof de;

const STRINGS: Record<UiLang, typeof de> = { de, en };

export function useT(): (key: StringKey) => string {
  const lang = useUiLang();
  return (key: StringKey) => STRINGS[lang][key];
}

export interface ReadingItem {
  title: string;
  titleEn: string;
  author: string;
  era: 'Antike' | 'Modern';
  note: string;
  noteEn: string;
}

export const READING_LIST: ReadingItem[] = [
  {
    title: 'Handbüchlein der Moral',
    titleEn: 'Enchiridion',
    author: 'Epiktet',
    era: 'Antike',
    note: 'Die kompakteste Einführung in stoisches Denken — in einer Stunde gelesen, ein Leben lang gekaut.',
    noteEn: 'The most compact introduction to Stoic thought — read in an hour, chewed on for a lifetime.',
  },
  {
    title: 'Lehrgespräche',
    titleEn: 'Discourses',
    author: 'Epiktet',
    era: 'Antike',
    note: 'Mitschriften seines Schülers Arrian. Die Stoa als Übung, nicht als Theorie — Marc Aurels wichtigste Quelle.',
    noteEn: 'Transcripts by his student Arrian. Stoicism as practice, not theory — Marcus Aurelius’ most important source.',
  },
  {
    title: 'Briefe an Lucilius',
    titleEn: 'Letters to Lucilius',
    author: 'Seneca',
    era: 'Antike',
    note: '124 Briefe über Zeit, Tod und Gelassenheit. Erstaunlich modern, in kleinen Portionen lesbar.',
    noteEn: '124 letters on time, death and equanimity. Astonishingly modern, readable in small portions.',
  },
  {
    title: 'Von der Kürze des Lebens',
    titleEn: 'On the Shortness of Life',
    author: 'Seneca',
    era: 'Antike',
    note: 'Nicht das Leben ist kurz — wir verschwenden es. Ein Essay wie ein Weckruf.',
    noteEn: 'Life is not short — we waste it. An essay like a wake-up call.',
  },
  {
    title: 'Die innere Burg',
    titleEn: 'The Inner Citadel',
    author: 'Pierre Hadot',
    era: 'Modern',
    note: 'Die maßgebliche Deutung der Selbstbetrachtungen: was Marc Aurel mit seinen Notizen wirklich übte.',
    noteEn: 'The definitive reading of the Meditations: what Marcus Aurelius was actually practicing with his notes.',
  },
  {
    title: 'How to Think Like a Roman Emperor',
    titleEn: 'How to Think Like a Roman Emperor',
    author: 'Donald Robertson',
    era: 'Modern',
    note: 'Marc Aurels Leben als Einführung in stoische Psychologie — nah an der modernen Verhaltenstherapie.',
    noteEn: 'Marcus Aurelius’ life as an introduction to Stoic psychology — close to modern behavioral therapy.',
  },
  {
    title: 'Die Weisheit der Stoiker',
    titleEn: 'How to Be a Stoic',
    author: 'Massimo Pigliucci',
    era: 'Modern',
    note: 'Stoizismus als praktische Lebensphilosophie für heute, mit Epiktet als Leitfaden.',
    noteEn: 'Stoicism as a practical philosophy of life for today, with Epictetus as the guide.',
  },
  {
    title: 'Der tägliche Stoiker',
    titleEn: 'The Daily Stoic',
    author: 'Ryan Holiday',
    era: 'Modern',
    note: '366 kurze Impulse — ein niedrigschwelliger Einstieg für jeden Tag.',
    noteEn: '366 short prompts — an accessible entry point for every day.',
  },
];

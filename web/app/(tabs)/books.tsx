import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import quotesData from '../../data/quotes.json';
import type { Author, Quote, QuoteLang } from '../../lib/quotes';
import { bookRoman } from '../../lib/quotes';
import { EPIKTET_QUOTES } from '../../lib/corpus';
import { getAuthor, getQuoteLang, setAuthor as persistAuthor, setQuoteLang } from '../../lib/settings';
import { READING_LIST } from '../../data/readingList';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { Segmented } from '../../components/Segmented';
import { fonts } from '../../theme/tokens';
import { useT, useUiLang } from '../../lib/i18n';

const QUOTES = quotesData as Quote[];

export default function Books() {
  const { colors } = useTheme();
  const router = useRouter();
  const t = useT();
  const uiLang = useUiLang();
  const [author, setAuthor] = useState<Author>('aurel');
  const [lang, setLang] = useState<QuoteLang>('de');

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getAuthor().then((a) => alive && setAuthor(a));
      getQuoteLang().then((l) => alive && setLang(l));
      return () => {
        alive = false;
      };
    }, []),
  );

  const books = useMemo(() => {
    const counts = new Map<number, number>();
    for (const q of QUOTES) counts.set(q.book, (counts.get(q.book) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  const changeAuthor = (a: Author) => {
    setAuthor(a);
    void persistAuthor(a);
  };

  return (
    <Screen>
      <View style={styles.switcher}>
        <Segmented<Author>
          options={[
            { value: 'aurel', label: t('authorAurel') },
            { value: 'epiktet', label: t('authorEpiktet') },
          ]}
          value={author}
          onChange={changeAuthor}
        />
        <Segmented<QuoteLang>
          options={[
            { value: 'de', label: t('langDe') },
            { value: 'en', label: t('langEn') },
            { value: 'grc', label: t('langGrc') },
          ]}
          value={lang}
          onChange={(l) => {
            setLang(l);
            void setQuoteLang(l);
          }}
        />
      </View>
      {author === 'epiktet' ? (
        <>
          <Text style={[styles.h1, { color: colors.text }]}>{t('enchTitle')}</Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>{t('enchSub')}</Text>

          <View style={styles.list}>
            {EPIKTET_QUOTES.map((q) => (
              <Pressable
                key={q.id}
                onPress={() => router.push(`/read/${q.id}`)}
                accessibilityRole="button"
                style={styles.chapterRow}
              >
                <Text style={[styles.chapterNum, { color: colors.accent }]}>{q.section}</Text>
                <Text
                  numberOfLines={2}
                  style={[styles.chapterPreview, { color: colors.text }]}
                >
                  {q.texts[lang]}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.h1, { color: colors.text }]}>{t('booksTitle')}</Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>{t('booksSub')}</Text>

          <View style={styles.list}>
            {books.map(([book, count]) => (
              <Pressable
                key={book}
                onPress={() => router.push(`/book/${book}`)}
                accessibilityRole="button"
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {t('refBook')} {bookRoman(book)}
                </Text>
                <View style={styles.rowRight}>
                  <Text style={{ color: colors.textSoft, fontSize: 13 }}>
                    {count} {t('sections')}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.h1, styles.h1Second, { color: colors.text }]}>{t('libTitle')}</Text>
      <Text style={[styles.sub, { color: colors.textSoft }]}>{t('libSub')}</Text>

      <View style={styles.list}>
        {READING_LIST.map((item) => (
          <View
            key={item.title}
            style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.era, { color: colors.accent }]}>
              {item.author.toUpperCase()} ·{' '}
              {t(item.era === 'Antike' ? 'eraAncient' : 'eraModern').toUpperCase()}
            </Text>
            <Text style={[styles.bookTitle, { color: colors.text }]}>
              {uiLang === 'en' ? item.titleEn : item.title}
            </Text>
            <Text style={{ color: colors.textSoft, fontSize: 14, lineHeight: 21 }}>
              {uiLang === 'en' ? item.noteEn : item.note}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { alignItems: 'center', marginTop: 8, marginBottom: 4, gap: 10 },
  h1: { fontFamily: fonts.display, fontSize: 28, marginTop: 8 },
  h1Second: { marginTop: 36 },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, marginBottom: 16 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowTitle: { fontFamily: fonts.quote, fontSize: 17 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chapterRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  chapterNum: { fontSize: 13, fontWeight: '700', minWidth: 24, textAlign: 'right' },
  chapterPreview: { flex: 1, fontFamily: fonts.quote, fontSize: 15, lineHeight: 22 },
  bookCard: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 6 },
  era: { fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  bookTitle: { fontFamily: fonts.quote, fontSize: 18 },
});

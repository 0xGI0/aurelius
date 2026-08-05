import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import quotesData from '../../data/quotes.json';
import type { Quote, QuoteLang } from '../../lib/quotes';
import { bookRoman } from '../../lib/quotes';
import { SENECA_QUOTES } from '../../lib/corpus';
import { getQuoteLang } from '../../lib/settings';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { fonts } from '../../theme/tokens';
import { useT } from '../../lib/i18n';

const QUOTES = quotesData as Quote[];

export default function Book() {
  const { colors } = useTheme();
  const router = useRouter();
  const t = useT();
  const { book } = useLocalSearchParams<{ book: string }>();
  // "7" = Aurel Buch 7 · "s-7" = Seneca De brevitate Kapitel 7
  const isSeneca = typeof book === 'string' && book.startsWith('s-');
  const bookNumber = Number(isSeneca ? (book as string).slice(2) : book);
  const [lang, setLang] = useState<QuoteLang>('de');

  useEffect(() => {
    getQuoteLang().then(setLang);
  }, []);

  const sections = useMemo(() => {
    const pool = isSeneca ? SENECA_QUOTES : QUOTES;
    return pool.filter((q) => q.book === bookNumber).sort((a, b) => a.section - b.section);
  }, [bookNumber, isSeneca]);

  const header = (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Zurück"
        style={styles.back}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color={colors.accent} />
        <Text style={{ color: colors.accent }}>{t('back')}</Text>
      </Pressable>
    </View>
  );

  if (sections.length === 0) {
    return (
      <Screen center header={header}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>{t('bookNotFound')}</Text>
      </Screen>
    );
  }

  return (
    <Screen header={header}>
      <Text style={[styles.h1, { color: colors.text }]}>
        {isSeneca ? `De brevitate ${bookNumber}` : `${t('refBook')} ${bookRoman(bookNumber)}`}
      </Text>
      <Text style={[styles.sub, { color: colors.textSoft }]}>
        {sections.length} {t('sections')}
      </Text>
      <View style={styles.list}>
        {sections.map((q) => (
          <Pressable
            key={q.id}
            onPress={() => router.push(`/read/${q.id}`)}
            accessibilityRole="button"
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.num, { color: colors.accent }]}>{q.section}</Text>
            <Text numberOfLines={2} style={[styles.preview, { color: colors.text }]}>
              {q.texts[lang]}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  h1: { fontFamily: fonts.display, fontSize: 28, marginTop: 4 },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, marginBottom: 16 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  num: { fontSize: 13, fontWeight: '700', minWidth: 24, textAlign: 'right', lineHeight: 22 },
  preview: { flex: 1, fontFamily: fonts.quote, fontSize: 15, lineHeight: 22 },
});

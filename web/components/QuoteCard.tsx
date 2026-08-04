import React from 'react';
import { Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import type { Quote, QuoteLang } from '../lib/quotes';
import { formatReference } from '../lib/quotes';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/tokens';

interface Props {
  quote: Quote;
  lang: QuoteLang;
  onPress: () => void;
}

export function QuoteCard({ quote, lang, onPress }: Props) {
  const { colors } = useTheme();
  const isGreek = lang === 'grc';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Tippen für den nächsten Abschnitt"
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontFamily: isGreek ? fonts.greek : fonts.quote,
            fontSize: isGreek ? 22 : 24,
            lineHeight: isGreek ? 34 : 36,
            color: colors.text,
          }}
        >
          {quote.texts[lang]}
        </Text>
      </ScrollView>
      <Text style={[styles.ref, { color: colors.accent }]}>
        {formatReference(quote).toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 24, maxHeight: 420, minHeight: 220 },
  scroll: { flexGrow: 0 },
  ref: { marginTop: 16, fontSize: 12, letterSpacing: 2, fontWeight: '600' },
});

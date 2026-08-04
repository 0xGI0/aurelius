import React from 'react';
import { Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import type { Quote, QuoteLang } from '../lib/quotes';
import { formatReference } from '../lib/quotes';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../lib/i18n';
import { fonts } from '../theme/tokens';

interface Props {
  quote: Quote;
  lang: QuoteLang;
  onPress?: () => void;
  topInset?: number;
}

export function QuoteCard({ quote, lang, onPress, topInset = 0 }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const isGreek = lang === 'grc';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? 'Tippen für den nächsten Abschnitt' : undefined}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        topInset > 0 && { paddingTop: topInset },
      ]}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontFamily: isGreek ? fonts.greek : fonts.quote,
            fontSize: isGreek ? 22 : 23,
            lineHeight: isGreek ? 34 : 36,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          {quote.texts[lang]}
        </Text>
      </ScrollView>
      <Text style={[styles.ref, { color: colors.accent }]}>
        {formatReference(quote, t('refBook')).toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 28, maxHeight: 460, minHeight: 220 },
  scroll: { flexGrow: 0 },
  ref: {
    marginTop: 18,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
});

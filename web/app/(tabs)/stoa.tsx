import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { fonts } from '../../theme/tokens';
import { useT, type StringKey } from '../../lib/i18n';

const IDEAS: Array<{ title: StringKey; body: StringKey }> = [
  { title: 'stoaI1Title', body: 'stoaI1' },
  { title: 'stoaI2Title', body: 'stoaI2' },
  { title: 'stoaI3Title', body: 'stoaI3' },
  { title: 'stoaI4Title', body: 'stoaI4' },
];

export default function Stoa() {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Screen>
      <Text style={[styles.h1, { color: colors.text }]}>{t('stoaTitle')}</Text>
      <Text style={[styles.sub, { color: colors.textSoft }]}>{t('stoaSub')}</Text>

      <Text style={[styles.body, { color: colors.text }]}>{t('stoaIntro')}</Text>

      <View style={styles.cards}>
        {IDEAS.map((idea, i) => (
          <View
            key={idea.title}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardKicker, { color: colors.accent }]}>
              {String(i + 1).padStart(2, '0')} · {t(idea.title).toUpperCase()}
            </Text>
            <Text style={[styles.cardBody, { color: colors.text }]}>{t(idea.body)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {t('stoaHeadsTitle').toUpperCase()}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>{t('stoaHeads')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {t('stoaTodayTitle').toUpperCase()}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>{t('stoaToday')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 30, marginTop: 8 },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 26 },
  cards: { gap: 12, marginTop: 20 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 8 },
  cardKicker: { fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  cardBody: { fontSize: 15, lineHeight: 23 },
  section: { marginTop: 24, gap: 8 },
  sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: '600' },
});

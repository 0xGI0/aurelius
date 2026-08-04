import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { fonts } from '../../theme/tokens';
import { useT, type StringKey } from '../../lib/i18n';

const SECTIONS: Array<{ title: StringKey; body: StringKey }> = [
  { title: 'aurelS1Title', body: 'aurelS1' },
  { title: 'aurelS2Title', body: 'aurelS2' },
  { title: 'aurelS3Title', body: 'aurelS3' },
];

export default function Aurel() {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Screen>
      <Image
        source={require('../../assets/images/marcus-portrait.jpg')}
        style={[styles.portrait, { borderColor: colors.border }]}
        accessibilityLabel="Marcus Aurelius"
      />
      <Text style={[styles.h1, { color: colors.text }]}>Marc Aurel</Text>
      <Text style={[styles.sub, { color: colors.textSoft }]}>{t('aurelSub')}</Text>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>
            {t(s.title).toUpperCase()}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>{t(s.body)}</Text>
        </View>
      ))}

      <Text style={[styles.credit, { color: colors.textSoft }]}>{t('aurelCredit')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  portrait: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 8,
  },
  h1: { fontFamily: fonts.display, fontSize: 30, marginTop: 20, textAlign: 'center' },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, textAlign: 'center', marginBottom: 8 },
  section: { marginTop: 22, gap: 8 },
  sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 26 },
  credit: { fontSize: 11, marginTop: 28, textAlign: 'center' },
});

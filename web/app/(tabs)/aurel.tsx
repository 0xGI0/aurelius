import React, { useCallback, useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Author } from '../../lib/quotes';
import { getAuthor, setAuthor } from '../../lib/settings';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { Segmented } from '../../components/Segmented';
import { fonts } from '../../theme/tokens';
import { useT, type StringKey } from '../../lib/i18n';

const AUREL_SECTIONS: Array<{ title: StringKey; body: StringKey }> = [
  { title: 'aurelS1Title', body: 'aurelS1' },
  { title: 'aurelS2Title', body: 'aurelS2' },
  { title: 'aurelS3Title', body: 'aurelS3' },
];

const EPIKTET_SECTIONS: Array<{ title: StringKey; body: StringKey }> = [
  { title: 'epikS1Title', body: 'epikS1' },
  { title: 'epikS2Title', body: 'epikS2' },
  { title: 'epikS3Title', body: 'epikS3' },
];

const DIFF_SECTIONS: Array<{ title: StringKey; body: StringKey }> = [
  { title: 'diff1Title', body: 'diff1' },
  { title: 'diff2Title', body: 'diff2' },
  { title: 'diff3Title', body: 'diff3' },
];

export default function Stoics() {
  const { colors } = useTheme();
  const t = useT();
  const [author, setAuthorState] = useState<Author>('aurel');

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getAuthor().then((a) => alive && setAuthorState(a));
      return () => {
        alive = false;
      };
    }, []),
  );

  const changeAuthor = (a: Author) => {
    setAuthorState(a);
    void setAuthor(a);
  };

  const isEpiktet = author === 'epiktet';
  const sections = isEpiktet ? EPIKTET_SECTIONS : AUREL_SECTIONS;

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
      </View>

      <Image
        source={
          isEpiktet
            ? require('../../assets/images/epictetus.jpg')
            : require('../../assets/images/marcus-portrait.jpg')
        }
        style={[styles.portrait, { borderColor: colors.border }]}
        accessibilityLabel={isEpiktet ? t('authorEpiktet') : t('authorAurel')}
      />
      <Text style={[styles.h1, { color: colors.text }]}>
        {isEpiktet ? 'Epiktet' : 'Marc Aurel'}
      </Text>
      <Text style={[styles.sub, { color: colors.textSoft }]}>
        {isEpiktet ? t('epikSub') : t('aurelSub')}
      </Text>

      {sections.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>
            {t(s.title).toUpperCase()}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>{t(s.body)}</Text>
        </View>
      ))}

      <Text style={[styles.diffTitle, { color: colors.text }]}>{t('diffTitle')}</Text>
      {DIFF_SECTIONS.map((s) => (
        <View
          key={s.title}
          style={[styles.diffCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>
            {t(s.title).toUpperCase()}
          </Text>
          <Text style={[styles.diffBody, { color: colors.text }]}>{t(s.body)}</Text>
        </View>
      ))}

      <Text style={[styles.credit, { color: colors.textSoft }]}>
        {isEpiktet ? t('epikCredit') : t('aurelCredit')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { alignItems: 'center', marginTop: 8 },
  portrait: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 16,
  },
  h1: { fontFamily: fonts.display, fontSize: 30, marginTop: 20, textAlign: 'center' },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, textAlign: 'center', marginBottom: 8 },
  section: { marginTop: 22, gap: 8 },
  sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 26 },
  diffTitle: { fontFamily: fonts.display, fontSize: 24, marginTop: 36, marginBottom: 4 },
  diffCard: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 6, marginTop: 10 },
  diffBody: { fontSize: 15, lineHeight: 23 },
  credit: { fontSize: 11, marginTop: 28, textAlign: 'center' },
});

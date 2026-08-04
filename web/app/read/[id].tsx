import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import quotesData from '../../data/quotes.json';
import type { Quote, QuoteLang } from '../../lib/quotes';
import { getQuoteLang, setQuoteLang } from '../../lib/settings';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { QuoteCard } from '../../components/QuoteCard';
import { Segmented } from '../../components/Segmented';
import { ExplainSection } from '../../components/ExplainSection';
import { FavoriteStar } from '../../components/FavoriteStar';
import { useT } from '../../lib/i18n';

const QUOTES = quotesData as Quote[];

export default function Read() {
  const { colors } = useTheme();
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useMemo(() => QUOTES.find((q) => q.id === id), [id]);
  const [lang, setLang] = useState<QuoteLang>('de');

  useEffect(() => {
    getQuoteLang().then(setLang);
  }, []);

  const changeLang = (l: QuoteLang) => {
    setLang(l);
    void setQuoteLang(l);
  };

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

  if (!quote) {
    return (
      <Screen center header={header}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>{t('sectionNotFound')}</Text>
      </Screen>
    );
  }

  return (
    <Screen center header={header}>
      <QuoteCard quote={quote} lang={lang} />
      <View style={styles.controls}>
        <View style={styles.langRow}>
          <Segmented<QuoteLang>
            options={[
              { value: 'de', label: t('langDe') },
              { value: 'en', label: t('langEn') },
              { value: 'grc', label: t('langGrc') },
            ]}
            value={lang}
            onChange={changeLang}
          />
          <FavoriteStar quoteId={quote.id} />
        </View>
      </View>
      <ExplainSection quote={quote} lang={lang} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  controls: { marginTop: 20, gap: 10, alignItems: 'center' },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});

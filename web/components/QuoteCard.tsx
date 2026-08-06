import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Quote, QuoteLang } from '../lib/quotes';
import { authorOf, referenceLabel } from '../lib/corpus';
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
  // GFS Didot nur für echtes Griechisch — Senecas Original-Slot trägt
  // Latein, und Didots Latein-Glyphen wirken deutlich dünner als Fraunces.
  const isGreek = lang === 'grc' && authorOf(quote.id) !== 'seneca';

  // Scroll-Hinweis: Kanten-Verlauf + immer sichtbare schmale Scroll-Leiste
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [layoutH, setLayoutH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const lastY = useRef(0);

  const update = useCallback((viewH: number, fullH: number) => {
    setFadeTop(lastY.current > 1);
    setFadeBottom(lastY.current + viewH < fullH - 1);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastY.current = e.nativeEvent.contentOffset.y;
    setScrollY(lastY.current);
    update(layoutH, contentH);
  };

  const scrollable = contentH > layoutH + 1;
  const barH = scrollable ? Math.max(24, (layoutH / contentH) * layoutH) : 0;
  const barTop = scrollable
    ? Math.min(layoutH - barH, (scrollY / (contentH - layoutH)) * (layoutH - barH))
    : 0;

  const transparent = `${colors.card}00`;

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
      <View style={styles.scrollWrap}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onLayout={(e) => {
            setLayoutH(e.nativeEvent.layout.height);
            update(e.nativeEvent.layout.height, contentH);
          }}
          onContentSizeChange={(_, h) => {
            setContentH(h);
            update(layoutH, h);
          }}
        >
          <Text
            selectable
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
        {fadeBottom && (
          <LinearGradient
            colors={[transparent, colors.card]}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        )}
        {fadeTop && (
          <LinearGradient
            colors={[colors.card, transparent]}
            style={styles.fadeTop}
            pointerEvents="none"
          />
        )}
        {scrollable && (
          <View
            pointerEvents="none"
            style={[
              styles.scrollbar,
              { backgroundColor: `${colors.accent}66`, height: barH, top: barTop },
            ]}
          />
        )}
      </View>
      <Text style={[styles.ref, { color: colors.accent }]}>
        {referenceLabel(quote, t('refBook'), t('refManual')).toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 28, maxHeight: 460, minHeight: 220 },
  scrollWrap: { flexShrink: 1, alignSelf: 'stretch' },
  scroll: { flexGrow: 0 },
  ref: {
    marginTop: 18,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  fadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 36 },
  fadeTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 36 },
  scrollbar: { position: 'absolute', right: -14, width: 3, borderRadius: 2 },
});

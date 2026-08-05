import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Scroll-Hinweis: Verlauf am unteren/oberen Rand, solange dort Text wartet
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const layoutH = useRef(0);
  const contentH = useRef(0);
  const lastY = useRef(0);

  const update = useCallback(() => {
    setFadeTop(lastY.current > 1);
    setFadeBottom(lastY.current + layoutH.current < contentH.current - 1);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastY.current = e.nativeEvent.contentOffset.y;
    update();
  };

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
            layoutH.current = e.nativeEvent.layout.height;
            update();
          }}
          onContentSizeChange={(_, h) => {
            contentH.current = h;
            update();
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
      </View>
      <Text style={[styles.ref, { color: colors.accent }]}>
        {formatReference(quote, t('refBook')).toUpperCase()}
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
});

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import quotesData from '../../data/quotes.json';
import type { Quote } from '../../lib/quotes';
import { formatReference } from '../../lib/quotes';
import { getFavorites } from '../../lib/settings';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { FavoriteStar } from '../../components/FavoriteStar';
import { fonts } from '../../theme/tokens';
import { useT } from '../../lib/i18n';

const QUOTES = quotesData as Quote[];

export default function Favorites() {
  const { colors } = useTheme();
  const router = useRouter();
  const t = useT();
  const byId = useMemo(() => new Map(QUOTES.map((q) => [q.id, q])), []);
  const [ids, setIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getFavorites().then((f) => {
        if (alive) setIds(f);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const favorites = ids.map((id) => byId.get(id)).filter((q): q is Quote => q !== undefined);

  return (
    <Screen center={favorites.length === 0}>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={40} color={colors.accent} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('favEmptyTitle')}</Text>
          <Text style={[styles.emptyText, { color: colors.textSoft }]}>{t('favEmptyText')}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.h1, { color: colors.text }]}>{t('favTitle')}</Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            {favorites.length} {favorites.length === 1 ? t('favOne') : t('favMany')}
          </Text>
          <View style={styles.list}>
            {favorites.map((q) => (
              <Pressable
                key={q.id}
                onPress={() => router.push(`/read/${q.id}`)}
                accessibilityRole="button"
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.rowBody}>
                  <Text style={[styles.ref, { color: colors.accent }]}>
                    {formatReference(q, t('refBook')).toUpperCase()}
                  </Text>
                  <Text numberOfLines={3} style={[styles.preview, { color: colors.text }]}>
                    {q.texts.de}
                  </Text>
                </View>
                <FavoriteStar quoteId={q.id} size={20} onToggled={setIds} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 28, marginTop: 8 },
  sub: { fontSize: 13, letterSpacing: 1, marginTop: 4, marginBottom: 16 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },
  rowBody: { flex: 1, gap: 6 },
  ref: { fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  preview: { fontFamily: fonts.quote, fontSize: 16, lineHeight: 24 },
  empty: { alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 22 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 21 },
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import topicsData from '../../data/topics.json';
import type { Author, Quote, QuoteLang } from '../../lib/quotes';
import { ShuffleBag } from '../../lib/quotes';
import { authorOf, byId, idsFor } from '../../lib/corpus';
import { getAuthor, getQuoteLang, setAuthor, setQuoteLang } from '../../lib/settings';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/Screen';
import { QuoteCard } from '../../components/QuoteCard';
import { Segmented } from '../../components/Segmented';
import { ExplainSection } from '../../components/ExplainSection';
import { FavoriteStar } from '../../components/FavoriteStar';
import { TopicChips } from '../../components/TopicChips';
import { useT, type StringKey } from '../../lib/i18n';

const TOPICS = topicsData as Array<{ id: string; label: string; quoteIds: string[] }>;
const TOPIC_IDS = new Map(TOPICS.map((t) => [t.id, t.quoteIds]));

/** Zieh-Pool für Autor × Thema. */
function poolFor(author: Author, topic: string): string[] {
  const base = topic === 'alle' ? idsFor(author) : (TOPIC_IDS.get(topic) ?? idsFor(author));
  return base.filter((id) => authorOf(id) === author);
}

export default function Home() {
  const { colors } = useTheme();
  const t = useT();
  const topicOptions = [
    { id: 'alle', label: t('topicAll') },
    ...TOPICS.map((tp) => ({ id: tp.id, label: t(`topic_${tp.id}` as StringKey) })),
  ];
  const [topic, setTopic] = useState('alle');
  const [author, setAuthorState] = useState<Author>('aurel');
  const bagRef = useRef(new ShuffleBag(poolFor('aurel', 'alle')));
  const [quote, setQuote] = useState<Quote>(() => byId(bagRef.current.next())!);
  const [lang, setLang] = useState<QuoteLang>('de');
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getQuoteLang().then(setLang);
    getAuthor().then((a) => {
      if (a !== 'aurel') {
        setAuthorState(a);
        bagRef.current = new ShuffleBag(poolFor(a, 'alle'));
        setQuote(byId(bagRef.current.next())!);
      }
    });
  }, []);

  const swapTo = (nextQuote: Quote) => {
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setQuote(nextQuote);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const drawNext = () => {
    swapTo(byId(bagRef.current.next())!);
  };

  const changeTopic = (id: string) => {
    if (id === topic) return;
    setTopic(id);
    bagRef.current = new ShuffleBag(poolFor(author, id));
    swapTo(byId(bagRef.current.next())!);
  };

  const changeAuthor = (a: Author) => {
    if (a === author) return;
    setAuthorState(a);
    void setAuthor(a);
    bagRef.current = new ShuffleBag(poolFor(a, topic));
    swapTo(byId(bagRef.current.next())!);
  };

  const changeLang = (l: QuoteLang) => {
    setLang(l);
    void setQuoteLang(l);
  };

  // Die Wortmarke ist der Autoren-Umschalter: aktiver Autor in Akzentfarbe
  const header = (
    <View style={styles.header}>
      <View style={styles.headerSide} />
      <View style={styles.brandRow}>
        <Pressable
          onPress={() => changeAuthor('aurel')}
          accessibilityRole="button"
          accessibilityState={{ selected: author === 'aurel' }}
        >
          <Text style={[styles.brand, { color: author === 'aurel' ? colors.accent : colors.textSoft }]}>
            AURELIUS
          </Text>
        </Pressable>
        <Text style={[styles.brand, { color: colors.textSoft }]}>·</Text>
        <Pressable
          onPress={() => changeAuthor('epiktet')}
          accessibilityRole="button"
          accessibilityState={{ selected: author === 'epiktet' }}
        >
          <Text style={[styles.brand, { color: author === 'epiktet' ? colors.accent : colors.textSoft }]}>
            EPIKTET
          </Text>
        </Pressable>
        <Text style={[styles.brand, { color: colors.textSoft }]}>·</Text>
        <Pressable
          onPress={() => changeAuthor('seneca')}
          accessibilityRole="button"
          accessibilityState={{ selected: author === 'seneca' }}
        >
          <Text style={[styles.brand, { color: author === 'seneca' ? colors.accent : colors.textSoft }]}>
            SENECA
          </Text>
        </Pressable>
      </View>
      <View style={styles.headerSide}>
        <Link href="/settings" accessibilityLabel="Einstellungen">
          <Ionicons name="settings-outline" size={20} color={colors.accent} />
        </Link>
      </View>
    </View>
  );

  return (
    <Screen center header={header}>
      <Animated.View style={{ opacity: fade }}>
        <View style={styles.medallionWrap}>
          <Image
            source={
              author === 'epiktet'
                ? require('../../assets/images/epictetus.jpg')
                : author === 'seneca'
                  ? require('../../assets/images/seneca.jpg')
                  : require('../../assets/images/marcus-medallion.jpg')
            }
            style={[styles.medallion, { borderColor: colors.accent }]}
            accessibilityLabel={
              author === 'epiktet'
                ? t('authorEpiktet')
                : author === 'seneca'
                  ? t('authorSeneca')
                  : t('authorAurel')
            }
          />
        </View>
        {/* Kein Tap-to-Next mehr: Text soll markier-/kopierbar sein (User-Wunsch) */}
        <QuoteCard quote={quote} lang={lang} topInset={64} />
      </Animated.View>

      <View style={styles.controls}>
        <TopicChips topics={topicOptions} value={topic} onChange={changeTopic} />
        <View style={styles.langRow}>
          <Segmented<QuoteLang>
            options={[
              { value: 'de', label: t('langDe') },
              { value: 'en', label: t('langEn') },
              { value: 'grc', label: author === 'seneca' ? t('langLa') : t('langGrc') },
            ]}
            value={lang}
            onChange={changeLang}
          />
          <FavoriteStar quoteId={quote.id} />
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={drawNext}
            accessibilityRole="button"
            style={[styles.nextBtn, { borderColor: colors.accent }]}
          >
            <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('btnNext')}</Text>
          </Pressable>
        </View>
      </View>

      <ExplainSection quote={quote} lang={lang} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerSide: { width: 24, alignItems: 'flex-end' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brand: { fontSize: 12, letterSpacing: 3, fontWeight: '600' },
  medallionWrap: { alignItems: 'center', marginBottom: -44, zIndex: 2 },
  medallion: { width: 88, height: 88, borderRadius: 44, borderWidth: 2 },
  controls: { marginTop: 20, gap: 14, alignItems: 'center' },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  nextBtn: { borderWidth: 1.5, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 999 },
});

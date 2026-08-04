import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import quotesData from '../data/quotes.json';
import type { Quote, QuoteLang } from '../lib/quotes';
import { ShuffleBag } from '../lib/quotes';
import { getQuoteLang, setQuoteLang } from '../lib/settings';
import { getExplainStream, ExplainError } from '../lib/ai';
import { useTheme } from '../theme/ThemeContext';
import { QuoteCard } from '../components/QuoteCard';
import { Segmented } from '../components/Segmented';
import { StreamingText } from '../components/StreamingText';

const QUOTES = quotesData as Quote[];

const ERROR_COPY: Record<string, string> = {
  offline: 'Keine Verbindung — die Erklärung braucht Internet.',
  auth: 'Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.',
  rate_limited: 'Gerade ausgelastet. Versuch es gleich nochmal — oder hinterlege einen eigenen Key.',
  server: 'Da ging etwas schief. Versuch es nochmal.',
};

export default function Home() {
  const { colors } = useTheme();
  const bag = useMemo(() => new ShuffleBag(QUOTES.map((q) => q.id)), []);
  const byId = useMemo(() => new Map(QUOTES.map((q) => [q.id, q])), []);
  const [quote, setQuote] = useState<Quote>(() => byId.get(bag.next())!);
  const [lang, setLang] = useState<QuoteLang>('de');
  const [stream, setStream] = useState<AsyncIterable<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const requestId = useRef(0);

  useEffect(() => {
    getQuoteLang().then(setLang);
  }, []);

  const nextQuote = () => {
    requestId.current += 1;
    setStream(null);
    setError(null);
    setBusy(false);
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setQuote(byId.get(bag.next())!);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const changeLang = (l: QuoteLang) => {
    setLang(l);
    void setQuoteLang(l);
  };

  const explain = async () => {
    setError(null);
    setBusy(true);
    const id = requestId.current;
    try {
      const s = await getExplainStream(quote, lang);
      if (id !== requestId.current) return;
      setStream(s);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof ExplainError ? ERROR_COPY[e.kind] : ERROR_COPY.server);
      setBusy(false);
    }
  };

  const onStreamError = (e: unknown) => {
    setStream(null);
    setBusy(false);
    setError(e instanceof ExplainError ? ERROR_COPY[e.kind] : ERROR_COPY.server);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: colors.textSoft }]}>AURELIUS</Text>
        <Link href="/settings" accessibilityLabel="Einstellungen">
          <Text style={{ color: colors.accent, fontSize: 22 }}>⚙</Text>
        </Link>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fade }}>
          <QuoteCard quote={quote} lang={lang} onPress={nextQuote} />
        </Animated.View>
        <View style={styles.controls}>
          <Segmented<QuoteLang>
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' },
              { value: 'grc', label: 'Ἑλληνικά' },
            ]}
            value={lang}
            onChange={changeLang}
          />
          <Pressable
            onPress={explain}
            disabled={busy}
            style={[styles.explainBtn, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
          >
            <Text style={{ color: colors.bg, fontWeight: '700' }}>Erklären</Text>
          </Pressable>
        </View>
        {error && <Text style={{ color: colors.accent, marginTop: 12 }}>{error}</Text>}
        <View style={{ marginTop: 16 }}>
          <StreamingText
            stream={stream}
            onDone={() => setBusy(false)}
            onError={onStreamError}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  brand: { fontSize: 13, letterSpacing: 4, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 48 },
  controls: { marginTop: 20, gap: 12, alignItems: 'center' },
  explainBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
});

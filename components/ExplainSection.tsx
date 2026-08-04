import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Quote, QuoteLang } from '../lib/quotes';
import { getExplainStream, ExplainError } from '../lib/ai';
import { useTheme } from '../theme/ThemeContext';
import { useT, useUiLang, type StringKey } from '../lib/i18n';
import { StreamingText } from './StreamingText';

const ERROR_KEY: Record<string, StringKey> = {
  offline: 'errOffline',
  auth: 'errAuth',
  rate_limited: 'errRate',
  not_configured: 'errNotConfigured',
  server: 'errServer',
};

interface Props {
  quote: Quote;
  lang: QuoteLang;
}

export function ExplainSection({ quote, lang }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const uiLang = useUiLang();
  const [stream, setStream] = useState<AsyncIterable<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    requestId.current += 1;
    setStream(null);
    setError(null);
    setBusy(false);
  }, [quote.id]);

  const errorCopy = (e: unknown): string =>
    t(e instanceof ExplainError ? (ERROR_KEY[e.kind] ?? 'errServer') : 'errServer');

  const explain = async () => {
    setError(null);
    setBusy(true);
    const id = requestId.current;
    try {
      const s = await getExplainStream(quote, lang, uiLang);
      if (id !== requestId.current) return;
      setStream(s);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(errorCopy(e));
      setBusy(false);
    }
  };

  const onStreamError = (e: unknown) => {
    setStream(null);
    setBusy(false);
    setError(errorCopy(e));
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={explain}
        disabled={busy}
        style={[styles.btn, { backgroundColor: colors.accent, opacity: busy ? 0.6 : 1 }]}
        accessibilityRole="button"
      >
        <Text style={{ color: colors.bg, fontWeight: '700' }}>{t('btnExplain')}</Text>
      </Pressable>
      {error && (
        <Text style={{ color: colors.accent, textAlign: 'center', lineHeight: 20 }}>{error}</Text>
      )}
      <View style={{ alignSelf: 'stretch' }}>
        <StreamingText stream={stream} onDone={() => setBusy(false)} onError={onStreamError} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, marginTop: 16 },
  btn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
});

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  ApiError, BACKEND_URL, getSessionEmail, getToken, login, logout, passwordReset, register,
} from '../lib/api';
import { onLogin } from '../lib/favorites';
import { useT } from '../lib/i18n';
import { useTheme } from '../theme/ThemeContext';

/** Konto-Sektion der Einstellungen — gleiche Flows wie die Android-App. */
export function AccountSection() {
  const { colors } = useTheme();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      if (await getToken()) setSessionEmail(await getSessionEmail());
    })();
  }, []);

  if (!BACKEND_URL) {
    return <Text style={{ color: colors.textSoft, fontSize: 14 }}>{t('accNoServer')}</Text>;
  }

  const errText = (e: unknown): string => {
    if (e instanceof ApiError) {
      if (e.kind === 'offline') return t('accOffline');
      if (e.kind === 'validation' && e.detail) return e.detail;
    }
    return t('errServer');
  };

  const run = (fn: () => Promise<void>) => () => {
    setBusy(true);
    setStatus(null);
    void fn()
      .catch((e) => setStatus(errText(e)))
      .finally(() => setBusy(false));
  };

  if (sessionEmail) {
    return (
      <View style={{ gap: 8, alignSelf: 'stretch' }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {t('accLoggedInAs')} {sessionEmail}
        </Text>
        <Text style={{ color: colors.textSoft, fontSize: 14 }}>{t('accSynced')}</Text>
        <Pressable
          onPress={run(async () => {
            await logout();
            setSessionEmail(null);
          })}
          style={[styles.pill, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
          disabled={busy}
        >
          <Text style={{ color: colors.bg, fontWeight: '700' }}>{t('accLogout')}</Text>
        </Pressable>
        {status && <Text style={{ color: colors.accent, fontSize: 14 }}>{status}</Text>}
      </View>
    );
  }

  return (
    <View style={{ gap: 8, alignSelf: 'stretch' }}>
      <Text style={{ color: colors.textSoft, fontSize: 14, lineHeight: 21 }}>{t('accHint')}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t('accEmail')}
        placeholderTextColor={colors.textSoft}
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="email"
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={t('accPassword')}
        placeholderTextColor={colors.textSoft}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
      />
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Pressable
          onPress={run(async () => {
            await login(email.trim(), password);
            await onLogin();
            setSessionEmail(email.trim());
            setPassword('');
          })}
          style={[styles.pill, { backgroundColor: colors.accent, opacity: busy ? 0.6 : 1 }]}
          accessibilityRole="button"
          disabled={busy}
        >
          <Text style={{ color: colors.bg, fontWeight: '700' }}>{t('accLogin')}</Text>
        </Pressable>
        <Pressable
          onPress={run(async () => {
            await register(email.trim(), password);
            setStatus(t('accVerifySent'));
          })}
          style={[styles.pill, styles.outline, { borderColor: colors.accent, opacity: busy ? 0.6 : 1 }]}
          accessibilityRole="button"
          disabled={busy}
        >
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('accRegister')}</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={run(async () => {
          await passwordReset(email.trim());
          setStatus(t('accResetSent'));
        })}
        accessibilityRole="button"
        disabled={busy}
      >
        <Text style={{ color: colors.accent, fontSize: 13 }}>{t('accForgot')}</Text>
      </Pressable>
      {status && <Text style={{ color: colors.accent, fontSize: 14, lineHeight: 20 }}>{status}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'stretch' },
  pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  outline: { borderWidth: 1.5, backgroundColor: 'transparent' },
});

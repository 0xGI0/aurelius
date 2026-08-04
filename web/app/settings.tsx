import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import type { QuoteLang } from '../lib/quotes';
import type { ThemePref } from '../theme/tokens';
import {
  getQuoteLang, setQuoteLang, getAnthropicKey, setAnthropicKey, deleteAnthropicKey,
} from '../lib/settings';
import { useTheme } from '../theme/ThemeContext';
import { Segmented } from '../components/Segmented';

export default function Settings() {
  const { colors, pref, setPref } = useTheme();
  const [lang, setLang] = useState<QuoteLang>('de');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getQuoteLang().then(setLang);
    getAnthropicKey().then((k) => setHasKey(k !== null));
  }, []);

  const saveKey = async () => {
    if (keyInput.trim().length === 0) return;
    await setAnthropicKey(keyInput);
    setKeyInput('');
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeKey = async () => {
    await deleteAnthropicKey();
    setHasKey(false);
  };

  const section = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.accent }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Einstellungen</Text>
          <Link href="/" accessibilityLabel="Zurück">
            <Text style={{ color: colors.accent, fontSize: 16 }}>Fertig</Text>
          </Link>
        </View>

        {section('Zitat-Sprache', (
          <Segmented<QuoteLang>
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' },
              { value: 'grc', label: 'Ἑλληνικά' },
            ]}
            value={lang}
            onChange={(l) => { setLang(l); void setQuoteLang(l); }}
          />
        ))}

        {section('Erscheinungsbild', (
          <Segmented<ThemePref>
            options={[
              { value: 'light', label: 'Hell' },
              { value: 'dark', label: 'Dunkel' },
              { value: 'system', label: 'System' },
            ]}
            value={pref}
            onChange={setPref}
          />
        ))}

        {section('KI-Erklärung', (
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.textSoft, fontSize: 14, lineHeight: 21 }}>
              Mit eigenem Anthropic-API-Key nutzt die App Claude direkt von deinem Gerät.
              Ohne Key springt der eingebaute Gratis-Modus ein (sofern verfügbar).
            </Text>
            {hasKey ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.text }}>Key hinterlegt ✓</Text>
                <Pressable onPress={removeKey} accessibilityRole="button">
                  <Text style={{ color: colors.accent }}>Löschen</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <TextInput
                  value={keyInput}
                  onChangeText={setKeyInput}
                  placeholder="sk-ant-…"
                  placeholderTextColor={colors.textSoft}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                />
                <Pressable
                  onPress={saveKey}
                  style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                  accessibilityRole="button"
                >
                  <Text style={{ color: colors.bg, fontWeight: '700' }}>Key speichern</Text>
                </Pressable>
              </View>
            )}
            {saved && <Text style={{ color: colors.accent }}>Gespeichert.</Text>}
            {Platform.OS === 'web' && (
              <Text style={{ color: colors.textSoft, fontSize: 12 }}>
                Hinweis: Im Browser wird der Key unverschlüsselt im localStorage abgelegt.
              </Text>
            )}
          </View>
        ))}

        {section('Quellen', (
          <Text style={{ color: colors.textSoft, fontSize: 12, lineHeight: 18 }}>
            Deutsch: Albert Wittstock (1879, gemeinfrei) · Englisch: George Long (1862, gemeinfrei) · Altgriechisch: Perseus Digital Library / PerseusDL canonical-greekLit, Lizenz CC BY-SA 4.0. Details: data/SOURCES.md im Repository.
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  section: { marginTop: 20, gap: 10, alignItems: 'flex-start' },
  sectionTitle: { fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'stretch' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, alignSelf: 'flex-start' },
});

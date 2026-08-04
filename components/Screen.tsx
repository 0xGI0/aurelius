import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  center?: boolean;
  header?: React.ReactNode;
}

export function Screen({ children, center = false, header }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {header}
      <ScrollView
        contentContainerStyle={[styles.content, center && styles.centered]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 48, alignItems: 'center' },
  centered: { justifyContent: 'center' },
  column: { width: '100%', maxWidth: 640 },
});

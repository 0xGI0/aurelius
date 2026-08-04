import React from 'react';
import { Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface TopicOption {
  id: string;
  label: string;
}

interface Props {
  topics: TopicOption[];
  value: string;
  onChange: (id: string) => void;
}

export function TopicChips({ topics, value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {topics.map((t) => {
        const active = t.id === value;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              { borderColor: active ? colors.accent : colors.border },
              active && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={{
                color: active ? colors.bg : colors.textSoft,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, alignSelf: 'stretch' },
  row: { gap: 8, paddingHorizontal: 2, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
});

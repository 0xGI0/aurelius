import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  // Verlaufs-Hinweis an den Kanten: signalisiert, dass die Reihe seitlich
  // weitergeht (User-Feedback vom 2026-08-05; identisch in der Android-App).
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);
  const layoutW = useRef(0);
  const contentW = useRef(0);
  const lastX = useRef(0);

  const update = useCallback(() => {
    setFadeLeft(lastX.current > 1);
    setFadeRight(lastX.current + layoutW.current < contentW.current - 1);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastX.current = e.nativeEvent.contentOffset.x;
    update();
  };

  const transparent = `${colors.bg}00`;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => {
          layoutW.current = e.nativeEvent.layout.width;
          update();
        }}
        onContentSizeChange={(w) => {
          contentW.current = w;
          update();
        }}
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
      {fadeRight && (
        <LinearGradient
          colors={[transparent, colors.bg]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeRight}
          pointerEvents="none"
        />
      )}
      {fadeLeft && (
        <LinearGradient
          colors={[colors.bg, transparent]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeLeft}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  scroll: { flexGrow: 0, alignSelf: 'stretch' },
  row: { gap: 8, paddingHorizontal: 2, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  fadeRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 28 },
  fadeLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 28 },
});

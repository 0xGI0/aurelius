import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  stream: AsyncIterable<string> | null;
  onDone: () => void;
  onError: (e: unknown) => void;
}

export function StreamingText({ stream, onDone, onError }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const cursor = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!stream) return;
    let cancelled = false;
    setText('');
    setRunning(true);
    (async () => {
      try {
        for await (const chunk of stream) {
          if (cancelled) return;
          setText((t) => t + chunk);
        }
        if (!cancelled) onDone();
      } catch (e) {
        if (!cancelled) onError(e);
      } finally {
        if (!cancelled) setRunning(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stream]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursor, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(cursor, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    if (running) loop.start();
    return () => loop.stop();
  }, [running]);

  if (!stream && text.length === 0) return null;
  return (
    <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26 }}>
      {text}
      {running && <Animated.Text style={{ opacity: cursor, color: colors.accent }}>▌</Animated.Text>}
    </Text>
  );
}

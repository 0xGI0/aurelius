import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, toggleFavorite } from '../lib/favorites';
import { useTheme } from '../theme/ThemeContext';
import { useT } from '../lib/i18n';

interface Props {
  quoteId: string;
  size?: number;
  onToggled?: (favorites: string[]) => void;
}

export function FavoriteStar({ quoteId, size = 22, onToggled }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const [fav, setFav] = useState(false);

  useEffect(() => {
    let alive = true;
    getFavorites().then((f) => {
      if (alive) setFav(f.includes(quoteId));
    });
    return () => {
      alive = false;
    };
  }, [quoteId]);

  const toggle = async () => {
    const next = await toggleFavorite(quoteId);
    setFav(next.includes(quoteId));
    onToggled?.(next);
  };

  return (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={fav ? t('favRemove') : t('favAdd')}
    >
      <Ionicons name={fav ? 'star' : 'star-outline'} size={size} color={colors.accent} />
    </Pressable>
  );
}

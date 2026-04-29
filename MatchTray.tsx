import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { TileObject } from './types';
import { OBJECT_METADATA } from './levels';
import { COLORS, SIZES } from './constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLOT_SIZE = (SCREEN_WIDTH - 48) / SIZES.traySlotCount;

interface MatchTrayProps {
  tray: (TileObject | null)[];
}

// Individual animated slot — triggers slide-up + fade when a tile appears
function TraySlot({ tile, index }: { tile: TileObject | null; index: number }) {
  const prevTileRef = useRef<TileObject | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wasEmpty = prevTileRef.current === null;
    const nowFilled = tile !== null;

    if (wasEmpty && nowFilled) {
      // Reset and animate in
      slideAnim.setValue(14);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (nowFilled) {
      // Already has a tile (e.g. initial render) — show immediately
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }

    prevTileRef.current = tile;
  }, [tile]);

  return (
    <View style={styles.slot}>
      {tile ? (
        <Animated.View
          style={[
            styles.tileInSlot,
            { backgroundColor: OBJECT_METADATA[tile.type].color + '33' },
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.tileEmoji}>
            {OBJECT_METADATA[tile.type].emoji}
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.emptySlot} />
      )}
    </View>
  );
}

export function MatchTray({ tray }: MatchTrayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.trayRow}>
        {tray.map((slot, index) => (
          <TraySlot key={index} tile={slot} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.trayBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  trayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptySlot: {
    flex: 1,
    backgroundColor: COLORS.traySlot,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderStyle: 'dashed',
  },
  tileInSlot: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  tileEmoji: {
    fontSize: SLOT_SIZE * 0.55,
  },
});

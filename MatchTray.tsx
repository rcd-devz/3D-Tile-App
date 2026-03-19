import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TileObject } from '../types';
import { OBJECT_METADATA } from '../config/levels';
import { COLORS, SIZES } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLOT_SIZE = (SCREEN_WIDTH - 48) / SIZES.traySlotCount;

interface MatchTrayProps {
  tray: (TileObject | null)[];
}

export function MatchTray({ tray }: MatchTrayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.trayRow}>
        {tray.map((slot, index) => (
          <View key={index} style={styles.slot}>
            {slot ? (
              <View
                style={[
                  styles.tileInSlot,
                  { backgroundColor: OBJECT_METADATA[slot.type].color + '33' },
                ]}
              >
                <Text style={styles.tileEmoji}>
                  {OBJECT_METADATA[slot.type].emoji}
                </Text>
              </View>
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>
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

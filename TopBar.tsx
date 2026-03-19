import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../config/constants';

export function TopBar() {
  const { profile } = useGameStore();

  return (
    <View style={styles.container}>
      {/* Lives */}
      <TouchableOpacity style={styles.pill}>
        <View style={styles.heartBadge}>
          <Text style={styles.heartEmoji}>❤️</Text>
          <Text style={styles.heartCount}>{profile.lives}</Text>
        </View>
        <Text style={styles.pillText}>
          {profile.lives >= profile.maxLives ? 'FULL' : profile.lives}
        </Text>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      {/* Coins */}
      <TouchableOpacity style={styles.pill}>
        <Text style={styles.coinEmoji}>🪙</Text>
        <Text style={styles.pillText}>{profile.coins}</Text>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Inbox */}
      <TouchableOpacity style={styles.iconButton}>
        <Text style={styles.iconText}>📬</Text>
        <View style={styles.notifDot} />
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity style={styles.iconButton}>
        <Text style={styles.iconText}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  heartBadge: {
    position: 'relative',
  },
  heartEmoji: {
    fontSize: 18,
  },
  heartCount: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: COLORS.secondary,
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 8,
    width: 16,
    height: 16,
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  coinEmoji: {
    fontSize: 18,
  },
  pillText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  plusIcon: {
    color: COLORS.accentGreen,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  spacer: {
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
});

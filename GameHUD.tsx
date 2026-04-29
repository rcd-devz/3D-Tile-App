import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from './constants';

interface GameHUDProps {
  level: number;
  stars: number;
  timeRemaining: number;
  timerProgress: number;
  score: number;
  combo: number;
  onPause: () => void;
}

export function GameHUD({
  level,
  stars,
  timeRemaining,
  timerProgress,
  score,
  combo,
  onPause,
}: GameHUDProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timerProgress < 0.25;

  // Start/stop pulse animation based on low-time state
  useEffect(() => {
    if (isLowTime) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      pulseAnim.setValue(1);
    }
    return () => {
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
      }
    };
  }, [isLowTime]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.row}>
        {/* Level & Stars */}
        <View style={styles.levelSection}>
          <Text style={styles.levelLabel}>LEVEL {level}</Text>
          <View style={styles.starRow}>
            <Text style={styles.starText}>⭐</Text>
            <Text style={styles.starCount}>{stars}</Text>
          </View>
        </View>

        {/* Timer — pulses when time is low */}
        <Animated.View
          style={[
            styles.timerSection,
            isLowTime && styles.timerSectionLow,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={[styles.timerText, isLowTime && styles.timerLow]}>
            {formatTime(timeRemaining)}
          </Text>
        </Animated.View>

        {/* Pause */}
        <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
          <Text style={styles.pauseIcon}>⏸</Text>
        </TouchableOpacity>
      </View>

      {/* Score row — always visible */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        {combo > 0 && (
          <Text style={styles.comboText}>🔥 x{combo + 1} COMBO</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelSection: {
    flex: 1,
  },
  levelLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  starText: {
    fontSize: 14,
  },
  starCount: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  timerSectionLow: {
    backgroundColor: '#3d1515',
    borderWidth: 1,
    borderColor: COLORS.timerBarLow,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerLow: {
    color: COLORS.timerBarLow,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  pauseIcon: {
    fontSize: 18,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  scoreText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  comboText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

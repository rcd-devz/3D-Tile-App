import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useGameStore } from './gameStore';
import { COLORS } from './constants';
import { TopBar } from './TopBar';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { profile, loadProfile } = useGameStore();
  const playScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePlay = () => {
    navigation.navigate('Game', { level: profile.level });
  };

  const handleChestPress = () => {
    Alert.alert('Coming Soon', 'Daily chests are coming in a future update!');
  };

  const handlePiggyPress = () => {
    Alert.alert('Coming Soon', 'The savings piggy bank is coming soon!');
  };

  const handlePlayPressIn = () => {
    Animated.spring(playScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePlayPressOut = () => {
    Animated.spring(playScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  // Calculate progress ring
  const TOTAL_HANDCRAFTED_LEVELS = 15;
  const progressPercent = Math.min(
    Object.keys(profile.levelProgress).length / TOTAL_HANDCRAFTED_LEVELS,
    1
  );
  const ringSize = 180;

  // Compute the progress dot position along the ring border using trigonometry
  const angle = -Math.PI / 2 + progressPercent * Math.PI * 2;
  const dotRadius = ringSize / 2 - 3; // sit on the border center
  const dotX = ringSize / 2 + dotRadius * Math.cos(angle) - 6;
  const dotY = ringSize / 2 + dotRadius * Math.sin(angle) - 6;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      {/* Treasure chest buttons + piggy bank in a single row */}
      <View style={styles.chestRow}>
        <TouchableOpacity style={styles.chestButton} onPress={handleChestPress}>
          <Text style={styles.chestEmoji}>💎</Text>
          <Text style={styles.chestText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chestButton} onPress={handleChestPress}>
          <Text style={styles.chestEmoji}>🎁</Text>
          <Text style={styles.chestText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.piggyBank} onPress={handlePiggyPress}>
          <Text style={styles.piggyEmoji}>🐷</Text>
        </TouchableOpacity>
      </View>

      {/* Level ring */}
      <View style={styles.levelContainer}>
        <View style={[styles.levelRing, { width: ringSize, height: ringSize }]}>
          <View style={styles.levelRingInner}>
            <Text style={styles.levelNumber}>{profile.level}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </View>
          {/* Progress dot — correctly positioned on the ring border */}
          <View
            style={[
              styles.progressDot,
              { left: dotX, top: dotY },
            ]}
          />
        </View>
      </View>

      {/* Play button with scale press animation */}
      <View style={styles.playContainer}>
        <Animated.View style={{ transform: [{ scale: playScaleAnim }] }}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlay}
            onPressIn={handlePlayPressIn}
            onPressOut={handlePlayPressOut}
            activeOpacity={1}
          >
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  chestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.buttonGreen,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  chestEmoji: {
    fontSize: 24,
  },
  chestText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  piggyBank: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piggyEmoji: {
    fontSize: 28,
  },
  levelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelRing: {
    borderRadius: 999,
    borderWidth: 6,
    borderColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelRingInner: {
    alignItems: 'center',
  },
  levelNumber: {
    color: COLORS.textPrimary,
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: -4,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9b59b6',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  playContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playButton: {
    width: width * 0.65,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playIcon: {
    color: COLORS.textPrimary,
    fontSize: 28,
  },
});

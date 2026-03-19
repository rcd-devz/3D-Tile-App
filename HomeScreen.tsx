import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../config/constants';
import { TopBar } from '../components/TopBar';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { profile, loadProfile } = useGameStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePlay = () => {
    navigation.navigate('Game', { level: profile.level });
  };

  // Calculate progress ring
  const progressPercent = 0.15; // Placeholder - would be based on XP or level milestones
  const ringSize = 180;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      {/* Treasure chest buttons */}
      <View style={styles.chestRow}>
        <TouchableOpacity style={styles.chestButton}>
          <Text style={styles.chestEmoji}>💎</Text>
          <Text style={styles.chestText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chestButton}>
          <Text style={styles.chestEmoji}>🎁</Text>
          <Text style={styles.chestText}>Open</Text>
        </TouchableOpacity>
      </View>

      {/* Piggy bank */}
      <TouchableOpacity style={styles.piggyBank}>
        <Text style={styles.piggyEmoji}>🐷</Text>
      </TouchableOpacity>

      {/* Level ring */}
      <View style={styles.levelContainer}>
        <View style={[styles.levelRing, { width: ringSize, height: ringSize }]}>
          <View style={styles.levelRingInner}>
            <Text style={styles.levelNumber}>{profile.level}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </View>
          {/* Progress indicator */}
          <View
            style={[
              styles.progressArc,
              {
                transform: [
                  { rotate: `${-90 + progressPercent * 360}deg` },
                ],
              },
            ]}
          />
        </View>
      </View>

      {/* Play button */}
      <View style={styles.playContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlay}
          activeOpacity={0.8}
        >
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  chestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.buttonGreen,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    flex: 0.48,
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
    marginLeft: 16,
    marginTop: 12,
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
  progressArc: {
    position: 'absolute',
    bottom: -3,
    left: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9b59b6',
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

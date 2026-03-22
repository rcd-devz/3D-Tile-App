import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../config/constants';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'LevelComplete'>;

export function LevelCompleteScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { level, stars, timeRemaining } = route.params;

  // Animation values
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Bounce in the celebration emoji
    Animated.spring(celebrationAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // 2. Stagger the stars popping in
    const starSequence = Animated.stagger(
      250,
      starAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        })
      )
    );

    // 3. Fade in the stats + buttons after stars
    const contentFade = Animated.timing(contentAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    // Run: emoji → stars → content
    Animated.sequence([
      Animated.delay(200),
      starSequence,
      Animated.delay(100),
      contentFade,
    ]).start();
  }, []);

  const starDisplay = Array(3)
    .fill(0)
    .map((_, i) => (i < stars ? '⭐' : '☆'));

  const coinReward = stars * 25;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration emoji — bounces in */}
        <Animated.Text
          style={[
            styles.celebration,
            {
              transform: [
                {
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          🎉
        </Animated.Text>

        <Text style={styles.title}>Level Complete!</Text>
        <Text style={styles.levelText}>Level {level}</Text>

        {/* Stars — pop in sequentially */}
        <View style={styles.starRow}>
          {starDisplay.map((star, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.star,
                {
                  transform: [
                    {
                      scale: starAnims[i].interpolate({
                        inputRange: [0, 0.6, 1],
                        outputRange: [0, 1.3, 1],
                      }),
                    },
                  ],
                  opacity: starAnims[i],
                },
              ]}
            >
              {star}
            </Animated.Text>
          ))}
        </View>

        {/* Stats + buttons fade in after stars */}
        <Animated.View style={[styles.lowerContent, { opacity: contentAnim }]}>
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Time Remaining</Text>
              <Text style={styles.statValue}>{formatTime(timeRemaining)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Coins Earned</Text>
              <Text style={[styles.statValue, styles.coinText]}>
                🪙 +{coinReward}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() =>
                navigation.replace('Game', { level: level + 1 })
              }
            >
              <Text style={styles.nextButtonText}>Next Level ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  celebration: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 24,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
    minHeight: 64,
    alignItems: 'center',
  },
  star: {
    fontSize: 48,
  },
  lowerContent: {
    width: '100%',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  coinText: {
    color: COLORS.accent,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  homeButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  homeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

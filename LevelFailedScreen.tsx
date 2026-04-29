import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useGameStore } from './gameStore';
import { COLORS } from './constants';
import { COIN_PRICES } from './shop';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'LevelFailed'>;

export function LevelFailedScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { level } = route.params;
  const { coins, spendCoins, lives } = useGameStore();

  const canContinue = coins >= COIN_PRICES.continueGame;
  const hasLives = lives > 0;

  const handleContinue = () => {
    if (spendCoins(COIN_PRICES.continueGame)) {
      navigation.replace('Game', { level });
    }
  };

  const handleRetry = () => {
    navigation.replace('Game', { level });
  };

  const handleGoToShop = () => {
    navigation.navigate('MainTabs', { screen: 'Shop' } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>😢</Text>
        <Text style={styles.title}>Level Failed</Text>
        <Text style={styles.subtitle}>Level {level}</Text>

        <View style={styles.livesDisplay}>
          <Text style={styles.livesEmoji}>❤️</Text>
          <Text style={styles.livesText}>
            {hasLives ? `${lives} lives remaining` : 'No lives left'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Continue with coins */}
          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.continueText}>
              Continue 🪙 {COIN_PRICES.continueGame}
            </Text>
          </TouchableOpacity>

          {/* Retry — active if lives available; shows Shop link if not */}
          {hasLives ? (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry Level</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.noLivesButton} onPress={handleGoToShop}>
              <Text style={styles.noLivesText}>No Lives — Get More ❤️</Text>
            </TouchableOpacity>
          )}

          {/* Home */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.homeText}>Home</Text>
          </TouchableOpacity>
        </View>
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
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    color: COLORS.secondary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 24,
  },
  livesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 32,
    gap: 8,
  },
  livesEmoji: {
    fontSize: 20,
  },
  livesText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  continueText: {
    color: COLORS.surfaceDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noLivesButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  noLivesText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
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
  homeText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

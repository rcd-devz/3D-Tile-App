import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config/constants';
import { SHOP_ITEMS } from '../config/shop';
import { ShopItem } from '../types';
import { useGameStore } from '../store/gameStore';
import { iapService } from '../services/IAPService';
import { TopBar } from '../components/TopBar';

export function ShopScreen() {
  const { addCoins, addPowerUp, refillLives } = useGameStore();

  const handlePurchase = async (item: ShopItem) => {
    // In production, this would call RevenueCat
    Alert.alert(
      'Purchase',
      `Buy ${item.name} for ${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            try {
              // const result = await iapService.purchaseProduct(item.productId);
              // if (result.success) {
              //   applyPurchase(item);
              // }

              // For development: apply directly
              applyPurchase(item);
              Alert.alert('Success!', `You got ${item.name}!`);
            } catch (error) {
              Alert.alert('Error', 'Purchase failed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const applyPurchase = (item: ShopItem) => {
    if (item.coins > 0) addCoins(item.coins);
    if (item.powerUps.hint) addPowerUp('hint', item.powerUps.hint);
    if (item.powerUps.magnet) addPowerUp('magnet', item.powerUps.magnet);
    if (item.powerUps.shuffle) addPowerUp('shuffle', item.powerUps.shuffle);
    if (item.powerUps.undo) addPowerUp('undo', item.powerUps.undo);
    if (item.id === 'lives_refill') refillLives();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      <Text style={styles.title}>Shop</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SHOP_ITEMS.map((item) => (
          <ShopCard
            key={item.id}
            item={item}
            onPurchase={() => handlePurchase(item)}
          />
        ))}

        {/* Restore purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={async () => {
            await iapService.restorePurchases();
            Alert.alert('Restored', 'Purchases have been restored.');
          }}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ShopCard({
  item,
  onPurchase,
}: {
  item: ShopItem;
  onPurchase: () => void;
}) {
  return (
    <View style={[styles.card, item.isFeatured && styles.cardFeatured]}>
      {/* Badge */}
      {item.badge && (
        <View
          style={[
            styles.badge,
            item.badge === 'Limited Time'
              ? styles.badgeRed
              : styles.badgeRedAlt,
          ]}
        >
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}

      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.cardContent}>
        <View style={styles.cardDetails}>
          {/* Coins */}
          {item.coins > 0 && (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>🪙</Text>
              <Text style={styles.rewardText}>{item.coins}</Text>
            </View>
          )}

          {/* Power-ups */}
          {item.powerUps.hint && (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>💡</Text>
              <Text style={styles.rewardSmall}>x{item.powerUps.hint}</Text>
              <Text style={styles.rewardEmoji}>  🧲</Text>
              <Text style={styles.rewardSmall}>x{item.powerUps.magnet}</Text>
            </View>
          )}
          {item.powerUps.shuffle && (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>🔀</Text>
              <Text style={styles.rewardSmall}>x{item.powerUps.shuffle}</Text>
              <Text style={styles.rewardEmoji}>  ↩️</Text>
              <Text style={styles.rewardSmall}>x{item.powerUps.undo}</Text>
            </View>
          )}

          {/* Unlimited lives */}
          {item.unlimitedLives && (
            <View style={styles.livesTag}>
              <Text style={styles.livesTagText}>
                {item.unlimitedLives}h Unlimited Lives
              </Text>
            </View>
          )}
        </View>

        {/* Gift box visual */}
        <View style={styles.giftBox}>
          <Text style={styles.giftEmoji}>
            {item.isFeatured ? '🎁' : '📦'}
          </Text>
        </View>
      </View>

      {/* Price button */}
      <TouchableOpacity style={styles.priceButton} onPress={onPurchase}>
        <Text style={styles.priceText}>{item.price}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  cardFeatured: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: -4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeRed: {
    backgroundColor: COLORS.secondary,
  },
  badgeRedAlt: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDetails: {
    flex: 1,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardEmoji: {
    fontSize: 18,
  },
  rewardText: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  rewardSmall: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  livesTag: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  livesTagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  giftBox: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftEmoji: {
    fontSize: 56,
  },
  priceButton: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 32,
  },
  priceText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  restoreText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

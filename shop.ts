import { ShopItem } from './types';

// ============================================================
// SHOP / IAP CONFIGURATION
// ============================================================
// Product IDs should match your RevenueCat dashboard entries.
// Update these when you set up your actual IAP products.
// ============================================================

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'special_offer',
    name: 'Special Offer!',
    description: '1000 coins + 10x of each power-up + 48h Unlimited Lives',
    price: '$9.99',
    productId: 'com.matchtile3d.special_offer',
    coins: 1000,
    powerUps: { hint: 10, magnet: 10, shuffle: 10, undo: 10 },
    unlimitedLives: 48,
    isFeatured: true,
    badge: 'Limited Time',
  },
  {
    id: 'master_bundle',
    name: 'Master Bundle',
    description: '500 coins + 5x of each power-up',
    price: '$6.99',
    productId: 'com.matchtile3d.master_bundle',
    coins: 500,
    powerUps: { hint: 5, magnet: 5, shuffle: 5, undo: 5 },
    isFeatured: false,
  },
  {
    id: 'super_bundle',
    name: 'Super Bundle',
    description: '1000 coins + 10x of each power-up',
    price: '$12.99',
    productId: 'com.matchtile3d.super_bundle',
    coins: 1000,
    powerUps: { hint: 10, magnet: 10, shuffle: 10, undo: 10 },
    isFeatured: false,
    badge: 'Most Popular',
  },
  {
    id: 'coin_pack_small',
    name: 'Coin Pouch',
    description: '200 coins',
    price: '$1.99',
    productId: 'com.matchtile3d.coins_200',
    coins: 200,
    powerUps: {},
    isFeatured: false,
  },
  {
    id: 'coin_pack_large',
    name: 'Coin Chest',
    description: '2500 coins',
    price: '$19.99',
    productId: 'com.matchtile3d.coins_2500',
    coins: 2500,
    powerUps: {},
    isFeatured: false,
    badge: 'Best Value',
  },
  {
    id: 'lives_refill',
    name: 'Lives Refill',
    description: 'Refill all 5 lives instantly',
    price: '$0.99',
    productId: 'com.matchtile3d.lives_refill',
    coins: 0,
    powerUps: {},
    isFeatured: false,
  },
];

export const COIN_PRICES = {
  extraLife: 100,
  hint: 50,
  shuffle: 75,
  undo: 40,
  magnet: 60,
  continueGame: 150,
};

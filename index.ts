// ============================================================
// MATCH TILE 3D - Core Type Definitions
// ============================================================

/** Unique identifier for each object type in the game */
export type TileObjectType =
  | 'burger'
  | 'volleyball'
  | 'toilet_paper'
  | 'grapes'
  | 'train'
  | 'eggplant'
  | 'tire'
  | 'cake'
  | 'chair'
  | 'crate'
  | 'beach_ball'
  | 'drum'
  | 'hippo'
  | 'tiger'
  | 'zebra';

/** A single tile object in the 3D scene */
export interface TileObject {
  id: string;
  type: TileObjectType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  isVisible: boolean;
  isSelected: boolean;
  /** Whether this tile is currently accessible (not buried under others) */
  isAccessible: boolean;
}

/** Slot in the bottom match tray (max 7 slots) */
export interface TraySlot {
  index: number;
  tile: TileObject | null;
}

/** Power-up types available in the game */
export type PowerUpType = 'hint' | 'shuffle' | 'undo' | 'magnet';

export interface PowerUp {
  type: PowerUpType;
  count: number;
  icon: string;
}

/** Level configuration loaded from JSON */
export interface LevelConfig {
  level: number;
  /** Time limit in seconds */
  timeLimit: number;
  /** Object types available in this level */
  objectTypes: TileObjectType[];
  /** Total number of tiles (must be divisible by 3) */
  totalTiles: number;
  /** Difficulty multiplier affecting pile density */
  density: number;
  /** Number of layers in the pile */
  layers: number;
  /** Star thresholds: [1-star time, 2-star time, 3-star time] in seconds remaining */
  starThresholds: [number, number, number];
  /** Background theme */
  theme?: string;
}

/** Current game state */
export type GamePhase = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  stars: number;
  timeRemaining: number;
  lives: number;
  maxLives: number;
  coins: number;
  tray: (TileObject | null)[];
  tiles: TileObject[];
  combo: number;
  powerUps: PowerUp[];
}

/** Player profile / progression */
export interface PlayerProfile {
  name: string;
  level: number;
  totalStars: number;
  coins: number;
  lives: number;
  maxLives: number;
  lastLifeRegenTime: number;
  purchasedItems: string[];
  levelProgress: Record<number, { stars: number; bestTime: number }>;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  team: string;
  level: number;
  country: string;
  avatarUrl?: string;
}

/** Shop item for IAP */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: string;
  productId: string; // RevenueCat product ID
  coins: number;
  powerUps: Partial<Record<PowerUpType, number>>;
  unlimitedLives?: number; // hours of unlimited lives
  isFeatured: boolean;
  badge?: string;
}

/** Navigation param types */
export type RootStackParamList = {
  MainTabs: undefined;
  Game: { level: number };
  LevelComplete: { level: number; stars: number; timeRemaining: number };
  LevelFailed: { level: number };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Hearts: undefined;
  Social: undefined;
  Leaderboard: undefined;
  Shop: undefined;
};

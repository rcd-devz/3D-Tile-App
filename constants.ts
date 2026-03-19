// ============================================================
// THEME & CONSTANTS
// ============================================================

export const COLORS = {
  // Core palette (dark game UI like Match Tile 3D)
  background: '#1a1a2e',
  surface: '#2d2d44',
  surfaceLight: '#3d3d5c',
  surfaceDark: '#141425',

  // Accent colors
  primary: '#c4d931',      // Yellow-green (play button, highlights)
  primaryDark: '#9ab025',
  secondary: '#ff6b6b',    // Red (hearts, alerts)
  accent: '#ffd700',       // Gold (coins, stars)
  accentGreen: '#4ecb71',  // Green (success, IAP buttons)

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#b0b0cc',
  textMuted: '#6a6a8a',

  // Game specific
  trayBackground: '#0d0d1a',
  traySlot: '#2a2a40',
  traySlotActive: '#3a3a55',
  timerBar: '#ffd700',
  timerBarLow: '#ff4444',

  // UI elements
  buttonGreen: '#7bc74d',
  buttonRed: '#e74c3c',
  buttonBlue: '#3498db',
  cardBorder: '#4a4a6a',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  // Replace with custom fonts after loading them:
  // regular: 'Nunito-Regular',
  // bold: 'Nunito-Bold',
};

export const SIZES = {
  // Tray
  traySlotCount: 7,
  trayHeight: 80,
  traySlotSize: 48,
  trayPadding: 8,

  // Game
  matchCount: 3,
  maxLives: 5,
  lifeRegenMinutes: 30,

  // UI
  borderRadius: 12,
  borderRadiusLarge: 20,
  iconSize: 24,
  iconSizeLarge: 32,

  // 3D Scene
  sceneWidth: 6,
  sceneHeight: 10,
  sceneDepth: 8,
  tileBaseScale: 0.4,
};

export const TIMING = {
  tileSelectMs: 150,
  matchAnimMs: 300,
  comboWindowMs: 2000,
  tileDropMs: 500,
  screenTransitionMs: 300,
};

export const GAME_CONFIG = {
  /** Points per match */
  matchScore: 100,
  /** Combo multiplier increment */
  comboMultiplier: 0.5,
  /** Max combo multiplier */
  maxCombo: 5,
  /** Stars required per star rating */
  starThresholds: [1, 2, 3],
};

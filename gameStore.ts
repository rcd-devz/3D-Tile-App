import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GamePhase,
  GameState,
  PlayerProfile,
  TileObject,
  TileObjectType,
  PowerUp,
  PowerUpType,
} from '../types';
import { getLevelConfig } from '../config/levels';
import { SIZES, GAME_CONFIG } from '../config/constants';
import { generateTilePile } from '../game/TileGenerator';

// ============================================================
// GAME STORE (Zustand)
// ============================================================

interface GameStore extends GameState {
  // Player profile
  profile: PlayerProfile;

  // Actions - Game flow
  startLevel: (level: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tickTimer: () => void;

  // Actions - Tile interaction
  selectTile: (tileId: string) => void;
  removeTileFromTray: (index: number) => void;

  // Actions - Power-ups
  usePowerUp: (type: PowerUpType) => void;

  // Actions - Progression
  completeLevel: (stars: number) => void;
  failLevel: () => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addPowerUp: (type: PowerUpType, count: number) => void;
  loseLife: () => void;
  refillLives: () => void;

  // Persistence
  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Player',
  level: 1,
  totalStars: 0,
  coins: 300,
  lives: 5,
  maxLives: 5,
  lastLifeRegenTime: Date.now(),
  purchasedItems: [],
  levelProgress: {},
};

const DEFAULT_POWERUPS: PowerUp[] = [
  { type: 'hint', count: 3, icon: '💡' },
  { type: 'shuffle', count: 3, icon: '🔀' },
  { type: 'undo', count: 3, icon: '↩️' },
  { type: 'magnet', count: 3, icon: '🧲' },
];

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  phase: 'idle',
  currentLevel: 1,
  score: 0,
  stars: 0,
  timeRemaining: 0,
  lives: 5,
  maxLives: 5,
  coins: 300,
  tray: Array(SIZES.traySlotCount).fill(null),
  tiles: [],
  combo: 0,
  powerUps: [...DEFAULT_POWERUPS],
  profile: { ...DEFAULT_PROFILE },

  // ---- GAME FLOW ----

  startLevel: (level: number) => {
    const config = getLevelConfig(level);
    const tiles = generateTilePile(config);

    set({
      phase: 'playing',
      currentLevel: level,
      score: 0,
      stars: 0,
      timeRemaining: config.timeLimit,
      tray: Array(SIZES.traySlotCount).fill(null),
      tiles,
      combo: 0,
    });
  },

  pauseGame: () => {
    if (get().phase === 'playing') {
      set({ phase: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().phase === 'paused') {
      set({ phase: 'playing' });
    }
  },

  tickTimer: () => {
    const { phase, timeRemaining } = get();
    if (phase !== 'playing') return;

    if (timeRemaining <= 1) {
      set({ timeRemaining: 0, phase: 'lost' });
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  // ---- TILE INTERACTION ----

  selectTile: (tileId: string) => {
    const { tiles, tray, phase } = get();
    if (phase !== 'playing') return;

    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || !tile.isVisible || !tile.isAccessible) return;

    // Find first empty tray slot
    const emptySlotIndex = tray.findIndex((slot) => slot === null);
    if (emptySlotIndex === -1) {
      // Tray is full → game over
      set({ phase: 'lost' });
      return;
    }

    // Move tile to tray
    const newTray = [...tray];
    // Insert next to matching tiles if any exist
    const matchingIndex = newTray.findIndex(
      (slot) => slot !== null && slot.type === tile.type
    );

    if (matchingIndex !== -1) {
      // Find the last consecutive matching tile
      let insertIndex = matchingIndex;
      while (
        insertIndex < newTray.length - 1 &&
        newTray[insertIndex + 1] !== null &&
        newTray[insertIndex + 1]!.type === tile.type
      ) {
        insertIndex++;
      }
      // Shift tiles right and insert
      const shiftedTray = [...newTray];
      // Remove the empty slot and insert at the right position
      const withoutEmpty = shiftedTray.filter((_, i) => i !== emptySlotIndex);
      withoutEmpty.splice(insertIndex + (insertIndex >= emptySlotIndex ? 0 : 1), 0, {
        ...tile,
        isSelected: true,
      });
      // Pad back to tray size
      while (withoutEmpty.length < SIZES.traySlotCount) {
        withoutEmpty.push(null);
      }
      newTray.splice(0, newTray.length, ...withoutEmpty);
    } else {
      newTray[emptySlotIndex] = { ...tile, isSelected: true };
    }

    // Remove tile from scene
    const removedTiles = tiles.map((t) =>
      t.id === tileId ? { ...t, isVisible: false } : t
    );

    // Update accessibility of remaining tiles (returns new array, no mutation)
    const newTiles = updateAccessibility(removedTiles);

    set({ tiles: newTiles, tray: newTray });

    // Check for matches (3 of same type)
    checkForMatches(get, set);
  },

  removeTileFromTray: (index: number) => {
    const { tray } = get();
    const newTray = [...tray];
    newTray[index] = null;
    set({ tray: newTray });
  },

  // ---- POWER-UPS ----

  usePowerUp: (type: PowerUpType) => {
    const { powerUps, tiles, tray, phase } = get();
    if (phase !== 'playing') return;

    const powerUp = powerUps.find((p) => p.type === type);
    if (!powerUp || powerUp.count <= 0) return;

    const newPowerUps = powerUps.map((p) =>
      p.type === type ? { ...p, count: p.count - 1 } : p
    );

    switch (type) {
      case 'hint': {
        // Find a tile type that has accessible tiles and would help
        const accessibleTypes = new Map<TileObjectType, TileObject[]>();
        tiles
          .filter((t) => t.isVisible && t.isAccessible)
          .forEach((t) => {
            if (!accessibleTypes.has(t.type)) accessibleTypes.set(t.type, []);
            accessibleTypes.get(t.type)!.push(t);
          });

        // Find type with most accessible tiles
        let bestType: TileObjectType | null = null;
        let bestCount = 0;
        accessibleTypes.forEach((typeTiles, type) => {
          if (typeTiles.length > bestCount) {
            bestType = type;
            bestCount = typeTiles.length;
          }
        });

        // Highlight those tiles (mark them as selected briefly)
        if (bestType) {
          const hintTiles = accessibleTypes.get(bestType)!.slice(0, 3);
          const newTiles = tiles.map((t) =>
            hintTiles.some((h) => h.id === t.id)
              ? { ...t, isSelected: true }
              : t
          );
          set({ tiles: newTiles, powerUps: newPowerUps });

          // Remove highlight after 2 seconds
          setTimeout(() => {
            set({
              tiles: get().tiles.map((t) => ({ ...t, isSelected: false })),
            });
          }, 2000);
        }
        break;
      }

      case 'shuffle': {
        // Randomize positions of all visible tiles
        const visibleTiles = tiles.filter((t) => t.isVisible);
        const positions = visibleTiles.map((t) => ({ ...t.position }));

        // Fisher-Yates shuffle on positions
        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        const newTiles = tiles.map((t) => {
          if (!t.isVisible) return t;
          const idx = visibleTiles.findIndex((v) => v.id === t.id);
          return { ...t, position: positions[idx] };
        });

        set({ tiles: updateAccessibility(newTiles), powerUps: newPowerUps });
        break;
      }

      case 'undo': {
        // Remove last tile from tray and put it back
        const lastFilledIndex = tray.reduce(
          (last, slot, i) => (slot !== null ? i : last),
          -1
        );
        if (lastFilledIndex >= 0) {
          const returnedTile = tray[lastFilledIndex]!;
          const newTray = [...tray];
          newTray[lastFilledIndex] = null;

          const undoTiles = tiles.map((t) =>
            t.id === returnedTile.id ? { ...t, isVisible: true } : t
          );
          set({ tray: newTray, tiles: updateAccessibility(undoTiles), powerUps: newPowerUps });
        }
        break;
      }

      case 'magnet': {
        // Auto-match: find 3 accessible tiles of the same type and remove them
        const accessibleByType = new Map<TileObjectType, TileObject[]>();
        tiles
          .filter((t) => t.isVisible && t.isAccessible)
          .forEach((t) => {
            if (!accessibleByType.has(t.type)) accessibleByType.set(t.type, []);
            accessibleByType.get(t.type)!.push(t);
          });

        let matched = false;
        for (const [type, typeTiles] of accessibleByType) {
          if (typeTiles.length >= 3) {
            const toRemove = typeTiles.slice(0, 3);
            const magnetTiles = tiles.map((t) =>
              toRemove.some((r) => r.id === t.id)
                ? { ...t, isVisible: false }
                : t
            );
            const { score, combo } = get();
            const comboMultiplier = 1 + combo * GAME_CONFIG.comboMultiplier;
            const points = Math.floor(GAME_CONFIG.matchScore * comboMultiplier);

            set({
              tiles: updateAccessibility(magnetTiles),
              score: score + points,
              combo: Math.min(combo + 1, GAME_CONFIG.maxCombo),
              powerUps: newPowerUps,
            });
            matched = true;
            break;
          }
        }

        if (!matched) {
          set({ powerUps: newPowerUps });
        }

        // Check win condition
        if (get().tiles.every((t) => !t.isVisible)) {
          const { timeRemaining, currentLevel } = get();
          const config = getLevelConfig(currentLevel);
          const stars = calculateStars(timeRemaining, config.starThresholds);
          set({ phase: 'won', stars });
        }
        break;
      }
    }
  },

  // ---- PROGRESSION ----

  completeLevel: (stars: number) => {
    const { profile, currentLevel, score } = get();
    const newProfile = { ...profile };

    // Update level progress
    const existing = newProfile.levelProgress[currentLevel];
    if (!existing || stars > existing.stars) {
      newProfile.levelProgress[currentLevel] = {
        stars,
        bestTime: score,
      };
    }

    // Advance max level
    if (currentLevel >= newProfile.level) {
      newProfile.level = currentLevel + 1;
    }

    // Award coins
    const coinReward = stars * 25;
    newProfile.coins += coinReward;
    newProfile.totalStars += stars;

    set({ profile: newProfile, coins: newProfile.coins });
    get().saveProfile();
  },

  failLevel: () => {
    get().loseLife();
    set({ phase: 'lost' });
  },

  spendCoins: (amount: number) => {
    const { profile } = get();
    if (profile.coins < amount) return false;

    const newProfile = { ...profile, coins: profile.coins - amount };
    set({ profile: newProfile, coins: newProfile.coins });
    get().saveProfile();
    return true;
  },

  addCoins: (amount: number) => {
    const { profile } = get();
    const newProfile = { ...profile, coins: profile.coins + amount };
    set({ profile: newProfile, coins: newProfile.coins });
    get().saveProfile();
  },

  addPowerUp: (type: PowerUpType, count: number) => {
    const { powerUps } = get();
    set({
      powerUps: powerUps.map((p) =>
        p.type === type ? { ...p, count: p.count + count } : p
      ),
    });
  },

  loseLife: () => {
    const { profile } = get();
    if (profile.lives > 0) {
      const newProfile = {
        ...profile,
        lives: profile.lives - 1,
        lastLifeRegenTime:
          profile.lives === profile.maxLives ? Date.now() : profile.lastLifeRegenTime,
      };
      set({ profile: newProfile, lives: newProfile.lives });
      get().saveProfile();
    }
  },

  refillLives: () => {
    const { profile } = get();
    const newProfile = { ...profile, lives: profile.maxLives };
    set({ profile: newProfile, lives: newProfile.lives });
    get().saveProfile();
  },

  // ---- PERSISTENCE ----

  loadProfile: async () => {
    try {
      const saved = await AsyncStorage.getItem('match_tile_profile');
      if (saved) {
        const profile = JSON.parse(saved) as PlayerProfile;

        // Regenerate lives based on time passed
        const now = Date.now();
        const elapsed = now - profile.lastLifeRegenTime;
        const regenMinutes = 30;
        const livesGained = Math.floor(elapsed / (regenMinutes * 60 * 1000));
        profile.lives = Math.min(profile.maxLives, profile.lives + livesGained);
        if (livesGained > 0) {
          profile.lastLifeRegenTime = now;
        }

        set({ profile, coins: profile.coins, lives: profile.lives });
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
  },

  saveProfile: async () => {
    try {
      const { profile } = get();
      await AsyncStorage.setItem('match_tile_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  },
}));

// ---- HELPER FUNCTIONS ----

function checkForMatches(
  get: () => GameStore,
  set: (state: Partial<GameStore>) => void
) {
  const { tray, score, combo, tiles, currentLevel } = get();

  // Count types in tray
  const typeCounts = new Map<TileObjectType, number>();
  tray.forEach((slot) => {
    if (slot) {
      typeCounts.set(slot.type, (typeCounts.get(slot.type) || 0) + 1);
    }
  });

  // Check for any type with 3+
  for (const [type, count] of typeCounts) {
    if (count >= SIZES.matchCount) {
      // Remove matched tiles from tray
      let removed = 0;
      const newTray = tray.map((slot) => {
        if (slot && slot.type === type && removed < SIZES.matchCount) {
          removed++;
          return null;
        }
        return slot;
      });

      // Compact tray (shift tiles left)
      const compacted: (TileObject | null)[] = newTray.filter((s) => s !== null);
      while (compacted.length < SIZES.traySlotCount) {
        compacted.push(null);
      }

      // Calculate score with combo
      const comboMultiplier = 1 + combo * GAME_CONFIG.comboMultiplier;
      const points = Math.floor(GAME_CONFIG.matchScore * comboMultiplier);

      set({
        tray: compacted,
        score: score + points,
        combo: Math.min(combo + 1, GAME_CONFIG.maxCombo),
      });

      // Check win condition
      const remainingTiles = tiles.filter((t) => t.isVisible).length;
      const trayTiles = compacted.filter((s) => s !== null).length;
      if (remainingTiles === 0 && trayTiles === 0) {
        const { timeRemaining } = get();
        const config = getLevelConfig(currentLevel);
        const stars = calculateStars(timeRemaining, config.starThresholds);
        set({ phase: 'won', stars });
      }

      // Reset combo after delay
      setTimeout(() => {
        if (get().phase === 'playing') {
          set({ combo: 0 });
        }
      }, 2000);

      break;
    }
  }

  // Check if tray is full with no matches → lose
  const filledSlots = get().tray.filter((s) => s !== null).length;
  if (filledSlots >= SIZES.traySlotCount) {
    const trayTypes = new Map<TileObjectType, number>();
    get().tray.forEach((slot) => {
      if (slot) {
        trayTypes.set(slot.type, (trayTypes.get(slot.type) || 0) + 1);
      }
    });
    const hasMatch = Array.from(trayTypes.values()).some(
      (c) => c >= SIZES.matchCount
    );
    if (!hasMatch) {
      set({ phase: 'lost' });
    }
  }
}

function calculateStars(
  timeRemaining: number,
  thresholds: [number, number, number]
): number {
  if (timeRemaining >= thresholds[2]) return 3;
  if (timeRemaining >= thresholds[1]) return 2;
  if (timeRemaining >= thresholds[0]) return 1;
  return 1; // Always at least 1 star for completing
}

function updateAccessibility(tiles: TileObject[]): TileObject[] {
  // A tile is accessible if no other visible tile is directly above it
  // Simplified: check if any tile has a higher z and overlapping x,y
  const visibleTiles = tiles.filter((t) => t.isVisible);

  return tiles.map((tile) => {
    if (!tile.isVisible) {
      return tile.isAccessible ? { ...tile, isAccessible: false } : tile;
    }

    const isBlocked = visibleTiles.some((other) => {
      if (other.id === tile.id) return false;
      if (other.position.z <= tile.position.z) return false;

      // Check XY overlap (simplified bounding box)
      const overlapThreshold = 0.6 * tile.scale;
      const dx = Math.abs(other.position.x - tile.position.x);
      const dy = Math.abs(other.position.y - tile.position.y);
      return dx < overlapThreshold && dy < overlapThreshold;
    });

    const isAccessible = !isBlocked;
    return isAccessible !== tile.isAccessible ? { ...tile, isAccessible } : tile;
  });
}

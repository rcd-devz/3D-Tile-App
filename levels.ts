import { LevelConfig, TileObjectType } from './types';

// ============================================================
// LEVEL CONFIGURATION SYSTEM
// ============================================================
// Each level defines what objects appear, time limits, density,
// and star thresholds. Add new levels by extending this array.
// All tile counts MUST be divisible by 3 (match-3 mechanic).
// ============================================================

const ALL_OBJECTS: TileObjectType[] = [
  'burger', 'volleyball', 'toilet_paper', 'grapes', 'train',
  'eggplant', 'tire', 'cake', 'chair', 'crate',
  'beach_ball', 'drum', 'hippo', 'tiger', 'zebra',
];

export const LEVELS: LevelConfig[] = [
  // ---- TUTORIAL / EASY (1-5) ----
  {
    level: 1,
    timeLimit: 120,
    objectTypes: ['burger', 'volleyball', 'toilet_paper'],
    totalTiles: 18,
    density: 0.5,
    layers: 2,
    starThresholds: [30, 60, 90],
    theme: 'default',
  },
  {
    level: 2,
    timeLimit: 120,
    objectTypes: ['burger', 'grapes', 'cake', 'volleyball'],
    totalTiles: 24,
    density: 0.55,
    layers: 2,
    starThresholds: [25, 50, 80],
    theme: 'default',
  },
  {
    level: 3,
    timeLimit: 150,
    objectTypes: ['burger', 'volleyball', 'toilet_paper', 'grapes', 'train'],
    totalTiles: 30,
    density: 0.6,
    layers: 3,
    starThresholds: [30, 60, 100],
    theme: 'default',
  },
  {
    level: 4,
    timeLimit: 150,
    objectTypes: ['eggplant', 'tire', 'cake', 'chair', 'crate'],
    totalTiles: 30,
    density: 0.65,
    layers: 3,
    starThresholds: [25, 55, 90],
    theme: 'default',
  },
  {
    level: 5,
    timeLimit: 180,
    objectTypes: ['burger', 'volleyball', 'toilet_paper', 'grapes', 'train', 'eggplant', 'tire'],
    totalTiles: 42,
    density: 0.7,
    layers: 4,
    starThresholds: [30, 70, 120],
    theme: 'default',
  },
  // ---- MEDIUM (6-10) ----
  {
    level: 6,
    timeLimit: 180,
    objectTypes: ['burger', 'volleyball', 'toilet_paper', 'grapes', 'train', 'eggplant', 'tire', 'cake'],
    totalTiles: 48,
    density: 0.75,
    layers: 4,
    starThresholds: [25, 60, 110],
    theme: 'default',
  },
  {
    level: 7,
    timeLimit: 200,
    objectTypes: ['burger', 'volleyball', 'grapes', 'train', 'eggplant', 'tire', 'cake', 'chair', 'crate'],
    totalTiles: 54,
    density: 0.8,
    layers: 5,
    starThresholds: [30, 70, 130],
    theme: 'default',
  },
  {
    level: 8,
    timeLimit: 200,
    objectTypes: ALL_OBJECTS.slice(0, 10),
    totalTiles: 60,
    density: 0.82,
    layers: 5,
    starThresholds: [25, 65, 120],
    theme: 'default',
  },
  {
    level: 9,
    timeLimit: 220,
    objectTypes: ALL_OBJECTS.slice(0, 12),
    totalTiles: 66,
    density: 0.85,
    layers: 5,
    starThresholds: [30, 75, 140],
    theme: 'default',
  },
  {
    level: 10,
    timeLimit: 240,
    objectTypes: ALL_OBJECTS,
    totalTiles: 75,
    density: 0.9,
    layers: 6,
    starThresholds: [30, 80, 160],
    theme: 'default',
  },
  // ---- HARD (11-15) ----
  {
    level: 11,
    timeLimit: 240,
    objectTypes: ALL_OBJECTS,
    totalTiles: 84,
    density: 0.92,
    layers: 6,
    starThresholds: [25, 70, 150],
    theme: 'default',
  },
  {
    level: 12,
    timeLimit: 250,
    objectTypes: ALL_OBJECTS,
    totalTiles: 90,
    density: 0.94,
    layers: 7,
    starThresholds: [20, 65, 140],
    theme: 'default',
  },
  {
    level: 13,
    timeLimit: 260,
    objectTypes: ALL_OBJECTS,
    totalTiles: 96,
    density: 0.95,
    layers: 7,
    starThresholds: [20, 60, 130],
    theme: 'default',
  },
  {
    level: 14,
    timeLimit: 280,
    objectTypes: ALL_OBJECTS,
    totalTiles: 105,
    density: 0.96,
    layers: 8,
    starThresholds: [20, 60, 140],
    theme: 'default',
  },
  {
    level: 15,
    timeLimit: 300,
    objectTypes: ALL_OBJECTS,
    totalTiles: 120,
    density: 1.0,
    layers: 8,
    starThresholds: [25, 70, 160],
    theme: 'default',
  },
];

/**
 * Get level config by level number.
 * If level exceeds defined levels, generates a procedural config.
 */
export function getLevelConfig(level: number): LevelConfig {
  const defined = LEVELS.find((l) => l.level === level);
  if (defined) return defined;

  // Procedural generation for levels beyond the defined set
  const baseDifficulty = Math.min(1.0, 0.5 + level * 0.03);
  const objectCount = Math.min(ALL_OBJECTS.length, 5 + Math.floor(level / 3));
  const totalTiles = Math.min(150, Math.floor((18 + level * 6) / 3) * 3);

  return {
    level,
    timeLimit: Math.min(360, 120 + level * 10),
    objectTypes: ALL_OBJECTS.slice(0, objectCount),
    totalTiles,
    density: baseDifficulty,
    layers: Math.min(10, 2 + Math.floor(level / 2)),
    starThresholds: [
      Math.floor(20 + level * 2),
      Math.floor(50 + level * 3),
      Math.floor(100 + level * 4),
    ],
    theme: 'default',
  };
}

/** Object display metadata for UI and 3D rendering */
export const OBJECT_METADATA: Record<
  TileObjectType,
  { name: string; color: string; emoji: string; modelFile?: string }
> = {
  burger: { name: 'Burger', color: '#e8a435', emoji: '🍔', modelFile: 'burger.glb' },
  volleyball: { name: 'Volleyball', color: '#f5f5f5', emoji: '🏐', modelFile: 'volleyball.glb' },
  toilet_paper: { name: 'Toilet Paper', color: '#ffffff', emoji: '🧻', modelFile: 'toilet_paper.glb' },
  grapes: { name: 'Grapes', color: '#7b2d8e', emoji: '🍇', modelFile: 'grapes.glb' },
  train: { name: 'Train', color: '#4a90d9', emoji: '🚂', modelFile: 'train.glb' },
  eggplant: { name: 'Eggplant', color: '#5b2c6f', emoji: '🍆', modelFile: 'eggplant.glb' },
  tire: { name: 'Tire', color: '#2c2c2c', emoji: '⭕', modelFile: 'tire.glb' },
  cake: { name: 'Cake', color: '#d4956a', emoji: '🍰', modelFile: 'cake.glb' },
  chair: { name: 'Chair', color: '#8b8b8b', emoji: '🪑', modelFile: 'chair.glb' },
  crate: { name: 'Crate', color: '#4a90d9', emoji: '📦', modelFile: 'crate.glb' },
  beach_ball: { name: 'Beach Ball', color: '#ff6b6b', emoji: '🏖️', modelFile: 'beach_ball.glb' },
  drum: { name: 'Drum', color: '#d4956a', emoji: '🥁', modelFile: 'drum.glb' },
  hippo: { name: 'Hippo', color: '#7f8c8d', emoji: '🦛', modelFile: 'hippo.glb' },
  tiger: { name: 'Tiger', color: '#e67e22', emoji: '🐯', modelFile: 'tiger.glb' },
  zebra: { name: 'Zebra', color: '#2c3e50', emoji: '🦓', modelFile: 'zebra.glb' },
};

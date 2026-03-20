import { TileObject, TileObjectType, LevelConfig } from '../types';
import { SIZES } from '../config/constants';

// ============================================================
// TILE PILE GENERATOR
// ============================================================
// Generates a pile of 3D objects that stack naturally.
// Each level config determines types, counts, and density.
// All tile counts are divisible by 3 for match-3 mechanic.
// ============================================================

let tileIdCounter = 0;

function generateId(): string {
  return `tile_${++tileIdCounter}_${Date.now()}`;
}

/**
 * Generate the full tile pile for a level.
 * Ensures exactly totalTiles tiles, evenly distributed by type,
 * with each type appearing in multiples of 3.
 */
export function generateTilePile(config: LevelConfig): TileObject[] {
  tileIdCounter = 0;
  const { objectTypes, totalTiles, density, layers } = config;

  // Distribute tiles evenly across types in multiples of 3
  const tilesPerType = Math.floor(totalTiles / objectTypes.length / 3) * 3;
  let remaining = totalTiles - tilesPerType * objectTypes.length;

  const typeDistribution: { type: TileObjectType; count: number }[] =
    objectTypes.map((type) => ({ type, count: tilesPerType }));

  // Distribute remaining tiles (in groups of 3)
  let typeIndex = 0;
  while (remaining >= 3) {
    typeDistribution[typeIndex % typeDistribution.length].count += 3;
    remaining -= 3;
    typeIndex++;
  }

  // Generate all tiles
  const tiles: TileObject[] = [];
  const { sceneWidth, sceneHeight, sceneDepth } = SIZES;

  // Calculate pile boundaries
  const halfW = (sceneWidth * density) / 2;
  const halfH = (sceneHeight * density) / 2;
  const layerHeight = sceneDepth / layers;

  for (const { type, count } of typeDistribution) {
    for (let i = 0; i < count; i++) {
      // Distribute across layers
      const layer = Math.floor((i / count) * layers);

      // Random position within pile bounds with some jitter
      const x = (Math.random() - 0.5) * halfW * 2;
      const y = (Math.random() - 0.5) * halfH * 2;
      const z = layer * layerHeight + Math.random() * layerHeight * 0.5;

      // Random rotation for natural look
      const rx = Math.random() * Math.PI * 2;
      const ry = Math.random() * Math.PI * 2;
      const rz = Math.random() * Math.PI * 2;

      // Slight scale variation
      const scale =
        SIZES.tileBaseScale * (0.85 + Math.random() * 0.3);

      tiles.push({
        id: generateId(),
        type,
        position: { x, y, z },
        rotation: { x: rx, y: ry, z: rz },
        scale,
        isVisible: true,
        isSelected: false,
        isAccessible: false, // Will be computed below
      });
    }
  }

  return computeAccessibility(tiles);
}

/**
 * Determine which tiles are accessible (not blocked by tiles above).
 * A tile is accessible if no other visible tile overlaps it from above.
 * Returns a new array with updated isAccessible values (no mutation).
 */
export function computeAccessibility(tiles: TileObject[]): TileObject[] {
  const visible = tiles.filter((t) => t.isVisible);

  // Sort by z (height) descending - top tiles first
  const sorted = [...visible].sort((a, b) => b.position.z - a.position.z);

  return tiles.map((tile) => {
    if (!tile.isVisible) {
      return tile.isAccessible ? { ...tile, isAccessible: false } : tile;
    }

    // Check if any visible tile is above this one and overlapping
    const isBlocked = sorted.some((other) => {
      if (other.id === tile.id) return false;
      if (other.position.z <= tile.position.z) return false;

      // Overlap check with configurable threshold
      const overlapDist = tile.scale * 1.2;
      const dx = Math.abs(other.position.x - tile.position.x);
      const dy = Math.abs(other.position.y - tile.position.y);

      return dx < overlapDist && dy < overlapDist;
    });

    const isAccessible = !isBlocked;
    return isAccessible !== tile.isAccessible ? { ...tile, isAccessible } : tile;
  });
}

/**
 * Validate that a level config will produce a solvable puzzle.
 * (Basic check: all types have counts divisible by 3)
 */
export function validateLevelConfig(config: LevelConfig): boolean {
  if (config.totalTiles % 3 !== 0) return false;
  if (config.objectTypes.length === 0) return false;
  if (config.timeLimit <= 0) return false;
  return true;
}

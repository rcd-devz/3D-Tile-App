// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format seconds into MM:SS display string.
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format large numbers with commas (e.g., 165351 → "165,351").
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Generate a random ID string.
 */
export function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Ease-out cubic easing function.
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Shuffle an array in place (Fisher-Yates).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Delay helper for async operations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate time until next life regeneration.
 */
export function getNextLifeTime(lastRegenTime: number, regenMinutes: number): string {
  const now = Date.now();
  const elapsed = now - lastRegenTime;
  const regenMs = regenMinutes * 60 * 1000;
  const remaining = regenMs - (elapsed % regenMs);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

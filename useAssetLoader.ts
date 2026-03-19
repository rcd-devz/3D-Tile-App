import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';

// ============================================================
// ASSET LOADER HOOK
// ============================================================
// Preloads 3D models, images, fonts, and sounds.
// Extend this as you add GLB models to the assets folder.
// ============================================================

interface AssetLoadState {
  isLoaded: boolean;
  progress: number;
  error: string | null;
}

/**
 * Hook to preload game assets on app startup.
 * Returns loading state so you can show a splash screen.
 */
export function useAssetLoader(): AssetLoadState {
  const [state, setState] = useState<AssetLoadState>({
    isLoaded: false,
    progress: 0,
    error: null,
  });

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      // Phase 1: Load images/UI assets
      setState((s) => ({ ...s, progress: 0.2 }));

      // Phase 2: Load 3D models (placeholder - add real model paths here)
      // Example when you have GLB models:
      // await Asset.loadAsync([
      //   require('../assets/models/burger.glb'),
      //   require('../assets/models/volleyball.glb'),
      //   ...
      // ]);
      setState((s) => ({ ...s, progress: 0.6 }));

      // Phase 3: Load sounds (placeholder)
      // await Audio.Sound.createAsync(require('../assets/sounds/match.mp3'));
      setState((s) => ({ ...s, progress: 0.8 }));

      // Phase 4: Load fonts (placeholder)
      // await Font.loadAsync({
      //   'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
      //   'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
      // });

      setState({ isLoaded: true, progress: 1, error: null });
    } catch (error: any) {
      console.warn('Asset loading failed:', error);
      setState({ isLoaded: true, progress: 1, error: error.message });
    }
  }

  return state;
}

/**
 * Load a single GLB model from the assets directory.
 * Returns the local URI for use with expo-three's loadAsync.
 */
export async function loadModel(modelName: string): Promise<string | null> {
  try {
    // When you have real models, map them here:
    // const modelMap: Record<string, number> = {
    //   'burger.glb': require('../assets/models/burger.glb'),
    //   'volleyball.glb': require('../assets/models/volleyball.glb'),
    // };
    // const asset = Asset.fromModule(modelMap[modelName]);
    // await asset.downloadAsync();
    // return asset.localUri;
    return null;
  } catch (error) {
    console.warn(`Failed to load model ${modelName}:`, error);
    return null;
  }
}

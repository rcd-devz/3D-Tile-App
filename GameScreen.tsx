import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useGameStore } from './gameStore';
import { GameScene } from './GameScene';
import { COLORS, SIZES } from './constants';
import { getLevelConfig } from './levels';
import { MatchTray } from './MatchTray';
import { GameHUD } from './GameHUD';
import { PauseOverlay } from './PauseOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export function GameScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<GameRouteProp>();
  const { level } = route.params;

  const {
    phase,
    tiles,
    tray,
    timeRemaining,
    score,
    stars,
    combo,
    currentLevel,
    powerUps,
    startLevel,
    pauseGame,
    resumeGame,
    tickTimer,
    selectTile,
    usePowerUp,
    completeLevel,
  } = useGameStore();

  const gameSceneRef = useRef<GameScene | null>(null);
  const glRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const glHeightRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);
  const [glReady, setGlReady] = useState(false);

  // Start level on mount
  useEffect(() => {
    startLevel(level);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      gameSceneRef.current?.dispose();
    };
  }, [level]);

  // Timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  // Handle win/lose
  useEffect(() => {
    if (phase === 'won') {
      completeLevel(stars);
      setTimeout(() => {
        navigation.replace('LevelComplete', {
          level: currentLevel,
          stars,
          timeRemaining,
        });
      }, 800);
    } else if (phase === 'lost') {
      setTimeout(() => {
        navigation.replace('LevelFailed', { level: currentLevel });
      }, 800);
    }
  }, [phase]);

  // Update 3D scene when tiles change
  useEffect(() => {
    const scene = gameSceneRef.current;
    if (!scene) return;

    // If the mesh set doesn't match the current tile set (e.g. level just
    // loaded after GL was already initialized, or a new level started),
    // rebuild meshes. Otherwise just update visual state on existing meshes.
    const meshesMatchTiles =
      scene.tileMeshes.size === tiles.length &&
      tiles.every((t) => scene.tileMeshes.has(t.id));

    if (!meshesMatchTiles) {
      scene.createTileMeshes(tiles);
    } else {
      scene.updateTiles(tiles);
    }
  }, [tiles]);

  // Capture actual GL view height using onLayout
  const handleGLContainerLayout = useCallback((event: any) => {
    glHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  // GL Context setup
  const onGLContextCreate = useCallback(
    async (gl: any) => {
      glRef.current = gl;

      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;

      const scene = new GameScene(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
      scene.renderer = renderer;
      // Build meshes for any tiles already in the store. If tiles arrive
      // after GL init, the [tiles] effect below will populate them.
      scene.createTileMeshes(useGameStore.getState().tiles);
      gameSceneRef.current = scene;

      // Render loop
      const renderLoop = () => {
        animFrameRef.current = requestAnimationFrame(renderLoop);

        if (gameSceneRef.current) {
          renderer.render(
            gameSceneRef.current.scene,
            gameSceneRef.current.camera
          );
        }

        gl.endFrameEXP();
      };

      renderLoop();
      setGlReady(true);
    },
    []
  );

  // Handle tap on 3D scene — debounced to prevent double-selects
  const handleScenePress = useCallback(
    (event: any) => {
      if (phase !== 'playing' || !gameSceneRef.current) return;

      // Debounce: ignore taps within 300ms of last tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) return;
      lastTapRef.current = now;

      const { locationX, locationY } = event.nativeEvent;

      // Use measured layout height; fall back to reasonable estimate only if not yet measured
      const glHeight = glHeightRef.current > 0 ? glHeightRef.current : gl_fallbackHeight();

      const tileId = gameSceneRef.current.getTileAtScreenPos(
        locationX,
        locationY,
        SCREEN_WIDTH,
        glHeight
      );

      if (tileId) {
        // Brief white flash on the 3D tile before it moves to the tray
        gameSceneRef.current?.flashTile(tileId);
        selectTile(tileId);
      }
    },
    [phase, selectTile]
  );

  const config = getLevelConfig(level);
  const timerProgress = timeRemaining / config.timeLimit;

  return (
    <View style={styles.container}>
      {/* Game HUD */}
      <GameHUD
        level={currentLevel}
        stars={stars}
        timeRemaining={timeRemaining}
        timerProgress={timerProgress}
        score={score}
        combo={combo}
        onPause={pauseGame}
      />

      {/* 3D Scene */}
      <TouchableOpacity
        style={styles.glContainer}
        activeOpacity={1}
        onPress={handleScenePress}
        onLayout={handleGLContainerLayout}
      >
        <GLView
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
        {/* Loading overlay — shown until GL is ready */}
        {!glReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Power-ups & Tray */}
      <View style={styles.bottomSection}>
        {/* Power-up buttons */}
        <View style={styles.powerUpRow}>
          <TouchableOpacity
            style={styles.powerUpButton}
            onPress={() => usePowerUp('hint')}
          >
            <Text style={styles.powerUpIcon}>💡</Text>
            <View style={styles.powerUpBadge}>
              <Text style={styles.powerUpCount}>
                {powerUps.find((p) => p.type === 'hint')?.count || 0}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Timer / combo bar */}
          <View style={styles.multiplierContainer}>
            <View
              style={[
                styles.multiplierFill,
                { width: `${timerProgress * 100}%` },
                timerProgress < 0.25 && styles.multiplierLow,
              ]}
            />
            <Text style={styles.multiplierText}>
              {combo > 0 ? `x${combo + 1}` : 'COMBO'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.powerUpButton}
            onPress={() => usePowerUp('shuffle')}
          >
            <Text style={styles.powerUpIcon}>🔀</Text>
            <View style={styles.powerUpBadge}>
              <Text style={styles.powerUpCount}>
                {powerUps.find((p) => p.type === 'shuffle')?.count || 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Match tray */}
        <MatchTray tray={tray} />
      </View>

      {/* Pause overlay */}
      {phase === 'paused' && (
        <PauseOverlay onResume={resumeGame} onQuit={() => navigation.goBack()} />
      )}
    </View>
  );
}

// Fallback height estimate used only before first layout measurement
function gl_fallbackHeight() {
  const { height } = Dimensions.get('window');
  return height * 0.6;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  glContainer: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: COLORS.surfaceDark,
  },
  powerUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  powerUpButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  powerUpIcon: {
    fontSize: 24,
  },
  powerUpBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUpCount: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  multiplierContainer: {
    flex: 1,
    height: 28,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  multiplierFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.timerBar,
    borderRadius: 14,
  },
  multiplierLow: {
    backgroundColor: COLORS.timerBarLow,
  },
  multiplierText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    zIndex: 1,
  },
});

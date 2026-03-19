import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { GameScene } from '../game/GameScene';
import { COLORS, SIZES } from '../config/constants';
import { getLevelConfig } from '../config/levels';
import { MatchTray } from '../components/MatchTray';
import { GameHUD } from '../components/GameHUD';
import { PauseOverlay } from '../components/PauseOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
    if (gameSceneRef.current) {
      gameSceneRef.current.updateTiles(tiles);
    }
  }, [tiles]);

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
      scene.createTileMeshes(tiles);
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
    },
    [tiles]
  );

  // Handle tap on 3D scene
  const handleScenePress = useCallback(
    (event: any) => {
      if (phase !== 'playing' || !gameSceneRef.current) return;

      const { locationX, locationY } = event.nativeEvent;

      // Account for GL view dimensions
      const glWidth = SCREEN_WIDTH;
      const glHeight = SCREEN_HEIGHT - 200; // Approximate space for HUD and tray

      const tileId = gameSceneRef.current.getTileAtScreenPos(
        locationX,
        locationY,
        glWidth,
        glHeight
      );

      if (tileId) {
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
      >
        <GLView
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
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

          {/* Multiplier bar */}
          <View style={styles.multiplierContainer}>
            <View
              style={[
                styles.multiplierFill,
                { width: `${timerProgress * 100}%` },
                timerProgress < 0.25 && styles.multiplierLow,
              ]}
            />
            <Text style={styles.multiplierText}>
              x{combo > 0 ? combo + 1 : 1}
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
    bottom: -2,
    right: -2,
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

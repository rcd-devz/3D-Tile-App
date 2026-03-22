import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS } from '../config/constants';

const { width } = Dimensions.get('window');

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  const [confirmingQuit, setConfirmingQuit] = useState(false);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {!confirmingQuit ? (
          <>
            <Text style={styles.title}>Paused</Text>
            <Text style={styles.emoji}>⏸</Text>

            <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quitButton}
              onPress={() => setConfirmingQuit(true)}
            >
              <Text style={styles.quitText}>Quit Level</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Quit Level?</Text>
            <Text style={styles.confirmSub}>
              Your progress will be lost.
            </Text>

            <TouchableOpacity style={styles.confirmQuitButton} onPress={onQuit}>
              <Text style={styles.confirmQuitText}>Yes, Quit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => setConfirmingQuit(false)}
            >
              <Text style={styles.resumeText}>Keep Playing</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    width: width * 0.75,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 24,
  },
  confirmSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  resumeButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quitButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  quitText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  confirmQuitButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmQuitText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

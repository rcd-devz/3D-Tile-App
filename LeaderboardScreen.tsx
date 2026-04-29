import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './constants';
import { LeaderboardEntry } from './types';
import { TopBar } from './TopBar';

// Mock leaderboard data (replace with API calls)
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Wormy', team: 'SG Wormies', level: 165351, country: '🇸🇬' },
  { rank: 2, name: 'Gammy', team: 'moving up', level: 147930, country: '🌸' },
  { rank: 3, name: 'Pan', team: 'TrumpReallyWon', level: 111208, country: '🇺🇸' },
  { rank: 4, name: 'Sophia', team: 'mikeneko', level: 107453, country: '🐱' },
  { rank: 5, name: 'Boulder', team: 'The Gamblers', level: 98714, country: '🐱' },
  { rank: 6, name: 'frechdachs', team: 'German power', level: 92472, country: '🇩🇪' },
  { rank: 7, name: 'BooBeari', team: 'The Crushers', level: 89203, country: '🏔️' },
  { rank: 8, name: 'TileKing', team: 'Solo Squad', level: 85120, country: '🇬🇧' },
  { rank: 9, name: 'PuzzlePro', team: 'Matchmakers', level: 78654, country: '🇯🇵' },
  { rank: 10, name: 'StarChild', team: 'Cosmic Crew', level: 72100, country: '🇧🇷' },
];

type Tab = 'Players' | 'Teams' | 'Friends';
type Region = 'World' | 'United States';

export function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Players');
  const [region, setRegion] = useState<Region>('World');

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', color: '#ffd700' };
      case 2: return { emoji: '🥈', color: '#c0c0c0' };
      case 3: return { emoji: '🥉', color: '#cd7f32' };
      default: return { emoji: '', color: COLORS.textSecondary };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      {/* Tab selector */}
      <View style={styles.tabRow}>
        {(['Players', 'Teams', 'Friends'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Region selector */}
      <View style={styles.regionRow}>
        {(['World', 'United States'] as Region[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.regionBtn, region === r && styles.regionBtnActive]}
            onPress={() => setRegion(r)}
          >
            <Text style={[styles.regionText, region === r && styles.regionTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_LEADERBOARD.map((entry) => {
          const rankStyle = getRankStyle(entry.rank);
          return (
            <View key={entry.rank} style={styles.entryCard}>
              <View style={styles.rankContainer}>
                {entry.rank <= 3 ? (
                  <Text style={styles.rankEmoji}>{rankStyle.emoji}</Text>
                ) : (
                  <Text style={styles.rankNumber}>{entry.rank}</Text>
                )}
              </View>

              <Text style={styles.countryFlag}>{entry.country}</Text>

              <View style={styles.entryInfo}>
                <Text style={[styles.entryName, { color: rankStyle.color }]}>
                  {entry.name}
                </Text>
                <Text style={styles.entryTeam}>{entry.team}</Text>
              </View>

              <View style={styles.entryLevel}>
                <Text style={styles.levelLabel}>Level</Text>
                <Text style={styles.levelValue}>
                  {entry.level.toLocaleString()}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.textPrimary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  regionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  regionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  regionBtnActive: {
    backgroundColor: '#5a8a8a',
  },
  regionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  regionTextActive: {
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  countryFlag: {
    fontSize: 28,
    marginHorizontal: 10,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryTeam: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  entryLevel: {
    alignItems: 'flex-end',
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  levelValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
});

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParamList, MainTabParamList } from './types';
import { COLORS } from './constants';

// Screens
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ShopScreen } from './ShopScreen';
import { LeaderboardScreen } from './LeaderboardScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { LevelFailedScreen } from './LevelFailedScreen';

// ============================================================
// NAVIGATION
// ============================================================

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Shop: '🛒',
    Hearts: '❤️',
    Home: '🏠',
    Social: '👥',
    Leaderboard: '🏆',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
        {icons[label] || '⚙️'}
      </Text>
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
      >
        {label}
      </Text>
    </View>
  );
}

// Placeholder screens for tabs not yet built
function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{name}</Text>
      <Text style={styles.placeholderSub}>Coming soon</Text>
    </View>
  );
}

function HeartsScreen() {
  return <PlaceholderScreen name="Hearts" />;
}

function SocialScreen() {
  return <PlaceholderScreen name="Social" />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Shop" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Hearts"
        component={HeartsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Hearts" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Social" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Leaderboard" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="LevelComplete"
          component={LevelCompleteScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="LevelFailed"
          component={LevelFailedScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surfaceDark,
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholderSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});

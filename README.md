# Match Tile 3D - React Native (Expo)

A full-featured Match Tile 3D clone built with React Native, Expo, Three.js, and RevenueCat.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Project Structure

```
match-tile-3d/
├── App.tsx                          # Entry point
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Main menu with level ring + play button
│   │   ├── GameScreen.tsx           # 3D gameplay (Three.js GL view)
│   │   ├── ShopScreen.tsx           # IAP store with bundles
│   │   ├── LeaderboardScreen.tsx    # Player/Team/Friends rankings
│   │   ├── LevelCompleteScreen.tsx  # Win screen with stars + rewards
│   │   └── LevelFailedScreen.tsx    # Lose screen with retry/continue
│   ├── components/
│   │   ├── TopBar.tsx               # Lives, coins, settings bar
│   │   ├── MatchTray.tsx            # Bottom 7-slot match tray
│   │   ├── GameHUD.tsx              # Timer, score, combo display
│   │   └── PauseOverlay.tsx         # Pause menu overlay
│   ├── game/
│   │   ├── GameScene.ts             # Three.js scene manager
│   │   └── TileGenerator.ts         # Procedural tile pile generation
│   ├── config/
│   │   ├── levels.ts                # JSON-based level configuration (15 levels + procedural)
│   │   ├── shop.ts                  # Shop items and IAP product IDs
│   │   └── constants.ts             # Theme colors, sizes, timing
│   ├── store/
│   │   └── gameStore.ts             # Zustand state management
│   ├── services/
│   │   └── IAPService.ts            # RevenueCat integration
│   ├── hooks/
│   │   └── useAssetLoader.ts        # Asset preloading hook
│   ├── utils/
│   │   └── helpers.ts               # Formatting, math, shuffle utilities
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Stack + Tab navigation
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── assets/
│       └── models/                  # Place .glb 3D models here
├── assets/
│   ├── fonts/                       # Custom fonts (Nunito recommended)
│   ├── images/                      # App icon, splash screen
│   └── sounds/                      # SFX: match.mp3, select.mp3, etc.
├── package.json
├── tsconfig.json
├── babel.config.js
└── app.json                         # Expo configuration
```

## Features Implemented

### Core Gameplay
- **3D tile pile** rendered with Three.js via expo-gl / expo-three
- **Tap-to-select** tiles with raycasting hit detection
- **Match-3 mechanic** — tap 3 of the same type to clear them
- **7-slot tray** at the bottom — tray full with no match = game over
- **Timer** with configurable time per level
- **Combo system** with score multiplier
- **Tile accessibility** — buried tiles can't be selected

### Power-ups
- 💡 **Hint** — highlights matching accessible tiles
- 🔀 **Shuffle** — randomizes tile positions
- ↩️ **Undo** — returns last tile from tray to pile
- 🧲 **Magnet** — auto-matches 3 accessible tiles of same type

### Progression
- **15 hand-crafted levels** + procedural generation for infinite play
- **Star ratings** (1-3 stars) based on time remaining
- **Coin rewards** for completing levels
- **Life system** (5 lives, 30-min regeneration)
- **Player profile** persisted via AsyncStorage

### UI Screens (matching original app)
- Home screen with level ring + play button
- Shop with IAP bundles (RevenueCat skeleton)
- Leaderboard with Players/Teams/Friends tabs
- Level complete / failed screens
- Pause overlay

### Monetization (RevenueCat)
- Full IAP skeleton with product IDs
- Shop items: Special Offer, Master Bundle, Super Bundle, coin packs
- Restore purchases support
- Dev mode: purchases apply directly for testing

## Adding 3D Models

The game currently uses colored placeholder shapes. To add real 3D models:

### Recommended Free Sources
1. **[Poly Pizza](https://poly.pizza/)** — Best for low-poly GLB models, no login needed
2. **[itch.io GLB assets](https://itch.io/game-assets/free/tag-glb/tag-low-poly)** — Food packs, objects
3. **[CGTrader free GLB](https://www.cgtrader.com/low-poly-3d-models/glb)** — Large library

### Steps
1. Download `.glb` models for each tile type
2. Place them in `src/assets/models/` (e.g., `burger.glb`, `volleyball.glb`)
3. Update `src/hooks/useAssetLoader.ts` to load the models:
   ```typescript
   const modelMap: Record<string, number> = {
     'burger.glb': require('../assets/models/burger.glb'),
     'volleyball.glb': require('../assets/models/volleyball.glb'),
     // ... add all 15 types
   };
   ```
4. Update `src/game/GameScene.ts` to use `GLTFLoader` from expo-three:
   ```typescript
   import { loadAsync } from 'expo-three';
   // In createTileMesh():
   const model = await loadAsync(modelUri);
   ```

### Object Types to Source
| Type | Search Term | Shape |
|------|------------|-------|
| burger | "low poly hamburger glb" | Cylinder |
| volleyball | "low poly volleyball glb" | Sphere |
| toilet_paper | "low poly toilet paper roll glb" | Torus |
| grapes | "low poly grapes glb" | Dodecahedron |
| train | "low poly toy train glb" | Box |
| eggplant | "low poly eggplant glb" | Elongated cylinder |
| tire | "low poly tire wheel glb" | Torus |
| cake | "low poly cake slice glb" | Cylinder |
| chair | "low poly chair glb" | Box |
| crate | "low poly wooden crate glb" | Box |
| beach_ball | "low poly beach ball glb" | Sphere |
| drum | "low poly drum glb" | Cylinder |
| hippo | "low poly hippo glb" | Sphere |
| tiger | "low poly tiger glb" | Custom |
| zebra | "low poly zebra glb" | Custom |

## Setting Up RevenueCat

1. Create an account at [revenuecat.com](https://www.revenuecat.com/)
2. Add your iOS/Android apps
3. Create products matching the IDs in `src/config/shop.ts`
4. Replace API keys in `src/services/IAPService.ts`:
   ```typescript
   const REVENUECAT_API_KEY_IOS = 'your_ios_key_here';
   const REVENUECAT_API_KEY_ANDROID = 'your_android_key_here';
   ```
5. Set up entitlements in RevenueCat dashboard

## Adding Custom Levels

Edit `src/config/levels.ts` and add entries to the `LEVELS` array:

```typescript
{
  level: 16,
  timeLimit: 300,           // seconds
  objectTypes: ['burger', 'volleyball', 'grapes', ...],
  totalTiles: 90,           // must be divisible by 3
  density: 0.85,            // 0.0 - 1.0 (pile spread)
  layers: 6,                // vertical layers in pile
  starThresholds: [20, 60, 120],  // seconds remaining for 1/2/3 stars
  theme: 'default',
}
```

Levels beyond the defined set auto-generate procedurally.

## Using with Claude Code

This project is optimized for iterating with Claude Code:

```bash
# Open in VS Code
code match-tile-3d/

# Start Claude Code
claude

# Example prompts:
# "Add sound effects when tiles match"
# "Make the 3D tiles wiggle when accessible"
# "Add a daily rewards system"
# "Implement the Friends leaderboard with Firebase"
# "Add particle effects when combos happen"
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Tech Stack
- **React Native** + **Expo SDK 52**
- **Three.js** via expo-three / expo-gl (3D rendering)
- **Zustand** (state management)
- **React Navigation 7** (navigation)
- **RevenueCat** (in-app purchases)
- **AsyncStorage** (persistence)
- **TypeScript** (type safety)

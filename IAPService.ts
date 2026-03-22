import { Platform } from 'react-native';

// Conditionally import react-native-purchases so the app works in Expo Go.
// In Expo Go the native module is unavailable; IAP calls will be silent no-ops.
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {
  // Running in Expo Go — IAP not available
}

// ============================================================
// IN-APP PURCHASE SERVICE (RevenueCat)
// ============================================================
// Handles all IAP logic via RevenueCat SDK.
// Replace API keys with your own from the RevenueCat dashboard.
// ============================================================

const REVENUECAT_API_KEY_IOS = 'YOUR_REVENUECAT_IOS_API_KEY';
const REVENUECAT_API_KEY_ANDROID = 'YOUR_REVENUECAT_ANDROID_API_KEY';

class IAPService {
  private initialized = false;

  /**
   * Initialize RevenueCat SDK.
   * Call this once on app startup.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!Purchases) {
      if (__DEV__) console.log('[IAP] Skipping RevenueCat init — not available in Expo Go');
      return;
    }

    try {
      const apiKey =
        Platform.OS === 'ios'
          ? REVENUECAT_API_KEY_IOS
          : REVENUECAT_API_KEY_ANDROID;

      Purchases.configure({ apiKey });
      this.initialized = true;
      if (__DEV__) console.log('[IAP] RevenueCat initialized');
    } catch (error) {
      if (__DEV__) console.warn('[IAP] Failed to initialize RevenueCat:', error);
    }
  }

  /**
   * Fetch available packages/products from RevenueCat.
   */
  async getOfferings(): Promise<any[]> {
    if (!Purchases) return [];
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      if (__DEV__) console.warn('[IAP] Failed to fetch offerings:', error);
      return [];
    }
  }

  /**
   * Purchase a specific package.
   */
  async purchasePackage(
    pkg: any
  ): Promise<{ success: boolean; customerInfo?: any }> {
    if (!Purchases) return { success: false };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false };
      }
      if (__DEV__) console.warn('[IAP] Purchase failed:', error);
      return { success: false };
    }
  }

  /**
   * Purchase by product ID (for direct shop items).
   */
  async purchaseProduct(
    productId: string
  ): Promise<{ success: boolean; customerInfo?: any }> {
    if (!Purchases) return { success: false };
    try {
      const { customerInfo } = await Purchases.purchaseStoreProduct({
        identifier: productId,
      } as any);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false };
      }
      if (__DEV__) console.warn('[IAP] Purchase failed:', error);
      return { success: false };
    }
  }

  /**
   * Restore previous purchases.
   */
  async restorePurchases(): Promise<any | null> {
    if (!Purchases) return null;
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      if (__DEV__) console.warn('[IAP] Restore failed:', error);
      return null;
    }
  }

  /**
   * Get current customer info for entitlement checks.
   */
  async getCustomerInfo(): Promise<any | null> {
    if (!Purchases) return null;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      if (__DEV__) console.warn('[IAP] Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Check if user has unlimited lives entitlement.
   */
  async hasUnlimitedLives(): Promise<boolean> {
    const info = await this.getCustomerInfo();
    if (!info) return false;
    return info.entitlements.active['unlimited_lives'] !== undefined;
  }
}

export const iapService = new IAPService();

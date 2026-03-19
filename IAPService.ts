import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

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

    try {
      const apiKey =
        Platform.OS === 'ios'
          ? REVENUECAT_API_KEY_IOS
          : REVENUECAT_API_KEY_ANDROID;

      Purchases.configure({ apiKey });
      this.initialized = true;
      console.log('[IAP] RevenueCat initialized');
    } catch (error) {
      console.warn('[IAP] Failed to initialize RevenueCat:', error);
    }
  }

  /**
   * Fetch available packages/products from RevenueCat.
   */
  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      console.warn('[IAP] Failed to fetch offerings:', error);
      return [];
    }
  }

  /**
   * Purchase a specific package.
   */
  async purchasePackage(
    pkg: PurchasesPackage
  ): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false };
      }
      console.warn('[IAP] Purchase failed:', error);
      return { success: false };
    }
  }

  /**
   * Purchase by product ID (for direct shop items).
   */
  async purchaseProduct(
    productId: string
  ): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    try {
      const { customerInfo } = await Purchases.purchaseStoreProduct({
        identifier: productId,
      } as any);
      return { success: true, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false };
      }
      console.warn('[IAP] Purchase failed:', error);
      return { success: false };
    }
  }

  /**
   * Restore previous purchases.
   */
  async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.warn('[IAP] Restore failed:', error);
      return null;
    }
  }

  /**
   * Get current customer info for entitlement checks.
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.warn('[IAP] Failed to get customer info:', error);
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

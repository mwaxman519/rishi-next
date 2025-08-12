import { Preferences } from '@capacitor/preferences';

/**
 * Offline Storage Manager for Rishi Platform
 * Handles persistent storage for offline functionality
 */

export class OfflineStorageManager {
  private static readonly QUEUE_KEY = 'rishi_offline_queue';
  private static readonly USER_KEY = 'rishi_user_data';
  private static readonly CACHE_KEY = 'rishi_cache_data';
  private static readonly SYNC_KEY = 'rishi_last_sync';

  /**
   * Queue an action to be synced when online
   */
  static async queueAction(action: {
    type: string;
    endpoint: string;
    method: string;
    data?: any;
    timestamp?: number;
  }) {
    const queue = await this.getQueue();
    queue.push({
      ...action,
      timestamp: action.timestamp || Date.now(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    await Preferences.set({
      key: this.QUEUE_KEY,
      value: JSON.stringify(queue)
    });
    return queue;
  }

  /**
   * Get all queued actions
   */
  static async getQueue() {
    const { value } = await Preferences.get({ key: this.QUEUE_KEY });
    return value ? JSON.parse(value) : [];
  }

  /**
   * Clear the offline queue
   */
  static async clearQueue() {
    await Preferences.remove({ key: this.QUEUE_KEY });
  }

  /**
   * Remove specific items from queue
   */
  static async removeFromQueue(ids: string[]) {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter((item: any) => !ids.includes(item.id));
    await Preferences.set({
      key: this.QUEUE_KEY,
      value: JSON.stringify(filteredQueue)
    });
    return filteredQueue;
  }

  /**
   * Save user data for offline access
   */
  static async saveUserData(userData: any) {
    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(userData)
    });
  }

  /**
   * Get saved user data
   */
  static async getUserData() {
    const { value } = await Preferences.get({ key: this.USER_KEY });
    return value ? JSON.parse(value) : null;
  }

  /**
   * Cache data for offline use
   */
  static async cacheData(key: string, data: any) {
    const cache = await this.getCache();
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    await Preferences.set({
      key: this.CACHE_KEY,
      value: JSON.stringify(cache)
    });
  }

  /**
   * Get cached data
   */
  static async getCachedData(key: string, maxAge?: number) {
    const cache = await this.getCache();
    const cached = cache[key];
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (maxAge && Date.now() - cached.timestamp > maxAge) {
      return null;
    }
    
    return cached.data;
  }

  /**
   * Get all cached data
   */
  static async getCache() {
    const { value } = await Preferences.get({ key: this.CACHE_KEY });
    return value ? JSON.parse(value) : {};
  }

  /**
   * Clear all cached data
   */
  static async clearCache() {
    await Preferences.remove({ key: this.CACHE_KEY });
  }

  /**
   * Set last sync timestamp
   */
  static async setLastSync() {
    await Preferences.set({
      key: this.SYNC_KEY,
      value: JSON.stringify(Date.now())
    });
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSync() {
    const { value } = await Preferences.get({ key: this.SYNC_KEY });
    return value ? parseInt(value) : 0;
  }

  /**
   * Sync queued actions when online
   */
  static async syncQueue(apiUrl: string = 'https://rishi-next.vercel.app') {
    const queue = await this.getQueue();
    const successfulIds: string[] = [];
    const errors: any[] = [];

    for (const action of queue) {
      try {
        const response = await fetch(`${apiUrl}${action.endpoint}`, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: action.data ? JSON.stringify(action.data) : undefined,
        });

        if (response.ok) {
          successfulIds.push(action.id);
        } else {
          errors.push({
            action,
            error: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        errors.push({
          action,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Remove successful actions from queue
    if (successfulIds.length > 0) {
      await this.removeFromQueue(successfulIds);
    }

    // Update last sync time
    await this.setLastSync();

    return {
      synced: successfulIds.length,
      failed: errors.length,
      errors
    };
  }

  /**
   * Check if device is online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for online/offline events
   */
  static setupNetworkListeners(
    onOnline?: () => void,
    onOffline?: () => void
  ) {
    window.addEventListener('online', () => {
      console.log('[Offline Storage] Device is online');
      onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('[Offline Storage] Device is offline');
      onOffline?.();
    });
  }
}

// Export as default for easier imports
export default OfflineStorageManager;
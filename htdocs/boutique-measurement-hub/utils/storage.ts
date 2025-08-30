export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export class StorageManager {
  private static instance: StorageManager;
  private storage: globalThis.Storage;

  private constructor(useSessionStorage: boolean = false) {
    this.storage = useSessionStorage ? window.sessionStorage : window.localStorage;
  }

  public static getInstance(useSessionStorage: boolean = false): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(useSessionStorage);
    }
    return StorageManager.instance;
  }

  public set<T>(key: string, value: T, expiresInMinutes?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: expiresInMinutes ? Date.now() + (expiresInMinutes * 60 * 1000) : undefined,
      };
      
      this.storage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Failed to set storage item:', error);
      return false;
    }
  }

  public get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      const parsedItem: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsedItem.expiresAt && Date.now() > parsedItem.expiresAt) {
        this.remove(key);
        return null;
      }

      return parsedItem.value;
    } catch (error) {
      console.error('Failed to get storage item:', error);
      return null;
    }
  }

  public remove(key: string): boolean {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove storage item:', error);
      return false;
    }
  }

  public clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  public has(key: string): boolean {
    try {
      return this.storage.getItem(key) !== null;
    } catch (error) {
      console.error('Failed to check storage item:', error);
      return false;
    }
  }

  public getKeys(): string[] {
    try {
      return Object.keys(this.storage);
    } catch (error) {
      console.error('Failed to get storage keys:', error);
      return [];
    }
  }

  public getSize(): number {
    try {
      return this.storage.length;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }
}

// Convenience functions
export const localStorage = StorageManager.getInstance(false);
export const sessionStorage = StorageManager.getInstance(true);

// Specific storage keys
export const STORAGE_KEYS = {
  USER: 'boutique_user',
  AUTH_TOKEN: 'boutique_auth_token',
  THEME: 'boutique_theme',
  LANGUAGE: 'boutique_language',
  CUSTOMER_DATA: 'boutique_customer_data',
  MEASUREMENTS: 'boutique_measurements',
  IMAGES: 'boutique_images',
} as const;

// Type-safe storage helpers
export const getUser = () => localStorage.get(STORAGE_KEYS.USER);
export const setUser = (user: any) => localStorage.set(STORAGE_KEYS.USER, user);
export const removeUser = () => localStorage.remove(STORAGE_KEYS.USER);

export const getAuthToken = () => localStorage.get(STORAGE_KEYS.AUTH_TOKEN);
export const setAuthToken = (token: string) => localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token, 60 * 24); // 24 hours
export const removeAuthToken = () => localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);

export const getTheme = () => localStorage.get(STORAGE_KEYS.THEME) || 'light';
export const setTheme = (theme: 'light' | 'dark') => localStorage.set(STORAGE_KEYS.THEME, theme);

export const getLanguage = () => localStorage.get(STORAGE_KEYS.LANGUAGE) || 'en';
export const setLanguage = (language: string) => localStorage.set(STORAGE_KEYS.LANGUAGE, language);

export const clearAuthData = () => {
  removeUser();
  removeAuthToken();
}; 
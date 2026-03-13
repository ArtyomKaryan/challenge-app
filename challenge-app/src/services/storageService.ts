import { AppState } from '../types';

const STORAGE_KEY = 'challenge_of_the_day_state';

// In-memory fallback in case localStorage is unavailable (e.g. some WebView configs)
let memoryStore: string | null = null;

const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return key === STORAGE_KEY ? memoryStore : null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      if (key === STORAGE_KEY) memoryStore = value;
    }
  }
};

export const storageService = {
  saveState: (state: AppState): void => {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  loadState: (): AppState | null => {
    const data = storage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AppState;
    } catch (e) {
      console.error("Failed to parse state", e);
      return null;
    }
  },

  getCurrentDateString: (): string => {
    return new Date().toISOString().split('T')[0];
  }
};

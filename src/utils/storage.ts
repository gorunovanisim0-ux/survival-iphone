import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SAVE_DATA } from '../constants/gameData';
import { SaveGameData } from '../types/game';

const STORAGE_KEY = '@anisim_game_app_save_v2';
const GLOBAL_CACHE_KEY = '__ANISIM_GAME_SAVE_V2__';

export async function loadSavedGame(): Promise<SaveGameData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveGameData>;
      if (parsed && typeof parsed.wave === 'number') {
        const merged: SaveGameData = {
          ...DEFAULT_SAVE_DATA,
          ...parsed,
          weapons: {
            ...DEFAULT_SAVE_DATA.weapons,
            ...(parsed.weapons || {}),
          },
          skills: {
            ...DEFAULT_SAVE_DATA.skills,
            ...(parsed.skills || {}),
          },
          settings: {
            ...DEFAULT_SAVE_DATA.settings,
            ...(parsed.settings || {}),
          },
        };
        (globalThis as Record<string, unknown>)[GLOBAL_CACHE_KEY] = merged;
        return merged;
      }
    }

    const g = globalThis as Record<string, unknown>;
    if (g[GLOBAL_CACHE_KEY]) {
      return {
        ...DEFAULT_SAVE_DATA,
        ...(g[GLOBAL_CACHE_KEY] as Partial<SaveGameData>),
      };
    }
  } catch {
    // fallback to default save data
  }
  return DEFAULT_SAVE_DATA;
}

export async function persistSaveGame(data: SaveGameData): Promise<void> {
  try {
    const g = globalThis as Record<string, unknown>;
    g[GLOBAL_CACHE_KEY] = data;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
}

import { DEFAULT_SAVE_DATA } from '../constants/gameData';
import { SaveGameData } from '../types/game';

const GLOBAL_CACHE_KEY = '__SURVIVAL_SAVE_DATA_V1__';
const API_SAVE_URL = 'http://192.168.0.111:8081/api/save';

export async function loadSavedGame(): Promise<SaveGameData> {
  try {
    const g = globalThis as Record<string, unknown>;
    if (g[GLOBAL_CACHE_KEY]) {
      return {
        ...DEFAULT_SAVE_DATA,
        ...(g[GLOBAL_CACHE_KEY] as Partial<SaveGameData>),
      };
    }

    const res = await fetch(API_SAVE_URL, { method: 'GET' });
    if (res.ok) {
      const data = (await res.json()) as Partial<SaveGameData>;
      if (data && typeof data.wave === 'number') {
        const merged: SaveGameData = {
          ...DEFAULT_SAVE_DATA,
          ...data,
        };
        g[GLOBAL_CACHE_KEY] = merged;
        return merged;
      }
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

    await fetch(API_SAVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // ignore network errors
  }
}

/**
 * localStorage sarmalayıcı: en iyi skor ve yarım kalan oyun.
 * Gizli sekme / kapalı depolama durumunda sessizce devre dışı kalır.
 */

import { STORAGE_BEST_KEY, STORAGE_GAME_KEY } from '../config/constants.ts'
import type { SavedBoard } from './Board2048.ts'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* depolama yoksa oyun yine de oynanır */
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* yok sayılır */
  }
}

export const GameStorage = {
  loadBest(): number {
    const raw = read(STORAGE_BEST_KEY)
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? value : 0
  },

  saveBest(score: number): void {
    write(STORAGE_BEST_KEY, String(score))
  },

  loadGame(): SavedBoard | null {
    const raw = read(STORAGE_GAME_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SavedBoard
    } catch {
      return null
    }
  },

  saveGame(board: SavedBoard): void {
    write(STORAGE_GAME_KEY, JSON.stringify(board))
  },

  clearGame(): void {
    remove(STORAGE_GAME_KEY)
  },
}

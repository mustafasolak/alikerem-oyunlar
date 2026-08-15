/** 2048'in kayıt katmanı: en iyi skor ve yarım kalan oyun. */

import { readJson, readScore, removeKey, writeJson, writeScore } from '../../../shared/safeStorage.ts'
import { STORAGE_BEST_KEY, STORAGE_GAME_KEY } from '../config/constants.ts'
import type { SavedBoard } from './Board2048.ts'

export const GameStorage = {
  loadBest: (): number => readScore(STORAGE_BEST_KEY),
  saveBest: (score: number): void => writeScore(STORAGE_BEST_KEY, score),
  loadGame: (): SavedBoard | null => readJson<SavedBoard>(STORAGE_GAME_KEY),
  saveGame: (board: SavedBoard): void => writeJson(STORAGE_GAME_KEY, board),
  clearGame: (): void => removeKey(STORAGE_GAME_KEY),
}

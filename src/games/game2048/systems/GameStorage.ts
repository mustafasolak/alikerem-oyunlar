/** 2048'in kayıt katmanı: yarım kalan oyun. Skorlar Leaderboard'da tutulur. */

import { readJson, removeKey, writeJson } from '../../../shared/safeStorage.ts'
import { STORAGE_GAME_KEY } from '../config/constants.ts'
import type { SavedBoard } from './Board2048.ts'

export const GameStorage = {
  loadGame: (): SavedBoard | null => readJson<SavedBoard>(STORAGE_GAME_KEY),
  saveGame: (board: SavedBoard): void => writeJson(STORAGE_GAME_KEY, board),
  clearGame: (): void => removeKey(STORAGE_GAME_KEY),
}

/** Yılan'ın kayıt katmanı: yalnızca en iyi skor (oyun anlık, yarıda kaydedilmiyor). */

import { readScore, writeScore } from '../../../shared/safeStorage.ts'
import { STORAGE_BEST_KEY } from '../config/constants.ts'

export const SnakeStorage = {
  loadBest: (): number => readScore(STORAGE_BEST_KEY),
  saveBest: (score: number): void => writeScore(STORAGE_BEST_KEY, score),
}

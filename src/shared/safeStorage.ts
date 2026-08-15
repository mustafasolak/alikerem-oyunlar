/**
 * localStorage'a güvenli erişim.
 * Gizli sekme / kapalı depolama durumunda sessizce devre dışı kalır, oyun yine oynanır.
 */

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* depolama yoksa yok sayılır */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* yok sayılır */
  }
}

/** Pozitif sayı okur; geçersizse 0 döner. */
export function readScore(key: string): number {
  const value = Number(readString(key))
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function writeScore(key: string, score: number): void {
  writeString(key, String(score))
}

export function readJson<T>(key: string): T | null {
  const raw = readString(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  writeString(key, JSON.stringify(value))
}

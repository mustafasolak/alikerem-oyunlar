/** Favoriler ve son oynananlar — cihazda saklanır. */

import { readJson, writeJson } from '../shared/safeStorage.ts'

const FAVORI = 'oyunlar.favoriler'
const SON = 'oyunlar.son'
const SON_SINIR = 8

export function favoriler(): string[] {
  return readJson<string[]>(FAVORI) ?? []
}

export function favoriMi(id: string): boolean {
  return favoriler().includes(id)
}

export function favoriDegistir(id: string): boolean {
  const liste = favoriler()
  const yer = liste.indexOf(id)
  if (yer >= 0) liste.splice(yer, 1)
  else liste.push(id)
  writeJson(FAVORI, liste)
  return yer < 0
}

export function sonOynananlar(): string[] {
  return readJson<string[]>(SON) ?? []
}

export function sonOynananaEkle(id: string): void {
  const liste = sonOynananlar().filter((x) => x !== id)
  liste.unshift(id)
  writeJson(SON, liste.slice(0, SON_SINIR))
}

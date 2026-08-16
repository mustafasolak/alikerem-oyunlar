/**
 * Ortak görsel yardımcılar.
 *
 * Amaç: bütün oyunlarda aynı görsel dil — düz renk lekesi yerine hafif
 * hacimli parçalar, okunur nişan çizgileri, tutarlı katman sırası.
 */

import * as Phaser from 'phaser'

/** Katman sırası: arka plan < ızgara < içerik < efekt < nişan. */
export const KATMAN = {
  ARKA: 0,
  IZGARA: 5,
  ICERIK: 10,
  EFEKT: 20,
  NISAN: 30,
} as const

/** Rengi verilen oranda açar (0 = aynı, 1 = beyaz). */
export function acikTon(renk: number, oran: number): number {
  const r = (renk >> 16) & 0xff
  const g = (renk >> 8) & 0xff
  const b = renk & 0xff
  const kat = (v: number): number => Math.round(v + (255 - v) * oran)
  return (kat(r) << 16) | (kat(g) << 8) | kat(b)
}

/** Rengi verilen oranda koyulaştırır (0 = aynı, 1 = siyah). */
export function koyuTon(renk: number, oran: number): number {
  const r = (renk >> 16) & 0xff
  const g = (renk >> 8) & 0xff
  const b = renk & 0xff
  const kat = (v: number): number => Math.round(v * (1 - oran))
  return (kat(r) << 16) | (kat(g) << 8) | kat(b)
}

export interface ParcaAyari {
  x: number
  y: number
  genislik: number
  yukseklik: number
  renk: number
  radius?: number
  /** Üstte parlama, altta gölge şeridi. */
  hacim?: boolean
  secili?: boolean
  seciliRenk?: number
}

/**
 * Hacim hissi olan bir parça: gövde + üstte açık şerit + altta koyu şerit.
 * Container döner, böylece tek parça gibi taşınıp ölçeklenebilir.
 */
export function parca(scene: Phaser.Scene, ayar: ParcaAyari): Phaser.GameObjects.Container {
  const { genislik: g, yukseklik: h, renk } = ayar
  const radius = ayar.radius ?? Math.min(g, h) * 0.18
  const parcalar: Phaser.GameObjects.GameObject[] = []

  const govde = scene.add.rectangle(0, 0, g, h, renk).setRounded(radius)
  parcalar.push(govde)

  if (ayar.hacim !== false) {
    // Üst parlama: gövdenin üst üçte biri
    parcalar.push(
      scene.add
        .rectangle(0, -h * 0.3, g * 0.82, h * 0.26, acikTon(renk, 0.35))
        .setRounded(radius * 0.6)
        .setAlpha(0.75),
    )
    // Alt gölge şeridi
    parcalar.push(
      scene.add
        .rectangle(0, h * 0.36, g * 0.86, h * 0.14, koyuTon(renk, 0.35))
        .setRounded(radius * 0.5)
        .setAlpha(0.55),
    )
  }

  if (ayar.secili) {
    govde.setStrokeStyle(3, ayar.seciliRenk ?? 0xffffff, 0.95)
  }

  const kap = scene.add.container(ayar.x, ayar.y, parcalar)
  kap.setSize(g, h)
  return kap
}

/** Hacimli top: gövde + sol üstte parlama noktası. */
export function top(
  scene: Phaser.Scene,
  x: number,
  y: number,
  yaricap: number,
  renk: number,
): Phaser.GameObjects.Container {
  const govde = scene.add.circle(0, 0, yaricap, renk)
  const golge = scene.add.circle(0, yaricap * 0.22, yaricap * 0.82, koyuTon(renk, 0.3)).setAlpha(0.45)
  const parlama = scene.add
    .circle(-yaricap * 0.3, -yaricap * 0.34, yaricap * 0.3, acikTon(renk, 0.65))
    .setAlpha(0.9)
  const kap = scene.add.container(x, y, [govde, golge, parlama])
  kap.setSize(yaricap * 2, yaricap * 2)
  return kap
}

/**
 * Kesik çizgili nişan izi. Duvarlardan seken yolu noktalarla gösterir.
 * `nokta` aralığı piksel cinsindendir.
 */
export function nisanIzi(
  g: Phaser.GameObjects.Graphics,
  yol: { x: number; y: number }[],
  renk: number,
  nokta = 9,
  yaricap = 2.5,
  alpha = 0.75,
): void {
  g.fillStyle(renk, alpha)
  let birikim = 0
  for (let i = 1; i < yol.length; i++) {
    const a = yol[i - 1]
    const b = yol[i]
    const uzunluk = Math.hypot(b.x - a.x, b.y - a.y)
    let mesafe = nokta - birikim
    while (mesafe < uzunluk) {
      const oran = mesafe / uzunluk
      g.fillCircle(a.x + (b.x - a.x) * oran, a.y + (b.y - a.y) * oran, yaricap)
      mesafe += nokta
    }
    birikim = (birikim + uzunluk) % nokta
  }
}

/**
 * Bir noktadan yönde ilerleyen, yan duvarlardan seken ışın.
 * `dur(x, y)` true dönerse yol orada biter.
 */
export function sekenYol(
  baslangicX: number,
  baslangicY: number,
  yonX: number,
  yonY: number,
  solSinir: number,
  sagSinir: number,
  ustSinir: number,
  dur: (x: number, y: number) => boolean,
  adim = 4,
  maxAdim = 900,
): { x: number; y: number }[] {
  const uzunluk = Math.hypot(yonX, yonY) || 1
  let vx = (yonX / uzunluk) * adim
  let vy = (yonY / uzunluk) * adim
  let x = baslangicX
  let y = baslangicY
  const yol = [{ x, y }]

  for (let i = 0; i < maxAdim; i++) {
    x += vx
    y += vy
    if (x < solSinir || x > sagSinir) {
      // Duvara çarptı: köşeyi kaydedip yönü çevir
      x = Math.max(solSinir, Math.min(sagSinir, x))
      vx = -vx
      yol.push({ x, y })
      continue
    }
    if (y < ustSinir || dur(x, y)) {
      yol.push({ x, y })
      break
    }
  }
  if (yol.length === 1) yol.push({ x, y })
  return yol
}

/**
 * Dünya ilerlemesi: oyuncunun bugüne kadar öldürdüğü toplam canavar.
 *
 * Tek turda 1000 canavar öldürmek beklenmez; sayaç turlar arasında birikir ve
 * tarayıcıda saklanır. Eşik dolunca ikinci dünya kalıcı olarak açılır.
 *
 * Depolama kapalıysa (gizli sekme) sessizce sıfırdan sayar — oyun yine oynanır,
 * yalnız ilerleme saklanmaz.
 */

import { readScore, writeScore } from '../../../shared/safeStorage.ts'
import { DUNYALAR, DUNYA_ESIGI } from '../config/constants.ts'

const ANAHTAR = 'kalesavunmasi:toplam-oldurulen'

/**
 * Dalga rekoru: dünya ve zorluk başına ulaşılan en ileri dalga.
 *
 * Skor tablosu tek bir sayı tutuyor; "kaçıncı dalgaya kadar dayandım" ise
 * oyuncunun asıl kovaladığı şey. Cihazda saklanıyor, sunucuya gitmiyor.
 */
export function dalgaRekoru(dunya: number, zorluk: number): number {
  return readScore(`kalesavunmasi:rekor:${dunya}:${zorluk}`)
}

/** Rekoru günceller; yeni rekorsa true döner. */
export function dalgaRekoruYaz(dunya: number, zorluk: number, dalga: number): boolean {
  if (dalga <= dalgaRekoru(dunya, zorluk)) return false
  writeScore(`kalesavunmasi:rekor:${dunya}:${zorluk}`, dalga)
  return true
}

export function toplamOldurulen(): number {
  return readScore(ANAHTAR)
}

/** Tur içinde öldürülenleri toplama ekler; yeni toplamı döner. */
export function oldurulenEkle(adet: number): number {
  if (adet <= 0) return toplamOldurulen()
  const yeni = toplamOldurulen() + adet
  writeScore(ANAHTAR, yeni)
  return yeni
}

/** Bu toplamla kaç dünya açık? En az 1. */
export function acikDunyaSayisi(toplam = toplamOldurulen()): number {
  const acilan = 1 + Math.floor(toplam / DUNYA_ESIGI)
  return Math.min(DUNYALAR.length, Math.max(1, acilan))
}

export function dunyaAcikMi(sira: number, toplam = toplamOldurulen()): boolean {
  return sira < acikDunyaSayisi(toplam)
}

/**
 * Belirli bir dünyanın açılmasına kaç canavar kaldı; zaten açıksa 0.
 *
 * `sonrakiDunyayaKalan` yalnız bir sonrakini söylüyor; üç dünya olunca kilitli
 * son dünyanın etiketinde de o sayı yazıyor ve yanlış oluyordu.
 */
export function dunyayaKalan(sira: number, toplam = toplamOldurulen()): number {
  return Math.max(0, sira * DUNYA_ESIGI - toplam)
}

/** Bir sonraki dünyaya kaç canavar kaldı; hepsi açıksa null. */
export function sonrakiDunyayaKalan(toplam = toplamOldurulen()): number | null {
  if (acikDunyaSayisi(toplam) >= DUNYALAR.length) return null
  return Math.max(0, acikDunyaSayisi(toplam) * DUNYA_ESIGI - toplam)
}

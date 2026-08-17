/**
 * Kule yuvaları ve tuval içindeki dükkân.
 *
 * Yuvaya dokununca kulenin üstünde küçük bir kutu açılır; parası yetmeyen
 * seçenek soluk ve pasif durur. Dokunuş sınaması elle yapılır (Phaser'ın
 * interaktif nesneleri yerine): sahne aynı dokunuşla mızrak atmasın diye
 * `dokun()` tıklamayı yiyip yediğini bildirir.
 *
 * Kutu açıkken kulenin menzili yol üzerinde şeffaf bir bantla gösterilir —
 * oyuncu neyi kapsadığını satın almadan önce görür.
 */

import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon, parca } from '../../../shared/Gorsel.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KALE_GENISLIK,
  KULE_BOY,
  KULE_EN,
  KULE_MAX_SEVIYE,
  KULE_TABAN_Y,
  KULE_TIPLERI,
  KULE_YUVALARI,
  MENU_ALT_PAY,
  MENU_BASLIK_BOY,
  MENU_EN,
  MENU_SATIR_BOY,
  YOL_UST_Y,
  YUVA_BOY,
  YUVA_EN,
} from '../config/constants.ts'
import type { Kule } from '../systems/KaleSavunmasi.ts'

interface Kutu {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface Dugme extends Kutu {
  tip: number
  alinabilir: boolean
  eylem: 'al' | 'yukselt'
}

/** Fiyat etiketindeki altın parasının yarıçapı. */
const PARA_R = 5

const icinde = (kutu: Kutu, x: number, y: number): boolean =>
  x >= kutu.x1 && x <= kutu.x2 && y >= kutu.y1 && y <= kutu.y2

export class KuleAlani {
  private readonly scene: Phaser.Scene
  private readonly kap: Phaser.GameObjects.Container
  private readonly menuKap: Phaser.GameObjects.Container
  private readonly menzilCizim: Phaser.GameObjects.Graphics
  private readonly satinAl: (yuva: number, tip: number) => void
  private readonly yukselt: (yuva: number) => void

  /** Açık kutunun yuvası; kapalıysa -1. */
  private secili = -1
  private dugmeler: Dugme[] = []
  private readonly yuvaKutulari: Kutu[] = []
  /** Boşuna yeniden çizmemek için son çizilen durumun imzası. */
  private imza = ''

  constructor(
    scene: Phaser.Scene,
    satinAl: (yuva: number, tip: number) => void,
    yukselt: (yuva: number) => void,
  ) {
    this.scene = scene
    this.satinAl = satinAl
    this.yukselt = yukselt
    this.menzilCizim = scene.add.graphics().setDepth(KATMAN.IZGARA)
    this.kap = scene.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.menuKap = scene.add.container(0, 0).setDepth(KATMAN.NISAN)

    // Dokunma alanları kulelerden geniş: parmakla da tutulsun.
    for (const x of KULE_YUVALARI) {
      this.yuvaKutulari.push({
        x1: x - KULE_EN / 2 - 10,
        y1: KULE_TABAN_Y - KULE_BOY - 10,
        x2: x + KULE_EN / 2 + 10,
        y2: KULE_TABAN_Y + YUVA_BOY,
      })
    }
  }

  /**
   * Dokunuşu değerlendirir. true dönerse dokunuş kule arayüzüne aitti;
   * sahne o dokunuşla mızrak atmamalı.
   */
  dokun(x: number, y: number, kuleler: (Kule | null)[], altin: number): boolean {
    if (this.secili >= 0) {
      for (const dugme of this.dugmeler) {
        if (!icinde(dugme, x, y)) continue
        if (dugme.alinabilir) {
          if (dugme.eylem === 'yukselt') this.yukselt(this.secili)
          else this.satinAl(this.secili, dugme.tip)
        }
        this.kapat()
        return true
      }
      // Kutunun dışına dokunmak kapatır.
      this.kapat()
      return true
    }

    for (let yuva = 0; yuva < this.yuvaKutulari.length; yuva++) {
      if (!icinde(this.yuvaKutulari[yuva], x, y)) continue
      this.secili = yuva
      this.ciz(kuleler, altin)
      return true
    }
    return false
  }

  kapat(): void {
    this.secili = -1
    this.dugmeler = []
    this.menuKap.removeAll(true)
    this.menzilCizim.clear()
    this.imza = ''
  }

  /** Yeni oyun: kuleler silinir, kutu kapanır. */
  sifirla(): void {
    this.kapat()
    this.kap.removeAll(true)
    this.imza = ''
  }

  tazele(kuleler: (Kule | null)[], altin: number): void {
    const yeni = kuleler.map((k) => (k ? `${k.tip}.${k.seviye}` : '-')).join(',') + `|${altin}|${this.secili}`
    if (yeni === this.imza) return
    this.imza = yeni
    this.ciz(kuleler, altin)
  }

  // --- Çizim ---

  private ciz(kuleler: (Kule | null)[], altin: number): void {
    this.kap.removeAll(true)
    this.menuKap.removeAll(true)
    this.menzilCizim.clear()
    this.dugmeler = []

    for (let yuva = 0; yuva < KULE_YUVALARI.length; yuva++) {
      const x = KULE_YUVALARI[yuva]
      const kule = kuleler[yuva]
      this.yuvaCiz(x, yuva === this.secili)
      if (kule) this.kuleCiz(x, kule)
      else this.bosYuvaCiz(x, altin)
    }

    if (this.secili >= 0) this.menuCiz(this.secili, kuleler, altin)
  }

  private yuvaCiz(x: number, secili: boolean): void {
    this.kap.add(
      this.scene.add.rectangle(x, KULE_TABAN_Y + YUVA_BOY / 2, YUVA_EN, YUVA_BOY, COLORS.YUVA_TAS).setRounded(3),
    )
    if (!secili) return
    this.kap.add(
      this.scene.add
        .rectangle(x, KULE_TABAN_Y + YUVA_BOY / 2, YUVA_EN + 5, YUVA_BOY + 5, 0x000000, 0)
        .setRounded(4)
        .setStrokeStyle(2, COLORS.YUVA_BOS, 0.9),
    )
  }

  /**
   * Fiyat etiketi: sayı + çizilmiş altın parası.
   *
   * Tuval yazısında emoji kullanmıyoruz — 🪙 gibi yeni emojiler her cihazda
   * yüklü değil, olmayan yerde gri kutu çıkıyor. Para şekille çizilince
   * her yerde aynı görünüyor.
   */
  private paraEtiketi(
    kap: Phaser.GameObjects.Container,
    x: number,
    y: number,
    metin: string,
    yaziRengi: string,
    boyut: string,
  ): void {
    const yazi = this.scene.add
      .text(x - PARA_R - 2, y, metin, { fontFamily: FONT_FAMILY, fontSize: boyut, color: yaziRengi })
      .setOrigin(0.5)
    const paraX = yazi.x + yazi.width / 2 + PARA_R + 3
    kap.add(yazi)
    kap.add(this.scene.add.circle(paraX, y, PARA_R, COLORS.ALTIN))
    kap.add(this.scene.add.circle(paraX, y, PARA_R * 0.5, COLORS.ALTIN_KENAR).setAlpha(0.45))
  }

  /** Boş yuva: kesikli çerçeve + fiyat. Parası yetiyorsa sarı, yoksa gri. */
  private bosYuvaCiz(x: number, altin: number): void {
    const fiyat = KULE_TIPLERI[0].fiyat[0]
    const yeter = altin >= fiyat
    const renk = yeter ? COLORS.YUVA_BOS : COLORS.MENU_PARA_YOK

    this.kap.add(
      this.scene.add
        .rectangle(x, KULE_TABAN_Y - KULE_BOY / 2, KULE_EN, KULE_BOY, 0x000000, 0)
        .setRounded(5)
        .setStrokeStyle(2, renk, yeter ? 0.85 : 0.5),
    )
    this.kap.add(
      this.scene.add
        .text(x, KULE_TABAN_Y - KULE_BOY / 2 - 7, '+', {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: yeter ? '#fef08a' : '#94a3b8',
        })
        .setOrigin(0.5),
    )
    this.paraEtiketi(this.kap, x, KULE_TABAN_Y - KULE_BOY / 2 + 13, String(fiyat), yeter ? '#fef08a' : '#94a3b8', '11px')
  }

  private kuleCiz(x: number, kule: Kule): void {
    const bilgi = KULE_TIPLERI[kule.tip]
    const govdeBoy = KULE_BOY * 0.72
    const govdeY = KULE_TABAN_Y - govdeBoy / 2

    this.kap.add(parca(this.scene, { x, y: govdeY, genislik: KULE_EN, yukseklik: govdeBoy, renk: bilgi.renk, radius: 5 }))
    // Mazgallı tepe + çatı
    for (let i = -1; i <= 1; i++) {
      this.kap.add(
        this.scene.add.rectangle(x + i * (KULE_EN / 3), KULE_TABAN_Y - govdeBoy - 3, KULE_EN / 4, 7, acikTon(bilgi.renk, 0.3)),
      )
    }
    this.kap.add(
      this.scene.add.triangle(x, KULE_TABAN_Y - govdeBoy - 8, -KULE_EN / 2, 0, 0, -13, KULE_EN / 2, 0, COLORS.KULE_CATI),
    )
    // Okçu: mazgalın arkasından görünen baş
    this.kap.add(this.scene.add.circle(x, KULE_TABAN_Y - govdeBoy - 1, 4, COLORS.MIZRAKCI_TEN))
    this.kap.add(
      this.scene.add
        .text(x, govdeY + govdeBoy / 2 - 9, `Lv${kule.seviye}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '10px',
          color: '#f8fafc',
        })
        .setOrigin(0.5),
    )
  }

  /**
   * Boş yuvada satın alma satırları, kurulu kulede yükseltme satırı çizilir.
   */
  private menuCiz(yuva: number, kuleler: (Kule | null)[], altin: number): void {
    const kule = kuleler[yuva]
    const yuvaX = KULE_YUVALARI[yuva]
    const satirlar = kule ? 1 : KULE_TIPLERI.length
    const boy = MENU_BASLIK_BOY + satirlar * MENU_SATIR_BOY + 8
    const alt = KULE_TABAN_Y - KULE_BOY - MENU_ALT_PAY
    const ust = alt - boy
    // Kutu ekran dışına taşmasın.
    const merkezX = Math.min(GAME_WIDTH - MENU_EN / 2 - 6, Math.max(MENU_EN / 2 + 6, yuvaX))

    this.menzilBandiCiz(yuvaX, kule)

    this.menuKap.add(
      this.scene.add
        .rectangle(merkezX, ust + boy / 2, MENU_EN, boy, COLORS.MENU_ARKA, 0.94)
        .setRounded(8)
        .setStrokeStyle(2, COLORS.MENU_KENAR, 0.8),
    )

    const baslikY = ust + MENU_BASLIK_BOY / 2 + 2
    const satirY = ust + MENU_BASLIK_BOY + MENU_SATIR_BOY / 2

    if (kule) {
      const bilgi = KULE_TIPLERI[kule.tip]
      this.menuKap.add(
        this.scene.add
          .text(merkezX, baslikY, `${bilgi.ad} · Lv${kule.seviye}/${KULE_MAX_SEVIYE}`, {
            fontFamily: FONT_FAMILY,
            fontSize: '12px',
            color: '#e2e8f0',
          })
          .setOrigin(0.5),
      )
      this.yukseltmeSatiri(merkezX, satirY, kule, altin)
      return
    }

    this.paraEtiketi(this.menuKap, merkezX, baslikY, `Kule kur · ${altin}`, '#e2e8f0', '12px')
    for (let tip = 0; tip < KULE_TIPLERI.length; tip++) {
      const bilgi = KULE_TIPLERI[tip]
      const y = ust + MENU_BASLIK_BOY + tip * MENU_SATIR_BOY + MENU_SATIR_BOY / 2
      const fiyat = bilgi.fiyat[0]
      const alinabilir = altin >= fiyat

      this.satirZemini(merkezX, y, alinabilir ? bilgi.renk : COLORS.MENU_PARA_YOK, alinabilir)
      this.paraEtiketi(this.menuKap, merkezX, y, `${bilgi.ad} · ${fiyat}`, alinabilir ? '#f8fafc' : '#cbd5e1', '11px')
      this.dugmeEkle(merkezX, y, tip, alinabilir, 'al')
    }
  }

  private yukseltmeSatiri(merkezX: number, y: number, kule: Kule, altin: number): void {
    const bilgi = KULE_TIPLERI[kule.tip]
    const enUst = kule.seviye >= KULE_MAX_SEVIYE
    const fiyat = enUst ? null : bilgi.fiyat[kule.seviye]
    const alinabilir = fiyat !== null && altin >= fiyat

    this.satirZemini(merkezX, y, alinabilir ? COLORS.YUKSELT : COLORS.MENU_PARA_YOK, alinabilir)
    if (fiyat === null) {
      this.menuKap.add(
        this.scene.add
          .text(merkezX, y, 'En üst seviye', { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#cbd5e1' })
          .setOrigin(0.5),
      )
    } else {
      this.paraEtiketi(this.menuKap, merkezX, y, `Yükselt Lv${kule.seviye + 1} · ${fiyat}`, alinabilir ? '#f8fafc' : '#cbd5e1', '11px')
    }
    this.dugmeEkle(merkezX, y, kule.tip, alinabilir, 'yukselt')
  }

  private satirZemini(merkezX: number, y: number, renk: number, canli: boolean): void {
    this.menuKap.add(
      this.scene.add
        .rectangle(merkezX, y, MENU_EN - 12, MENU_SATIR_BOY - 6, renk, canli ? 0.9 : 0.35)
        .setRounded(6),
    )
  }

  private dugmeEkle(merkezX: number, y: number, tip: number, alinabilir: boolean, eylem: 'al' | 'yukselt'): void {
    this.dugmeler.push({
      x1: merkezX - MENU_EN / 2,
      y1: y - MENU_SATIR_BOY / 2,
      x2: merkezX + MENU_EN / 2,
      y2: y + MENU_SATIR_BOY / 2,
      tip,
      alinabilir,
      eylem,
    })
  }

  /** Menzil: yol üzerinde şeffaf bant + kenar çizgileri. */
  private menzilBandiCiz(yuvaX: number, kule: Kule | null): void {
    const bilgi = KULE_TIPLERI[kule?.tip ?? 0]
    const menzil = bilgi.menzil[(kule?.seviye ?? 1) - 1]
    const sol = Math.max(KALE_GENISLIK, yuvaX - menzil)
    const sag = Math.min(GAME_WIDTH, yuvaX + menzil)

    this.menzilCizim.fillStyle(COLORS.MENZIL, 0.16)
    this.menzilCizim.fillRect(sol, YOL_UST_Y, sag - sol, GAME_HEIGHT - YOL_UST_Y)
    this.menzilCizim.lineStyle(2, koyuTon(COLORS.MENZIL, 0.1), 0.55)
    this.menzilCizim.lineBetween(sol, YOL_UST_Y, sol, GAME_HEIGHT)
    this.menzilCizim.lineBetween(sag, YOL_UST_Y, sag, GAME_HEIGHT)
  }
}

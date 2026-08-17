/**
 * Kale duvarı ve üstündeki mızrakçı.
 *
 * Duvar taş dokusuyla çizilir, mazgalları ve kapısı vardır; meşaleler titrer.
 * Mızrakçının kolu nişan açısını takip eder, elindeki mızrak atıştan sonra
 * bekleme dolana kadar görünmez — oyuncu ne zaman atabileceğini görsün.
 */

import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon, parca, top } from '../../../shared/Gorsel.ts'
import {
  CAN_BAR_AZ_ORAN,
  CAN_BAR_BOY,
  CAN_BAR_EN,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  KALE_GENISLIK,
  KALE_UST_Y,
  MESALE_MS,
  MIZRAK_BOY,
  MIZRAK_CIKIS_X,
  MIZRAK_CIKIS_Y,
  MIZRAK_KALINLIK,
} from '../config/constants.ts'

/** Mazgal ölçüleri. */
const MAZGAL_ADET = 4
const MAZGAL_BOY = 15
/** Mızrakçının ayak bastığı x. */
const MIZRAKCI_X = 72
const MESALE_Y = KALE_UST_Y + 46

export class KaleGorunumu {
  private readonly scene: Phaser.Scene
  private readonly kol: Phaser.GameObjects.Container
  private readonly elMizragi: Phaser.GameObjects.Container
  private readonly barDolu: Phaser.GameObjects.Rectangle
  private readonly barYazi: Phaser.GameObjects.Text
  private readonly alevler: Phaser.GameObjects.Arc[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const kap = scene.add.container(0, 0).setDepth(KATMAN.IZGARA)

    // --- Duvar ---
    const duvarBoy = GAME_HEIGHT - KALE_UST_Y
    kap.add(scene.add.rectangle(KALE_GENISLIK / 2, KALE_UST_Y + duvarBoy / 2, KALE_GENISLIK, duvarBoy, COLORS.KALE_TAS))
    // Sağ kenarda gölge: duvar hacimli görünsün.
    kap.add(
      scene.add
        .rectangle(KALE_GENISLIK - 4, KALE_UST_Y + duvarBoy / 2, 8, duvarBoy, COLORS.KALE_TAS_KOYU)
        .setAlpha(0.5),
    )

    const doku = scene.add.graphics()
    doku.lineStyle(1, COLORS.KALE_TAS_KOYU, 0.7)
    for (let y = KALE_UST_Y + 16; y < GAME_HEIGHT; y += 16) {
      doku.lineBetween(0, y, KALE_GENISLIK, y)
      // Dikey derzler sırayla kaysın: tuğla örgüsü çıksın.
      const kayma = ((y - KALE_UST_Y) / 16) % 2 === 0 ? 0 : 17
      for (let x = kayma; x < KALE_GENISLIK; x += 34) doku.lineBetween(x, y, x, y + 16)
    }
    kap.add(doku)

    // --- Mazgallar ---
    const mazgalEn = KALE_GENISLIK / (MAZGAL_ADET * 2 - 1)
    for (let i = 0; i < MAZGAL_ADET; i++) {
      kap.add(
        scene.add.rectangle(
          mazgalEn / 2 + i * mazgalEn * 2,
          KALE_UST_Y - MAZGAL_BOY / 2,
          mazgalEn,
          MAZGAL_BOY,
          COLORS.KALE_TAS_ACIK,
        ),
      )
    }

    // --- Kapı ---
    kap.add(
      scene.add
        .rectangle(KALE_GENISLIK / 2 - 6, GAME_HEIGHT - 26, 42, 62, COLORS.KALE_KAPI)
        .setRounded(19),
    )
    kap.add(
      scene.add
        .rectangle(KALE_GENISLIK / 2 - 6, GAME_HEIGHT - 26, 42, 62, 0x000000, 0)
        .setRounded(19)
        .setStrokeStyle(3, koyuTon(COLORS.KALE_TAS, 0.35)),
    )

    // --- Bayrak ---
    const direkUst = KALE_UST_Y - 58
    kap.add(scene.add.rectangle(20, direkUst + 24, 3, 48, COLORS.BAYRAK_DIREK))
    kap.add(scene.add.triangle(20, direkUst + 4, 0, -8, 26, 2, 0, 12, COLORS.BAYRAK))

    // --- Can barı (duvarın yüzünde) ---
    const barY = KALE_UST_Y + 26
    kap.add(scene.add.rectangle(KALE_GENISLIK / 2, barY, CAN_BAR_EN + 4, CAN_BAR_BOY + 4, COLORS.CAN_BAR_ARKA).setRounded(4))
    this.barDolu = scene.add
      .rectangle(KALE_GENISLIK / 2 - CAN_BAR_EN / 2, barY, CAN_BAR_EN, CAN_BAR_BOY, COLORS.CAN_BAR_DOLU)
      .setOrigin(0, 0.5)
      .setRounded(3)
    kap.add(this.barDolu)
    // Barın üstünde sayı: kaç can kaldığı barla birlikte okunsun.
    this.barYazi = scene.add
      .text(KALE_GENISLIK / 2, barY, '', { fontFamily: FONT_FAMILY, fontSize: '9px', color: '#f8fafc' })
      .setOrigin(0.5)
    kap.add(this.barYazi)

    // --- Meşaleler ---
    for (const x of [12, KALE_GENISLIK - 16]) {
      kap.add(scene.add.rectangle(x, MESALE_Y + 8, 3, 14, COLORS.MIZRAK_SAP))
      const parlama = scene.add.circle(x, MESALE_Y, 11, COLORS.MESALE).setAlpha(0.22)
      const alev = scene.add.circle(x, MESALE_Y, 4.5, acikTon(COLORS.MESALE, 0.3))
      kap.add(parlama)
      kap.add(alev)
      this.alevler.push(parlama, alev)
    }

    // --- Mızrakçı ---
    const tabanY = KALE_UST_Y - MAZGAL_BOY
    kap.add(parca(scene, { x: MIZRAKCI_X, y: tabanY - 13, genislik: 13, yukseklik: 22, renk: COLORS.MIZRAKCI }))
    kap.add(top(scene, MIZRAKCI_X, tabanY - 31, 6.5, COLORS.MIZRAKCI_TEN))

    // Kol + mızrak: nişan açısıyla döner, dönme noktası mızrağın çıktığı el.
    const kolGovde = scene.add
      .rectangle(0, 0, 15, 4, COLORS.MIZRAKCI_TEN)
      .setOrigin(1, 0.5)
      .setRounded(2)
    this.elMizragi = scene.add.container(0, 0, [
      scene.add.rectangle(0, 0, MIZRAK_BOY, MIZRAK_KALINLIK, COLORS.MIZRAK_SAP).setOrigin(0, 0.5),
      scene.add.triangle(MIZRAK_BOY, 0, 0, -4, 9, 0, 0, 4, COLORS.MIZRAK_UC),
    ])
    this.kol = scene.add.container(MIZRAK_CIKIS_X, MIZRAK_CIKIS_Y, [kolGovde, this.elMizragi])
    kap.add(this.kol)

    this.sifirla()
  }

  /** Meşale titremesi; yeni oyunda tweenler silindiği için yeniden kurulur. */
  sifirla(): void {
    for (const alev of this.alevler) {
      this.scene.tweens.killTweensOf(alev)
      this.scene.tweens.add({
        targets: alev,
        scale: 1.28,
        alpha: alev.alpha * 0.7,
        duration: MESALE_MS + Math.random() * 240,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  /** Kolu nişan açısına çevirir. */
  nisanAyarla(aci: number): void {
    this.kol.setAngle(aci)
  }

  /** Atış hazır değilse eldeki mızrak görünmez. */
  hazirGoster(hazir: boolean): void {
    this.elMizragi.setVisible(hazir)
  }

  canGoster(can: number, maxCan: number): void {
    const oran = Math.max(0, can) / maxCan
    this.barDolu.setDisplaySize(Math.max(1, CAN_BAR_EN * oran), CAN_BAR_BOY)
    this.barDolu.setFillStyle(oran < CAN_BAR_AZ_ORAN ? COLORS.CAN_BAR_AZ : COLORS.CAN_BAR_DOLU)
    this.barYazi.setText(`${Math.max(0, can)} / ${maxCan}`)
  }
}

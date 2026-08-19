/**
 * Tek bir canavarın görünümü ve animasyonu.
 *
 * Hazır çizim yok: gövde `Gorsel.parca()`, kafa `Gorsel.top()` ile hacimli
 * duruyor. Yürüme mantıktaki `faz` değerinden gelir (bacaklar makas, gövde
 * hafif zıplar, kollar sallanır); duvara varınca aynı faz vuruş hareketini
 * sürer. Böylece animasyon kare sayısına değil, canavarın gerçek hızına bağlı.
 */

import * as Phaser from 'phaser'

import { acikTon, koyuTon, parca, top } from '../../../shared/Gorsel.ts'
import {
  CANAVAR_BAR_BOY,
  COLORS,
  ELEMENT_RENGI,
  HASAR_PARLAMA_MS,
  KANAT_ACI,
  OLUM_EFEKT_MS,
  UCUS_SALINIM,
  canavarAyakY,
  type CanavarTipi,
} from '../config/constants.ts'
import type { Canavar } from '../systems/KaleSavunmasi.ts'

/** Yürürken bacak açısı (derece). */
const BACAK_ACI = 24
/** Yürürken kol açısı (derece). */
const KOL_ACI = 18
/** Gövdenin zıplama yüksekliği (piksel). */
const ZIPLAMA = 2.2
/** Vuruşta kolun savurma açısı (derece). */
const VURUS_ACI = 96

export class CanavarGorunumu {
  readonly kap: Phaser.GameObjects.Container

  private readonly scene: Phaser.Scene
  private readonly bilgi: CanavarTipi
  private readonly ust: Phaser.GameObjects.Container
  private readonly solBacak: Phaser.GameObjects.Rectangle
  private readonly sagBacak: Phaser.GameObjects.Rectangle
  private readonly arkaKol: Phaser.GameObjects.Rectangle
  private readonly onKol: Phaser.GameObjects.Container
  private readonly parlama: Phaser.GameObjects.Rectangle
  private readonly durumOrtusu: Phaser.GameObjects.Rectangle
  private readonly barArka: Phaser.GameObjects.Rectangle
  private readonly barDolu: Phaser.GameObjects.Rectangle
  /** Şef kalkanı çubuğu; şef olmayanlarda kurulmaz. */
  private readonly kalkanBar: Phaser.GameObjects.Rectangle | null
  private readonly barEn: number
  /** Ayak (uçanlarda gövde alt) hattı. */
  private readonly ayakY: number
  private readonly kanatlar: Phaser.GameObjects.Triangle[] = []

  constructor(scene: Phaser.Scene, canavar: Canavar, bilgi: CanavarTipi) {
    this.scene = scene
    // Tip bilgisi dışarıdan gelir: her dünyanın kendi canavar tablosu var.
    this.bilgi = bilgi
    this.ayakY = canavarAyakY(this.bilgi)
    const { en, boy, renk } = this.bilgi

    const kalcaY = -boy * 0.36
    const bacakBoy = boy * 0.36
    const omuzY = kalcaY - boy * 0.46
    const govdeY = kalcaY - boy * 0.26
    const kafaY = kalcaY - boy * 0.66
    const kafaR = boy * 0.19

    // Bacaklar kalçadan sarksın: origin üstte, dönüş oradan olur.
    this.solBacak = scene.add
      .rectangle(-en * 0.2, kalcaY, 5, bacakBoy, koyuTon(renk, 0.4))
      .setOrigin(0.5, 0)
      .setRounded(2)
    this.sagBacak = scene.add
      .rectangle(en * 0.2, kalcaY, 5, bacakBoy, koyuTon(renk, 0.25))
      .setOrigin(0.5, 0)
      .setRounded(2)

    const govde = parca(scene, { x: 0, y: govdeY, genislik: en, yukseklik: boy * 0.5, renk, radius: en * 0.3 })
    const kafa = top(scene, 0, kafaY, kafaR, acikTon(renk, 0.16))

    // Canavarlar sola yürür: gözler ve silah solda.
    const gozler = [
      scene.add.circle(-kafaR * 0.52, kafaY - kafaR * 0.12, kafaR * 0.24, 0xfff7ed),
      scene.add.circle(-kafaR * 0.52, kafaY - kafaR * 0.12, kafaR * 0.12, 0x111827),
    ]
    const boynuz = scene.add.triangle(
      kafaR * 0.55,
      kafaY - kafaR * 0.7,
      -kafaR * 0.22,
      kafaR * 0.4,
      0,
      -kafaR * 0.5,
      kafaR * 0.22,
      kafaR * 0.4,
      koyuTon(renk, 0.15),
    )

    this.arkaKol = scene.add
      .rectangle(en * 0.34, omuzY, 4, boy * 0.3, koyuTon(renk, 0.35))
      .setOrigin(0.5, 0)
      .setRounded(2)

    // Ön kol + sopa tek parça dönsün.
    const kolGovde = scene.add.rectangle(0, 0, 4, boy * 0.3, acikTon(renk, 0.1)).setOrigin(0.5, 0).setRounded(2)
    const sopa = scene.add.rectangle(0, boy * 0.3, boy * 0.24, 4, COLORS.MIZRAK_SAP).setOrigin(0.5, 0.5).setRounded(2)
    this.onKol = scene.add.container(-en * 0.34, omuzY, [kolGovde, sopa])

    // Vurulunca beyaz parlama: gövdeyi kısa süre kaplar.
    this.parlama = scene.add
      .rectangle(0, govdeY, en + 5, boy * 0.62, 0xffffff)
      .setRounded(en * 0.3)
      .setAlpha(0)

    // Alev/buz örtüsü: durum sürdükçe açık kalır.
    this.durumOrtusu = scene.add
      .rectangle(0, govdeY, en + 7, boy * 0.72, ELEMENT_RENGI.alev)
      .setRounded(en * 0.3)
      .setAlpha(0)

    this.barEn = en + 8
    const barY = kafaY - kafaR - 7
    this.barArka = scene.add.rectangle(0, barY, this.barEn, CANAVAR_BAR_BOY, COLORS.CAN_BAR_ARKA).setRounded(2)
    this.barDolu = scene.add
      .rectangle(-this.barEn / 2, barY, this.barEn, CANAVAR_BAR_BOY, COLORS.CAN_BAR_DOLU)
      .setOrigin(0, 0.5)
      .setRounded(2)
    // Şefin kalkanı can barının üstünde ayrı bir mavi şerit: kalkan dururken
    // canın neden düşmediği görünsün.
    this.kalkanBar = this.bilgi.patron
      ? scene.add
          .rectangle(-this.barEn / 2, barY - CANAVAR_BAR_BOY - 1, this.barEn, CANAVAR_BAR_BOY - 1, 0x38bdf8)
          .setOrigin(0, 0.5)
          .setRounded(2)
      : null


    const susler: Phaser.GameObjects.GameObject[] = []

    if (this.bilgi.zirh > 0) {
      // Zırh: göğüste plaka + omuz koruma; oka dayanıklı olduğu görünsün.
      susler.push(
        scene.add.rectangle(0, govdeY, en * 0.86, boy * 0.3, acikTon(COLORS.KALE_TAS_ACIK, 0.1)).setRounded(3),
        scene.add.rectangle(0, govdeY - boy * 0.1, en * 0.86, 2, koyuTon(COLORS.KALE_TAS, 0.3)),
        scene.add.circle(-en * 0.42, omuzY + 3, 5, COLORS.KALE_TAS_ACIK),
        scene.add.circle(en * 0.42, omuzY + 3, 5, COLORS.KALE_TAS),
      )
    }

    if (this.bilgi.patron) {
      // Şef tacı: üç altın diş
      for (const yon of [-1, 0, 1]) {
        susler.push(
          scene.add.triangle(yon * kafaR * 0.62, kafaY - kafaR * 0.92, -3, 6, 0, -7, 3, 6, COLORS.ALTIN),
        )
      }
    }

    if (this.bilgi.ucar) {
      // Kanatlar gövdenin arkasından çıkar, faz ile çırpar.
      for (const yon of [-1, 1]) {
        const kanat = scene.add
          .triangle(yon * en * 0.28, govdeY - boy * 0.1, 0, 0, yon * en * 0.7, -boy * 0.42, yon * en * 0.62, boy * 0.16, acikTon(renk, 0.25))
          .setAlpha(0.92)
        this.kanatlar.push(kanat)
      }
    }

    this.ust = scene.add.container(0, 0, [
      ...this.kanatlar,
      this.arkaKol,
      govde,
      ...susler,
      this.onKol,
      kafa,
      boynuz,
      ...gozler,
      this.durumOrtusu,
      this.parlama,
      this.barArka,
      this.barDolu,
      ...(this.kalkanBar ? [this.kalkanBar] : []),
    ])
    this.solBacak.setVisible(!this.bilgi.ucar)
    this.sagBacak.setVisible(!this.bilgi.ucar)
    this.kap = scene.add.container(canavar.x, this.ayakY, [this.solBacak, this.sagBacak, this.ust])
    this.guncelle(canavar)
  }

  guncelle(canavar: Canavar): void {
    this.kap.setX(canavar.x)
    const t = canavar.faz * Math.PI * 2
    const salinim = Math.sin(t)

    if (this.bilgi.ucar) {
      // Uçan: bacak yok, kanat çırpar, gövde havada salınır.
      for (let i = 0; i < this.kanatlar.length; i++) {
        this.kanatlar[i].setAngle(salinim * KANAT_ACI * (i === 0 ? 1 : -1))
      }
      this.kap.setY(this.ayakY + salinim * UCUS_SALINIM)
      this.onKol.setAngle(canavar.durum === 'vuruyor' ? -VURUS_ACI * Math.max(0, salinim) : salinim * KOL_ACI)
      this.canBariniTazele(canavar)
      return
    }

    if (canavar.durum === 'yuruyor') {
      this.solBacak.setAngle(salinim * BACAK_ACI)
      this.sagBacak.setAngle(-salinim * BACAK_ACI)
      this.arkaKol.setAngle(-salinim * KOL_ACI)
      this.onKol.setAngle(salinim * KOL_ACI)
      // Adım ortasında gövde yükselsin: iki adımda bir zıplama.
      this.ust.setY(-Math.abs(salinim) * ZIPLAMA)
    } else {
      this.solBacak.setAngle(0)
      this.sagBacak.setAngle(0)
      this.arkaKol.setAngle(0)
      // Sopa yukarı kalkıp duvara iner.
      this.onKol.setAngle(-VURUS_ACI * Math.max(0, Math.sin(t)))
      this.ust.setY(0)
    }

    this.canBariniTazele(canavar)
  }

  /** Yanıyorsa turuncu, donmuşsa mavi bir örtü: durum tahtadan okunsun. */
  private durumGoster(canavar: Canavar): void {
    if (canavar.yanmaKalan > 0) {
      this.durumOrtusu.setFillStyle(ELEMENT_RENGI.alev).setAlpha(0.34)
      return
    }
    if (canavar.yavaslikKalan > 0) {
      this.durumOrtusu.setFillStyle(ELEMENT_RENGI.buz).setAlpha(0.38)
      return
    }
    this.durumOrtusu.setAlpha(0)
  }

  /** Can barı her zaman görünür: oyuncu hangi canavarın ne kadar kaldığını görsün. */
  private canBariniTazele(canavar: Canavar): void {
    this.durumGoster(canavar)
    const oran = Math.max(0, canavar.can) / canavar.maxCan
    this.barDolu.setDisplaySize(Math.max(1, this.barEn * oran), CANAVAR_BAR_BOY)
    this.barDolu.setFillStyle(oran < 0.4 ? COLORS.CAN_BAR_AZ : COLORS.CAN_BAR_DOLU)
    if (!this.kalkanBar) return
    const kalkanOran = canavar.maxKalkan > 0 ? Math.max(0, canavar.kalkan) / canavar.maxKalkan : 0
    this.kalkanBar.setVisible(kalkanOran > 0)
    this.kalkanBar.setDisplaySize(Math.max(1, this.barEn * kalkanOran), CANAVAR_BAR_BOY - 1)
  }

  /** İsabet: beyaz parlama + hafif geri sekme. */
  hasarGoster(): void {
    this.parlama.setAlpha(0.8)
    this.scene.tweens.add({ targets: this.parlama, alpha: 0, duration: HASAR_PARLAMA_MS })
    this.scene.tweens.add({
      targets: this.ust,
      x: 4,
      duration: HASAR_PARLAMA_MS / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    })
  }

  /** Ölüm: devrilip solar, sonra kendini siler. */
  oldur(): void {
    this.scene.tweens.killTweensOf(this.ust)
    this.scene.tweens.add({
      targets: this.kap,
      angle: -78,
      alpha: 0,
      y: this.ayakY + 5,
      duration: OLUM_EFEKT_MS,
      ease: 'Quad.easeIn',
      onComplete: () => this.yok(),
    })
  }

  yok(): void {
    this.scene.tweens.killTweensOf(this.kap)
    this.scene.tweens.killTweensOf(this.ust)
    this.kap.destroy()
  }
}

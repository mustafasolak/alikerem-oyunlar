/**
 * Kale Savunması arka planı — tek bir görsel dosya kullanmadan, şekillerle.
 *
 * Katmanlar uzaktan yakına: gökyüzü geçişi, ay/güneş, dağ silueti, tepeler,
 * ağaçlar, çim şeridi, toprak yol. Yerleşim bir kez hesaplanır; vakit
 * değişince (gündüz → akşam → gece) yalnız renkler yeniden çizilir, dağlar
 * yerinden oynamaz.
 *
 * Kare başına iş neredeyse yok: yalnız bulutlar kaydırılır, ağaç sallanması ve
 * yıldız titremesi tweenlerle döner.
 */

import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon } from '../../../shared/Gorsel.ts'
import {
  AGAC_SALLANMA_ACI,
  AGAC_SALLANMA_MS,
  BULUT_ADET,
  BULUT_HIZ,
  CIM_UST_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  GOK_BANT,
  KALE_GENISLIK,
  TEPE_Y,
  UFUK_Y,
  VAKITLER,
  YILDIZ_ADET,
  YOL_UST_Y,
  renkKaristir,
  vakitIndeksi,
} from '../config/constants.ts'

interface Dag {
  x: number
  en: number
  boy: number
  on: boolean
}

interface Agac {
  x: number
  boy: number
  on: boolean
}

interface Bulut {
  x: number
  y: number
  olcek: number
}

/** Bulut ekranın bu kadar solunda kaybolunca sağdan yeniden girer. */
const BULUT_TASMA = 90
const ISIK_X = GAME_WIDTH * 0.78
const ISIK_Y = 62
const ISIK_R = 20

export class ArkaPlan {
  private readonly scene: Phaser.Scene
  private readonly kap: Phaser.GameObjects.Container
  /** Yerleşim bir kez üretilir, vakit değişince aynı yerlere yeniden çizilir. */
  private readonly daglar: Dag[] = []
  private readonly tepeler: { x: number; r: number }[] = []
  private readonly agaclar: Agac[] = []
  private readonly yildizlar: { x: number; y: number; r: number }[] = []
  private readonly taslar: { x: number; y: number; r: number }[] = []
  private readonly bulutlar: Bulut[] = []
  private bulutGorunumleri: Phaser.GameObjects.Container[] = []
  private vakit = -1

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.kap = scene.add.container(0, 0).setDepth(KATMAN.ARKA)
    this.yerlesimUret()
  }

  /**
   * Yeni oyun: baştan çizer. Sahne yeniden başlarken bütün tweenler
   * siliniyor, o yüzden ağaç sallanması ve yıldız titremesi burada kurulur.
   */
  sifirla(dalga: number): void {
    this.vakteGecir(vakitIndeksi(dalga))
  }

  /** Dalgaya göre vakti seçer; değiştiyse arka planı yeniden çizer. */
  vakitGuncelle(dalga: number): void {
    const hedef = vakitIndeksi(dalga)
    if (hedef !== this.vakit) this.vakteGecir(hedef)
  }

  guncelle(delta: number): void {
    const yol = (BULUT_HIZ * delta) / 1000
    for (let i = 0; i < this.bulutlar.length; i++) {
      const bulut = this.bulutlar[i]
      bulut.x -= yol
      if (bulut.x < -BULUT_TASMA) bulut.x = GAME_WIDTH + BULUT_TASMA
      this.bulutGorunumleri[i]?.setX(bulut.x)
    }
  }

  // --- Yerleşim ---

  private yerlesimUret(): void {
    const rastgele = (): number => Math.random()

    for (let i = 0; i < 7; i++) {
      this.daglar.push({
        x: i * (GAME_WIDTH / 6) + rastgele() * 30 - 15,
        en: 90 + rastgele() * 70,
        boy: 52 + rastgele() * 46,
        on: i % 2 === 1,
      })
    }

    for (let i = 0; i < 5; i++) {
      this.tepeler.push({ x: i * (GAME_WIDTH / 4) + rastgele() * 40 - 20, r: 54 + rastgele() * 34 })
    }

    // Ağaçlar kalenin sağında dursun; duvarı kapatmasın.
    for (let i = 0; i < 9; i++) {
      const on = i % 2 === 0
      this.agaclar.push({
        x: KALE_GENISLIK + 28 + i * ((GAME_WIDTH - KALE_GENISLIK - 40) / 8) + rastgele() * 16 - 8,
        boy: on ? 40 + rastgele() * 18 : 28 + rastgele() * 14,
        on,
      })
    }

    for (let i = 0; i < YILDIZ_ADET; i++) {
      this.yildizlar.push({
        x: rastgele() * GAME_WIDTH,
        y: rastgele() * (UFUK_Y - 20),
        r: 0.8 + rastgele() * 1.1,
      })
    }

    for (let i = 0; i < 14; i++) {
      this.taslar.push({
        x: rastgele() * GAME_WIDTH,
        y: YOL_UST_Y + 6 + rastgele() * (GAME_HEIGHT - YOL_UST_Y - 12),
        r: 1.6 + rastgele() * 2.6,
      })
    }

    for (let i = 0; i < BULUT_ADET; i++) {
      this.bulutlar.push({
        x: rastgele() * GAME_WIDTH,
        y: 28 + rastgele() * 66,
        olcek: 0.7 + rastgele() * 0.6,
      })
    }
  }

  // --- Çizim ---

  private vakteGecir(index: number): void {
    this.vakit = index
    const p = paletSec(index)

    this.scene.tweens.killTweensOf(this.kap.list)
    this.kap.removeAll(true)
    this.bulutGorunumleri = []

    this.gokCiz(p.gokUst, p.gokAlt)
    if (p.yildizli) this.yildizCiz(p.isik)
    this.isikCiz(p.isik)
    this.dagCiz(p.dag, p.dagOn)
    this.tepeCiz(p.tepe)
    this.agacCiz(p.agacArka, p.agacOn)
    this.zeminCiz(p.cim, p.yol, p.yolCizgi, p.tas)
    this.bulutCiz(p.gokAlt)
  }

  private gokCiz(ust: number, alt: number): void {
    const bantBoy = CIM_UST_Y / GOK_BANT
    for (let i = 0; i < GOK_BANT; i++) {
      const renk = renkKaristir(ust, alt, i / (GOK_BANT - 1))
      // Bantlar birbirine binsin: aradan çizgi görünmesin.
      this.kap.add(
        this.scene.add.rectangle(GAME_WIDTH / 2, i * bantBoy + bantBoy / 2, GAME_WIDTH, bantBoy + 1, renk),
      )
    }
  }

  private yildizCiz(renk: number): void {
    for (const yildiz of this.yildizlar) {
      const nokta = this.scene.add.circle(yildiz.x, yildiz.y, yildiz.r, renk).setAlpha(0.35 + Math.random() * 0.5)
      this.kap.add(nokta)
      this.scene.tweens.add({
        targets: nokta,
        alpha: 0.15,
        duration: 900 + Math.random() * 1400,
        delay: Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private isikCiz(renk: number): void {
    this.kap.add(this.scene.add.circle(ISIK_X, ISIK_Y, ISIK_R * 2.1, renk).setAlpha(0.16))
    this.kap.add(this.scene.add.circle(ISIK_X, ISIK_Y, ISIK_R * 1.5, renk).setAlpha(0.24))
    this.kap.add(this.scene.add.circle(ISIK_X, ISIK_Y, ISIK_R, acikTon(renk, 0.35)))
  }

  private dagCiz(uzak: number, yakin: number): void {
    for (const dag of this.daglar) {
      const renk = dag.on ? yakin : uzak
      this.kap.add(
        this.scene.add.triangle(dag.x, UFUK_Y, -dag.en / 2, 0, 0, -dag.boy, dag.en / 2, 0, renk),
      )
      // Zirvede kar/ışık lekesi
      this.kap.add(
        this.scene.add
          .triangle(dag.x, UFUK_Y - dag.boy * 0.62, -dag.en * 0.16, 0, 0, -dag.boy * 0.38, dag.en * 0.16, 0, acikTon(renk, 0.4))
          .setAlpha(0.8),
      )
    }
  }

  private tepeCiz(renk: number): void {
    for (const tepe of this.tepeler) {
      // Dairenin alt yarısı zeminin altında kalır; üstü yumuşak tepe olur.
      this.kap.add(this.scene.add.circle(tepe.x, TEPE_Y + tepe.r * 0.62, tepe.r, renk))
    }
  }

  private agacCiz(arka: number, on: number): void {
    for (const agac of this.agaclar) {
      const renk = agac.on ? on : arka
      const taban = agac.on ? CIM_UST_Y + 10 : TEPE_Y + 2
      const govde = this.scene.add.rectangle(0, -agac.boy * 0.12, 4, agac.boy * 0.34, koyuTon(renk, 0.45))
      const alt = this.scene.add.triangle(0, -agac.boy * 0.3, -agac.boy * 0.3, 0, 0, -agac.boy * 0.44, agac.boy * 0.3, 0, renk)
      const ust = this.scene.add.triangle(
        0,
        -agac.boy * 0.58,
        -agac.boy * 0.22,
        0,
        0,
        -agac.boy * 0.42,
        agac.boy * 0.22,
        0,
        acikTon(renk, 0.12),
      )

      const kap = this.scene.add.container(agac.x, taban, [govde, alt, ust])
      this.kap.add(kap)
      // Rüzgâr: tepeden hafif salınım
      this.scene.tweens.add({
        targets: kap,
        angle: agac.on ? AGAC_SALLANMA_ACI : AGAC_SALLANMA_ACI * 0.6,
        duration: AGAC_SALLANMA_MS + Math.random() * 700,
        delay: Math.random() * 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private zeminCiz(cim: number, yol: number, cizgi: number, tas: number): void {
    const cimBoy = YOL_UST_Y - CIM_UST_Y
    this.kap.add(
      this.scene.add.rectangle(GAME_WIDTH / 2, CIM_UST_Y + cimBoy / 2, GAME_WIDTH, cimBoy, cim),
    )
    const yolBoy = GAME_HEIGHT - YOL_UST_Y
    this.kap.add(this.scene.add.rectangle(GAME_WIDTH / 2, YOL_UST_Y + yolBoy / 2, GAME_WIDTH, yolBoy, yol))

    // Yol dokusu: yatay kesik çizgiler
    const cizim = this.scene.add.graphics()
    cizim.lineStyle(2, cizgi, 0.5)
    for (let sira = 0; sira < 3; sira++) {
      const y = YOL_UST_Y + 14 + sira * 20
      for (let x = (sira % 2) * 26; x < GAME_WIDTH; x += 52) {
        cizim.lineBetween(x, y, x + 30, y)
      }
    }
    this.kap.add(cizim)

    for (const nokta of this.taslar) {
      this.kap.add(this.scene.add.circle(nokta.x, nokta.y, nokta.r, tas).setAlpha(0.75))
    }
  }

  private bulutCiz(renk: number): void {
    const beyaz = acikTon(renk, 0.72)
    for (const bulut of this.bulutlar) {
      const parcalar = [
        this.scene.add.circle(-16, 4, 13, beyaz),
        this.scene.add.circle(0, -3, 17, beyaz),
        this.scene.add.circle(17, 5, 12, beyaz),
        this.scene.add.circle(2, 8, 14, beyaz),
      ]
      const kap = this.scene.add.container(bulut.x, bulut.y, parcalar).setAlpha(0.6).setScale(bulut.olcek)
      this.kap.add(kap)
      this.bulutGorunumleri.push(kap)
    }
  }
}

/** Vakit dizisi taşarsa son paletle devam eder. */
function paletSec(index: number): (typeof VAKITLER)[number] {
  return VAKITLER[Math.min(VAKITLER.length - 1, Math.max(0, index))]
}

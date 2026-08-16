import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  ARAC_RENKLERI,
  BOARD_PADDING,
  BOLUMLER,
  BOYUT,
  CIKIS_SATIR,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HEDEF_RENK,
  KAYMA_SURESI,
  skorHesapla,
} from '../config/constants.ts'
import { RushHour, type Arac } from '../systems/RushHour.ts'

export class GameScene extends TemelSahne {
  private oyun!: RushHour
  private bolum = 0
  private zeminKatmani!: Phaser.GameObjects.Container
  private aracKatmani!: Phaser.GameObjects.Container
  private hucreBoyu = 0
  private secili = -1

  constructor() {
    super('arabacikar')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / BOYUT)

    // Katmanlar açıkça sıralanır: park zemini arkada, araçlar önde.
    this.zeminKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.aracKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)

    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < BOYUT; t++) {
        this.zeminKatmani.add(
          this.add
            .rectangle(this.x(t), this.y(s), this.hucreBoyu - 4, this.hucreBoyu - 4,
              (s + t) % 2 === 0 ? COLORS.ZEMIN : COLORS.ZEMIN_ALT)
            .setRounded(6),
        )
      }
    }

    // Çıkış: sağ kenarda sarı ağız + ok
    const cikisX = this.x(BOYUT - 1) + this.hucreBoyu * 0.5
    const cikisY = this.y(CIKIS_SATIR)
    this.zeminKatmani.add(
      this.add.rectangle(cikisX + 6, cikisY, 14, this.hucreBoyu * 0.8, COLORS.CIKIS).setRounded(4),
    )
    this.zeminKatmani.add(
      this.add.triangle(cikisX + 24, cikisY, 0, -10, 12, 0, 0, 10, COLORS.CIKIS),
    )

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new RushHour(BOLUMLER[this.bolum])
    this.secili = -1
    setChip('level', this.bolum + 1)
    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  protected override yenidenBasla(): void {
    this.bolum = 0
    super.yenidenBasla()
  }

  private x(t: number): number {
    return BOARD_PADDING + t * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(s: number): number {
    return BOARD_PADDING + s * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.floor((p.worldX - BOARD_PADDING) / this.hucreBoyu)
    const s = Math.floor((p.worldY - BOARD_PADDING) / this.hucreBoyu)
    if (s < 0 || s >= BOYUT || t < 0 || t >= BOYUT) return
    this.sayac.basla()

    const index = this.oyun.hucredekiArac(s, t)

    if (this.secili < 0) {
      if (index < 0) return
      this.secili = index
      sesler.tik()
      this.ciz()
      return
    }

    const arac = this.oyun.araclar[this.secili]
    const adim = arac.yatay ? Math.sign(t - arac.sutun) : Math.sign(s - arac.satir)
    if (adim === 0 || index === this.secili) {
      this.secili = index === this.secili ? -1 : index
      this.ciz()
      return
    }

    if (!this.oyun.kaydir(this.secili, adim)) {
      sesler.yanlis()
      return
    }
    sesler.kaydir()
    setChip('moves', this.oyun.hamle)
    this.ciz()

    if (this.oyun.bitti) this.bolumBitti()
  }

  private bolumBitti(): void {
    sesler.dogru()
    const skor = skorHesapla(this.bolum + 1, this.oyun.hamle)
    if (this.bolum < BOLUMLER.length - 1) {
      this.skorGoster(skor)
      this.time.delayedCall(KAYMA_SURESI + 300, () => {
        this.bolum++
        this.oyun = new RushHour(BOLUMLER[this.bolum])
        this.secili = -1
        setChip('level', this.bolum + 1)
        setChip('moves', 0)
        this.ciz()
      })
      return
    }
    this.turuBitir({
      baslik: 'Bütün bölümleri bitirdin! 🎉',
      ozet: `${BOLUMLER.length} bölüm · son bölüm ${this.oyun.hamle} hamle · Skor: ${skor}`,
      skor,
    })
  }

  /** Gövde + cam + tekerlek + far: yukarıdan bakılan araç. */
  private aracCiz(arac: Arac, renk: number, secili: boolean): Phaser.GameObjects.Container {
    const uzun = arac.uzunluk * this.hucreBoyu - 10
    const kisa = this.hucreBoyu - 14
    const g = arac.yatay ? uzun : kisa
    const h = arac.yatay ? kisa : uzun

    const parcalar: Phaser.GameObjects.GameObject[] = []

    // Tekerlekler gövdenin altında, uçlara yakın
    const tekerU = arac.yatay ? uzun * 0.16 : kisa * 0.5
    const tekerK = arac.yatay ? kisa * 0.5 : uzun * 0.16
    const tekerG = arac.yatay ? tekerU : tekerK
    const tekerH = arac.yatay ? tekerK : tekerU
    for (const yon of [-1, 1]) {
      const tx = arac.yatay ? (uzun / 2 - tekerU / 2) * yon : 0
      const ty = arac.yatay ? 0 : (uzun / 2 - tekerU / 2) * yon
      parcalar.push(
        this.add
          .rectangle(tx, ty, arac.yatay ? tekerG : g + 6, arac.yatay ? h + 6 : tekerH, COLORS.TEKER)
          .setRounded(4),
      )
    }

    // Gövde
    parcalar.push(this.add.rectangle(0, 0, g, h, renk).setRounded(Math.min(g, h) * 0.3))
    // Üst parlama
    parcalar.push(
      this.add
        .rectangle(arac.yatay ? 0 : -g * 0.26, arac.yatay ? -h * 0.28 : 0,
          arac.yatay ? g * 0.9 : g * 0.22, arac.yatay ? h * 0.22 : h * 0.9, acikTon(renk, 0.4))
        .setRounded(4)
        .setAlpha(0.7),
    )
    // Ön ve arka cam
    for (const yon of [-1, 1]) {
      const cx = arac.yatay ? (g * 0.26) * yon : 0
      const cy = arac.yatay ? 0 : (h * 0.26) * yon
      parcalar.push(
        this.add
          .rectangle(cx, cy, arac.yatay ? g * 0.2 : g * 0.62, arac.yatay ? h * 0.62 : h * 0.2, COLORS.CAM)
          .setRounded(3)
          .setAlpha(0.85),
      )
    }
    // Tavan çizgisi (koyu)
    parcalar.push(
      this.add
        .rectangle(0, 0, arac.yatay ? g * 0.06 : g * 0.7, arac.yatay ? h * 0.7 : h * 0.06, koyuTon(renk, 0.25))
        .setAlpha(0.5),
    )

    const merkezX = this.x(arac.sutun) + (arac.yatay ? ((arac.uzunluk - 1) * this.hucreBoyu) / 2 : 0)
    const merkezY = this.y(arac.satir) + (arac.yatay ? 0 : ((arac.uzunluk - 1) * this.hucreBoyu) / 2)
    const kap = this.add.container(merkezX, merkezY, parcalar)

    if (secili) {
      kap.add(
        this.add
          .rectangle(0, 0, g + 8, h + 8, 0x000000, 0)
          .setStrokeStyle(3, COLORS.SECILI)
          .setRounded(Math.min(g, h) * 0.3),
      )
    }
    return kap
  }

  private ciz(): void {
    this.aracKatmani.removeAll(true)
    this.oyun.araclar.forEach((arac, i) => {
      const renk = i === 0 ? HEDEF_RENK : ARAC_RENKLERI[(i - 1) % ARAC_RENKLERI.length]
      this.aracKatmani.add(this.aracCiz(arac, renk, this.secili === i))
    })
  }
}

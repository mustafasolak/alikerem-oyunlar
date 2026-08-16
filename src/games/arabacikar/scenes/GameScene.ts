import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOLUMLER,
  BOYUT,
  CIKIS_SATIR,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAYMA_SURESI,
  skorHesapla,
} from '../config/constants.ts'
import { RushHour } from '../systems/RushHour.ts'

export class GameScene extends TemelSahne {
  private oyun!: RushHour
  private bolum = 0
  private katman!: Phaser.GameObjects.Container
  private hucreBoyu = 0
  private secili = -1

  constructor() {
    super('arabacikar')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / BOYUT)
    this.katman = this.add.container(0, 0)

    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < BOYUT; t++) {
        this.add.rectangle(this.x(t), this.y(s), this.hucreBoyu - 4, this.hucreBoyu - 4, COLORS.ZEMIN).setRounded(6)
      }
    }
    // Çıkış işareti
    this.add
      .rectangle(this.x(BOYUT - 1) + this.hucreBoyu * 0.55, this.y(CIKIS_SATIR), 8, this.hucreBoyu * 0.7, COLORS.CIKIS)
      .setRounded(3)

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
    // Seçili aracın ekseninde, dokunulan yöne göre kaydır
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

  private ciz(): void {
    this.katman.removeAll(true)
    this.oyun.araclar.forEach((arac, i) => {
      const hedefMi = i === 0
      const genislik = (arac.yatay ? arac.uzunluk : 1) * this.hucreBoyu - 8
      const yukseklik = (arac.yatay ? 1 : arac.uzunluk) * this.hucreBoyu - 8
      const cx = this.x(arac.sutun) + (arac.yatay ? ((arac.uzunluk - 1) * this.hucreBoyu) / 2 : 0)
      const cy = this.y(arac.satir) + (arac.yatay ? 0 : ((arac.uzunluk - 1) * this.hucreBoyu) / 2)

      const renk = hedefMi ? COLORS.HEDEF_ARAC : arac.uzunluk > 2 ? COLORS.ARAC : COLORS.ARAC_ALT
      const kutu = this.add.rectangle(cx, cy, genislik, yukseklik, renk).setRounded(8)
      if (this.secili === i) kutu.setStrokeStyle(3, COLORS.SECILI)
      this.katman.add(kutu)
    })
  }
}

import * as Phaser from 'phaser'

import { parca } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  EL_HUCRE,
  EL_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUCRE,
  PARCA_RENKLERI,
  TAHTA_UST,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Pentomino } from '../systems/Pentomino.ts'

export class GameScene extends TemelSahne {
  private oyun!: Pentomino
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private secili = -1

  constructor() {
    super('pentomino')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const a = ZORLUKLAR[this.zorluk]
    this.oyun = new Pentomino(a.sutun, a.satir, a.parca, PARCA_RENKLERI)
    this.secili = -1
    setChip('remaining', this.oyun.kalanParca)
    this.skorGoster(0)
    this.ciz()
  }

  private tahtaSolX(): number {
    return (GAME_WIDTH - this.oyun.sutun * HUCRE) / 2
  }

  private x(t: number): number {
    return this.tahtaSolX() + t * HUCRE + HUCRE / 2
  }

  private y(s: number): number {
    return TAHTA_UST + s * HUCRE + HUCRE / 2
  }

  private elX(i: number): number {
    const adet = this.oyun.parcalar.length
    return (GAME_WIDTH / (adet + 1)) * (i + 1)
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (p.worldY > EL_Y - 70) {
      for (let i = 0; i < this.oyun.parcalar.length; i++) {
        if (this.oyun.parcalar[i].yerlesti) continue
        if (Math.abs(p.worldX - this.elX(i)) > 45) continue
        if (this.secili === i) {
          this.oyun.dondur(i)
          sesler.kaydir()
        } else this.secili = i
        sesler.tik()
        this.ciz()
        return
      }
      return
    }

    if (this.secili < 0) return
    const t = Math.floor((p.worldX - this.tahtaSolX()) / HUCRE)
    const s = Math.floor((p.worldY - TAHTA_UST) / HUCRE)
    if (!this.oyun.koy(this.secili, s, t)) {
      sesler.yanlis()
      return
    }

    sesler.dogru()
    this.secili = -1
    setChip('remaining', this.oyun.kalanParca)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Kutuyu doldurdun! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    for (let s = 0; s < this.oyun.satir; s++) {
      for (let t = 0; t < this.oyun.sutun; t++) {
        const deger = this.oyun.tahta[this.oyun.index(s, t)]
        this.katman.add(
          this.add.rectangle(this.x(t), this.y(s), HUCRE - 4, HUCRE - 4, deger === -1 ? COLORS.BOS : deger).setRounded(6),
        )
      }
    }

    this.oyun.parcalar.forEach((parcaSekli, i) => {
      if (parcaSekli.yerlesti) return
      const merkezX = this.elX(i)
      const enS = Math.max(...parcaSekli.hucreler.map(([s]) => s)) + 1
      const enT = Math.max(...parcaSekli.hucreler.map(([, t]) => t)) + 1
      const bx = merkezX - (enT * EL_HUCRE) / 2
      const by = EL_Y - (enS * EL_HUCRE) / 2

      if (this.secili === i) {
        this.katman.add(
          this.add
            .rectangle(merkezX, EL_Y, enT * EL_HUCRE + 14, enS * EL_HUCRE + 14, 0x000000, 0)
            .setStrokeStyle(3, COLORS.SECILI_CERCEVE)
            .setRounded(8),
        )
      }
      for (const [ds, dt] of parcaSekli.hucreler) {
        this.katman.add(
          parca(this, {
            x: bx + dt * EL_HUCRE + EL_HUCRE / 2,
            y: by + ds * EL_HUCRE + EL_HUCRE / 2,
            genislik: EL_HUCRE - 3,
            yukseklik: EL_HUCRE - 3,
            renk: parcaSekli.renk,
            radius: 4,
          }),
        )
      }
    })
  }
}

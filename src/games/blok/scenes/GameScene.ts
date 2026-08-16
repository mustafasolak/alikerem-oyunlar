import * as Phaser from 'phaser'

import { parca } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  BOARD_PADDING,
  BOYUT,
  COLORS,
  ELDEKI_HUCRE,
  ELDEKI_Y,
  EL_SAYISI,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUCRE,
  TAHTA_UST,
} from '../config/constants.ts'
import { BlokOyunu } from '../systems/BlokOyunu.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new BlokOyunu()
  private katman!: Phaser.GameObjects.Container
  private secili = -1

  constructor() {
    super('blok')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.secili = -1
    setChip('cleared', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private x(t: number): number {
    return BOARD_PADDING + t * HUCRE + HUCRE / 2
  }

  private y(s: number): number {
    return TAHTA_UST + s * HUCRE + HUCRE / 2
  }

  private elX(i: number): number {
    return (GAME_WIDTH / (EL_SAYISI + 1)) * (i + 1)
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    // Alt şeritte parça seçimi
    if (p.worldY > ELDEKI_Y - 60) {
      for (let i = 0; i < EL_SAYISI; i++) {
        if (Math.abs(p.worldX - this.elX(i)) < 70 && !this.oyun.el[i].kullanildi) {
          this.secili = this.secili === i ? -1 : i
          sesler.tik()
          this.ciz()
          return
        }
      }
      return
    }

    if (this.secili < 0) return
    const t = Math.floor((p.worldX - BOARD_PADDING) / HUCRE)
    const s = Math.floor((p.worldY - TAHTA_UST) / HUCRE)
    if (s < 0 || s >= BOYUT || t < 0 || t >= BOYUT) return

    const sonuc = this.oyun.koy(this.secili, s, t)
    if (!sonuc.kondu) {
      sesler.yanlis()
      return
    }

    const temizlenen = sonuc.temizlenenSatir + sonuc.temizlenenSutun
    if (temizlenen > 0) {
      sesler.satir(Math.min(4, temizlenen))
      this.hud.showGain(sonuc.puan)
    } else sesler.tik()

    this.secili = -1
    setChip('cleared', this.oyun.temizlenen)
    this.skorGoster(this.oyun.skor)
    this.ciz()

    if (!this.oyun.hamleVarMi) {
      this.turuBitir({
        baslik: 'Yer kalmadı',
        ozet: `${this.oyun.temizlenen} sıra temizledin · Skor: ${this.oyun.skor}`,
        skor: this.oyun.skor,
        kazandi: false,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < BOYUT; t++) {
        const deger = this.oyun.tahta[this.oyun.index(s, t)]
        if (deger === -1) {
          this.katman.add(this.add.rectangle(this.x(t), this.y(s), HUCRE - 4, HUCRE - 4, COLORS.BOS).setRounded(6))
        } else {
          this.katman.add(
            parca(this, { x: this.x(t), y: this.y(s), genislik: HUCRE - 4, yukseklik: HUCRE - 4, renk: deger, radius: 6 }),
          )
        }
      }
    }

    this.oyun.el.forEach((parcaSekli, i) => {
      if (parcaSekli.kullanildi) return
      const merkezX = this.elX(i)
      const enSatir = Math.max(...parcaSekli.hucreler.map(([s]) => s)) + 1
      const enSutun = Math.max(...parcaSekli.hucreler.map(([, t]) => t)) + 1
      const bx = merkezX - (enSutun * ELDEKI_HUCRE) / 2
      const by = ELDEKI_Y - (enSatir * ELDEKI_HUCRE) / 2

      if (this.secili === i) {
        this.katman.add(
          this.add
            .rectangle(merkezX, ELDEKI_Y, enSutun * ELDEKI_HUCRE + 16, enSatir * ELDEKI_HUCRE + 16, 0x000000, 0)
            .setStrokeStyle(3, COLORS.SECILI_CERCEVE)
            .setRounded(8),
        )
      }
      for (const [ds, dt] of parcaSekli.hucreler) {
        this.katman.add(
          parca(this, {
            x: bx + dt * ELDEKI_HUCRE + ELDEKI_HUCRE / 2,
            y: by + ds * ELDEKI_HUCRE + ELDEKI_HUCRE / 2,
            genislik: ELDEKI_HUCRE - 3,
            yukseklik: ELDEKI_HUCRE - 3,
            renk: parcaSekli.renk,
            radius: 4,
          }),
        )
      }
    })
  }
}

import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  EL_Y,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  NOKTA_R,
  TAS_GENISLIK,
  TAS_YUKSEKLIK,
  ZINCIR_Y,
  skorHesapla,
} from '../config/constants.ts'
import { DominoOyunu, type Tas } from '../systems/DominoOyunu.ts'

/** Domino noktalarının hücre içi konumları (0-6). */
const NOKTALAR: [number, number][][] = [
  [],
  [[0.5, 0.5]],
  [[0.28, 0.28], [0.72, 0.72]],
  [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]],
]

export class GameScene extends TemelSahne {
  private readonly oyun = new DominoOyunu()
  private katman!: Phaser.GameObjects.Container
  private konan = 0

  constructor() {
    super('domino')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.konan = 0
    setChip('hand', this.oyun.el.length)
    this.skorGoster(0)
    this.ciz()
  }

  private elX(i: number): number {
    const adet = this.oyun.el.length
    const genislik = Math.min(TAS_GENISLIK + 8, (GAME_WIDTH - 30) / Math.max(1, adet))
    return 15 + genislik * i + genislik / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (Math.abs(p.worldY - EL_Y) < TAS_YUKSEKLIK) {
      const adet = this.oyun.el.length
      const genislik = Math.min(TAS_GENISLIK + 8, (GAME_WIDTH - 30) / Math.max(1, adet))
      const i = Math.floor((p.worldX - 15) / genislik)
      if (i < 0 || i >= adet) return
      this.oyun.sec(i)
      sesler.tik()
      this.ciz()
      return
    }

    // Zincir alanına dokunmak seçili taşı oynatır
    if (this.oyun.secili < 0) return
    const uc = this.oyun.oyna()
    if (!uc) {
      sesler.yanlis()
      return
    }

    this.konan++
    sesler.kaydir()
    setChip('hand', this.oyun.el.length)
    this.skorGoster(this.konan * 120)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.konan, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Zinciri tamamladın! 🎉',
        ozet: `${this.konan} taş · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    } else if (!this.oyun.hamleVarMi) {
      this.turuBitir({
        baslik: 'Oynanacak taş kalmadı',
        ozet: `${this.konan} taş koydun, elinde ${this.oyun.el.length} taş kaldı.`,
        skor: this.konan * 60,
        kazandi: false,
      })
    }
  }

  private tasCiz(x: number, y: number, tas: Tas, secili: boolean, dikey: boolean): void {
    const g = dikey ? TAS_YUKSEKLIK : TAS_GENISLIK
    const h = dikey ? TAS_GENISLIK : TAS_YUKSEKLIK
    this.katman.add(
      this.add.rectangle(x, y, g, h, secili ? COLORS.TAS_SECILI : COLORS.TAS).setRounded(5).setStrokeStyle(1, 0x92400e),
    )
    const yariG = dikey ? g : g / 2
    const yariH = dikey ? h / 2 : h

    const nokta = (deger: number, merkezX: number, merkezY: number) => {
      for (const [nx, ny] of NOKTALAR[Math.max(0, Math.min(6, deger))]) {
        this.katman.add(
          this.add.circle(merkezX + (nx - 0.5) * yariG * 0.9, merkezY + (ny - 0.5) * yariH * 0.9, NOKTA_R, COLORS.NOKTA),
        )
      }
    }
    if (dikey) {
      nokta(tas.a, x, y - h / 4)
      nokta(tas.b, x, y + h / 4)
    } else {
      nokta(tas.a, x - g / 4, y)
      nokta(tas.b, x + g / 4, y)
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, 60, `Uçlar:  ${this.oyun.solUc}  …  ${this.oyun.sagUc}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          fontStyle: 'bold',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5),
    )

    // Zincir: sığdırmak için sarmalı diziyoruz
    const adet = this.oyun.zincir.length
    const satirBasi = Math.max(1, Math.floor((GAME_WIDTH - 30) / (TAS_GENISLIK + 6)))
    this.oyun.zincir.forEach((tas, i) => {
      const satir = Math.floor(i / satirBasi)
      const sutun = i % satirBasi
      const x = 15 + sutun * (TAS_GENISLIK + 6) + TAS_GENISLIK / 2
      const y = ZINCIR_Y + satir * (TAS_YUKSEKLIK + 8)
      this.tasCiz(x, y, tas, false, false)
    })
    void adet

    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, EL_Y - 55, 'Elindekiler', {
          fontFamily: FONT_FAMILY,
          fontSize: '15px',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5)
        .setAlpha(0.7),
    )
    this.oyun.el.forEach((tas, i) => {
      const uygun = this.oyun.uygunUc(tas) !== null
      this.tasCiz(this.elX(i), EL_Y, tas, this.oyun.secili === i, false)
      if (!uygun) {
        this.katman.add(
          this.add.rectangle(this.elX(i), EL_Y, TAS_GENISLIK, TAS_YUKSEKLIK, 0x000000, 0.35).setRounded(5),
        )
      }
    })
  }
}

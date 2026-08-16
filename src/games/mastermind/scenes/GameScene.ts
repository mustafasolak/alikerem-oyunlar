import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  IPUCU_ARALIK,
  IPUCU_SOL,
  IPUCU_YARICAP,
  MAX_DENEME,
  ONAY_X,
  PALET_Y,
  PALET_YARICAP,
  RENK_SAYISI,
  SATIR_YUKSEKLIK,
  SIL_X,
  TAHTA_SOL,
  TAHTA_UST,
  TAS_ARALIK,
  TAS_RENKLERI,
  TAS_YARICAP,
  UZUNLUK,
  skorHesapla,
} from '../config/constants.ts'
import { Mastermind } from '../systems/Mastermind.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Mastermind()
  private taslak: number[] = []
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('mastermind')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.paletiCiz()
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    this.taslak = []
    setChip('tries', this.oyun.kalanHak)
    this.skorGoster(0)
    this.ciz()
  }

  private satirY(index: number): number {
    return TAHTA_UST + index * SATIR_YUKSEKLIK + SATIR_YUKSEKLIK / 2
  }

  private paletiCiz(): void {
    const genislik = (GAME_WIDTH - 80) / RENK_SAYISI
    for (let i = 0; i < RENK_SAYISI; i++) {
      const x = 40 + genislik * i + genislik / 2
      this.add.circle(x, PALET_Y, PALET_YARICAP, TAS_RENKLERI[i]).setStrokeStyle(2, 0xffffff, 0.25)
    }
    this.add
      .text(ONAY_X, PALET_Y - 46, 'Dene', {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: COLORS.YAZI,
      })
      .setOrigin(0.5)
    this.add
      .text(SIL_X, PALET_Y - 46, 'Sil', { fontFamily: FONT_FAMILY, fontSize: '17px', color: COLORS.YAZI })
      .setOrigin(0.5)
  }

  private paletIndex(x: number): number {
    const genislik = (GAME_WIDTH - 80) / RENK_SAYISI
    const index = Math.floor((x - 40) / genislik)
    return index >= 0 && index < RENK_SAYISI ? index : -1
  }

  private dokun(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const { worldX: x, worldY: y } = pointer

    if (y > PALET_Y - PALET_YARICAP - 6) {
      const renk = this.paletIndex(x)
      if (renk >= 0 && this.taslak.length < UZUNLUK) {
        this.taslak.push(renk)
        sesler.tik()
        this.ciz()
      }
      return
    }

    // "Dene" ve "Sil" yazılarının bulunduğu şerit
    if (y > PALET_Y - 64 && y < PALET_Y - 28) {
      if (Math.abs(x - SIL_X) < 60) {
        this.taslak.pop()
        sesler.tik()
        this.ciz()
      } else if (Math.abs(x - ONAY_X) < 60) {
        this.denemeyiGonder()
      }
    }
  }

  private denemeyiGonder(): void {
    if (this.taslak.length !== UZUNLUK) {
      sesler.yanlis()
      return
    }
    const satir = this.oyun.dene(this.taslak)
    if (!satir) return

    this.sayac.basla()
    this.taslak = []
    setChip('tries', this.oyun.kalanHak)
    this.ciz()

    if (this.oyun.durum === 'kazandi') {
      sesler.dogru()
      const skor = skorHesapla(this.oyun.denemeSayisi)
      this.turuBitir({
        baslik: 'Şifreyi çözdün! 🎉',
        ozet: `${this.oyun.denemeSayisi} denemede bildin · Skor: ${skor}`,
        skor,
      })
    } else if (this.oyun.durum === 'kaybetti') {
      const dizi = this.oyun.gizli.map((r) => r + 1).join('-')
      this.turuBitir({ baslik: 'Hakkın bitti', ozet: `Gizli dizi: ${dizi}`, skor: 0, kazandi: false })
    } else {
      sesler.tik()
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    for (let i = 0; i < MAX_DENEME; i++) {
      const y = this.satirY(i)
      const aktif = i === this.oyun.satirlar.length
      this.katman.add(
        this.add
          .rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 24, SATIR_YUKSEKLIK - 6, COLORS.SATIR, aktif ? 1 : 0.65)
          .setRounded(8),
      )

      const satir = this.oyun.satirlar[i]
      const tahmin = satir ? satir.tahmin : aktif ? this.taslak : []

      for (let t = 0; t < UZUNLUK; t++) {
        const x = TAHTA_SOL + t * TAS_ARALIK
        const renk = tahmin[t]
        const tas =
          renk === undefined
            ? this.add.circle(x, y, TAS_YARICAP, 0x000000, 0.25).setStrokeStyle(2, 0xffffff, 0.15)
            : this.add.circle(x, y, TAS_YARICAP, TAS_RENKLERI[renk])
        this.katman.add(tas)
      }

      if (!satir) continue
      // İpucu noktaları: dolu beyaz = tam, koyu = renk var yeri yanlış
      for (let n = 0; n < UZUNLUK; n++) {
        const ix = IPUCU_SOL + (n % 2) * IPUCU_ARALIK
        const iy = y - IPUCU_ARALIK / 2 + Math.floor(n / 2) * IPUCU_ARALIK
        const renk = n < satir.sonuc.tam ? COLORS.TAM : n < satir.sonuc.tam + satir.sonuc.yakin ? COLORS.YAKIN : 0x000000
        const alpha = n < satir.sonuc.tam + satir.sonuc.yakin ? 1 : 0.25
        this.katman.add(this.add.circle(ix, iy, IPUCU_YARICAP, renk, alpha))
      }
    }
  }
}

import * as Phaser from 'phaser'

import { KATMAN, parca, top } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { UcluEslestirme, type Konum } from '../../../shared/motorlar/UcluEslestirme.ts'
import {
  BASLANGIC_HAMLE,
  BOARD_PADDING,
  BOYUT,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HEDEF_PUAN,
  PATLAMA_SURESI,
  RENK_SAYISI,
  TAS_RENKLERI,
  YUVARLAK,
  skorHesapla,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: UcluEslestirme
  private zeminKatmani!: Phaser.GameObjects.Container
  private tasKatmani!: Phaser.GameObjects.Container
  private hucreBoyu = 0
  private ofsetX = 0
  private ofsetY = 0
  private secili: Konum | null = null
  private kalanHamle = BASLANGIC_HAMLE

  constructor() {
    super('match3')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)

    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / BOYUT)
    this.ofsetX = (GAME_WIDTH - BOYUT * this.hucreBoyu) / 2
    this.ofsetY = (GAME_HEIGHT - BOYUT * this.hucreBoyu) / 2

    this.zeminKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.tasKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)
    for (let s = 0; s < BOYUT; s++) {
      for (let t = 0; t < BOYUT; t++) {
        this.zeminKatmani.add(
          this.add
            .rectangle(this.x(t), this.y(s), this.hucreBoyu - 4, this.hucreBoyu - 4, COLORS.HUCRE_ZEMIN)
            .setRounded(8),
        )
      }
    }

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new UcluEslestirme(BOYUT, RENK_SAYISI)
    this.secili = null
    this.kalanHamle = BASLANGIC_HAMLE

    setChip('moves', this.kalanHamle)
    setChip('target', HEDEF_PUAN)
    this.skorGoster(0)
    this.ciz()
  }

  private x(t: number): number {
    return this.ofsetX + t * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(s: number): number {
    return this.ofsetY + s * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const sutun = Math.floor((p.worldX - this.ofsetX) / this.hucreBoyu)
    const satir = Math.floor((p.worldY - this.ofsetY) / this.hucreBoyu)
    if (satir < 0 || satir >= BOYUT || sutun < 0 || sutun >= BOYUT) return
    const hucre = { satir, sutun }
    this.sayac.basla()

    if (!this.secili) {
      this.secili = hucre
      sesler.tik()
      this.ciz()
      return
    }
    if (this.secili.satir === hucre.satir && this.secili.sutun === hucre.sutun) {
      this.secili = null
      this.ciz()
      return
    }

    const sonuc = this.oyun.takas(this.secili, hucre)
    this.secili = null

    if (!sonuc.gecerli) {
      sesler.yanlis()
      this.ciz()
      return
    }

    this.kalanHamle--
    sesler.satir(Math.min(4, sonuc.turlar.length))
    this.hud.showGain(sonuc.kazanilanPuan)
    setChip('moves', this.kalanHamle)
    this.skorGoster(this.oyun.skor)
    this.ciz()

    // Hamle kalmadıysa ya da hedef aşıldıysa tur biter
    this.time.delayedCall(PATLAMA_SURESI, () => {
      if (this.oyun.skor >= HEDEF_PUAN) {
        const skor = skorHesapla(this.oyun.skor, this.kalanHamle)
        this.turuBitir({
          baslik: 'Hedefi geçtin! 🎉',
          ozet: `${this.oyun.skor} puan · ${this.kalanHamle} hamle kaldı · Skor: ${skor}`,
          skor,
        })
      } else if (this.kalanHamle <= 0) {
        this.turuBitir({
          baslik: 'Hamlen bitti',
          ozet: `${this.oyun.skor} puan · hedef ${HEDEF_PUAN}`,
          skor: this.oyun.skor,
          kazandi: false,
        })
      } else if (!this.oyun.hamleVarMi()) {
        // Oynanacak takas kalmadıysa tahtayı tazele
        this.oyun.doldur()
        this.ciz()
      }
    })
  }

  private ciz(): void {
    this.tasKatmani.removeAll(true)
    for (let satir = 0; satir < BOYUT; satir++) {
      for (let sutun = 0; sutun < BOYUT; sutun++) {
        const renk = TAS_RENKLERI[this.oyun.tahta[satir * BOYUT + sutun] % TAS_RENKLERI.length]
        const secili = this.secili?.satir === satir && this.secili?.sutun === sutun
        const boyut = this.hucreBoyu - 10
        // Şeker teması yuvarlak, klasik tema köşeli taş
        const tas = YUVARLAK
          ? top(this, this.x(sutun), this.y(satir), boyut / 2, renk)
          : parca(this, { x: this.x(sutun), y: this.y(satir), genislik: boyut, yukseklik: boyut, renk, radius: 9 })
        if (secili) {
          tas.setScale(0.85)
          tas.add(
            this.add
              .rectangle(0, 0, boyut + 8, boyut + 8, 0x000000, 0)
              .setStrokeStyle(4, COLORS.SECILI)
              .setRounded(YUVARLAK ? (boyut + 8) / 2 : 11),
          )
        }
        this.tasKatmani.add(tas)
      }
    }
  }
}

import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KENAR_ORAN,
  UZUN_BASMA_MS,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { Nonogram } from '../systems/Nonogram.ts'

export class GameScene extends TemelSahne {
  private oyun!: Nonogram
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private hucreler: Phaser.GameObjects.Rectangle[] = []
  private isaretler: Phaser.GameObjects.Text[] = []
  private hucreBoyu = 0
  private ofsetX = 0
  private ofsetY = 0
  private basmaTimer?: Phaser.Time.TimerEvent
  private uzunBasildi = false

  constructor() {
    super('nonogram')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.mouse?.disableContextMenu()
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.basildi(p))
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.birakildi(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new Nonogram(ayar.boyut, ayar.doluluk)

    this.katman.removeAll(true)
    this.hucreler = []
    this.isaretler = []

    // Kenar ipuçlarına ayrılan pay, ızgaranın bir kısmı kadar
    const kenar = Math.floor((GAME_WIDTH - 20) * KENAR_ORAN)
    this.hucreBoyu = Math.floor((GAME_WIDTH - 20 - kenar) / ayar.boyut)
    this.ofsetX = 10 + kenar
    this.ofsetY = 10 + kenar

    const yaziBoyu = Math.max(9, Math.round(this.hucreBoyu * 0.42))

    for (let s = 0; s < ayar.boyut; s++) {
      for (let t = 0; t < ayar.boyut; t++) {
        const x = this.ofsetX + t * this.hucreBoyu + this.hucreBoyu / 2
        const y = this.ofsetY + s * this.hucreBoyu + this.hucreBoyu / 2
        const kare = this.add.rectangle(x, y, this.hucreBoyu - 2, this.hucreBoyu - 2, COLORS.BOS).setRounded(3)
        const isaret = this.add
          .text(x, y, '', { fontFamily: FONT_FAMILY, fontSize: `${yaziBoyu}px`, color: COLORS.CARPI_YAZI })
          .setOrigin(0.5)
        this.katman.add([kare, isaret])
        this.hucreler.push(kare)
        this.isaretler.push(isaret)
      }
    }

    // İpucu yazıları
    for (let s = 0; s < ayar.boyut; s++) {
      const y = this.ofsetY + s * this.hucreBoyu + this.hucreBoyu / 2
      this.katman.add(
        this.add
          .text(this.ofsetX - 6, y, this.oyun.satirIpuclari[s].join(' '), {
            fontFamily: FONT_FAMILY,
            fontSize: `${yaziBoyu}px`,
            color: COLORS.IPUCU_YAZI,
          })
          .setOrigin(1, 0.5),
      )
    }
    for (let t = 0; t < ayar.boyut; t++) {
      const x = this.ofsetX + t * this.hucreBoyu + this.hucreBoyu / 2
      this.katman.add(
        this.add
          .text(x, this.ofsetY - 6, this.oyun.sutunIpuclari[t].join('\n'), {
            fontFamily: FONT_FAMILY,
            fontSize: `${yaziBoyu}px`,
            color: COLORS.IPUCU_YAZI,
            align: 'center',
          })
          .setOrigin(0.5, 1),
      )
    }

    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private indexBul(p: Phaser.Input.Pointer): number {
    const t = Math.floor((p.worldX - this.ofsetX) / this.hucreBoyu)
    const s = Math.floor((p.worldY - this.ofsetY) / this.hucreBoyu)
    if (s < 0 || s >= this.oyun.boyut || t < 0 || t >= this.oyun.boyut) return -1
    return this.oyun.index(s, t)
  }

  private basildi(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const index = this.indexBul(p)
    if (index < 0) return
    this.uzunBasildi = false

    if (p.rightButtonDown()) {
      this.uzunBasildi = true
      this.isaretKoy(index)
      return
    }
    // Dokunmatikte basılı tutmak çarpı koyar
    this.basmaTimer = this.time.delayedCall(UZUN_BASMA_MS, () => {
      this.uzunBasildi = true
      this.isaretKoy(index)
    })
  }

  private birakildi(p: Phaser.Input.Pointer): void {
    this.basmaTimer?.remove()
    this.basmaTimer = undefined
    if (this.bitti || this.uzunBasildi) return
    const index = this.indexBul(p)
    if (index < 0) return

    const sonuc = this.oyun.boya(index)
    if (sonuc === 'yok') return
    this.sayac.basla()
    if (sonuc === 'dogru') sesler.tik()
    else {
      sesler.yanlis()
      this.cameras.main.shake(120, 0.005)
    }
    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hata, this.sayac.saniye)
      this.turuBitir({
        baslik: 'Resmi çıkardın! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hata} hata · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
      })
    }
  }

  private isaretKoy(index: number): void {
    if (!this.oyun.isaretle(index)) return
    this.sayac.basla()
    sesler.tik()
    this.ciz()
  }

  private ciz(): void {
    for (let i = 0; i < this.oyun.toplam; i++) {
      const durum = this.oyun.tahta[i]
      this.hucreler[i].setFillStyle(durum === 'dolu' ? COLORS.DOLU : COLORS.BOS)
      this.isaretler[i].setText(durum === 'carpi' ? '✕' : '')
    }
  }
}

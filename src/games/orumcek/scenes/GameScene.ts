import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { kartYazisi, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import {
  ACIK_KAYMA,
  COLORS,
  DESTE_Y,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAPALI_KAYMA,
  KART_ARALIK,
  KART_GENISLIK,
  KART_YUKSEKLIK,
  SUTUN_SAYISI,
  SUTUN_UST,
  skorHesapla,
} from '../config/constants.ts'
import { Spider } from '../systems/Spider.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Spider()
  private katman!: Phaser.GameObjects.Container
  private secili: { sutun: number; kartIndex: number } | null = null

  constructor() {
    super('orumcek')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.dagit()
    this.secili = null
    setChip('done', '0/8')
    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private sutunX(i: number): number {
    const toplam = SUTUN_SAYISI * KART_GENISLIK + (SUTUN_SAYISI - 1) * KART_ARALIK
    return (GAME_WIDTH - toplam) / 2 + i * (KART_GENISLIK + KART_ARALIK) + KART_GENISLIK / 2
  }

  private kartY(sutun: number, kartIndex: number): number {
    let y = SUTUN_UST
    const kartlar = this.oyun.sutunlar[sutun]
    for (let i = 0; i < kartIndex; i++) y += kartlar[i].acik ? ACIK_KAYMA : KAPALI_KAYMA
    return y
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (p.worldY < SUTUN_UST - 10) {
      if (this.oyun.desteDagit()) {
        sesler.kaydir()
        this.sonrasi()
      } else sesler.yanlis()
      return
    }

    for (let i = 0; i < SUTUN_SAYISI; i++) {
      if (Math.abs(p.worldX - this.sutunX(i)) > KART_GENISLIK / 2) continue
      const sutun = this.oyun.sutunlar[i]

      if (this.secili) {
        if (!this.oyun.tasi(this.secili.sutun, this.secili.kartIndex, i)) sesler.yanlis()
        else sesler.kaydir()
        this.secili = null
        this.sonrasi()
        return
      }

      if (sutun.length === 0) return
      let kartIndex = sutun.length - 1
      for (let k = sutun.length - 1; k >= 0; k--) {
        if (p.worldY >= this.kartY(i, k)) {
          kartIndex = k
          break
        }
      }
      if (!this.oyun.tasinabilir(i, kartIndex)) {
        sesler.yanlis()
        return
      }
      this.secili = { sutun: i, kartIndex }
      sesler.tik()
      this.ciz()
      return
    }
  }

  private sonrasi(): void {
    setChip('done', `${this.oyun.tamamlanan}/8`)
    setChip('moves', this.oyun.hamle)
    this.skorGoster(skorHesapla(this.oyun.tamamlanan, this.oyun.hamle))
    this.ciz()
    if (this.oyun.bitti) {
      const skor = skorHesapla(8, this.oyun.hamle)
      this.turuBitir({ baslik: 'Sekiz diziyi de topladın! 🎉', ozet: `${this.oyun.hamle} hamle · Skor: ${skor}`, skor })
    }
  }

  private kartCiz(x: number, y: number, kart: Kart | null, secili = false): void {
    const kutu = this.add
      .rectangle(x, y + KART_YUKSEKLIK / 2, KART_GENISLIK, KART_YUKSEKLIK, !kart ? COLORS.BOS : kart.acik ? COLORS.KART : COLORS.KART_ARKA)
      .setRounded(5)
    if (secili) kutu.setStrokeStyle(3, COLORS.SECILI)
    this.katman.add(kutu)
    if (!kart || !kart.acik) return
    this.katman.add(
      this.add
        .text(x, y + KART_YUKSEKLIK / 2, kartYazisi(kart), {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          fontStyle: 'bold',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5),
    )
  }

  private ciz(): void {
    this.katman.removeAll(true)
    // Deste göstergesi
    this.katman.add(
      this.add
        .rectangle(this.sutunX(0), DESTE_Y + 16, KART_GENISLIK, 32, this.oyun.deste.length > 0 ? COLORS.KART_ARKA : COLORS.BOS)
        .setRounded(5),
    )
    this.katman.add(
      this.add
        .text(this.sutunX(0), DESTE_Y + 16, String(Math.floor(this.oyun.deste.length / SUTUN_SAYISI)), {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5),
    )

    for (let i = 0; i < SUTUN_SAYISI; i++) {
      const sutun = this.oyun.sutunlar[i]
      if (sutun.length === 0) {
        this.kartCiz(this.sutunX(i), SUTUN_UST, null)
        continue
      }
      sutun.forEach((kart, k) => {
        const secili = this.secili?.sutun === i && k >= this.secili.kartIndex
        this.kartCiz(this.sutunX(i), this.kartY(i, k), kart, secili)
      })
    }
  }
}

import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { kartYazisi, kirmiziMi, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KART_ARALIK,
  KART_GENISLIK,
  YAZI_KENAR,
  YAZI_UST,
  KART_YUKSEKLIK,
  KAYMA,
  SUTUN_SAYISI,
  SUTUN_UST,
  UST_SIRA_Y,
  skorHesapla,
} from '../config/constants.ts'
import { FreeCell, type Konum } from '../systems/FreeCell.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new FreeCell()
  private katman!: Phaser.GameObjects.Container
  private secili: { konum: Konum; kartIndex?: number } | null = null

  constructor() {
    super('freecell')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.dagit()
    this.secili = null
    setChip('foundation', '0/52')
    setChip('moves', 0)
    this.skorGoster(0)
    this.geriAlDugmesi(() => this.geriAl())
    this.ciz()
  }

  private sutunX(i: number): number {
    const toplam = SUTUN_SAYISI * KART_GENISLIK + (SUTUN_SAYISI - 1) * KART_ARALIK
    return (GAME_WIDTH - toplam) / 2 + i * (KART_GENISLIK + KART_ARALIK) + KART_GENISLIK / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (p.worldY < SUTUN_UST - 10) {
      for (let i = 0; i < 4; i++) {
        if (Math.abs(p.worldX - this.sutunX(i)) < KART_GENISLIK / 2) return this.hedef({ tur: 'hucre', index: i })
        if (Math.abs(p.worldX - this.sutunX(4 + i)) < KART_GENISLIK / 2) return this.hedef({ tur: 'temel', index: i })
      }
      return
    }

    for (let i = 0; i < SUTUN_SAYISI; i++) {
      if (Math.abs(p.worldX - this.sutunX(i)) > KART_GENISLIK / 2) continue
      this.hedef({ tur: 'sutun', index: i }, this.kartIndexBul(i, p.worldY))
      return
    }
  }

  /** Sütunda dokunulan kartın indeksi; kartlar KAYMA kadar üst üste biner. */
  private kartIndexBul(sutunIndex: number, y: number): number {
    const sutun = this.oyun.sutunlar[sutunIndex]
    if (sutun.length === 0) return 0
    const ham = Math.floor((y - SUTUN_UST) / KAYMA)
    return Math.min(Math.max(ham, 0), sutun.length - 1)
  }

  private hedef(konum: Konum, kartIndex?: number): void {
    if (!this.secili) {
      // Sıralı olmayan bir grup seçilemez; tek kart her zaman seçilebilir
      if (this.oyun.alinacak(konum, kartIndex)) {
        this.secili = { konum, kartIndex }
        sesler.tik()
        this.ciz()
      } else {
        sesler.yanlis()
      }
      return
    }

    // Aynı yere tekrar dokunmak temele göndermeyi dener
    if (this.secili.konum.tur === konum.tur && this.secili.konum.index === konum.index) {
      if (this.oyun.temeleGonder(konum)) sesler.dogru()
      this.secili = null
      this.sonrasi()
      return
    }

    if (!this.oyun.tasi(this.secili.konum, konum, this.secili.kartIndex)) {
      sesler.yanlis()
      this.secili = null
      this.ciz()
      return
    }
    sesler.kaydir()
    this.secili = null
    this.sonrasi()
  }

  /** Son hamleyi geri alır. Geri alma da bir hamle sayılır. */
  private geriAl(): void {
    if (this.bitti || !this.oyun.geriAlinabilir) return
    if (!this.oyun.geriAl()) return
    sesler.kaydir()
    this.secili = null
    this.sonrasi()
  }

  private sonrasi(): void {
    this.geriAlDurumu(this.oyun.geriAlinabilir)
    setChip('foundation', `${this.oyun.temeldekiKart}/52`)
    setChip('moves', this.oyun.hamle)
    this.skorGoster(skorHesapla(this.oyun.temeldekiKart, this.oyun.hamle))
    this.ciz()
    if (this.oyun.bitti) {
      const skor = skorHesapla(52, this.oyun.hamle)
      this.turuBitir({ baslik: 'FreeCell bitti! 🎉', ozet: `${this.oyun.hamle} hamle · Skor: ${skor}`, skor })
    }
  }

  private kartCiz(x: number, y: number, kart: Kart | null, secili = false): void {
    const kutu = this.add
      .rectangle(x, y + KART_YUKSEKLIK / 2, KART_GENISLIK, KART_YUKSEKLIK, kart ? COLORS.KART : COLORS.BOS)
      .setRounded(6)
    if (secili) kutu.setStrokeStyle(3, COLORS.SECILI)
    this.katman.add(kutu)
    if (!kart) return
    this.katman.add(
      this.add
        // Gerçek iskambil gibi sol üst köşe: kartlar üst üste binince de okunur
        .text(x - KART_GENISLIK / 2 + YAZI_KENAR, y + YAZI_UST, kartYazisi(kart), {
          fontFamily: FONT_FAMILY,
          fontSize: '17px',
          fontStyle: 'bold',
          color: kirmiziMi(kart.renk) ? COLORS.KIRMIZI : COLORS.SIYAH,
        })
        .setOrigin(0, 0.5),
    )
  }

  private ciz(): void {
    this.katman.removeAll(true)
    for (let i = 0; i < 4; i++) {
      this.kartCiz(this.sutunX(i), UST_SIRA_Y, this.oyun.hucreler[i], this.secili?.konum.tur === 'hucre' && this.secili.konum.index === i)
      this.kartCiz(this.sutunX(4 + i), UST_SIRA_Y, this.oyun.temeller[i].at(-1) ?? null)
    }
    for (let i = 0; i < SUTUN_SAYISI; i++) {
      const sutun = this.oyun.sutunlar[i]
      if (sutun.length === 0) {
        this.kartCiz(this.sutunX(i), SUTUN_UST, null, this.secili?.konum.tur === 'sutun' && this.secili.konum.index === i)
        continue
      }
      const seciliBas =
        this.secili?.konum.tur === 'sutun' && this.secili.konum.index === i
          ? (this.secili.kartIndex ?? sutun.length - 1)
          : -1
      sutun.forEach((kart, k) => {
        this.kartCiz(this.sutunX(i), SUTUN_UST + k * KAYMA, kart, seciliBas >= 0 && k >= seciliBas)
      })
    }
  }
}

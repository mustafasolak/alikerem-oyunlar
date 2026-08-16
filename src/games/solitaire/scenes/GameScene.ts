import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import { kartYazisi, kirmiziMi, type Kart } from '../../../shared/motorlar/Iskambil.ts'
import {
  ACIK_KAYMA,
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAPALI_KAYMA,
  KART_ARALIK,
  KART_GENISLIK,
  YAZI_KENAR,
  YAZI_UST,
  KART_YUKSEKLIK,
  SUTUN_SAYISI,
  SUTUN_UST,
  UST_SIRA_Y,
  skorHesapla,
} from '../config/constants.ts'
import { Klondike, type Konum } from '../systems/Klondike.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Klondike()
  private katman!: Phaser.GameObjects.Container
  private secili: { konum: Konum; kartIndex: number } | null = null

  constructor() {
    super('solitaire')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.dagit()
    this.secili = null
    setChip('foundation', `0/52`)
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

    // Üst sıra: deste, açılan, dört temel
    if (p.worldY < SUTUN_UST - 10) {
      if (Math.abs(p.worldX - this.sutunX(0)) < KART_GENISLIK / 2) {
        if (this.oyun.desteyiCevir()) {
          sesler.tik()
          this.secili = null
          this.sonrasi()
        }
        return
      }
      if (Math.abs(p.worldX - this.sutunX(1)) < KART_GENISLIK / 2) {
        this.sec({ tur: 'acik', index: 0 }, 0)
        return
      }
      for (let i = 0; i < 4; i++) {
        if (Math.abs(p.worldX - this.sutunX(3 + i)) < KART_GENISLIK / 2) {
          this.hedefeDokun({ tur: 'temel', index: i })
          return
        }
      }
      return
    }

    // Sütunlar
    for (let i = 0; i < SUTUN_SAYISI; i++) {
      if (Math.abs(p.worldX - this.sutunX(i)) > KART_GENISLIK / 2) continue
      const sutun = this.oyun.sutunlar[i]
      if (sutun.length === 0) {
        this.hedefeDokun({ tur: 'sutun', index: i })
        return
      }
      // Hangi karta dokunuldu?
      let kartIndex = sutun.length - 1
      for (let k = sutun.length - 1; k >= 0; k--) {
        if (p.worldY >= this.kartY(i, k)) {
          kartIndex = k
          break
        }
      }
      if (this.secili) this.hedefeDokun({ tur: 'sutun', index: i })
      else this.sec({ tur: 'sutun', index: i }, kartIndex)
      return
    }
  }

  private sec(konum: Konum, kartIndex: number): void {
    const kartlar = this.oyun.alinacak(konum, kartIndex)
    if (!kartlar) return
    // Aynı karta tekrar dokunmak temele göndermeyi dener
    if (this.secili && this.secili.konum.tur === konum.tur && this.secili.konum.index === konum.index) {
      if (this.oyun.temeleGonder(konum, kartIndex)) {
        sesler.dogru()
        this.secili = null
        this.sonrasi()
        return
      }
    }
    this.secili = { konum, kartIndex }
    sesler.tik()
    this.ciz()
  }

  private hedefeDokun(hedef: Konum): void {
    if (!this.secili) {
      if (hedef.tur === 'temel') this.sec(hedef, 0)
      return
    }
    if (!this.oyun.tasi(this.secili.konum, this.secili.kartIndex, hedef)) {
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
      this.turuBitir({ baslik: 'Solitaire bitti! 🎉', ozet: `${this.oyun.hamle} hamle · Skor: ${skor}`, skor })
    }
  }

  private kartY(sutun: number, kartIndex: number): number {
    let y = SUTUN_UST
    const kartlar = this.oyun.sutunlar[sutun]
    for (let i = 0; i < kartIndex; i++) y += kartlar[i].acik ? ACIK_KAYMA : KAPALI_KAYMA
    return y
  }

  private kartCiz(x: number, y: number, kart: Kart | null, secili = false): void {
    if (!kart) {
      this.katman.add(
        this.add.rectangle(x, y + KART_YUKSEKLIK / 2, KART_GENISLIK, KART_YUKSEKLIK, COLORS.BOS).setRounded(7),
      )
      return
    }
    const kutu = this.add
      .rectangle(x, y + KART_YUKSEKLIK / 2, KART_GENISLIK, KART_YUKSEKLIK, kart.acik ? COLORS.KART : COLORS.KART_ARKA)
      .setRounded(7)
    if (secili) kutu.setStrokeStyle(3, COLORS.SECILI)
    this.katman.add(kutu)

    if (!kart.acik) return
    this.katman.add(
      this.add
        // Gerçek iskambil gibi sol üst köşe: kartlar üst üste binince de okunur
        .text(x - KART_GENISLIK / 2 + YAZI_KENAR, y + YAZI_UST, kartYazisi(kart), {
          fontFamily: FONT_FAMILY,
          fontSize: '19px',
          fontStyle: 'bold',
          color: kirmiziMi(kart.renk) ? COLORS.KIRMIZI : COLORS.SIYAH,
        })
        .setOrigin(0, 0.5),
    )
  }

  private ciz(): void {
    this.katman.removeAll(true)

    this.kartCiz(this.sutunX(0), UST_SIRA_Y, this.oyun.deste.length > 0 ? { deger: 0, renk: 'maca', acik: false } : null)
    this.kartCiz(
      this.sutunX(1),
      UST_SIRA_Y,
      this.oyun.acik.at(-1) ?? null,
      this.secili?.konum.tur === 'acik',
    )
    for (let i = 0; i < 4; i++) {
      this.kartCiz(this.sutunX(3 + i), UST_SIRA_Y, this.oyun.temeller[i].at(-1) ?? null)
    }

    for (let i = 0; i < SUTUN_SAYISI; i++) {
      const sutun = this.oyun.sutunlar[i]
      if (sutun.length === 0) {
        this.kartCiz(this.sutunX(i), SUTUN_UST, null)
        continue
      }
      sutun.forEach((kart, k) => {
        const secili =
          this.secili?.konum.tur === 'sutun' && this.secili.konum.index === i && k >= this.secili.kartIndex
        this.kartCiz(this.sutunX(i), this.kartY(i, k), kart, secili)
      })
    }
  }
}

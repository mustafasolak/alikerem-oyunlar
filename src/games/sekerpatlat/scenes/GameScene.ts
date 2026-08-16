import * as Phaser from 'phaser'

import { KareIzgara, izgaraYerlesimi } from '../../../shared/KareIzgara.ts'
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
  private izgara?: KareIzgara
  private secili: Konum | null = null
  private kalanHamle = BASLANGIC_HAMLE

  constructor() {
    super('sekerpatlat')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new UcluEslestirme(BOYUT, RENK_SAYISI)
    this.secili = null
    this.kalanHamle = BASLANGIC_HAMLE

    this.izgara?.katman.destroy()
    const y = izgaraYerlesimi(GAME_WIDTH, GAME_HEIGHT, BOYUT, BOYUT, BOARD_PADDING)
    this.izgara = new KareIzgara(this, {
      sutun: BOYUT,
      satir: BOYUT,
      hucreBoyu: y.hucreBoyu,
      ofsetX: y.ofsetX,
      ofsetY: y.ofsetY,
      bosluk: 5,
      radius: YUVARLAK ? 999 : 8,
      zeminRenk: TAS_RENKLERI[0],
    })

    setChip('moves', this.kalanHamle)
    setChip('target', HEDEF_PUAN)
    this.skorGoster(0)
    this.ciz()
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti || !this.izgara) return
    const hucre = this.izgara.hucreBul(p)
    if (!hucre) return
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
    this.izgara?.uygula((view, satir, sutun, index) => {
      view.zemin.setFillStyle(TAS_RENKLERI[this.oyun.tahta[index] % TAS_RENKLERI.length])
      const secili = this.secili?.satir === satir && this.secili?.sutun === sutun
      view.zemin.setStrokeStyle(secili ? 4 : 0, COLORS.SECILI)
      view.zemin.setScale(secili ? 0.86 : 1)
    })
  }
}

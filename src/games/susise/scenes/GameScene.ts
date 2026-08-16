import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
// Renk ayırma mantığı üç oyunda ortak; motor Top Sıralama'da duruyor.
import { TopSirala } from '../../topsirala/systems/TopSirala.ts'
import {
  COLORS,
  GAME_WIDTH,
  KAP_ALT,
  KAP_GENISLIK,
  KAP_KENAR,
  PARCA_RENKLERI,
  PARCA_YUKSEKLIK,
  SECILI_YUKSEKLIK,
  TASIMA_SURESI,
  TEMA,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: TopSirala
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private kaplar: Phaser.GameObjects.Rectangle[] = []
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('susise')
  }

  protected kur(): void {
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new TopSirala(ayar.renkSayisi, ayar.kapasite, ayar.bosTup)

    for (const k of this.kaplar) k.destroy()
    this.kaplar = []

    const yukseklik = ayar.kapasite * PARCA_YUKSEKLIK + 14
    for (let i = 0; i < this.oyun.tupSayisi; i++) {
      this.kaplar.push(
        this.add
          .rectangle(this.kapX(i), KAP_ALT - yukseklik / 2, KAP_GENISLIK, yukseklik, COLORS.KAP)
          .setRounded(TEMA === 'su' ? KAP_GENISLIK / 3 : 8)
          .setStrokeStyle(KAP_KENAR, COLORS.KAP_KENAR, 0.9),
      )
    }

    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private kapX(i: number): number {
    return (GAME_WIDTH / (this.oyun.tupSayisi + 1)) * (i + 1)
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    let hedef = 0
    let enKisa = Infinity
    for (let i = 0; i < this.oyun.tupSayisi; i++) {
      const d = Math.abs(p.worldX - this.kapX(i))
      if (d < enKisa) {
        enKisa = d
        hedef = i
      }
    }

    const sonuc = this.oyun.dokun(hedef)
    if (sonuc === 'yok') {
      sesler.yanlis()
      return
    }
    this.sayac.basla()
    if (sonuc === 'birakildi') {
      sesler.kaydir()
      setChip('moves', this.oyun.hamle)
    } else sesler.tik()
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle)
      this.turuBitir({
        baslik: 'Hepsini ayırdın! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · Skor: ${skor}`,
        skor,
        gecikme: TASIMA_SURESI + 200,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    this.kaplar.forEach((k, i) => {
      k.setStrokeStyle(KAP_KENAR, this.oyun.secili === i ? COLORS.SECILI_KENAR : COLORS.KAP_KENAR, 1)
    })

    for (let kap = 0; kap < this.oyun.tupSayisi; kap++) {
      this.oyun.tupler[kap].forEach((renk, sira) => {
        const secilmis = this.oyun.secili === kap && sira === this.oyun.tupler[kap].length - 1
        const x = this.kapX(kap)
        const y = secilmis
          ? KAP_ALT - this.oyun.kapasite * PARCA_YUKSEKLIK - SECILI_YUKSEKLIK
          : KAP_ALT - 10 - sira * PARCA_YUKSEKLIK - PARCA_YUKSEKLIK / 2
        const renkDegeri = PARCA_RENKLERI[renk % PARCA_RENKLERI.length]
        // Su temasında dikdörtgen katman, renk temasında yuvarlak köşeli blok
        const parca = this.add
          .rectangle(x, y, KAP_GENISLIK - 12, PARCA_YUKSEKLIK - 2, renkDegeri)
          .setRounded(TEMA === 'su' ? 2 : 6)
        this.katman.add(parca)
      })
    }
  }
}

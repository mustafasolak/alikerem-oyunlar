import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  GAME_WIDTH,
  SECILI_YUKSEKLIK,
  TASIMA_SURESI,
  TOP_ARALIK,
  TOP_RENKLERI,
  TOP_YARICAP,
  TUP_ALT,
  TUP_GENISLIK,
  TUP_KENAR,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { TopSirala } from '../systems/TopSirala.ts'

export class GameScene extends TemelSahne {
  private oyun!: TopSirala
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private tupViewler: Phaser.GameObjects.Rectangle[] = []
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('topsirala')
  }

  protected kur(): void {
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (value) => {
      this.zorluk = value as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new TopSirala(ayar.renkSayisi, ayar.kapasite, ayar.bosTup)

    for (const view of this.tupViewler) view.destroy()
    this.tupViewler = []

    const yukseklik = this.oyun.kapasite * TOP_ARALIK + 16
    for (let i = 0; i < this.oyun.tupSayisi; i++) {
      const tup = this.add
        .rectangle(this.tupX(i), TUP_ALT - yukseklik / 2, TUP_GENISLIK, yukseklik, COLORS.TUP)
        .setRounded(TUP_GENISLIK / 2)
        .setStrokeStyle(TUP_KENAR, COLORS.TUP_KENAR, 0.8)
      this.tupViewler.push(tup)
    }

    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  /** Tüpler iki sıraya sığmıyorsa tek sırada daralarak dizilir. */
  private tupX(index: number): number {
    return (GAME_WIDTH / (this.oyun.tupSayisi + 1)) * (index + 1)
  }

  private dokun(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    let hedef = 0
    let enKisa = Infinity
    for (let i = 0; i < this.oyun.tupSayisi; i++) {
      const uzaklik = Math.abs(pointer.worldX - this.tupX(i))
      if (uzaklik < enKisa) {
        enKisa = uzaklik
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
    } else {
      sesler.tik()
    }
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle)
      this.turuBitir({
        baslik: 'Hepsini ayırdın! 🎉',
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · Skor: ${skor}`,
        skor,
        gecikme: TASIMA_SURESI + 220,
      })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)

    this.tupViewler.forEach((view, i) => {
      view.setStrokeStyle(TUP_KENAR, this.oyun.secili === i ? COLORS.SECILI_KENAR : COLORS.TUP_KENAR, 1)
    })

    for (let tup = 0; tup < this.oyun.tupSayisi; tup++) {
      const yigin = this.oyun.tupler[tup]
      yigin.forEach((renk, sira) => {
        const secilmis = this.oyun.secili === tup && sira === yigin.length - 1
        const x = this.tupX(tup)
        const y = secilmis
          ? TUP_ALT - this.oyun.kapasite * TOP_ARALIK - SECILI_YUKSEKLIK
          : TUP_ALT - 12 - sira * TOP_ARALIK - TOP_YARICAP
        this.katman.add(this.add.circle(x, y, TOP_YARICAP, TOP_RENKLERI[renk % TOP_RENKLERI.length]))
      })
    }
  }
}

import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
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
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: TopSirala
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private kapKatmani!: Phaser.GameObjects.Container
  private parcaKatmani!: Phaser.GameObjects.Container
  private camKatmani!: Phaser.GameObjects.Container
  private kaplar: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super('susise')
  }

  protected kur(): void {
    // Katman sırası açıkça verilir: kap arkada, parçalar ortada, cam parlaması önde.
    this.kapKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.parcaKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)
    this.camKatmani = this.add.container(0, 0).setDepth(KATMAN.EFEKT)

    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new TopSirala(ayar.renkSayisi, ayar.kapasite, ayar.bosTup)

    this.kapKatmani.removeAll(true)
    this.camKatmani.removeAll(true)
    this.kaplar = []

    const ic = ayar.kapasite * PARCA_YUKSEKLIK
    const yukseklik = ic + 18
    for (let i = 0; i < this.oyun.tupSayisi; i++) {
      const x = this.kapX(i)
      const merkezY = KAP_ALT - yukseklik / 2

      // Kap gövdesi
      const kap = this.add
        .rectangle(x, merkezY, KAP_GENISLIK, yukseklik, COLORS.KAP)
        .setRounded(KAP_GENISLIK / 3)
        .setStrokeStyle(KAP_KENAR, COLORS.KAP_KENAR, 0.9)
      this.kapKatmani.add(kap)
      this.kaplar.push(kap)

      // Cam parlaması: sol kenarda ince açık şerit
      this.camKatmani.add(
        this.add
          .rectangle(x - KAP_GENISLIK * 0.28, merkezY, KAP_GENISLIK * 0.13, yukseklik * 0.78, 0xffffff, 0.13)
          .setRounded(KAP_GENISLIK * 0.06),
      )
      // Kap ağzı
      this.camKatmani.add(
        this.add
          .rectangle(x, KAP_ALT - yukseklik, KAP_GENISLIK + 6, 7, COLORS.KAP_KENAR, 0.85)
          .setRounded(3),
      )
    }

    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private kapX(i: number): number {
    return (GAME_WIDTH / (this.oyun.tupSayisi + 1)) * (i + 1)
  }

  private parcaY(sira: number): number {
    return KAP_ALT - 12 - sira * PARCA_YUKSEKLIK - PARCA_YUKSEKLIK / 2
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
    this.parcaKatmani.removeAll(true)

    // Seçili kabın kenarı vurgulanır
    this.kaplar.forEach((kap, i) => {
      const secili = this.oyun.secili === i
      kap.setStrokeStyle(secili ? KAP_KENAR + 1 : KAP_KENAR, secili ? COLORS.SECILI_KENAR : COLORS.KAP_KENAR, 1)
    })

    for (let kap = 0; kap < this.oyun.tupSayisi; kap++) {
      const yigin = this.oyun.tupler[kap]
      const tamam = yigin.length === this.oyun.kapasite && yigin.every((r) => r === yigin[0])

      yigin.forEach((renk, sira) => {
        const secilmis = this.oyun.secili === kap && sira === yigin.length - 1
        const x = this.kapX(kap)
        const y = secilmis ? KAP_ALT - this.oyun.kapasite * PARCA_YUKSEKLIK - SECILI_YUKSEKLIK : this.parcaY(sira)
        const renkDegeri = PARCA_RENKLERI[renk % PARCA_RENKLERI.length]
        this.parcaKatmani.add(this.parcaCiz(x, y, renkDegeri, tamam))
      })
    }
  }

  /** Su dilimi: üstte açık, altta koyu şerit — sıvı hissi. */
  private parcaCiz(x: number, y: number, renk: number, tamam: boolean): Phaser.GameObjects.Container {
    const g = KAP_GENISLIK - 12
    const h = PARCA_YUKSEKLIK
    const parcalar: Phaser.GameObjects.GameObject[] = [
      this.add.rectangle(0, 0, g, h, renk),
      this.add.rectangle(0, -h * 0.33, g, h * 0.3, acikTon(renk, 0.32)).setAlpha(0.8),
      this.add.rectangle(0, h * 0.36, g, h * 0.22, koyuTon(renk, 0.3)).setAlpha(0.6),
    ]
    if (tamam) {
      parcalar.push(this.add.rectangle(0, 0, g, h, 0xffffff, 0.14))
    }
    const kap = this.add.container(x, y, parcalar)
    kap.setSize(g, h)
    return kap
  }
}

import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  CIKIS_Y,
  COLORS,
  DUGME_YARICAP,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GIRIS_Y,
  KAPI_ARALIK_Y,
  KAPI_BASLANGIC_Y,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'
import { MantikDevresi } from '../systems/MantikDevresi.ts'

export class GameScene extends TemelSahne {
  private oyun!: MantikDevresi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('mantikkapi')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const a = ZORLUKLAR[this.zorluk]
    this.oyun = new MantikDevresi(a.girisSayisi, a.kapiSayisi)
    setChip('target', this.oyun.hedef ? '1' : '0')
    setChip('moves', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private girisX(i: number): number {
    return (GAME_WIDTH / (this.oyun.girisler.length + 1)) * (i + 1)
  }

  private kapiY(i: number): number {
    return KAPI_BASLANGIC_Y + i * KAPI_ARALIK_Y
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    if (Math.abs(p.worldY - GIRIS_Y) > DUGME_YARICAP + 14) return

    for (let i = 0; i < this.oyun.girisler.length; i++) {
      if (Math.abs(p.worldX - this.girisX(i)) > DUGME_YARICAP + 6) continue
      if (!this.oyun.cevir(i)) return
      this.sayac.basla()
      sesler.tik()
      setChip('moves', this.oyun.hamle)
      this.ciz()

      if (this.oyun.bitti) {
        const skor = skorHesapla(this.zorluk, this.oyun.hamle)
        this.turuBitir({
          baslik: 'Devreyi çözdün! 🎉',
          ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · Skor: ${skor}`,
          skor,
        })
      }
      return
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const cikislar = this.oyun.kapiCikislari()
    const yaz = (x: number, y: number, metin: string, boyut = 15, koyu = false) =>
      this.katman.add(
        this.add
          .text(x, y, metin, {
            fontFamily: FONT_FAMILY,
            fontSize: `${boyut}px`,
            fontStyle: 'bold',
            color: koyu ? COLORS.KOYU_YAZI : COLORS.YAZI,
          })
          .setOrigin(0.5),
      )

    // Girişler
    this.oyun.girisler.forEach((acik, i) => {
      const x = this.girisX(i)
      this.katman.add(this.add.circle(x, GIRIS_Y, DUGME_YARICAP, acik ? COLORS.ACIK : COLORS.KAPALI))
      yaz(x, GIRIS_Y, acik ? '1' : '0', 20, acik)
      yaz(x, GIRIS_Y - DUGME_YARICAP - 16, `G${i + 1}`, 13)
    })

    // Kapılar ve kabloları
    this.oyun.kapilar.forEach((kapi, i) => {
      const y = this.kapiY(i)
      const x = GAME_WIDTH / 2
      const cikis = cikislar[i]

      for (const kaynak of [kapi.a, kapi.b]) {
        const kx = kaynak.tur === 'giris' ? this.girisX(kaynak.index) : GAME_WIDTH / 2
        const ky = kaynak.tur === 'giris' ? GIRIS_Y : this.kapiY(kaynak.index)
        const deger =
          kaynak.tur === 'giris' ? this.oyun.girisler[kaynak.index] : cikislar[kaynak.index]
        const cizgi = this.add.graphics()
        cizgi.lineStyle(3, deger ? COLORS.KABLO_ACIK : COLORS.KABLO_KAPALI, 1)
        cizgi.lineBetween(kx, ky + DUGME_YARICAP, x, y - 22)
        this.katman.add(cizgi)
      }

      this.katman.add(
        this.add.rectangle(x, y, 150, 44, cikis ? COLORS.ACIK : COLORS.KAPI).setRounded(10),
      )
      yaz(x, y, `${kapi.tur}  →  ${cikis ? '1' : '0'}`, 16, cikis)
    })

    // Çıkış
    const sonuc = this.oyun.cikis
    this.katman.add(this.add.circle(GAME_WIDTH / 2, CIKIS_Y, DUGME_YARICAP + 6, sonuc ? COLORS.ACIK : COLORS.KAPALI))
    yaz(GAME_WIDTH / 2, CIKIS_Y, sonuc ? '1' : '0', 24, sonuc)
    yaz(GAME_WIDTH / 2, CIKIS_Y + 50, `Hedef: ${this.oyun.hedef ? '1' : '0'}`, 16)
  }
}

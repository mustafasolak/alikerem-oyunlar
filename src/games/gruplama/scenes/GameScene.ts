import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  DENE_Y,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRUP_RENKLERI,
  KART_ARALIK,
  KART_GENISLIK,
  KART_YUKSEKLIK,
  MAX_HATA,
  UST_BOSLUK,
  skorHesapla,
} from '../config/constants.ts'
import { Gruplama } from '../systems/Gruplama.ts'

export class GameScene extends TemelSahne {
  private readonly oyun = new Gruplama()
  private katman!: Phaser.GameObjects.Container

  constructor() {
    super('gruplama')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    setChip('remaining', this.oyun.kalanGrup)
    setChip('mistakes', 0)
    this.skorGoster(0)
    this.ciz()
  }

  private kartX(sutun: number): number {
    const toplam = 4 * KART_GENISLIK + 3 * KART_ARALIK
    return (GAME_WIDTH - toplam) / 2 + sutun * (KART_GENISLIK + KART_ARALIK) + KART_GENISLIK / 2
  }

  private kartY(satir: number): number {
    return UST_BOSLUK + satir * (KART_YUKSEKLIK + KART_ARALIK) + KART_YUKSEKLIK / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    this.sayac.basla()

    if (Math.abs(p.worldY - DENE_Y) < 30) {
      this.dene()
      return
    }

    const satir = Math.floor((p.worldY - UST_BOSLUK) / (KART_YUKSEKLIK + KART_ARALIK))
    if (satir < 0 || satir > 3) return
    for (let sutun = 0; sutun < 4; sutun++) {
      if (Math.abs(p.worldX - this.kartX(sutun)) > KART_GENISLIK / 2) continue
      // Çözülen gruplar üstte durur; kart sırası buna göre kayar
      const index = this.gorunurIndex(satir * 4 + sutun)
      if (index < 0) return
      if (this.oyun.sec(index)) {
        sesler.tik()
        this.ciz()
      }
      return
    }
  }

  /** Ekrandaki sıradan kart dizisindeki indekse. */
  private gorunurIndex(gorunurSira: number): number {
    const sirali = this.siraliKartlar()
    return sirali[gorunurSira] ?? -1
  }

  /** Çözülmüş gruplar önce, kalanlar sonra. */
  private siraliKartlar(): number[] {
    const cozulen: number[] = []
    const kalan: number[] = []
    for (const grup of this.oyun.cozulen) {
      this.oyun.kartlar.forEach((k, i) => {
        if (k.grup === grup) cozulen.push(i)
      })
    }
    this.oyun.kartlar.forEach((k, i) => {
      if (!k.cozuldu) kalan.push(i)
    })
    return [...cozulen, ...kalan]
  }

  private dene(): void {
    const sonuc = this.oyun.dene()
    if (sonuc === 'eksik') {
      sesler.yanlis()
      return
    }

    if (sonuc === 'dogru') {
      sesler.dogru()
      setChip('remaining', this.oyun.kalanGrup)
    } else {
      sesler.yanlis()
      this.cameras.main.shake(160, 0.006)
      setChip('mistakes', this.oyun.hata)
    }
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.oyun.hata)
      this.turuBitir({ baslik: 'Dört grubu da buldun! 🎉', ozet: `${this.oyun.hata} hata · Skor: ${skor}`, skor })
    } else if (this.oyun.kaybetti) {
      const cevap = this.oyun.gruplar.map((g) => g.baslik).join(', ')
      this.turuBitir({ baslik: 'Hakkın bitti', ozet: `Gruplar: ${cevap}`, skor: 0, kazandi: false })
    }
  }

  private ciz(): void {
    this.katman.removeAll(true)
    const sirali = this.siraliKartlar()

    sirali.forEach((kartIndex, gorunurSira) => {
      const kart = this.oyun.kartlar[kartIndex]
      const satir = Math.floor(gorunurSira / 4)
      const sutun = gorunurSira % 4
      const x = this.kartX(sutun)
      const y = this.kartY(satir)
      const secili = this.oyun.secili.has(kartIndex)
      const renk = kart.cozuldu ? GRUP_RENKLERI[kart.grup % GRUP_RENKLERI.length] : secili ? COLORS.SECILI : COLORS.KART

      this.katman.add(this.add.rectangle(x, y, KART_GENISLIK, KART_YUKSEKLIK, renk).setRounded(10))
      this.katman.add(
        this.add
          .text(x, y, kart.kelime, {
            fontFamily: FONT_FAMILY,
            fontSize: '14px',
            fontStyle: 'bold',
            color: kart.cozuldu || secili ? COLORS.KOYU_YAZI : COLORS.YAZI,
            align: 'center',
            wordWrap: { width: KART_GENISLIK - 10 },
          })
          .setOrigin(0.5),
      )
    })

    // Çözülen grupların başlıkları
    this.oyun.cozulen.forEach((grup, i) => {
      this.katman.add(
        this.add
          .text(GAME_WIDTH / 2, this.kartY(i) - KART_YUKSEKLIK / 2 - 2, this.oyun.gruplar[grup].baslik, {
            fontFamily: FONT_FAMILY,
            fontSize: '12px',
            fontStyle: 'bold',
            color: COLORS.YAZI,
          })
          .setOrigin(0.5, 1),
      )
    })

    this.katman.add(this.add.rectangle(GAME_WIDTH / 2, DENE_Y, 160, 46, COLORS.DENE).setRounded(10))
    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, DENE_Y, `Dene  (${this.oyun.secili.size}/4)`, {
          fontFamily: FONT_FAMILY,
          fontSize: '17px',
          fontStyle: 'bold',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5),
    )
    this.katman.add(
      this.add
        .text(GAME_WIDTH / 2, DENE_Y + 44, `Kalan hata hakkı: ${MAX_HATA - this.oyun.hata}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '13px',
          color: COLORS.YAZI,
        })
        .setOrigin(0.5)
        .setAlpha(0.7),
    )
  }
}

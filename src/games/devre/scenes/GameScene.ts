import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import { BoruAgi, kollar } from '../../../shared/motorlar/BoruAgi.ts'
import {
  BOARD_PADDING,
  COLORS,
  DONME_SURESI,
  GAME_HEIGHT,
  GAME_WIDTH,
  KAZANMA_BASLIGI,
  KOL_KALINLIK_ORAN,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: BoruAgi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private katman!: Phaser.GameObjects.Container
  private cizim!: Phaser.GameObjects.Graphics
  private hucreBoyu = 0
  private ofset = 0

  constructor() {
    super('devre')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.katman = this.add.container(0, 0)
    this.cizim = this.add.graphics()
    butonGrubu('toolbar', 'level', (v) => {
      this.zorluk = v as Zorluk
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.dokun(p))
  }

  protected yeniOyun(): void {
    const ayar = ZORLUKLAR[this.zorluk]
    this.oyun = new BoruAgi(ayar.boyut)
    this.hucreBoyu = Math.floor((GAME_WIDTH - BOARD_PADDING * 2) / ayar.boyut)
    this.ofset = (GAME_WIDTH - ayar.boyut * this.hucreBoyu) / 2

    this.katman.removeAll(true)
    for (let s = 0; s < ayar.boyut; s++) {
      for (let t = 0; t < ayar.boyut; t++) {
        this.katman.add(
          this.add
            .rectangle(this.x(t), this.y(s), this.hucreBoyu - 3, this.hucreBoyu - 3, COLORS.HUCRE)
            .setRounded(6),
        )
      }
    }

    setChip('remaining', this.oyun.kalan)
    setChip('timer', '0:00')
    this.skorGoster(0)
    this.ciz()
  }

  private x(sutun: number): number {
    return this.ofset + sutun * this.hucreBoyu + this.hucreBoyu / 2
  }

  private y(satir: number): number {
    return this.ofset + satir * this.hucreBoyu + this.hucreBoyu / 2
  }

  private dokun(p: Phaser.Input.Pointer): void {
    if (this.bitti) return
    const t = Math.floor((p.worldX - this.ofset) / this.hucreBoyu)
    const s = Math.floor((p.worldY - this.ofset) / this.hucreBoyu)
    if (s < 0 || s >= this.oyun.boyut || t < 0 || t >= this.oyun.boyut) return

    if (!this.oyun.cevir(this.oyun.index(s, t))) return
    this.sayac.basla()
    sesler.tik()
    setChip('remaining', this.oyun.kalan)
    this.ciz()

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.zorluk, this.oyun.hamle, this.sayac.saniye)
      this.turuBitir({
        baslik: KAZANMA_BASLIGI,
        ozet: `${ZORLUKLAR[this.zorluk].ad} · ${this.oyun.hamle} hamle · ${this.sayac.yazi} · Skor: ${skor}`,
        skor,
        gecikme: DONME_SURESI + 220,
      })
    }
  }

  private ciz(): void {
    this.cizim.clear()
    const bagli = this.oyun.baglilar()
    const kalinlik = Math.max(4, this.hucreBoyu * KOL_KALINLIK_ORAN)
    const yari = this.hucreBoyu / 2

    for (let s = 0; s < this.oyun.boyut; s++) {
      for (let t = 0; t < this.oyun.boyut; t++) {
        const index = this.oyun.index(s, t)
        const k = kollar(this.oyun.hucreler[index])
        const cx = this.x(t)
        const cy = this.y(s)
        const aktifMi = bagli.has(index)
        this.cizim.lineStyle(kalinlik, aktifMi ? COLORS.AKTIF : COLORS.PASIF, 1)

        if (k.ust) this.cizim.lineBetween(cx, cy, cx, cy - yari)
        if (k.alt) this.cizim.lineBetween(cx, cy, cx, cy + yari)
        if (k.sol) this.cizim.lineBetween(cx, cy, cx - yari, cy)
        if (k.sag) this.cizim.lineBetween(cx, cy, cx + yari, cy)

        // Merkez tıkacı: kolların birleştiği yer boş görünmesin
        this.cizim.fillStyle(aktifMi ? COLORS.AKTIF : COLORS.PASIF, 1)
        this.cizim.fillCircle(cx, cy, kalinlik * 0.55)
      }
    }

    // Kaynağı belirgin göster
    this.cizim.fillStyle(COLORS.KAYNAK, 1)
    this.cizim.fillCircle(this.x(this.oyun.kaynak.sutun), this.y(this.oyun.kaynak.satir), this.hucreBoyu * 0.2)
  }
}

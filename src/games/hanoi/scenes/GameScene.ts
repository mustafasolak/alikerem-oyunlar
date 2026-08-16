import * as Phaser from 'phaser'

import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  COLORS,
  CUBUK_GENISLIK,
  CUBUK_SAYISI,
  CUBUK_YUKSEKLIK,
  DISK_ADIM,
  DISK_MIN_GENISLIK,
  DISK_RADIUS,
  DISK_RENKLERI,
  DISK_YUKSEKLIK,
  GAME_WIDTH,
  SECILI_YUKSEKLIK,
  TABAN_Y,
  TABAN_YUKSEKLIK,
  TASIMA_SURESI,
  VARSAYILAN_DISK,
  enAzHamle,
  skorHesapla,
} from '../config/constants.ts'
import { Hanoi } from '../systems/Hanoi.ts'

export class GameScene extends TemelSahne {
  private oyun!: Hanoi
  private diskSayisi = VARSAYILAN_DISK
  private diskGorunumleri = new Map<number, Phaser.GameObjects.Rectangle>()
  private secili: number | null = null

  constructor() {
    super('hanoi')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, TABAN_Y, GAME_WIDTH - 40, TABAN_YUKSEKLIK, COLORS.TABAN).setRounded(6)
    for (let i = 0; i < CUBUK_SAYISI; i++) {
      this.add
        .rectangle(this.cubukX(i), TABAN_Y - CUBUK_YUKSEKLIK / 2, CUBUK_GENISLIK, CUBUK_YUKSEKLIK, COLORS.CUBUK)
        .setRounded(5)
    }

    butonGrubu('toolbar', 'level', (value) => {
      this.diskSayisi = Number(value)
      this.yenidenBasla()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.cubugaDokun(p))
  }

  protected yeniOyun(): void {
    this.oyun = new Hanoi(this.diskSayisi)
    this.secili = null

    for (const view of this.diskGorunumleri.values()) view.destroy()
    this.diskGorunumleri.clear()

    for (let disk = 1; disk <= this.diskSayisi; disk++) {
      const genislik = DISK_MIN_GENISLIK + (disk - 1) * DISK_ADIM
      const renk = DISK_RENKLERI[(this.diskSayisi - disk) % DISK_RENKLERI.length]
      this.diskGorunumleri.set(disk, this.add.rectangle(0, 0, genislik, DISK_YUKSEKLIK, renk).setRounded(DISK_RADIUS))
    }

    setChip('moves', 0)
    setChip('best-moves', enAzHamle(this.diskSayisi))
    this.skorGoster(0)
    this.ciz(false)
  }

  private cubukX(index: number): number {
    return (GAME_WIDTH / (CUBUK_SAYISI + 1)) * (index + 1)
  }

  private cubugaDokun(pointer: Phaser.Input.Pointer): void {
    if (this.bitti) return
    // En yakın çubuğu seç
    let hedef = 0
    let enKisa = Infinity
    for (let i = 0; i < CUBUK_SAYISI; i++) {
      const uzaklik = Math.abs(pointer.worldX - this.cubukX(i))
      if (uzaklik < enKisa) {
        enKisa = uzaklik
        hedef = i
      }
    }

    if (this.secili === null) {
      if (this.oyun.ust(hedef) === null) return
      this.secili = hedef
      sesler.tik()
      this.ciz(true)
      return
    }

    if (this.secili === hedef) {
      this.secili = null
      this.ciz(true)
      return
    }

    if (!this.oyun.tasi(this.secili, hedef)) {
      sesler.yanlis()
      this.secili = null
      this.ciz(true)
      return
    }

    sesler.kaydir()
    this.secili = null
    this.sayac.basla()
    setChip('moves', this.oyun.hamle)
    this.ciz(true)

    if (this.oyun.bitti) {
      const skor = skorHesapla(this.diskSayisi, this.oyun.hamle)
      this.turuBitir({
        baslik: 'Kuleyi taşıdın! 🎉',
        ozet: `${this.diskSayisi} disk · ${this.oyun.hamle} hamle (en az ${enAzHamle(this.diskSayisi)}) · Skor: ${skor}`,
        skor,
        gecikme: TASIMA_SURESI + 220,
      })
    }
  }

  private ciz(animasyonlu: boolean): void {
    for (let cubuk = 0; cubuk < CUBUK_SAYISI; cubuk++) {
      const yigin = this.oyun.cubuklar[cubuk]
      yigin.forEach((disk, sira) => {
        const view = this.diskGorunumleri.get(disk)
        if (!view) return
        const secilmis = this.secili === cubuk && sira === yigin.length - 1
        const x = this.cubukX(cubuk)
        const y = secilmis
          ? TABAN_Y - CUBUK_YUKSEKLIK - SECILI_YUKSEKLIK
          : TABAN_Y - TABAN_YUKSEKLIK / 2 - DISK_YUKSEKLIK / 2 - sira * DISK_YUKSEKLIK

        if (animasyonlu) {
          this.tweens.add({ targets: view, x, y, duration: TASIMA_SURESI, ease: 'Quad.easeOut' })
        } else {
          view.setPosition(x, y)
        }
      })
    }
  }
}

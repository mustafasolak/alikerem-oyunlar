import * as Phaser from 'phaser'

import { KATMAN, acikTon } from '../../../shared/Gorsel.ts'
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
  UC_SIMGESI,
  VARSAYILAN_ZORLUK,
  ZORLUKLAR,
  skorHesapla,
  type Zorluk,
} from '../config/constants.ts'

export class GameScene extends TemelSahne {
  private oyun!: BoruAgi
  private zorluk: Zorluk = VARSAYILAN_ZORLUK
  private hucreKatmani!: Phaser.GameObjects.Container
  private boruCizim!: Phaser.GameObjects.Graphics
  private ucKatmani!: Phaser.GameObjects.Container
  private hucreBoyu = 0
  private ofset = 0

  constructor() {
    super('suborusu')
  }

  protected kur(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.BOARD).setRounded(14)
    this.hucreKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.boruCizim = this.add.graphics().setDepth(KATMAN.ICERIK)
    this.ucKatmani = this.add.container(0, 0).setDepth(KATMAN.EFEKT)

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

    this.hucreKatmani.removeAll(true)
    for (let s = 0; s < ayar.boyut; s++) {
      for (let t = 0; t < ayar.boyut; t++) {
        this.hucreKatmani.add(
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

    const index = this.oyun.index(s, t)
    if (!this.oyun.cevir(index)) return
    this.sayac.basla()
    sesler.tik()
    setChip('remaining', this.oyun.kalan)
    this.ciz()

    // Çevrilen hücre kısaca büyüsün: hangi kareye bastığın belli olsun
    const hucre = this.hucreKatmani.getAt(index) as Phaser.GameObjects.Rectangle | undefined
    if (hucre) {
      this.tweens.add({ targets: hucre, scale: 1.1, duration: DONME_SURESI / 2, yoyo: true, ease: 'Quad.easeOut' })
    }

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
    this.boruCizim.clear()
    this.ucKatmani.removeAll(true)

    const bagli = this.oyun.baglilar()
    const kalinlik = Math.max(6, this.hucreBoyu * KOL_KALINLIK_ORAN)
    const icKalinlik = kalinlik * 0.42
    const yari = this.hucreBoyu / 2

    for (let s = 0; s < this.oyun.boyut; s++) {
      for (let t = 0; t < this.oyun.boyut; t++) {
        const index = this.oyun.index(s, t)
        const maske = this.oyun.hucreler[index]
        const k = kollar(maske)
        const cx = this.x(t)
        const cy = this.y(s)
        const aktif = bagli.has(index)
        const dis = aktif ? COLORS.AKTIF : COLORS.PASIF
        const ic = acikTon(dis, 0.4)

        const kol = (dx: number, dy: number): void => {
          // Dış boru
          this.boruCizim.lineStyle(kalinlik, dis, 1)
          this.boruCizim.lineBetween(cx, cy, cx + dx * yari, cy + dy * yari)
          // İç kanal: borunun içi görünsün
          this.boruCizim.lineStyle(icKalinlik, ic, aktif ? 0.9 : 0.5)
          this.boruCizim.lineBetween(cx, cy, cx + dx * yari, cy + dy * yari)
        }

        if (k.ust) kol(0, -1)
        if (k.alt) kol(0, 1)
        if (k.sol) kol(-1, 0)
        if (k.sag) kol(1, 0)

        // Ortadaki bilezik
        this.boruCizim.fillStyle(dis, 1)
        this.boruCizim.fillCircle(cx, cy, kalinlik * 0.6)
        this.boruCizim.fillStyle(ic, aktif ? 0.9 : 0.5)
        this.boruCizim.fillCircle(cx, cy, icKalinlik * 0.7)

        // Tek kollu hücre = uç nokta. Hedef bunları beslemek.
        const kolSayisi = [k.ust, k.alt, k.sol, k.sag].filter(Boolean).length
        const kaynakMi = s === this.oyun.kaynak.satir && t === this.oyun.kaynak.sutun
        if (kolSayisi === 1 && !kaynakMi) {
          this.ucKatmani.add(
            this.add
              .rectangle(cx, cy, this.hucreBoyu * 0.44, this.hucreBoyu * 0.44, aktif ? COLORS.KAYNAK : COLORS.PASIF)
              .setRounded(6)
              .setStrokeStyle(2, aktif ? acikTon(COLORS.KAYNAK, 0.5) : COLORS.HUCRE, 0.9),
          )
          this.ucKatmani.add(
            this.add
              .text(cx, cy, UC_SIMGESI, { fontSize: `${Math.round(this.hucreBoyu * 0.3)}px` })
              .setOrigin(0.5)
              .setAlpha(aktif ? 1 : 0.45),
          )
        }
      }
    }

    // Kaynak: belirgin yuvarlak
    const kx = this.x(this.oyun.kaynak.sutun)
    const ky = this.y(this.oyun.kaynak.satir)
    this.ucKatmani.add(this.add.circle(kx, ky, this.hucreBoyu * 0.3, COLORS.KAYNAK))
    this.ucKatmani.add(
      this.add.circle(kx, ky, this.hucreBoyu * 0.17, acikTon(COLORS.KAYNAK, 0.55)),
    )
  }
}

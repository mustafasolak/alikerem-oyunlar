import * as Phaser from 'phaser'

import { KATMAN, nisanIzi } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { setChip } from '../../../shared/dom.ts'
import {
  ACI_ADIM,
  CANAVAR_TIPLERI,
  COLORS,
  DALGA_BONUSU,
  FONT_FAMILY,
  GAME_WIDTH,
  ISABET_EFEKT_MS,
  KALE_CANI,
  KALE_SARSINTI_GUC,
  KALE_SARSINTI_MS,
  MIZRAK_BOY,
  MIZRAK_KALINLIK,
  NISAN_NOKTA_ARALIK,
  OVERLAY_GECIKME_MS,
  SAPLANAN_OMUR_MS,
  ZEMIN_Y,
} from '../config/constants.ts'
import { KaleSavunmasi, type Isabet } from '../systems/KaleSavunmasi.ts'
import { ArkaPlan } from './ArkaPlan.ts'
import { CanavarGorunumu } from './CanavarGorunumu.ts'
import { KaleGorunumu } from './KaleGorunumu.ts'

/** Bildirim yazısının yüksekliği. */
const BILDIRIM_Y = 92

export class GameScene extends TemelSahne {
  private readonly oyun = new KaleSavunmasi()
  private readonly canavarGorunumleri = new Map<number, CanavarGorunumu>()
  private readonly mizrakGorunumleri = new Map<number, Phaser.GameObjects.Container>()

  private arkaPlan!: ArkaPlan
  private kale!: KaleGorunumu
  private canavarKatmani!: Phaser.GameObjects.Container
  private mizrakKatmani!: Phaser.GameObjects.Container
  private saplananKatmani!: Phaser.GameObjects.Container
  private nisanCizim!: Phaser.GameObjects.Graphics
  private bildirim!: Phaser.GameObjects.Text

  /** Nişan yayı boşuna yeniden çizilmesin: son çizilen açı. */
  private cizilenAci = Number.NaN
  private baslamisMi = false

  constructor() {
    super('kalesavunmasi')
  }

  protected kur(): void {
    this.arkaPlan = new ArkaPlan(this)
    this.saplananKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.kale = new KaleGorunumu(this)
    this.canavarKatmani = this.add.container(0, 0).setDepth(KATMAN.ICERIK)
    this.mizrakKatmani = this.add.container(0, 0).setDepth(KATMAN.EFEKT)
    this.nisanCizim = this.add.graphics().setDepth(KATMAN.NISAN)
    this.bildirim = this.add
      .text(GAME_WIDTH / 2, BILDIRIM_Y, '', { fontFamily: FONT_FAMILY, fontSize: '22px', color: COLORS.YAZI })
      .setOrigin(0.5)
      .setDepth(KATMAN.NISAN)
      .setAlpha(0)

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.nisanla(p))
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.nisanla(p)
      this.at()
    })

    const klavye = this.input.keyboard
    klavye?.on('keydown-SPACE', () => this.at())
    klavye?.on('keydown-UP', () => this.oyun.aciDegistir(-ACI_ADIM))
    klavye?.on('keydown-W', () => this.oyun.aciDegistir(-ACI_ADIM))
    klavye?.on('keydown-DOWN', () => this.oyun.aciDegistir(ACI_ADIM))
    klavye?.on('keydown-S', () => this.oyun.aciDegistir(ACI_ADIM))
    this.tuslariYakala(['SPACE', 'UP', 'DOWN'])
    this.saldirDugmesi()
  }

  protected yeniOyun(): void {
    this.oyun.reset()
    for (const gorunum of this.canavarGorunumleri.values()) gorunum.yok()
    this.canavarGorunumleri.clear()
    for (const gorunum of this.mizrakGorunumleri.values()) gorunum.destroy()
    this.mizrakGorunumleri.clear()
    this.saplananKatmani.removeAll(true)

    this.baslamisMi = false
    this.cizilenAci = Number.NaN
    // Yeniden başlarken bütün tweenler silinir; arka plan ve meşaleler yeniden kurulmalı.
    this.arkaPlan.sifirla(1)
    this.kale.sifirla()
    this.kale.canGoster(KALE_CANI, KALE_CANI)
    this.bildirim.setAlpha(0)

    setChip('wave', 'Hazır')
    setChip('castle', KALE_CANI)
    this.skorGoster(0)
    this.nisanCiz()
  }

  update(_time: number, delta: number): void {
    this.arkaPlan.guncelle(delta)
    if (this.bitti) return

    const sonuc = this.oyun.ilerlet(delta)

    this.isabetleriIsle(sonuc.isabetler)
    for (const saplanan of sonuc.saplananlar) this.saplananCiz(saplanan.x, saplanan.aci)
    if (sonuc.kaleVuruldu) this.kaleHasari()
    if (sonuc.bitenDalga !== null) this.dalgaBitti(sonuc.bitenDalga)
    if (sonuc.yeniDalga !== null) this.dalgaBasladi(sonuc.yeniDalga)

    this.canavarlariEsle()
    this.mizraklariEsle()
    this.nisanCiz()

    this.kale.nisanAyarla(this.oyun.aci)
    this.kale.hazirGoster(this.oyun.atisHazir)
    this.kale.canGoster(this.oyun.kaleCani, KALE_CANI)
    setChip('castle', this.oyun.kaleCani)
    this.skorGoster(this.oyun.skor)

    if (sonuc.oyunBitti) this.oyunuBitir()
  }

  // --- Girdi ---

  /** Sayfadaki "🗡 Saldır" düğmesi (mobilde tek elle atış). */
  private saldirDugmesi(): void {
    const dugme = document.querySelector<HTMLButtonElement>('#pad button[data-move="at"]')
    if (!dugme) return
    const bas = (): void => this.at()
    dugme.addEventListener('click', bas)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', bas))
  }

  private nisanla(p: Phaser.Input.Pointer): void {
    if (this.bitti || this.yaziyor) return
    this.oyun.nisanlaNokta(p.worldX, p.worldY)
  }

  private at(): void {
    if (this.bitti || this.yaziyor) return
    if (!this.oyun.at()) return
    sesler.kaydir()
  }

  // --- Görünüm eşlemesi ---

  private canavarlariEsle(): void {
    const yasayan = new Set<number>()
    for (const canavar of this.oyun.canavarlar) {
      yasayan.add(canavar.id)
      let gorunum = this.canavarGorunumleri.get(canavar.id)
      if (!gorunum) {
        gorunum = new CanavarGorunumu(this, canavar)
        this.canavarKatmani.add(gorunum.kap)
        this.canavarGorunumleri.set(canavar.id, gorunum)
      }
      gorunum.guncelle(canavar)
    }

    // Ölenler haritadan çıkarılıp kendi animasyonuyla siliniyor; burada
    // yalnız beklenmedik artıklar (yeni oyun gibi) temizlenir.
    for (const [id, gorunum] of this.canavarGorunumleri) {
      if (yasayan.has(id)) continue
      gorunum.yok()
      this.canavarGorunumleri.delete(id)
    }
  }

  private mizraklariEsle(): void {
    const ucan = new Set<number>()
    for (const mizrak of this.oyun.mizraklar) {
      ucan.add(mizrak.id)
      let gorunum = this.mizrakGorunumleri.get(mizrak.id)
      if (!gorunum) {
        gorunum = this.mizrakYap()
        this.mizrakKatmani.add(gorunum)
        this.mizrakGorunumleri.set(mizrak.id, gorunum)
      }
      gorunum.setPosition(mizrak.x, mizrak.y)
      // Mızrak uçtuğu yöne bakar: yay boyunca ucu aşağı döner.
      gorunum.setRotation(Math.atan2(mizrak.vy, mizrak.vx))
    }

    for (const [id, gorunum] of this.mizrakGorunumleri) {
      if (ucan.has(id)) continue
      gorunum.destroy()
      this.mizrakGorunumleri.delete(id)
    }
  }

  private mizrakYap(): Phaser.GameObjects.Container {
    return this.add.container(0, 0, [
      this.add.rectangle(-MIZRAK_BOY / 2, 0, MIZRAK_BOY, MIZRAK_KALINLIK, COLORS.MIZRAK_SAP).setOrigin(0, 0.5),
      this.add.triangle(MIZRAK_BOY / 2, 0, 0, -4, 9, 0, 0, 4, COLORS.MIZRAK_UC),
    ])
  }

  // --- Olaylar ---

  private isabetleriIsle(isabetler: Isabet[]): void {
    for (const isabet of isabetler) {
      this.isabetEfekti(isabet.x, isabet.y)
      const gorunum = this.canavarGorunumleri.get(isabet.canavarId)
      if (!gorunum) continue

      if (!isabet.oldu) {
        gorunum.hasarGoster()
        sesler.tik()
        continue
      }

      this.canavarGorunumleri.delete(isabet.canavarId)
      gorunum.oldur()
      sesler.patlama()
      const puan = CANAVAR_TIPLERI[isabet.tip].puan
      this.hud.showGain(puan)
      this.puanYaz(isabet.x, isabet.y, puan)
    }
  }

  private dalgaBasladi(dalga: number): void {
    setChip('wave', dalga)
    this.arkaPlan.vakitGuncelle(dalga)
    this.bildir(`Dalga ${dalga}`)
    sesler.otur()
    if (this.baslamisMi) return
    this.sayac.basla()
    this.baslamisMi = true
  }

  private dalgaBitti(dalga: number): void {
    this.bildir(`${dalga}. dalga temizlendi  +${DALGA_BONUSU}`)
    this.hud.showGain(DALGA_BONUSU)
    sesler.dogru()
  }

  private kaleHasari(): void {
    this.cameras.main.shake(KALE_SARSINTI_MS, KALE_SARSINTI_GUC)
    sesler.yanlis()
  }

  private oyunuBitir(): void {
    const ozet = `${this.oyun.dalga}. dalga · ${this.oyun.oldurulen} canavar · Skor: ${this.oyun.skor}`
    this.turuBitir({
      baslik: 'Kale düştü',
      ozet,
      skor: this.oyun.skor,
      kazandi: false,
      gecikme: OVERLAY_GECIKME_MS,
    })
  }

  // --- Efektler ---

  private nisanCiz(): void {
    if (this.oyun.aci === this.cizilenAci) return
    this.cizilenAci = this.oyun.aci

    this.nisanCizim.clear()
    const yol = this.oyun.nisanYolu()
    nisanIzi(this.nisanCizim, yol, COLORS.NISAN, NISAN_NOKTA_ARALIK, 2.4, 0.55)
    // Düşeceği yere hayalet halka
    const son = yol[yol.length - 1]
    this.nisanCizim.lineStyle(2, COLORS.NISAN, 0.8)
    this.nisanCizim.strokeCircle(son.x, son.y, 7)
  }

  private isabetEfekti(x: number, y: number): void {
    const halka = this.add.circle(x, y, 7, 0xffffff, 0.75).setDepth(KATMAN.EFEKT)
    this.tweens.add({
      targets: halka,
      scale: 2.4,
      alpha: 0,
      duration: ISABET_EFEKT_MS,
      onComplete: () => halka.destroy(),
    })
  }

  private saplananCiz(x: number, aci: number): void {
    const gorunum = this.mizrakYap()
    gorunum.setPosition(x, ZEMIN_Y - 2)
    gorunum.setRotation(aci)
    this.saplananKatmani.add(gorunum)
    this.tweens.add({
      targets: gorunum,
      alpha: 0,
      delay: SAPLANAN_OMUR_MS,
      duration: 400,
      onComplete: () => gorunum.destroy(),
    })
  }

  private puanYaz(x: number, y: number, puan: number): void {
    const yazi = this.add
      .text(x, y - 10, `+${puan}`, { fontFamily: FONT_FAMILY, fontSize: '15px', color: COLORS.YAZI })
      .setOrigin(0.5)
      .setDepth(KATMAN.NISAN)
    this.tweens.add({
      targets: yazi,
      y: y - 40,
      alpha: 0,
      duration: 620,
      onComplete: () => yazi.destroy(),
    })
  }

  private bildir(metin: string): void {
    this.tweens.killTweensOf(this.bildirim)
    this.bildirim.setText(metin).setAlpha(1).setScale(0.8)
    this.tweens.add({ targets: this.bildirim, scale: 1, duration: 200, ease: 'Back.easeOut' })
    this.tweens.add({ targets: this.bildirim, alpha: 0, delay: 900, duration: 420 })
  }
}

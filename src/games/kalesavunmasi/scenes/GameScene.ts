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
  KULE_TIPLERI,
  MALZEMELER,
  MIZRAK_BOY,
  MIZRAK_KALINLIK,
  NISAN_NOKTA_ARALIK,
  OK_BOY,
  OK_KALINLIK,
  OVERLAY_GECIKME_MS,
  SAPLANAN_OMUR_MS,
  ZEMIN_Y,
} from '../config/constants.ts'
import { KaleSavunmasi, type Isabet } from '../systems/KaleSavunmasi.ts'
import { ArkaPlan } from './ArkaPlan.ts'
import { CanavarGorunumu } from './CanavarGorunumu.ts'
import { KaleGorunumu } from './KaleGorunumu.ts'
import { KuleAlani } from './KuleAlani.ts'

/** Bildirim yazısının yüksekliği. */
const BILDIRIM_Y = 92

export class GameScene extends TemelSahne {
  private readonly oyun = new KaleSavunmasi()
  private readonly canavarGorunumleri = new Map<number, CanavarGorunumu>()
  private readonly mizrakGorunumleri = new Map<number, Phaser.GameObjects.Container>()
  private readonly malzemeButonlari = new Map<string, HTMLButtonElement>()

  private arkaPlan!: ArkaPlan
  private kale!: KaleGorunumu
  private kuleAlani!: KuleAlani
  private canavarKatmani!: Phaser.GameObjects.Container
  private mizrakKatmani!: Phaser.GameObjects.Container
  private saplananKatmani!: Phaser.GameObjects.Container
  private nisanCizim!: Phaser.GameObjects.Graphics
  private bildirim!: Phaser.GameObjects.Text

  /** Nişan yayı boşuna yeniden çizilmesin: son çizilen açı. */
  private cizilenAci = Number.NaN
  private baslamisMi = false
  /** DOM'a her karede yazmamak için son basılan malzeme/skor durumu. */
  private malzemeImza = ''
  private gosterilenSkor = -1

  constructor() {
    super('kalesavunmasi')
  }

  protected kur(): void {
    this.arkaPlan = new ArkaPlan(this)
    this.saplananKatmani = this.add.container(0, 0).setDepth(KATMAN.IZGARA)
    this.kale = new KaleGorunumu(this)
    this.kuleAlani = new KuleAlani(
      this,
      (yuva, tip) => this.kuleAl(yuva, tip),
      (yuva) => this.kuleYukselt(yuva),
    )
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
      // Kule yuvasına/dükkâna gelen dokunuş mızrak atmasın.
      if (this.kuleAlani.dokun(p.worldX, p.worldY, this.oyun.kuleler, this.oyun.altin)) return
      this.nisanla(p)
      this.at()
    })

    const klavye = this.input.keyboard
    klavye?.on('keydown-SPACE', () => this.at())
    klavye?.on('keydown-UP', () => this.oyun.aciDegistir(-ACI_ADIM))
    klavye?.on('keydown-W', () => this.oyun.aciDegistir(-ACI_ADIM))
    klavye?.on('keydown-DOWN', () => this.oyun.aciDegistir(ACI_ADIM))
    klavye?.on('keydown-S', () => this.oyun.aciDegistir(ACI_ADIM))
    for (const tus of ['keydown-P', 'keydown-ESC']) klavye?.on(tus, () => this.duraklatDegistir())
    this.tuslariYakala(['SPACE', 'UP', 'DOWN'])

    this.padDugmesi('at', () => this.at())
    this.padDugmesi('duraklat', () => this.duraklatDegistir())
    this.malzemeDugmeleri()
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
    this.malzemeImza = ''
    this.gosterilenSkor = -1
    // Yeniden başlarken bütün tweenler silinir; arka plan ve meşaleler yeniden kurulmalı.
    this.arkaPlan.sifirla(1)
    this.kale.sifirla()
    this.kale.canGoster(KALE_CANI, KALE_CANI)
    this.kuleAlani.sifirla()
    this.kuleAlani.tazele(this.oyun.kuleler, this.oyun.altin)
    this.bildirim.setAlpha(0)

    setChip('wave', 'Hazır')
    setChip('castle', KALE_CANI)
    setChip('gold', this.oyun.altin)
    this.skorGoster(0)
    this.nisanCiz()
    this.malzemeleriTazele()
    // Oyun kendiliğinden başlamaz: Başlat ekranı bekler.
    this.baslatEkrani()
  }

  update(_time: number, delta: number): void {
    // Arka plan ve dükkânlar duraklamada da canlı: beklerken alışveriş yapılabilir.
    this.arkaPlan.guncelle(delta)
    this.kuleAlani.tazele(this.oyun.kuleler, this.oyun.altin)
    this.malzemeleriTazele()
    this.gostergeleriTazele()
    if (!this.oyun.calisiyor) return

    const sonuc = this.oyun.ilerlet(delta)

    this.isabetleriIsle(sonuc.isabetler)
    for (const saplanan of sonuc.saplananlar) this.saplananCiz(saplanan.x, saplanan.aci)
    if (sonuc.kaleVuruldu) this.kaleHasari()
    if (sonuc.kuleAtti) sesler.tik()
    if (sonuc.bitenDalga !== null) this.dalgaBitti(sonuc.bitenDalga)
    if (sonuc.yeniDalga !== null) this.dalgaBasladi(sonuc.yeniDalga)

    this.canavarlariEsle()
    this.atislariEsle()

    if (sonuc.oyunBitti) this.oyunuBitir()
  }

  /** Nişan, kale barı ve rozetler — duraklamada da doğru görünsün. */
  private gostergeleriTazele(): void {
    this.nisanCiz()
    this.kale.nisanAyarla(this.oyun.aci)
    this.kale.hazirGoster(this.oyun.atisHazir)
    this.kale.canGoster(this.oyun.kaleCani, KALE_CANI)
    setChip('castle', this.oyun.kaleCani)
    setChip('gold', this.oyun.altin)
    if (this.gosterilenSkor === this.oyun.skor) return
    this.gosterilenSkor = this.oyun.skor
    this.skorGoster(this.oyun.skor)
  }

  // --- Girdi ---

  /** Sayfadaki araç çubuğu düğmesini bağlar (Saldır, Duraklat). */
  private padDugmesi(deger: string, isle: () => void): void {
    const dugme = document.querySelector<HTMLButtonElement>(`#pad button[data-move="${deger}"]`)
    if (!dugme) return
    const bas = (): void => isle()
    dugme.addEventListener('click', bas)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', bas))
  }

  /** Malzeme panelindeki düğmeler; yazıları ve pasifliği her karede tazelenir. */
  private malzemeDugmeleri(): void {
    for (const malzeme of MALZEMELER) {
      const dugme = document.querySelector<HTMLButtonElement>(`#malzeme button[data-malzeme="${malzeme.id}"]`)
      if (!dugme) continue
      this.malzemeButonlari.set(malzeme.id, dugme)
      const bas = (): void => this.malzemeAl(malzeme.id)
      dugme.addEventListener('click', bas)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', bas))
    }
  }

  private malzemeAl(id: string): void {
    if (!this.oyun.malzemeAl(id)) {
      sesler.yanlis()
      return
    }
    const malzeme = MALZEMELER.find((m) => m.id === id)
    sesler.dogru()
    this.bildir(malzeme?.ozet ?? 'Malzeme alındı')
  }

  /** Parası yetmeyen ya da alınmış malzemenin düğmesi kapansın. */
  private malzemeleriTazele(): void {
    const imza = `${this.oyun.altin}|${this.oyun.kaleCani}|${this.oyun.asama}|${[...this.oyun.alinanMalzemeler].sort().join(',')}`
    if (imza === this.malzemeImza) return
    this.malzemeImza = imza

    for (const malzeme of MALZEMELER) {
      const dugme = this.malzemeButonlari.get(malzeme.id)
      if (!dugme) continue
      const alindi = malzeme.tekSeferlik && this.oyun.alinanMalzemeler.has(malzeme.id)
      dugme.disabled = !this.oyun.malzemeAlinabilir(malzeme.id)
      dugme.setAttribute('aria-pressed', String(alindi))
      const durum = dugme.querySelector('b')
      if (durum) durum.textContent = alindi ? 'alındı' : String(malzeme.fiyat)
    }
  }

  // --- Başlat / duraklat ---

  private basla(): void {
    if (!this.oyun.basla()) return
    this.hud.hideOverlay()
  }

  private duraklatDegistir(): void {
    if (this.bitti || this.yaziyor) return
    if (this.oyun.asama === 'hazir') {
      this.basla()
      return
    }
    if (this.oyun.duraklatDegistir()) {
      // Süre de dursun: duraklatma skoru şişirmesin.
      this.sayac.durdur()
      this.duraklatmaEkrani()
      return
    }
    this.sayac.basla()
    this.hud.hideOverlay()
  }

  private baslatEkrani(): void {
    this.hud.showOverlay({
      title: 'Kale Savunması',
      text: 'Canavarlar sağdan geliyor. Mızrakla vur, altınla kule kur, kaleyi ayakta tut.',
      primaryLabel: '▶ Başlat',
      onPrimary: () => this.basla(),
    })
  }

  private duraklatmaEkrani(): void {
    this.hud.showOverlay({
      title: 'Duraklatıldı',
      text: `Dalga ${this.oyun.dalga} · Kale ${this.oyun.kaleCani} · Altın ${this.oyun.altin}`,
      primaryLabel: '▶ Devam et',
      onPrimary: () => {
        this.oyun.devam()
        this.sayac.basla()
        this.hud.hideOverlay()
      },
      secondaryLabel: 'Yeni oyun',
      onSecondary: () => this.yenidenBasla(),
    })
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

  private atislariEsle(): void {
    const ucan = new Set<number>()
    for (const atis of this.oyun.atislar) {
      ucan.add(atis.id)
      let gorunum = this.mizrakGorunumleri.get(atis.id)
      if (!gorunum) {
        gorunum = atis.tur === 'ok' ? this.okYap() : this.mizrakYap()
        this.mizrakKatmani.add(gorunum)
        this.mizrakGorunumleri.set(atis.id, gorunum)
      }
      gorunum.setPosition(atis.x, atis.y)
      // Cisim uçtuğu yöne bakar: yay boyunca ucu aşağı döner.
      gorunum.setRotation(Math.atan2(atis.vy, atis.vx))
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

  /** Kule oku: mızraktan kısa, arkasında tüy var. */
  private okYap(): Phaser.GameObjects.Container {
    return this.add.container(0, 0, [
      this.add.rectangle(-OK_BOY / 2, 0, OK_BOY, OK_KALINLIK, COLORS.OK_SAP).setOrigin(0, 0.5),
      this.add.triangle(OK_BOY / 2, 0, 0, -3, 6, 0, 0, 3, COLORS.OK_UC),
      this.add.rectangle(-OK_BOY / 2 + 2, 0, 4, OK_KALINLIK + 3, COLORS.OK_UC).setOrigin(0, 0.5),
    ])
  }

  private kuleAl(yuva: number, tip: number): void {
    if (this.oyun.kuleAl(yuva, tip)) {
      sesler.dogru()
      this.bildir(`${KULE_TIPLERI[tip].ad} kuruldu`)
      return
    }
    sesler.yanlis()
  }

  private kuleYukselt(yuva: number): void {
    if (!this.oyun.kuleYukselt(yuva)) {
      sesler.yanlis()
      return
    }
    sesler.birlesme(this.oyun.kuleler[yuva]?.seviye ?? 2)
    this.bildir(`Kule Lv${this.oyun.kuleler[yuva]?.seviye} oldu`)
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

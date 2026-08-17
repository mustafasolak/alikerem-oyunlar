import * as Phaser from 'phaser'

import { KATMAN, acikTon, koyuTon, nisanIzi } from '../../../shared/Gorsel.ts'
import { TemelSahne } from '../../../shared/TemelSahne.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { butonGrubu, setChip } from '../../../shared/dom.ts'
import {
  ACI_ADIM,
  COLORS,
  DALGA_BONUSU,
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_RENGI,
  ELEMENT_SIMGE,
  FONT_FAMILY,
  GAME_WIDTH,
  GENIS_EKRAN_ESIGI,
  HASAR_YAZI_MS,
  KRITIK_YAZI_OLCEK,
  ISABET_EFEKT_MS,
  KALE_SARSINTI_GUC,
  KALE_SARSINTI_MS,
  KULE_TIPLERI,
  MIZRAK_BOY,
  MIZRAK_KALINLIK,
  NISAN_NOKTA_ARALIK,
  OK_BOY,
  OK_KALINLIK,
  OVERLAY_GECIKME_MS,
  SAPLANAN_OMUR_MS,
  YUKSELTMELER,
  ZEMIN_Y,
  ZINCIR_EFEKT_MS,
  ZORLUKLAR,
  patronDalgasiMi,
} from '../config/constants.ts'
import { acikDunyaSayisi, dunyaAcikMi, oldurulenEkle, sonrakiDunyayaKalan } from '../systems/Ilerleme.ts'
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
  /** Kalıcı toplama yazılmış öldürme sayısı (tur içinde artar). */
  private kaydedilenOldurme = 0
  private acikDunya = acikDunyaSayisi()
  private dunyayiIsaretle?: (deger: string) => void

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

    klavye?.on('keydown-E', () => this.elementDegistir())
    this.padDugmesi('at', () => this.at())
    this.padDugmesi('element', () => this.elementDegistir())
    this.padDugmesi('otomatik', () => this.otomatikDegistir())
    this.padDugmesi('duraklat', () => this.duraklatDegistir())
    this.malzemeDugmeleri()
    this.dunyaDugmeleri()
    this.zorlukDugmeleri()
    this.panelleriAc()
  }

  /**
   * Geniş ekranda paneller açık başlar; telefonda kapalı kalır ki tahta
   * ekranın çoğunu alsın.
   */
  private panelleriAc(): void {
    if (window.innerWidth < GENIS_EKRAN_ESIGI) return
    for (const kutu of document.querySelectorAll<HTMLDetailsElement>('details.katlanir')) kutu.open = true
  }

  /** Zorluk seçimi: seçim değişince tur baştan başlar. */
  private zorlukDugmeleri(): void {
    const isaretle = butonGrubu('toolbar', 'level', (deger) => {
      const sira = ZORLUKLAR.findIndex((z) => z.id === deger)
      if (sira < 0 || sira === this.oyun.zorlukSira) return
      this.oyun.zorlukSec(sira)
      this.yenidenBasla()
      this.bildir(`${ZORLUKLAR[sira].ad} seviye`)
    })
    isaretle(this.oyun.zorluk.id)
  }

  // --- Dünyalar ---

  /**
   * Dünya seçimi. Kilitli dünyanın düğmesi kapalı durur ve üstünde kaç
   * canavar kaldığı yazar; oyuncu hedefi görsün.
   */
  private dunyaDugmeleri(): void {
    this.dunyayiIsaretle = butonGrubu('dunya', 'dunya', (deger) => {
      const sira = Number(deger)
      if (!dunyaAcikMi(sira)) {
        // Kilitli: seçimi geri al, ne kadar kaldığını söyle.
        this.dunyayiIsaretle?.(String(this.oyun.dunyaSira))
        sesler.yanlis()
        this.bildir(`${sonrakiDunyayaKalan() ?? 0} canavar daha!`)
        return
      }
      this.oyun.dunyaSec(sira)
      this.yenidenBasla()
    })
    this.dunyalariTazele()
  }

  /** Kilitli dünyaların düğmesini kapatır, kalan sayıyı yazar. */
  private dunyalariTazele(): void {
    const kalan = sonrakiDunyayaKalan()
    for (let sira = 0; sira < DUNYALAR.length; sira++) {
      const dugme = document.querySelector<HTMLButtonElement>(`#dunya button[data-dunya="${sira}"]`)
      if (!dugme) continue
      const acik = dunyaAcikMi(sira)
      dugme.disabled = !acik
      dugme.textContent = acik ? DUNYALAR[sira].kisaAd : `🔒 ${DUNYALAR[sira].kisaAd} · ${kalan}`
      dugme.title = acik ? DUNYALAR[sira].ad : `${kalan} canavar daha öldür`
    }
    this.dunyayiIsaretle?.(String(this.oyun.dunyaSira))
  }

  /**
   * Tur içinde öldürülenleri kalıcı toplama yazar. Dalga sonunda ve oyun
   * bitince çağrılır: her öldürmede depolamaya yazmaya gerek yok.
   */
  private ilerlemeyiKaydet(): void {
    const yeni = this.oyun.oldurulen - this.kaydedilenOldurme
    if (yeni <= 0) return
    this.kaydedilenOldurme = this.oyun.oldurulen

    const oncekiAcik = this.acikDunya
    const toplam = oldurulenEkle(yeni)
    this.acikDunya = acikDunyaSayisi(toplam)
    this.dunyalariTazele()

    if (this.acikDunya <= oncekiAcik) return
    sesler.zafer()
    this.bildir(`${DUNYALAR[this.acikDunya - 1].ad} açıldı!`)
  }

  protected yeniOyun(): void {
    this.ilerlemeyiKaydet()
    this.oyun.reset()
    this.kaydedilenOldurme = 0
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
    this.arkaPlan.sifirla(1, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
    this.kale.sifirla()
    this.kale.canGoster(this.oyun.maxKaleCani, this.oyun.maxKaleCani)
    this.kuleAlani.sifirla()
    this.kuleAlani.tazele(this.oyun.kuleler, this.oyun.altin)
    this.bildirim.setAlpha(0)

    setChip('wave', 'Hazır')
    setChip('castle', this.oyun.maxKaleCani)
    setChip('gold', this.oyun.altin)
    this.skorGoster(0)
    this.nisanCiz()
    this.malzemeleriTazele()
    this.padYazilariniTazele()
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
    for (const zincir of sonuc.zincirler) this.zincirCiz(zincir)
    for (const patlama of sonuc.patlamalar) this.patlamaCiz(patlama)
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
    this.kale.canGoster(this.oyun.kaleCani, this.oyun.maxKaleCani)
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

  /** Yükseltme panelindeki düğmeler; fiyat ve seviye yazısı sonra tazelenir. */
  private malzemeDugmeleri(): void {
    for (const y of YUKSELTMELER) {
      const dugme = document.querySelector<HTMLButtonElement>(`#malzeme button[data-yukseltme="${y.id}"]`)
      if (!dugme) continue
      this.malzemeButonlari.set(y.id, dugme)
      const bas = (): void => this.yukseltmeAl(y.id)
      dugme.addEventListener('click', bas)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => dugme.removeEventListener('click', bas))
    }
  }

  private yukseltmeAl(id: string): void {
    if (!this.oyun.yukseltmeAl(id)) {
      sesler.yanlis()
      return
    }
    const y = YUKSELTMELER.find((k) => k.id === id)
    sesler.dogru()
    const seviye = this.oyun.yukseltmeSeviyesi(id)
    // Seviyeli yükseltmede kaçıncı seviyeye çıktığı da görünsün.
    const ek = y && y.maxSeviye > 1 ? ` · Lv${seviye}` : ''
    this.bildir(`${y?.ozet ?? 'Yükseltme alındı'}${ek}`)
    this.padYazilariniTazele()
  }

  /**
   * Fiyat, seviye ve pasiflik durumunu düğmelere yazar.
   * Her karede DOM'a yazmamak için imzayla korunuyor.
   */
  private malzemeleriTazele(): void {
    const seviyeler = YUKSELTMELER.map((y) => this.oyun.yukseltmeSeviyesi(y.id)).join(',')
    const imza = `${this.oyun.altin}|${this.oyun.kaleCani}|${this.oyun.asama}|${seviyeler}`
    if (imza === this.malzemeImza) return
    this.malzemeImza = imza

    for (const y of YUKSELTMELER) {
      const dugme = this.malzemeButonlari.get(y.id)
      if (!dugme) continue
      const seviye = this.oyun.yukseltmeSeviyesi(y.id)
      const fiyat = this.oyun.yukseltmeFiyatiSimdi(y.id)
      dugme.disabled = !this.oyun.yukseltmeAlinabilir(y.id)
      dugme.setAttribute('aria-pressed', String(seviye > 0))

      const durum = dugme.querySelector('b')
      if (!durum) continue
      if (fiyat === null) durum.textContent = y.maxSeviye === 1 ? 'alındı' : 'tam'
      else if (y.maxSeviye > 1) durum.textContent = `Lv${seviye}/${y.maxSeviye} · ${fiyat}`
      else durum.textContent = String(fiyat)
    }
  }

  // --- Element ve otomatik ateş ---

  /** Element düğmesi açık elementler arasında sırayla geçer. */
  private elementDegistir(): void {
    const acik = this.oyun.acikElementler
    if (acik.length < 2) {
      sesler.yanlis()
      this.bildir('Önce element mızrağı al')
      return
    }
    const sonraki = acik[(acik.indexOf(this.oyun.element) + 1) % acik.length]
    this.oyun.elementSec(sonraki)
    sesler.tik()
    this.padYazilariniTazele()
    this.bildir(`${ELEMENT_SIMGE[sonraki]} ${ELEMENT_ADI[sonraki]}`)
  }

  private otomatikDegistir(): void {
    if (!this.oyun.otomatikDegistir()) {
      sesler.yanlis()
      this.bildir('Önce otomatik ateşi al')
      return
    }
    sesler.tik()
    this.padYazilariniTazele()
    this.bildir(this.oyun.otomatik ? 'Otomatik ateş açık' : 'Otomatik ateş kapalı')
  }

  /** Element ve otomatik düğmelerinin yazısını güncel duruma çeker. */
  private padYazilariniTazele(): void {
    const element = document.querySelector<HTMLButtonElement>('#pad button[data-move="element"]')
    if (element) {
      element.textContent = `${ELEMENT_SIMGE[this.oyun.element]} ${ELEMENT_ADI[this.oyun.element]}`
      element.setAttribute('aria-pressed', String(this.oyun.element !== 'normal'))
    }
    const otomatik = document.querySelector<HTMLButtonElement>('#pad button[data-move="otomatik"]')
    if (otomatik) otomatik.setAttribute('aria-pressed', String(this.oyun.otomatik))
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
        gorunum = new CanavarGorunumu(this, canavar, this.oyun.tipler[canavar.tip])
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
        gorunum = atis.tur === 'ok' ? this.kuleAtisiYap(atis) : this.mizrakYap(ELEMENT_RENGI[atis.element])
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

  private mizrakYap(ucRengi: number = COLORS.MIZRAK_UC): Phaser.GameObjects.Container {
    return this.add.container(0, 0, [
      this.add.rectangle(-MIZRAK_BOY / 2, 0, MIZRAK_BOY, MIZRAK_KALINLIK, COLORS.MIZRAK_SAP).setOrigin(0, 0.5),
      this.add.triangle(MIZRAK_BOY / 2, 0, 0, -4, 9, 0, 0, 4, ucRengi),
    ])
  }

  /**
   * Kule atışı: tipine göre ok, gülle ya da büyü topu.
   * Tip, atışın taşıdığı özelliklerden anlaşılıyor (alan / zırh delici).
   */
  private kuleAtisiYap(atis: { alan: number; zirhDelici: boolean }): Phaser.GameObjects.Container {
    if (atis.alan > 0) {
      // Gülle: koyu top + kısa fitil
      return this.add.container(0, 0, [
        this.add.circle(0, 0, 6, koyuTon(KULE_TIPLERI[1].renk, 0.35)),
        this.add.circle(-2, -2, 2.4, acikTon(KULE_TIPLERI[1].renk, 0.5)),
      ])
    }
    if (atis.zirhDelici) {
      // Büyü topu: parlayan halka + çekirdek
      return this.add.container(0, 0, [
        this.add.circle(0, 0, 8, KULE_TIPLERI[2].renk, 0.45),
        this.add.circle(0, 0, 4.5, acikTon(KULE_TIPLERI[2].renk, 0.6)),
        this.add.circle(0, 0, 2, 0xffffff),
      ])
    }
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

      // Her vuruşta geçen hasar sayı olarak görünsün; kritik daha büyük ve altın.
      if (isabet.hasar > 0) this.hasarYaz(isabet.x, isabet.y, isabet.hasar, isabet.kritik)

      if (!isabet.oldu) {
        gorunum.hasarGoster()
        if (isabet.kritik) sesler.dogru()
        else sesler.tik()
        continue
      }

      this.canavarGorunumleri.delete(isabet.canavarId)
      gorunum.oldur()
      sesler.patlama()
      // Puan canavarın doğduğu dalgaya göre; ileri dalgalar daha çok verir.
      this.hud.showGain(isabet.puan)
      this.puanYaz(isabet.x, isabet.y, isabet.puan)
    }
  }

  private dalgaBasladi(dalga: number): void {
    setChip('wave', dalga)
    this.arkaPlan.vakitGuncelle(dalga, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
    // Şef dalgası ayrıca duyurulsun: oyuncu hazırlansın.
    this.bildir(patronDalgasiMi(dalga) ? `Dalga ${dalga} · ŞEF geliyor!` : `Dalga ${dalga}`)
    sesler.otur()
    if (this.baslamisMi) return
    this.sayac.basla()
    this.baslamisMi = true
  }

  private dalgaBitti(dalga: number): void {
    this.ilerlemeyiKaydet()
    this.bildir(`${dalga}. dalga temizlendi  +${DALGA_BONUSU}`)
    this.hud.showGain(DALGA_BONUSU)
    sesler.dogru()
  }

  private kaleHasari(): void {
    this.cameras.main.shake(KALE_SARSINTI_MS, KALE_SARSINTI_GUC)
    sesler.yanlis()
  }

  private oyunuBitir(): void {
    this.ilerlemeyiKaydet()
    const ozet = `${DUNYALAR[this.oyun.dunyaSira].ad} · ${this.oyun.dalga}. dalga · ${this.oyun.oldurulen} canavar · Skor: ${this.oyun.skor}`
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

  /** Şimşeğin atladığı yol: kısa süre görünen sarı çizgi. */
  private zincirCiz(zincir: { x1: number; y1: number; x2: number; y2: number }): void {
    const cizim = this.add.graphics().setDepth(KATMAN.EFEKT)
    cizim.lineStyle(3, ELEMENT_RENGI.simsek, 0.95)
    cizim.lineBetween(zincir.x1, zincir.y1, zincir.x2, zincir.y2)
    this.tweens.add({
      targets: cizim,
      alpha: 0,
      duration: ZINCIR_EFEKT_MS,
      onComplete: () => cizim.destroy(),
    })
  }

  /** Hasar sayısı: yükselip sönen yazı. Kritik altın ve daha büyük. */
  private hasarYaz(x: number, y: number, hasar: number, kritik: boolean): void {
    const yazi = this.add
      .text(x, y - 6, kritik ? `${hasar}!` : String(hasar), {
        fontFamily: FONT_FAMILY,
        fontSize: kritik ? '18px' : '13px',
        color: kritik ? '#fde047' : '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(KATMAN.NISAN)
      .setScale(kritik ? KRITIK_YAZI_OLCEK : 1)
    this.tweens.add({
      targets: yazi,
      y: y - 34,
      alpha: 0,
      scale: 1,
      duration: HASAR_YAZI_MS,
      onComplete: () => yazi.destroy(),
    })
  }

  /** Bomba patlaması: menzili gösteren büyüyüp sönen halka. */
  private patlamaCiz(patlama: { x: number; y: number; yaricap: number }): void {
    const halka = this.add.circle(patlama.x, patlama.y, patlama.yaricap, KULE_TIPLERI[1].renk, 0.3).setDepth(KATMAN.EFEKT)
    this.tweens.add({
      targets: halka,
      scale: 1.35,
      alpha: 0,
      duration: ISABET_EFEKT_MS * 1.6,
      onComplete: () => halka.destroy(),
    })
    sesler.patlama()
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

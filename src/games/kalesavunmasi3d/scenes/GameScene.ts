/**
 * Kale Savunması 3B — sahne.
 *
 * Oyunun beyni iki boyutlu sürümle bire bir aynı: `systems/KaleSavunmasi.ts`
 * paylaşılıyor, burada tek satır oyun mantığı yok. Sahne yalnız o mantığın
 * durumunu üç boyutlu dünyaya çeviriyor:
 *
 *   sim x → z (derinlik)   sim y → y (yükseklik)   yanal yer buradan veriliyor
 *
 * Nişan alma da aynı sözleşmeye bağlı: işaretçiden çıkan ışın yolun orta
 * düzlemiyle kesiştiriliyor, çıkan nokta sim koordinatına çevrilip
 * `nisanlaNokta()`ya veriliyor. Mantık nereye tıklandığını üç boyutlu bilmiyor.
 */

import * as THREE from 'three'

import { setChip } from '../../../shared/dom.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { UcBoyutSahne } from '../../../shared/UcBoyutSahne.ts'
import {
  ACI_ADIM,
  DALGA_BONUSU,
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_RENGI,
  ELEMENT_SIMGE,
  GENIS_EKRAN_ESIGI,
  KULE_TIPLERI,
  OVERLAY_GECIKME_MS,
  YUKSELTMELER,
  ZEMIN_Y,
  ZORLUKLAR,
  patronDalgasiMi,
} from '../../kalesavunmasi/config/constants.ts'
import { acikDunyaSayisi, dunyaAcikMi, oldurulenEkle, sonrakiDunyayaKalan } from '../../kalesavunmasi/systems/Ilerleme.ts'
import { KaleSavunmasi, type Isabet } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { CERCEVE, KAMERA_HEDEF, KAMERA_PAY, KAMERA_YON, yukseklik } from '../config/sahne3d.ts'
import { Atislar3D } from './Atislar3D.ts'
import { Bildirim3D } from './Bildirim3D.ts'
import { Canavar3D } from './Canavar3D.ts'
import { Dunya3D } from './Dunya3D.ts'
import { Efektler3D } from './Efektler3D.ts'
import { Kale3D } from './Kale3D.ts'
import { Kuleler3D } from './Kuleler3D.ts'
import { Paneller3D } from './Paneller3D.ts'

/** Kritik hasar yazısının büyüklük çarpanı. */
const KRITIK_OLCEK = 1.5

export class GameScene extends UcBoyutSahne {
  private readonly oyun = new KaleSavunmasi()
  private dunya!: Dunya3D
  private kale!: Kale3D
  private kuleAlani!: Kuleler3D
  private efektler!: Efektler3D
  private paneller!: Paneller3D
  private bildirim!: Bildirim3D

  private readonly canavarGorunumleri = new Map<number, Canavar3D>()
  /** Ölüm animasyonunu sürdüren, mantıkta artık olmayan canavarlar. */
  private readonly olenler: Canavar3D[] = []
  private atislar!: Atislar3D

  private readonly isinlayici = new THREE.Raycaster()
  /** Yolun orta düzlemi: nişan ışını bununla kesişir. */
  private readonly yolDuzlemi = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)

  private cizilenAci = Number.NaN
  private baslamisMi = false
  private gosterilenSkor = -1
  private kaydedilenOldurme = 0
  private acikDunya = acikDunyaSayisi()

  constructor() {
    super('kalesavunmasi3d')
  }

  protected kur(): void {
    this.dunya = new Dunya3D(this.sahne)
    this.kale = new Kale3D(this.sahne)
    this.kuleAlani = new Kuleler3D(this.sahne)
    this.efektler = new Efektler3D(this.sahne)
    // Duyuru kameranın çocuğu; kamera sahnede olmazsa çizilmez.
    this.sahne.add(this.kamera)
    this.bildirim = new Bildirim3D(this.kamera)
    this.atislar = new Atislar3D(this.sahne, this.efektler)
    this.kamerayiOturt()

    this.tuvalOlayi('pointermove', (x, y) => this.nisanla(x, y))
    this.tuvalOlayi('pointerdown', (x, y) => this.dokun(x, y))

    this.tus('Space', () => this.at())
    this.tus(['ArrowUp', 'KeyW'], () => this.oyun.aciDegistir(-ACI_ADIM))
    this.tus(['ArrowDown', 'KeyS'], () => this.oyun.aciDegistir(ACI_ADIM))
    this.tus(['KeyP', 'Escape'], () => this.duraklatDegistir())
    this.tus('KeyE', () => this.elementDegistir())
    this.tuslariYakala(['Space', 'ArrowUp', 'ArrowDown'])

    this.padDugmesi('at', () => this.at())
    this.padDugmesi('element', () => this.elementDegistir())
    this.padDugmesi('otomatik', () => this.otomatikDegistir())
    this.padDugmesi('duraklat', () => this.duraklatDegistir())

    this.paneller = new Paneller3D(this.oyun, {
      yukseltmeAl: (id) => this.yukseltmeAl(id),
      dunyaSec: (sira) => this.dunyaSec(sira),
      zorlukSec: (sira) => this.zorlukSec(sira),
      yuvaSec: (yuva) => this.yuvaSec(yuva),
      kuleAl: (tip) => this.kuleAl(tip),
      kuleYukselt: () => this.kuleYukselt(),
      kuleYik: () => this.kuleYik(),
    })
    // Geniş ekranda paneller açık başlar; telefonda kapalı kalsın ki tahta büyük olsun.
    if (window.innerWidth >= GENIS_EKRAN_ESIGI) this.paneller.panelleriAc()
  }

  protected yeniOyun(): void {
    this.ilerlemeyiKaydet()
    this.oyun.reset()
    this.kaydedilenOldurme = 0

    for (const gorunum of this.canavarGorunumleri.values()) gorunum.yikil()
    this.canavarGorunumleri.clear()
    for (const gorunum of this.olenler) gorunum.yikil()
    this.olenler.length = 0
    this.atislar.temizle()
    this.efektler.temizle()
    this.kuleAlani.sifirla()
    this.dunya.sifirla(1, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
    this.bildirim.temizle()

    this.baslamisMi = false
    this.cizilenAci = Number.NaN
    this.gosterilenSkor = -1

    setChip('wave', 'Hazır')
    setChip('castle', this.oyun.maxKaleCani)
    setChip('gold', this.oyun.altin)
    this.skorGoster(0)
    this.nisaniCiz()
    this.paneller.padYazilariniTazele()
    this.baslatEkrani()
  }

  protected guncelle(delta: number): void {
    // Arka plan, kule animasyonu ve dükkân duraklamada da canlı: beklerken alışveriş yapılır.
    this.dunya.guncelle(delta)
    this.kale.guncelle(delta)
    this.kuleAlani.guncelle(delta)
    this.kuleAlani.tazele(this.oyun.kuleler)
    this.bildirim.guncelle(delta)
    this.efektler.guncelle(delta, this.kamera.quaternion)
    this.paneller.tazele(this.kuleAlani.seciliYuva)
    this.gostergeleriTazele()
    this.canavarlariGuncelle(delta)

    if (!this.oyun.calisiyor) return

    const sonuc = this.oyun.ilerlet(delta)

    this.isabetleriIsle(sonuc.isabetler)
    for (const saplanan of sonuc.saplananlar) this.atislar.saplanan(saplanan.x, saplanan.aci)
    for (const zincir of sonuc.zincirler) {
      this.efektler.zincir(
        new THREE.Vector3(0, yukseklik(zincir.y1), zincir.x1),
        new THREE.Vector3(0, yukseklik(zincir.y2), zincir.x2),
        ELEMENT_RENGI.simsek,
      )
    }
    for (const patlama of sonuc.patlamalar) {
      this.efektler.patlama(
        new THREE.Vector3(0, yukseklik(patlama.y), patlama.x),
        patlama.yaricap,
        KULE_TIPLERI[1].renk,
      )
      sesler.patlama()
    }
    if (sonuc.kaleVuruldu) {
      this.kale.sarsil()
      sesler.yanlis()
    }
    if (sonuc.kuleAtti) sesler.tik()
    if (sonuc.bitenDalga !== null) this.dalgaBitti(sonuc.bitenDalga)
    if (sonuc.yeniDalga !== null) this.dalgaBasladi(sonuc.yeniDalga)

    this.canavarlariEsle(delta)
    this.atislar.esle(this.oyun.atislar)

    if (sonuc.oyunBitti) this.oyunuBitir()
  }

  /** Tuval ölçüsü değişince kamera sahayı yeniden çerçeveler. */
  protected override olculerDegisti(): void {
    this.kamerayiOturt()
  }

  // --- Kamera ---

  /**
   * Kamerayı sahanın tamamını görecek uzaklığa oturtur.
   *
   * Sabit bir konum vermek yerine çerçeve kutusunun sekiz köşesi tek tek
   * sınanıyor: hangi köşe taşıyorsa kamera o kadar geriye çekiliyor. Böylece
   * tuval oranı değişse de (tam ekran, dar pencere) saha hep içeride kalıyor.
   */
  private kamerayiOturt(): void {
    const yon = new THREE.Vector3(KAMERA_YON.x, KAMERA_YON.y, KAMERA_YON.z).normalize()
    const hedef = new THREE.Vector3(KAMERA_HEDEF.x, KAMERA_HEDEF.y, KAMERA_HEDEF.z)
    const ileri = yon.clone().negate()
    const sag = new THREE.Vector3().crossVectors(ileri, new THREE.Vector3(0, 1, 0)).normalize()
    const yukari = new THREE.Vector3().crossVectors(sag, ileri).normalize()
    const tanY = Math.tan((this.kamera.fov * Math.PI) / 360)
    const tanX = tanY * this.kamera.aspect

    let uzaklik = 0
    for (const kx of [CERCEVE.x1, CERCEVE.x2]) {
      for (const ky of [CERCEVE.y1, CERCEVE.y2]) {
        for (const kz of [CERCEVE.z1, CERCEVE.z2]) {
          const v = new THREE.Vector3(kx, ky, kz).sub(hedef)
          const derinlik = v.dot(ileri)
          uzaklik = Math.max(
            uzaklik,
            Math.abs(v.dot(yukari)) / tanY - derinlik,
            Math.abs(v.dot(sag)) / tanX - derinlik,
          )
        }
      }
    }

    this.kamera.position.copy(hedef).addScaledVector(yon, uzaklik * KAMERA_PAY)
    this.kamera.lookAt(hedef)
  }

  // --- Girdi ---

  /** İşaretçinin yol düzlemine düştüğü nokta (dünya koordinatı). */
  private yolNoktasi(x: number, y: number): THREE.Vector3 | null {
    this.isinlayici.setFromCamera(new THREE.Vector2(x, y), this.kamera)
    const nokta = new THREE.Vector3()
    return this.isinlayici.ray.intersectPlane(this.yolDuzlemi, nokta) ? nokta : null
  }

  private nisanla(x: number, y: number): void {
    if (this.bitti || this.yaziyor) return
    const nokta = this.yolNoktasi(x, y)
    if (!nokta) return
    this.oyun.nisanlaNokta(nokta.z, ZEMIN_Y - nokta.y)
  }

  /** Dokunuş önce kule yuvasına bakar; yuva değilse nişan alıp atar. */
  private dokun(x: number, y: number): void {
    if (this.bitti || this.yaziyor) return
    this.isinlayici.setFromCamera(new THREE.Vector2(x, y), this.kamera)
    const kesisenler = this.isinlayici.intersectObjects(this.kuleAlani.hedefler, false)
    const yuva = kesisenler.length > 0 ? this.kuleAlani.yuvaBul(kesisenler[0].object) : null
    if (yuva !== null) {
      this.yuvaSec(yuva)
      return
    }
    this.nisanla(x, y)
    this.at()
  }

  private at(): void {
    if (this.bitti || this.yaziyor) return
    if (!this.oyun.at()) return
    this.kale.atisHareketi()
    sesler.kaydir()
  }

  // --- Kule paneli ---

  private yuvaSec(yuva: number): void {
    const yeni = this.kuleAlani.seciliYuva === yuva ? null : yuva
    this.kuleAlani.sec(yeni, this.oyun.kuleler)
    sesler.tik()
  }

  private kuleAl(tip: number): void {
    const yuva = this.kuleAlani.seciliYuva
    if (yuva === null) return
    if (!this.oyun.kuleAl(yuva, tip)) {
      sesler.yanlis()
      return
    }
    sesler.dogru()
    this.kuleAlani.sec(yuva, this.oyun.kuleler)
    this.bildir(`${KULE_TIPLERI[tip].ad} kuruldu`)
  }

  private kuleYukselt(): void {
    const yuva = this.kuleAlani.seciliYuva
    if (yuva === null) return
    if (!this.oyun.kuleYukselt(yuva)) {
      sesler.yanlis()
      return
    }
    sesler.birlesme(this.oyun.kuleler[yuva]?.seviye ?? 2)
    this.kuleAlani.sec(yuva, this.oyun.kuleler)
    this.bildir(`Kule Lv${this.oyun.kuleler[yuva]?.seviye} oldu`)
  }

  private kuleYik(): void {
    const yuva = this.kuleAlani.seciliYuva
    if (yuva === null) return
    const bedel = this.oyun.kuleYikimBedeli(yuva) ?? 0
    if (!this.oyun.kuleYik(yuva)) {
      sesler.yanlis()
      return
    }
    sesler.kaydir()
    this.kuleAlani.sec(yuva, this.oyun.kuleler)
    this.bildir(`Kule yıkıldı · +${bedel} altın`)
  }

  // --- Dükkân, dünya, zorluk ---

  private yukseltmeAl(id: string): void {
    if (!this.oyun.yukseltmeAl(id)) {
      sesler.yanlis()
      return
    }
    const y = YUKSELTMELER.find((k) => k.id === id)
    sesler.dogru()
    const seviye = this.oyun.yukseltmeSeviyesi(id)
    const ek = y && y.maxSeviye > 1 ? ` · Lv${seviye}` : ''
    this.bildir(`${y?.ozet ?? 'Yükseltme alındı'}${ek}`)
    this.paneller.padYazilariniTazele()
  }

  private dunyaSec(sira: number): void {
    if (!dunyaAcikMi(sira)) {
      this.paneller.dunyayaDon()
      sesler.yanlis()
      this.bildir(`${sonrakiDunyayaKalan() ?? 0} canavar daha!`)
      return
    }
    this.oyun.dunyaSec(sira)
    this.yenidenBasla()
  }

  private zorlukSec(sira: number): void {
    if (sira === this.oyun.zorlukSira) return
    this.oyun.zorlukSec(sira)
    this.yenidenBasla()
    this.bildir(`${ZORLUKLAR[sira].ad} seviye`)
  }

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
    this.paneller.padYazilariniTazele()
    this.bildir(`${ELEMENT_SIMGE[sonraki]} ${ELEMENT_ADI[sonraki]}`)
  }

  private otomatikDegistir(): void {
    if (!this.oyun.otomatikDegistir()) {
      sesler.yanlis()
      this.bildir('Önce otomatik ateşi al')
      return
    }
    sesler.tik()
    this.paneller.padYazilariniTazele()
    this.bildir(this.oyun.otomatik ? 'Otomatik ateş açık' : 'Otomatik ateş kapalı')
  }

  // --- Akış ---

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
      this.sayac.durdur()
      this.duraklatmaEkrani()
      return
    }
    this.sayac.basla()
    this.hud.hideOverlay()
  }

  private baslatEkrani(): void {
    this.hud.showOverlay({
      title: 'Kale Savunması 3B',
      text: 'Canavarlar yoldan geliyor. Nereye dokunursan mızrak oraya gider; altınla kule kur, kaleyi ayakta tut.',
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

  private dalgaBasladi(dalga: number): void {
    setChip('wave', dalga)
    this.dunya.vakitGuncelle(dalga, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
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

  /** Tur içinde öldürülenleri kalıcı toplama yazar (dünya açılışı buna bağlı). */
  private ilerlemeyiKaydet(): void {
    const yeni = this.oyun.oldurulen - this.kaydedilenOldurme
    if (yeni <= 0) return
    this.kaydedilenOldurme = this.oyun.oldurulen

    const oncekiAcik = this.acikDunya
    const toplam = oldurulenEkle(yeni)
    this.acikDunya = acikDunyaSayisi(toplam)
    this.paneller.dunyalariTazele()

    if (this.acikDunya <= oncekiAcik) return
    sesler.zafer()
    this.bildir(`${DUNYALAR[this.acikDunya - 1].ad} açıldı!`)
  }

  // --- Görünüm eşlemesi ---

  private gostergeleriTazele(): void {
    this.nisaniCiz()
    this.kale.nisanla(this.oyun.aci)
    this.atislar.kamerayaBak(this.kamera.quaternion)
    setChip('castle', this.oyun.kaleCani)
    setChip('gold', this.oyun.altin)
    if (this.gosterilenSkor === this.oyun.skor) return
    this.gosterilenSkor = this.oyun.skor
    this.skorGoster(this.oyun.skor)
  }

  private canavarlariGuncelle(delta: number): void {
    for (let i = this.olenler.length - 1; i >= 0; i--) {
      const gorunum = this.olenler[i]
      gorunum.olumIlerlet(delta)
      if (!gorunum.bittiMi) continue
      gorunum.yikil()
      this.olenler.splice(i, 1)
    }
  }

  private canavarlariEsle(delta: number): void {
    const yasayan = new Set<number>()
    for (const canavar of this.oyun.canavarlar) {
      yasayan.add(canavar.id)
      let gorunum = this.canavarGorunumleri.get(canavar.id)
      if (!gorunum) {
        gorunum = new Canavar3D(this.sahne, canavar, this.oyun.tipler[canavar.tip])
        this.canavarGorunumleri.set(canavar.id, gorunum)
      }
      gorunum.guncelle(canavar, delta, this.kamera.quaternion)
    }

    for (const [id, gorunum] of this.canavarGorunumleri) {
      if (yasayan.has(id)) continue
      gorunum.yikil()
      this.canavarGorunumleri.delete(id)
    }
  }

  private isabetleriIsle(isabetler: Isabet[]): void {
    for (const isabet of isabetler) {
      const gorunum = this.canavarGorunumleri.get(isabet.canavarId)
      const yanal = gorunum?.kok.position.x ?? 0
      const konum = new THREE.Vector3(yanal, yukseklik(isabet.y), isabet.x)
      this.efektler.isabet(konum)
      if (isabet.hasar > 0) {
        this.efektler.yazi(
          konum.clone().setY(konum.y + 12),
          isabet.kritik ? `${isabet.hasar}!` : String(isabet.hasar),
          isabet.kritik ? '#fde047' : '#f8fafc',
          isabet.kritik ? KRITIK_OLCEK : 1,
        )
      }
      if (!gorunum) continue

      if (!isabet.oldu) {
        gorunum.vuruldu()
        if (isabet.kritik) sesler.dogru()
        else sesler.tik()
        continue
      }

      this.canavarGorunumleri.delete(isabet.canavarId)
      gorunum.ol()
      this.olenler.push(gorunum)
      sesler.patlama()
      this.hud.showGain(isabet.puan)
      this.efektler.yazi(konum.clone().setY(konum.y + 30), `+${isabet.puan}`, '#f8fafc')
    }
  }

  // --- Çizim ---

  /** Nişan izi yalnız açı değişince yeniden çizilir. */
  private nisaniCiz(): void {
    if (this.oyun.aci === this.cizilenAci) return
    this.cizilenAci = this.oyun.aci
    this.atislar.nisaniCiz(this.oyun.nisanYolu())
  }

  private bildir(metin: string): void {
    this.bildirim.yaz(metin)
  }

  override yikil(): void {
    this.paneller?.yikil()
    this.efektler?.bosalt()
    super.yikil()
  }
}

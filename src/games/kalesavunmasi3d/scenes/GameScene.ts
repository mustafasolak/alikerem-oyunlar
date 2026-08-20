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
import { readScore, writeScore } from '../../../shared/safeStorage.ts'
import { sesler } from '../../../shared/Sesler.ts'
import { UcBoyutSahne } from '../../../shared/UcBoyutSahne.ts'
import {
  ACI_ADIM,
  DALGA_BONUSU,
  HEDEFLEME_KURALLARI,
  dalgaCanavarSayisi,
  DUNYALAR,
  ELEMENT_ADI,
  ELEMENT_RENGI,
  ELEMENT_SIMGE,
  GENIS_EKRAN_ESIGI,
  VARSAYILAN_ZORLUK,
  KULE_TIPLERI,
  OVERLAY_GECIKME_MS,
  YUKSELTMELER,
  ZEMIN_Y,
  ZORLUKLAR,
  patronDalgasiMi,
} from '../../kalesavunmasi/config/constants.ts'
import {
  acikDunyaSayisi,
  dalgaRekoru,
  dalgaRekoruYaz,
  dunyaAcikMi,
  oldurulenEkle,
  sonrakiDunyayaKalan,
} from '../../kalesavunmasi/systems/Ilerleme.ts'
import { KaleSavunmasi, type Isabet } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import {
  EGIM_ALT,
  EGIM_UST,
  KAMERALAR,
  KAMERA_FOV,
  KAMERA_YUMUSAMA,
  SAPMA_SINIRI,
  SURUKLE_EGIM_HIZI,
  SURUKLE_ESIGI,
  SERIT_ADET,
  SURUKLE_SAPMA_HIZI,
  ZEMIN_NISAN_PAYI,
  seritX,
  kaliteSec,
  type KameraAyari,
  yukseklik,
} from '../config/sahne3d.ts'
import { Atislar3D } from './Atislar3D.ts'
import { Bildirim3D } from './Bildirim3D.ts'
import { Dukkan3D, type DukkanSatiri } from './Dukkan3D.ts'
import { Canavar3D } from './Canavar3D.ts'
import { Dunya3D } from './Dunya3D.ts'
import { Efektler3D } from './Efektler3D.ts'
import { Kale3D } from './Kale3D.ts'
import { Kuleler3D } from './Kuleler3D.ts'
import { KuleMenu3D, type MenuDurum, type MenuEylem } from './KuleMenu3D.ts'
import { Onizleme3D } from './Onizleme3D.ts'
import { Paneller3D } from './Paneller3D.ts'

/** Kritik hasar yazısının büyüklük çarpanı. */
const KRITIK_OLCEK = 1.5
/** Seçilen kamera açısı burada saklanıyor; sıfır anlamsız olmasın diye +1. */
const KAMERA_ANAHTARI = 'kalesavunmasi3d:kamera'

export class GameScene extends UcBoyutSahne {
  // Üç şeritli yol: mantık şeridi taşıyor, dünyadaki yeri sahne veriyor.
  private readonly oyun = new KaleSavunmasi(Math.random, 0, VARSAYILAN_ZORLUK, SERIT_ADET)
  private dunya!: Dunya3D
  private kale!: Kale3D
  private kuleAlani!: Kuleler3D
  private efektler!: Efektler3D
  private paneller!: Paneller3D
  private bildirim!: Bildirim3D
  private kuleMenu!: KuleMenu3D
  private dukkan!: Dukkan3D
  private onizleme!: Onizleme3D
  /** Dükkânı açarken oyunu biz mi duraklattık? Kapanınca ona göre sürdürülür. */
  private dukkanDuraklatti = false
  /**
   * Gerçek gölge açık mı? Telefonda kapalı: gölge haritası her karede ikinci
   * bir çizim demek, orada yassı daire gölgeler yetiyor.
   */
  private gercekGolge = false

  private readonly canavarGorunumleri = new Map<number, Canavar3D>()
  /** Ölüm animasyonunu sürdüren, mantıkta artık olmayan canavarlar. */
  private readonly olenler: Canavar3D[] = []
  private atislar!: Atislar3D

  private readonly isinlayici = new THREE.Raycaster()
  /** Nişan ışınının kesiştiği düzlemler: seçili şeridin dikeyi ve yer (y=0). */
  private readonly seritDuzlemi = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)
  private readonly zeminDuzlemi = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  /** Seçili kamera açısı ve geçişin gittiği yer. */
  private kameraSira = 0
  /** Sürükleyerek eklenen bakış açısı (radyan). */
  private sapmaEk = 0
  private egimEk = 0
  /** Sürükleme durumu: dokunuş atışa mı gidecek, kamerayı mı çevirecek? */
  private surukleAcik = false
  private suruklendi = false
  private sonNokta = { x: 0, y: 0 }
  private readonly kameraKonumu = new THREE.Vector3()
  private readonly bakisHedefi = new THREE.Vector3()
  private readonly bakis = new THREE.Vector3()

  private cizilenAci = Number.NaN
  private baslamisMi = false
  private gosterilenSkor = -1
  private kaydedilenOldurme = 0
  private acikDunya = acikDunyaSayisi()

  constructor() {
    super('kalesavunmasi3d')
  }

  protected kur(): void {
    const kalite = kaliteSec(window.innerWidth, navigator.hardwareConcurrency ?? 4, GENIS_EKRAN_ESIGI)
    this.gercekGolge = kalite.golge
    this.cizici.setPixelRatio(Math.min(window.devicePixelRatio, kalite.piksel))
    if (this.gercekGolge) {
      this.cizici.shadowMap.enabled = true
      this.cizici.shadowMap.type = THREE.PCFSoftShadowMap
    }
    // Son seçilen kamera açısı hatırlansın.
    this.kameraSira = Math.max(0, Math.min(KAMERALAR.length - 1, readScore(KAMERA_ANAHTARI) - 1))
    this.dunya = new Dunya3D(this.sahne, kalite)
    this.kale = new Kale3D(this.sahne, this.gercekGolge)
    this.kuleAlani = new Kuleler3D(this.sahne, this.gercekGolge)
    this.kuleMenu = new KuleMenu3D(this.sahne)
    this.efektler = new Efektler3D(this.sahne)
    // Duyuru kameranın çocuğu; kamera sahnede olmazsa çizilmez.
    this.sahne.add(this.kamera)
    this.bildirim = new Bildirim3D(this.kamera)
    this.onizleme = new Onizleme3D(this.kamera)
    this.dukkan = new Dukkan3D(this.kamera)
    this.atislar = new Atislar3D(this.sahne, this.efektler)
    this.kamerayiOturt(true)

    this.tuvalOlayi('pointermove', (x, y) => this.tuvalHareketi(x, y))
    this.tuvalOlayi('pointerdown', (x, y) => this.dokun(x, y))
    this.tuvalOlayi('pointerup', (x, y) => this.dokunusuBirak(x, y))
    this.tuvalOlayi('pointerleave', () => this.suruklemeyiBitir())
    this.tuvalOlayi('pointercancel', () => this.suruklemeyiBitir())

    this.tus('Space', () => this.at())
    this.tus(['ArrowUp', 'KeyW'], () => this.oyun.aciDegistir(-ACI_ADIM))
    this.tus(['ArrowDown', 'KeyS'], () => this.oyun.aciDegistir(ACI_ADIM))
    this.tus(['KeyP', 'Escape'], () => this.duraklatDegistir())
    this.tus('KeyE', () => this.elementDegistir())
    this.tus('KeyC', () => this.kameraDegistir())
    this.tus('KeyM', () => this.dukkanDegistir())
    this.tuslariYakala(['Space', 'ArrowUp', 'ArrowDown'])

    this.padDugmesi('at', () => this.at())
    this.padDugmesi('element', () => this.elementDegistir())
    this.padDugmesi('otomatik', () => this.otomatikDegistir())
    this.padDugmesi('kamera', () => this.kameraDegistir())
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
    this.kuleMenu.kapat()
    this.dukkaniKapat()
    this.dunya.sifirla(1, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
    this.mesaleleriAyarla()
    this.bildirim.temizle()
    this.onizleme.gizle()

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
    this.kamerayiSuzdur(delta)
    this.dunya.guncelle(delta)
    this.kale.guncelle(delta, this.kamera.quaternion)
    this.kuleAlani.guncelle(delta)
    this.kuleAlani.tazele(this.oyun.kuleler)
    this.menuyuTazele()
    this.bildirim.guncelle(delta)
    this.onizlemeyiTazele()
    this.dukkan.yerlestir(this.kamera)
    this.dukkan.tazele(this.dukkanSatirlari(), this.oyun.altin)
    this.efektler.guncelle(delta, this.kamera.quaternion)
    this.paneller.tazele(this.kuleAlani.seciliYuva)
    this.gostergeleriTazele()
    this.canavarlariGuncelle(delta)

    if (!this.oyun.calisiyor) return

    const sonuc = this.oyun.ilerlet(delta)

    this.isabetleriIsle(sonuc.isabetler)
    for (const saplanan of sonuc.saplananlar) this.atislar.saplanan(saplanan.x, saplanan.aci, seritX(this.oyun.serit))
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
    for (const sok of sonuc.soklar) {
      this.efektler.sok(new THREE.Vector3(0, 0, sok.x), sok.yaricap)
      sesler.patlama()
      this.bildir('Şef şoku! Kuleler sersemledi')
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
    this.kamerayiOturt(true)
  }

  // --- Kamera ---

  private get kameraAyari(): KameraAyari {
    return KAMERALAR[this.kameraSira]
  }

  /** 🎥 tuşu: sıradaki açıya geçer. Geçiş yumuşak, dünya gözle döner. */
  private kameraDegistir(): void {
    this.kameraSira = (this.kameraSira + 1) % KAMERALAR.length
    this.sapmaEk = 0
    this.egimEk = 0
    writeScore(KAMERA_ANAHTARI, this.kameraSira + 1)
    this.kamerayiOturt()
    sesler.tik()
    this.bildir(`🎥 ${this.kameraAyari.ad}`)
  }

  /**
   * Seçili açının kamerayı koyacağı yeri hesaplar.
   *
   * Sabit bir konum vermek yerine çerçeve kutusunun sekiz köşesi tek tek
   * sınanıyor: hangi köşe taşıyorsa kamera o kadar geriye çekiliyor. Böylece
   * tuval oranı değişse de (tam ekran, dar pencere) saha hep içeride kalıyor.
   */
  private kamerayiOturt(anlik = false): void {
    const ayar = this.kameraAyari
    const istenenFov = ayar.fov ?? KAMERA_FOV
    if (this.kamera.fov !== istenenFov) {
      this.kamera.fov = istenenFov
      this.kamera.updateProjectionMatrix()
    }
    // Sabit konumlu açıda çerçeve hesabı yok: kamera yerinde durur, sürükleme
    // bakış yönünü çevirir.
    if (ayar.sabitKonum) {
      const konum = new THREE.Vector3(ayar.sabitKonum.x, ayar.sabitKonum.y, ayar.sabitKonum.z)
      const hedef = new THREE.Vector3(ayar.hedef.x, ayar.hedef.y, ayar.hedef.z)
      const uzunluk = konum.distanceTo(hedef)
      const ileri = this.aciUygula(hedef.clone().sub(konum).normalize())
      this.kameraKonumu.copy(konum)
      this.bakisHedefi.copy(konum).addScaledVector(ileri, uzunluk)
      if (!anlik) return
      this.kamera.position.copy(this.kameraKonumu)
      this.bakis.copy(this.bakisHedefi)
      this.kamera.lookAt(this.bakis)
      return
    }
    const yon = this.bakisYonu(ayar)
    const hedef = new THREE.Vector3(ayar.hedef.x, ayar.hedef.y, ayar.hedef.z)
    const ileri = yon.clone().negate()
    const sag = new THREE.Vector3().crossVectors(ileri, new THREE.Vector3(0, 1, 0)).normalize()
    const yukari = new THREE.Vector3().crossVectors(sag, ileri).normalize()
    const tanY = Math.tan((this.kamera.fov * Math.PI) / 360)
    const tanX = tanY * this.kamera.aspect

    let uzaklik = 0
    const c = ayar.cerceve
    for (const kx of [c.x1, c.x2]) {
      for (const ky of [c.y1, c.y2]) {
        for (const kz of [c.z1, c.z2]) {
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

    this.kameraKonumu.copy(hedef).addScaledVector(yon, uzaklik * ayar.pay)
    this.bakisHedefi.copy(hedef)
    if (!anlik) return
    this.kamera.position.copy(this.kameraKonumu)
    this.bakis.copy(this.bakisHedefi)
    this.kamera.lookAt(this.bakis)
  }

  /**
   * Seçili açının yönüne sürükleme ekini uygular.
   *
   * Yön küresel koordinata çevrilip sapma ve eğim ekleniyor; eğim dar bir
   * aralıkta tutuluyor ki kamera ne yere gömülsün ne de tepeye dikilsin.
   */
  private bakisYonu(ayar: KameraAyari): THREE.Vector3 {
    // Kamera hedefin üstünde kalsın: alt sınır pozitif.
    return this.aciUygula(new THREE.Vector3(ayar.yon.x, ayar.yon.y, ayar.yon.z).normalize(), EGIM_ALT)
  }

  /**
   * Bir yöne sürükleme ekini (sapma + eğim) uygular.
   * `altSinir` eğimin inebileceği en düşük açı; sabit konumlu kamerada aşağı
   * bakmak serbest, çerçeveli kamerada kamera yerin altına inmemeli.
   */
  private aciUygula(temel: THREE.Vector3, altSinir = -EGIM_UST): THREE.Vector3 {
    const sapma = Math.atan2(temel.z, temel.x) + this.sapmaEk
    const yatay = Math.hypot(temel.x, temel.z)
    const egim = Math.atan2(temel.y, yatay) + this.egimEk
    const sinirli = Math.max(altSinir, Math.min(EGIM_UST, egim))
    return new THREE.Vector3(Math.cos(sinirli) * Math.cos(sapma), Math.sin(sinirli), Math.cos(sinirli) * Math.sin(sapma))
  }

  /** Kamerayı hedefine doğru yumuşatarak taşır (kare süresinden bağımsız). */
  private kamerayiSuzdur(delta: number): void {
    if (this.kamera.position.distanceToSquared(this.kameraKonumu) < 0.01) return
    const oran = 1 - Math.exp(-delta / KAMERA_YUMUSAMA)
    this.kamera.position.lerp(this.kameraKonumu, oran)
    this.bakis.lerp(this.bakisHedefi, oran)
    this.kamera.lookAt(this.bakis)
  }

  // --- Girdi ---

  /**
   * Nişan: önce hangi şeride bakıldığı, sonra o şerit içinde yükseklik.
   *
   * Şerit her zaman yer düzleminden okunuyor (dokunulan noktanın yanal yeri).
   * Yandan bakan kameralarda yükseklik için bir kez daha ışın atılıyor, bu kez
   * seçilen şeridin dikey düzlemiyle: böylece canavarın gövdesine nişan
   * alınabiliyor. Tepeden bakarken yükseklik belirsiz, orada yere nişan alınır.
   */
  private nisanla(x: number, y: number): void {
    if (this.bitti || this.yaziyor) return
    this.isinlayici.setFromCamera(new THREE.Vector2(x, y), this.kamera)
    const zemin = new THREE.Vector3()
    if (!this.isinlayici.ray.intersectPlane(this.zeminDuzlemi, zemin)) return

    const serit = this.seritBul(zemin.x)
    this.oyun.seritSec(serit)

    if (this.kameraAyari.nisan === 'zemin') {
      this.oyun.nisanlaNokta(zemin.z, ZEMIN_Y - ZEMIN_NISAN_PAYI)
      return
    }
    // Seçilen şeridin dikey düzlemi: x = şeridin yanal yeri.
    this.seritDuzlemi.constant = -seritX(serit)
    const nokta = new THREE.Vector3()
    if (!this.isinlayici.ray.intersectPlane(this.seritDuzlemi, nokta)) return
    this.oyun.nisanlaNokta(nokta.z, ZEMIN_Y - nokta.y)
  }

  /** Yanal konuma en yakın şerit. */
  private seritBul(x: number): number {
    let enIyi = 0
    for (let serit = 1; serit < SERIT_ADET; serit++) {
      if (Math.abs(x - seritX(serit)) < Math.abs(x - seritX(enIyi))) enIyi = serit
    }
    return enIyi
  }

  /**
   * Dokunuş sırası: açık menü → kule yuvası → nişan + atış.
   *
   * Menü açıkken dışarıya dokunmak menüyü kapatır ve o dokunuş atışa gitmez;
   * yoksa menüyü kapatmaya çalışırken istemeden mızrak atılıyor.
   */
  private dokun(x: number, y: number): void {
    if (this.bitti || this.yaziyor) return
    this.isinlayici.setFromCamera(new THREE.Vector2(x, y), this.kamera)

    // Dükkân her şeyin önünde: açıkken dokunuş oyuna geçmez.
    if (this.dukkan.acik) {
      const vurus = this.isinlayici.intersectObject(this.dukkan.panel, false)[0]
      if (vurus?.uv) {
        const eylem = this.dukkan.eylem(vurus.uv)
        if (eylem?.tur === 'kapat') this.dukkaniKapat()
        else if (eylem?.tur === 'al') this.yukseltmeAl(eylem.id)
        else sesler.tik()
      } else {
        this.dukkaniKapat()
      }
      this.suruklemeyiBitir()
      return
    }
    if (this.isinlayici.intersectObject(this.dukkan.dugme, false).length > 0) {
      this.dukkanDegistir()
      return
    }

    const secili = this.kuleAlani.seciliYuva
    if (this.kuleMenu.acik && secili !== null) {
      const vurus = this.isinlayici.intersectObject(this.kuleMenu.nesne, false)[0]
      if (vurus?.uv) {
        const eylem = this.kuleMenu.eylem(vurus.uv, this.oyun.kuleler[secili] !== null)
        if (eylem) this.menuEylemi(eylem, secili)
        else sesler.tik()
        return
      }
    }

    const kesisenler = this.isinlayici.intersectObjects(this.kuleAlani.hedefler, false)
    const yuva = kesisenler.length > 0 ? this.kuleAlani.yuvaBul(kesisenler[0].object) : null
    if (yuva !== null) {
      this.yuvaSec(yuva)
      return
    }
    if (this.kuleMenu.acik) {
      this.yuvaSec(secili ?? 0)
      return
    }
    // Buraya gelen dokunuş ya atış ya kamera çevirme; hangisi olduğu
    // parmak kalkınca belli oluyor.
    this.surukleAcik = true
    this.suruklendi = false
    this.sonNokta = { x, y }
  }

  /** Fare/parmak hareketi: basılıysa kamerayı çevirir, değilse nişan alır. */
  private tuvalHareketi(x: number, y: number): void {
    if (!this.surukleAcik) {
      this.nisanla(x, y)
      return
    }
    const dx = x - this.sonNokta.x
    const dy = y - this.sonNokta.y
    if (!this.suruklendi && Math.abs(dx) + Math.abs(dy) < SURUKLE_ESIGI) return
    this.suruklendi = true
    this.sonNokta = { x, y }
    this.sapmaEk = Math.max(-SAPMA_SINIRI, Math.min(SAPMA_SINIRI, this.sapmaEk - dx * SURUKLE_SAPMA_HIZI))
    this.egimEk += dy * SURUKLE_EGIM_HIZI
    this.kamerayiOturt(true)
  }

  /** Parmak kalktı: sürüklenmediyse bu bir atıştı. */
  private dokunusuBirak(x: number, y: number): void {
    if (this.surukleAcik && !this.suruklendi) {
      this.nisanla(x, y)
      this.at()
    }
    this.suruklemeyiBitir()
  }

  private suruklemeyiBitir(): void {
    this.surukleAcik = false
    this.suruklendi = false
  }

  /** Menü satırının karşılığı. */
  private menuEylemi(eylem: MenuEylem, yuva: number): void {
    if (eylem === 'yukselt') this.kuleYukselt()
    else if (eylem === 'yik') this.kuleYik()
    else if (eylem === 'hedef') this.hedeflemeDegistir(yuva)
    else this.kuleAl(Number(eylem.slice(4)))
  }

  /** ☰ düğmesi: dükkânı açar/kapatır. Açılınca oyun durur, kapanınca sürer. */
  private dukkanDegistir(): void {
    if (this.bitti || this.yaziyor) return
    if (this.dukkan.acik) {
      this.dukkaniKapat()
      return
    }
    this.kuleMenu.kapat()
    this.kuleAlani.sec(null, this.oyun.kuleler)
    this.dukkan.ac()
    // Alışveriş yaparken canavarlar yürümesin; süre de dursun.
    this.dukkanDuraklatti = this.oyun.calisiyor
    if (this.dukkanDuraklatti) {
      this.oyun.duraklatDegistir()
      this.sayac.durdur()
    }
    sesler.tik()
  }

  private dukkaniKapat(): void {
    if (!this.dukkan.acik) return
    this.dukkan.kapat()
    if (this.dukkanDuraklatti) {
      this.oyun.devam()
      this.sayac.basla()
    }
    this.dukkanDuraklatti = false
  }

  /** Dükkân satırları: yükseltmeler, güncel fiyat ve seviyeyle. */
  private dukkanSatirlari(): DukkanSatiri[] {
    return YUKSELTMELER.map((y) => ({
      id: y.id,
      etiket: y.etiket,
      ozet: y.ozet,
      seviye: this.oyun.yukseltmeSeviyesi(y.id),
      maxSeviye: y.maxSeviye,
      fiyat: this.oyun.yukseltmeFiyatiSimdi(y.id),
      alinabilir: this.oyun.yukseltmeAlinabilir(y.id),
    }))
  }

  private hedeflemeDegistir(yuva: number): void {
    const sira = this.oyun.hedeflemeDegistir(yuva)
    sesler.tik()
    this.bildir(`${HEDEFLEME_KURALLARI[sira].simge} ${HEDEFLEME_KURALLARI[sira].ad}`)
  }

  /** Menünün içeriği ve yeri; açık değilse iş yapılmaz. */
  private menuyuTazele(): void {
    this.kuleMenu.guncelle(this.kamera)
    const yuva = this.kuleAlani.seciliYuva
    if (!this.kuleMenu.acik || yuva === null) return
    this.kuleMenu.tazele(this.menuDurumu(yuva))
  }

  private menuDurumu(yuva: number): MenuDurum {
    const kule = this.oyun.kuleler[yuva]
    const kural = HEDEFLEME_KURALLARI[kule?.hedefleme ?? 0]
    return {
      yuva,
      kule,
      altin: this.oyun.altin,
      yikimBedeli: this.oyun.kuleYikimBedeli(yuva),
      yukseltmeFiyati: kule ? this.oyun.kuleFiyati(yuva, kule.tip) : null,
      hedeflemeAdi: kural.ad,
      hedeflemeSimgesi: kural.simge,
    }
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
    if (yeni === null) {
      this.kuleMenu.kapat()
    this.dukkaniKapat()
      return
    }
    this.kuleMenu.ac(this.kuleAlani.menuKonumu(yeni, this.oyun.kuleler[yeni]), this.menuDurumu(yeni))
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
    this.kuleMenu.ac(this.kuleAlani.menuKonumu(yuva, this.oyun.kuleler[yuva]), this.menuDurumu(yuva))
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
    this.kuleMenu.ac(this.kuleAlani.menuKonumu(yuva, this.oyun.kuleler[yuva]), this.menuDurumu(yuva))
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
    this.kuleMenu.ac(this.kuleAlani.menuKonumu(yuva, null), this.menuDurumu(yuva))
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

  /**
   * Dalga arasında "ne geliyor" bilgisi.
   *
   * Mantık canavar tipini doğuş anında rastgele seçtiği için birebir liste
   * verilemiyor; sayı, şef bilgisi ve o dalgada ilk kez çıkacak tipler kesin.
   */
  private onizlemeyiTazele(): void {
    if (this.oyun.asama !== 'ara') {
      this.onizleme.gizle()
      return
    }
    const sonraki = this.oyun.dalga + 1
    const adet =
      Math.max(1, Math.round(dalgaCanavarSayisi(sonraki) * this.oyun.zorluk.adetCarpani)) +
      (patronDalgasiMi(sonraki) ? 1 : 0)
    const yeniler = this.oyun.tipler.filter((t) => t.ilkDalga === sonraki && !t.patron).map((t) => t.ad)
    const saniye = Math.ceil(this.oyun.dalgayaKalan / 1000)

    const baslik = `Dalga ${sonraki} · ${adet} canavar${patronDalgasiMi(sonraki) ? ' · ŞEF' : ''}`
    const alt = yeniler.length > 0 ? `Yeni: ${yeniler.join(', ')} · ${saniye}s` : `${saniye} saniye`
    this.onizleme.goster(baslik, alt)
  }

  private dalgaBasladi(dalga: number): void {
    setChip('wave', dalga)
    this.dunya.vakitGuncelle(dalga, DUNYALAR[this.oyun.dunyaSira].vakitBaslangic)
    this.mesaleleriAyarla()
    this.bildir(patronDalgasiMi(dalga) ? `Dalga ${dalga} · ŞEF geliyor!` : `Dalga ${dalga}`)
    sesler.otur()
    if (this.baslamisMi) return
    this.sayac.basla()
    this.baslamisMi = true
  }

  /** Vakit ilerledikçe meşaleler güçlenir: gündüz sönük, gece tam. */
  private mesaleleriAyarla(): void {
    this.kale.isikAyari(this.dunya.vakitSirasi / 2)
  }

  private dalgaBitti(dalga: number): void {
    this.ilerlemeyiKaydet()
    this.bildir(`${dalga}. dalga temizlendi  +${DALGA_BONUSU}`)
    this.hud.showGain(DALGA_BONUSU)
    sesler.dogru()
  }

  private oyunuBitir(): void {
    this.ilerlemeyiKaydet()
    // Dalga rekoru dünya ve zorluk başına tutuluyor: asıl kovalanan sayı bu.
    const yeniRekor = dalgaRekoruYaz(this.oyun.dunyaSira, this.oyun.zorlukSira, this.oyun.dalga)
    const rekor = dalgaRekoru(this.oyun.dunyaSira, this.oyun.zorlukSira)
    const ozet = `${DUNYALAR[this.oyun.dunyaSira].ad} · ${this.oyun.dalga}. dalga · ${this.oyun.oldurulen} canavar · Skor: ${this.oyun.skor}${
      yeniRekor ? ' · 🏆 yeni dalga rekoru!' : ` · en iyi ${rekor}. dalga`
    }`
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
    this.kale.nisanla(this.oyun.aci, seritX(this.oyun.serit))
    this.kale.canGoster(this.oyun.kaleCani, this.oyun.maxKaleCani)
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
        gorunum = new Canavar3D(this.sahne, canavar, this.oyun.tipler[canavar.tip], this.gercekGolge)
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
      const bilgi = this.oyun.tipler[isabet.tip]
      this.efektler.parcalanma(konum, bilgi.renk, Math.max(0.8, bilgi.boy / 40))
      sesler.patlama()
      this.hud.showGain(isabet.puan)
      this.efektler.yazi(konum.clone().setY(konum.y + 30), `+${isabet.puan}`, '#f8fafc')
    }
  }

  // --- Çizim ---

  /** Nişan izi yalnız açı değişince yeniden çizilir. */
  private nisaniCiz(): void {
    const imza = this.oyun.aci + this.oyun.serit * 1000
    if (imza === this.cizilenAci) return
    this.cizilenAci = imza
    this.atislar.nisaniCiz(this.oyun.nisanYolu(), seritX(this.oyun.serit))
  }

  private bildir(metin: string): void {
    this.bildirim.yaz(metin)
  }

  override yikil(): void {
    this.kuleMenu?.bosalt()
    this.dukkan?.bosalt()
    this.paneller?.yikil()
    this.efektler?.bosalt()
    super.yikil()
  }
}

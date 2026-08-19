/**
 * Tek bir canavarın üç boyutlu görünümü.
 *
 * Model kutu ve kürelerden kuruluyor; yürüyüş animasyonu mantıktaki `faz`
 * değerinden geliyor (bacaklar makas, gövde zıplar, kollar sallanır), yani kare
 * sayısına değil canavarın gerçek hızına bağlı. Duvara varınca aynı faz vuruş
 * hareketini sürüyor.
 *
 * Mantık tek eksenli olduğu için yanal yer buradan veriliyor: canavar id'sinden
 * türeyen sabit bir kayma, kaleye yaklaştıkça kapanır (kapıya huniyle girerler).
 */

import * as THREE from 'three'

import { DURAK_X, type CanavarTipi } from '../../kalesavunmasi/config/constants.ts'
import type { Canavar } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import {
  BAR_BOY,
  BAR_EN,
  BAR_PAY,
  CANAVAR_YAYILMA,
  GOLGE_ORANI,
  GOVDE_DERINLIK_ORANI,
  OLUM_MS,
  PARLAMA_MS,
  YAYILMA_MESAFE,
} from '../config/sahne3d.ts'
import { birak, koyu, kure, kutu, malzeme } from './yapi.ts'

/** Yürürken bacak ve kol açısı (derece). */
const BACAK_ACI = 26
const KOL_ACI = 20
/** Gövdenin zıplama yüksekliği. */
const ZIPLAMA = 2.6
/** Vuruşta kolun savurma açısı (derece). */
const VURUS_ACI = 96
/** Kanat çırpma açısı (derece) ve havada salınma. */
const KANAT_ACI = 34
const UCUS_SALINIM = 5
/** Yanan canavarın kızıllığı, yavaşlayanın maviliği. */
const YANMA_RENGI = 0xf97316
const BUZ_RENGI = 0x38bdf8

const derece = (aci: number): number => (aci * Math.PI) / 180

export class Canavar3D {
  readonly kok = new THREE.Group()
  /** Ölüm animasyonu başladı mı? */
  oluyor = false

  private readonly bilgi: CanavarTipi
  private readonly govde: THREE.Group
  private readonly solBacak: THREE.Group
  private readonly sagBacak: THREE.Group
  private readonly arkaKol: THREE.Group
  private readonly onKol: THREE.Group
  private readonly kanatlar: THREE.Mesh[] = []
  private readonly bar: THREE.Group
  private readonly barDolu: THREE.Mesh
  private readonly golge: THREE.Mesh
  private readonly malzemeler: THREE.MeshLambertMaterial[] = []
  private readonly yanal: number
  private parlamaKalan = 0
  private olumKalan = 0
  private salinim = 0

  constructor(sahne: THREE.Scene, canavar: Canavar, bilgi: CanavarTipi) {
    this.bilgi = bilgi
    const { en, boy, renk } = bilgi
    const derinlik = en * GOVDE_DERINLIK_ORANI
    // Aynı id hep aynı şeride düşsün: canavar kare kare sağa sola zıplamasın.
    this.yanal = (((canavar.id * 37) % 100) / 50 - 1) * CANAVAR_YAYILMA

    const govdeMalzeme = this.malzemeKur(renk)
    const koyuMalzeme = this.malzemeKur(koyu(renk, 0.35))
    const kafaMalzeme = this.malzemeKur(koyu(renk, 0.12))

    const kalcaY = boy * 0.36
    const bacakBoy = boy * 0.36

    this.solBacak = this.uzuv(kutu(en * 0.22, bacakBoy, en * 0.26, koyuMalzeme), bacakBoy)
    this.solBacak.position.set(-en * 0.22, kalcaY, 0)
    this.sagBacak = this.uzuv(kutu(en * 0.22, bacakBoy, en * 0.26, koyuMalzeme), bacakBoy)
    this.sagBacak.position.set(en * 0.22, kalcaY, 0)

    // Gövde ayrı grupta: zıplama yalnız üst yarıyı kaldırır, ayaklar yerde kalır.
    this.govde = new THREE.Group()
    const kutle = kutu(en, boy * 0.5, derinlik, govdeMalzeme)
    kutle.position.y = kalcaY + boy * 0.26
    const kafa = kure(boy * 0.19, kafaMalzeme, 10)
    kafa.position.y = kalcaY + boy * 0.62
    const goz = kutu(en * 0.42, 4, 3, this.malzemeKur(0x111827))
    // Yüzün ön yüzeyinin biraz dışında: içeride kalırsa gövde yutuyor.
    goz.position.set(0, kalcaY + boy * 0.64, -boy * 0.19 - 2)
    this.govde.add(kutle, kafa, goz)

    const omuzY = kalcaY + boy * 0.46
    const kolBoy = boy * 0.34
    this.arkaKol = this.uzuv(kutu(en * 0.16, kolBoy, en * 0.16, koyuMalzeme), kolBoy)
    this.arkaKol.position.set(-en * 0.56, omuzY, 0)
    this.onKol = this.uzuv(kutu(en * 0.16, kolBoy, en * 0.16, govdeMalzeme), kolBoy)
    this.onKol.position.set(en * 0.56, omuzY, 0)
    this.govde.add(this.arkaKol, this.onKol)

    if (bilgi.ucar) {
      const kanatMalzeme = this.malzemeKur(koyu(renk, 0.5))
      for (const yon of [-1, 1]) {
        const kanat = kutu(en * 0.9, 3, en * 0.7, kanatMalzeme)
        kanat.position.set(yon * en * 0.62, kalcaY + boy * 0.4, 0)
        this.kanatlar.push(kanat)
        this.govde.add(kanat)
      }
    }

    // Yere düşen gölge: nesneleri zemine oturtuyor. Gerçek gölge haritası
    // yerine yassı bir daire — telefonda bedava, gözde farkı yok.
    this.golge = new THREE.Mesh(
      new THREE.CircleGeometry(en * GOLGE_ORANI, 14),
      malzeme(0x14320a, { saydam: 0.32 }),
    )
    this.golge.rotation.x = -Math.PI / 2

    this.kok.add(this.solBacak, this.sagBacak, this.govde, this.golge)

    // Can barı: iki düzlem, her karede kameraya döner.
    this.bar = new THREE.Group()
    // Bar malzemeleri listeye girmez: isabet parlaması ve ölüm solması
    // gövdeye ait, bara değil.
    const arka = kutu(BAR_EN, BAR_BOY, 1, malzeme(0x1f2937))
    this.barDolu = kutu(BAR_EN, BAR_BOY - 2, 1, malzeme(0x22c55e))
    this.barDolu.position.z = 1
    this.bar.add(arka, this.barDolu)
    this.bar.position.y = kalcaY + boy * 0.62 + BAR_PAY
    this.kok.add(this.bar)

    sahne.add(this.kok)
    this.yerlestir(canavar)
  }

  /** İsabet parlaması. */
  vuruldu(): void {
    this.parlamaKalan = PARLAMA_MS
  }

  /** Ölüm animasyonunu başlatır; bitince `bittiMi` doğru döner. */
  ol(): void {
    if (this.oluyor) return
    this.oluyor = true
    this.olumKalan = OLUM_MS
    this.bar.visible = false
    this.golge.visible = false
    for (const m of this.malzemeler) {
      m.transparent = true
      m.needsUpdate = true
    }
  }

  get bittiMi(): boolean {
    return this.oluyor && this.olumKalan <= 0
  }

  /** Ölüm animasyonu; mantıkta artık olmayan canavar için sahne bunu çağırır. */
  olumIlerlet(delta: number): void {
    if (!this.oluyor) return
    this.olumKalan -= delta
    const kalan = Math.max(0, this.olumKalan / OLUM_MS)
    this.kok.scale.setScalar(0.2 + kalan * 0.8)
    this.kok.rotation.z = (1 - kalan) * 1.2
    for (const m of this.malzemeler) m.opacity = kalan
  }

  guncelle(canavar: Canavar, delta: number, kameraYonu: THREE.Quaternion): void {
    if (this.oluyor) return

    this.yerlestir(canavar)
    this.salinim += delta

    const faz = canavar.faz * Math.PI * 2
    const salla = Math.sin(faz)

    if (canavar.durum === 'vuruyor') {
      // Vuruşta bacaklar durur, ön kol savrulur.
      this.solBacak.rotation.x = 0
      this.sagBacak.rotation.x = 0
      this.onKol.rotation.x = derece(-VURUS_ACI * Math.max(0, salla))
      this.arkaKol.rotation.x = derece(KOL_ACI * 0.4 * salla)
      this.govde.position.y = 0
    } else {
      this.solBacak.rotation.x = derece(BACAK_ACI * salla)
      this.sagBacak.rotation.x = derece(-BACAK_ACI * salla)
      this.arkaKol.rotation.x = derece(-KOL_ACI * salla)
      this.onKol.rotation.x = derece(KOL_ACI * salla)
      this.govde.position.y = Math.abs(salla) * ZIPLAMA
    }

    for (let i = 0; i < this.kanatlar.length; i++) {
      const yon = i === 0 ? 1 : -1
      this.kanatlar[i].rotation.z = derece(KANAT_ACI * salla * yon)
    }

    const oran = Math.max(0, Math.min(1, canavar.can / canavar.maxCan))
    this.barDolu.scale.x = Math.max(0.001, oran)
    this.barDolu.position.x = -(BAR_EN * (1 - oran)) / 2
    ;(this.barDolu.material as THREE.MeshLambertMaterial).color.setHex(
      oran > 0.5 ? 0x22c55e : oran > 0.25 ? 0xf59e0b : 0xef4444,
    )
    this.bar.quaternion.copy(kameraYonu)

    this.durumRengi(canavar, delta)
  }

  yikil(): void {
    this.kok.removeFromParent()
    birak(this.kok)
  }

  // --- Yardımcılar ---

  private yerlestir(canavar: Canavar): void {
    // Kaleye yaklaşırken yanal kayma kapanır: kapıya doğru huni.
    const acilim = Math.max(0, Math.min(1, (canavar.x - DURAK_X) / YAYILMA_MESAFE))
    const ucus = this.bilgi.ucar ? Math.sin(this.salinim / 260) * UCUS_SALINIM : 0
    const y = this.bilgi.yukseklik + ucus
    this.kok.position.set(this.yanal * acilim, y, canavar.x)
    // Gölge kökün çocuğu: yerel konumu, kök ne kadar yükselirse o kadar aşağı.
    this.golge.position.y = 0.8 - y
    const kucul = Math.max(0.45, 1 - y / 260)
    this.golge.scale.setScalar(kucul)
  }

  /** Kalçadan/omuzdan sarkan uzuv: dönüş noktası üstte olsun diye grupta. */
  private uzuv(mesh: THREE.Mesh, boy: number): THREE.Group {
    const grup = new THREE.Group()
    mesh.position.y = -boy / 2
    grup.add(mesh)
    return grup
  }

  private malzemeKur(renk: number): THREE.MeshLambertMaterial {
    const m = malzeme(renk)
    this.malzemeler.push(m)
    return m
  }

  /** İsabet parlaması, yanma ve buz etkisini gövde rengine yazar. */
  private durumRengi(canavar: Canavar, delta: number): void {
    let isik = 0x000000
    if (this.parlamaKalan > 0) {
      this.parlamaKalan -= delta
      isik = 0xffffff
    } else if (canavar.yanmaKalan > 0) isik = YANMA_RENGI
    else if (canavar.yavaslikKalan > 0) isik = BUZ_RENGI

    for (const m of this.malzemeler) {
      if (m.emissive.getHex() !== isik) m.emissive.setHex(isik)
    }
  }
}

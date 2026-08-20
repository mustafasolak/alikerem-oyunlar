/**
 * Kale ve duvarın üstündeki mızrakçı.
 *
 * Duvar z ekseninde ince, x ekseninde geniş bir kütle: yol tam ortasındaki
 * kapıya bakar. Mızrakçı duvarın tepesinde, yolun ortasında durur; nişan açısı
 * doğrudan ön kolun dönüşüdür — oyuncu nereye nişan aldığını gövdeden okur.
 *
 * Mantıktaki açı kuralı: 0 derece yola paralel ileri, eksi yukarı. Yerel ekseni
 * +z olan bir nesne x ekseni etrafında `aci` kadar döndürülünce tam bu yöne
 * bakar, o yüzden çevirme gerekmiyor.
 */

import * as THREE from 'three'

import {
  COLORS,
  KALE_SARSINTI_MS,
  KALE_UST_Y,
  MIZRAK_CIKIS_X,
  MIZRAK_CIKIS_Y,
} from '../../kalesavunmasi/config/constants.ts'
import {
  BURC_EK_BOY,
  BURC_R,
  KALE_YARI_EN,
  KALE_Z1,
  KALE_Z2,
  KAPI_BOY,
  KAPI_EN,
  MAZGAL_ARALIK,
  MAZGAL_BOY,
  MAZGAL_EN,
  MESALE_SALINIM_MS,
  MIZRAKCI_BOY,
  yukseklik,
} from '../config/sahne3d.ts'
import { duz, golgeVer, koni, kure, kutu, malzeme, silindir } from './yapi.ts'

/** Sarsıntının en büyük kayması (dünya birimi). */
const SARSINTI_GUC = 7
/** Atış hareketinin süresi (ms). */
const ATIS_MS = 220
/** Kale can barının ölçüsü ve kapının üstündeki yüksekliği. */
const BAR_EN = 170
const BAR_BOY = 16
const BAR_PAY = 58
/** Çatlaklar bu can oranlarının altında görünür. */
const CATLAK_ESIKLERI = [0.66, 0.4, 0.18]
/** Duman bu can oranının altında tütmeye başlar. */
const DUMAN_ESIGI = 0.45
const DUMAN_ADET = 5
/** Bir duman yumağının yükselme süresi (ms). */
const DUMAN_MS = 2600
/** Meşale ışığının gece gücü ve menzili. */
const MESALE_ISIK_GUCU = 2.6
const MESALE_MENZIL = 420
/** Kolun atarken savurduğu açı (derece). */
const SAVURMA = 52

export class Kale3D {
  readonly kok = new THREE.Group()
  /** Mızrağın çıktığı nokta (dünya koordinatı). */
  readonly cikis: THREE.Vector3

  private readonly duvarUstu: number
  private readonly onKol: THREE.Group
  private readonly mesaleler: THREE.Mesh[] = []
  private readonly mesaleIsiklari: THREE.PointLight[] = []
  private readonly catlaklar: THREE.Mesh[] = []
  private readonly dumanlar: THREE.Mesh[] = []
  private readonly barGrubu = new THREE.Group()
  private readonly barDolu: THREE.Mesh
  private dumanTutuyor = false
  private dumanFaz = 0
  private sarsintiKalan = 0
  private atisKalan = 0
  private aci = 0
  private titrek = 0

  constructor(sahne: THREE.Scene, gercekGolge = false) {
    sahne.add(this.kok)
    this.duvarUstu = yukseklik(KALE_UST_Y)
    this.cikis = new THREE.Vector3(0, yukseklik(MIZRAK_CIKIS_Y), MIZRAK_CIKIS_X)

    const derinlik = KALE_Z2 - KALE_Z1
    const ortaZ = (KALE_Z1 + KALE_Z2) / 2

    const duvar = kutu(KALE_YARI_EN * 2, this.duvarUstu, derinlik, COLORS.KALE_TAS)
    duvar.position.set(0, this.duvarUstu / 2, ortaZ)
    this.kok.add(duvar)

    // Taş sıraları: düz bir yüzey yerine yatay şeritler duvarı okunur yapıyor.
    for (let sira = 0; sira < 5; sira++) {
      const serit = kutu(KALE_YARI_EN * 2 - 6, 5, derinlik + 4, COLORS.KALE_TAS_KOYU)
      serit.position.set(0, 26 + sira * 42, ortaZ)
      this.kok.add(serit)
    }

    // Mazgallar duvarın tepesine dizilir.
    const mazgalSayisi = Math.floor((KALE_YARI_EN * 2) / MAZGAL_ARALIK)
    for (let i = 0; i <= mazgalSayisi; i++) {
      const mazgal = kutu(MAZGAL_EN, MAZGAL_BOY, derinlik - 8, COLORS.KALE_TAS_ACIK)
      mazgal.position.set(-KALE_YARI_EN + i * MAZGAL_ARALIK + MAZGAL_EN / 2, this.duvarUstu + MAZGAL_BOY / 2, ortaZ)
      this.kok.add(mazgal)
    }

    // Kapı: yolun tam karşısında, duvarın ön yüzünde.
    const kapi = kutu(KAPI_EN, KAPI_BOY, 8, COLORS.KALE_KAPI)
    kapi.position.set(0, KAPI_BOY / 2, KALE_Z2 + 2)
    const kemer = silindir(KAPI_EN / 2, KAPI_EN / 2, 8, COLORS.KALE_KAPI, 14)
    kemer.rotation.x = Math.PI / 2
    kemer.position.set(0, KAPI_BOY, KALE_Z2 + 2)
    this.kok.add(kapi, kemer)

    // İki uçtaki burçlar ve konik çatıları.
    for (const yon of [-1, 1]) {
      const burcBoy = this.duvarUstu + BURC_EK_BOY
      const burc = silindir(BURC_R, BURC_R * 1.1, burcBoy, COLORS.KALE_TAS_ACIK, 14)
      burc.position.set(yon * (KALE_YARI_EN - BURC_R * 0.3), burcBoy / 2, ortaZ)
      const cati = koni(BURC_R * 1.25, BURC_R * 1.5, COLORS.KULE_CATI, 14)
      cati.position.set(burc.position.x, burcBoy + BURC_R * 0.75, ortaZ)
      const direk = silindir(2, 2, 40, COLORS.BAYRAK_DIREK, 6)
      direk.position.set(burc.position.x, burcBoy + BURC_R * 1.5 + 20, ortaZ)
      const bayrak = kutu(26, 16, 1.5, COLORS.BAYRAK)
      bayrak.position.set(burc.position.x + 13, burcBoy + BURC_R * 1.5 + 30, ortaZ)
      this.kok.add(burc, cati, direk, bayrak)

      // Kapının iki yanındaki meşaleler.
      const sap = silindir(3, 3, 26, COLORS.BAYRAK_DIREK, 6)
      sap.position.set(yon * (KAPI_EN / 2 + 26), KAPI_BOY * 0.8, KALE_Z2 + 6)
      const ates = kure(11, malzeme(COLORS.MESALE, { isik: COLORS.MESALE }), 8)
      ates.position.set(sap.position.x, KAPI_BOY * 0.8 + 20, KALE_Z2 + 6)
      this.mesaleler.push(ates)
      // Gece meşale çevreyi gerçekten aydınlatsın; gündüz sönük durur.
      const isik = new THREE.PointLight(COLORS.MESALE, 0, MESALE_MENZIL, 2)
      isik.position.copy(ates.position)
      this.mesaleIsiklari.push(isik)
      this.kok.add(sap, ates, isik)
    }

    this.onKol = this.mizrakciyiKur()
    this.barDolu = this.canBariniKur()
    this.catlaklariKur()
    this.dumanlariKur()
    if (gercekGolge) golgeVer(this.kok, true, true)
  }

  /**
   * Nişan açısını (derece) ve nişan alınan şeridin yanal yerini uygular.
   * Mızrakçı gövdesiyle hangi şeride baktığını gösteriyor.
   */
  nisanla(aci: number, yanal = 0): void {
    this.aci = aci
    // Şerit uzaklığı kabaca yolun ortası; küçük açı yeter, abartınca kol kopuk duruyor.
    this.onKol.rotation.y = -Math.atan2(yanal, 320)
    this.kolaAciVer()
  }

  /** Atış hareketi: kol öne savrulur. */
  atisHareketi(): void {
    this.atisKalan = ATIS_MS
  }

  /** Kale vurulunca sarsılır. */
  sarsil(): void {
    this.sarsintiKalan = KALE_SARSINTI_MS
  }

  /** Kale canı: bar, çatlaklar ve duman buna göre. */
  canGoster(can: number, maxCan: number): void {
    const oran = Math.max(0, Math.min(1, maxCan > 0 ? can / maxCan : 0))
    this.barDolu.scale.x = Math.max(0.001, oran)
    this.barDolu.position.x = -(BAR_EN * (1 - oran)) / 2
    ;(this.barDolu.material as THREE.MeshBasicMaterial).color.setHex(
      oran > 0.5 ? 0x22c55e : oran > 0.25 ? 0xf59e0b : 0xef4444,
    )
    for (let i = 0; i < this.catlaklar.length; i++) {
      this.catlaklar[i].visible = oran <= CATLAK_ESIKLERI[i]
    }
    this.dumanTutuyor = oran <= DUMAN_ESIGI
    if (!this.dumanTutuyor) for (const duman of this.dumanlar) duman.visible = false
  }

  /** Vakte göre meşale ışığı (0 gündüz, 1 gece). */
  isikAyari(gecelik: number): void {
    for (const isik of this.mesaleIsiklari) isik.intensity = MESALE_ISIK_GUCU * gecelik
  }

  guncelle(delta: number, kameraYonu?: THREE.Quaternion): void {
    if (kameraYonu) this.barGrubu.quaternion.copy(kameraYonu)
    this.dumaniIlerlet(delta)
    if (this.sarsintiKalan > 0) {
      this.sarsintiKalan -= delta
      const guc = Math.max(0, this.sarsintiKalan / KALE_SARSINTI_MS) * SARSINTI_GUC
      this.kok.position.set((Math.random() - 0.5) * guc * 2, (Math.random() - 0.5) * guc, 0)
      if (this.sarsintiKalan <= 0) this.kok.position.set(0, 0, 0)
    }
    if (this.atisKalan > 0) {
      this.atisKalan -= delta
      this.kolaAciVer()
    }
    this.titrek += delta
    const parlaklik = 0.75 + 0.25 * Math.sin((this.titrek / MESALE_SALINIM_MS) * Math.PI * 2)
    for (const ates of this.mesaleler) ates.scale.setScalar(parlaklik)
  }

  /** Yükselip sönen duman yumakları; yalnız kale ağır hasarlıyken görünür. */
  private dumaniIlerlet(delta: number): void {
    if (!this.dumanTutuyor) return
    this.dumanFaz += delta
    for (let i = 0; i < this.dumanlar.length; i++) {
      const duman = this.dumanlar[i]
      const oran = (((this.dumanFaz + (i * DUMAN_MS) / DUMAN_ADET) % DUMAN_MS) / DUMAN_MS)
      duman.visible = true
      duman.position.y = this.duvarUstu + 10 + oran * 130
      duman.scale.setScalar(0.5 + oran * 1.6)
      ;(duman.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - oran)
    }
  }

  /**
   * Kapının üstündeki can barı.
   *
   * Derinlik sınamasız çiziliyor: bar kameraya dönerken bir kenarı duvarın
   * içine girip yarısı kayboluyordu, yukarı taşıyınca da çerçeveden çıkıyordu.
   * Bu bir gösterge, arayüz gibi hep üstte dursun.
   */
  private canBariniKur(): THREE.Mesh {
    const arka = kutu(BAR_EN + 4, BAR_BOY + 4, 1, duz(0x0f172a))
    const dolu = kutu(BAR_EN, BAR_BOY, 1, duz(0x22c55e))
    dolu.position.z = 1
    for (const parca of [arka, dolu]) {
      const m = parca.material as THREE.MeshBasicMaterial
      m.depthTest = false
      m.depthWrite = false
      parca.renderOrder = 6
    }
    this.barGrubu.add(arka, dolu)
    this.barGrubu.position.set(0, KAPI_BOY + BAR_PAY, KALE_Z2 + 14)
    this.kok.add(this.barGrubu)
    return dolu
  }

  /** Can azaldıkça beliren çatlaklar: duvarın hasarı gözle görünsün. */
  private catlaklariKur(): void {
    const yerler = [
      { x: -KALE_YARI_EN * 0.55, y: this.duvarUstu * 0.62, aci: 0.35 },
      { x: KALE_YARI_EN * 0.5, y: this.duvarUstu * 0.45, aci: -0.5 },
      { x: -KALE_YARI_EN * 0.15, y: this.duvarUstu * 0.3, aci: 0.2 },
    ]
    for (const yer of yerler) {
      const catlak = kutu(6, this.duvarUstu * 0.42, 3, 0x0b1220)
      catlak.position.set(yer.x, yer.y, KALE_Z2 + 1.5)
      catlak.rotation.z = yer.aci
      catlak.visible = false
      this.catlaklar.push(catlak)
      this.kok.add(catlak)
    }
  }

  private dumanlariKur(): void {
    for (let i = 0; i < DUMAN_ADET; i++) {
      const duman = kure(16, duz(0x94a3b8, 0.3), 8)
      duman.position.set((i - DUMAN_ADET / 2) * 40, this.duvarUstu, 0)
      duman.visible = false
      this.dumanlar.push(duman)
      this.kok.add(duman)
    }
  }

  private kolaAciVer(): void {
    const savurma = this.atisKalan > 0 ? (this.atisKalan / ATIS_MS) * SAVURMA : 0
    this.onKol.rotation.x = ((this.aci - savurma) * Math.PI) / 180
  }

  /** Duvarın tepesindeki mızrakçı: gövde, kafa, sırt kolu ve nişan alan ön kol. */
  private mizrakciyiKur(): THREE.Group {
    const boy = MIZRAKCI_BOY
    const taban = this.duvarUstu + MAZGAL_BOY * 0.2
    const govdeRenk = COLORS.MIZRAKCI

    const bacak = kutu(boy * 0.16, boy * 0.36, boy * 0.16, COLORS.KALE_TAS_KOYU)
    bacak.position.set(0, taban + boy * 0.18, MIZRAK_CIKIS_X)
    const govde = kutu(boy * 0.34, boy * 0.4, boy * 0.26, govdeRenk)
    govde.position.set(0, taban + boy * 0.56, MIZRAK_CIKIS_X)
    const kafa = kure(boy * 0.15, COLORS.MIZRAKCI_TEN, 10)
    kafa.position.set(0, taban + boy * 0.86, MIZRAK_CIKIS_X)
    const migfer = kure(boy * 0.17, COLORS.KALE_TAS_ACIK, 10)
    migfer.position.set(0, taban + boy * 0.91, MIZRAK_CIKIS_X)
    migfer.scale.y = 0.62
    this.kok.add(bacak, govde, kafa, migfer)

    // Ön kol ve mızrak tek grupta: grup nişan açısı kadar dönünce ikisi de döner.
    const kolGrubu = new THREE.Group()
    kolGrubu.position.set(0, this.cikis.y, this.cikis.z)
    const kol = kutu(boy * 0.12, boy * 0.12, boy * 0.42, COLORS.MIZRAKCI_TEN)
    kol.position.set(0, 0, boy * 0.21)
    const sap = silindir(2.2, 2.2, 34, COLORS.MIZRAK_SAP, 6)
    sap.rotation.x = Math.PI / 2
    sap.position.set(0, 0, boy * 0.42)
    const uc = koni(4, 12, COLORS.MIZRAK_UC, 6)
    uc.rotation.x = Math.PI / 2
    uc.position.set(0, 0, boy * 0.42 + 22)
    kolGrubu.add(kol, sap, uc)
    this.kok.add(kolGrubu)
    return kolGrubu
  }
}

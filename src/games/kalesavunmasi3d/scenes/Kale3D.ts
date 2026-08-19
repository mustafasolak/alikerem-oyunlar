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
import { koni, kure, kutu, malzeme, silindir } from './yapi.ts'

/** Sarsıntının en büyük kayması (dünya birimi). */
const SARSINTI_GUC = 7
/** Atış hareketinin süresi (ms). */
const ATIS_MS = 220
/** Kolun atarken savurduğu açı (derece). */
const SAVURMA = 52

export class Kale3D {
  readonly kok = new THREE.Group()
  /** Mızrağın çıktığı nokta (dünya koordinatı). */
  readonly cikis: THREE.Vector3

  private readonly duvarUstu: number
  private readonly onKol: THREE.Group
  private readonly mesaleler: THREE.Mesh[] = []
  private sarsintiKalan = 0
  private atisKalan = 0
  private aci = 0
  private titrek = 0

  constructor(sahne: THREE.Scene) {
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
      this.kok.add(sap, ates)
    }

    this.onKol = this.mizrakciyiKur()
  }

  /** Nişan açısını (derece) uygular. */
  nisanla(aci: number): void {
    this.aci = aci
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

  guncelle(delta: number): void {
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

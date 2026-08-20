/**
 * Havadaki cisimler ve nişan izi.
 *
 * Mantık atışın yalnız derinliğini (sim x) ve yüksekliğini biliyor; yanal yer
 * buradan veriliyor. Kule oku kulenin yanından çıkıp uçtukça yolun ortasına
 * süzülüyor — mantığa dokunmadan "kuleden çıktı" hissi böyle veriliyor.
 */

import * as THREE from 'three'

import {
  COLORS,
  DOGUS_X,
  DURAK_X,
  ELEMENT_RENGI,
  KULE_TIPLERI,
  NISAN_NOKTA_ARALIK,
} from '../../kalesavunmasi/config/constants.ts'
import type { Atis, Kule } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { SERIT_ARALIK, seritX, yukseklik } from '../config/sahne3d.ts'
import type { Efektler3D } from './Efektler3D.ts'
import { birak, koni, kure, malzeme, silindir } from './yapi.ts'

/** Kule okunun yanal kayması bu yol boyunca sıfıra iner. */
const OK_YANAL_YOL = 260
/** Yere saplanan mızrağın yerden yüksekliği. */
const SAPLANAN_Y = 6
/** Uçuş izinin boyu ve saydamlığı. */
const IZ_BOY = 46
const IZ_SAYDAM = 0.34

interface AtisGorunum {
  kok: THREE.Group
  /** Doğduğu andaki yanal yer (kule yanı); uçtukça şeridine kayar. */
  yanal: number
  /** Gideceği şeridin yanal yeri. */
  hedefYanal: number
  basX: number
}

/**
 * Uçuş izi: cismin arkasında kalan sivri kuyruk.
 * Nereden geldiği ve ne kadar hızlı gittiği tek bakışta okunuyor.
 */
function iz(renk: number, kalinlik: number): THREE.Mesh {
  const kuyruk = koni(kalinlik, IZ_BOY, malzeme(renk, { saydam: IZ_SAYDAM, isik: renk }), 6)
  kuyruk.rotation.x = -Math.PI / 2
  kuyruk.position.z = -IZ_BOY / 2
  return kuyruk
}

/** Mızrak gövdesi: sap + uç. Yerel ileri yönü +z. */
function mizrakYap(ucRengi: number): THREE.Group {
  const kok = new THREE.Group()
  const sap = silindir(2.2, 2.2, 26, COLORS.MIZRAK_SAP, 6)
  sap.rotation.x = Math.PI / 2
  const uc = koni(4, 13, ucRengi, 6)
  uc.rotation.x = Math.PI / 2
  uc.position.z = 19
  kok.add(sap, uc)
  return kok
}

export class Atislar3D {
  private readonly sahne: THREE.Scene
  private readonly efektler: Efektler3D
  private readonly gorunumler = new Map<number, AtisGorunum>()
  private readonly nisanCizgisi: THREE.Points
  private readonly hedefHalkasi: THREE.Mesh
  /** Nişan alınan şeridi yolda gösteren şeffaf bant. */
  private readonly seritBandi: THREE.Mesh

  constructor(sahne: THREE.Scene, efektler: Efektler3D) {
    this.sahne = sahne
    this.efektler = efektler

    this.nisanCizgisi = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: COLORS.NISAN, size: 6, transparent: true, opacity: 0.7 }),
    )
    this.hedefHalkasi = new THREE.Mesh(
      new THREE.TorusGeometry(10, 1.8, 6, 18),
      malzeme(COLORS.NISAN, { saydam: 0.9, isik: COLORS.NISAN }),
    )
    // Mızrak tek şeride gidiyor; hangi şerit olduğu yolda görünsün.
    this.seritBandi = new THREE.Mesh(
      new THREE.PlaneGeometry(SERIT_ARALIK * 0.9, DOGUS_X - DURAK_X),
      malzeme(COLORS.NISAN, { saydam: 0.12 }),
    )
    this.seritBandi.rotation.x = -Math.PI / 2
    this.seritBandi.position.set(0, 1.2, (DOGUS_X + DURAK_X) / 2)
    sahne.add(this.nisanCizgisi, this.hedefHalkasi, this.seritBandi)
  }

  /** Mantıktaki atış listesini sahnedeki nesnelerle eşler. */
  esle(atislar: readonly Atis[], kuleler: readonly Kule[] = []): void {
    const ucan = new Set<number>()
    for (const atis of atislar) {
      ucan.add(atis.id)
      let gorunum = this.gorunumler.get(atis.id)
      if (!gorunum) {
        gorunum = this.gorunumYap(atis, kuleler)
        this.sahne.add(gorunum.kok)
        this.gorunumler.set(atis.id, gorunum)
      }
      const yol = Math.abs(atis.x - gorunum.basX)
      const oran = Math.max(0, 1 - yol / OK_YANAL_YOL)
      const yanal = gorunum.hedefYanal + (gorunum.yanal - gorunum.hedefYanal) * oran
      gorunum.kok.position.set(yanal, yukseklik(atis.y), atis.x)
      // Cisim uçtuğu yöne bakar: yerel +z, x ekseni etrafında açı kadar dönüyor.
      gorunum.kok.rotation.x = Math.atan2(atis.vy, atis.vx)
    }

    for (const [id, gorunum] of this.gorunumler) {
      if (ucan.has(id)) continue
      gorunum.kok.removeFromParent()
      birak(gorunum.kok)
      this.gorunumler.delete(id)
    }
  }

  /** Yere saplanan mızrak: efekt listesine devredilir, kendi kendine solar. */
  saplanan(x: number, aci: number, yanal = 0): void {
    const kok = mizrakYap(COLORS.MIZRAK_UC)
    kok.position.set(yanal, SAPLANAN_Y, x)
    kok.rotation.x = aci
    this.efektler.saplanan(kok)
  }

  /** Nişan izi: kesik noktalar ve düşeceği yerde halka. */
  nisaniCiz(yol: { x: number; y: number }[], yanal = 0): void {
    const [bas, son] = yol
    const uzunluk = Math.hypot(son.x - bas.x, son.y - bas.y)
    const adet = Math.max(2, Math.floor(uzunluk / NISAN_NOKTA_ARALIK))
    const dizi = new Float32Array(adet * 3)
    for (let i = 0; i < adet; i++) {
      const oran = i / (adet - 1)
      dizi[i * 3] = yanal
      dizi[i * 3 + 1] = yukseklik(bas.y + (son.y - bas.y) * oran)
      dizi[i * 3 + 2] = bas.x + (son.x - bas.x) * oran
    }
    this.nisanCizgisi.geometry.setAttribute('position', new THREE.BufferAttribute(dizi, 3))
    this.nisanCizgisi.geometry.computeBoundingSphere()
    this.hedefHalkasi.position.set(yanal, yukseklik(son.y), son.x)
    this.seritBandi.position.x = yanal
  }

  /** Hedef halkası hep kameraya dönük dursun. */
  kamerayaBak(yon: THREE.Quaternion): void {
    this.hedefHalkasi.quaternion.copy(yon)
  }

  temizle(): void {
    for (const gorunum of this.gorunumler.values()) {
      gorunum.kok.removeFromParent()
      birak(gorunum.kok)
    }
    this.gorunumler.clear()
  }

  /** Mızrak mı, ok mu, gülle mi, büyü topu mu — atışın taşıdığı özelliklerden. */
  private gorunumYap(atis: Atis, kuleler: readonly Kule[]): AtisGorunum {
    if (atis.tur === 'mizrak') {
      const renk = ELEMENT_RENGI[atis.element]
      const kok = mizrakYap(renk)
      kok.add(iz(atis.kritik ? 0xfde047 : renk, 3.4))
      // Kritik atış uçarken de belli olsun.
      if (atis.kritik) kok.add(kure(7, malzeme(0xfde047, { saydam: 0.5, isik: 0xfde047 }), 8))
      const serit = seritX(atis.serit)
      return { kok, yanal: serit, hedefYanal: serit, basX: atis.x }
    }

    const kok = new THREE.Group()
    if (atis.alan > 0) {
      kok.add(kure(6, KULE_TIPLERI[1].renk, 8), iz(0x78350f, 3.6))
    } else if (atis.zirhDelici) {
      const hale = new THREE.Mesh(
        new THREE.TorusGeometry(9, 1.6, 6, 14),
        malzeme(KULE_TIPLERI[2].renk, { saydam: 0.75, isik: KULE_TIPLERI[2].renk }),
      )
      hale.rotation.y = Math.PI / 2
      kok.add(kure(5, malzeme(KULE_TIPLERI[2].renk, { isik: KULE_TIPLERI[2].renk }), 8), hale, iz(KULE_TIPLERI[2].renk, 3.2))
    } else {
      const sap = silindir(1.5, 1.5, 20, COLORS.OK_SAP, 5)
      sap.rotation.x = Math.PI / 2
      const uc = koni(3, 8, COLORS.OK_UC, 5)
      uc.rotation.x = Math.PI / 2
      uc.position.z = 14
      kok.add(sap, uc, iz(0xe2e8f0, 2.2))
    }
    // Ok, atan kulenin yanından çıkıp hedefin şeridine süzülüyor.
    const kule = kuleler.find((k) => Math.abs(k.x - atis.x) < 2)
    return { kok, yanal: kule?.yanal ?? 0, hedefYanal: seritX(atis.serit), basX: atis.x }
  }
}

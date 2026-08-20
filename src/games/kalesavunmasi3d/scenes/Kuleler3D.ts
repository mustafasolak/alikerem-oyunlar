/**
 * Sahadaki kuleler.
 *
 * Sabit yuva yok: kule, yolun uzak yanındaki çimin herhangi bir noktasına
 * kuruluyor ve yerini mantıktaki `kule.x` (yol boyunca) ile `kule.yanal`
 * (yoldan uzaklık) taşıyor. Burası o listeyi sahnedeki nesnelerle eşliyor:
 * yeni kule geldiyse kurar, yıkılan gittiyse bırakır, seviye değiştiyse
 * modeli yeniden üretir.
 *
 * Menzil mantıkta yalnız yol ekseninde ölçülüyor; o yüzden seçili kulenin
 * menzili yol üzerinde şeffaf bir bantla gösteriliyor.
 */

import * as THREE from 'three'

import {
  KULE_MAX_SEVIYE,
  KULE_TABAN_Y,
  KULE_TIPLERI,
  YUVA_EN,
  ZEMIN_Y,
  kuleGorunum,
} from '../../kalesavunmasi/config/constants.ts'
import type { Kule } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { YOL_YARI_EN } from '../config/sahne3d.ts'
import { kuleModeli, type KuleModeli } from './KuleModelleri.ts'
import { birak, golgeVer, malzeme, silindir } from './yapi.ts'

/** Sekinin yüksekliği: mantıktaki kule taban hattı. */
const SEKI_BOY = ZEMIN_Y - KULE_TABAN_Y
/** Yükseltme sonrası zıplama süresi (ms). */
const POP_MS = 320
/** Büyücü kristalinin dönüş hızı (radyan/saniye) ve salınım süresi (ms). */
const KRISTAL_DONUS = 1.1
const KRISTAL_SALINIM_MS = 1600
/** Tepe ışığının yanıp sönme süresi (ms). */
const ISIK_MS = 900
/** Sersem kulenin üstünde dönen halkanın hızı (radyan/saniye). */
const SERSEM_DONUS = 3.4
/** Menü kulenin tepesinden bu kadar yukarıda durur. */
const MENU_PAY = 74
/** Boş noktada bekleyen işaretin yüksekliği. */
const ISARET_Y = 8

interface KuleGorunum {
  grup: THREE.Group
  model: KuleModeli
  sersem: THREE.Mesh
  /** Hangi görünümün çizili olduğunu tutar: "tip:seviye". */
  imza: string
  popKalan: number
}

export class Kuleler3D {
  /** Işın izleme hedefleri: kule gövdeleri. */
  readonly hedefler: THREE.Object3D[] = []

  private readonly sahne: THREE.Scene
  private readonly gercekGolge: boolean
  private readonly gorunumler = new Map<number, KuleGorunum>()
  private readonly secimHalkasi: THREE.Mesh
  private readonly menzilBandi: THREE.Mesh
  /** Kule kurmak için seçilen boş noktadaki işaret. */
  private readonly nokta: THREE.Mesh
  private secili: number | null = null
  private zaman = 0

  constructor(sahne: THREE.Scene, gercekGolge = false) {
    this.sahne = sahne
    this.gercekGolge = gercekGolge

    this.secimHalkasi = new THREE.Mesh(
      new THREE.TorusGeometry(YUVA_EN * 0.85, 3, 6, 20),
      malzeme(0x38bdf8, { saydam: 0.85, isik: 0x0369a1 }),
    )
    this.secimHalkasi.rotation.x = -Math.PI / 2
    this.secimHalkasi.visible = false

    this.menzilBandi = new THREE.Mesh(
      new THREE.PlaneGeometry(YOL_YARI_EN * 2, 1),
      malzeme(0x38bdf8, { saydam: 0.16 }),
    )
    this.menzilBandi.rotation.x = -Math.PI / 2
    this.menzilBandi.position.y = 1.5
    this.menzilBandi.visible = false

    this.nokta = new THREE.Mesh(
      new THREE.TorusGeometry(YUVA_EN * 0.7, 3.4, 6, 20),
      malzeme(0xfef08a, { saydam: 0.9, isik: 0x854d0e }),
    )
    this.nokta.rotation.x = -Math.PI / 2
    this.nokta.visible = false

    sahne.add(this.secimHalkasi, this.menzilBandi, this.nokta)
  }

  get seciliId(): number | null {
    return this.secili
  }

  /** Işın hangi kuleye değdi? */
  kuleIdBul(nesne: THREE.Object3D): number | null {
    let gecerli: THREE.Object3D | null = nesne
    while (gecerli) {
      const id = gecerli.userData?.kuleId
      if (typeof id === 'number') return id
      gecerli = gecerli.parent
    }
    return null
  }

  konum(kule: Kule): THREE.Vector3 {
    return new THREE.Vector3(kule.yanal, SEKI_BOY, kule.x)
  }

  /** Menünün duracağı nokta: kulenin ya da seçilen boş noktanın üstü. */
  menuKonumu(kule: Kule | null, nokta?: { x: number; yanal: number }): THREE.Vector3 {
    if (kule) {
      return new THREE.Vector3(kule.yanal, SEKI_BOY + kuleGorunum(kule.seviye).boy * 1.15 + MENU_PAY, kule.x)
    }
    return new THREE.Vector3(nokta?.yanal ?? 0, SEKI_BOY + MENU_PAY, nokta?.x ?? 0)
  }

  /** Kule kurulacak noktayı işaretler; null verilirse işaret kalkar. */
  noktaIsaretle(nokta: { x: number; yanal: number } | null): void {
    this.nokta.visible = nokta !== null
    if (nokta) this.nokta.position.set(nokta.yanal, ISARET_Y, nokta.x)
  }

  sec(id: number | null, kuleler: Kule[]): void {
    this.secili = id
    const kule = id === null ? null : (kuleler.find((k) => k.id === id) ?? null)
    this.secimHalkasi.visible = kule !== null
    if (!kule) {
      this.menzilBandi.visible = false
      return
    }
    this.secimHalkasi.position.set(kule.yanal, SEKI_BOY + 2, kule.x)
    this.menziliGoster(kule)
  }

  /** Mantıktaki kule listesini sahnedekilerle eşler. */
  tazele(kuleler: Kule[]): void {
    const yasayan = new Set<number>()
    for (const kule of kuleler) {
      yasayan.add(kule.id)
      const imza = `${kule.tip}:${kule.seviye}`
      const varolan = this.gorunumler.get(kule.id)
      if (varolan && varolan.imza === imza) {
        varolan.sersem.visible = kule.sersem > 0
        continue
      }
      const eskiSeviye = varolan ? Number(varolan.imza.split(':')[1]) : 0
      if (varolan) this.gorunumuSil(kule.id)
      this.gorunumKur(kule, imza, kule.seviye > eskiSeviye)
    }

    for (const id of [...this.gorunumler.keys()]) {
      if (yasayan.has(id)) continue
      this.gorunumuSil(id)
      if (this.secili === id) this.sec(null, kuleler)
    }
    if (this.secili !== null) {
      const kule = kuleler.find((k) => k.id === this.secili)
      if (kule) this.menziliGoster(kule)
    }
  }

  guncelle(delta: number): void {
    this.zaman += delta
    for (const gorunum of this.gorunumler.values()) {
      for (const parca of gorunum.model.donenler) parca.rotation.y += (KRISTAL_DONUS * delta) / 1000
      for (const parca of gorunum.model.salinanlar) {
        const temel = (parca.userData.temelY as number) ?? parca.position.y
        parca.position.y = temel + Math.sin((this.zaman / KRISTAL_SALINIM_MS) * Math.PI * 2) * 5
      }
      for (const isik of gorunum.model.isiklar) {
        isik.scale.setScalar(0.75 + 0.35 * Math.sin((this.zaman / ISIK_MS) * Math.PI * 2))
      }
      if (gorunum.sersem.visible) gorunum.sersem.rotation.z += (SERSEM_DONUS * delta) / 1000
      if (gorunum.popKalan > 0) {
        gorunum.popKalan -= delta
        gorunum.grup.scale.setScalar(1 + Math.max(0, gorunum.popKalan / POP_MS) * 0.18)
      }
    }
    this.nokta.rotation.z += (1.6 * delta) / 1000
  }

  sifirla(): void {
    for (const id of [...this.gorunumler.keys()]) this.gorunumuSil(id)
    this.noktaIsaretle(null)
    this.sec(null, [])
  }

  // --- İç ---

  private menziliGoster(kule: Kule): void {
    const menzil = KULE_TIPLERI[kule.tip].menzil[Math.min(kule.seviye, KULE_MAX_SEVIYE) - 1]
    this.menzilBandi.visible = true
    this.menzilBandi.scale.set(1, menzil * 2, 1)
    this.menzilBandi.position.z = kule.x
  }

  /** Kulenin sekisi, gövdesi ve sersemleme halkası. */
  private gorunumKur(kule: Kule, imza: string, zipla: boolean): void {
    const grup = new THREE.Group()
    grup.position.set(kule.yanal, 0, kule.x)
    grup.userData.kuleId = kule.id

    const seki = silindir(YUVA_EN * 0.62, YUVA_EN * 0.72, SEKI_BOY, 0x6b7280, 12)
    seki.position.y = SEKI_BOY / 2
    grup.add(seki)

    const model = kuleModeli(kule.tip, kule.seviye, SEKI_BOY)
    grup.add(model.kok)

    const sersem = new THREE.Mesh(
      new THREE.TorusGeometry(15, 3, 6, 16),
      malzeme(0xfbbf24, { saydam: 0.9, isik: 0x92400e }),
    )
    sersem.rotation.x = -Math.PI / 2
    sersem.position.y = SEKI_BOY + kuleGorunum(kule.seviye).boy + 34
    sersem.visible = kule.sersem > 0
    grup.add(sersem)

    if (this.gercekGolge) golgeVer(grup, true, true)
    this.sahne.add(grup)
    // Işın izleme kulenin her parçasına değebilsin; kimlik grupta.
    grup.traverse((nesne) => {
      if (nesne instanceof THREE.Mesh) this.hedefler.push(nesne)
    })
    this.gorunumler.set(kule.id, { grup, model, sersem, imza, popKalan: zipla ? POP_MS : 0 })
  }

  private gorunumuSil(id: number): void {
    const gorunum = this.gorunumler.get(id)
    if (!gorunum) return
    gorunum.grup.traverse((nesne) => {
      const sira = this.hedefler.indexOf(nesne)
      if (sira >= 0) this.hedefler.splice(sira, 1)
    })
    gorunum.grup.removeFromParent()
    birak(gorunum.grup)
    this.gorunumler.delete(id)
  }
}

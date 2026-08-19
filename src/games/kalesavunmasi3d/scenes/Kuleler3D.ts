/**
 * Kule yuvaları ve üstlerindeki kuleler.
 *
 * Yuvalar yolun arka kenarındaki çimde, taş bir sekinin üstünde durur; seki
 * yüksekliği mantıktaki `KULE_TABAN_Y` ile aynı hizaya denk gelir, böylece ok
 * tam mazgal hattından çıkar. Kule görünümü seviyeye göre `KULE_SEVIYE_GORUNUM`
 * tablosundan kurulur: gövde büyür, çatı çıkar, bayrak ve altın şerit gelir.
 *
 * Menzil, mantıkta yalnız z ekseninde ölçüldüğü için yol üzerinde şeffaf bir
 * bantla gösteriliyor — oyuncu kulenin neyi kapsadığını satın almadan görüyor.
 */

import * as THREE from 'three'

import {
  KULE_MAX_SEVIYE,
  KULE_TABAN_Y,
  KULE_TIPLERI,
  KULE_YUVALARI,
  YUVA_EN,
  ZEMIN_Y,
  kuleGorunum,
} from '../../kalesavunmasi/config/constants.ts'
import type { Kule } from '../../kalesavunmasi/systems/KaleSavunmasi.ts'
import { YOL_YARI_EN } from '../config/sahne3d.ts'
import { acik, birak, koni, kutu, malzeme, silindir } from './yapi.ts'

/** Kuleler yolun bu kadar yanında durur. */
export const KULE_YANAL = YOL_YARI_EN + 66
/** Sekinin yüksekliği: mantıktaki kule taban hattı. */
const SEKI_BOY = ZEMIN_Y - KULE_TABAN_Y
/** Boş yuvanın üstünde dönen işaret. */
const ISARET_DONUS = 1.6
/** Yükseltme sonrası zıplama süresi (ms). */
const POP_MS = 320

export class Kuleler3D {
  /** Işın izleme hedefleri: seki ve kule gövdeleri. */
  readonly hedefler: THREE.Object3D[] = []

  private readonly yuvalar: THREE.Group[] = []
  private readonly isaretler: THREE.Mesh[] = []
  private readonly kuleGruplari: (THREE.Group | null)[] = []
  /** Hangi görünümün çizili olduğunu tutar: "tip:seviye". */
  private readonly imzalar: string[] = []
  private readonly secimHalkasi: THREE.Mesh
  private readonly menzilBandi: THREE.Mesh
  private secili: number | null = null
  private popKalan = 0
  private popYuva = -1
  private zaman = 0

  constructor(sahne: THREE.Scene) {
    for (let yuva = 0; yuva < KULE_YUVALARI.length; yuva++) {
      const grup = new THREE.Group()
      grup.position.set(KULE_YANAL, 0, KULE_YUVALARI[yuva])
      grup.userData.yuva = yuva

      const seki = silindir(YUVA_EN * 0.62, YUVA_EN * 0.72, SEKI_BOY, 0x6b7280, 12)
      seki.position.y = SEKI_BOY / 2
      seki.userData.yuva = yuva
      grup.add(seki)
      this.hedefler.push(seki)

      // Boş yuvanın işareti: yerden yükselen sarı artı.
      const isaret = new THREE.Mesh(
        new THREE.TorusGeometry(13, 3.4, 6, 14),
        malzeme(0xfef08a, { saydam: 0.9, isik: 0x854d0e }),
      )
      isaret.position.y = SEKI_BOY + 20
      isaret.userData.yuva = yuva
      grup.add(isaret)
      this.isaretler.push(isaret)
      this.hedefler.push(isaret)

      this.yuvalar.push(grup)
      this.kuleGruplari.push(null)
      this.imzalar.push('')
      sahne.add(grup)
    }

    this.secimHalkasi = new THREE.Mesh(
      new THREE.TorusGeometry(YUVA_EN * 0.85, 3, 6, 20),
      malzeme(0x38bdf8, { saydam: 0.85, isik: 0x0369a1 }),
    )
    this.secimHalkasi.rotation.x = -Math.PI / 2
    this.secimHalkasi.visible = false
    sahne.add(this.secimHalkasi)

    this.menzilBandi = new THREE.Mesh(
      new THREE.PlaneGeometry(YOL_YARI_EN * 2, 1),
      malzeme(0x38bdf8, { saydam: 0.16 }),
    )
    this.menzilBandi.rotation.x = -Math.PI / 2
    this.menzilBandi.position.y = 1.5
    this.menzilBandi.visible = false
    sahne.add(this.menzilBandi)
  }

  /** Işın hangi yuvaya değdi? */
  yuvaBul(nesne: THREE.Object3D): number | null {
    let gecerli: THREE.Object3D | null = nesne
    while (gecerli) {
      const yuva = gecerli.userData?.yuva
      if (typeof yuva === 'number') return yuva
      gecerli = gecerli.parent
    }
    return null
  }

  konum(yuva: number): THREE.Vector3 {
    return new THREE.Vector3(KULE_YANAL, SEKI_BOY, KULE_YUVALARI[yuva])
  }

  sec(yuva: number | null, kuleler: (Kule | null)[]): void {
    this.secili = yuva
    this.secimHalkasi.visible = yuva !== null
    if (yuva === null) {
      this.menzilBandi.visible = false
      return
    }
    this.secimHalkasi.position.set(KULE_YANAL, SEKI_BOY + 2, KULE_YUVALARI[yuva])
    this.menziliGoster(yuva, kuleler[yuva])
  }

  get seciliYuva(): number | null {
    return this.secili
  }

  /** Kule listesi değiştiyse görünümleri yeniden kurar. */
  tazele(kuleler: (Kule | null)[]): void {
    for (let yuva = 0; yuva < this.yuvalar.length; yuva++) {
      const kule = kuleler[yuva]
      const imza = kule ? `${kule.tip}:${kule.seviye}` : ''
      if (imza === this.imzalar[yuva]) continue

      const eskiSeviye = this.imzalar[yuva] ? Number(this.imzalar[yuva].split(':')[1]) : 0
      this.imzalar[yuva] = imza
      this.kuleyiSil(yuva)
      this.isaretler[yuva].visible = !kule
      if (!kule) continue

      const grup = this.kuleyiKur(kule)
      this.yuvalar[yuva].add(grup)
      this.kuleGruplari[yuva] = grup
      for (const parca of grup.children) this.hedefler.push(parca)
      // Yeni kurulan ya da yükselen kule zıplasın.
      if (kule.seviye > eskiSeviye) {
        this.popKalan = POP_MS
        this.popYuva = yuva
      }
    }
    if (this.secili !== null) this.menziliGoster(this.secili, kuleler[this.secili])
  }

  guncelle(delta: number): void {
    this.zaman += delta
    for (const isaret of this.isaretler) {
      if (!isaret.visible) continue
      isaret.rotation.z += (ISARET_DONUS * delta) / 1000
      isaret.position.y = SEKI_BOY + 20 + Math.sin(this.zaman / 420) * 4
    }
    if (this.popKalan > 0) {
      this.popKalan -= delta
      const grup = this.kuleGruplari[this.popYuva]
      const oran = Math.max(0, this.popKalan / POP_MS)
      if (grup) grup.scale.setScalar(1 + oran * 0.18)
    }
  }

  sifirla(): void {
    for (let yuva = 0; yuva < this.yuvalar.length; yuva++) {
      this.kuleyiSil(yuva)
      this.imzalar[yuva] = ''
      this.isaretler[yuva].visible = true
    }
    this.sec(null, [])
  }

  // --- İç ---

  private menziliGoster(yuva: number, kule: Kule | null | undefined): void {
    if (!kule) {
      this.menzilBandi.visible = false
      return
    }
    const menzil = KULE_TIPLERI[kule.tip].menzil[Math.min(kule.seviye, KULE_MAX_SEVIYE) - 1]
    this.menzilBandi.visible = true
    this.menzilBandi.scale.set(1, menzil * 2, 1)
    this.menzilBandi.position.z = KULE_YUVALARI[yuva]
  }

  private kuleyiSil(yuva: number): void {
    const grup = this.kuleGruplari[yuva]
    if (!grup) return
    for (const parca of grup.children) {
      const sira = this.hedefler.indexOf(parca)
      if (sira >= 0) this.hedefler.splice(sira, 1)
    }
    grup.removeFromParent()
    birak(grup)
    this.kuleGruplari[yuva] = null
  }

  /** Seviyeye göre kule gövdesi, mazgal, çatı, bayrak ve tepe ışığı. */
  private kuleyiKur(kule: Kule): THREE.Group {
    const grup = new THREE.Group()
    const g = kuleGorunum(kule.seviye)
    const tip = KULE_TIPLERI[kule.tip]
    const renk = acik(tip.renk, g.tonOran)

    const govde = kutu(g.en, g.boy, g.en, renk)
    govde.position.y = SEKI_BOY + g.boy / 2
    grup.add(govde)

    // Mazgallar tepe hattında çepeçevre.
    const mazgalEn = g.en / (g.mazgal + 1)
    for (let i = 0; i <= g.mazgal; i++) {
      for (const yon of [-1, 1]) {
        const mazgal = kutu(mazgalEn * 0.7, 9, mazgalEn * 0.7, acik(renk, 0.25))
        mazgal.position.set(
          -g.en / 2 + mazgalEn * (i + 0.5),
          SEKI_BOY + g.boy + 4.5,
          (yon * g.en) / 2 - yon * mazgalEn * 0.4,
        )
        grup.add(mazgal)
      }
    }

    if (g.cati > 0) {
      const cati = koni(g.en * 0.78, g.cati, 0x1e3a8a, 4)
      cati.rotation.y = Math.PI / 4
      cati.position.y = SEKI_BOY + g.boy + g.cati / 2 + 8
      grup.add(cati)
    }
    if (g.bayrak > 0) {
      const direk = silindir(1.6, 1.6, g.bayrak, 0x78716c, 5)
      direk.position.y = SEKI_BOY + g.boy + g.cati + g.bayrak / 2 + 6
      const bez = kutu(15, 10, 1.2, tip.renk)
      bez.position.set(8, SEKI_BOY + g.boy + g.cati + g.bayrak, 0)
      grup.add(direk, bez)
    }
    if (g.susleme) {
      const serit = kutu(g.en + 2, 5, g.en + 2, 0xfbbf24)
      serit.position.y = SEKI_BOY + g.boy * 0.62
      grup.add(serit)
    }
    if (g.takviye) {
      for (const yon of [-1, 1]) {
        const takviye = kutu(8, g.boy * 0.5, 8, 0x64748b)
        takviye.position.set((yon * g.en) / 2, SEKI_BOY + g.boy * 0.25, (yon * g.en) / 2)
        grup.add(takviye)
      }
    }
    if (g.isik) {
      const isik = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), malzeme(0xfde047, { isik: 0xfde047 }))
      isik.position.y = SEKI_BOY + g.boy + g.cati + g.bayrak + 16
      grup.add(isik)
    }
    return grup
  }
}

/**
 * Kısa ömürlü görsel efektler: isabet halkası, hasar/puan yazısı, şimşek
 * zinciri, bomba patlaması ve yere saplanan mızrak.
 *
 * Hepsi tek bir listede tutulup her karede yaşlandırılıyor; ömrü dolan
 * sahneden çıkıp GPU kaynaklarını bırakıyor. Yazı dokuları metne göre
 * önbelleklenir — aynı hasar sayısı oyun boyunca yüzlerce kez çıkıyor, her
 * seferinde tuval çizmek boşa iş olurdu.
 */

import * as THREE from 'three'

import { FONT_FAMILY } from '../../kalesavunmasi/config/constants.ts'
import { birak, kutu, malzeme } from './yapi.ts'

interface Efekt {
  nesne: THREE.Object3D
  omur: number
  gecen: number
  /** Her karede 0..1 ilerlemeyle çağrılır. */
  isle: (nesne: THREE.Object3D, oran: number) => void
}

/** Yazı dokusunun tuval ölçüsü. */
const YAZI_EN = 128
const YAZI_BOY = 64
/** Yazının dünyadaki genişliği. */
const YAZI_OLCEK = 46
const ISABET_MS = 240
const YAZI_MS = 780
const ZINCIR_MS = 220
const PATLAMA_MS = 360
const SAPLANAN_MS = 2600
/** Ölümde savrulan parça sayısı, süresi ve yerçekimi (birim/sn²). */
const PARCA_ADET = 9
const PARCA_MS = 720
const YERCEKIMI = 620
const TOZ_MS = 480
/** Şef şok halkasının süresi (ms). */
const SOK_MS = 700

export class Efektler3D {
  private readonly sahne: THREE.Scene
  private readonly efektler: Efekt[] = []
  private readonly dokular = new Map<string, THREE.CanvasTexture>()

  constructor(sahne: THREE.Scene) {
    this.sahne = sahne
  }

  guncelle(delta: number, kameraYonu: THREE.Quaternion): void {
    for (let i = this.efektler.length - 1; i >= 0; i--) {
      const efekt = this.efektler[i]
      efekt.gecen += delta
      const oran = Math.min(1, efekt.gecen / efekt.omur)
      efekt.isle(efekt.nesne, oran)
      if (efekt.nesne instanceof THREE.Sprite) efekt.nesne.quaternion.copy(kameraYonu)
      if (oran < 1) continue
      efekt.nesne.removeFromParent()
      birak(efekt.nesne)
      this.efektler.splice(i, 1)
    }
  }

  /** Yeni tur: ekranda kalan ne varsa siler. */
  temizle(): void {
    for (const efekt of this.efektler) {
      efekt.nesne.removeFromParent()
      birak(efekt.nesne)
    }
    this.efektler.length = 0
  }

  bosalt(): void {
    this.temizle()
    for (const doku of this.dokular.values()) doku.dispose()
    this.dokular.clear()
  }

  // --- Efektler ---

  /** İsabet: büyüyüp sönen beyaz küre. */
  isabet(konum: THREE.Vector3, renk = 0xffffff): void {
    const kure = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), malzeme(renk, { saydam: 0.8, isik: renk }))
    kure.position.copy(konum)
    this.ekle(kure, ISABET_MS, (nesne, oran) => {
      nesne.scale.setScalar(1 + oran * 1.8)
      const m = (nesne as THREE.Mesh).material as THREE.MeshLambertMaterial
      m.opacity = 0.8 * (1 - oran)
    })
  }

  /** Yükselip sönen yazı (hasar, puan). */
  yazi(konum: THREE.Vector3, metin: string, renk: string, olcek = 1): void {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.doku(metin, renk), transparent: true, depthTest: false }),
    )
    sprite.position.copy(konum)
    sprite.scale.set(YAZI_OLCEK * olcek, (YAZI_OLCEK * olcek * YAZI_BOY) / YAZI_EN, 1)
    const baslangicY = konum.y
    this.ekle(sprite, YAZI_MS, (nesne, oran) => {
      nesne.position.y = baslangicY + oran * 46
      ;((nesne as THREE.Sprite).material as THREE.SpriteMaterial).opacity = 1 - oran * oran
    })
  }

  /** Şimşeğin atladığı yol. */
  zincir(bas: THREE.Vector3, son: THREE.Vector3, renk: number): void {
    const geometri = new THREE.BufferGeometry().setFromPoints([bas, son])
    const cizgi = new THREE.Line(geometri, new THREE.LineBasicMaterial({ color: renk, transparent: true }))
    this.ekle(cizgi, ZINCIR_MS, (nesne, oran) => {
      ;((nesne as THREE.Line).material as THREE.LineBasicMaterial).opacity = 1 - oran
    })
  }

  /** Bomba: içte kısa bir parlama, dışta menzili gösteren küre. */
  patlama(konum: THREE.Vector3, yaricap: number, renk: number): void {
    const parlama = new THREE.Mesh(
      new THREE.SphereGeometry(yaricap * 0.42, 12, 10),
      malzeme(0xfff7ed, { saydam: 0.9, isik: 0xfb923c }),
    )
    parlama.position.copy(konum)
    this.ekle(parlama, PATLAMA_MS * 0.45, (nesne, oran) => {
      nesne.scale.setScalar(0.5 + oran * 0.9)
      ;((nesne as THREE.Mesh).material as THREE.MeshLambertMaterial).opacity = 0.9 * (1 - oran)
    })

    const kure = new THREE.Mesh(new THREE.SphereGeometry(yaricap, 14, 10), malzeme(renk, { saydam: 0.34, isik: renk }))
    kure.position.copy(konum)
    kure.scale.setScalar(0.4)
    this.ekle(kure, PATLAMA_MS, (nesne, oran) => {
      nesne.scale.setScalar(0.4 + oran * 0.8)
      const m = (nesne as THREE.Mesh).material as THREE.MeshLambertMaterial
      m.opacity = 0.34 * (1 - oran)
    })
  }

  /**
   * Ölüm: gövde renginde parçalar savrulup yere düşer, yerinde toz bulutu kalır.
   *
   * Parçaların yeri her karede birikimle değil, süreden doğrudan hesaplanıyor
   * (yol = hız·t − ½·g·t²); böylece kare atlasa da hareket aynı kalıyor.
   */
  parcalanma(konum: THREE.Vector3, renk: number, olcek = 1): void {
    const grup = new THREE.Group()
    grup.position.copy(konum)
    const hizlar: THREE.Vector3[] = []
    for (let i = 0; i < PARCA_ADET; i++) {
      const boy = (3 + Math.random() * 4) * olcek
      grup.add(kutu(boy, boy, boy, malzeme(renk, { saydam: 1 })))
      hizlar.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 170,
          70 + Math.random() * 150,
          (Math.random() - 0.5) * 170,
        ),
      )
    }
    this.ekle(grup, PARCA_MS, (nesne, oran) => {
      const t = (oran * PARCA_MS) / 1000
      for (let i = 0; i < nesne.children.length; i++) {
        const parca = nesne.children[i]
        const hiz = hizlar[i]
        parca.position.set(hiz.x * t, Math.max(2, hiz.y * t - 0.5 * YERCEKIMI * t * t), hiz.z * t)
        parca.rotation.set(hiz.x * t * 0.04, 0, hiz.z * t * 0.04)
        const m = (parca as THREE.Mesh).material as THREE.MeshLambertMaterial
        m.opacity = 1 - oran * oran
      }
    })

    const toz = new THREE.Mesh(
      new THREE.SphereGeometry(10 * olcek, 10, 8),
      malzeme(0xd6d3d1, { saydam: 0.45 }),
    )
    toz.position.copy(konum).setY(konum.y * 0.4 + 4)
    this.ekle(toz, TOZ_MS, (nesne, oran) => {
      nesne.scale.setScalar(0.6 + oran * 1.9)
      ;((nesne as THREE.Mesh).material as THREE.MeshLambertMaterial).opacity = 0.45 * (1 - oran)
    })
  }

  /** Şef şoku: yerde büyüyüp sönen halka. */
  sok(konum: THREE.Vector3, yaricap: number): void {
    const halka = new THREE.Mesh(
      new THREE.TorusGeometry(yaricap, 6, 6, 28),
      malzeme(0xf87171, { saydam: 0.75, isik: 0x7f1d1d }),
    )
    halka.rotation.x = -Math.PI / 2
    halka.position.copy(konum).setY(4)
    halka.scale.setScalar(0.2)
    this.ekle(halka, SOK_MS, (nesne, oran) => {
      nesne.scale.setScalar(0.2 + oran * 0.9)
      ;((nesne as THREE.Mesh).material as THREE.MeshLambertMaterial).opacity = 0.75 * (1 - oran)
    })
  }

  /** Yere saplanan mızrak: bir süre durur, sonra solar. */
  saplanan(nesne: THREE.Object3D): void {
    this.sahne.add(nesne)
    this.efektler.push({
      nesne,
      omur: SAPLANAN_MS,
      gecen: 0,
      isle: (hedef, oran) => {
        if (oran < 0.85) return
        const kalan = (1 - oran) / 0.15
        hedef.traverse((parca) => {
          const m = (parca as Partial<THREE.Mesh>).material as THREE.MeshLambertMaterial | undefined
          if (!m || !('opacity' in m)) return
          m.transparent = true
          m.opacity = kalan
        })
      },
    })
  }

  // --- İç ---

  private ekle(nesne: THREE.Object3D, omur: number, isle: (nesne: THREE.Object3D, oran: number) => void): void {
    this.sahne.add(nesne)
    this.efektler.push({ nesne, omur, gecen: 0, isle })
  }

  /** Metin dokusu; aynı yazı ikinci kez istenirse önbellekten döner. */
  private doku(metin: string, renk: string): THREE.CanvasTexture {
    const anahtar = `${metin}|${renk}`
    const hazir = this.dokular.get(anahtar)
    if (hazir) return hazir

    const tuval = document.createElement('canvas')
    tuval.width = YAZI_EN
    tuval.height = YAZI_BOY
    const ctx = tuval.getContext('2d')
    if (ctx) {
      ctx.font = `bold 44px ${FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = 7
      ctx.strokeStyle = 'rgba(15,23,42,0.9)'
      ctx.strokeText(metin, YAZI_EN / 2, YAZI_BOY / 2)
      ctx.fillStyle = renk
      ctx.fillText(metin, YAZI_EN / 2, YAZI_BOY / 2)
    }
    const doku = new THREE.CanvasTexture(tuval)
    this.dokular.set(anahtar, doku)
    return doku
  }
}

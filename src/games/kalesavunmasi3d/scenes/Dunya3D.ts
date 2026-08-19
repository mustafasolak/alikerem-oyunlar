/**
 * Sahanın çevresi: gökyüzü, ışıklar, çim, toprak yol, ağaçlar, uzaktaki dağlar
 * ve bulutlar. Tek bir görsel dosya kullanılmıyor — hepsi geometriyle kuruluyor.
 *
 * Yerleşim bir kez üretilir; vakit değişince (gündüz → akşam → gece) yalnız
 * renkler tazelenir, ağaçlar yerinden oynamaz. İki boyutlu sürümün `ArkaPlan`
 * sınıfının yaptığı işin aynısı.
 */

import * as THREE from 'three'

import {
  GAME_WIDTH,
  VAKITLER,
  type VakitPaleti,
  vakitIndeksi,
} from '../../kalesavunmasi/config/constants.ts'
import {
  AGAC_BOY,
  AGAC_UZAKLIK,
  BORDUR_BOY,
  BORDUR_EN,
  CIM_YARI_EN,
  DAG_ADET,
  DAG_UZAKLIK,
  DEKOR_ARKA,
  DEKOR_ON,
  GOK_ISIK_GUCU,
  GUNES_GUCU,
  GUNES_YONU,
  SAHA_ARKA,
  SAHA_ON,
  SIS_UZAK,
  SIS_YAKIN,
  VAKIT_ISIGI,
  YOL_YARI_EN,
} from '../config/sahne3d.ts'
import type { Kalite } from '../config/sahne3d.ts'
import { acik, doseme, golgeVer, koni, kure, kutu, malzeme, silindir } from './yapi.ts'

/**
 * Gökyüzü dokusunun çözünürlüğü.
 *
 * Geniş olması şart: dar tuvalde çizilen yıldız ekrana yayılınca nokta değil
 * çizgi oluyordu.
 */
const GOK_DOKU_EN = 256
const GOK_DOKU_BOY = 256
const YILDIZ_ADET = 160
/** Bulutların yüksekliği ve sürüklenme hızı (birim/saniye). */
const BULUT_Y = 760
const BULUT_HIZ = 9
/** Gölge haritasının çözünürlüğü ve kapsadığı alanın yarısı. */
const GOLGE_DOKU = 2048
const GOLGE_ALAN = 660

interface Agac {
  govde: THREE.Mesh
  yaprak: THREE.Mesh[]
  on: boolean
}

export class Dunya3D {
  readonly kok = new THREE.Group()

  private readonly sahne: THREE.Scene
  private readonly gokTuval: HTMLCanvasElement
  private readonly gokDoku: THREE.CanvasTexture
  private readonly gokIsik: THREE.HemisphereLight
  private readonly gunes: THREE.DirectionalLight
  /** Her yeri eşit aydınlatan taban ışık; gece yükseliyor. */
  private readonly tabanIsik: THREE.AmbientLight
  private readonly cim: THREE.Mesh
  private readonly yol: THREE.Mesh
  private readonly bordurler: THREE.Mesh[] = []
  private readonly agaclar: Agac[] = []
  private readonly daglar: THREE.Mesh[] = []
  private readonly taslar: THREE.Mesh[] = []
  private readonly bulutlar: THREE.Group[] = []
  private vakit = -1

  private readonly kalite: Kalite

  constructor(sahne: THREE.Scene, kalite: Kalite) {
    this.kalite = kalite
    const gercekGolge = kalite.golge

    this.sahne = sahne
    sahne.add(this.kok)

    this.gokTuval = document.createElement('canvas')
    this.gokTuval.width = GOK_DOKU_EN
    this.gokTuval.height = GOK_DOKU_BOY
    this.gokDoku = new THREE.CanvasTexture(this.gokTuval)
    sahne.background = this.gokDoku
    sahne.fog = new THREE.Fog(0xffffff, SIS_YAKIN, SIS_UZAK)

    this.gokIsik = new THREE.HemisphereLight(0xffffff, 0x557733, GOK_ISIK_GUCU)
    this.tabanIsik = new THREE.AmbientLight(0xffffff, 0.06)
    this.kok.add(this.tabanIsik)
    this.gunes = new THREE.DirectionalLight(0xffffff, GUNES_GUCU)
    // Işık sahanın ortasına baksın: gölge haritası da o kutuyu kapsıyor.
    const merkez = new THREE.Vector3(0, 0, GAME_WIDTH / 2)
    this.gunes.target.position.copy(merkez)
    this.gunes.position.copy(merkez).add(new THREE.Vector3(GUNES_YONU.x, GUNES_YONU.y, GUNES_YONU.z))
    this.kok.add(this.gokIsik, this.gunes, this.gunes.target)

    if (gercekGolge) {
      this.gunes.castShadow = true
      this.gunes.shadow.mapSize.set(GOLGE_DOKU, GOLGE_DOKU)
      const k = this.gunes.shadow.camera
      k.left = -GOLGE_ALAN
      k.right = GOLGE_ALAN
      k.top = GOLGE_ALAN
      k.bottom = -GOLGE_ALAN
      k.near = 100
      k.far = 2600
      k.updateProjectionMatrix()
      // Kendi üstüne düşen gölgenin çizgi çizgi görünmesini engeller.
      this.gunes.shadow.bias = -0.0016
      this.gunes.shadow.normalBias = 1.6
    }

    const uzunluk = SAHA_ON - SAHA_ARKA
    const ortaZ = (SAHA_ON + SAHA_ARKA) / 2

    this.cim = doseme(CIM_YARI_EN * 2, uzunluk, 0x65a30d)
    this.cim.position.set(0, -0.6, ortaZ)
    this.yol = doseme(YOL_YARI_EN * 2, uzunluk, 0x9a7b4f)
    this.yol.position.set(0, 0, ortaZ)
    this.kok.add(this.cim, this.yol)
    if (gercekGolge) golgeVer(this.cim, false, true)
    if (gercekGolge) golgeVer(this.yol, false, true)

    for (const yon of [-1, 1]) {
      const bordur = kutu(BORDUR_EN, BORDUR_BOY, uzunluk, 0x94a3b8)
      bordur.position.set(yon * (YOL_YARI_EN + BORDUR_EN / 2), BORDUR_BOY / 2, ortaZ)
      this.bordurler.push(bordur)
      this.kok.add(bordur)
    }

    this.agaclariKur()
    this.daglariKur()
    this.taslariKur()
    this.bulutlariKur()
    // Ağaç ve taşlar gölge düşürsün; dağ ve bulut alanın dışında kalıyor.
    if (gercekGolge) {
      for (const agac of this.agaclar) {
        golgeVer(agac.govde, true, false)
        for (const kat of agac.yaprak) golgeVer(kat, true, false)
      }
      for (const tas of this.taslar) golgeVer(tas, true, true)
    }
  }

  /** Yeni tur: vakti dalgaya göre baştan seçer. */
  sifirla(dalga: number, kayma = 0): void {
    this.vakit = -1
    this.vakitGuncelle(dalga, kayma)
  }

  /** Dalgaya göre vakti seçer; değiştiyse renkleri tazeler. */
  vakitGuncelle(dalga: number, kayma = 0): void {
    const hedef = Math.min(VAKITLER.length - 1, vakitIndeksi(dalga) + kayma)
    if (hedef === this.vakit) return
    this.vakit = hedef
    this.renkleriTazele(VAKITLER[hedef])
  }

  /** Kaçıncı vakit (0 gündüz … 2 gece). */
  get vakitSirasi(): number {
    return Math.max(0, this.vakit)
  }

  guncelle(delta: number): void {
    const yol = (BULUT_HIZ * delta) / 1000
    for (const bulut of this.bulutlar) {
      bulut.position.z -= yol
      if (bulut.position.z < DEKOR_ARKA) bulut.position.z = DEKOR_ON
    }
  }

  // --- Yerleşim ---

  private agaclariKur(): void {
    for (let i = 0; i < this.kalite.agac; i++) {
      // Hepsi uzak tarafta: yakın taraftaki ağaç kamerayla yol arasına giriyor.
      const on = i % 3 === 0
      const yon = 1
      const uzak = AGAC_UZAKLIK + Math.random() * 420
      const z = DEKOR_ARKA + Math.random() * (DEKOR_ON - DEKOR_ARKA)
      const boy = AGAC_BOY.az + Math.random() * (AGAC_BOY.cok - AGAC_BOY.az)

      const govde = silindir(boy * 0.06, boy * 0.09, boy * 0.42, 0x5b3d1f, 7)
      govde.position.set(yon * uzak, boy * 0.21, z)

      const yaprak: THREE.Mesh[] = []
      for (let k = 0; k < 3; k++) {
        const kat = koni(boy * (0.3 - k * 0.06), boy * 0.34, 0x166534, 8)
        kat.position.set(yon * uzak, boy * (0.44 + k * 0.19), z)
        yaprak.push(kat)
      }
      this.agaclar.push({ govde, yaprak, on })
      this.kok.add(govde, ...yaprak)
    }
  }

  /** Ufuktaki dağlar: sahayı çevreleyen bir yay üzerine dizilir. */
  private daglariKur(): void {
    const merkezZ = (DEKOR_ON + DEKOR_ARKA) / 2
    for (let i = 0; i < DAG_ADET; i++) {
      const aci = (-0.42 + (i / (DAG_ADET - 1)) * 1.9) * Math.PI
      const uzak = DAG_UZAKLIK * (0.85 + Math.random() * 0.3)
      const boy = 420 + Math.random() * 380
      const dag = koni(boy * (0.7 + Math.random() * 0.5), boy, 0x6b8ca8, 6)
      dag.position.set(Math.cos(aci) * uzak, boy / 2 - 40, merkezZ + Math.sin(aci) * uzak)
      this.daglar.push(dag)
      this.kok.add(dag)
    }
  }

  private taslariKur(): void {
    for (let i = 0; i < this.kalite.tas; i++) {
      const r = 4 + Math.random() * 9
      const tas = kure(r, 0x94a3b8, 7)
      const yon = Math.random() < 0.25 ? -1 : 1
      tas.position.set(
        yon * (YOL_YARI_EN + 24 + Math.random() * 260),
        r * 0.4,
        DEKOR_ARKA + Math.random() * (DEKOR_ON - DEKOR_ARKA),
      )
      tas.scale.y = 0.6
      this.taslar.push(tas)
      this.kok.add(tas)
    }
  }

  private bulutlariKur(): void {
    const beyaz = malzeme(0xffffff, { saydam: 0.85 })
    for (let i = 0; i < this.kalite.bulut; i++) {
      const bulut = new THREE.Group()
      const parcaAdet = 3 + Math.floor(Math.random() * 3)
      for (let k = 0; k < parcaAdet; k++) {
        const r = 60 + Math.random() * 70
        const yumak = kure(r, beyaz, 8)
        yumak.position.set(k * r * 1.1 - parcaAdet * 24, Math.random() * 26, Math.random() * 40)
        yumak.scale.y = 0.55
        bulut.add(yumak)
      }
      bulut.position.set(
        (Math.random() - 0.35) * 1600,
        BULUT_Y + Math.random() * 220,
        DEKOR_ARKA + Math.random() * (DEKOR_ON - DEKOR_ARKA),
      )
      this.bulutlar.push(bulut)
      this.kok.add(bulut)
    }
  }

  // --- Renkler ---

  private renkleriTazele(palet: VakitPaleti): void {
    this.gokDokusunuCiz(palet)
    // Işık gücü ve gök renginin açıklığı vakte göre: gece sahne okunur kalsın.
    const ayar = VAKIT_ISIGI[Math.min(VAKIT_ISIGI.length - 1, this.vakit)]
    this.gokIsik.color.setHex(acik(palet.gokAlt, ayar.gokAcilma))
    this.gokIsik.groundColor.setHex(acik(palet.cim, ayar.gokAcilma * 0.5))
    this.gokIsik.intensity = ayar.gok
    this.gunes.color.setHex(palet.isik)
    this.gunes.intensity = ayar.yonlu
    this.tabanIsik.intensity = ayar.taban
    ;(this.cim.material as THREE.MeshLambertMaterial).color.setHex(palet.cim)
    ;(this.yol.material as THREE.MeshLambertMaterial).color.setHex(palet.yol)
    for (const bordur of this.bordurler) (bordur.material as THREE.MeshLambertMaterial).color.setHex(palet.tas)
    for (const tas of this.taslar) (tas.material as THREE.MeshLambertMaterial).color.setHex(palet.tas)
    for (const dag of this.daglar) (dag.material as THREE.MeshLambertMaterial).color.setHex(palet.dag)
    for (const agac of this.agaclar) {
      const renk = agac.on ? palet.agacOn : palet.agacArka
      for (const kat of agac.yaprak) (kat.material as THREE.MeshLambertMaterial).color.setHex(renk)
    }
    if (this.sahne.fog) (this.sahne.fog as THREE.Fog).color.setHex(palet.gokAlt)
  }

  /** Gökyüzü: üstten alta geçiş; gece paletinde yıldız serpilir. */
  private gokDokusunuCiz(palet: VakitPaleti): void {
    const ctx = this.gokTuval.getContext('2d')
    if (!ctx) return
    const renk = (deger: number): string => `#${deger.toString(16).padStart(6, '0')}`
    const gecis = ctx.createLinearGradient(0, 0, 0, GOK_DOKU_BOY)
    gecis.addColorStop(0, renk(palet.gokUst))
    gecis.addColorStop(1, renk(palet.gokAlt))
    ctx.fillStyle = gecis
    ctx.fillRect(0, 0, GOK_DOKU_EN, GOK_DOKU_BOY)

    if (palet.yildizli) {
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < YILDIZ_ADET; i++) {
        ctx.globalAlpha = 0.3 + Math.random() * 0.6
        const r = Math.random() < 0.2 ? 2 : 1
        ctx.fillRect(Math.random() * GOK_DOKU_EN, Math.random() * GOK_DOKU_BOY * 0.62, r, r)
      }
      ctx.globalAlpha = 1
    }
    this.gokDoku.needsUpdate = true
  }
}

/**
 * Kule modelleri — her tip kendi mimarisiyle.
 *
 * Eskiden üç tip de aynı kutuydu, yalnız rengi değişiyordu. Artık siluetten
 * tanınıyorlar:
 *   Okçu    — yuvarlak taş kule, mazgal platformu, ok mazgalları, tepede okçu
 *   Bombacı — bodur kare burç, köşe takviyeleri, yukarı bakan havan namlusu
 *   Büyücü  — ince kule, rün kuşakları, tepede havada dönen kristal
 *
 * Ölçüler yine `KULE_SEVIYE_GORUNUM` tablosundan geliyor: seviye yükseldikçe
 * gövde büyüyor, mazgal çoğalıyor, çatı/bayrak/altın şerit ve tepe ışığı
 * geliyor. Hareketli parçalar `userData` ile işaretlenir; sahne onları döndürür.
 */

import * as THREE from 'three'

import { KULE_TIPLERI, kuleGorunum } from '../../kalesavunmasi/config/constants.ts'
import { acik, koni, kure, kutu, malzeme, silindir } from './yapi.ts'

/** Taş rengi — kule rengi yalnız süslemede ve bayrakta kullanılır. */
const TAS = 0x8d949e
const TAS_KOYU = 0x5b6270
const TAS_ACIK = 0xb9bfc8
const AHSAP = 0x6b4423
const AHSAP_ACIK = 0x8b5a2b
const KARANLIK = 0x1f2937

/** Kaç birimde bir yatay taş kuşağı çizilsin. */
const KUSAK_ARALIK = 26

export interface KuleModeli {
  kok: THREE.Group
  /** Kendi ekseninde dönen parçalar (büyücü kristali). */
  donenler: THREE.Object3D[]
  /** Havada salınan parçalar. */
  salinanlar: THREE.Object3D[]
  /** Yanıp sönen tepe ışığı. */
  isiklar: THREE.Object3D[]
}

/** Gövdeyi saran yatay taş kuşakları — düz silindiri okunur yapıyor. */
function kusaklar(kok: THREE.Group, tabanY: number, boy: number, yaricap: number, yuvarlak: boolean): void {
  for (let y = KUSAK_ARALIK; y < boy - 8; y += KUSAK_ARALIK) {
    const serit = yuvarlak
      ? silindir(yaricap + 1.2, yaricap + 1.2, 3.5, TAS_KOYU, 16)
      : kutu(yaricap * 2 + 2.4, 3.5, yaricap * 2 + 2.4, TAS_KOYU)
    serit.position.y = tabanY + y
    kok.add(serit)
  }
}

/** Tepedeki mazgal dişleri; yuvarlak kulede halka, kare kulede kenar boyunca. */
function mazgallar(
  kok: THREE.Group,
  tepeY: number,
  yaricap: number,
  adet: number,
  renk: number,
  yuvarlak: boolean,
): void {
  const sayi = Math.max(6, adet + 4)
  for (let i = 0; i < sayi; i++) {
    const dis = kutu(9, 11, 9, renk)
    if (yuvarlak) {
      const aci = (i / sayi) * Math.PI * 2
      dis.position.set(Math.cos(aci) * yaricap, tepeY + 5.5, Math.sin(aci) * yaricap)
      dis.rotation.y = -aci
    } else {
      // Kare kulede dişler dört kenara paylaştırılır.
      const kenar = Math.floor((i / sayi) * 4)
      const oran = ((i / sayi) * 4) % 1
      const t = -yaricap + oran * yaricap * 2
      const yer = [
        [t, yaricap],
        [yaricap, -t],
        [-t, -yaricap],
        [-yaricap, t],
      ][kenar]
      dis.position.set(yer[0], tepeY + 5.5, yer[1])
    }
    kok.add(dis)
  }
}

/** Kapı ve pencere: kulenin ölçeğini gösteren küçük ayrıntılar. */
function kapiVePencere(kok: THREE.Group, tabanY: number, boy: number, yaricap: number): void {
  const kapi = kutu(yaricap * 0.5, Math.min(22, boy * 0.34), 3, KARANLIK)
  kapi.position.set(0, tabanY + Math.min(11, boy * 0.17), -yaricap - 0.5)
  kok.add(kapi)
  if (boy < 60) return
  for (const y of [tabanY + boy * 0.55, tabanY + boy * 0.8]) {
    const pencere = kutu(6, 9, 3, KARANLIK)
    pencere.position.set(0, y, -yaricap - 0.5)
    kok.add(pencere)
  }
}

/** Ok mazgalı: gövdeye açılmış ince dikey yarık. */
function okYariklari(kok: THREE.Group, tabanY: number, boy: number, yaricap: number): void {
  for (const aci of [-0.5, 0.4, 1.4]) {
    const yarik = kutu(3, 14, 3, KARANLIK)
    yarik.position.set(Math.cos(aci) * -yaricap, tabanY + boy * 0.72, Math.sin(aci) * -yaricap)
    kok.add(yarik)
  }
}

/** Bayrak direği ve bezi. */
function bayrak(kok: THREE.Group, y: number, boy: number, renk: number): void {
  const direk = silindir(1.6, 1.6, boy, AHSAP, 6)
  direk.position.y = y + boy / 2
  const bez = kutu(16, 11, 1.4, renk)
  bez.position.set(8.5, y + boy - 7, 0)
  kok.add(direk, bez)
}

/** Tepede duran ufak okçu — kule seviyesi yükselince beliriyor. */
function okcuFiguru(kok: THREE.Group, y: number): void {
  const govde = kutu(7, 12, 6, 0x1d4ed8)
  govde.position.set(0, y + 6, 0)
  const kafa = kure(4, 0xf5d0a9, 8)
  kafa.position.set(0, y + 15, 0)
  const yay = new THREE.Mesh(new THREE.TorusGeometry(7, 1.1, 5, 12, Math.PI), malzeme(AHSAP_ACIK))
  yay.position.set(-5, y + 9, 0)
  yay.rotation.z = Math.PI / 2
  kok.add(govde, kafa, yay)
}

/** Okçu kulesi: yuvarlak taş gövde, mazgal platformu, ahşap çatı. */
function okcuKulesi(g: ReturnType<typeof kuleGorunum>, tabanY: number, renk: number, model: KuleModeli): void {
  const kok = model.kok
  const r = g.en * 0.52

  const govde = silindir(r, r * 1.1, g.boy, TAS, 18)
  govde.position.y = tabanY + g.boy / 2
  kok.add(govde)
  kusaklar(kok, tabanY, g.boy, r, true)
  kapiVePencere(kok, tabanY, g.boy, r)
  okYariklari(kok, tabanY, g.boy, r)

  const platform = silindir(r * 1.24, r * 1.24, 7, TAS_ACIK, 18)
  platform.position.y = tabanY + g.boy + 3.5
  kok.add(platform)
  mazgallar(kok, tabanY + g.boy + 7, r * 1.18, g.mazgal, TAS_ACIK, true)

  let tepe = tabanY + g.boy + 18
  if (g.cati > 0) {
    const cati = koni(r * 1.3, g.cati, AHSAP, 18)
    cati.position.y = tepe + g.cati / 2
    const tepelik = kure(3.5, acik(renk, 0.3), 8)
    tepelik.position.y = tepe + g.cati
    kok.add(cati, tepelik)
    tepe += g.cati
  } else {
    okcuFiguru(kok, tabanY + g.boy + 10)
  }
  if (g.bayrak > 0) bayrak(kok, tepe, g.bayrak, renk)
}

/** Bombacı: bodur kare burç, köşe takviyeleri, yukarı bakan havan. */
function bombaciKulesi(g: ReturnType<typeof kuleGorunum>, tabanY: number, renk: number, model: KuleModeli): void {
  const kok = model.kok
  const en = g.en * 1.16
  const boy = g.boy * 0.82
  const yari = en / 2

  const govde = kutu(en, boy, en, TAS_KOYU)
  govde.position.y = tabanY + boy / 2
  kok.add(govde)
  kusaklar(kok, tabanY, boy, yari, false)
  kapiVePencere(kok, tabanY, boy, yari)

  // Köşe takviyeleri: bodur gövdeyi ağır gösteriyor.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const kose = kutu(9, boy, 9, TAS)
      kose.position.set(sx * yari, tabanY + boy / 2, sz * yari)
      kok.add(kose)
    }
  }

  const platform = kutu(en + 8, 7, en + 8, TAS_ACIK)
  platform.position.y = tabanY + boy + 3.5
  kok.add(platform)
  mazgallar(kok, tabanY + boy + 7, yari + 4, Math.max(2, g.mazgal - 2), TAS_ACIK, false)

  // Havan: yola doğru eğik namlu ve yanında gülle yığını.
  const namluBoy = g.en * 0.9
  const namlu = silindir(g.en * 0.2, g.en * 0.24, namluBoy, KARANLIK, 12)
  namlu.position.set(0, tabanY + boy + 12 + namluBoy * 0.3, 0)
  namlu.rotation.z = Math.PI / 3.4
  const agiz = silindir(g.en * 0.23, g.en * 0.23, 5, acik(renk, 0.2), 12)
  agiz.position.set(-namluBoy * 0.42, tabanY + boy + 12 + namluBoy * 0.72, 0)
  agiz.rotation.z = Math.PI / 3.4
  kok.add(namlu, agiz)

  for (let i = 0; i < 3; i++) {
    const gulle = kure(4.5, KARANLIK, 8)
    gulle.position.set(yari * 0.5 + i * 3, tabanY + boy + 11, yari * 0.4 - i * 5)
    kok.add(gulle)
  }
  if (g.bayrak > 0) bayrak(kok, tabanY + boy + 14, g.bayrak * 0.8, renk)
}

/** Büyücü: ince kule, rün kuşakları, havada dönen kristal. */
function buyucuKulesi(g: ReturnType<typeof kuleGorunum>, tabanY: number, renk: number, model: KuleModeli): void {
  const kok = model.kok
  const r = g.en * 0.42
  const boy = g.boy * 1.1

  const govde = silindir(r * 0.92, r * 1.15, boy, acik(TAS, 0.05), 16)
  govde.position.y = tabanY + boy / 2
  kok.add(govde)
  kapiVePencere(kok, tabanY, boy, r)

  // Rün kuşakları: kendinden ışıyan ince halkalar.
  for (let i = 1; i <= 3; i++) {
    const halka = new THREE.Mesh(
      new THREE.TorusGeometry(r + 1.5, 1.4, 6, 20),
      malzeme(renk, { isik: renk }),
    )
    halka.rotation.x = Math.PI / 2
    halka.position.y = tabanY + (boy * i) / 4
    kok.add(halka)
  }

  // Tepede dört sütun ve aralarında duran kristal.
  const tepeY = tabanY + boy
  for (let i = 0; i < 4; i++) {
    const aci = (i / 4) * Math.PI * 2 + Math.PI / 4
    const sutun = silindir(2.4, 2.4, 20, TAS_ACIK, 8)
    sutun.position.set(Math.cos(aci) * r, tepeY + 10, Math.sin(aci) * r)
    kok.add(sutun)
  }
  const tabla = silindir(r * 1.1, r * 1.1, 4, TAS_ACIK, 16)
  tabla.position.y = tepeY + 21
  kok.add(tabla)

  const kristal = new THREE.Mesh(
    new THREE.OctahedronGeometry(g.en * 0.3),
    malzeme(acik(renk, 0.25), { isik: renk, saydam: 0.92 }),
  )
  kristal.position.y = tepeY + 34
  // Salınım bu yüksekliğin çevresinde olacak.
  kristal.userData.temelY = kristal.position.y
  kok.add(kristal)
  model.donenler.push(kristal)
  model.salinanlar.push(kristal)

  if (g.cati > 0) {
    const cati = koni(r * 1.5, g.cati * 1.2, acik(renk, 0.55), 8)
    cati.position.y = tepeY + 34 + g.cati * 0.8
    kok.add(cati)
  }
}

/** Zıpkın kulesi: kare gövde, tepesinde yola bakan dev arbalet. */
function zipkinKulesi(g: ReturnType<typeof kuleGorunum>, tabanY: number, renk: number, model: KuleModeli): void {
  const kok = model.kok
  const en = g.en * 0.94
  const yari = en / 2

  const govde = kutu(en, g.boy, en, TAS)
  govde.position.y = tabanY + g.boy / 2
  kok.add(govde)
  kusaklar(kok, tabanY, g.boy, yari, false)
  kapiVePencere(kok, tabanY, g.boy, yari)

  const platform = kutu(en + 10, 6, en + 10, AHSAP)
  platform.position.y = tabanY + g.boy + 3
  kok.add(platform)

  // Arbalet: kaide, iki yay kolu ve namludaki zıpkın.
  const tepe = tabanY + g.boy + 12
  const kaide = silindir(en * 0.18, en * 0.24, 12, AHSAP_ACIK, 10)
  kaide.position.y = tepe
  // Yay kolları namluya dik: zıpkın -x'e bakarken kollar z ekseninde açılıyor.
  const kiris = kutu(4, 4, en * 1.5, acik(renk, 0.2))
  kiris.position.set(0, tepe + 12, 0)
  for (const yon of [-1, 1]) {
    const kol = kutu(5, 5, en * 0.7, AHSAP)
    kol.position.set(0, tepe + 12, yon * en * 0.38)
    kol.rotation.x = yon * 0.28
    kok.add(kol)
  }
  // Zıpkın yola doğru bakar (yerel -x); kule yakın tarafa kurulursa grup
  // yarım tur dönüyor ve namlu yine yola çevriliyor.
  const zipkin = silindir(2.4, 2.4, en * 1.1, acik(renk, 0.4), 8)
  zipkin.rotation.z = Math.PI / 2
  zipkin.position.set(-en * 0.2, tepe + 12, 0)
  const uc = koni(5, 12, TAS_ACIK, 6)
  uc.rotation.z = Math.PI / 2
  uc.position.set(-en * 0.75, tepe + 12, 0)
  kok.add(kaide, kiris, zipkin, uc)

  if (g.bayrak > 0) bayrak(kok, tepe + 20, g.bayrak * 0.8, renk)
}

/**
 * Verilen tip ve seviye için kule modelini kurar.
 * `tabanY` sekinin üst hattı — kule oradan yükselir.
 */
export function kuleModeli(tip: number, seviye: number, tabanY: number): KuleModeli {
  const g = kuleGorunum(seviye)
  const renk = acik(KULE_TIPLERI[tip].renk, g.tonOran * 0.5)
  const model: KuleModeli = { kok: new THREE.Group(), donenler: [], salinanlar: [], isiklar: [] }

  if (tip === 1) bombaciKulesi(g, tabanY, renk, model)
  else if (tip === 2) buyucuKulesi(g, tabanY, renk, model)
  else if (tip === 3) zipkinKulesi(g, tabanY, renk, model)
  else okcuKulesi(g, tabanY, renk, model)

  // Altın kuşak ve tepe ışığı bütün tiplerde ortak.
  if (g.susleme) {
    const serit = new THREE.Mesh(
      new THREE.TorusGeometry(g.en * 0.56, 2.4, 6, 20),
      malzeme(0xfbbf24, { isik: 0x78350f }),
    )
    serit.rotation.x = Math.PI / 2
    serit.position.y = tabanY + g.boy * 0.42
    model.kok.add(serit)
  }
  if (g.isik) {
    const isik = kure(6, malzeme(0xfde047, { isik: 0xfde047 }), 10)
    isik.position.y = tabanY + g.boy + g.cati + g.bayrak + 26
    model.kok.add(isik)
    model.isiklar.push(isik)
  }
  return model
}

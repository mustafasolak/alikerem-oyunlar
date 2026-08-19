/**
 * Oyunların saf mantığı için testler.
 *
 * Buradaki modüller Phaser'a bağlı olmadığı için doğrudan Node'da koşuyor.
 * Sahneler yalnızca çizim yapar; kural hataları burada yakalanır.
 *
 * Çalıştır: npm run oyun-test
 */
import { Board2048 } from '../src/games/game2048/systems/Board2048.ts'
import { FreeCell } from '../src/games/freecell/systems/FreeCell.ts'
import { KaleSavunmasi } from '../src/games/kalesavunmasi/systems/KaleSavunmasi.ts'
import {
  acikDunyaSayisi,
  dunyaAcikMi,
  sonrakiDunyayaKalan,
} from '../src/games/kalesavunmasi/systems/Ilerleme.ts'
import {
  ACI_MAX,
  ACI_MIN,
  ALEV_ARALIK_MS,
  ATIS_BEKLEME_MS,
  BASLANGIC_ALTIN,
  CANAVAR_TIPLERI,
  DALGA_MAX_ADET,
  DOGUS_X,
  DUNYALAR,
  DUNYA_ESIGI,
  DURAK_X,
  GAME_WIDTH,
  HEDEFLEME_KURALLARI,
  SEF_IYILESME_BEKLEME_MS,
  SEF_KALKAN_BEKLEME_MS,
  SEF_KALKAN_ORANI,
  SOK_MENZIL,
  SOK_SURE_MS,
  KALE_GENISLIK,
  HASAR_BONUSU,
  KALE_BONUSU,
  KRITIK_CARPAN_BONUSU,
  KRITIK_MAX_SANS,
  KRITIK_SANS_BONUSU,
  KRITIK_TABAN_CARPAN,
  KRITIK_TABAN_SANS,
  KULE_MAX_SEVIYE,
  KULE_TIPLERI,
  KULE_YIKIM_ORANI,
  KULE_YUVALARI,
  PATRON_DALGA_ARALIK,
  SIM_ADIM_MS,
  TAMIR_MIKTARI,
  VARSAYILAN_ZORLUK,
  YUKSELTMELER,
  ZEMIN_Y,
  ZORLUKLAR,
  canavarAyakY,
  dalgaCanCarpani,
  dalgaCanavarSayisi,
  dalgaOdulCarpani,
  dunya,
  kuleAtisY,
  kuleGorunum,
  patronDalgasiMi,
  vakitIndeksi,
  zorluk,
} from '../src/games/kalesavunmasi/config/constants.ts'
import { Klondike } from '../src/games/solitaire/systems/Klondike.ts'
import { Mahjong } from '../src/games/mahjong/systems/Mahjong.ts'
import { Spider } from '../src/games/orumcek/systems/Spider.ts'
import { Minesweeper } from '../src/games/mayin/systems/Minesweeper.ts'
import { SudokuGame } from '../src/games/sudoku/systems/SudokuGame.ts'

let gecti = 0
const hatalar = []
const kontrol = (ad, kosul, ek = '') => {
  if (kosul) gecti++
  else hatalar.push(`${ad}${ek ? ` — ${ek}` : ''}`)
}
const esit = (ad, bulunan, beklenen) =>
  kontrol(ad, JSON.stringify(bulunan) === JSON.stringify(beklenen),
    `beklenen ${JSON.stringify(beklenen)}, bulunan ${JSON.stringify(bulunan)}`)

// Sabit üreteçle her koşuda aynı bulmaca
function tohumlu(tohum) {
  let s = tohum
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

// --- Sudoku: kalem notları ---
{
  const oyun = new SudokuGame('kolay', tohumlu(7))
  const bos = oyun.tahta.findIndex((d, i) => d === 0 && !oyun.ipucuMu(i))
  const dolu = oyun.tahta.findIndex((d) => d !== 0)

  kontrol('boş hücre bulundu', bos >= 0)
  kontrol('boş hücreye not yazılabilir', oyun.notYazilabilir(bos))
  kontrol('dolu hücreye not yazılamaz', !oyun.notYazilabilir(dolu))

  esit('not eklendi', oyun.notDegistir(bos, 5), true)
  esit('not görünüyor', oyun.notVar(bos, 5), true)
  esit('aynı rakam ikinci kez basınca işlem yapılır', oyun.notDegistir(bos, 5), true)
  esit('ve not kalkar', oyun.notVar(bos, 5), false)

  esit('geçersiz rakam not olmaz', oyun.notDegistir(bos, 0), false)
  esit('10 not olmaz', oyun.notDegistir(bos, 10), false)
  esit('ipucu hücresine not olmaz', oyun.notDegistir(dolu, 3), false)

  // Notlar hata sayılmaz
  const oncekiHata = oyun.hata
  oyun.notDegistir(bos, 1)
  oyun.notDegistir(bos, 2)
  esit('not hata saymaz', oyun.hata, oncekiHata)

  esit('notlar temizlenir', oyun.notlariTemizle(bos), true)
  esit('boş kümede temizleme false', oyun.notlariTemizle(bos), false)
}

// --- Rakam yazınca ilişkili notlar düşer ---
{
  const oyun = new SudokuGame('zor', tohumlu(11))
  const bos = []
  for (let i = 0; i < oyun.toplam && bos.length < 40; i++) {
    if (oyun.tahta[i] === 0 && !oyun.ipucuMu(i)) bos.push(i)
  }
  const hedef = bos[0]
  const dogru = oyun.cozum[hedef]

  // Hedefin satır/sütun/kutu arkadaşlarına aynı rakamdan not koy
  const komsular = bos.filter((i) => i !== hedef && oyun.iliskiliMi(hedef, i))
  kontrol('ilişkili boş hücre var', komsular.length > 0, `${komsular.length} komşu`)
  for (const k of komsular) oyun.notDegistir(k, dogru)
  // İlişkisiz bir hücreye de aynı nottan koy: o kalmalı
  const uzak = bos.find((i) => i !== hedef && !oyun.iliskiliMi(hedef, i))
  if (uzak !== undefined) oyun.notDegistir(uzak, dogru)
  oyun.notDegistir(hedef, dogru)

  oyun.yaz(hedef, dogru)

  esit('yazılan hücrenin notları silindi', oyun.notlar[hedef].size, 0)
  kontrol('ilişkili hücrelerden not düştü', komsular.every((k) => !oyun.notVar(k, dogru)))
  if (uzak !== undefined) kontrol('ilişkisiz hücrenin notu durur', oyun.notVar(uzak, dogru))
}

// --- Yeni bulmaca notları sıfırlar ---
{
  const oyun = new SudokuGame('kolay', tohumlu(3))
  const bos = oyun.tahta.findIndex((d, i) => d === 0 && !oyun.ipucuMu(i))
  oyun.notDegistir(bos, 4)
  oyun.yeniBulmaca('orta')
  esit('yeni bulmacada not kalmaz', oyun.notlar.every((k) => k.size === 0), true)
  esit('not dizisi tam boy', oyun.notlar.length, oyun.toplam)
}

// --- Bulmaca hâlâ geçerli ve tek çözümlü üretiliyor ---
{
  for (const zorluk of ['kolay', 'orta', 'zor']) {
    const oyun = new SudokuGame(zorluk, tohumlu(zorluk.length * 13))
    esit(`${zorluk}: çözüm dolu`, oyun.cozum.every((d) => d >= 1 && d <= 9), true)
    kontrol(`${zorluk}: ipuçları çözümle uyumlu`,
      oyun.ipuclari.every((d, i) => d === 0 || d === oyun.cozum[i]))
    kontrol(`${zorluk}: boş hücre var`, oyun.kalanBos > 0)
  }
}

// --- Mayın Tarlası: akor ---
{
  // Sayının çevresine doğru bayraklar konunca akor kalanları açar
  const oyun = new Minesweeper(9, 9, 10, tohumlu(21))
  oyun.ac(40) // ortadan başla; ilk açılış mayınsız
  kontrol('oyun başladı', oyun.durum === 'oynaniyor')

  // Komşusunda mayın olan açık bir sayı bul
  const sayiIndex = oyun.hucreler.findIndex((h) => h.acik && h.komsu > 0)
  kontrol('açık sayı hücresi var', sayiIndex >= 0)

  const komsular = oyun.komsuIndexler(sayiIndex)
  const mayinlar = komsular.filter((k) => oyun.hucreler[k].mayin)

  esit('bayraksızken akor çalışmaz', oyun.akor(sayiIndex).degisti, false)
  esit('bayraksızken hazır değil', oyun.akorHazir(sayiIndex), false)

  for (const m of mayinlar) oyun.bayrakDegistir(m)
  const kapaliKomsu = komsular.filter((k) => !oyun.hucreler[k].acik && !oyun.hucreler[k].bayrak)

  if (kapaliKomsu.length > 0) {
    esit('doğru bayrakla akor hazır', oyun.akorHazir(sayiIndex), true)
    const sonuc = oyun.akor(sayiIndex)
    esit('akor açtı', sonuc.degisti, true)
    esit('akor patlamadı', sonuc.patladi, false)
    kontrol('kapalı komşular açıldı', kapaliKomsu.every((k) => oyun.hucreler[k].acik))
    esit('akor bittikten sonra tekrar iş yapmaz', oyun.akor(sayiIndex).degisti, false)
  }
}

{
  // Yanlış bayrak: akor mayına bastırır
  const oyun = new Minesweeper(9, 9, 10, tohumlu(5))
  oyun.ac(40)
  const sayiIndex = oyun.hucreler.findIndex((h) => h.acik && h.komsu > 0)
  const komsular = oyun.komsuIndexler(sayiIndex)
  const hucre = oyun.hucreler[sayiIndex]

  // Sayı kadar bayrağı YANLIŞ hücrelere koy (mayınsız kapalı komşulara)
  const yanlisAdaylar = komsular.filter((k) => !oyun.hucreler[k].mayin && !oyun.hucreler[k].acik)
  const mayinliKomsu = komsular.filter((k) => oyun.hucreler[k].mayin)
  if (yanlisAdaylar.length >= hucre.komsu && mayinliKomsu.length > 0) {
    for (let i = 0; i < hucre.komsu; i++) oyun.bayrakDegistir(yanlisAdaylar[i])
    const sonuc = oyun.akor(sayiIndex)
    esit('yanlış bayrakla akor patlar', sonuc.patladi, true)
    esit('oyun kaybedildi', oyun.durum, 'kaybetti')
  }
}

{
  // Akor kapalı hücrede ve boş (0 komşulu) hücrede çalışmaz
  const oyun = new Minesweeper(9, 9, 10, tohumlu(33))
  const kapali = oyun.hucreler.findIndex((h) => !h.acik)
  esit('kapalı hücrede akor yok', oyun.akor(kapali).degisti, false)
  oyun.ac(40)
  const sifir = oyun.hucreler.findIndex((h) => h.acik && h.komsu === 0)
  if (sifir >= 0) esit('sıfır komşuluda akor yok', oyun.akor(sifir).degisti, false)
  esit('tahta dışında akor yok', oyun.akor(9999).degisti, false)
}

// --- 2048: geri alma ---
{
  const b = new Board2048(4, tohumlu(9))
  esit('başta geri alınacak hamle yok', b.geriAlinabilir, false)
  esit('geri alma boşa çalışmaz', b.geriAl(), false)
  esit('başlangıç hakkı 3', b.kalanGeriAlma, 3)
}

{
  // Birleşmenin kesin olduğu bir tahta kur: skorun geri döndüğünü görelim
  const b = new Board2048(4, tohumlu(4))
  b.restore({
    grid: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 100,
    keepPlaying: false,
  })
  esit('kurulan skor', b.score, 100)
  const sonuc = b.move('left')
  esit('birleşme oldu', sonuc.moved, true)
  esit('4 puan kazanıldı', sonuc.gained, 4)
  esit('skor arttı', b.score, 104)

  esit('geri alındı', b.geriAl(), true)
  esit('SKOR geri döndü', b.score, 100)
  esit('hak düştü', b.kalanGeriAlma, 2)
  const degerler = b.tiles.map((t) => t.value).sort((x, y) => x - y)
  esit('tahta hamle öncesine döndü', degerler, [2, 2])
  esit('aynı hamle iki kez geri alınamaz', b.geriAl(), false)
}

{
  // Kaybedilmiş oyun geri alınabilmeli (kurtarıcı hamle)
  const b = new Board2048(4, tohumlu(17))
  b.restore({
    grid: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 0],
    ],
    score: 500,
    keepPlaying: false,
  })
  esit('henüz kaybedilmedi', b.status, 'playing')
  // Boşluğu dolduran hamle oyunu bitirir
  const yonler = ['up', 'down', 'left', 'right']
  let bitti = false
  for (const y of yonler) {
    if (b.move(y).moved) { bitti = b.status === 'lost'; break }
  }
  if (bitti) {
    esit('kaybedilen oyun geri alınabilir', b.geriAl(), true)
    esit('geri alınca oyun sürüyor', b.status, 'playing')
  }
}

{
  // Değişmeyen hamle geçmişe yazılmamalı
  const b = new Board2048(4, tohumlu(23))
  b.restore({
    grid: [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 0,
    keepPlaying: false,
  })
  esit('sola dayalı kare sola gitmez', b.move('left').moved, false)
  esit('boş hamle geçmişe yazılmadı', b.geriAlinabilir, false)
}

{
  // Hak bitince geri alma durur; geçmiş hakla sınırlı
  const b = new Board2048(4, tohumlu(31))
  let yapilan = 0
  const yonler = ['up', 'right', 'down', 'left']
  for (let i = 0; i < 20 && yapilan < 8; i++) {
    if (b.move(yonler[i % 4]).moved) yapilan++
  }
  kontrol('yeterince hamle yapıldı', yapilan >= 4, `${yapilan} hamle`)
  esit('birinci geri alma', b.geriAl(), true)
  esit('ikinci geri alma', b.geriAl(), true)
  esit('üçüncü geri alma', b.geriAl(), true)
  esit('hak bitti', b.kalanGeriAlma, 0)
  esit('dördüncü geri alma reddedilir', b.geriAl(), false)
}

{
  // Kayıt/yükleme hakkı taşır, yeni oyun sıfırlar
  const b = new Board2048(4, tohumlu(41))
  const yonler = ['up', 'right', 'down', 'left']
  for (let i = 0; i < 8; i++) b.move(yonler[i % 4])
  b.geriAl()
  const kayit = b.toSave()
  esit('kayıt hakkı içeriyor', kayit.kalanGeriAlma, b.kalanGeriAlma)

  const c = new Board2048(4, tohumlu(41))
  c.restore(kayit)
  esit('yüklenen oyun hakkı korur', c.kalanGeriAlma, kayit.kalanGeriAlma)
  esit('yüklendikten sonra geçmiş boş', c.geriAlinabilir, false)

  c.reset()
  esit('yeni oyun hakkı tazeler', c.kalanGeriAlma, 3)
  esit('yeni oyunda geçmiş boş', c.geriAlinabilir, false)

  // Eski kayıtlar (hak alanı yok) tam hak sayılmalı
  const d = new Board2048(4, tohumlu(41))
  d.restore({ grid: kayit.grid, score: kayit.score, keepPlaying: false })
  esit('eski kayıt tam hak alır', d.kalanGeriAlma, 3)
}

// --- Kâğıt oyunları: geri alma ---
{
  const k = new Klondike(tohumlu(77))
  esit('başta geri alınacak yok', k.geriAlinabilir, false)
  esit('boş geri alma false', k.geriAl(), false)

  const desteOnce = k.deste.length
  esit('deste çevrildi', k.desteyiCevir(), true)
  esit('hamle sayıldı', k.hamle, 1)
  esit('artık geri alınabilir', k.geriAlinabilir, true)

  esit('geri alındı', k.geriAl(), true)
  esit('deste eski hâline döndü', k.deste.length, desteOnce)
  esit('açılan boşaldı', k.acik.length, 0)
  // Geri alma bedava değil: hamle olarak sayılır
  esit('geri alma hamle sayılır', k.hamle, 1)
  esit('yığın boşaldı', k.geriAlinabilir, false)
}

{
  // Yeni dağıtım geçmişi siler
  const k = new Klondike(tohumlu(88))
  k.desteyiCevir()
  k.dagit()
  esit('yeni dağıtımda geçmiş yok', k.geriAlinabilir, false)
  esit('yeni dağıtımda hamle sıfır', k.hamle, 0)
}

{
  // Örümcek: deste dağıtımı geri alınabilir
  const o = new Spider(tohumlu(55))
  const sutunBoylari = o.sutunlar.map((x) => x.length)
  esit('deste dağıtıldı', o.desteDagit(), true)
  kontrol('sütunlar uzadı', o.sutunlar.every((x, i) => x.length === sutunBoylari[i] + 1))
  esit('geri alındı', o.geriAl(), true)
  esit('sütunlar eski boyda', o.sutunlar.map((x) => x.length), sutunBoylari)
}

// --- FreeCell: çoklu taşıma (süper hamle) ---
{
  const f = new FreeCell(tohumlu(13))
  esit('başta 4 boş hücre', f.bosHucre, 4)
  esit('başta boş sütun yok', f.bosSutun, 0)
  esit('kapasite 5 kart', f.tasimaKapasitesi(), 5)

  // Hücreleri doldurunca kapasite düşer
  f.hucreler[0] = { deger: 5, renk: 'maca', acik: true }
  f.hucreler[1] = { deger: 6, renk: 'kupa', acik: true }
  esit('iki hücre doluyken kapasite 3', f.tasimaKapasitesi(), 3)

  // Boş sütun kapasiteyi ikiye katlar
  f.sutunlar[0] = []
  esit('bir boş sütunla kapasite 6', f.tasimaKapasitesi(), 6)
  esit('hedef boş sütunsa o sütun sayılmaz', f.tasimaKapasitesi(true), 3)
}

{
  // Sıralı grup taşınır, sırasız grup taşınmaz
  const f = new FreeCell(tohumlu(2))
  f.sutunlar[0] = [
    { deger: 9, renk: 'maca', acik: true },
    { deger: 8, renk: 'kupa', acik: true },
    { deger: 7, renk: 'sinek', acik: true },
  ]
  f.sutunlar[1] = [{ deger: 10, renk: 'karo', acik: true }]

  esit('sıralı dizi tanınıyor', f.siraliMi(0, 0), true)
  esit('alınacak üç kart', f.alinacak({ tur: 'sutun', index: 0 }, 0)?.length, 3)

  esit('üçlü dizi taşındı', f.tasi({ tur: 'sutun', index: 0 }, { tur: 'sutun', index: 1 }, 0), true)
  esit('hedef sütun dört kart', f.sutunlar[1].length, 4)
  esit('kaynak boşaldı', f.sutunlar[0].length, 0)
  esit('tek hamle sayıldı', f.hamle, 1)

  // Geri alma diziyi geri getirir
  esit('geri alındı', f.geriAl(), true)
  esit('kaynak geri geldi', f.sutunlar[0].length, 3)
  esit('hedef eski hâlinde', f.sutunlar[1].length, 1)
}

{
  // Sırasız grup seçilemez
  const f = new FreeCell(tohumlu(6))
  f.sutunlar[0] = [
    { deger: 9, renk: 'maca', acik: true },
    { deger: 3, renk: 'kupa', acik: true },
  ]
  esit('sırasız dizi tanınmıyor', f.siraliMi(0, 0), false)
  esit('sırasız grup alınamaz', f.alinacak({ tur: 'sutun', index: 0 }, 0), null)
  esit('üst kart tek başına alınır', f.alinacak({ tur: 'sutun', index: 0 }, 1)?.length, 1)
}

{
  // Kapasiteyi aşan dizi taşınamaz
  const f = new FreeCell(tohumlu(19))
  f.hucreler = [
    { deger: 2, renk: 'maca', acik: true },
    { deger: 3, renk: 'kupa', acik: true },
    { deger: 4, renk: 'karo', acik: true },
    { deger: 5, renk: 'sinek', acik: true },
  ]
  esit('hücreler doluyken kapasite 1', f.tasimaKapasitesi(), 1)
  f.sutunlar[0] = [
    { deger: 9, renk: 'maca', acik: true },
    { deger: 8, renk: 'kupa', acik: true },
  ]
  f.sutunlar[1] = [{ deger: 10, renk: 'karo', acik: true }]
  esit('kapasite aşılınca taşınmaz', f.tasi({ tur: 'sutun', index: 0 }, { tur: 'sutun', index: 1 }, 0), false)
  esit('tahta değişmedi', f.sutunlar[0].length, 2)
}

{
  // Hücreye ve temele yalnız tek kart girer
  const f = new FreeCell(tohumlu(23))
  f.sutunlar[0] = [
    { deger: 9, renk: 'maca', acik: true },
    { deger: 8, renk: 'kupa', acik: true },
  ]
  f.hucreler = [null, null, null, null]
  esit('hücreye çoklu girmez', f.tasi({ tur: 'sutun', index: 0 }, { tur: 'hucre', index: 0 }, 0), false)
  esit('hücreye tek kart girer', f.tasi({ tur: 'sutun', index: 0 }, { tur: 'hucre', index: 0 }), true)
  esit('hücre doldu', f.hucreler[0]?.deger, 8)
}

{
  // Kaynak ile hedef aynıysa taşıma olmaz
  const f = new FreeCell(tohumlu(29))
  esit('aynı yere taşıma yok', f.tasi({ tur: 'sutun', index: 2 }, { tur: 'sutun', index: 2 }), false)
}

// --- Mahjong: katmanlı tahta ---
{
  const m = new Mahjong(tohumlu(101))
  esit('taş sayısı çift', m.toplam % 2, 0)
  esit('üç kat var', new Set(m.taslar.map((t) => t.kat)).size, 3)
  kontrol('üstü kapalı taş var', m.taslar.some((_, i) => m.kapaliMi(i)))
  kontrol('kapalı taş serbest değil', m.taslar.every((_, i) => !(m.kapaliMi(i) && m.serbestMi(i))))

  // Üst kattaki sıranın yalnız uçları serbesttir; ortadakilerin iki yanı da dolu
  const enUst = m.taslar.filter((t) => t.kat === 2).sort((a, b) => a.sutun - b.sutun)
  kontrol('üst katın uçları serbest', m.serbestMi(m.taslar.indexOf(enUst[0])) && m.serbestMi(m.taslar.indexOf(enUst.at(-1))))
  kontrol('üst katın ortası kapalı değil ama serbest de değil', !m.serbestMi(m.taslar.indexOf(enUst[1])))

  // Simgeler çift çift
  const sayim = new Map()
  for (const t of m.taslar) sayim.set(t.simge, (sayim.get(t.simge) ?? 0) + 1)
  kontrol('her simge çift sayıda', [...sayim.values()].every((n) => n % 2 === 0))
}

{
  // Üretilen tahta çözülebilir olmalı: ipucu çiftlerini oynayarak bitir
  for (const tohum of [7, 23, 88, 404]) {
    const m = new Mahjong(tohumlu(tohum))
    let adim = 0
    while (!m.bitti && adim < 200) {
      const cift = m.ipucuCifti()
      if (!cift) break
      m.sec(cift[0])
      m.sec(cift[1])
      adim++
    }
    kontrol(`tohum ${tohum}: tahta çözüldü`, m.bitti, `kalan ${m.kalan}`)
  }
}

{
  // Seçim akışı
  const m = new Mahjong(tohumlu(55))
  const serbest = m.serbestIndexler()
  esit('serbest taş var', serbest.length > 0, true)
  esit('ilk dokunuş seçer', m.sec(serbest[0]), 'secildi')
  esit('aynısına dokunmak iptal eder', m.sec(serbest[0]), 'iptal')

  const cift = m.ipucuCifti()
  if (cift) {
    m.sec(cift[0])
    esit('eşleşen çift kalkar', m.sec(cift[1]), 'eslesti')
    kontrol('taşlar alındı', m.taslar[cift[0]].alindi && m.taslar[cift[1]].alindi)
    esit('çift sayacı arttı', m.eslesenCift, 1)
  }

  // Kapalı taşa dokunmak iş görmez
  const kapali = m.taslar.findIndex((t, i) => !t.alindi && m.kapaliMi(i))
  if (kapali >= 0) esit('kapalı taş seçilemez', m.sec(kapali), 'yok')
}

// --- Kale Savunması: dalga tablosu ve arka plan vakti ---
{
  esit('1. dalgada 4 canavar', dalgaCanavarSayisi(1), 4)
  esit('2. dalgada 6 canavar', dalgaCanavarSayisi(2), 6)
  esit('dalga sayısı tavanı geçmez', dalgaCanavarSayisi(50), DALGA_MAX_ADET)

  esit('1-3. dalga gündüz', [1, 2, 3].map(vakitIndeksi), [0, 0, 0])
  esit('4-6. dalga akşam', [4, 5, 6].map(vakitIndeksi), [1, 1, 1])
  esit('7. dalgadan sonra gece', [7, 12, 99].map(vakitIndeksi), [2, 2, 2])
}

// --- Kale Savunması: başlat / duraklat ---
{
  const oyun = new KaleSavunmasi(tohumlu(77))
  esit('oyun hazır bekliyor', oyun.asama, 'hazir')
  esit('başlamadan ilerlemez', oyun.calisiyor, false)

  // Başlat'a basılmadan hiçbir şey olmaz
  for (let i = 0; i < 600; i++) oyun.ilerlet(SIM_ADIM_MS)
  esit('başlamadan dalga gelmez', oyun.dalga, 0)
  esit('başlamadan mızrak atılmaz', oyun.at(), false)

  esit('başlat çalışır', oyun.basla(), true)
  esit('ikinci başlat iş görmez', oyun.basla(), false)
  esit('artık ilerliyor', oyun.calisiyor, true)

  // Duraklatınca simülasyon durur
  for (let i = 0; i < 300; i++) oyun.ilerlet(SIM_ADIM_MS)
  const dalgaOnce = oyun.dalga
  esit('duraklatıldı', oyun.duraklatDegistir(), true)
  esit('duraklamada ilerlemez', oyun.calisiyor, false)
  const yerlerOnce = oyun.canavarlar.map((c) => c.x)
  for (let i = 0; i < 600; i++) oyun.ilerlet(SIM_ADIM_MS)
  esit('duraklamada canavar yürümez', oyun.canavarlar.map((c) => c.x), yerlerOnce)
  esit('duraklamada mızrak atılmaz', oyun.at(), false)

  oyun.devam()
  esit('devam edince yine ilerler', oyun.calisiyor, true)
  esit('dalga kaybolmadı', oyun.dalga, dalgaOnce)
}

// --- Kale Savunması: yükseltme dükkânı ---
{
  const oyun = new KaleSavunmasi(tohumlu(88))
  oyun.basla()
  oyun.altin = 1000000

  // Kale tam canlıyken tamir satılmaz: para boşa gitmesin
  esit('tam canlı kalede tamir alınmaz', oyun.yukseltmeAlinabilir('tamir'), false)
  oyun.kaleCani = oyun.maxKaleCani - 20
  esit('hasarlı kalede tamir alınır', oyun.yukseltmeAl('tamir'), true)

  // Hasar yükseltmesi seviyeli ve her seviyede pahalanıyor
  const ilkFiyat = oyun.yukseltmeFiyatiSimdi('hasar')
  const ilkHasar = oyun.mizrakHasari
  esit('hasar yükseltmesi alındı', oyun.yukseltmeAl('hasar'), true)
  esit('seviye 1 oldu', oyun.yukseltmeSeviyesi('hasar'), 1)
  esit('mızrak hasarı arttı', oyun.mizrakHasari, ilkHasar + HASAR_BONUSU)
  kontrol('sonraki seviye daha pahalı', oyun.yukseltmeFiyatiSimdi('hasar') > ilkFiyat)

  // Tavana kadar alınır, sonra durur
  const hasarTavan = YUKSELTMELER.find((y) => y.id === 'hasar').maxSeviye
  for (let adim = 0; adim < hasarTavan && oyun.yukseltmeSeviyesi('hasar') < hasarTavan; adim++) {
    oyun.yukseltmeAl('hasar')
  }
  esit('hasar tavanda', oyun.yukseltmeSeviyesi('hasar'), hasarTavan)
  esit('tavanda fiyat yok', oyun.yukseltmeFiyatiSimdi('hasar'), null)
  esit('tavanda alınmaz', oyun.yukseltmeAl('hasar'), false)

  // Hız beklemeyi kısaltıyor, kale azami canı arttırıyor
  const oncekiBekleme = oyun.atisBeklemesi
  esit('hız yükseltmesi alındı', oyun.yukseltmeAl('hiz'), true)
  kontrol('bekleme kısaldı', oyun.atisBeklemesi < oncekiBekleme, `${oncekiBekleme} → ${oyun.atisBeklemesi}`)

  const oncekiMax = oyun.maxKaleCani
  const oncekiCan = oyun.kaleCani
  esit('kale yükseltmesi alındı', oyun.yukseltmeAl('kale'), true)
  esit('azami can arttı', oyun.maxKaleCani, oncekiMax + KALE_BONUSU)
  esit('kazanılan can hemen verildi', oyun.kaleCani, oncekiCan + KALE_BONUSU)

  esit('parasızken alınmaz', (oyun.altin = 0, oyun.yukseltmeAl('hiz')), false)
  esit('olmayan yükseltme alınmaz', oyun.yukseltmeAl('yok'), false)

  oyun.reset()
  esit('sıfırlama yükseltmeleri geri alır', oyun.yukseltmeler.size, 0)
  esit('sıfırlamada element normale döner', oyun.element, 'normal')
}

{
  // Elementler: alınmadan seçilemez, alınınca etkin olur
  const oyun = new KaleSavunmasi(tohumlu(89))
  oyun.basla()
  esit('başta yalnız normal açık', oyun.acikElementler, ['normal'])
  esit('alınmayan element seçilemez', oyun.elementSec('alev'), false)

  oyun.altin = 100000
  esit('alev alındı', oyun.yukseltmeAl('alev'), true)
  esit('alınan element hemen etkin', oyun.element, 'alev')
  esit('alev listede', oyun.acikElementler.includes('alev'), true)
  esit('normale dönülebilir', oyun.elementSec('normal'), true)
  esit('alev yeniden seçilebilir', oyun.elementSec('alev'), true)
  esit('element ikinci kez alınmaz', oyun.yukseltmeAl('alev'), false)

  // Otomatik ateş: alınmadan açılamaz, alınınca bekleme uzar
  const oyun2 = new KaleSavunmasi(tohumlu(90))
  oyun2.basla()
  esit('alınmadan otomatik açılmaz', oyun2.otomatikDegistir(), false)
  esit('otomatik kapalı', oyun2.otomatik, false)
  oyun2.altin = 100000
  const elleBekleme = oyun2.atisBeklemesi
  esit('otomatik alındı', oyun2.yukseltmeAl('otomatik'), true)
  esit('alınca açıldı', oyun2.otomatik, true)
  kontrol('otomatik bekleme daha uzun', oyun2.atisBeklemesi > elleBekleme, `${elleBekleme} → ${oyun2.atisBeklemesi}`)
  esit('kapatılabiliyor', (oyun2.otomatikDegistir(), oyun2.otomatik), false)
}

{
  // Otomatik ateş kendi nişan alıp vuruyor
  const oyun = new KaleSavunmasi(tohumlu(91))
  oyun.basla()
  oyun.altin = 100000
  oyun.yukseltmeAl('otomatik')

  let isabet = false
  for (let i = 0; i < 60000 / SIM_ADIM_MS && !isabet; i++) {
    isabet = oyun.ilerlet(SIM_ADIM_MS).isabetler.length > 0
  }
  esit('otomatik ateş canavarı vurdu', isabet, true)
  kontrol('otomatik nişan mızrak attı', oyun.oldurulen > 0 || oyun.atislar.length > 0)
}

{
  // Element etkileri
  const oyun = new KaleSavunmasi(tohumlu(92))
  oyun.basla()
  const tip = oyun.tipler.findIndex((t) => !t.patron && !t.ucar && t.zirh === 0)
  const koy = (x, can) => {
    oyun.canavarlar.push({
      id: 900 + Math.round(x), tip, x, can, maxCan: can, altin: 0, puan: 0,
      durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
    })
  }
  const vur = (element, hasar = 1) => {
    oyun.atislar.push({
      id: 1, x: oyun.canavarlar[0].x, y: ZEMIN_Y - 10, vx: 0, vy: 1,
      hasar, tur: 'mizrak', element,
      kritik: false, alan: 0, zirhDelici: false, yavaslatir: false,
    })
    oyun.ilerlet(SIM_ADIM_MS)
  }

  // Alev: vuruş sonrası zamanla hasar veriyor
  oyun.canavarlar.length = 0
  koy(300, 100)
  vur('alev')
  kontrol('alev canavarı yaktı', oyun.canavarlar[0].yanmaKalan > 0)
  const yanmaOncesi = oyun.canavarlar[0].can
  for (let i = 0; i < ALEV_ARALIK_MS / SIM_ADIM_MS + 2; i++) oyun.ilerlet(SIM_ADIM_MS)
  kontrol('yanma hasar verdi', oyun.canavarlar[0].can < yanmaOncesi, `${yanmaOncesi} → ${oyun.canavarlar[0].can}`)

  // Buz: yavaşlatıyor
  oyun.canavarlar.length = 0
  oyun.atislar.length = 0
  koy(300, 100)
  vur('buz')
  kontrol('buz yavaşlattı', oyun.canavarlar[0].yavaslikKalan > 0)
  const buzluX = oyun.canavarlar[0].x
  for (let i = 0; i < 30; i++) oyun.ilerlet(SIM_ADIM_MS)
  const buzluYol = buzluX - oyun.canavarlar[0].x

  oyun.canavarlar.length = 0
  oyun.atislar.length = 0
  koy(300, 100)
  const normalX = oyun.canavarlar[0].x
  for (let i = 0; i < 30; i++) oyun.ilerlet(SIM_ADIM_MS)
  const normalYol = normalX - oyun.canavarlar[0].x
  kontrol('buzlu canavar daha az yol aldı', buzluYol < normalYol, `${buzluYol.toFixed(1)} < ${normalYol.toFixed(1)}`)

  // Şimşek: komşuya atlıyor
  oyun.canavarlar.length = 0
  oyun.atislar.length = 0
  koy(300, 100)
  koy(340, 100)
  const komsuOncesi = oyun.canavarlar[1].can
  const sonuc2 = (() => {
    oyun.atislar.push({
      id: 5, x: 300, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: 1, tur: 'mizrak', element: 'simsek',
      kritik: false, alan: 0, zirhDelici: false, yavaslatir: false,
    })
    return oyun.ilerlet(SIM_ADIM_MS)
  })()
  kontrol('şimşek komşuya hasar verdi', oyun.canavarlar[1].can < komsuOncesi, `${komsuOncesi} → ${oyun.canavarlar[1].can}`)
  kontrol('zincir çizgisi bildirildi', sonuc2.zincirler.length > 0)
}

// --- Kale Savunması: kule yükseltme ---
{
  const oyun = new KaleSavunmasi(tohumlu(99))
  oyun.basla()
  oyun.altin = 1000000
  oyun.kuleAl(0, 0)
  esit('kule Lv1', oyun.kuleler[0].seviye, 1)

  const fiyat = KULE_TIPLERI[0].fiyat[1]
  const altinOnce = oyun.altin
  esit('kule yükseldi', oyun.kuleYukselt(0), true)
  esit('seviye 2 oldu', oyun.kuleler[0].seviye, 2)
  esit('yükseltme parası düştü', oyun.altin, altinOnce - fiyat)

  // Tavana kadar çık: her basamak bir kez yükselmeli.
  // Döngü sınırlı — yükseltme beklenmedik biçimde başarısız olursa test
  // kilitlenmesin, açıkça patlasın.
  for (let adim = 0; adim < KULE_MAX_SEVIYE && oyun.kuleler[0].seviye < KULE_MAX_SEVIYE; adim++) {
    const hedef = oyun.kuleler[0].seviye + 1
    esit(`Lv${hedef}'e yükseldi`, oyun.kuleYukselt(0), true)
    esit(`seviye ${hedef} oldu`, oyun.kuleler[0].seviye, hedef)
  }
  esit('en üst seviyede durur', oyun.kuleler[0].seviye, KULE_MAX_SEVIYE)
  esit('en üstte yükseltme olmaz', oyun.kuleYukselt(0), false)
  esit('en üstte fiyat yok', oyun.kuleFiyati(0, 0), null)
  esit('boş yuva yükseltilmez', oyun.kuleYukselt(1), false)

  oyun.altin = 0
  oyun.kuleAl(1, 0)
  esit('parasızken kule kurulmaz', oyun.kuleler[1], null)
}

// --- Kale Savunması: kule hedefleme kuralı ---
{
  const oyun = new KaleSavunmasi(tohumlu(61), 0, 1)
  oyun.basla()
  oyun.altin = 1000000
  oyun.kuleAl(0, 0)
  esit('yeni kule en öndekini vurur', oyun.kuleler[0].hedefleme, 0)

  const yerdekiler = oyun.tipler.map((t, i) => ({ t, i })).filter(({ t }) => !t.patron && !t.ucar)
  const hizli = yerdekiler.reduce((a, b) => (b.t.hiz > a.t.hiz ? b : a))
  const yavas = yerdekiler.reduce((a, b) => (b.t.hiz < a.t.hiz ? b : a))

  /** Kuralı uygular, tek atış attırır ve hangi canavarın canı gittiğini söyler. */
  const vurulan = (kural, liste) => {
    oyun.canavarlar.length = 0
    oyun.atislar.length = 0
    for (const c of liste) {
      oyun.canavarlar.push({
        id: c.id, tip: c.tip, x: c.x, can: c.can, maxCan: c.can, altin: 0, puan: 0,
        durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
      })
    }
    oyun.kuleler[0].hedefleme = kural
    oyun.kuleler[0].atisBirikim = KULE_TIPLERI[0].aralikMs[0]
    // Ok hedefe varana kadar ilerlet; yeni dalga uzakta doğuyor, karışmıyor.
    for (let i = 0; i < 40; i++) oyun.ilerlet(SIM_ADIM_MS)
    const yaralı = oyun.canavarlar.find((c) => liste.some((l) => l.id === c.id) && c.can < c.maxCan)
    return yaralı?.id ?? null
  }

  // İkisi kulenin iki yanında: ok yolda öbürüne çarpmasın, seçim net okunsun.
  const on = { id: 801, tip: yavas.i, x: 140, can: 5000 }
  const arka = { id: 802, tip: yavas.i, x: 320, can: 500000 }
  esit('en öndeki kuralı öne vurur', vurulan(0, [on, arka]), 801)
  esit('en canlı kuralı arkadaki güçlüye vurur', vurulan(1, [on, arka]), 802)

  const hizliCanavar = { id: 803, tip: hizli.i, x: 320, can: 500000 }
  const yavasCanavar = { id: 804, tip: yavas.i, x: 140, can: 500000 }
  esit(
    'en hızlı kuralı hızlıyı seçer',
    vurulan(2, [hizliCanavar, yavasCanavar]),
    hizli.t.hiz > yavas.t.hiz ? 803 : 804,
  )

  esit('kural sırayla dönüyor', oyun.hedeflemeDegistir(0), 0)
  esit('boş yuvada kural değişmez', oyun.hedeflemeDegistir(3), 0)
  kontrol('kural sayısı üç', HEDEFLEME_KURALLARI.length === 3)
}

// --- Kale Savunması: şef mekaniği (kalkan, iyileşme, şok dalgası) ---
{
  const oyun = new KaleSavunmasi(tohumlu(71), 0, 1)
  oyun.basla()
  oyun.altin = 1000000
  const sefTip = oyun.tipler.findIndex((t) => t.patron)

  // Doğan şefin kalkanı canının belli bir oranı kadar
  const sefKoy = (x = 400) => {
    const can = 200
    oyun.canavarlar.push({
      id: 950, tip: sefTip, x, can, maxCan: can, altin: 0, puan: 0,
      durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
      kalkan: Math.round(can * SEF_KALKAN_ORANI), maxKalkan: Math.round(can * SEF_KALKAN_ORANI), isabetsizSure: 0,
    })
    return oyun.canavarlar.at(-1)
  }
  const vur = (hedef, hasar) => {
    oyun.atislar.push({
      id: 60, x: hedef.x, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar, tur: 'mizrak', element: 'normal',
      kritik: false, alan: 0, zirhDelici: true, yavaslatir: false,
    })
    return oyun.ilerlet(SIM_ADIM_MS)
  }

  const sef = sefKoy()
  const kalkanBaslangic = sef.kalkan
  kontrol('şefin kalkanı var', kalkanBaslangic > 0, `kalkan ${kalkanBaslangic}`)
  vur(sef, 20)
  esit('hasar önce kalkandan düşer', sef.can, 200)
  kontrol('kalkan azaldı', sef.kalkan < kalkanBaslangic, `${kalkanBaslangic} → ${sef.kalkan}`)

  // Kalkanı kır, sonra cana işlesin
  sef.kalkan = 0
  vur(sef, 20)
  kontrol('kalkan bitince can gider', sef.can < 200, `can ${sef.can}`)

  // Vurulmayınca kalkan yenileniyor
  const canOnce = sef.can
  sef.kalkan = 0
  sef.isabetsizSure = SEF_KALKAN_BEKLEME_MS
  for (let i = 0; i < 60; i++) oyun.ilerlet(SIM_ADIM_MS)
  kontrol('vurulmayan şefin kalkanı doluyor', sef.kalkan > 0, `kalkan ${sef.kalkan.toFixed(1)}`)

  // Uzun süre vurulmayınca canı da toparlıyor
  sef.isabetsizSure = SEF_IYILESME_BEKLEME_MS
  for (let i = 0; i < 60; i++) oyun.ilerlet(SIM_ADIM_MS)
  kontrol('vurulmayan şef iyileşiyor', sef.can > canOnce, `${canOnce.toFixed(1)} → ${sef.can.toFixed(1)}`)

  // Sıradan canavarın kalkanı yok ve iyileşmiyor
  oyun.canavarlar.length = 0
  const sivilTip = oyun.tipler.findIndex((t) => !t.patron && !t.ucar)
  oyun.canavarlar.push({
    id: 951, tip: sivilTip, x: 400, can: 10, maxCan: 40, altin: 0, puan: 0,
    durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
    kalkan: 0, maxKalkan: 0, isabetsizSure: 99999,
  })
  for (let i = 0; i < 60; i++) oyun.ilerlet(SIM_ADIM_MS)
  esit('sıradan canavar iyileşmez', oyun.canavarlar[0].can, 10)

  // Şef ölünce menzildeki kule sersemler
  oyun.canavarlar.length = 0
  oyun.atislar.length = 0
  oyun.kuleAl(0, 0)
  oyun.kuleAl(5, 0)
  const yakin = sefKoy(KULE_YUVALARI[0] + 40)
  yakin.kalkan = 0
  yakin.can = 1
  const sonuc = vur(yakin, 50)
  kontrol('şef şoku bildirildi', sonuc.soklar.length === 1, `${sonuc.soklar.length} şok`)
  esit('yakındaki kule sersemledi', oyun.kuleler[0].sersem, SOK_SURE_MS)
  esit('uzaktaki kule etkilenmedi', oyun.kuleler[5].sersem, 0)
  kontrol(
    'şok menzili dışındaki yuva gerçekten uzak',
    Math.abs(KULE_YUVALARI[5] - yakin.x) > SOK_MENZIL,
  )
}

// --- Kale Savunması: canavarlar dalgayla güçleniyor ---
{
  esit('1. dalgada can çarpanı 1', dalgaCanCarpani(1), 1)
  kontrol('can çarpanı dalgayla büyüyor', dalgaCanCarpani(10) > dalgaCanCarpani(5))
  kontrol('10. dalgada canlar en az iki kat', dalgaCanCarpani(10) >= 2, `çarpan ${dalgaCanCarpani(10).toFixed(2)}`)
  esit('1. dalgada ödül çarpanı 1', dalgaOdulCarpani(1), 1)
  kontrol('ödül de dalgayla büyüyor', dalgaOdulCarpani(10) > 1)
  kontrol('ödül candan yavaş büyüyor', dalgaOdulCarpani(10) < dalgaCanCarpani(10))

  // Canavar canı ve ödülü doğduğu dalgaya göre ölçekleniyor mu?
  const oyun = new KaleSavunmasi(tohumlu(41))
  oyun.basla()
  // Doğan canavarı hemen sahneden alıyoruz: dalgalar hızla ilerliyor,
  // kale de hasar almıyor. Her doğuştan bir örnek toplanıyor.
  const ornekler = []
  for (let i = 0; i < 30000 && oyun.dalga <= 6; i++) {
    oyun.ilerlet(SIM_ADIM_MS)
    if (oyun.canavarlar.length === 0) continue
    const c = oyun.canavarlar[0]
    ornekler.push({ dalga: oyun.dalga, tip: c.tip, can: c.maxCan, altin: c.altin, puan: c.puan })
    oyun.canavarlar.length = 0
  }

  kontrol('birkaç dalgadan örnek toplandı', ornekler.length >= 6, `${ornekler.length} örnek`)
  kontrol(
    'canavar canı dalgaya göre ölçekli',
    ornekler.every((o) => o.can === Math.round(CANAVAR_TIPLERI[o.tip].can * dalgaCanCarpani(o.dalga))),
  )
  kontrol(
    'canavar ödülü dalgaya göre ölçekli',
    ornekler.every(
      (o) =>
        o.altin === Math.round(CANAVAR_TIPLERI[o.tip].altin * dalgaOdulCarpani(o.dalga)) &&
        o.puan === Math.round(CANAVAR_TIPLERI[o.tip].puan * dalgaOdulCarpani(o.dalga)),
    ),
  )
  const sonDalga = Math.max(...ornekler.map((o) => o.dalga))
  const ilk = ornekler.find((o) => o.dalga === 1)
  const son = ornekler.find((o) => o.dalga === sonDalga && o.tip === ilk.tip)
  if (son) kontrol('aynı tip ileri dalgada daha canlı', son.can > ilk.can, `${ilk.can} → ${son.can}`)
}

// --- Kale Savunması: güçlü tipler ileri dalgalarda sıklaşıyor ---
{
  // Aynı tohumla iki oyun: birinde ilk dalgalar, diğerinde ileri dalgalar
  const tipDagilimi = (baslangicDalga) => {
    const oyun = new KaleSavunmasi(tohumlu(7))
    oyun.basla()
    oyun.dalga = baslangicDalga
    const sayim = CANAVAR_TIPLERI.map(() => 0)
    for (let i = 0; i < 20000 && sayim.reduce((a, b) => a + b, 0) < 60; i++) {
      const oncekiDalga = oyun.dalga
      oyun.ilerlet(SIM_ADIM_MS)
      for (const c of oyun.canavarlar) sayim[c.tip]++
      oyun.canavarlar.length = 0
      // Dalga numarasını sabit tut: dağılımı tek dalga için ölçüyoruz
      oyun.dalga = oncekiDalga
    }
    return sayim
  }

  // Şef dalgası olmayan iki dalga seçildi (4 ve 19): dağılımı şef bozmasın.
  const erken = tipDagilimi(4)
  const geri = tipDagilimi(19)
  // Tip sırası zayıftan güçlüye; ortalama sıra yükseliyorsa dağılım
  // güçlülere kaymış demektir. (Tek bir tipin oranına bakmak yanıltır:
  // tabloya yeni tip eklenince herkesin payı düşer.)
  const ortalamaGuc = (s) => {
    const toplam = s.reduce((a, b) => a + b, 0)
    return s.reduce((a, adet, sira) => a + adet * sira, 0) / Math.max(1, toplam)
  }

  kontrol('erken dalgada goblin daha sık', erken[0] > erken[2], `goblin ${erken[0]}, trol ${erken[2]}`)
  kontrol('şef rastgele doğmuyor', erken[5] === 0 && geri[5] === 0)
  kontrol(
    'ileri dalgada güçlü tipler baskın',
    ortalamaGuc(geri) > ortalamaGuc(erken),
    `ortalama güç ${ortalamaGuc(erken).toFixed(2)} → ${ortalamaGuc(geri).toFixed(2)}`,
  )
}

// --- Kale Savunması: kule tipleri ---
{
  esit('üç kule tipi var', KULE_TIPLERI.length, 3)
  const [okcu, bombaci, buyucu] = KULE_TIPLERI
  esit('okçu tek hedef', okcu.alan, 0)
  kontrol('bombacı alan hasarı veriyor', bombaci.alan > 0)
  kontrol('bombacı okçudan yavaş', bombaci.aralikMs[0] > okcu.aralikMs[0])
  kontrol('bombacı vuruşu daha ağır', bombaci.hasar[0] > okcu.hasar[0])
  kontrol('büyücü zırhı geçiyor', buyucu.zirhDelici)
  kontrol('büyücü yavaşlatıyor', buyucu.yavaslatir)
  kontrol('büyücü okçudan pahalı', buyucu.fiyat[0] > okcu.fiyat[0])

  for (const tip of KULE_TIPLERI) {
    esit(`${tip.ad}: fiyat tablosu tam`, tip.fiyat.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: hasar tablosu tam`, tip.hasar.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: aralık tablosu tam`, tip.aralikMs.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: menzil tablosu tam`, tip.menzil.length, KULE_MAX_SEVIYE)
    kontrol(`${tip.ad}: özeti var`, typeof tip.ozet === 'string' && tip.ozet.length > 0)
  }

  kontrol('en az beş kule yuvası var', KULE_YUVALARI.length >= 5, KULE_YUVALARI.length + ' yuva')
  kontrol('yuvalar kalenin sağında', KULE_YUVALARI.every((x) => x > KALE_GENISLIK))
  kontrol('yuvalar alan içinde', KULE_YUVALARI.every((x) => x < GAME_WIDTH))
  kontrol('yuvalar soldan sağa sıralı', KULE_YUVALARI.every((x, i) => i === 0 || x > KULE_YUVALARI[i - 1]))
}

{
  // Her tip kurulabiliyor ve kendi davranışını gösteriyor
  const oyun = new KaleSavunmasi(tohumlu(31), 0, 1)
  oyun.basla()
  oyun.altin = 1000000
  for (let tip = 0; tip < KULE_TIPLERI.length; tip++) {
    esit(`${KULE_TIPLERI[tip].ad} kuruldu`, oyun.kuleAl(tip, tip), true)
    esit(`${KULE_TIPLERI[tip].ad} yuvada`, oyun.kuleler[tip].tip, tip)
  }
  esit('üç yuva dolu', oyun.kuleler.filter(Boolean).length, 3)
}

{
  // Bombacı alan hasarı: yakındaki iki canavar birlikte yiyor
  const oyun = new KaleSavunmasi(tohumlu(32), 0, 1)
  oyun.basla()
  const tip = oyun.tipler.findIndex((t) => !t.patron && !t.ucar && t.zirh === 0)
  const koy = (x) => oyun.canavarlar.push({
    id: 700 + Math.round(x), tip, x, can: 500, maxCan: 500, altin: 0, puan: 0,
    durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
  })
  oyun.canavarlar.length = 0
  koy(400)
  koy(430)
  const uzak = 400 + KULE_TIPLERI[1].alan + 60
  koy(uzak)

  const oncekiler = oyun.canavarlar.map((c) => c.can)
  const sonuc = (() => {
    oyun.atislar.push({
      id: 1, x: 400, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: 10, tur: 'ok',
      element: 'normal', kritik: false, alan: KULE_TIPLERI[1].alan, zirhDelici: false, yavaslatir: false,
    })
    return oyun.ilerlet(SIM_ADIM_MS)
  })()

  kontrol('vurulan canavar hasar aldı', oyun.canavarlar[0].can < oncekiler[0])
  kontrol('yakındaki de hasar aldı', oyun.canavarlar[1].can < oncekiler[1])
  esit('menzil dışındaki dokunulmadı', oyun.canavarlar[2].can, oncekiler[2])
  kontrol('patlama bildirildi', sonuc.patlamalar.length > 0)
}

{
  // Büyücü zırhı geçiyor ve yavaşlatıyor
  const oyun = new KaleSavunmasi(tohumlu(33), 0, 1)
  oyun.basla()
  const zirhliTip = oyun.tipler.findIndex((t) => t.zirh > 0 && !t.patron)
  const zirh = oyun.tipler[zirhliTip].zirh
  oyun.canavarlar.length = 0
  oyun.canavarlar.push({
    id: 701, tip: zirhliTip, x: 400, can: 500, maxCan: 500, altin: 0, puan: 0,
    durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
  })
  oyun.atislar.push({
    id: 2, x: 400, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: zirh + 5, tur: 'ok',
    element: 'normal', kritik: false, alan: 0, zirhDelici: true, yavaslatir: true,
  })
  oyun.ilerlet(SIM_ADIM_MS)
  esit('zırh delici tam hasar geçirdi', 500 - oyun.canavarlar[0].can, zirh + 5)
  kontrol('büyücü yavaşlattı', oyun.canavarlar[0].yavaslikKalan > 0)
}

// --- Kale Savunması: kule yıkımı ---
{
  const oyun = new KaleSavunmasi(tohumlu(36), 0, 1)
  oyun.basla()
  oyun.altin = 1000000

  esit('boş yuvanın yıkım bedeli yok', oyun.kuleYikimBedeli(0), null)
  esit('boş yuva yıkılmaz', oyun.kuleYik(0), false)

  const alisFiyati = KULE_TIPLERI[0].fiyat[0]
  oyun.kuleAl(0, 0)
  esit('yatırım alış fiyatı', oyun.kuleler[0].yatirim, alisFiyati)
  esit('yıkım bedeli yatırımın yarısı', oyun.kuleYikimBedeli(0), Math.floor(alisFiyati * KULE_YIKIM_ORANI))

  // Yükseltme yatırımı büyütüyor, yıkım bedeli de büyüyor
  const yukseltmeFiyat = KULE_TIPLERI[0].fiyat[1]
  oyun.kuleYukselt(0)
  esit('yatırım yükseltmeyi de sayıyor', oyun.kuleler[0].yatirim, alisFiyati + yukseltmeFiyat)
  esit(
    'yıkım bedeli büyüdü',
    oyun.kuleYikimBedeli(0),
    Math.floor((alisFiyati + yukseltmeFiyat) * KULE_YIKIM_ORANI),
  )

  // Yıkınca altın geri geliyor, yuva boşalıyor
  const bedel = oyun.kuleYikimBedeli(0)
  const altinOnce = oyun.altin
  esit('kule yıkıldı', oyun.kuleYik(0), true)
  esit('yuva boşaldı', oyun.kuleler[0], null)
  esit('altın geri geldi', oyun.altin, altinOnce + bedel)

  // Yıkım kârlı olmamalı: harcananın tamamı dönmüyor
  kontrol('geri dönen harcanandan az', bedel < alisFiyati + yukseltmeFiyat, `${bedel} < ${alisFiyati + yukseltmeFiyat}`)

  // Boşalan yuvaya başka tip kurulabiliyor
  esit('yerine başka tip kuruldu', oyun.kuleAl(0, 2), true)
  esit('yeni tip yuvada', oyun.kuleler[0].tip, 2)
  esit('yeni kule 1. seviyeden başlıyor', oyun.kuleler[0].seviye, 1)
  esit('yeni kulenin yatırımı kendi fiyatı', oyun.kuleler[0].yatirim, KULE_TIPLERI[2].fiyat[0])
}

// --- Kale Savunması: nişan işaretçinin gösterdiği yere düşüyor ---
{
  const oyun = new KaleSavunmasi(tohumlu(37), 0, 1)

  // Sahnenin her yerine nişan alınabiliyor: en uzak kenar dahil.
  // Düz atışta çizginin hedefe olan uzaklığı sıfıra yakın olmalı.
  const cizgiUzakligi = (hedefX, hedefY) => {
    const [a, b] = oyun.nisanYolu()
    const uzun = Math.hypot(b.x - a.x, b.y - a.y) || 1
    // Noktanın doğruya dik uzaklığı
    return Math.abs((b.x - a.x) * (a.y - hedefY) - (a.x - hedefX) * (b.y - a.y)) / uzun
  }

  for (const hedefX of [DURAK_X, 300, 500, GAME_WIDTH - 10]) {
    oyun.nisanlaNokta(hedefX, ZEMIN_Y)
    kontrol(
      `x=${hedefX} nişan hedefin üstünden geçiyor`,
      cizgiUzakligi(hedefX, ZEMIN_Y) < 2,
      `uzaklık ${cizgiUzakligi(hedefX, ZEMIN_Y).toFixed(2)}px`,
    )
  }

  // Yakın hedefte açı dik, uzak kenarda yayvan
  oyun.nisanlaNokta(DURAK_X, ZEMIN_Y)
  const yakinAci = oyun.aci
  oyun.nisanlaNokta(GAME_WIDTH - 10, ZEMIN_Y)
  const uzakAci = oyun.aci
  kontrol('yakın hedefte açı daha dik', yakinAci > uzakAci, `yakın ${yakinAci.toFixed(0)}°, uzak ${uzakAci.toFixed(0)}°`)
  kontrol('uzak kenar açı sınırı içinde', uzakAci >= ACI_MIN && uzakAci <= ACI_MAX, `${uzakAci.toFixed(1)}°`)

  // Sahne dışını gösterince açı sınırda kalıyor, patlamıyor
  oyun.nisanlaNokta(GAME_WIDTH * 3, ZEMIN_Y)
  kontrol('sahne dışında açı sınırlar içinde', oyun.aci >= ACI_MIN && oyun.aci <= ACI_MAX, `${oyun.aci}`)
}

// --- Kale Savunması: kritik vuruş ---
{
  const oyun = new KaleSavunmasi(tohumlu(34), 0, 1)
  esit('taban kritik şansı', oyun.kritikSansi, KRITIK_TABAN_SANS)
  esit('taban kritik çarpanı', oyun.kritikCarpani, KRITIK_TABAN_CARPAN)

  oyun.basla()
  oyun.altin = 1000000
  oyun.yukseltmeAl('kritiksans')
  esit('şans yükseltmeyle arttı', oyun.kritikSansi, KRITIK_TABAN_SANS + KRITIK_SANS_BONUSU)
  oyun.yukseltmeAl('kritikhasar')
  esit('çarpan yükseltmeyle arttı', oyun.kritikCarpani, KRITIK_TABAN_CARPAN + KRITIK_CARPAN_BONUSU)

  // Şans tavanı aşılmıyor
  for (let i = 0; i < 40; i++) oyun.yukseltmeAl('kritiksans')
  kontrol('kritik şansı tavanı geçmiyor', oyun.kritikSansi <= KRITIK_MAX_SANS, `${oyun.kritikSansi}`)
}

{
  // Kritik atış daha çok hasar taşıyor; isabet olayı hasarı bildiriyor
  const hepKritik = new KaleSavunmasi(() => 0, 0, 1)
  hepKritik.basla()
  hepKritik.at()
  const kritikAtis = hepKritik.atislar[0]
  esit('şans 0 üretecinde kritik oldu', kritikAtis.kritik, true)
  esit('kritik hasar çarpanla büyüdü', kritikAtis.hasar, Math.round(hepKritik.mizrakHasari * hepKritik.kritikCarpani))

  const hicKritik = new KaleSavunmasi(() => 0.99, 0, 1)
  hicKritik.basla()
  hicKritik.at()
  esit('şans 0.99 üretecinde kritik olmadı', hicKritik.atislar[0].kritik, false)
  esit('normal hasar taban hasar', hicKritik.atislar[0].hasar, hicKritik.mizrakHasari)

  // İsabet olayı geçen hasarı taşıyor
  const oyun = new KaleSavunmasi(tohumlu(35), 0, 1)
  oyun.basla()
  const tip = oyun.tipler.findIndex((t) => !t.patron && !t.ucar && t.zirh === 0)
  oyun.canavarlar.length = 0
  oyun.canavarlar.push({
    id: 702, tip, x: 400, can: 500, maxCan: 500, altin: 0, puan: 0,
    durum: 'yuruyor', faz: 0, vurusBirikim: 0, yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
  })
  oyun.atislar.push({
    id: 3, x: 400, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: 7, tur: 'mizrak',
    element: 'normal', kritik: true, alan: 0, zirhDelici: false, yavaslatir: false,
  })
  const isabetler = oyun.ilerlet(SIM_ADIM_MS).isabetler
  esit('isabet hasarı bildiriyor', isabetler[0].hasar, 7)
  esit('isabet kritiği bildiriyor', isabetler[0].kritik, true)
}

// --- Kale Savunması: zorluk seviyeleri ---
{
  esit('üç zorluk var', ZORLUKLAR.length, 3)
  esit('kimlikler kolay/orta/zor', ZORLUKLAR.map((z) => z.id), ['kolay', 'orta', 'zor'])
  esit('varsayılan orta', ZORLUKLAR[VARSAYILAN_ZORLUK].id, 'orta')
  esit('sınır dışı zorluk en yakına düşer', zorluk(99), ZORLUKLAR[2])
  esit('eksi zorluk kolaya düşer', zorluk(-2), ZORLUKLAR[0])

  const [kolay, orta, zor] = ZORLUKLAR
  esit('orta hiçbir şeyi çarpmıyor', [orta.canCarpani, orta.hizCarpani, orta.kaleCarpani, orta.puanCarpani], [1, 1, 1, 1])

  // Kolay her yönden yumuşak, zor her yönden sert olmalı
  kontrol('kolayda canavar daha zayıf', kolay.canCarpani < orta.canCarpani && orta.canCarpani < zor.canCarpani)
  kontrol('kolayda canavar daha yavaş', kolay.hizCarpani < orta.hizCarpani && orta.hizCarpani < zor.hizCarpani)
  kontrol('kolayda kale daha canlı', kolay.kaleCarpani > orta.kaleCarpani && orta.kaleCarpani > zor.kaleCarpani)
  kontrol('kolayda altın daha bol', kolay.altinCarpani > zor.altinCarpani)
  kontrol('kolayda dalga daha seyrek', kolay.adetCarpani < zor.adetCarpani)
  kontrol('zor daha çok puan veriyor', zor.puanCarpani > orta.puanCarpani && orta.puanCarpani > kolay.puanCarpani)
}

{
  // Zorluk kale canını, altını ve canavarı gerçekten değiştiriyor
  const kolayOyun = new KaleSavunmasi(tohumlu(51), 0, 0)
  const zorOyun = new KaleSavunmasi(tohumlu(51), 0, 2)

  esit('kolay seçildi', kolayOyun.zorluk.id, 'kolay')
  esit('zor seçildi', zorOyun.zorluk.id, 'zor')
  kontrol(
    'kolayda kale daha canlı başlıyor',
    kolayOyun.maxKaleCani > zorOyun.maxKaleCani,
    `${kolayOyun.maxKaleCani} > ${zorOyun.maxKaleCani}`,
  )
  kontrol(
    'kolayda başlangıç altını daha çok',
    kolayOyun.altin > zorOyun.altin,
    `${kolayOyun.altin} > ${zorOyun.altin}`,
  )

  // Aynı tohum, aynı dünya: yalnız zorluk farkı
  const ilkCanavar = (oyun) => {
    oyun.basla()
    for (let i = 0; i < 4000; i++) {
      oyun.ilerlet(SIM_ADIM_MS)
      if (oyun.canavarlar.length > 0) return oyun.canavarlar[0]
    }
    return null
  }
  const kolayCanavar = ilkCanavar(kolayOyun)
  const zorCanavar = ilkCanavar(zorOyun)
  kontrol('iki oyunda da canavar doğdu', kolayCanavar !== null && zorCanavar !== null)
  kontrol(
    'zorda canavar daha canlı',
    zorCanavar.maxCan > kolayCanavar.maxCan,
    `kolay ${kolayCanavar.maxCan}, zor ${zorCanavar.maxCan}`,
  )
  kontrol(
    'zorda puan daha yüksek',
    zorCanavar.puan > kolayCanavar.puan,
    `kolay ${kolayCanavar.puan}, zor ${zorCanavar.puan}`,
  )

  // Zorluk değiştirmek turu sıfırlıyor
  zorOyun.zorlukSec(0)
  esit('zorluk değişti', zorOyun.zorluk.id, 'kolay')
  esit('tur sıfırlandı', zorOyun.dalga, 0)
  esit('canavarlar temizlendi', zorOyun.canavarlar.length, 0)
  esit('kale yeni zorluğun canıyla doldu', zorOyun.kaleCani, zorOyun.maxKaleCani)
}

// --- Kale Savunması: dünyalar ---
{
  esit('iki dünya tanımlı', DUNYALAR.length >= 2, true)
  esit('sınır dışı dünya en yakına düşer', dunya(99), DUNYALAR[DUNYALAR.length - 1])
  esit('eksi dünya ilkine düşer', dunya(-3), DUNYALAR[0])

  // 2. dünya her açıdan daha zorlu olmalı
  const d1 = DUNYALAR[0]
  const d2 = DUNYALAR[1]
  const ortalama = (liste, alan) => liste.reduce((a, t) => a + t[alan], 0) / liste.length

  kontrol('2. dünya canavarları daha canlı', ortalama(d2.canavarlar, 'can') > ortalama(d1.canavarlar, 'can'))
  kontrol('2. dünya canavarları daha hızlı', ortalama(d2.canavarlar, 'hiz') > ortalama(d1.canavarlar, 'hiz'))
  kontrol('2. dünya daha çok hasar veriyor', ortalama(d2.canavarlar, 'vurusHasari') > ortalama(d1.canavarlar, 'vurusHasari'))
  kontrol('2. dünyanın kalesi daha canlı', d2.kaleCani > d1.kaleCani)
  kontrol('2. dünya daha çok ödül veriyor', d2.odulCarpani > d1.odulCarpani)
  kontrol(
    'iki dünyanın canavarları farklı',
    d2.canavarlar.every((t) => !d1.canavarlar.some((k) => k.ad === t.ad)),
  )
  for (const d of DUNYALAR) {
    kontrol(`${d.kisaAd}: bir şefi var`, d.canavarlar.filter((t) => t.patron).length === 1)
    kontrol(`${d.kisaAd}: 1. dalgada çıkan tip var`, d.canavarlar.some((t) => t.ilkDalga === 1 && !t.patron))
  }
}

{
  // Oyun seçilen dünyanın tablosuyla oynuyor
  const oyun = new KaleSavunmasi(tohumlu(71), 1)
  esit('2. dünya seçildi', oyun.dunyaSira, 1)
  esit('tablo 2. dünyanınki', oyun.tipler, DUNYALAR[1].canavarlar)
  esit('kale canı dünyadan geliyor', oyun.kaleCani, DUNYALAR[1].kaleCani)

  oyun.basla()
  let ornek = null
  for (let i = 0; i < 4000 && !ornek; i++) {
    oyun.ilerlet(SIM_ADIM_MS)
    ornek = oyun.canavarlar[0] ?? null
  }
  kontrol('2. dünyada canavar doğdu', ornek !== null)
  kontrol(
    '2. dünya canavarı kendi tablosundan',
    ornek !== null && ornek.can === Math.round(DUNYALAR[1].canavarlar[ornek.tip].can * dalgaCanCarpani(oyun.dalga)),
  )
  kontrol(
    'ödül dünya çarpanıyla büyümüş',
    ornek !== null && ornek.altin > DUNYALAR[1].canavarlar[ornek.tip].altin - 1,
  )

  // Dünya değiştirmek turu sıfırlıyor
  oyun.dunyaSec(0)
  esit('dünya değişti', oyun.dunyaSira, 0)
  esit('tur sıfırlandı', oyun.dalga, 0)
  esit('kale canı yeni dünyanınki', oyun.kaleCani, DUNYALAR[0].kaleCani)
  esit('canavarlar temizlendi', oyun.canavarlar.length, 0)
}

{
  // Açılma eşiği: 1000 canavara kadar ikinci dünya kilitli
  esit('eşik 1000', DUNYA_ESIGI, 1000)
  esit('sıfır öldürmede tek dünya açık', acikDunyaSayisi(0), 1)
  esit('999 öldürmede hâlâ tek dünya', acikDunyaSayisi(DUNYA_ESIGI - 1), 1)
  esit('1000 öldürmede iki dünya', acikDunyaSayisi(DUNYA_ESIGI), 2)
  esit('çok öldürmede dünya sayısını aşmaz', acikDunyaSayisi(DUNYA_ESIGI * 50), DUNYALAR.length)

  esit('1. dünya hep açık', dunyaAcikMi(0, 0), true)
  esit('2. dünya başta kilitli', dunyaAcikMi(1, 0), false)
  esit('2. dünya eşikte açılıyor', dunyaAcikMi(1, DUNYA_ESIGI), true)

  esit('başta 1000 kaldı', sonrakiDunyayaKalan(0), DUNYA_ESIGI)
  esit('600 öldürünce 400 kaldı', sonrakiDunyayaKalan(600), DUNYA_ESIGI - 600)
  esit('hepsi açıksa kalan yok', sonrakiDunyayaKalan(DUNYA_ESIGI * DUNYALAR.length), null)
}

// --- Kale Savunması: zırh, uçuş ve şef ---
{
  const zirhli = CANAVAR_TIPLERI.findIndex((t) => t.zirh > 0 && !t.patron)
  const ucan = CANAVAR_TIPLERI.findIndex((t) => t.ucar)
  const patron = CANAVAR_TIPLERI.findIndex((t) => t.patron)
  kontrol('zırhlı tip tanımlı', zirhli >= 0)
  kontrol('uçan tip tanımlı', ucan >= 0)
  kontrol('şef tipi tanımlı', patron >= 0)
  kontrol('şef en canlı tip', CANAVAR_TIPLERI[patron].can === Math.max(...CANAVAR_TIPLERI.map((t) => t.can)))
  kontrol('uçanın yüksekliği var', CANAVAR_TIPLERI[ucan].yukseklik > 0)
  esit('uçan yerdekinden yukarıda', canavarAyakY(CANAVAR_TIPLERI[ucan]) < ZEMIN_Y, true)
}

{
  // Zırh her isabetten sabit hasar yutar ama en az 1 hasar geçer
  const oyun = new KaleSavunmasi(tohumlu(61))
  oyun.basla()
  const zirhliTip = CANAVAR_TIPLERI.findIndex((t) => t.zirh > 0 && !t.patron)
  const zirh = CANAVAR_TIPLERI[zirhliTip].zirh

  // Elle bir zırhlı koy: dalga beklemeden ölç
  const koy = (tip, can) => {
    oyun.canavarlar.length = 0
    oyun.canavarlar.push({
      id: 999, tip, x: 300, can, maxCan: can, altin: 0, puan: 0,
      durum: 'yuruyor', faz: 0, vurusBirikim: 0,
      yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
    })
  }

  koy(zirhliTip, 100)
  const testHasari = zirh + 3
  oyun.aciAyarla(0)
  const oncekiCan = oyun.canavarlar[0].can
  // Mızrağı doğrudan canavarın üstüne koyup bir adım ilerlet
  oyun.atislar.push({ id: 1, x: 300, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: testHasari, tur: 'mizrak', element: 'normal', kritik: false, alan: 0, zirhDelici: false, yavaslatir: false })
  oyun.ilerlet(SIM_ADIM_MS)
  esit('zırh hasarı azaltıyor', oncekiCan - oyun.canavarlar[0].can, 3)

  // Zırhtan zayıf vuruş bile 1 hasar geçirir
  koy(zirhliTip, 100)
  oyun.atislar.push({ id: 2, x: 300, y: ZEMIN_Y - 10, vx: 0, vy: 1, hasar: 1, tur: 'ok', element: 'normal', kritik: false, alan: 0, zirhDelici: false, yavaslatir: false })
  oyun.ilerlet(SIM_ADIM_MS)
  esit('zayıf vuruş en az 1 hasar geçirir', 100 - oyun.canavarlar[0].can, 1)
}

{
  // Uçana mızrak değmez, kule oku değer
  const oyun = new KaleSavunmasi(tohumlu(62))
  oyun.basla()
  const ucanTip = CANAVAR_TIPLERI.findIndex((t) => t.ucar)
  const ucanY = canavarAyakY(CANAVAR_TIPLERI[ucanTip]) - CANAVAR_TIPLERI[ucanTip].boy / 2

  const koyUcan = () => {
    oyun.canavarlar.length = 0
    oyun.atislar.length = 0
    oyun.canavarlar.push({
      id: 998, tip: ucanTip, x: 300, can: 50, maxCan: 50, altin: 0, puan: 0,
      durum: 'yuruyor', faz: 0, vurusBirikim: 0,
      yanmaKalan: 0, yanmaTik: 0, yavaslikKalan: 0,
    })
  }

  koyUcan()
  oyun.atislar.push({ id: 1, x: 300, y: ucanY, vx: 0, vy: 1, hasar: 5, tur: 'mizrak', element: 'normal', kritik: false, alan: 0, zirhDelici: false, yavaslatir: false })
  oyun.ilerlet(SIM_ADIM_MS)
  esit('mızrak uçana değmiyor', oyun.canavarlar[0].can, 50)

  koyUcan()
  oyun.atislar.push({ id: 2, x: 300, y: ucanY, vx: 0, vy: 1, hasar: 5, tur: 'ok', element: 'normal', kritik: false, alan: 0, zirhDelici: false, yavaslatir: false })
  oyun.ilerlet(SIM_ADIM_MS)
  esit('kule oku uçanı vuruyor', oyun.canavarlar[0].can, 45)
}

{
  // Şef yalnız şef dalgasında ve dalganın sonunda gelir
  esit('5. dalga şef dalgası', patronDalgasiMi(PATRON_DALGA_ARALIK), true)
  esit('4. dalga şef dalgası değil', patronDalgasiMi(PATRON_DALGA_ARALIK - 1), false)

  const oyun = new KaleSavunmasi(tohumlu(63))
  oyun.basla()
  const patronTip = CANAVAR_TIPLERI.findIndex((t) => t.patron)
  const dogusSirasi = []
  for (let i = 0; i < 60000 && oyun.dalga <= PATRON_DALGA_ARALIK; i++) {
    oyun.ilerlet(SIM_ADIM_MS)
    if (oyun.canavarlar.length === 0) continue
    dogusSirasi.push({ dalga: oyun.dalga, tip: oyun.canavarlar[0].tip })
    oyun.canavarlar.length = 0
  }

  const patronlar = dogusSirasi.filter((d) => d.tip === patronTip)
  esit('yalnız bir şef doğdu', patronlar.length, 1)
  esit('şef şef dalgasında geldi', patronlar[0].dalga, PATRON_DALGA_ARALIK)

  const sefDalgasi = dogusSirasi.filter((d) => d.dalga === PATRON_DALGA_ARALIK)
  esit('şef dalganın sonuncusu', sefDalgasi[sefDalgasi.length - 1].tip, patronTip)
  kontrol(
    'şef dalgasında ondan önce sıradan canavarlar var',
    sefDalgasi.length > 1 && sefDalgasi.slice(0, -1).every((d) => d.tip !== patronTip),
  )
  kontrol(
    'şef dalgası bir fazla canavar getiriyor',
    sefDalgasi.length === dalgaCanavarSayisi(PATRON_DALGA_ARALIK) + 1,
    `${sefDalgasi.length} canavar`,
  )
}

// --- Kale Savunması: seviye görünümü (seviye sayısından bağımsız) ---
{
  const seviyeler = Array.from({ length: KULE_MAX_SEVIYE }, (_, i) => i + 1)
  const g = seviyeler.map(kuleGorunum)
  const artan = (al) => g.every((k, i) => i === 0 || al(k) > al(g[i - 1]))

  esit('her seviyenin görünümü tanımlı', g.length, KULE_MAX_SEVIYE)
  kontrol('kule her seviyede büyüyor', artan((k) => k.boy), g.map((k) => k.boy).join(' → '))
  kontrol('kule her seviyede genişliyor', artan((k) => k.en), g.map((k) => k.en).join(' → '))
  kontrol('mazgal sayısı her seviyede artıyor', artan((k) => k.mazgal), g.map((k) => k.mazgal).join(' → '))

  esit('ilk seviye çatısız', g[0].cati, 0)
  kontrol('sonraki seviyeler çatılı', g.slice(1).every((k) => k.cati > 0))
  esit('ilk seviye bayraksız', g[0].bayrak, 0)
  kontrol('en üst seviye bayraklı', g.at(-1).bayrak > 0)
  kontrol('en üst seviye süslemeli ve takviyeli', g.at(-1).susleme && g.at(-1).takviye)
  esit('tepe ışığı yalnız en üst seviyede', g.filter((k) => k.isik).length, 1)
  kontrol('tepe ışığı en üst seviyede', g.at(-1).isik)

  // Ok mazgal hattından çıkar: kule yükseldikçe başlangıç yükselir
  kontrol(
    'ok her seviyede daha tepeden çıkıyor',
    seviyeler.every((s, i) => i === 0 || kuleAtisY(s) < kuleAtisY(s - 1)),
    seviyeler.map(kuleAtisY).join(' → '),
  )
  esit('sınır dışı seviye en üst basamağa düşer', kuleGorunum(99), kuleGorunum(KULE_MAX_SEVIYE))
  esit('sıfır seviye ilk basamağa düşer', kuleGorunum(0), kuleGorunum(1))

  // Kule tablolarında her seviye için değer olmalı; biri eksik kalırsa
  // yükseltme undefined okur ve kule sessizce bozulur.
  for (const tip of KULE_TIPLERI) {
    esit(`${tip.ad}: fiyat tablosu tam`, tip.fiyat.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: hasar tablosu tam`, tip.hasar.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: aralık tablosu tam`, tip.aralikMs.length, KULE_MAX_SEVIYE)
    esit(`${tip.ad}: menzil tablosu tam`, tip.menzil.length, KULE_MAX_SEVIYE)
    kontrol(`${tip.ad}: hasar seviyeyle artıyor`, tip.hasar.every((h, i) => i === 0 || h > tip.hasar[i - 1]))
    kontrol(`${tip.ad}: menzil seviyeyle artıyor`, tip.menzil.every((m, i) => i === 0 || m > tip.menzil[i - 1]))
    kontrol(`${tip.ad}: atış aralığı kısalıyor`, tip.aralikMs.every((a, i) => i === 0 || a < tip.aralikMs[i - 1]))
    kontrol(`${tip.ad}: yükseltme pahalanıyor`, tip.fiyat.every((f, i) => i === 0 || f > tip.fiyat[i - 1]))
  }
}

// --- Kale Savunması: nişan duvarın dibine ulaşır ---
{
  // En dik açıda mızrak duvarın hemen önüne düşmeli; yoksa duvara dayanmış
  // canavar hiç vurulamaz.
  const oyun = new KaleSavunmasi(tohumlu(123))
  oyun.aciAyarla(ACI_MAX)
  const yol = oyun.nisanYolu()
  const dususX = yol[yol.length - 1].x
  kontrol('en dik atış duvarın dibine iner', dususX < DURAK_X, `düşüş x=${dususX.toFixed(0)}, durak=${DURAK_X}`)

  // Asıl ölçüt: duvara dayanmış canavar gerçekten vurulabiliyor mu?
  oyun.basla()
  let duvarda = null
  for (let i = 0; i < 60000 / SIM_ADIM_MS && !duvarda; i++) {
    oyun.ilerlet(SIM_ADIM_MS)
    duvarda = oyun.canavarlar.find((c) => c.durum === 'vuruyor') ?? null
  }
  kontrol('canavar duvara dayandı', duvarda !== null)

  oyun.nisanlaNokta(duvarda.x, ZEMIN_Y - 12)
  esit('duvar dibine mızrak atılabildi', oyun.at(), true)
  let isabet = false
  for (let i = 0; i < 200 && !isabet; i++) {
    isabet = oyun.ilerlet(SIM_ADIM_MS).isabetler.length > 0
  }
  esit('duvarın dibindeki canavar vuruldu', isabet, true)
}

// --- Kale Savunması: dalga akışı, mızrak fiziği, kale canı ---
{
  const oyun = new KaleSavunmasi(tohumlu(11))
  esit('başta dalga yok', oyun.dalga, 0)
  esit('kale tam canlı', oyun.kaleCani, DUNYALAR[0].kaleCani)
  oyun.basla()

  // Hazırlık payı dolunca ilk dalga başlar
  let yeniDalga = null
  for (let i = 0; i < 400 && yeniDalga === null; i++) {
    yeniDalga = oyun.ilerlet(SIM_ADIM_MS).yeniDalga
  }
  esit('ilk dalga başladı', yeniDalga, 1)
  esit('aşama dalga', oyun.asama, 'dalga')

  // İlk dalgada yalnız goblin çıkar (Ork 2., Trol 4. dalgadan itibaren)
  for (let i = 0; i < 400; i++) oyun.ilerlet(SIM_ADIM_MS)
  kontrol('canavar doğdu', oyun.canavarlar.length > 0, `bulunan ${oyun.canavarlar.length}`)
  esit(
    '1. dalgada hepsi goblin',
    oyun.canavarlar.every((c) => c.tip === 0),
    true,
  )
  kontrol(
    'canavarlar kaleye doğru yürüdü',
    oyun.canavarlar.every((c) => c.x < DOGUS_X),
  )
}

{
  // Nişan sınırları
  const oyun = new KaleSavunmasi(tohumlu(3))
  oyun.aciAyarla(-300)
  esit('açı alt sınırda durur', oyun.aci, ACI_MIN)
  oyun.aciAyarla(300)
  esit('açı üst sınırda durur', oyun.aci, ACI_MAX)

  // Nişan çizgisi düz: iki nokta, aradaki yön açıyla birebir
  oyun.aciAyarla(30)
  const yol = oyun.nisanYolu()
  esit('nişan çizgisi iki noktalı', yol.length, 2)
  const son = yol[yol.length - 1]
  kontrol('çizgi sahnenin kenarında biter', son.y >= ZEMIN_Y - 1 || son.x >= GAME_WIDTH, `${son.x.toFixed(0)},${son.y.toFixed(0)}`)
  const cizgiAcisi = (Math.atan2(son.y - yol[0].y, son.x - yol[0].x) * 180) / Math.PI
  kontrol('çizgi açıyla aynı yönde', Math.abs(cizgiAcisi - 30) < 0.5, `${cizgiAcisi.toFixed(2)}°`)
}

{
  // Atış beklemesi: üst üste iki mızrak atılamaz
  const oyun = new KaleSavunmasi(tohumlu(5))
  oyun.basla()
  esit('ilk atış geçer', oyun.at(), true)
  esit('bekleme dolmadan ikinci atış olmaz', oyun.at(), false)
  esit('bir mızrak uçuyor', oyun.atislar.length, 1)

  for (let i = 0; i < Math.ceil(ATIS_BEKLEME_MS / SIM_ADIM_MS) + 1; i++) oyun.ilerlet(SIM_ADIM_MS)
  esit('bekleme dolunca yeniden atılır', oyun.at(), true)
}

{
  // Mızrak yere düşünce saplanır, sonsuza kadar uçmaz
  const oyun = new KaleSavunmasi(tohumlu(9))
  oyun.basla()
  oyun.aciAyarla(30)
  oyun.at()
  let saplanan = 0
  for (let i = 0; i < 300 && saplanan === 0; i++) {
    saplanan += oyun.ilerlet(SIM_ADIM_MS).saplananlar.length
  }
  esit('mızrak yere saplandı', saplanan, 1)
  esit('uçan mızrak kalmadı', oyun.atislar.length, 0)
}

{
  // Kule satın alma: para, dolu yuva, geçersiz yuva
  const oyun = new KaleSavunmasi(tohumlu(31))
  oyun.basla()
  esit('oyun başlangıç altınıyla açılır', oyun.altin, BASLANGIC_ALTIN)

  oyun.altin = 0
  esit('parasız kule alınmaz', oyun.kuleAl(0, 0), false)

  oyun.altin = 200
  esit('kule kuruldu', oyun.kuleAl(0, 0), true)
  esit('altından fiyat düştü', oyun.altin, 200 - KULE_TIPLERI[0].fiyat[0])
  esit('kule 1. seviyede başlar', oyun.kuleler[0].seviye, 1)
  esit('dolu yuvaya ikinci kule olmaz', oyun.kuleAl(0, 0), false)
  esit('olmayan yuvaya kule olmaz', oyun.kuleAl(9, 0), false)
  esit('boş yuvanın fiyatı ilk basamak', oyun.kuleFiyati(1, 0), KULE_TIPLERI[0].fiyat[0])

  // Menzile canavar girince kule kendiliğinden ok atar
  let kuleAtti = false
  let okGoruldu = false
  for (let i = 0; i < 40000 / SIM_ADIM_MS && !kuleAtti; i++) {
    const sonuc = oyun.ilerlet(SIM_ADIM_MS)
    kuleAtti = kuleAtti || sonuc.kuleAtti
    okGoruldu = okGoruldu || oyun.atislar.some((a) => a.tur === 'ok')
  }
  esit('kule ok attı', kuleAtti, true)
  kontrol('havada ok var', okGoruldu)

  oyun.reset()
  esit('sıfırlama kuleleri kaldırır', oyun.kuleler.every((k) => k === null), true)
  esit('sıfırlama altını başa alır', oyun.altin, BASLANGIC_ALTIN)
}

{
  // Canavar duvara varınca kale canı düşer, sıfırlanınca oyun biter
  const oyun = new KaleSavunmasi(tohumlu(21))
  oyun.basla()
  let bitti = false
  let kaleVuruldu = false
  for (let i = 0; i < 120000 / SIM_ADIM_MS && !bitti; i++) {
    const sonuc = oyun.ilerlet(SIM_ADIM_MS)
    kaleVuruldu = kaleVuruldu || sonuc.kaleVuruldu
    bitti = sonuc.oyunBitti
  }
  kontrol('kale hasar aldı', kaleVuruldu)
  esit('kale düşünce oyun biter', bitti, true)
  esit('aşama bitti', oyun.asama, 'bitti')
  esit('kale canı sıfır', oyun.kaleCani, 0)
  esit('bitince atış yapılamaz', oyun.at(), false)
  esit('sıfırlama kaleyi doldurur', (oyun.reset(), oyun.kaleCani), DUNYALAR[0].kaleCani)
}

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} test başarısız:`)
  for (const h of hatalar) console.error(`  · ${h}`)
  process.exit(1)
}
console.log(`✓ ${gecti} oyun mantığı testi geçti`)

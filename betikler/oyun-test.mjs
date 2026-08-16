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
import { Klondike } from '../src/games/solitaire/systems/Klondike.ts'
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

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} test başarısız:`)
  for (const h of hatalar) console.error(`  · ${h}`)
  process.exit(1)
}
console.log(`✓ ${gecti} oyun mantığı testi geçti`)

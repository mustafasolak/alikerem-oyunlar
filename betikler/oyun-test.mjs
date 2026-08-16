/**
 * Oyunların saf mantığı için testler.
 *
 * Buradaki modüller Phaser'a bağlı olmadığı için doğrudan Node'da koşuyor.
 * Sahneler yalnızca çizim yapar; kural hataları burada yakalanır.
 *
 * Çalıştır: npm run oyun-test
 */
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

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} test başarısız:`)
  for (const h of hatalar) console.error(`  · ${h}`)
  process.exit(1)
}
console.log(`✓ ${gecti} oyun mantığı testi geçti`)

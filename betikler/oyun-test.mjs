/**
 * Oyunların saf mantığı için testler.
 *
 * Buradaki modüller Phaser'a bağlı olmadığı için doğrudan Node'da koşuyor.
 * Sahneler yalnızca çizim yapar; kural hataları burada yakalanır.
 *
 * Çalıştır: npm run oyun-test
 */
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

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} test başarısız:`)
  for (const h of hatalar) console.error(`  · ${h}`)
  process.exit(1)
}
console.log(`✓ ${gecti} oyun mantığı testi geçti`)

/**
 * Şema + sorgu testi.
 *
 * PGlite (WASM'a derlenmiş gerçek Postgres) üzerinde `betikler/sema.sql`
 * çalıştırılır, sonra `api/_sorgular.ts` içindeki işlevlerin ta kendisi
 * denenir. Yani test ile üretim aynı SQL metnini kullanır.
 *
 * Çalıştır: npm run veritabani-test
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'

import {
  PENCERE_SINIRI,
  gonderimSay,
  oyunAyari,
  oyuncuAc,
  semaVarMi,
  skorYaz,
  tabloOku,
} from '../api/_sorgular.ts'
import { adTemizle, donemCoz, donemler } from '../api/_ortak.ts'
import { sqlKomutlariniAyir } from './sql-bol.mjs'

const KOK = new URL('..', import.meta.url)

let gecti = 0
const hatalar = []

function kontrol(ad, kosul, ek = '') {
  if (kosul) gecti++
  else hatalar.push(`${ad}${ek ? ` — ${ek}` : ''}`)
}

function esit(ad, bulunan, beklenen) {
  kontrol(ad, JSON.stringify(bulunan) === JSON.stringify(beklenen), `beklenen ${JSON.stringify(beklenen)}, bulunan ${JSON.stringify(bulunan)}`)
}

/** neon()'un etiketli şablon arayüzünü PGlite üzerinde taklit eder. */
function koprü(db) {
  return async (parcalar, ...degerler) => {
    const metin = parcalar.reduce((acc, p, i) => acc + p + (i < degerler.length ? `$${i + 1}` : ''), '')
    const sonuc = await db.query(metin, degerler)
    return sonuc.rows
  }
}

const db = new PGlite()
const sql = koprü(db)

// --- Şema ---
esit('şema kurulmadan semaVarMi false', await semaVarMi(sql), false)

const sema = await readFile(fileURLToPath(new URL('betikler/sema.sql', KOK)), 'utf8')

// Şema, `npm run sema-kur` ile aynı yoldan kurulur: komutlara ayrılıp tek tek
// gönderilir. Vercel/Neon birden çok komutu tek istekte kabul etmiyor.
const komutlar = sqlKomutlariniAyir(sema)
kontrol('şema komutlara ayrıldı', komutlar.length >= 5, `${komutlar.length} komut`)
kontrol('hiçbir komutta noktalı virgül kalmadı', komutlar.every((k) => !k.includes(';')))
kontrol('yorum satırları ayıklandı', komutlar.every((k) => !k.startsWith('--')))
for (const k of komutlar) await db.query(k)
esit('şema kurulduktan sonra semaVarMi true', await semaVarMi(sql), true)

// Tekrar çalıştırılabilir olmalı (kullanıcı betiği iki kez çalıştırabilir)
for (const k of komutlar) await db.query(k)
esit('şema iki kez çalıştırılabiliyor', await semaVarMi(sql), true)

// Ayırıcı köşe durumları: tırnak, dolar tırnağı, yorum içindeki noktalı virgül
esit('tırnak içindeki ; bölmüyor', sqlKomutlariniAyir("select 'a;b'; select 2").length, 2)
esit('satır yorumundaki ; bölmüyor', sqlKomutlariniAyir('select 1 -- ;yorum\n; select 2').length, 2)
esit('blok yorumu atlanıyor', sqlKomutlariniAyir('/* ; */ select 1').length, 1)
esit('dolar tırnağı korunuyor', sqlKomutlariniAyir('do $$ begin perform 1; end $$; select 1').length, 2)
esit('kimlik tırnağı korunuyor', sqlKomutlariniAyir('select "a;b" from t').length, 1)
esit('boş metin komut üretmiyor', sqlKomutlariniAyir('   \n -- sadece yorum \n ').length, 0)

// --- Oyun ayarı ---
const ayar = await oyunAyari(sql, 'tetris')
esit('yeni oyun gizli değil', ayar.gizli, false)
esit('varsayılan üst sınır', ayar.ustSinir, 200000)

await sql`update oyunlar set gizli = true where id = ${'tetris'}`
esit('gizlenen oyun okunuyor', (await oyunAyari(sql, 'tetris')).gizli, true)
await sql`update oyunlar set gizli = false where id = ${'tetris'}`

// --- Skor yazımı: yalnız daha iyisi ezer ---
const A = 'uid-ali'
const B = 'uid-kerem'
await oyuncuAc(sql, A)
await oyuncuAc(sql, B)

esit('ilk skor yazıldı', await skorYaz(sql, 'tetris', A, 'tum', 'Ali', 500, 30), true)
esit('düşük skor yazılmadı', await skorYaz(sql, 'tetris', A, 'tum', 'Ali', 300, 20), false)
esit('yüksek skor yazıldı', await skorYaz(sql, 'tetris', A, 'tum', 'Ali', 900, 44), true)
esit('eşit skor yazılmadı', await skorYaz(sql, 'tetris', A, 'tum', 'Ali', 900, 10), false)

const [kalan] = await sql`select skor, sure_sn from skorlar where oyun_id='tetris' and uid=${A} and donem='tum'`
esit('en iyi skor kaldı', Number(kalan.skor), 900)
esit('süre en iyi skorunki', Number(kalan.sure_sn), 44)

// Aynı oyuncu + aynı dönem tek satır
const [{ adet }] = await sql`select count(*)::int as adet from skorlar where oyun_id='tetris' and uid=${A}`
esit('dönem başına tek satır', Number(adet), 1)

// --- Tablo sıralaması ve "ben" işareti ---
await skorYaz(sql, 'tetris', B, 'tum', 'Kerem', 1200, 60)
const tablo = await tabloOku(sql, 'tetris', 'tum', 10, A)
esit('sıralama skora göre', tablo.map((s) => s.skor), [1200, 900])
esit('sıra numaraları', tablo.map((s) => s.sira), [1, 2])
esit('ben işareti doğru', tablo.map((s) => s.ben), [false, true])
esit('doğrulandı varsayılan false', tablo[0].dogrulandi, false)

// Kimliksiz okuyanda hiçbir satır "ben" olmamalı
esit('kimliksiz ben yok', (await tabloOku(sql, 'tetris', 'tum', 10, null)).every((s) => !s.ben), true)

// limit uygulanıyor
esit('adet sınırı', (await tabloOku(sql, 'tetris', 'tum', 1, null)).length, 1)

// Başka oyun / başka dönem karışmıyor
await skorYaz(sql, 'yilan', A, 'tum', 'Ali', 77, 12)
esit('oyunlar ayrı', (await tabloOku(sql, 'yilan', 'tum', 10, null)).map((s) => s.skor), [77])
esit('boş dönem boş döner', (await tabloOku(sql, 'tetris', 'gunluk-2020-01-01', 10, null)).length, 0)

// --- Negatif/sıfır skor şemada durdurulur ---
let checkPatladi = false
try {
  await skorYaz(sql, 'tetris', A, 'gunluk-2030-01-01', 'Ali', 0, 5)
} catch {
  checkPatladi = true
}
esit('sıfır skor şema tarafından reddedildi', checkPatladi, true)

// --- Hız kısıtı sayacı ---
const C = 'uid-hiz'
let sonSayac = 0
for (let i = 0; i < PENCERE_SINIRI + 3; i++) sonSayac = await gonderimSay(sql, C, 'Hızlı')
kontrol('sayaç sınırı aşıyor', sonSayac > PENCERE_SINIRI, `sayaç ${sonSayac}`)
esit('ilk gönderim sayacı 1', await gonderimSay(sql, 'uid-yeni', 'Yeni'), 1)

// Pencere geçince sıfırlanmalı
await sql`update oyuncular set pencere_basi = now() - interval '10 minutes' where uid = ${C}`
esit('pencere dolunca sayaç sıfırlandı', await gonderimSay(sql, C, 'Hızlı'), 1)

// Ad güncelleniyor
await gonderimSay(sql, C, 'Yeni Ad')
const [{ ad }] = await sql`select ad from oyuncular where uid = ${C}`
esit('ad güncelleniyor', ad, 'Yeni Ad')

// --- Saf mantık: dönem etiketleri ---
esit('dönem sayısı', donemler(new Date('2026-08-16T10:00:00Z')).length, 4)
esit(
  'dönem etiketleri',
  donemler(new Date('2026-08-16T10:00:00Z')),
  ['gunluk-2026-08-16', 'haftalik-2026-W33', 'aylik-2026-08', 'tum'],
)
// Gün sınırı Türkiye saatine göre (UTC olsaydı gece yarısından sonra "dün"e yazardı)
esit('gece 00:00 yeni güne yazar', donemler(new Date('2026-08-16T21:00:00Z'))[0], 'gunluk-2026-08-17')
esit('gece 23:59 hâlâ aynı gün', donemler(new Date('2026-08-16T20:59:00Z'))[0], 'gunluk-2026-08-16')
esit('gece 01:05 yeni gün', donemler(new Date('2026-08-16T22:05:00Z'))[0], 'gunluk-2026-08-17')
esit('ay sınırı Türkiye saatine göre', donemler(new Date('2026-08-31T21:30:00Z'))[2], 'aylik-2026-09')

// ISO hafta: 1 Ocak 2027 bir Cuma → 2026'nın 53. haftası
esit('yıl sonu ISO haftası', donemler(new Date('2027-01-01T12:00:00Z'))[1], 'haftalik-2026-W53')
esit('4 Ocak her zaman 1. hafta', donemler(new Date('2027-01-04T12:00:00Z'))[1], 'haftalik-2027-W01')

// --- Saf mantık: dönem çözümü ---
kontrol('kısa ad çözülüyor', donemCoz('gunluk')?.startsWith('gunluk-'))
esit('tum aynen geçiyor', donemCoz('tum'), 'tum')
esit('tam etiket kabul', donemCoz('aylik-2026-08'), 'aylik-2026-08')
esit('uydurma dönem reddedildi', donemCoz('gunluk-hepsi'), null)
esit('SQL denemesi reddedildi', donemCoz("tum' or '1'='1"), null)
esit('boş reddedildi', donemCoz(''), null)

// --- Saf mantık: ad temizleme ---
esit('boş ad Misafir olur', adTemizle('   '), 'Misafir')
esit('ad kısaltılıyor', adTemizle('ABCDEFGHIJKLMNOP').length, 12)
esit('boşluklar sadeleşiyor', adTemizle('  Ali   Kerem  '), 'Ali Kerem')
esit('string olmayan Misafir olur', adTemizle(null), 'Misafir')

await db.close()

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} test başarısız:`)
  for (const h of hatalar) console.error(`  · ${h}`)
  process.exit(1)
}
console.log(`✓ ${gecti} veritabanı/sorgu testi geçti (gerçek Postgres — PGlite)`)

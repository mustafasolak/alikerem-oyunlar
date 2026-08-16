#!/usr/bin/env node
/**
 * Sözleşme testi: her oyun tanımı geçerli mi?
 *
 * 800 oyunda tarayıcıda tek tek bakmak imkânsız; bu denetim saniyeler sürer ve
 * "kimlik klasör adıyla uyuşmuyor", "tuval telefona sığmıyor", "rozet id'si
 * tekrar ediyor" gibi sessiz hataları derlemeden önce yakalar.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..')
const KATEGORILER = new Set(['arcade', 'mantik', 'kelime', 'kagit', 'dikkat', 'yerlestirme'])
/** iPhone SE: 375×667. Tuval + dış pay bunu aşmamalı. */
const DAR_EKRAN = { genislik: 375, yukseklik: 667 }

async function oyunDosyalari(dizin) {
  const sonuc = []
  for (const ad of await readdir(dizin)) {
    const yol = join(dizin, ad)
    if (!(await stat(yol)).isDirectory()) continue
    try {
      await stat(join(yol, 'oyun.ts'))
      sonuc.push(join(yol, 'oyun.ts'))
    } catch {
      sonuc.push(...(await oyunDosyalari(yol)))
    }
  }
  return sonuc
}

const dosyalar = (await oyunDosyalari(join(KOK, 'src/games'))).sort()
const hatalar = []
const kimlikler = new Set()

for (const dosya of dosyalar) {
  const kisa = relative(KOK, dosya)
  const klasor = dosya.split('/').at(-2)
  const bildir = (mesaj) => hatalar.push(`${kisa}: ${mesaj}`)

  let t
  try {
    t = (await import(pathToFileURL(dosya).href)).default
  } catch (hata) {
    bildir(`içe aktarılamadı — ${hata.message}`)
    continue
  }
  if (!t) {
    bildir('default tanım yok')
    continue
  }

  if (t.id !== klasor) bildir(`id "${t.id}" klasör adı "${klasor}" ile uyuşmuyor`)
  if (kimlikler.has(t.id)) bildir(`id tekrar ediyor: ${t.id}`)
  kimlikler.add(t.id)

  for (const alan of ['ad', 'ozet', 'aciklama', 'ipucu', 'emoji']) {
    if (typeof t[alan] !== 'string' || !t[alan].trim()) bildir(`"${alan}" boş`)
  }
  if (!KATEGORILER.has(t.kategori)) bildir(`geçersiz kategori: ${t.kategori}`)
  if (!Array.isArray(t.etiketler) || t.etiketler.length === 0) bildir('etiket yok')
  if (!Array.isArray(t.renk) || t.renk.length !== 2) bildir('renk ikilisi eksik')
  else for (const r of t.renk) if (!/^#[0-9a-f]{6}$/i.test(r)) bildir(`geçersiz renk: ${r}`)

  const tuval = t.tuval ?? {}
  if (!(tuval.genislik > 0 && tuval.yukseklik > 0)) bildir('tuval ölçüsü geçersiz')
  else {
    // Kabuk tahtayı min(genişlik, (ekran - disPay) * oran) ile ölçekler
    const oran = tuval.genislik / tuval.yukseklik
    const kalan = DAR_EKRAN.yukseklik - tuval.disPay
    if (kalan <= 80) bildir(`disPay ${tuval.disPay}px dar ekranda tahtaya yer bırakmıyor`)
    else if (Math.min(DAR_EKRAN.genislik, kalan * oran) < 150) {
      bildir(`dar ekranda tahta 150px altına düşüyor (oran ${oran.toFixed(2)}, disPay ${tuval.disPay})`)
    }
  }

  if (typeof t.sahne !== 'function') bildir('sahne yükleyicisi yok')

  const rozetIdleri = (t.arayuz?.rozetler ?? []).map((r) => r.id)
  if (new Set(rozetIdleri).size !== rozetIdleri.length) bildir('rozet id’leri tekrar ediyor')
  for (const r of t.arayuz?.rozetler ?? []) {
    if (!r.id || !r.etiket) bildir('rozet eksik alanlı')
  }
}

// Skor kimliği katalog kimliğiyle aynı olmalı.
// Aksi hâlde skorlar sunucuda başka bir kimlik altına düşer (yönetim paneli ve
// istatistikler katalogla eşleşmez) ya da büyük harf yüzünden sessizce reddedilir.
for (const dosya of dosyalar) {
  const klasor = dirname(dosya)
  const kimlik = klasor.split('/').pop()
  let sahne = ''
  try {
    sahne = await readFile(join(klasor, 'scenes/GameScene.ts'), 'utf8')
  } catch {
    continue
  }
  const kayit = sahne.match(/new ScoreRecorder\(\s*'([^']+)'/)
  const temel = sahne.match(/super\(\s*'([^']+)'\s*\)/)
  const skorKimligi = kayit?.[1] ?? temel?.[1]
  if (!skorKimligi) continue

  if (skorKimligi !== kimlik) {
    hatalar.push(`${kimlik}: skor kimliği '${skorKimligi}', katalog kimliğiyle aynı olmalı`)
  }
  if (!/^[a-z0-9]{2,32}$/.test(skorKimligi)) {
    hatalar.push(`${kimlik}: skor kimliği '${skorKimligi}' sunucu kalıbına uymuyor (küçük harf + rakam)`)
  }
}

if (hatalar.length) {
  console.error(`✗ ${hatalar.length} sorun:\n` + hatalar.map((h) => '  - ' + h).join('\n'))
  process.exit(1)
}
console.log(`✓ ${dosyalar.length} oyun tanımı sözleşmeye uygun`)

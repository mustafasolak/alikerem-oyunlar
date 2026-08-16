#!/usr/bin/env node
/**
 * Katalog üreticisi.
 *
 * src/games/**\/oyun.ts dosyalarını Node'da okuyup üstverilerini
 * src/uretilmis/katalog.ts içine düz veri olarak yazar.
 *
 * Neden: kataloğu çalışma zamanında toplamak için bütün oyun modüllerini
 * yüklemek gerekirdi; 800 oyunda bu ilk açılışı şişirir. Üstveri derleme
 * anında çıkarılınca ana sayfa tek küçük dosya okur.
 */
import { readdir, writeFile, stat } from 'node:fs/promises'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..')
const OYUNLAR_KOK = join(KOK, 'src/games')
const CIKTI = join(KOK, 'src/uretilmis/katalog.ts')

/** src/games altındaki bütün oyun.ts yollarını bulur (tek ya da iki kademe). */
async function oyunDosyalari(dizin) {
  const sonuc = []
  for (const ad of await readdir(dizin)) {
    const yol = join(dizin, ad)
    if (!(await stat(yol)).isDirectory()) continue
    const aday = join(yol, 'oyun.ts')
    try {
      await stat(aday)
      sonuc.push(aday)
      continue
    } catch {
      // Kategori klasörü olabilir, bir kademe daha in
      sonuc.push(...(await oyunDosyalari(yol)))
    }
  }
  return sonuc
}

const dosyalar = (await oyunDosyalari(OYUNLAR_KOK)).sort()
const kayitlar = []

for (const dosya of dosyalar) {
  const modul = await import(pathToFileURL(dosya).href)
  const t = modul.default
  if (!t?.id) {
    console.error(`✗ ${relative(KOK, dosya)}: default tanım bulunamadı`)
    process.exitCode = 1
    continue
  }
  const { sahne: _sahne, ...ustveri } = t
  kayitlar.push(ustveri)
}

kayitlar.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))

const icerik = `/* OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: src/games/**\\/oyun.ts
 * Yeniden üretmek için: npm run katalog
 */

import type { KatalogKaydi } from '../cekirdek/tanim.ts'

export const KATALOG: KatalogKaydi[] = ${JSON.stringify(kayitlar, null, 2)}

export const KATALOG_HARITASI = new Map(KATALOG.map((o) => [o.id, o]))
`

await writeFile(CIKTI, icerik)
console.log(`${kayitlar.length} oyun kataloğa yazıldı → ${relative(KOK, CIKTI)}`)

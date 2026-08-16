/**
 * Şemayı doğrudan veritabanına kurar.
 *
 * Vercel'in sorgu penceresine `betikler/sema.sql` dosyasını olduğu gibi
 * yapıştırmak işe yaramıyor ("cannot insert multiple commands in a prepared
 * statement"): pencere metnin tamamını tek komut sanıyor. Bu betik komutları
 * ayırıp sırayla gönderir.
 *
 * Kullanım:
 *   npm run sema-kur -- "postgres://kullanici:parola@sunucu/veritabani"
 * ya da bağlantı adresi ortamdan okunur:
 *   DATABASE_URL=... npm run sema-kur
 *
 * Tekrar tekrar çalıştırılabilir; her komut "if not exists" ile yazıldı.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { neon } from '@neondatabase/serverless'

import { sqlKomutlariniAyir } from './sql-bol.mjs'

// `--goster`: bağlanmadan komutları sırayla yazdırır (panele elle yapıştırmak için)
const sadeceGoster = process.argv.includes('--goster')

if (sadeceGoster) {
  const liste = sqlKomutlariniAyir(
    await readFile(fileURLToPath(new URL('sema.sql', import.meta.url)), 'utf8'),
  )
  console.log(`Vercel sorgu penceresine ${liste.length} komutu TEK TEK yapıştır:\n`)
  liste.forEach((k, i) => console.log(`--- ${i + 1}/${liste.length} ---\n${k};\n`))
  process.exit(0)
}

const adres =
  process.argv[2] ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  ''

if (!adres) {
  console.error(`Bağlantı adresi yok.

Vercel panelinde: Storage → veritabanın → ".env.local" sekmesindeki
DATABASE_URL değerini kopyala, sonra:

  npm run sema-kur -- "postgres://..."
`)
  process.exit(1)
}

if (!/^postgres(ql)?:\/\//.test(adres)) {
  console.error('Bağlantı adresi "postgres://" ile başlamalı.')
  process.exit(1)
}

const sql = neon(adres)
const metin = await readFile(fileURLToPath(new URL('sema.sql', import.meta.url)), 'utf8')
const komutlar = sqlKomutlariniAyir(metin)

console.log(`${komutlar.length} komut uygulanacak…`)

let sira = 0
for (const komut of komutlar) {
  sira++
  const ozet = komut.replace(/\s+/g, ' ').slice(0, 62)
  try {
    await sql.query(komut)
    console.log(`  ${String(sira).padStart(2)}/${komutlar.length} ✓ ${ozet}`)
  } catch (e) {
    console.error(`  ${String(sira).padStart(2)}/${komutlar.length} ✗ ${ozet}`)
    console.error(`     ${e.message}`)
    process.exit(1)
  }
}

// Kurulum gerçekten tuttu mu?
const [{ tablolar }] = await sql.query(`
  select count(*)::int as tablolar from information_schema.tables
  where table_schema = 'public' and table_name in ('oyuncular', 'oyunlar', 'skorlar')`)

if (Number(tablolar) !== 3) {
  console.error(`\n✗ Beklenen 3 tablo, bulunan ${tablolar}.`)
  process.exit(1)
}

console.log('\n✓ Şema kuruldu (oyuncular, oyunlar, skorlar).')
console.log('  Sırada: Vercel → Settings → Environment Variables → OYUN_GIZLI_ANAHTAR, sonra Redeploy.')

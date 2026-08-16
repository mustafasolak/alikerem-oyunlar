/**
 * Yerel API sunucusu — Vercel'siz deneme için.
 *
 * `dist/` statik olarak sunulur, `/api/*` istekleri gerçek işleyicilere gider.
 * Veritabanı olarak PGlite (WASM Postgres) kullanılır: `api/_veritabani.ts`
 * modülü yükleme sırasında bu köprüyle değiştirilir, işleyicilerin kendisi
 * hiç değişmez.
 *
 * Çalıştır: npm run yerel   (varsayılan http://localhost:4173)
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.env.OYUN_GIZLI_ANAHTAR ??= 'yerel-deneme-anahtari-32-karakter'

const KOK = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(KOK, 'dist')
const KOPRU = pathToFileURL(join(KOK, 'betikler/pglite-koprusu.mjs')).href

registerHooks({
  resolve(belirtec, baglam, sonraki) {
    // `api/_veritabani` yerine PGlite köprüsü yüklensin
    if (/_veritabani\.(ts|js)$/.test(belirtec)) return { url: KOPRU, shortCircuit: true }
    // api/ içindeki dosyalar ESM kuralına göre `./x.js` yazıyor (Vercel öyle
    // derliyor); yerelde kaynak `.ts` olduğu için geri çeviriyoruz.
    if (belirtec.startsWith('./') && belirtec.endsWith('.js') && baglam.parentURL?.includes('/api/')) {
      return sonraki(belirtec.replace(/\.js$/, '.ts'), baglam)
    }
    return sonraki(belirtec, baglam)
  },
})

const { kur } = await import(KOPRU)
await kur()

const isleyiciler = {
  '/api/saglik': (await import('../api/saglik.ts')).default,
  '/api/kimlik': (await import('../api/kimlik.ts')).default,
  '/api/skor': (await import('../api/skor.ts')).default,
  '/api/tablo': (await import('../api/tablo.ts')).default,
}

const TURLER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

/** Vercel'in (req, res) sözleşmesini işleyicilerin beklediği biçime çevirir. */
function yanitSar(res) {
  return {
    status(kod) {
      res.statusCode = kod
      return this
    },
    setHeader: (ad, deger) => res.setHeader(ad, deger),
    json(govde) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(govde))
    },
  }
}

async function govdeTopla(req) {
  const parcalar = []
  for await (const p of req) parcalar.push(p)
  return parcalar.length ? Buffer.concat(parcalar).toString('utf8') : ''
}

const sunucu = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')

  const isleyici = isleyiciler[url.pathname]
  if (isleyici) {
    const istek = {
      method: req.method,
      headers: req.headers,
      query: Object.fromEntries(url.searchParams),
      body: req.method === 'POST' ? await govdeTopla(req) : undefined,
    }
    try {
      await isleyici(istek, yanitSar(res))
    } catch (e) {
      console.error('işleyici hatası', url.pathname, e)
      res.statusCode = 500
      res.end('{"tamam":false}')
    }
    return
  }

  // Statik dosya, yoksa SPA girişi
  const istenen = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '')
  let yol = join(DIST, istenen)
  let govde = await readFile(yol).catch(() => null)
  if (govde === null) {
    yol = join(DIST, 'index.html')
    govde = await readFile(yol).catch(() => null)
  }
  if (govde === null) {
    res.statusCode = 404
    res.end('yok')
    return
  }
  res.setHeader('Content-Type', TURLER[extname(yol)] ?? 'application/octet-stream')
  res.end(govde)
})

const port = Number(process.env.PORT ?? 4173)
sunucu.listen(port, () => console.log(`yerel sunucu hazır → http://localhost:${port}`))

/**
 * SQL metnini tek tek komutlara ayırır.
 *
 * Gerekçe: Vercel'in sorgu penceresi ve Neon'un HTTP sürücüsü metnin tamamını
 * tek bir hazırlanmış ifade olarak gönderiyor; Postgres birden çok komutu bu
 * biçimde kabul etmiyor ("cannot insert multiple commands into a prepared
 * statement"). Bu yüzden komutları ayırıp sırayla çalıştırıyoruz.
 *
 * Tırnak, kimlik tırnağı, satır/blok yorumu ve dolar tırnağı ($$…$$) dikkate
 * alınır; bunların içindeki noktalı virgül ayırıcı sayılmaz.
 */

/** @param {string} metin @returns {string[]} boş olmayan komutlar */
export function sqlKomutlariniAyir(metin) {
  const komutlar = []
  let su = ''
  let i = 0

  while (i < metin.length) {
    const k = metin[i]
    const ikili = metin.slice(i, i + 2)

    // Satır yorumu
    if (ikili === '--') {
      const son = metin.indexOf('\n', i)
      i = son === -1 ? metin.length : son + 1
      continue
    }

    // Blok yorumu (iç içe olabilir)
    if (ikili === '/*') {
      let derinlik = 1
      i += 2
      while (i < metin.length && derinlik > 0) {
        if (metin.slice(i, i + 2) === '/*') (derinlik++, (i += 2))
        else if (metin.slice(i, i + 2) === '*/') (derinlik--, (i += 2))
        else i++
      }
      continue
    }

    // Dolar tırnağı: $$ … $$ ya da $etiket$ … $etiket$
    if (k === '$') {
      const etiket = /^\$[A-Za-z_][A-Za-z_0-9]*\$|^\$\$/.exec(metin.slice(i))
      if (etiket) {
        const kapanis = metin.indexOf(etiket[0], i + etiket[0].length)
        const son = kapanis === -1 ? metin.length : kapanis + etiket[0].length
        su += metin.slice(i, son)
        i = son
        continue
      }
    }

    // Metin ya da kimlik tırnağı ('' ve "" ikilemesiyle kaçış)
    if (k === "'" || k === '"') {
      su += k
      i++
      while (i < metin.length) {
        if (metin[i] === k) {
          if (metin[i + 1] === k) {
            su += k + k
            i += 2
            continue
          }
          su += k
          i++
          break
        }
        su += metin[i]
        i++
      }
      continue
    }

    if (k === ';') {
      komutlar.push(su)
      su = ''
      i++
      continue
    }

    su += k
    i++
  }

  komutlar.push(su)
  return komutlar.map((s) => s.trim()).filter((s) => s.length > 0)
}

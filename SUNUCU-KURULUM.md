# Global skor tablosu — kurulum

Site sunucu olmadan da eksiksiz çalışır: skorlar cihazda (localStorage) tutulur,
"Global" sekmesi görünmez. Aşağıdaki üç adım yapılınca global tablo kendiliğinden açılır.

## 1. Postgres oluştur

Vercel panelinde: **Storage → Create Database → Postgres (Neon)** → projeye bağla.
Vercel `DATABASE_URL` / `POSTGRES_URL` değişkenlerini otomatik ekler; elle bir şey yazmaya gerek yok.

## 2. Şemayı kur

Vercel → Storage → veritabanı → **Query** sekmesine `betikler/sema.sql` dosyasının
içeriğini yapıştırıp çalıştır. Dosya tekrar tekrar çalıştırılabilir (hepsi `if not exists`).

## 3. Gizli anahtarı gir

Vercel → Settings → **Environment Variables**:

| Ad | Değer |
|---|---|
| `OYUN_GIZLI_ANAHTAR` | en az 16 karakter rastgele metin |

Üretmek için: `openssl rand -base64 32`

Bu anahtar anonim oyuncu çerezini imzalar. Değiştirilirse eski çerezler geçersiz olur
(oyuncular yeni kimlik alır, skorlar durur). **Bir kez üret, bir daha değiştirme.**

Değişkeni ekledikten sonra **Redeploy** gerekir.

## Kontrol

`https://<site>/api/saglik` üç alanı da `true` göstermeli:

```json
{"tamam":true,"veritabani":true,"sema":true,"anahtar":true}
```

Biri `false` ise site sessizce cihaz moduna düşer — oyunlar etkilenmez.

## Yerelde denemek

Vercel'e çıkmadan API'yi denemek için (bellek-içi Postgres kullanır):

```bash
npm run yerel      # http://localhost:4173
```

Şema ve sorgu testleri: `npm run veritabani-test` (gerçek Postgres, PGlite üzerinde).

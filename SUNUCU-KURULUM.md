# Global skor tablosu — kurulum

Site sunucu olmadan da eksiksiz çalışır: skorlar cihazda (localStorage) tutulur,
"Global" sekmesi görünmez. Aşağıdaki üç adım yapılınca global tablo kendiliğinden açılır.

## 1. Postgres oluştur

Vercel panelinde: **Storage → Create Database → Postgres (Neon)** → projeye bağla.
Vercel `DATABASE_URL` / `POSTGRES_URL` değişkenlerini otomatik ekler; elle bir şey yazmaya gerek yok.

## 2. Şemayı kur

Vercel panelinde: Storage → veritabanın → **`.env.local`** sekmesindeki `DATABASE_URL`
değerini kopyala, sonra:

```bash
npm run sema-kur -- "postgres://buraya-kopyaladigin-adres"
```

Betik tabloları kurar ve sonunda doğrular. Tekrar tekrar çalıştırılabilir
(her komut `if not exists`).

> **Neden yapıştırma değil:** `betikler/sema.sql` birden çok komut içeriyor.
> Vercel'in **Query** penceresi metnin tamamını tek bir hazırlanmış ifade olarak
> gönderdiği için Postgres reddediyor:
> *"cannot insert multiple commands into a prepared statement"*.
> Betik komutları ayırıp sırayla gönderiyor.

Yine de paneli kullanmak istersen, komutları **tek tek** yapıştırman gerekir.
Numaralı listeyi şöyle alırsın:

```bash
npm run sema-kur -- --goster
```

## 3. Gizli anahtarı gir

Vercel → Settings → **Environment Variables**:

| Ad | Değer |
|---|---|
| `OYUN_GIZLI_ANAHTAR` | en az 16 karakter rastgele metin |

Üretmek için: `openssl rand -base64 32`

Bu anahtar anonim oyuncu çerezini imzalar. Değiştirilirse eski çerezler geçersiz olur
(oyuncular yeni kimlik alır, skorlar durur). **Bir kez üret, bir daha değiştirme.**

Değişkeni ekledikten sonra **Redeploy** gerekir.

## 4. Yönetim paneli (isteğe bağlı)

Panel `https://<site>/#/yonetim` adresinde. Açmak için bir ortam değişkeni daha:

| Ad | Değer |
|---|---|
| `YONETIM_PAROLASI` | en az 12 karakter |

Değişken tanımlı değilse uç hiç açılmaz (`503`) — kaza eseri korumasız bir panel
yayında kalmasın diye. Giriş imzalı, `httpOnly` çerezle 12 saat sürer.

Panelde neler var:
- **Oyunlar** — gizle/göster, öne çıkarma sırası, oyun başına skor üst sınırı
- **Son gönderimler** — uygunsuz takma adı ya da şüpheli skoru silme
  (bir oyuncunun o oyundaki dört dönem kaydı birlikte silinir)
- **İstatistik** — oyuncu/kayıt sayısı, oyun başına en yüksek skor, son 14 gün

Bir oyunu gizlemek onu katalogdan kaldırır ve skor göndermeyi kapatır; doğrudan
bağlantıyla hâlâ oynanabilir (eski yer imleri kırılmasın diye).

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

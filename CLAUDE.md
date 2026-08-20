# Proje: Binbir Oyun

## Ne yapıyoruz
Tarayıcıda çalışan mini oyun koleksiyonu. Tek bir ana sayfa var, oyunlar oradan açılıyor.
Her oyun tek kişilik; klavye + dokunmatik kontrol.
Hedef: 60 FPS, masaüstü ve mobil tarayıcıda sorunsuz çalışması.

## Teknoloji
- Phaser 4 (oyun motoru), three.js (üç boyutlu oyunlar)
- TypeScript
- Vite (dev sunucusu + çok sayfalı build)
- Yayın: statik hosting (itch.io / Netlify / GitHub Pages) — `base: './'` sayesinde alt klasörde de çalışır

## Yayın

İki hedef birden desteklenir:
- **Vercel** (asıl): `vercel.json` + `base: '/'`. Derlemede `VERCEL=1` tanımlı olduğu
  için vite.config bunu kendisi seçer. Git'e push → otomatik yayın.
- **GitHub Pages** (yedek): `base: './'`, `.github/workflows/deploy.yml`.

Eski `games/<id>/index.html` adresleri `public/games/<id>/` altındaki
yönlendirmelerle korunuyor; kırılmasınlar diye silinmemeli.

## Komutlar
- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi (`dist/`)
- `npm run preview` — derlemeyi yerelde test et
- `npx tsc --noEmit` — tip kontrolü

## Mimari

Tek sayfalı yapı. `index.html` bir tanedir; oyunlar `import.meta.glob` ile
**tembel** yüklenir ve Vite her oyunu kendi parçasına böler. Ana sayfa açılırken
Phaser inmez (~15 KB), oyun açılınca iner.

```
index.html               # tek kabuk
src/
  main.ts                # yönlendirici + tembel sayfalar
  cekirdek/
    tanim.ts             # OyunTanimi tipi + tanim() yardımcısı
    OyunKabugu.ts        # oyun sayfası arayüzünü `arayuz` bildiriminden üretir
    yonlendirici.ts      # hash yönlendirici (#/ ve #/oyun/<id>)
    yukleyiciler.ts      # import.meta.glob — oyun modülü haritası
    tercihler.ts         # favoriler, son oynananlar
    site.ts
  sayfalar/
    KatalogSayfasi.ts    # arama, kategori, favori, sayfalı liste
    OyunSayfasi.ts       # kabuk + Phaser yaşam döngüsü (destroy dahil)
  uretilmis/katalog.ts   # OTOMATİK — npm run katalog
  shared/                # ortak modüller (HUD, ses, görsel, motorlar…)
  games/<id>/
    oyun.ts              # TEK kayıt noktası: üstveri + arayüz + tembel sahne
    config/constants.ts
    systems/*.ts
    scenes/GameScene.ts
public/games/<id>/       # eski adresler için yönlendirme (üretilir)
betikler/
  katalog-uret.mjs       # oyun.ts dosyalarını tarayıp katalog yazar
  sozlesme.mjs           # tanım denetimi (kimlik, kategori, tuval, rozet)
  yeni-oyun.mjs          # iskele
```

## Yeni oyun eklemek

```
npm run yeni-oyun -- <id> <kategori>
```

Klasör açılır, gerisi otomatik: katalog kaydı, sayfa kabuğu, adres, kart.
**Elle kayıt tutulan hiçbir liste yok.** Kategoriler: arcade · mantik · kelime ·
kagit · dikkat · yerlestirme.

### Üç boyutlu oyun
Phaser 4'te 3B çizim yok (yalnız `Mesh2D`). Üç boyutlu oyunlar `oyun.ts` içinde
`motor: 'ucboyut'` verir; kabuk o zaman Phaser açmaz, sahne sınıfını `new` edip
`baslat(kap)` çağırır, sayfadan çıkarken `yikil()` der. Sahneler
`shared/UcBoyutSahne.ts`'ten türer: three.js tuvalini, kamerayı, kare döngüsünü
ve ölçü değişimini o kurar; HUD, skor tablosu, ses ve süre sayacı ortak
modüllerden gelir (hiçbiri Phaser'a bağlı değil).

Örnek: `games/kalesavunmasi3d` — oyun mantığını (`systems/KaleSavunmasi.ts`) iki
boyutlu sürümle paylaşır, yalnız çizimi başkadır. Eksen eşlemesi
`config/sahne3d.ts` başında yazılıdır (sim x → z, sim y → y).

Sim isteğe bağlı **şerit** taşır: `new KaleSavunmasi(random, dunya, zorluk,
seritAdet)`. Şerit yalnız sıra numarasıdır, dünyadaki yeri sahne bilir. İki
boyutlu sürüm tek şeritle (varsayılan) çalışır, üç boyutlu sürüm üç şeritle;
böylece aynı mantık iki farklı oynanış sunar.

### Dış bağlantılı oyun
Başka bir adreste çalışan oyun için `oyun.ts` içinde `sahne` ve `tuval` yerine
`disAdres` verilir. Kart doğrudan o adrese götürür (ayrı sekme), `#/oyun/<id>`
adresi de oraya yönlendirir. Kodu bu depoya girmeyen kardeş projeler böyle
eklenir; sözleşme testi https zorunluluğunu ve `sahne`/`tuval` bulunmamasını
denetler.

## Yayın

İki hedef birden desteklenir:
- **Vercel** (asıl): `vercel.json` + `base: '/'`. Derlemede `VERCEL=1` tanımlı olduğu
  için vite.config bunu kendisi seçer. Git'e push → otomatik yayın.
- **GitHub Pages** (yedek): `base: './'`, `.github/workflows/deploy.yml`.

Eski `games/<id>/index.html` adresleri `public/games/<id>/` altındaki
yönlendirmelerle korunuyor; kırılmasınlar diye silinmemeli.

## Komutlar
- `npm run dev` — geliştirme sunucusu (katalog otomatik üretilir)
- `npm run build` — üretim derlemesi
- `npm run kontrol` — katalog + sözleşme testi + tip kontrolü
- `npm run katalog` — kataloğu yeniden üret
- `npm run sozlesme` — oyun tanımlarını denetle
- `npm run oyun-test` — oyunların saf mantığı (Node'da, Phaser'sız)
- `npm run veritabani-test` — şema + sorgular (PGlite üzerinde gerçek Postgres)
- `npm run yerel` — API'yi yerelde çalıştır (bellek-içi Postgres)
- `npm run sema-kur -- "<DATABASE_URL>"` — şemayı kur

## Kod kuralları
- Oyun klasöründe HTML ya da CSS bulunmaz; sayfa arayüzü `oyun.ts` içindeki
  `arayuz` bildiriminden üretilir, renkler `renk` alanından gelir.
- Sihirli sayı yok. Tüm ayarlanabilir değerler ilgili oyunun `config/constants.ts` dosyasında adlandırılmış sabit olsun.
- Her sahne kendi dosyasında; sahne dosyaları 300 satırı geçerse sistemlere böl.
- Oyun mantığı Phaser'a mümkün olduğunca az bağlı olsun (test edilebilirlik için).
  Örnek: `Board2048` saf TypeScript, sahne yalnızca onu çizer.
- Hareket ve fizik `delta` zamanına göre hesaplansın, kare sayısına göre değil.
- Mobil önce: oyun sayfası kendi oranını `--game-aspect` (sayı), tuval dışındaki arayüzün
  kapladığı dikey alanı `--chrome` ile verir. Tahta genişliği
  `min(100%, (100dvh - chrome) * aspect)` ile hesaplanır; böylece alçak ekranda küçülür,
  sayfa taşmaz. Yeni oyun eklerken bu iki değeri ayarla.
- **Katman sırası açıkça verilsin.** Phaser'da sonradan eklenen nesne üste çizilir;
  içerik konteynerini erken kurup üstüne statik nesne eklemek içeriği görünmez yapar.
  Bu yüzden her sahnede `KATMAN` sabitleriyle `setDepth` kullan:
  arka plan → ızgara → içerik → efekt → nişan.
- Düz renk lekesi yerine `Gorsel.parca()` / `Gorsel.top()` kullan: üstte parlama,
  altta gölge şeridi olan parçalar ekranda okunur duruyor.
- Nişan gerektiren oyunlarda (atış, top) `nisanIzi()` ile kesik çizgi ve hedefte
  hayalet gösterilsin; atılan cisim tweenle uçsun — nereye gideceği görünmeli.
- Ses eklerken `sesler` tekilini kullan; iOS bağlamı ilk dokunuşta açılır, dosya yüklenmez.
- Kullanıcıdan gelen metin (takma ad) DOM'a `textContent` ile yazılsın; `innerHTML` kullanılıyorsa kaçırılsın.
- Katmanda ad sorulurken sahne `input.keyboard.enabled = false` yapsın, yoksa WASD/boşluk oyuna gider.
- Yeni asset eklerken `public/assets/` altına koy ve preload'da anahtarını tanımla.
- tsconfig katı: `verbatimModuleSyntax` (tip importları `import type`), `erasableSyntaxOnly`
  (enum / namespace / parametre özelliği yok), `noUnusedLocals`, `noUnusedParameters`.
- İçe aktarmalarda `.ts` uzantısı kullanılıyor.

## Claude için çalışma talimatları
- Büyük değişikliklerden önce plan çıkar, onay al, sonra kodla.
- Bir seferde tek özellik. Özellik bittiğinde çalışır durumda olsun.
- Her özellikten sonra `npm run build` ve `npx tsc --noEmit` çalıştırıp hatasız olduğunu doğrula.
- Değişiklikten sonra oyunun nasıl test edileceğini kısaca yaz (hangi tuş, ne beklenmeli).
- Bağımlılık ekleme; gerekiyorsa önce sor.
- Mevcut mimariyi yeniden yazma, üzerine ekle.

## Sunucu tarafı (api/)
- Uçlar `api/*.ts`; yardımcılar `api/_*.ts` (alt çizgili dosyalar uç sayılmaz).
- **Göreli içe aktarımlar `.js` uzantısıyla yazılır** (`./_ortak.js`), kaynak `.ts` olsa bile.
  Vercel uçları ESM'e derliyor; `.ts` uzantılı belirteç çalışma anında bulunamıyor.
- Bütün SQL `api/_sorgular.ts` içinde. İşleyiciler sorgu yazmaz.
- Şema `betikler/sema.sql`; değişince `npm run veritabani-test` gerçek Postgres'te doğrular.
- Yerelde denemek: `npm run yerel` (bellek-içi Postgres, gerçek işleyiciler).
- Sunucu **asla zorunlu değil**: `/api/saglik` olumsuzsa site cihaz moduna düşer.
- Yönetim paneli `#/yonetim`; `YONETIM_PAROLASI` yoksa uç 503 döner ve panel açılmaz.

## Yol haritası

### Site
- [x] Ana sayfa + oyun kataloğu
- [x] Çok sayfalı build, GitHub Pages'e otomatik yayın
- [x] Ortak HUD / kaydırma / depolama / ses / ızgara modülleri
- [x] İsimli skor tablosu (oyun başına ilk 5, cihaz yerel)
- [x] Telefon uyumu: yatay taşma yok, tahta ilk ekrana sığıyor
- [x] Herkese açık ortak skor tablosu (Vercel + Neon Postgres, günlük/haftalık/aylık)

### Oyunlar — 54'ü de oynanabilir
Arcade: 2048 · Yılan · Tetris · Match-3 · Şeker Patlatma · Bubble Shooter · Zuma ·
  Kale Savunması
Mantık: Sudoku · Mayın Tarlası · Nonogram · Kakuro · Lights Out · Mantık Kapıları ·
  Köprü Kurma · Boru Bağlama · Su Borusu · Elektrik Devresi · Laser Reflection · Aynalarla Lazer
Yerleştirme: 15'li Puzzle · Sokoban · Box Push · Araba Çıkarma · Hanoi · Blok Yerleştirme ·
  Pentomino · Tangram · Domino · Rubik Küpü
Kelime: Kelime Bulmaca · Kelime Avı · Adam Asmaca · Wordle · Kelime Gruplama · Şifre Çözme
Kâğıt/eşleştirme: Solitaire · Spider · FreeCell · Mahjong · Hafıza Kartları · Eşleştirme
Renk ayırma: Top Sıralama · Renk Sıralama · Su Şişesi
Dikkat: Farkları Bul · Gizli Nesne · Resim Tamamlama
Diğer: Mastermind · Labirent · Matematik Bulmacası · Sayı Piramidi
Üç boyutlu: Kale Savunması 3B (three.js)
Dış bağlantı: Robicraft (ayrı depo, Railway'de barınıyor)

### Kalan işler
- [x] Sudoku'da kalem notları
- [x] Mayın Tarlası'nda akor (sayıya çift tıkla çevresini aç)
- [x] 2048'de geri alma (oyun başına 3 hak)
- [x] Solitaire ailesinde çoklu kart taşıma ve geri alma
- [x] Kale Savunması: dünyalar (1000 canavar öldürünce 2. dünya açılır, kalıcı)
- [x] Kale Savunması: mızrakçı yükseltmeleri (element, otomatik ateş, seviyeli hasar/hız/duvar)
- [x] Kale Savunması: kolay/orta/zor zorluk seviyeleri
- [x] Kale Savunması: kule tipleri (okçu / bombacı-alan / büyücü-zırh delici), 5 yuva
- [x] Kale Savunması: kritik vuruş, hasar sayıları, sürekli can barları
- [x] Kale Savunması 3B: three.js ile üç boyutlu sürüm (mantık paylaşılıyor)
- [x] Kale Savunması: 3. dünya (Ateş Diyarı — zırhlı canavarlar, gece başlar)
- [ ] Mahjong tek katmanlı — gerçek kat yapısı yok
- [ ] Tangram parçaları hâlâ kare — gerçek tangram parçaları çizilmeli
- [x] Yönetim paneli (#/yonetim) — gizleme, ana sayfa vitrini, skor denetimi, istatistik
- [ ] Sunucu: Seviye 2 doğrulama, telemetri, gecelik yedek

## Skor tasarımı
Skor tablosu "yüksek olan iyidir" varsayar. Süreye/hamleye dayalı oyunlarda skor
`taban puan + süre bonusu - ceza` biçiminde hesaplanır; böylece bütün oyunlar aynı
tabloda tutarlı kalır.

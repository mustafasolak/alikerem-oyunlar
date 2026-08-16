# Proje: Ali Kerem Oyunları

## Ne yapıyoruz
Tarayıcıda çalışan mini oyun koleksiyonu. Tek bir ana sayfa var, oyunlar oradan açılıyor.
Her oyun tek kişilik; klavye + dokunmatik kontrol.
Hedef: 60 FPS, masaüstü ve mobil tarayıcıda sorunsuz çalışması.

## Teknoloji
- Phaser 4 (oyun motoru)
- TypeScript
- Vite (dev sunucusu + çok sayfalı build)
- Yayın: statik hosting (itch.io / Netlify / GitHub Pages) — `base: './'` sayesinde alt klasörde de çalışır

## Komutlar
- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi (`dist/`)
- `npm run preview` — derlemeyi yerelde test et
- `npx tsc --noEmit` — tip kontrolü

## Klasör yapısı
```
index.html               # ana sayfa (oyun galerisi)
games/<oyun>/index.html  # her oyunun kendi sayfası
vite.config.ts           # çok sayfalı build girdileri
src/
  shared/                # bütün oyunların ortak kullandığı parçalar
    base.css             # site geneli sıfırlama + tasarım değişkenleri
    game-page.css        # ortak oyun sayfası düzeni (üst bar, skor, katman)
    games.ts             # oyun kataloğu (ana sayfa kartları buradan üretilir)
    GameHud.ts           # skor / en iyi / tablo / sonuç katmanı (DOM)
    Leaderboard.ts       # oyun başına isimli ilk 5 skor (bu cihazda)
    ScoreRecorder.ts     # tablo + HUD köprüsü; tur bitince takma ad sorar
    SwipeInput.ts        # dokunmatik kaydırma → yön
    KeyPad.ts            # DOM tuş takımı (harf klavyesi / rakam takımı)
    TemelSahne.ts        # sahne iskeleti: HUD + skor kaydı + sayaç + bitiş akışı
    KareIzgara.ts        # kare ızgara görünümü ve imleç→hücre eşlemesi
    Gorsel.ts            # katman sırası (KATMAN), hacimli parça/top, nişan izi, seken yol
  shared/motorlar/       # birden fazla oyunun paylaştığı oyun motorları
    BoruAgi.ts           # Boru Bağlama, Su Borusu, Elektrik Devresi
    LazerAgi.ts          # Laser Reflection, Aynalarla Lazer
    UcluEslestirme.ts    # Match-3, Şeker Patlatma
    Iskambil.ts          # Solitaire, Spider, FreeCell
    Sesler.ts            # WebAudio ile anlık üretilen ses efektleri (dosya yok)
    Sayac.ts             # geçen süre sayacı
    dom.ts               # durum rozeti, buton grubu gibi küçük DOM işleri
    rastgele.ts          # karıştırma / seçme (üreteç dışarıdan verilebilir)
    kelimeler.ts         # Türkçe kelime + ipucu sözlüğü (kelime oyunları)
    safeStorage.ts       # localStorage sarmalayıcı (gizli sekmede çökmez)
  home/                  # ana sayfa kodu ve stili
  games/<oyun>/
    main.ts              # Phaser config, oyun başlatma
    <oyun>.css           # sadece o oyunun rengi ve tuval oranı (--game-a/b, --game-aspect)
    scenes/              # her sahne ayrı dosya
    systems/             # oyun mantığı ve kayıt
    config/constants.ts  # sabitler: ölçü, süre, renk, kurallar
public/assets/           # görsel ve ses dosyaları
```

Yeni oyun yazarken HUD, kaydırma ve depolama için `src/shared/` içindekileri kullan;
oyuna özel kodu tekrar yazma. Bütün oyun sayfaları aynı DOM id'lerini paylaşır
(`#score`, `#best`, `#best-name`, `#restart`, `#overlay`, `#overlay-form`, `#overlay-name`,
`#scoreboard`, `#game`, `#game-stage`).

Skorlar sunucuda değil, tarayıcının localStorage'ında tutulur: tablo yalnızca o cihazda geçerlidir.

## Yeni oyun ekleme adımları
1. `games/<oyun>/index.html` oluştur — mevcut bir oyun sayfasını kopyala, id'ler aynı kalsın;
   script etiketi `../../src/games/<oyun>/main.ts` göstersin.
2. `src/games/<oyun>/` altına main.ts + config/scenes/systems iskeletini kur.
   `<oyun>.css` yalnızca `@import '../../shared/game-page.css'` ve başlık renklerini içersin.
3. `vite.config.ts` içindeki `rollupOptions.input`'a girdiyi ekle.
4. `src/shared/games.ts` içine katalog kaydını ekle (`status: 'ready'`).

## Kod kuralları
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

## Yol haritası

### Site
- [x] Ana sayfa + oyun kataloğu
- [x] Çok sayfalı build, GitHub Pages'e otomatik yayın
- [x] Ortak HUD / kaydırma / depolama / ses / ızgara modülleri
- [x] İsimli skor tablosu (oyun başına ilk 5, cihaz yerel)
- [x] Telefon uyumu: yatay taşma yok, tahta ilk ekrana sığıyor
- [ ] Herkese açık ortak skor tablosu (sunucu/servis gerektirir)

### Oyunlar — 51'i de oynanabilir
Arcade: 2048 · Yılan · Tetris · Match-3 · Şeker Patlatma · Bubble Shooter · Zuma
Mantık: Sudoku · Mayın Tarlası · Nonogram · Kakuro · Lights Out · Mantık Kapıları ·
  Köprü Kurma · Boru Bağlama · Su Borusu · Elektrik Devresi · Laser Reflection · Aynalarla Lazer
Yerleştirme: 15'li Puzzle · Sokoban · Box Push · Araba Çıkarma · Hanoi · Blok Yerleştirme ·
  Pentomino · Tangram · Domino · Rubik Küpü
Kelime: Kelime Bulmaca · Kelime Avı · Adam Asmaca · Wordle · Kelime Gruplama · Şifre Çözme
Kâğıt/eşleştirme: Solitaire · Spider · FreeCell · Mahjong · Hafıza Kartları · Eşleştirme
Renk ayırma: Top Sıralama · Renk Sıralama · Su Şişesi
Dikkat: Farkları Bul · Gizli Nesne · Resim Tamamlama
Diğer: Mastermind · Labirent · Matematik Bulmacası · Sayı Piramidi

### Kalan işler
- [ ] Sudoku'da kalem notları
- [ ] Mayın Tarlası'nda akor (sayıya çift tıkla çevresini aç)
- [ ] 2048'de geri alma
- [ ] Solitaire ailesinde çoklu kart taşıma ve geri alma

## Skor tasarımı
Skor tablosu "yüksek olan iyidir" varsayar. Süreye/hamleye dayalı oyunlarda skor
`taban puan + süre bonusu - ceza` biçiminde hesaplanır; böylece bütün oyunlar aynı
tabloda tutarlı kalır.

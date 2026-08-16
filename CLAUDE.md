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
- [x] Çok sayfalı build (her oyun kendi sayfası)
- [x] Yayın: https://mustafasolak.github.io/alikerem-oyunlar/ (main'e push → otomatik)
- [x] Ortak HUD / kaydırma / depolama modülleri
- [x] İsimli skor tablosu (oyun başına ilk 5, cihaz yerel)
- [x] Ana sayfa kartlarında en iyi skorlar
- [ ] Herkese açık ortak skor tablosu (sunucu/servis gerektirir)

### Tetris, Mayın Tarlası, Sudoku, 15'li Puzzle, Kelime Bulmaca, Kelime Avı, Adam Asmaca
- [x] Hepsi oynanabilir: çekirdek döngü, kazanma/kaybetme, skor, HUD, skor tablosu
- [x] Mantık katmanları saf TypeScript (TetrisGame, Minesweeper, SudokuGame, SlidingPuzzle,
      Crossword, WordSearch, HangmanGame) — Phaser'a bağımlı değil
- [x] Mobil: kaydırma (Tetris, 15'li), dokunma (Mayın, Sudoku, Kelime Avı, Bulmaca),
      DOM tuş takımı (Sudoku, Bulmaca, Asmaca), Tetris'te ekran tuşları
- [x] Ses efektleri (WebAudio, bağımlılıksız) ve ses aç/kapat düğmesi
- [x] Telefon uyumu: yatay taşma yok, tahta ilk ekrana sığıyor
- [ ] Sudoku'da kalem notları
- [ ] Mayın Tarlası'nda akor (sayıya çift tıkla çevresini aç)

### 2048
- [x] Oynanabilir çekirdek döngü (kaydırma + birleştirme)
- [x] Kazanma/kaybetme koşulu (2048'e ulaşma, hamle kalmaması)
- [x] Skor, en iyi skor ve HUD
- [x] Menü/yeniden başlatma (Yeni oyun, sonuç katmanı)
- [x] Mobil dokunmatik kontrol (kaydırma)
- [x] Görsel cila (kayma, birleşme zıplaması, doğuş animasyonu)
- [x] Oyunu kaydetme (sayfa yenilenince kaldığı yerden)
- [x] Skor tablosuna takma ad
- [x] Ses efektleri
- [ ] Geri alma (undo)

### Yılan
- [x] Oynanabilir çekirdek döngü (delta tabanlı adım, yön kuyruğu)
- [x] Kazanma/kaybetme koşulu (duvar, kuyruk, tahtayı doldurma)
- [x] Skor, en iyi skor ve HUD
- [x] Duraklatma (Boşluk / Esc / P)
- [x] Mobil dokunmatik kontrol (kaydırma)
- [x] Görsel cila (yem nabzı, yeme halkası, ölümde sarsıntı, gövde gradyanı)
- [x] Skor tablosuna takma ad
- [x] Ses efektleri

### Lights Out, Hanoi, Mastermind, Hafıza, Wordle, Labirent, Sokoban, Top Sıralama
- [x] Hepsi oynanabilir, mobil uyumlu, sesli ve skor tablolu
- [x] Mantık katmanları saf TypeScript ve testli

### Sıradan bekleyen oyunlar (istenen listeden kalanlar)
- [ ] Connections tarzı kelime gruplama · Eşleştirme Oyunu · Tangram · Nonogram/Picross
- [ ] Kakuro · Boru Bağlama · Elektrik Devresi · Köprü Kurma · Su Borusu Yönlendirme
- [ ] Blok Yerleştirme · Rush Hour · Renk Sıralama · Su Şişesi · Match-3 · Candy Crush
- [ ] Zuma · Bubble Shooter · Mahjong · Solitaire · Spider · FreeCell
- [ ] Farkları Bul · Gizli Nesne · Resim Tamamlama · Matematik Bulmacası · Sayı Piramidi
- [ ] Mantık Kapıları · Şifre Çözme · Box Push · Laser Reflection · Aynalarla lazer
- [ ] Domino · Pentomino · Rubik küpü

## Skor tasarımı
Skor tablosu "yüksek olan iyidir" varsayar. Süreye dayalı oyunlarda (Sudoku, Mayın Tarlası,
15'li Puzzle) skor `taban puan + süre bonusu - ceza` biçiminde hesaplanır; böylece hızlı
bitiren yüksek puan alır ve bütün oyunlar aynı tabloda tutarlı kalır.

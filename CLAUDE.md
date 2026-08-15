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
  shared/
    base.css             # site geneli sıfırlama + tasarım değişkenleri
    games.ts             # oyun kataloğu (ana sayfa kartları buradan üretilir)
  home/                  # ana sayfa kodu ve stili
  games/<oyun>/
    main.ts              # Phaser config, oyun başlatma
    <oyun>.css           # o oyunun sayfa stili
    scenes/              # her sahne ayrı dosya
    systems/             # oyun mantığı, kayıt, girdi, HUD
    config/constants.ts  # sabitler: ölçü, süre, renk, kurallar
public/assets/           # görsel ve ses dosyaları
```

## Yeni oyun ekleme adımları
1. `games/<oyun>/index.html` oluştur; script etiketi `../../src/games/<oyun>/main.ts` göstersin.
2. `src/games/<oyun>/` altına main.ts + config/scenes/systems iskeletini kur.
3. `vite.config.ts` içindeki `rollupOptions.input`'a girdiyi ekle.
4. `src/shared/games.ts` içine katalog kaydını ekle (`status: 'ready'`).

## Kod kuralları
- Sihirli sayı yok. Tüm ayarlanabilir değerler ilgili oyunun `config/constants.ts` dosyasında adlandırılmış sabit olsun.
- Her sahne kendi dosyasında; sahne dosyaları 300 satırı geçerse sistemlere böl.
- Oyun mantığı Phaser'a mümkün olduğunca az bağlı olsun (test edilebilirlik için).
  Örnek: `Board2048` saf TypeScript, sahne yalnızca onu çizer.
- Hareket ve fizik `delta` zamanına göre hesaplansın, kare sayısına göre değil.
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
- [ ] Yayın (GitHub Pages)

### 2048
- [x] Oynanabilir çekirdek döngü (kaydırma + birleştirme)
- [x] Kazanma/kaybetme koşulu (2048'e ulaşma, hamle kalmaması)
- [x] Skor, en iyi skor ve HUD
- [x] Menü/yeniden başlatma (Yeni oyun, sonuç katmanı)
- [x] Mobil dokunmatik kontrol (kaydırma)
- [x] Görsel cila (kayma, birleşme zıplaması, doğuş animasyonu)
- [x] Oyunu kaydetme (sayfa yenilenince kaldığı yerden)
- [ ] Ses efektleri
- [ ] Geri alma (undo)

### Sıradaki oyunlar
- [ ] Yılan
- [ ] Hafıza kartları

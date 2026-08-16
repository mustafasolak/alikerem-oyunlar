import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'bulmaca',
  ad: "Kelime Bulmaca",
  ozet: "İpuçlarını oku, kesişen kelimeleri harf harf doldur.",
  aciklama: "İpuçlarını oku, kesişen kelimeleri harf harf doldur.",
  ipucu: "Kareye dokun, sonra harf seç · klavyeden de yazabilirsin · <kbd>Boşluk</kbd> yönü değiştirir",
  emoji: '📝',
  kategori: 'kelime',
  etiketler: ['Kelime', 'Mantık'],
  renk: ['#f472b6', '#be185d'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 400 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan kelime",
        id: "remaining",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0"
      }
    ],
    tusTakimi: true,
    paneller: [
      {
        id: "clues",
        baslik: "İpuçları",
        ic: "<div class=\"columns\">\n          <div><h2>Soldan sağa</h2><ul class=\"clue-list\" id=\"clues-across\"></ul></div>\n          <div><h2>Yukarıdan aşağıya</h2><ul class=\"clue-list\" id=\"clues-down\"></ul></div>\n        </div>"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'wordle',
  ad: "Wordle",
  ozet: "Altı hakta beş harfli gizli kelimeyi bul.",
  aciklama: "Altı hakta beş harfli kelimeyi bul.",
  ipucu: "Harfleri seç, <kbd>Gir</kbd> ile dene · yeşil doğru yerde, sarı kelimede var",
  emoji: '🟩',
  kategori: 'kelime',
  etiketler: ['Kelime', 'Tahmin'],
  renk: ['#4ade80', '#15803d'],
  tuval: { genislik: 420, yukseklik: 520, disPay: 330 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan hak",
        id: "tries",
        baslangic: "6"
      }
    ],
    tusTakimi: true
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

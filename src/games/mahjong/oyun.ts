import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'mahjong',
  ad: "Mahjong",
  ozet: "Kenarı açık aynı taşları eşleştirip tahtayı boşalt.",
  aciklama: "Serbest taşları ikişer ikişer eşleştir.",
  ipucu: "Kenarı açık taşlara dokun · aynı iki taş birlikte kalkar",
  emoji: '🀄',
  kategori: 'kagit',
  etiketler: ['Eşleştirme', 'Sakin'],
  renk: ['#4ade80', '#166534'],
  tuval: { genislik: 510, yukseklik: 450, disPay: 270 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan",
        id: "remaining",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0:00"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

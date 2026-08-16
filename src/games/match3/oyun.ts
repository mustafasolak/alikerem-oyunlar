import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'match3',
  ad: "Match-3",
  ozet: "Komşu taşları değiştir, üçlü dizip patlat.",
  aciklama: "Aynı renkten üç taneyi yan yana getir.",
  ipucu: "Komşu iki taşı yer değiştir · üç ve fazlası patlar",
  emoji: '💠',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Eşleştirme'],
  renk: ['#f472b6', '#be185d'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "20"
      },
      {
        etiket: "Hedef",
        id: "target",
        baslangic: "1000"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

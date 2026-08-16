import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'puzzle15',
  ad: "15'li Kaydırmalı Puzzle",
  ozet: "Karışan taşları kaydırarak 1’den 15’e sırala.",
  aciklama: "Taşları kaydırarak 1’den 15’e sırala.",
  ipucu: "Boşluğun yanındaki taşa dokun · ok tuşlarıyla da kaydırabilirsin",
  emoji: '🧩',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Sakin'],
  renk: ['#a78bfa', '#6d28d9'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

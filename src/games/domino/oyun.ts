import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'domino',
  ad: "Domino Bulmacası",
  ozet: "Taşları uç uca ekleyip bütün zinciri kur.",
  aciklama: "Domino taşlarını uç uca ekleyerek zinciri kur.",
  ipucu: "Elindeki taşa dokun, zincirin ucuna eklenir · uçlar tutmalı",
  emoji: '🁣',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Klasik'],
  renk: ['#fbbf24', '#92400e'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Elinde",
        id: "hand",
        baslangic: "7"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

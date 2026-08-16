import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'pentomino',
  ad: "Pentomino",
  ozet: "Beş kareli parçaları döndürüp kutuyu eksiksiz doldur.",
  aciklama: "Parçaları döndürüp kutuyu tamamen doldur.",
  ipucu: "Parçaya dokun → seç · tekrar dokun → döndür · tahtaya dokun → yerleştir",
  emoji: '🟪',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Zekâ'],
  renk: ['#c084fc', '#6b21a8'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan parça",
        id: "remaining",
        baslangic: "0"
      }
    ],
    aracCubugu: [
      {
        etiket: "Kolay",
        deger: "kolay"
      },
      {
        etiket: "Orta",
        deger: "orta"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

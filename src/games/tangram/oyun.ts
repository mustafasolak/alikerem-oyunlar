import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'tangram',
  ad: "Tangram",
  ozet: "Parçaları çevirip hedef şeklin tamamını kapla.",
  aciklama: "Parçaları döndürüp hedef şekli doldur.",
  ipucu: "Parçaya dokun → seç · tekrar dokun → döndür · tahtaya dokun → yerleştir",
  emoji: '🔶',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Şekil'],
  renk: ['#fb923c', '#9a3412'],
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

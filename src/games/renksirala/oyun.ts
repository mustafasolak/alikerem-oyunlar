import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'renksirala',
  ad: "Renk Sıralama",
  ozet: "Karışan renkleri sütunlara ayır.",
  aciklama: "Aynı renkleri aynı sütunda topla.",
  ipucu: "Sütuna dokun → üstteki parçayı al · başka sütuna dokun → bırak",
  emoji: '🎨',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Sakin'],
  renk: ['#f97316', '#9a3412'],
  tuval: { genislik: 510, yukseklik: 430, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
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
      },
      {
        etiket: "Zor",
        deger: "zor"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

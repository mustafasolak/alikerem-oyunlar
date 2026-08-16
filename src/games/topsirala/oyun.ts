import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'topsirala',
  ad: "Top Sıralama",
  ozet: "Renkli topları tüplere ayır, her tüp tek renk olsun.",
  aciklama: "Aynı renk topları aynı tüpte topla.",
  ipucu: "Tüpe dokun → üstteki topu al · başka tüpe dokun → bırak",
  emoji: '🫧',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Sakin'],
  renk: ['#22d3ee', '#0e7490'],
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

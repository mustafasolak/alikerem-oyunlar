import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'mantikkapi',
  ad: "Mantık Kapıları",
  ozet: "VE/VEYA/DEĞİL kapılarını çözüp hedef çıkışı yakala.",
  aciklama: "Girişleri ayarla, çıkış istenen değeri versin.",
  ipucu: "Giriş anahtarlarına dokun · hedef çıkışa ulaş",
  emoji: '⚡',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Zekâ'],
  renk: ['#22d3ee', '#0e7490'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 280 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hedef",
        id: "target",
        baslangic: "1"
      },
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

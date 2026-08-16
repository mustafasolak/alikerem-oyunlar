import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'suborusu',
  ad: "Su Borusu Yönlendirme",
  ozet: "Boruları döndürerek suyu kaynaktan depoya ulaştır.",
  aciklama: "Boruları çevir, suyu depoya ulaştır.",
  ipucu: "Boruya dokun → 90° döner · su kaynaktan depoya akmalı",
  emoji: '🚰',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Bağlantı'],
  renk: ['#38bdf8', '#0369a1'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 290 },
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

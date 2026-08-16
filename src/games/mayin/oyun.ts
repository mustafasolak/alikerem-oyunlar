import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'mayin',
  ad: "Mayın Tarlası",
  ozet: "Sayıları oku, mayınları bayrakla, tarlayı temizle.",
  aciklama: "Sayıları oku, mayınlara basmadan tarlayı temizle.",
  ipucu: "Tıkla → aç · sağ tık (mobilde uzun bas) → bayrak · ilk tıklaman asla mayına gelmez",
  emoji: '💣',
  kategori: 'mantik',
  etiketler: ['Mantık', 'Sabır'],
  renk: ['#f87171', '#b91c1c'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 285 },
  arayuz: {
    rozetler: [
      {
        etiket: "Bayrak",
        id: "flags",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
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

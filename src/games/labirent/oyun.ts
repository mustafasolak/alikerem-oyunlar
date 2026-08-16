import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'labirent',
  ad: "Labirent",
  ozet: "Rastgele üretilen labirentte çıkışa ulaş.",
  aciklama: "Başlangıçtan çıkışa giden yolu bul.",
  ipucu: "Ok tuşları / WASD ya da alttaki tuşlar · mobilde parmağını kaydır",
  emoji: '🧭',
  kategori: 'mantik',
  etiketler: ['Bulmaca', 'Keşif'],
  renk: ['#34d399', '#065f46'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 300 },
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
    ],
    pad: [
      {
        etiket: "←",
        deger: "left"
      },
      {
        etiket: "↑",
        deger: "up"
      },
      {
        etiket: "↓",
        deger: "down"
      },
      {
        etiket: "→",
        deger: "right"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'susise',
  ad: "Su Şişesi Renk Ayırma",
  ozet: "Renkli suları dökerek her şişeyi tek renk yap.",
  aciklama: "Renkli suları doğru şişelerde topla.",
  ipucu: "Şişeye dokun → üstteki suyu al · başka şişeye dokun → dök",
  emoji: '🧪',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Sakin'],
  renk: ['#38bdf8', '#075985'],
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

import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'solitaire',
  ad: "Solitaire",
  ozet: "Klasik Klondike: dört rengi as’tan şaha diz.",
  aciklama: "Kartları dört köşeye asten şaha sırala.",
  ipucu: "Karta dokun → seç · hedefe dokun → taşı · desteye dokun → yeni kart · <kbd>Z</kbd> ya da <b>Geri al</b>",
  emoji: '🃏',
  kategori: 'kagit',
  etiketler: ['Kâğıt', 'Klasik'],
  renk: ['#4ade80', '#15803d'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 306 },
  arayuz: {
    rozetler: [
      {
        etiket: "Temel",
        id: "foundation",
        baslangic: "0/52"
      },
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      }
    ],
    pad: [{ etiket: '↩︎ Geri al', deger: 'geri' }]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

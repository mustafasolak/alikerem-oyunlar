import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'balonpatlat',
  ad: "Bubble Shooter",
  ozet: "Balonları nişanla, üçlü grupları patlat.",
  aciklama: "Balonu nişanla, üç aynı renk patlat.",
  ipucu: "Dokunduğun yöne atar · üç ve fazlası aynı renk patlar",
  emoji: '🎈',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Nişan'],
  renk: ['#38bdf8', '#0369a1'],
  tuval: { genislik: 510, yukseklik: 660, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan atış",
        id: "shots",
        baslangic: "30"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

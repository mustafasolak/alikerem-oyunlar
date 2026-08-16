import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'zuma',
  ad: "Zuma",
  ozet: "İlerleyen top zincirini üçlü gruplar patlatarak durdur.",
  aciklama: "Zincire top at, üç aynı rengi patlat.",
  ipucu: "Nişanla dokun → top atılır · üç aynı renk patlar",
  emoji: '🐸',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Nişan'],
  renk: ['#a3e635', '#4d7c0f'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Zincir",
        id: "chain",
        baslangic: "0"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

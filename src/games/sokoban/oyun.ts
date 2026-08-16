import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'sokoban',
  ad: "Sokoban",
  ozet: "Kutuları iterek hedeflere yerleştir.",
  aciklama: "Kutuları hedef noktalara it.",
  ipucu: "Ok tuşları / alttaki tuşlar · kutuyu ancak itebilirsin, çekemezsin",
  emoji: '📦',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Klasik'],
  renk: ['#fb923c', '#9a3412'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 310 },
  arayuz: {
    rozetler: [
      {
        etiket: "Bölüm",
        id: "level",
        baslangic: "1"
      },
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
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
      },
      {
        etiket: "↺ Geri",
        deger: "undo"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'kutuitme',
  ad: "Box Push",
  ozet: "Sokoban’ın farklı bölümleri: kutuları hedeflere it.",
  aciklama: "Kutuları hedeflere it.",
  ipucu: "Ok tuşları / alttaki tuşlar · kutuyu ancak itebilirsin",
  emoji: '🧰',
  kategori: 'yerlestirme',
  etiketler: ['Mantık', 'Klasik'],
  renk: ['#94a3b8', '#475569'],
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

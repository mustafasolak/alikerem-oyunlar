import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'tetris',
  ad: "Tetris",
  ozet: "Düşen blokları yerleştir, satırları doldurup temizle.",
  aciklama: "Düşen blokları çevir, satırları doldurup temizle.",
  ipucu: "<kbd>←</kbd> <kbd>→</kbd> kaydır · <kbd>↑</kbd> çevir · <kbd>↓</kbd> hızlandır · <kbd>Boşluk</kbd> bırak · <kbd>P</kbd> duraklat · mobilde alttaki tuşlar veya kaydırma",
  emoji: '🧱',
  kategori: 'arcade',
  etiketler: ['Arcade', 'Refleks'],
  renk: ['#22d3ee', '#0e7490'],
  tuval: { genislik: 410, yukseklik: 536, disPay: 300 },
  arayuz: {
    rozetler: [
      {
        etiket: "Seviye",
        id: "level",
        baslangic: "1"
      },
      {
        etiket: "Satır",
        id: "lines",
        baslangic: "0"
      }
    ],
    pad: [
      {
        etiket: "←",
        deger: "left"
      },
      {
        etiket: "⟳",
        deger: "rotate"
      },
      {
        etiket: "→",
        deger: "right"
      },
      {
        etiket: "↓",
        deger: "soft"
      },
      {
        etiket: "⇓ Bırak",
        deger: "drop"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

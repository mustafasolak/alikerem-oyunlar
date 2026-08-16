import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'orumcek',
  ad: "Spider Solitaire",
  ozet: "Şahtan as’a inen dizileri tamamlayıp tahtayı boşalt.",
  aciklama: "Aynı renkten şahtan asa dizileri tamamla.",
  ipucu: "Karta dokun → seç · sütuna dokun → taşı · desteye dokun → yeni sıra · <kbd>Z</kbd> ya da <b>Geri al</b>",
  emoji: '🕷️',
  kategori: 'kagit',
  etiketler: ['Kâğıt', 'Sabır'],
  renk: ['#a78bfa', '#5b21b6'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 306 },
  arayuz: {
    rozetler: [
      {
        etiket: "Tamamlanan",
        id: "done",
        baslangic: "0/8"
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

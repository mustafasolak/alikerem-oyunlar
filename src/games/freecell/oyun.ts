import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'freecell',
  ad: "FreeCell",
  ozet: "Dört boş hücreyi akıllı kullan, bütün kartları sırala.",
  aciklama: "Boş hücreleri kullanarak kartları sırala.",
  ipucu: "Karta dokun → seç · boş hücre ya da sütuna dokun → taşı · sıralı diziyi tek seferde taşıyabilirsin · <kbd>Z</kbd> ya da <b>Geri al</b>",
  emoji: '🂡',
  kategori: 'kagit',
  etiketler: ['Kâğıt', 'Mantık'],
  renk: ['#38bdf8', '#0369a1'],
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

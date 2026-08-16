import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'blok',
  ad: "Blok Yerleştirme",
  ozet: "Blokları yerleştir, satır ve sütunları doldurup temizle.",
  aciklama: "Blokları tahtaya yerleştir, satır/sütun doldur.",
  ipucu: "Alttan blok seç, tahtada yerine dokun · dolan satır ve sütunlar temizlenir",
  emoji: '🧱',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Sakin'],
  renk: ['#a78bfa', '#6d28d9'],
  tuval: { genislik: 510, yukseklik: 700, disPay: 250 },
  arayuz: {
    rozetler: [
      {
        etiket: "Temizlenen",
        id: "cleared",
        baslangic: "0"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

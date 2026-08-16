import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'kelimeavi',
  ad: "Kelime Avı",
  ozet: "Harf karmaşasında gizlenen kelimeleri bul ve işaretle.",
  aciklama: "Harflerin arasına gizlenen kelimeleri bul.",
  ipucu: "İlk harften son harfe doğru parmağını/fareyi sürükle · kelimeler her yöne gizlenmiş olabilir",
  emoji: '🔎',
  kategori: 'kelime',
  etiketler: ['Kelime', 'Dikkat'],
  renk: ['#2dd4bf', '#0f766e'],
  tuval: { genislik: 510, yukseklik: 510, disPay: 300 },
  arayuz: {
    rozetler: [
      {
        etiket: "Kalan",
        id: "remaining",
        baslangic: "0"
      },
      {
        etiket: "Süre",
        id: "timer",
        baslangic: "0"
      }
    ],
    paneller: [
      {
        id: "words",
        baslik: "Aranan kelimeler",
        ic: "<ul class=\"word-list\" id=\"word-list\"></ul>"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

import { tanim } from '../../cekirdek/tanim.ts'

export default tanim({
  id: 'rubik',
  ad: "Rubik Küpü",
  ozet: "Açılmış küpte yüzleri çevirip altı rengi topla.",
  aciklama: "Küpün altı yüzünü de tek renge getir.",
  ipucu: "Alttaki tuşlarla yüzleri çevir · her yüz tek renk olmalı",
  emoji: '🧊',
  kategori: 'yerlestirme',
  etiketler: ['Bulmaca', 'Zekâ'],
  renk: ['#fb923c', '#9a3412'],
  tuval: { genislik: 510, yukseklik: 400, disPay: 310 },
  arayuz: {
    rozetler: [
      {
        etiket: "Hamle",
        id: "moves",
        baslangic: "0"
      },
      {
        etiket: "Doğru yüz",
        id: "faces",
        baslangic: "0/6"
      }
    ],
    aracCubugu: [
      {
        etiket: "Kolay",
        deger: "kolay"
      },
      {
        etiket: "Orta",
        deger: "orta"
      },
      {
        etiket: "Zor",
        deger: "zor"
      }
    ],
    pad: [
      {
        etiket: "U",
        deger: "U"
      },
      {
        etiket: "U′",
        deger: "U'"
      },
      {
        etiket: "D",
        deger: "D"
      },
      {
        etiket: "D′",
        deger: "D'"
      },
      {
        etiket: "L",
        deger: "L"
      },
      {
        etiket: "L′",
        deger: "L'"
      },
      {
        etiket: "R",
        deger: "R"
      },
      {
        etiket: "R′",
        deger: "R'"
      },
      {
        etiket: "F",
        deger: "F"
      },
      {
        etiket: "F′",
        deger: "F'"
      },
      {
        etiket: "B",
        deger: "B"
      },
      {
        etiket: "B′",
        deger: "B'"
      }
    ]
  },
  sahne: () => import('./scenes/GameScene.ts'),
})

/* OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: src/games/**\/oyun.ts
 * Yeniden üretmek için: npm run katalog
 */

import type { KatalogKaydi } from '../cekirdek/tanim.ts'

export const KATALOG: KatalogKaydi[] = [
  {
    "id": "puzzle15",
    "ad": "15'li Kaydırmalı Puzzle",
    "ozet": "Karışan taşları kaydırarak 1’den 15’e sırala.",
    "aciklama": "Taşları kaydırarak 1’den 15’e sırala.",
    "ipucu": "Boşluğun yanındaki taşa dokun · ok tuşlarıyla da kaydırabilirsin",
    "emoji": "🧩",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Sakin"
    ],
    "renk": [
      "#a78bfa",
      "#6d28d9"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "game2048",
    "ad": "2048",
    "ozet": "Kareleri kaydır, aynı sayıları birleştir ve 2048 karesine ulaş.",
    "aciklama": "Aynı sayıları birleştir, <strong>2048</strong> karesine ulaş.",
    "ipucu": "<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> veya <kbd>WASD</kbd> ile oyna · mobilde parmağını kaydır",
    "emoji": "🔢",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Tek kişilik"
    ],
    "renk": [
      "#edc22e",
      "#f2b179"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 215
    }
  },
  {
    "id": "asmaca",
    "ad": "Adam Asmaca",
    "ozet": "Harf tahmin et, altı hakkın bitmeden kelimeyi çöz.",
    "aciklama": "Harfleri tahmin et, altı hakkın bitmeden kelimeyi çöz.",
    "ipucu": "Harfe dokun ya da klavyeden bas · her yanlış tahmin bir hak götürür",
    "emoji": "🪢",
    "kategori": "kelime",
    "etiketler": [
      "Kelime",
      "Tahmin"
    ],
    "renk": [
      "#fbbf24",
      "#b45309"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 560,
      "disPay": 375
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan hak",
          "id": "lives",
          "baslangic": "6"
        },
        {
          "etiket": "İpucu",
          "id": "category",
          "baslangic": "—"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "arabacikar",
    "ad": "Araba Çıkarma",
    "ozet": "Trafiği çözüp kırmızı arabayı çıkışa ulaştır.",
    "aciklama": "Kırmızı arabayı çıkışa ulaştır.",
    "ipucu": "Arabaya dokun, sonra gideceği yöne dokun · araçlar yalnız kendi ekseninde kayar",
    "emoji": "🚗",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Klasik"
    ],
    "renk": [
      "#f87171",
      "#991b1b"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Bölüm",
          "id": "level",
          "baslangic": "1"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "ayna",
    "ad": "Aynalarla Lazer",
    "ozet": "Ayna açılarını ayarlayıp ışığı hedeflerden geçir.",
    "aciklama": "Ayna açılarını ayarla, ışığı hedefe taşı.",
    "ipucu": "Aynaya dokun → yönü değişir · ışık bütün hedeflerden geçmeli",
    "emoji": "🪞",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Işık"
    ],
    "renk": [
      "#c084fc",
      "#6b21a8"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "blok",
    "ad": "Blok Yerleştirme",
    "ozet": "Blokları yerleştir, satır ve sütunları doldurup temizle.",
    "aciklama": "Blokları tahtaya yerleştir, satır/sütun doldur.",
    "ipucu": "Alttan blok seç, tahtada yerine dokun · dolan satır ve sütunlar temizlenir",
    "emoji": "🧱",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Sakin"
    ],
    "renk": [
      "#a78bfa",
      "#6d28d9"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Temizlenen",
          "id": "cleared",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "boru",
    "ad": "Boru Bağlama",
    "ozet": "Boruları çevirip kaynaktan hedefe kesintisiz yol kur.",
    "aciklama": "Boruları çevir, kaynaktan hedefe yol aç.",
    "ipucu": "Boruya dokun → 90° döner · bütün borular bağlanınca biter",
    "emoji": "🔧",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Bağlantı"
    ],
    "renk": [
      "#a3e635",
      "#4d7c0f"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "kutuitme",
    "ad": "Box Push",
    "ozet": "Sokoban’ın farklı bölümleri: kutuları hedeflere it.",
    "aciklama": "Kutuları hedeflere it.",
    "ipucu": "Ok tuşları / alttaki tuşlar · kutuyu ancak itebilirsin",
    "emoji": "🧰",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Klasik"
    ],
    "renk": [
      "#94a3b8",
      "#475569"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 310
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Bölüm",
          "id": "level",
          "baslangic": "1"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "pad": [
        {
          "etiket": "←",
          "deger": "left"
        },
        {
          "etiket": "↑",
          "deger": "up"
        },
        {
          "etiket": "↓",
          "deger": "down"
        },
        {
          "etiket": "→",
          "deger": "right"
        },
        {
          "etiket": "↺ Geri",
          "deger": "undo"
        }
      ]
    }
  },
  {
    "id": "balonpatlat",
    "ad": "Bubble Shooter",
    "ozet": "Balonları nişanla, üçlü grupları patlat.",
    "aciklama": "Balonu nişanla, üç aynı renk patlat.",
    "ipucu": "Dokunduğun yöne atar · üç ve fazlası aynı renk patlar",
    "emoji": "🎈",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Nişan"
    ],
    "renk": [
      "#38bdf8",
      "#0369a1"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 660,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan atış",
          "id": "shots",
          "baslangic": "30"
        }
      ]
    }
  },
  {
    "id": "domino",
    "ad": "Domino Bulmacası",
    "ozet": "Taşları uç uca ekleyip bütün zinciri kur.",
    "aciklama": "Domino taşlarını uç uca ekleyerek zinciri kur.",
    "ipucu": "Elindeki taşa dokun, zincirin ucuna eklenir · uçlar tutmalı",
    "emoji": "🁣",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Klasik"
    ],
    "renk": [
      "#fbbf24",
      "#92400e"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Elinde",
          "id": "hand",
          "baslangic": "7"
        }
      ]
    }
  },
  {
    "id": "devre",
    "ad": "Elektrik Devresi",
    "ozet": "Kabloları döndürüp akımı bütün ampullere ulaştır.",
    "aciklama": "Kabloları çevir, akımı ampullere ulaştır.",
    "ipucu": "Kabloya dokun → 90° döner · bütün ampuller yanınca biter",
    "emoji": "💡",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Bağlantı"
    ],
    "renk": [
      "#facc15",
      "#a16207"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "eslestirme",
    "ad": "Eşleştirme Oyunu",
    "ozet": "Hayvan-yavrusu, ülke-başkent gibi ikilileri eşleştir.",
    "aciklama": "Solla sağı doğru eşleştir.",
    "ipucu": "Soldan bir kart seç, sağdan eşini seç",
    "emoji": "🔗",
    "kategori": "kagit",
    "etiketler": [
      "Bilgi",
      "Eşleştirme"
    ],
    "renk": [
      "#fb7185",
      "#9f1239"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "6"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ]
    }
  },
  {
    "id": "farkbul",
    "ad": "Farkları Bul",
    "ozet": "İki desen arasındaki beş farkı bul.",
    "aciklama": "İki resim arasındaki farkları bul.",
    "ipucu": "Farklı gördüğün şekle dokun · beş fark var",
    "emoji": "🔍",
    "kategori": "dikkat",
    "etiketler": [
      "Dikkat",
      "Gözlem"
    ],
    "renk": [
      "#2dd4bf",
      "#0f766e"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 260
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Bulunan",
          "id": "found",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ]
    }
  },
  {
    "id": "freecell",
    "ad": "FreeCell",
    "ozet": "Dört boş hücreyi akıllı kullan, bütün kartları sırala.",
    "aciklama": "Boş hücreleri kullanarak kartları sırala.",
    "ipucu": "Karta dokun → seç · boş hücre ya da sütuna dokun → taşı",
    "emoji": "🂡",
    "kategori": "kagit",
    "etiketler": [
      "Kâğıt",
      "Mantık"
    ],
    "renk": [
      "#38bdf8",
      "#0369a1"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Temel",
          "id": "foundation",
          "baslangic": "0/52"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "gizlinesne",
    "ad": "Gizli Nesne",
    "ozet": "Kalabalığın içine saklanan nesneleri bul.",
    "aciklama": "Listedeki nesneleri kalabalıkta bul.",
    "ipucu": "Aranan nesneye dokun · yanlış dokunuş süre götürür",
    "emoji": "🔎",
    "kategori": "dikkat",
    "etiketler": [
      "Dikkat",
      "Gözlem"
    ],
    "renk": [
      "#f472b6",
      "#9d174d"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 320
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "paneller": [
        {
          "id": "wanted",
          "baslik": "Aranan nesneler",
          "ic": "<ul class=\"word-list\" id=\"wanted-list\"></ul>"
        }
      ]
    }
  },
  {
    "id": "hafiza",
    "ad": "Hafıza Kartları",
    "ozet": "Kartları çevir, eşleri bul, en az hamleyle bitir.",
    "aciklama": "Kartları çevir, eşleri bul, hepsini aç.",
    "ipucu": "Karta dokun, eşini bul · iki kart tutmazsa kapanır",
    "emoji": "🃏",
    "kategori": "kagit",
    "etiketler": [
      "Hafıza",
      "Sakin"
    ],
    "renk": [
      "#c084fc",
      "#6b21a8"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 265
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Çift",
          "id": "pairs",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "hanoi",
    "ad": "Hanoi Kuleleri",
    "ozet": "Diskleri kurallara uyarak son çubuğa taşı.",
    "aciklama": "Diskleri son çubuğa taşı; büyük disk küçüğün üstüne gelemez.",
    "ipucu": "Diski al, hedef çubuğa dokun · büyük disk küçüğün üstüne konamaz",
    "emoji": "🗼",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Klasik"
    ],
    "renk": [
      "#38bdf8",
      "#0369a1"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 420,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "En az",
          "id": "best-moves",
          "baslangic": "7"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "3 disk",
          "deger": "3"
        },
        {
          "etiket": "4 disk",
          "deger": "4"
        },
        {
          "etiket": "5 disk",
          "deger": "5"
        },
        {
          "etiket": "6 disk",
          "deger": "6"
        }
      ]
    }
  },
  {
    "id": "kakuro",
    "ad": "Kakuro",
    "ozet": "Rakamları topla, her dizinin hedefini tuttur.",
    "aciklama": "Her diziyi verilen toplama ulaşacak rakamlarla doldur.",
    "ipucu": "Kareye dokun, rakam seç · bir dizide aynı rakam iki kez geçemez",
    "emoji": "➕",
    "kategori": "mantik",
    "etiketler": [
      "Matematik",
      "Mantık"
    ],
    "renk": [
      "#4ade80",
      "#15803d"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 340
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "kelimeavi",
    "ad": "Kelime Avı",
    "ozet": "Harf karmaşasında gizlenen kelimeleri bul ve işaretle.",
    "aciklama": "Harflerin arasına gizlenen kelimeleri bul.",
    "ipucu": "İlk harften son harfe doğru parmağını/fareyi sürükle · kelimeler her yöne gizlenmiş olabilir",
    "emoji": "🔎",
    "kategori": "kelime",
    "etiketler": [
      "Kelime",
      "Dikkat"
    ],
    "renk": [
      "#2dd4bf",
      "#0f766e"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 300
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0"
        }
      ],
      "paneller": [
        {
          "id": "words",
          "baslik": "Aranan kelimeler",
          "ic": "<ul class=\"word-list\" id=\"word-list\"></ul>"
        }
      ]
    }
  },
  {
    "id": "bulmaca",
    "ad": "Kelime Bulmaca",
    "ozet": "İpuçlarını oku, kesişen kelimeleri harf harf doldur.",
    "aciklama": "İpuçlarını oku, kesişen kelimeleri harf harf doldur.",
    "ipucu": "Kareye dokun, sonra harf seç · klavyeden de yazabilirsin · <kbd>Boşluk</kbd> yönü değiştirir",
    "emoji": "📝",
    "kategori": "kelime",
    "etiketler": [
      "Kelime",
      "Mantık"
    ],
    "renk": [
      "#f472b6",
      "#be185d"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 400
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan kelime",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0"
        }
      ],
      "tusTakimi": true,
      "paneller": [
        {
          "id": "clues",
          "baslik": "İpuçları",
          "ic": "<div class=\"columns\">\n          <div><h2>Soldan sağa</h2><ul class=\"clue-list\" id=\"clues-across\"></ul></div>\n          <div><h2>Yukarıdan aşağıya</h2><ul class=\"clue-list\" id=\"clues-down\"></ul></div>\n        </div>"
        }
      ]
    }
  },
  {
    "id": "gruplama",
    "ad": "Kelime Gruplama",
    "ozet": "On altı kelimeden ortak özellikli dörtlüleri bul.",
    "aciklama": "On altı kelimeyi dörder dörder grupla.",
    "ipucu": "Dört kelime seç, 'Dene' ile onayla · üç hata hakkın var",
    "emoji": "🧩",
    "kategori": "kelime",
    "etiketler": [
      "Kelime",
      "Mantık"
    ],
    "renk": [
      "#facc15",
      "#a16207"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 550,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan grup",
          "id": "remaining",
          "baslangic": "4"
        },
        {
          "etiket": "Hata",
          "id": "mistakes",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "kopru",
    "ad": "Köprü Kurma",
    "ozet": "Her adayı üstündeki sayı kadar köprüyle bağla.",
    "aciklama": "Adaları sayısı kadar köprüyle bağla.",
    "ipucu": "İki adaya sırayla dokun → köprü kurulur · tekrar dokun → ikinci köprü, bir daha → kaldırır",
    "emoji": "🌉",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Bağlantı"
    ],
    "renk": [
      "#38bdf8",
      "#0c4a6e"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "labirent",
    "ad": "Labirent",
    "ozet": "Rastgele üretilen labirentte çıkışa ulaş.",
    "aciklama": "Başlangıçtan çıkışa giden yolu bul.",
    "ipucu": "Ok tuşları / WASD ya da alttaki tuşlar · mobilde parmağını kaydır",
    "emoji": "🧭",
    "kategori": "mantik",
    "etiketler": [
      "Bulmaca",
      "Keşif"
    ],
    "renk": [
      "#34d399",
      "#065f46"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 300
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ],
      "pad": [
        {
          "etiket": "←",
          "deger": "left"
        },
        {
          "etiket": "↑",
          "deger": "up"
        },
        {
          "etiket": "↓",
          "deger": "down"
        },
        {
          "etiket": "→",
          "deger": "right"
        }
      ]
    }
  },
  {
    "id": "lazer",
    "ad": "Laser Reflection",
    "ozet": "Aynaları çevirerek lazer ışınını hedefe düşür.",
    "aciklama": "Aynaları çevir, lazeri hedefe ulaştır.",
    "ipucu": "Aynaya dokun → yönü değişir · lazer hedefe ulaşmalı",
    "emoji": "🔺",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Işık"
    ],
    "renk": [
      "#f87171",
      "#b91c1c"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "lightsout",
    "ad": "Lights Out",
    "ozet": "Bir kareye bas, komşuları da değişsin. Bütün ışıkları söndür.",
    "aciklama": "Bir kareye bas, kendisi ve komşuları değişsin. Hepsini söndür.",
    "ipucu": "Kareye dokun · basınca kendisi ve dört komşusu yanıp söner",
    "emoji": "💡",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Sakin"
    ],
    "renk": [
      "#facc15",
      "#a16207"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "mahjong",
    "ad": "Mahjong",
    "ozet": "Kenarı açık aynı taşları eşleştirip tahtayı boşalt.",
    "aciklama": "Serbest taşları ikişer ikişer eşleştir.",
    "ipucu": "Kenarı açık taşlara dokun · aynı iki taş birlikte kalkar",
    "emoji": "🀄",
    "kategori": "kagit",
    "etiketler": [
      "Eşleştirme",
      "Sakin"
    ],
    "renk": [
      "#4ade80",
      "#166534"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 450,
      "disPay": 270
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ]
    }
  },
  {
    "id": "mantikkapi",
    "ad": "Mantık Kapıları",
    "ozet": "VE/VEYA/DEĞİL kapılarını çözüp hedef çıkışı yakala.",
    "aciklama": "Girişleri ayarla, çıkış istenen değeri versin.",
    "ipucu": "Giriş anahtarlarına dokun · hedef çıkışa ulaş",
    "emoji": "⚡",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Zekâ"
    ],
    "renk": [
      "#22d3ee",
      "#0e7490"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hedef",
          "id": "target",
          "baslangic": "1"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "mastermind",
    "ad": "Mastermind",
    "ozet": "Gizli renk dizisini ipuçlarıyla adım adım çöz.",
    "aciklama": "Gizli renk dizisini ipuçlarına bakarak çöz.",
    "ipucu": "Alttaki renklere dokunup sırayı doldur · ● doğru yerde, ○ renk var ama yeri yanlış",
    "emoji": "🎯",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Tahmin"
    ],
    "renk": [
      "#f472b6",
      "#9d174d"
    ],
    "tuval": {
      "genislik": 460,
      "yukseklik": 560,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan hak",
          "id": "tries",
          "baslangic": "10"
        }
      ]
    }
  },
  {
    "id": "match3",
    "ad": "Match-3",
    "ozet": "Komşu taşları değiştir, üçlü dizip patlat.",
    "aciklama": "Aynı renkten üç taneyi yan yana getir.",
    "ipucu": "Komşu iki taşı yer değiştir · üç ve fazlası patlar",
    "emoji": "💠",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Eşleştirme"
    ],
    "renk": [
      "#f472b6",
      "#be185d"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "20"
        },
        {
          "etiket": "Hedef",
          "id": "target",
          "baslangic": "1000"
        }
      ]
    }
  },
  {
    "id": "matematik",
    "ad": "Matematik Bulmacası",
    "ozet": "Verilen sayıları işlemlerle birleştirip hedefi yakala.",
    "aciklama": "Verilen sayılarla hedefe ulaş.",
    "ipucu": "İki sayı ve bir işlem seç · sonuç yeni sayı olur, hedefe ulaş",
    "emoji": "➗",
    "kategori": "mantik",
    "etiketler": [
      "Matematik",
      "Zekâ"
    ],
    "renk": [
      "#60a5fa",
      "#1e40af"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 300
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hedef",
          "id": "target",
          "baslangic": "0"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "mayin",
    "ad": "Mayın Tarlası",
    "ozet": "Sayıları oku, mayınları bayrakla, tarlayı temizle.",
    "aciklama": "Sayıları oku, mayınlara basmadan tarlayı temizle.",
    "ipucu": "Tıkla → aç · sağ tık (mobilde uzun bas) → bayrak · ilk tıklaman asla mayına gelmez",
    "emoji": "💣",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Sabır"
    ],
    "renk": [
      "#f87171",
      "#b91c1c"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 285
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Bayrak",
          "id": "flags",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "nonogram",
    "ad": "Nonogram",
    "ozet": "Kenardaki ipuçlarına göre resmi ortaya çıkar.",
    "aciklama": "Kenardaki sayılara göre doğru kareleri boya.",
    "ipucu": "Kareye dokun → boya · uzun bas / sağ tık → çarpı koy",
    "emoji": "🔲",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Resim"
    ],
    "renk": [
      "#e879f9",
      "#86198f"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "5×5",
          "deger": "kolay"
        },
        {
          "etiket": "10×10",
          "deger": "orta"
        },
        {
          "etiket": "15×15",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "pentomino",
    "ad": "Pentomino",
    "ozet": "Beş kareli parçaları döndürüp kutuyu eksiksiz doldur.",
    "aciklama": "Parçaları döndürüp kutuyu tamamen doldur.",
    "ipucu": "Parçaya dokun → seç · tekrar dokun → döndür · tahtaya dokun → yerleştir",
    "emoji": "🟪",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Zekâ"
    ],
    "renk": [
      "#c084fc",
      "#6b21a8"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan parça",
          "id": "remaining",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        }
      ]
    }
  },
  {
    "id": "renksirala",
    "ad": "Renk Sıralama",
    "ozet": "Karışan renkleri sütunlara ayır.",
    "aciklama": "Aynı renkleri aynı sütunda topla.",
    "ipucu": "Sütuna dokun → üstteki parçayı al · başka sütuna dokun → bırak",
    "emoji": "🎨",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Sakin"
    ],
    "renk": [
      "#f97316",
      "#9a3412"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 430,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "resimtamamla",
    "ad": "Resim Tamamlama",
    "ozet": "Resimden eksilen parçayı seçeneklerden bul.",
    "aciklama": "Resimden çıkan parçayı seçeneklerden bul.",
    "ipucu": "Altındaki seçeneklerden doğru parçaya dokun",
    "emoji": "🖼️",
    "kategori": "dikkat",
    "etiketler": [
      "Dikkat",
      "Gözlem"
    ],
    "renk": [
      "#38bdf8",
      "#0369a1"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Tur",
          "id": "round",
          "baslangic": "1"
        },
        {
          "etiket": "Hata",
          "id": "mistakes",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "rubik",
    "ad": "Rubik Küpü",
    "ozet": "Açılmış küpte yüzleri çevirip altı rengi topla.",
    "aciklama": "Küpün altı yüzünü de tek renge getir.",
    "ipucu": "Alttaki tuşlarla yüzleri çevir · her yüz tek renk olmalı",
    "emoji": "🧊",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Zekâ"
    ],
    "renk": [
      "#fb923c",
      "#9a3412"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 400,
      "disPay": 310
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        },
        {
          "etiket": "Doğru yüz",
          "id": "faces",
          "baslangic": "0/6"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ],
      "pad": [
        {
          "etiket": "U",
          "deger": "U"
        },
        {
          "etiket": "U′",
          "deger": "U'"
        },
        {
          "etiket": "D",
          "deger": "D"
        },
        {
          "etiket": "D′",
          "deger": "D'"
        },
        {
          "etiket": "L",
          "deger": "L"
        },
        {
          "etiket": "L′",
          "deger": "L'"
        },
        {
          "etiket": "R",
          "deger": "R"
        },
        {
          "etiket": "R′",
          "deger": "R'"
        },
        {
          "etiket": "F",
          "deger": "F"
        },
        {
          "etiket": "F′",
          "deger": "F'"
        },
        {
          "etiket": "B",
          "deger": "B"
        },
        {
          "etiket": "B′",
          "deger": "B'"
        }
      ]
    }
  },
  {
    "id": "sayipiramidi",
    "ad": "Sayı Piramidi",
    "ozet": "Her taş altındaki iki taşın toplamı; eksikleri tamamla.",
    "aciklama": "Her taş, altındaki iki taşın toplamı olsun.",
    "ipucu": "Boş taşa dokun, rakamları yaz · her taş altındaki ikisinin toplamı",
    "emoji": "🔺",
    "kategori": "mantik",
    "etiketler": [
      "Matematik",
      "Mantık"
    ],
    "renk": [
      "#fbbf24",
      "#b45309"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 450,
      "disPay": 330
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "sokoban",
    "ad": "Sokoban",
    "ozet": "Kutuları iterek hedeflere yerleştir.",
    "aciklama": "Kutuları hedef noktalara it.",
    "ipucu": "Ok tuşları / alttaki tuşlar · kutuyu ancak itebilirsin, çekemezsin",
    "emoji": "📦",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Klasik"
    ],
    "renk": [
      "#fb923c",
      "#9a3412"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 310
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Bölüm",
          "id": "level",
          "baslangic": "1"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "pad": [
        {
          "etiket": "←",
          "deger": "left"
        },
        {
          "etiket": "↑",
          "deger": "up"
        },
        {
          "etiket": "↓",
          "deger": "down"
        },
        {
          "etiket": "→",
          "deger": "right"
        },
        {
          "etiket": "↺ Geri",
          "deger": "undo"
        }
      ]
    }
  },
  {
    "id": "solitaire",
    "ad": "Solitaire",
    "ozet": "Klasik Klondike: dört rengi as’tan şaha diz.",
    "aciklama": "Kartları dört köşeye asten şaha sırala.",
    "ipucu": "Karta dokun → seç · hedefe dokun → taşı · desteye dokun → yeni kart",
    "emoji": "🃏",
    "kategori": "kagit",
    "etiketler": [
      "Kâğıt",
      "Klasik"
    ],
    "renk": [
      "#4ade80",
      "#15803d"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Temel",
          "id": "foundation",
          "baslangic": "0/52"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "orumcek",
    "ad": "Spider Solitaire",
    "ozet": "Şahtan as’a inen dizileri tamamlayıp tahtayı boşalt.",
    "aciklama": "Aynı renkten şahtan asa dizileri tamamla.",
    "ipucu": "Karta dokun → seç · sütuna dokun → taşı · desteye dokun → yeni sıra",
    "emoji": "🕷️",
    "kategori": "kagit",
    "etiketler": [
      "Kâğıt",
      "Sabır"
    ],
    "renk": [
      "#a78bfa",
      "#5b21b6"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Tamamlanan",
          "id": "done",
          "baslangic": "0/8"
        },
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ]
    }
  },
  {
    "id": "suborusu",
    "ad": "Su Borusu Yönlendirme",
    "ozet": "Boruları döndürerek suyu kaynaktan depoya ulaştır.",
    "aciklama": "Boruları çevir, suyu depoya ulaştır.",
    "ipucu": "Boruya dokun → 90° döner · su kaynaktan depoya akmalı",
    "emoji": "🚰",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Bağlantı"
    ],
    "renk": [
      "#38bdf8",
      "#0369a1"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 290
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0:00"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "susise",
    "ad": "Su Şişesi Renk Ayırma",
    "ozet": "Renkli suları dökerek her şişeyi tek renk yap.",
    "aciklama": "Renkli suları doğru şişelerde topla.",
    "ipucu": "Şişeye dokun → üstteki suyu al · başka şişeye dokun → dök",
    "emoji": "🧪",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Sakin"
    ],
    "renk": [
      "#38bdf8",
      "#075985"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 430,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "sudoku",
    "ad": "Sudoku",
    "ozet": "Her satır, sütun ve kutuda 1-9 bir kez geçsin.",
    "aciklama": "Her satır, sütun ve 3×3 kutuda 1-9 birer kez geçsin.",
    "ipucu": "Kareye dokun, sonra rakam seç · <kbd>1</kbd>-<kbd>9</kbd> yaz, <kbd>Sil</kbd> ile sil · <kbd>N</kbd> ya da <b>Kalem notu</b> ile emin olmadığın rakamları küçük yaz",
    "emoji": "🧮",
    "kategori": "mantik",
    "etiketler": [
      "Mantık",
      "Üç zorluk"
    ],
    "renk": [
      "#60a5fa",
      "#1d4ed8"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 392
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Süre",
          "id": "timer",
          "baslangic": "0"
        },
        {
          "etiket": "Hata",
          "id": "mistakes",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "sekerpatlat",
    "ad": "Şeker Patlatma",
    "ozet": "Candy Crush tarzı: şekerleri dizip patlat, hedefi tuttur.",
    "aciklama": "Şekerleri üçlü dizip patlat.",
    "ipucu": "Komşu iki şekeri değiştir · üç ve fazlası patlar",
    "emoji": "🍬",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Eşleştirme"
    ],
    "renk": [
      "#fb7185",
      "#9f1239"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 280
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "20"
        },
        {
          "etiket": "Hedef",
          "id": "target",
          "baslangic": "1000"
        }
      ]
    }
  },
  {
    "id": "sifre",
    "ad": "Şifre Çözme",
    "ozet": "Sayıların arkasındaki gizli kelimeyi çöz.",
    "aciklama": "Her harfin hangi sayı olduğunu bul.",
    "ipucu": "Sayıya dokun, sonra harfi seç · ipuçlarını kullan",
    "emoji": "🔐",
    "kategori": "kelime",
    "etiketler": [
      "Mantık",
      "Kelime"
    ],
    "renk": [
      "#a78bfa",
      "#5b21b6"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 550,
      "disPay": 330
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan",
          "id": "remaining",
          "baslangic": "0"
        },
        {
          "etiket": "Hata",
          "id": "mistakes",
          "baslangic": "0"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "tangram",
    "ad": "Tangram",
    "ozet": "Parçaları çevirip hedef şeklin tamamını kapla.",
    "aciklama": "Parçaları döndürüp hedef şekli doldur.",
    "ipucu": "Parçaya dokun → seç · tekrar dokun → döndür · tahtaya dokun → yerleştir",
    "emoji": "🔶",
    "kategori": "yerlestirme",
    "etiketler": [
      "Bulmaca",
      "Şekil"
    ],
    "renk": [
      "#fb923c",
      "#9a3412"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 700,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan parça",
          "id": "remaining",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        }
      ]
    }
  },
  {
    "id": "tetris",
    "ad": "Tetris",
    "ozet": "Düşen blokları yerleştir, satırları doldurup temizle.",
    "aciklama": "Düşen blokları çevir, satırları doldurup temizle.",
    "ipucu": "<kbd>←</kbd> <kbd>→</kbd> kaydır · <kbd>↑</kbd> çevir · <kbd>↓</kbd> hızlandır · <kbd>Boşluk</kbd> bırak · <kbd>P</kbd> duraklat · mobilde alttaki tuşlar veya kaydırma",
    "emoji": "🧱",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Refleks"
    ],
    "renk": [
      "#22d3ee",
      "#0e7490"
    ],
    "tuval": {
      "genislik": 410,
      "yukseklik": 536,
      "disPay": 300
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Seviye",
          "id": "level",
          "baslangic": "1"
        },
        {
          "etiket": "Satır",
          "id": "lines",
          "baslangic": "0"
        }
      ],
      "pad": [
        {
          "etiket": "←",
          "deger": "left"
        },
        {
          "etiket": "⟳",
          "deger": "rotate"
        },
        {
          "etiket": "→",
          "deger": "right"
        },
        {
          "etiket": "↓",
          "deger": "soft"
        },
        {
          "etiket": "⇓ Bırak",
          "deger": "drop"
        }
      ]
    }
  },
  {
    "id": "topsirala",
    "ad": "Top Sıralama",
    "ozet": "Renkli topları tüplere ayır, her tüp tek renk olsun.",
    "aciklama": "Aynı renk topları aynı tüpte topla.",
    "ipucu": "Tüpe dokun → üstteki topu al · başka tüpe dokun → bırak",
    "emoji": "🫧",
    "kategori": "yerlestirme",
    "etiketler": [
      "Mantık",
      "Sakin"
    ],
    "renk": [
      "#22d3ee",
      "#0e7490"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 430,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Hamle",
          "id": "moves",
          "baslangic": "0"
        }
      ],
      "aracCubugu": [
        {
          "etiket": "Kolay",
          "deger": "kolay"
        },
        {
          "etiket": "Orta",
          "deger": "orta"
        },
        {
          "etiket": "Zor",
          "deger": "zor"
        }
      ]
    }
  },
  {
    "id": "wordle",
    "ad": "Wordle",
    "ozet": "Altı hakta beş harfli gizli kelimeyi bul.",
    "aciklama": "Altı hakta beş harfli kelimeyi bul.",
    "ipucu": "Harfleri seç, <kbd>Gir</kbd> ile dene · yeşil doğru yerde, sarı kelimede var",
    "emoji": "🟩",
    "kategori": "kelime",
    "etiketler": [
      "Kelime",
      "Tahmin"
    ],
    "renk": [
      "#4ade80",
      "#15803d"
    ],
    "tuval": {
      "genislik": 420,
      "yukseklik": 520,
      "disPay": 330
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Kalan hak",
          "id": "tries",
          "baslangic": "6"
        }
      ],
      "tusTakimi": true
    }
  },
  {
    "id": "yilan",
    "ad": "Yılan",
    "ozet": "Yem topla, uzadıkça hızlan. Duvara ve kuyruğuna çarpma.",
    "aciklama": "Yem topla, duvara ve <strong>kendi kuyruğuna</strong> çarpma.",
    "ipucu": "<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> veya <kbd>WASD</kbd> ile yön ver · <kbd>Boşluk</kbd> duraklatır · mobilde parmağını kaydır",
    "emoji": "🐍",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Refleks"
    ],
    "renk": [
      "#bef264",
      "#4d7c0f"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 215
    }
  },
  {
    "id": "zuma",
    "ad": "Zuma",
    "ozet": "İlerleyen top zincirini üçlü gruplar patlatarak durdur.",
    "aciklama": "Zincire top at, üç aynı rengi patlat.",
    "ipucu": "Nişanla dokun → top atılır · üç aynı renk patlar",
    "emoji": "🐸",
    "kategori": "arcade",
    "etiketler": [
      "Arcade",
      "Nişan"
    ],
    "renk": [
      "#a3e635",
      "#4d7c0f"
    ],
    "tuval": {
      "genislik": 510,
      "yukseklik": 510,
      "disPay": 250
    },
    "arayuz": {
      "rozetler": [
        {
          "etiket": "Zincir",
          "id": "chain",
          "baslangic": "0"
        }
      ]
    }
  }
]

export const KATALOG_HARITASI = new Map(KATALOG.map((o) => [o.id, o]))

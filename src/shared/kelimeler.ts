/**
 * Ortak Türkçe kelime sözlüğü.
 * Kelime Bulmaca (ipucu), Kelime Avı (tema) ve Adam Asmaca (ipucu) bunu kullanır.
 * Kelimeler büyük harfle ve Türkçe alfabeye uygun yazılmıştır.
 */

export const TURKCE_ALFABE = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('')

export type Kategori = 'Hayvan' | 'Meyve' | 'Şehir' | 'Eşya' | 'Doğa' | 'Meslek' | 'Spor' | 'Yiyecek'

export interface KelimeKaydi {
  kelime: string
  ipucu: string
  kategori: Kategori
}

export const KELIMELER: KelimeKaydi[] = [
  // --- Hayvan ---
  { kelime: 'KEDİ', ipucu: 'Miyavlayan evcil dost', kategori: 'Hayvan' },
  { kelime: 'KÖPEK', ipucu: 'İnsanın en sadık arkadaşı', kategori: 'Hayvan' },
  { kelime: 'ASLAN', ipucu: 'Ormanlar kralı', kategori: 'Hayvan' },
  { kelime: 'KAPLAN', ipucu: 'Çizgili büyük kedi', kategori: 'Hayvan' },
  { kelime: 'FİL', ipucu: 'Hortumlu dev hayvan', kategori: 'Hayvan' },
  { kelime: 'ZÜRAFA', ipucu: 'Boynu en uzun hayvan', kategori: 'Hayvan' },
  { kelime: 'TAVŞAN', ipucu: 'Havuç seven zıplayan hayvan', kategori: 'Hayvan' },
  { kelime: 'KUŞ', ipucu: 'Kanatlarıyla uçar', kategori: 'Hayvan' },
  { kelime: 'BALIK', ipucu: 'Suda yüzen, solungaçlı', kategori: 'Hayvan' },
  { kelime: 'AYI', ipucu: 'Kış uykusuna yatan iri hayvan', kategori: 'Hayvan' },
  { kelime: 'KURT', ipucu: 'Sürü hâlinde gezen yaban hayvanı', kategori: 'Hayvan' },
  { kelime: 'TİLKİ', ipucu: 'Kurnazlığıyla ünlü hayvan', kategori: 'Hayvan' },
  { kelime: 'AT', ipucu: 'Koşan, binilen hayvan', kategori: 'Hayvan' },
  { kelime: 'İNEK', ipucu: 'Süt veren çiftlik hayvanı', kategori: 'Hayvan' },
  { kelime: 'KOYUN', ipucu: 'Yünü kırkılan hayvan', kategori: 'Hayvan' },
  { kelime: 'ARI', ipucu: 'Bal yapan böcek', kategori: 'Hayvan' },
  { kelime: 'KARINCA', ipucu: 'Çalışkanlığıyla bilinen küçük böcek', kategori: 'Hayvan' },
  { kelime: 'KELEBEK', ipucu: 'Tırtılken kanatlanan böcek', kategori: 'Hayvan' },
  { kelime: 'PENGUEN', ipucu: 'Uçamayan kutup kuşu', kategori: 'Hayvan' },
  { kelime: 'YILAN', ipucu: 'Ayaksız sürüngen', kategori: 'Hayvan' },
  { kelime: 'KAPLUMBAĞA', ipucu: 'Kabuğunu sırtında taşır', kategori: 'Hayvan' },
  { kelime: 'MAYMUN', ipucu: 'Ağaçlara tırmanan zeki hayvan', kategori: 'Hayvan' },
  { kelime: 'KARTAL', ipucu: 'Keskin gözlü yırtıcı kuş', kategori: 'Hayvan' },
  { kelime: 'BAYKUŞ', ipucu: 'Gece gören kuş', kategori: 'Hayvan' },

  // --- Meyve ve yiyecek ---
  { kelime: 'ELMA', ipucu: 'Kırmızı ya da yeşil, kabuklu meyve', kategori: 'Meyve' },
  { kelime: 'ARMUT', ipucu: 'Ampul biçimli meyve', kategori: 'Meyve' },
  { kelime: 'MUZ', ipucu: 'Sarı, kavisli tropik meyve', kategori: 'Meyve' },
  { kelime: 'ÇİLEK', ipucu: 'Kırmızı, çekirdekleri dışında', kategori: 'Meyve' },
  { kelime: 'KARPUZ', ipucu: 'Yazın en serinletici büyük meyve', kategori: 'Meyve' },
  { kelime: 'KAVUN', ipucu: 'Sarı içli yaz meyvesi', kategori: 'Meyve' },
  { kelime: 'ÜZÜM', ipucu: 'Salkım hâlinde büyür', kategori: 'Meyve' },
  { kelime: 'KİRAZ', ipucu: 'Çift sapıyla kulağa takılan meyve', kategori: 'Meyve' },
  { kelime: 'PORTAKAL', ipucu: 'C vitamini deposu turunçgil', kategori: 'Meyve' },
  { kelime: 'LİMON', ipucu: 'Ekşiliğiyle bilinen sarı meyve', kategori: 'Meyve' },
  { kelime: 'ŞEFTALİ', ipucu: 'Tüylü kabuklu yaz meyvesi', kategori: 'Meyve' },
  { kelime: 'ERİK', ipucu: 'Yeşil ya da mor, ekşimsi meyve', kategori: 'Meyve' },
  { kelime: 'NAR', ipucu: 'Taneleri yakut gibi meyve', kategori: 'Meyve' },
  { kelime: 'İNCİR', ipucu: 'Kurusu da sevilen tatlı meyve', kategori: 'Meyve' },
  { kelime: 'EKMEK', ipucu: 'Fırından çıkan temel besin', kategori: 'Yiyecek' },
  { kelime: 'PEYNİR', ipucu: 'Sütten yapılan kahvaltılık', kategori: 'Yiyecek' },
  { kelime: 'ZEYTİN', ipucu: 'Yağı da çıkarılan kahvaltılık', kategori: 'Yiyecek' },
  { kelime: 'ÇORBA', ipucu: 'Sıcak içilen kaşıklık yemek', kategori: 'Yiyecek' },
  { kelime: 'PİLAV', ipucu: 'Pirinçten yapılan yemek', kategori: 'Yiyecek' },
  { kelime: 'BÖREK', ipucu: 'Yufkadan yapılan hamur işi', kategori: 'Yiyecek' },
  { kelime: 'BAL', ipucu: 'Arıların yaptığı tatlı', kategori: 'Yiyecek' },
  { kelime: 'ŞEKER', ipucu: 'Tatlandırıcı beyaz taneler', kategori: 'Yiyecek' },

  // --- Şehir ---
  { kelime: 'İSTANBUL', ipucu: 'İki kıtayı birleştiren şehir', kategori: 'Şehir' },
  { kelime: 'ANKARA', ipucu: 'Türkiye’nin başkenti', kategori: 'Şehir' },
  { kelime: 'İZMİR', ipucu: 'Ege’nin incisi', kategori: 'Şehir' },
  { kelime: 'BURSA', ipucu: 'Uludağ’ın eteğindeki yeşil şehir', kategori: 'Şehir' },
  { kelime: 'ANTALYA', ipucu: 'Turizmin başkenti sayılan sahil şehri', kategori: 'Şehir' },
  { kelime: 'KONYA', ipucu: 'Mevlana’nın şehri', kategori: 'Şehir' },
  { kelime: 'TRABZON', ipucu: 'Karadeniz’in hamsili şehri', kategori: 'Şehir' },
  { kelime: 'ADANA', ipucu: 'Kebabıyla ünlü sıcak şehir', kategori: 'Şehir' },
  { kelime: 'RİZE', ipucu: 'Çay bahçeleriyle bilinen şehir', kategori: 'Şehir' },
  { kelime: 'MARDİN', ipucu: 'Taş evleriyle ünlü güneydoğu şehri', kategori: 'Şehir' },
  { kelime: 'VAN', ipucu: 'Gölü ve kedisiyle bilinen şehir', kategori: 'Şehir' },
  { kelime: 'SİVAS', ipucu: 'Kangal köpeğiyle anılan İç Anadolu şehri', kategori: 'Şehir' },

  // --- Eşya ---
  { kelime: 'MASA', ipucu: 'Üzerinde yemek yenen mobilya', kategori: 'Eşya' },
  { kelime: 'SANDALYE', ipucu: 'Üzerine oturulan mobilya', kategori: 'Eşya' },
  { kelime: 'KALEM', ipucu: 'Yazı yazmaya yarar', kategori: 'Eşya' },
  { kelime: 'DEFTER', ipucu: 'Notların yazıldığı sayfalar', kategori: 'Eşya' },
  { kelime: 'KİTAP', ipucu: 'Sayfaları olan okuma dostu', kategori: 'Eşya' },
  { kelime: 'ÇANTA', ipucu: 'Eşyaları taşımaya yarar', kategori: 'Eşya' },
  { kelime: 'SAAT', ipucu: 'Zamanı gösterir', kategori: 'Eşya' },
  { kelime: 'ANAHTAR', ipucu: 'Kilidi açar', kategori: 'Eşya' },
  { kelime: 'AYNA', ipucu: 'Yansımayı gösteren cam', kategori: 'Eşya' },
  { kelime: 'HALI', ipucu: 'Yere serilen dokuma', kategori: 'Eşya' },
  { kelime: 'PERDE', ipucu: 'Pencereyi örten kumaş', kategori: 'Eşya' },
  { kelime: 'LAMBA', ipucu: 'Odayı aydınlatır', kategori: 'Eşya' },
  { kelime: 'BARDAK', ipucu: 'İçinden su içilir', kategori: 'Eşya' },
  { kelime: 'TABAK', ipucu: 'Yemek konulan kap', kategori: 'Eşya' },
  { kelime: 'ŞEMSİYE', ipucu: 'Yağmurdan korur', kategori: 'Eşya' },
  { kelime: 'BİSİKLET', ipucu: 'İki tekerlekli pedallı araç', kategori: 'Eşya' },

  // --- Doğa ---
  { kelime: 'DENİZ', ipucu: 'Tuzlu geniş su', kategori: 'Doğa' },
  { kelime: 'DAĞ', ipucu: 'Yüksek yeryüzü şekli', kategori: 'Doğa' },
  { kelime: 'ORMAN', ipucu: 'Ağaçlarla kaplı alan', kategori: 'Doğa' },
  { kelime: 'NEHİR', ipucu: 'Akan büyük su', kategori: 'Doğa' },
  { kelime: 'GÜNEŞ', ipucu: 'Gündüzü aydınlatan yıldız', kategori: 'Doğa' },
  { kelime: 'YAĞMUR', ipucu: 'Buluttan düşen su', kategori: 'Doğa' },
  { kelime: 'KAR', ipucu: 'Kışın yağan beyaz örtü', kategori: 'Doğa' },
  { kelime: 'RÜZGAR', ipucu: 'Esen hava', kategori: 'Doğa' },
  { kelime: 'BULUT', ipucu: 'Gökyüzündeki beyaz yığın', kategori: 'Doğa' },
  { kelime: 'YILDIZ', ipucu: 'Gece parlayan gök cismi', kategori: 'Doğa' },
  { kelime: 'AĞAÇ', ipucu: 'Gövdesi ve dalları olan bitki', kategori: 'Doğa' },
  { kelime: 'ÇİÇEK', ipucu: 'Renkli, kokulu bitki parçası', kategori: 'Doğa' },
  { kelime: 'TOPRAK', ipucu: 'Bitkilerin köklendiği yer', kategori: 'Doğa' },
  { kelime: 'GÖL', ipucu: 'Karayla çevrili durgun su', kategori: 'Doğa' },
  { kelime: 'IŞIK', ipucu: 'Karanlığı yok eden şey', kategori: 'Doğa' },

  // --- Meslek ---
  { kelime: 'DOKTOR', ipucu: 'Hastaları iyileştirir', kategori: 'Meslek' },
  { kelime: 'ÖĞRETMEN', ipucu: 'Okulda ders anlatır', kategori: 'Meslek' },
  { kelime: 'PİLOT', ipucu: 'Uçağı uçurur', kategori: 'Meslek' },
  { kelime: 'AŞÇI', ipucu: 'Mutfakta yemek yapar', kategori: 'Meslek' },
  { kelime: 'MÜHENDİS', ipucu: 'Tasarlayan ve hesaplayan meslek', kategori: 'Meslek' },
  { kelime: 'ÇİFTÇİ', ipucu: 'Toprağı eken kişi', kategori: 'Meslek' },
  { kelime: 'MARANGOZ', ipucu: 'Ahşap işleyen usta', kategori: 'Meslek' },
  { kelime: 'TERZİ', ipucu: 'Kumaştan giysi diker', kategori: 'Meslek' },
  { kelime: 'POLİS', ipucu: 'Güvenliği sağlar', kategori: 'Meslek' },
  { kelime: 'HEMŞİRE', ipucu: 'Hastanede bakım yapar', kategori: 'Meslek' },

  // --- Spor ---
  { kelime: 'FUTBOL', ipucu: 'Ayakla oynanan takım sporu', kategori: 'Spor' },
  { kelime: 'BASKETBOL', ipucu: 'Potaya atılan turuncu top', kategori: 'Spor' },
  { kelime: 'VOLEYBOL', ipucu: 'File üzerinden oynanır', kategori: 'Spor' },
  { kelime: 'YÜZME', ipucu: 'Suda yapılan spor', kategori: 'Spor' },
  { kelime: 'TENİS', ipucu: 'Raketle oynanan spor', kategori: 'Spor' },
  { kelime: 'KOŞU', ipucu: 'En basit dayanıklılık sporu', kategori: 'Spor' },
  { kelime: 'GÜREŞ', ipucu: 'Ata sporumuz', kategori: 'Spor' },
  { kelime: 'SATRANÇ', ipucu: 'Altmış dört kareli zekâ oyunu', kategori: 'Spor' },
]

/** Verilen uzunluk aralığındaki kelimeler. */
export function kelimeleriSec(minUzunluk: number, maxUzunluk: number): KelimeKaydi[] {
  return KELIMELER.filter((k) => k.kelime.length >= minUzunluk && k.kelime.length <= maxUzunluk)
}

export function kategoriKelimeleri(kategori: Kategori): KelimeKaydi[] {
  return KELIMELER.filter((k) => k.kategori === kategori)
}

export const KATEGORILER: Kategori[] = [
  'Hayvan',
  'Meyve',
  'Şehir',
  'Eşya',
  'Doğa',
  'Meslek',
  'Spor',
  'Yiyecek',
]

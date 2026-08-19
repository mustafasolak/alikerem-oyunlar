/**
 * Üç boyutlu sahnenin ölçüleri.
 *
 * Dünya birimi = iki boyutlu oyunun pikseli. Böylece paylaşılan
 * `kalesavunmasi/config/constants.ts` içindeki bütün konumlar (kule yuvaları,
 * canavar boyları, mızrak hızı, durma noktası) olduğu gibi geçerli kalır ve
 * mantık dosyasına hiç dokunulmaz.
 *
 * Eksen eşlemesi:
 *   sim x → z  (derinlik: 0 kale duvarı, DOGUS_X doğuş noktası)
 *   sim y → y  (yükseklik: ZEMIN_Y yerde 0, yukarısı artı)
 *   yeni  → x  (yanal: 0 yolun ortası, eksi taraf kameranın olduğu ön çim)
 */

import { DOGUS_X, GAME_WIDTH, ZEMIN_Y } from '../../kalesavunmasi/config/constants.ts'

/** Sim y değerini dünya yüksekliğine çevirir (yukarısı artı). */
export const yukseklik = (simY: number): number => ZEMIN_Y - simY

// --- Saha ---

/** Toprak yolun yarı genişliği; canavarlar bu bandın içinde yürür. */
export const YOL_YARI_EN = 92
/** Yol kenarındaki taş bordür. */
export const BORDUR_EN = 10
export const BORDUR_BOY = 5
/**
 * Çimin yarı genişliği ve zeminin uzandığı aralık.
 *
 * Zemin bilerek çok geniş: kenarı sisin içinde kalsın, ufukta "düzlem bitti"
 * çizgisi görünmesin.
 */
export const CIM_YARI_EN = 4000
export const SAHA_ARKA = -2600
export const SAHA_ON = DOGUS_X + 2600
/** Ağaç, taş ve bulut yalnız sahanın çevresine serpilir. */
export const DEKOR_ARKA = -340
export const DEKOR_ON = DOGUS_X + 340

// --- Kale ---

/**
 * Duvarın yandan yana uzunluğu (yarısı).
 *
 * Uçsuz bucaksız bir sur değil, yolu kapatan bir kapı yapısı: kamera yandan
 * baktığı için geniş duvarın yakın ucu bütün ekranı kaplıyordu.
 */
export const KALE_YARI_EN = 150
/** Duvarın kalınlığı: z ekseninde nereden nereye. */
export const KALE_Z1 = -30
export const KALE_Z2 = 112
export const MAZGAL_EN = 34
export const MAZGAL_BOY = 22
export const MAZGAL_ARALIK = 58
/** Yolun karşısına gelen kapı. */
export const KAPI_EN = 96
export const KAPI_BOY = 130
/** Duvarın iki ucundaki burçlar. */
export const BURC_R = 38
export const BURC_EK_BOY = 46
/** Meşale ateşinin yanıp sönme süresi (ms). */
export const MESALE_SALINIM_MS = 620

// --- Mızrakçı ---

/** Mızrakçının boyu (dünya birimi). */
export const MIZRAKCI_BOY = 54

// --- Canavar ---

/**
 * Canavarlar yolda bu kadar sağa sola yayılır.
 *
 * Mantık tek eksenli: sim yalnız x tutar. Hepsini tam ortadan yürütmek sırt
 * sırta bir kuyruk gibi görünüyordu; küçük bir yanal kayma kalabalığı açıyor.
 * Kaleye yaklaşırken kayma sıfıra iner: kapıya doğru huniye giriyorlar.
 */
export const CANAVAR_YAYILMA = 30
/** Kayma bu uzaklıktan sonra tam açılır (sim x). */
export const YAYILMA_MESAFE = 420
/** Yere düşen yumuşak gölgenin yarıçapı, gövde enine oranla. */
export const GOLGE_ORANI = 0.62
/** Gövdenin z eksenindeki kalınlığı, ene oranla. */
export const GOVDE_DERINLIK_ORANI = 0.78
/** Can barının yerden yüksekliği ve ölçüsü. */
export const BAR_EN = 44
export const BAR_BOY = 7
export const BAR_PAY = 22

// --- Efektler ---

/** Ölen canavarın küçülüp kaybolma süresi (ms). */
export const OLUM_MS = 380
/** İsabet parlamasının süresi (ms). */
export const PARLAMA_MS = 130

// --- Kamera ---

export const KAMERA_FOV = 50
/** Kameranın baktığı nokta: yolun ortasının biraz uzak yanı. */
export const KAMERA_HEDEF = { x: 60, y: 80, z: GAME_WIDTH / 2 + 10 }
/**
 * Hedeften kameraya bakan yön (birim vektöre yakın).
 *
 * Eksi x: kamera yolun ön tarafında durur, kale solda kalır ve canavarlar
 * sağdan gelir — iki boyutlu sürümdeki okunuş korunuyor.
 *
 * Kamera bilerek yanda: duvarın ardına geçen her kamera, 234 birimlik surun
 * dibindeki canavarları göremiyor (sur onları kapatıyor). Yandan bakınca hem
 * kale hem yol aynı karede duruyor. z bileşeni küçük tutuldu; büyütünce kamera
 * kalenin dibine iniyor ve burç bütün ekranı kaplıyor.
 */
export const KAMERA_YON = { x: -0.88, y: 0.34, z: -0.12 }
/** Saha çerçeveye tam oturmasın, kenarda biraz boşluk kalsın. */
export const KAMERA_PAY = 1.04
/**
 * Kameranın çerçevelediği kutu.
 *
 * Doğuş noktası bilerek dışarıda: canavarlar iki boyutlu sürümdeki gibi
 * ekranın dışından yürüyerek giriyor. Bütün yolu sığdırmaya çalışmak kamerayı
 * gereksiz geriye atıp canavarları nokta hâline getiriyordu.
 */
export const CERCEVE = { x1: -110, x2: 200, y1: 0, y2: 230, z1: 40, z2: 800 }

// --- Işık ve hava ---

export const GOK_ISIK_GUCU = 1.15
export const GUNES_GUCU = 1.35
/** Güneşin sahaya göre yönü. */
export const GUNES_YONU = { x: -420, y: 900, z: -260 }
/** Sis bu uzaklıkta başlar ve şu uzaklıkta beyaza boğar. */
export const SIS_YAKIN = 1100
export const SIS_UZAK = 3400

// --- Süs ---

export const AGAC_ADET = 14
/**
 * Ağaçlar yolun bu kadar dışında, yalnız uzak tarafta durur.
 * Yakın tarafa konanlar kamerayla yol arasına girip sahayı kapatıyordu.
 */
export const AGAC_UZAKLIK = 220
export const AGAC_BOY = { az: 90, cok: 170 }
export const DAG_ADET = 9
export const DAG_UZAKLIK = 2500
export const TAS_ADET = 18

/**
 * Oyun tanımı — her oyunun tek giriş noktası.
 *
 * Bir oyun klasörü artık HTML, CSS ya da kayıt satırı içermez. Sadece bu
 * tanımı verir; sayfa kabuğu, katalog kartı ve yükleme bundan üretilir.
 *
 * Burada Phaser'a hiç dokunulmaz: `sahne` tembel bir içe aktarma olduğu için
 * katalog üreticisi bu dosyaları Node'da okuyabilir.
 */

export type Kategori = 'arcade' | 'mantik' | 'kelime' | 'kagit' | 'dikkat' | 'yerlestirme'

export const KATEGORI_ADLARI: Record<Kategori, string> = {
  arcade: 'Arcade',
  mantik: 'Mantık',
  kelime: 'Kelime',
  kagit: 'Kâğıt & Eşleştirme',
  dikkat: 'Dikkat',
  yerlestirme: 'Yerleştirme',
}

/** Tuval üstündeki durum rozeti: "Hamle 0" gibi. */
export interface Rozet {
  etiket: string
  /** setChip() bu id ile günceller. */
  id: string
  baslangic: string
}

export interface AracButonu {
  etiket: string
  /** butonGrubu('toolbar', 'level', ...) bu değeri döner. */
  deger: string
}

export interface PadButonu {
  etiket: string
  /** data-move değeri. */
  deger: string
}

export interface Panel {
  id: string
  baslik: string
  /** Panelin içi — kendi kodumuzdan gelen güvenli şablon. */
  ic: string
}

export interface Arayuz {
  rozetler?: Rozet[]
  aracCubugu?: AracButonu[]
  /** #keypad kutusu oluşturulsun mu? */
  tusTakimi?: boolean
  pad?: PadButonu[]
  paneller?: Panel[]
}

/** Sahne sınıfı; Phaser tipine bağlanmamak için asgari imza. */
export type SahneYapici = new () => object

/** Oyunu hangi motor çizer. */
export type Motor = 'phaser' | 'ucboyut'

/**
 * 3D motorlu sahnelerin sözleşmesi.
 *
 * Phaser sahnelerini kabuk `new Phaser.Game(...)` ile kurar; üç boyutlu
 * oyunlarda ise sahne kendi tuvalini açar. Kabuk yalnız bu iki çağrıyı bilir,
 * three.js'e hiç dokunmaz — kütüphane oyunun kendi parçasıyla iner.
 */
export interface UcBoyutSahnesi {
  baslat(kap: HTMLElement): void
  yikil(): void
}

export interface OyunTanimi {
  id: string
  ad: string
  /** Katalog kartındaki bir cümle. */
  ozet: string
  /** Oyun sayfasındaki alt başlık. */
  aciklama: string
  /** Sayfanın altındaki ipucu satırı (kendi şablonumuz, HTML olabilir). */
  ipucu: string
  emoji: string
  kategori: Kategori
  etiketler: string[]
  /** Başlık gradyanı: [--game-a, --game-b] */
  renk: [string, string]
  /** Dış bağlantılı oyunlarda bulunmaz. */
  tuval?: {
    genislik: number
    yukseklik: number
    /** Tuval dışındaki arayüzün kapladığı dikey alan (px). */
    disPay: number
  }
  arayuz?: Arayuz
  /**
   * Çizim motoru. Verilmezse Phaser. 'ucboyut' olan oyunlarda `sahne`
   * yükleyicisinin döndürdüğü sınıf `UcBoyutSahnesi` sözleşmesini uygular.
   */
  motor?: Motor
  /**
   * Tembel: oyun açılana kadar sahne kodu indirilmez.
   * Dış bağlantılı oyunlarda bulunmaz.
   */
  sahne?: () => Promise<{ GameScene: SahneYapici }>
  /**
   * Ayrı bir adreste çalışan oyun. Verilirse kart doğrudan oraya götürür;
   * `sahne` ve `tuval` aranmaz. Kodu bu depoya girmeyen kardeş projeler için.
   */
  disAdres?: string
}

/** Sadece tip güvenliği için; çalışma zamanında nesneyi aynen döner. */
export function tanim(t: OyunTanimi): OyunTanimi {
  return t
}

/** Katalogda taşınan, sahne yükleyicisi olmayan hafif üstveri. */
export type KatalogKaydi = Omit<OyunTanimi, 'sahne'>

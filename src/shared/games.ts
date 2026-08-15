/**
 * Site genelindeki oyun kataloğu.
 * Ana sayfa kartlarını buradan üretir. Yeni oyun eklerken tek yapılacak:
 * buraya bir girdi ekleyip vite.config.ts içine sayfayı tanıtmak.
 */

export type GameStatus = 'ready' | 'soon'

export interface GameEntry {
  /** Klasör adıyla aynı olmalı: games/<id>/ */
  id: string
  title: string
  tagline: string
  emoji: string
  /** Ana sayfaya göre göreli yol. */
  href: string
  tags: string[]
  status: GameStatus
}

export const SITE_TITLE = 'Ali Kerem Oyunları'
export const SITE_TAGLINE = 'Tarayıcıda oynanan mini oyunlar'

export const GAMES: GameEntry[] = [
  {
    id: '2048',
    title: '2048',
    tagline: 'Kareleri kaydır, aynı sayıları birleştir ve 2048 karesine ulaş.',
    emoji: '🔢',
    href: 'games/2048/index.html',
    tags: ['Bulmaca', 'Tek kişilik'],
    status: 'ready',
  },
  {
    id: 'yilan',
    title: 'Yılan',
    tagline: 'Yem topla, uzadıkça hızlan. Duvara ve kuyruğuna çarpma.',
    emoji: '🐍',
    href: 'games/yilan/index.html',
    tags: ['Arcade', 'Refleks'],
    status: 'ready',
  },
  {
    id: 'hafiza',
    title: 'Hafıza Kartları',
    tagline: 'Eşleri bul, süre dolmadan bütün kartları aç.',
    emoji: '🃏',
    href: 'games/hafiza/index.html',
    tags: ['Hafıza', 'Sakin'],
    status: 'soon',
  },
]

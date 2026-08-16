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
    id: 'tetris',
    title: 'Tetris',
    tagline: 'Düşen blokları yerleştir, satırları doldurup temizle.',
    emoji: '🧱',
    href: 'games/tetris/index.html',
    tags: ['Arcade', 'Refleks'],
    status: 'ready',
  },
  {
    id: 'mayin',
    title: 'Mayın Tarlası',
    tagline: 'Sayıları oku, mayınları bayrakla, tarlayı temizle.',
    emoji: '💣',
    href: 'games/mayin/index.html',
    tags: ['Mantık', 'Sabır'],
    status: 'ready',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    tagline: 'Her satır, sütun ve kutuda 1-9 bir kez geçsin.',
    emoji: '🔢',
    href: 'games/sudoku/index.html',
    tags: ['Mantık', 'Üç zorluk'],
    status: 'ready',
  },
  {
    id: 'puzzle15',
    title: "15'li Kaydırmalı Puzzle",
    tagline: 'Karışan taşları kaydırarak 1’den 15’e sırala.',
    emoji: '🧩',
    href: 'games/puzzle15/index.html',
    tags: ['Bulmaca', 'Sakin'],
    status: 'ready',
  },
  {
    id: 'bulmaca',
    title: 'Kelime Bulmaca',
    tagline: 'İpuçlarını oku, kesişen kelimeleri harf harf doldur.',
    emoji: '📝',
    href: 'games/bulmaca/index.html',
    tags: ['Kelime', 'Mantık'],
    status: 'ready',
  },
  {
    id: 'kelimeavi',
    title: 'Kelime Avı',
    tagline: 'Harf karmaşasında gizlenen kelimeleri bul ve işaretle.',
    emoji: '🔎',
    href: 'games/kelimeavi/index.html',
    tags: ['Kelime', 'Dikkat'],
    status: 'ready',
  },
  {
    id: 'asmaca',
    title: 'Adam Asmaca',
    tagline: 'Harf tahmin et, altı hakkın bitmeden kelimeyi çöz.',
    emoji: '🪢',
    href: 'games/asmaca/index.html',
    tags: ['Kelime', 'Tahmin'],
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

import { defineConfig } from 'vite'

/** Proje köküne göre mutlak dosya yolu (Node tiplerine ihtiyaç duymadan). */
const fromRoot = (path: string) => new URL(path, import.meta.url).pathname

// Çok sayfalı site: kökte ana sayfa, her oyun kendi klasöründe bir HTML sayfası.
// Yeni oyun eklerken: games/<oyun>/index.html oluştur ve buraya bir girdi ekle.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: fromRoot('index.html'),
        game2048: fromRoot('games/2048/index.html'),
        yilan: fromRoot('games/yilan/index.html'),
        tetris: fromRoot('games/tetris/index.html'),
        mayin: fromRoot('games/mayin/index.html'),
        sudoku: fromRoot('games/sudoku/index.html'),
        puzzle15: fromRoot('games/puzzle15/index.html'),
        bulmaca: fromRoot('games/bulmaca/index.html'),
        kelimeavi: fromRoot('games/kelimeavi/index.html'),
        asmaca: fromRoot('games/asmaca/index.html'),
        lightsout: fromRoot('games/lightsout/index.html'),
        hanoi: fromRoot('games/hanoi/index.html'),
        mastermind: fromRoot('games/mastermind/index.html'),
        hafiza: fromRoot('games/hafiza/index.html'),
        wordle: fromRoot('games/wordle/index.html'),
        labirent: fromRoot('games/labirent/index.html'),
        sokoban: fromRoot('games/sokoban/index.html'),
        topsirala: fromRoot('games/topsirala/index.html'),
      },
    },
  },
})

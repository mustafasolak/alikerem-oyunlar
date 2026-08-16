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
        nonogram: fromRoot('games/nonogram/index.html'),
        eslestirme: fromRoot('games/eslestirme/index.html'),
        sayipiramidi: fromRoot('games/sayipiramidi/index.html'),
        matematik: fromRoot('games/matematik/index.html'),
        renksirala: fromRoot('games/renksirala/index.html'),
        susise: fromRoot('games/susise/index.html'),
        boru: fromRoot('games/boru/index.html'),
        suborusu: fromRoot('games/suborusu/index.html'),
        devre: fromRoot('games/devre/index.html'),
        kutuitme: fromRoot('games/kutuitme/index.html'),
        lazer: fromRoot('games/lazer/index.html'),
        ayna: fromRoot('games/ayna/index.html'),
        match3: fromRoot('games/match3/index.html'),
        sekerpatlat: fromRoot('games/sekerpatlat/index.html'),
        balonpatlat: fromRoot('games/balonpatlat/index.html'),
        blok: fromRoot('games/blok/index.html'),
        domino: fromRoot('games/domino/index.html'),
        mantikkapi: fromRoot('games/mantikkapi/index.html'),
        gruplama: fromRoot('games/gruplama/index.html'),
        kopru: fromRoot('games/kopru/index.html'),
        arabacikar: fromRoot('games/arabacikar/index.html'),
        sifre: fromRoot('games/sifre/index.html'),
        pentomino: fromRoot('games/pentomino/index.html'),
        farkbul: fromRoot('games/farkbul/index.html'),
      },
    },
  },
})

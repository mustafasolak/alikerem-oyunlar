import * as Phaser from 'phaser'

import '../../shared/base.css'
import './mayin.css'
import { GAME_HEIGHT, GAME_PARENT_ID, GAME_WIDTH } from './config/constants.ts'
import { GameScene } from './scenes/GameScene.ts'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: GAME_PARENT_ID,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  // Sayfanın kendi arka planı görünsün.
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
})

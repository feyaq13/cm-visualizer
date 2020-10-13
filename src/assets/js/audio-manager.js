import pouringCoffeeSound from '../sounds/pouring-coffee-sound.mp3';
import clickButtonSound from '../sounds/switch-click-button-sound.mp3';
import fillingContainerSound from '../sounds/fulling-sound.mp3';
import grindCoffeeBeansSound from '../sounds/grinder-sound.mp3'

export class AudioManager {
  constructor() {
    this._sound = null;
    this.clickButtonsSound = new Audio(clickButtonSound);
    this.pouringCoffeeSound = new Audio(pouringCoffeeSound);
    this.fillingContainerSound = new Audio(fillingContainerSound);
    this.grindCoffeeBeansSound = new Audio(grindCoffeeBeansSound)
  }

  play(sound) {
    switch (sound) {
      case 'clickButtonsSound':
        this._sound = this.clickButtonsSound
        break
      case 'pouringCoffeeSound':
        this._sound = this.pouringCoffeeSound
        break
      case 'fillingContainerSound':
        this._sound = this.fillingContainerSound
        break
      case 'grindCoffeeBeansSound':
        this._sound = this.grindCoffeeBeansSound
        break
    }
    this._sound.play().finally();
  }

  stop(sound) {
    switch (sound) {
      case 'clickButtonsSound':
        this._sound = this.clickButtonsSound
        break
      case 'pouringCoffeeSound':
        this._sound = this.pouringCoffeeSound
    }
    this._sound.pause();
  }
}

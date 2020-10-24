import pouringCoffeeSound from '../assets/sounds/pouring-coffee-sound.mp3';
import clickButtonSound from '../assets/sounds/switch-click-button-sound.mp3';
import fillingContainerSound from '../assets/sounds/fulling-sound.mp3';
import grindCoffeeBeansSound from '../assets/sounds/grinder-sound.mp3'

export class AudioManager {
  constructor(config) {
    this._sound = null;
    const { volume } = config;
    this._config = config;
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

    this._sound.volume = this._config.volume;
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

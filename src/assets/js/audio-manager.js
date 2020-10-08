import pouringCoffeeSound from '../sounds/pouring-coffee.mp3';
import clickButtonSound from '../sounds/switch-click-button.mp3';

export class AudioManager {
  constructor() {
    this._sound = null;
    this.clickButtonsSound = new Audio(clickButtonSound);
    this.pouringCoffeeSound = new Audio(pouringCoffeeSound);
  }

  play(sound) {
    switch (sound) {
      case 'clickButtonsSound':
        this._sound = this.clickButtonsSound
        break
      case 'pouringCoffeeSound':
        this._sound = this.pouringCoffeeSound
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

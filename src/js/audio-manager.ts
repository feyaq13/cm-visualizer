// todo найти нормальный способ
declare const require: (path: string) => string;

export class AudioManager {
  private sound: HTMLAudioElement | null;
  private config: any;
  private readonly clickButtonsSound: HTMLAudioElement;
  private readonly pouringCoffeeSound: HTMLAudioElement;
  private readonly fillingContainerSound: HTMLAudioElement;
  private readonly grindCoffeeBeansSound: HTMLAudioElement;
  constructor(config) {
    this.sound = null;
    // const { volume } = config;
    this.config = config;
    const pouringCoffeeSound = require('../assets/sounds/pouring-coffee-sound.mp3');
    const clickButtonSound = require('../assets/sounds/switch-click-button-sound.mp3');
    const fillingContainerSound = require('../assets/sounds/fulling-sound.mp3');
    const grindCoffeeBeansSound = require('../assets/sounds/grinder-sound.mp3');
    this.clickButtonsSound = new Audio(clickButtonSound);
    this.pouringCoffeeSound = new Audio(pouringCoffeeSound);
    this.fillingContainerSound = new Audio(fillingContainerSound);
    this.grindCoffeeBeansSound = new Audio(grindCoffeeBeansSound);
  }

  play(sound) {
    switch (sound) {
      case 'clickButtonsSound':
        this.sound = this.clickButtonsSound;
        break;
      case 'pouringCoffeeSound':
        this.sound = this.pouringCoffeeSound;
        break;
      case 'fillingContainerSound':
        this.sound = this.fillingContainerSound;
        break;
      case 'grindCoffeeBeansSound':
        this.sound = this.grindCoffeeBeansSound;
        break;
    }

    this.sound.volume = this.config.volume;
    this.sound.play().finally();
  }

  stop(sound) {
    switch (sound) {
      case 'clickButtonsSound':
        this.sound = this.clickButtonsSound;
        break;
      case 'pouringCoffeeSound':
        this.sound = this.pouringCoffeeSound;
    }
    this.sound.pause();
  }
}

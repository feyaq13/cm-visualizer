import audioURL from './assets/sounds/switch-click-button.mp3'

export class CoffeeMachineInterface {
  constructor(imageSource) {
    this._soundClickButtons = new Audio(audioURL);
    this._buttonElement = document.getElementsByClassName('button')[0];
  }

  async _playSoundClickButtons() {
    try {
      await this._soundClickButtons.play()
    } catch (err) {
      console.error(err)
    }
  }

  _setupEventClick() {
    this._buttonElement.addEventListener('click', this._playSoundClickButtons.bind(this))
  }
}

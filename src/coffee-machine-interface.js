import audioURL from './assets/sounds/switch-click-button.mp3'

export class CoffeeMachineInterface {
  constructor(imageSource) {
    this._soundClickButtons = new Audio(audioURL);
    this._buttonElements = document.getElementsByClassName('button');
    this._makeCoffeeButton =  Array.prototype.filter.call(this._buttonElements, (button => button.classList.contains('make-coffee')))[0]
  }

  async _playSoundClickButtons() {
    try {
      await this._soundClickButtons.play()
    } catch (err) {
      console.error(err)
    }
  }

  setupEventClick() {
    Array.prototype.forEach.call(this._buttonElements, (button => button.addEventListener('click', this._playSoundClickButtons.bind(this))))
  }

  addEventListenerClick(cb) {
    this._makeCoffeeButton.addEventListener('click', cb, {once: true})
  }
}

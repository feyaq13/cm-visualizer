import audioURL from './assets/sounds/switch-click-button.mp3'

export class CoffeeMachineInterface {
  constructor(imageSource) {
    this._soundClickButtons = new Audio(audioURL);
    this._buttonElements = document.getElementsByClassName('button');
    this._makeCoffeeButton =  Array.prototype.filter.call(this._buttonElements, (button => button.classList.contains('make-coffee')))[0]
  }

  addEventClickOnCleanWaste(cb) {
    document.getElementsByClassName('button-clean-waste')[0].addEventListener('click', cb)
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

  showTypesCoffee(coffee) {
    if (document.getElementsByClassName('coffee-list')[0].childElementCount === 0) {
      const coffeeListElement = document.getElementsByClassName('coffee-list')[0];

      coffee.forEach((coffeeName) => {
        const buttonElement = document.createElement('button')
        const listItemElement = document.createElement('li')
        buttonElement.textContent = coffeeName
        listItemElement.appendChild(buttonElement);
        coffeeListElement.appendChild(listItemElement)
      })
    }
  }
}

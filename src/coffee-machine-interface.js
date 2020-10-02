import audioURL from './assets/sounds/switch-click-button.mp3'

export class CoffeeMachineInterface {
  constructor(imageSource) {
    this._soundClickButtons = new Audio(audioURL);
    this._buttonElements = document.getElementsByClassName('button');
    this._switchOnButton =  Array.prototype.filter.call(this._buttonElements, (button => button.classList.contains('button_is-switch-on')))[0]
    this._buttonElementsNav = document.getElementsByClassName('coffee-list')[0];
    this._cupElement = document.getElementsByClassName('coffee-cup')[0];
  }

  setupOnMakeCoffeeTypesOnEventClick() {
    return new Promise((resolve => {
      this._buttonElementsNav.addEventListener('click', this._getTypeCoffee.bind(this, typeOfCoffee => resolve(typeOfCoffee)))
    }))
  }

  _getTypeCoffee(cb, e) {
    if (e.target.type === 'button') {
      this.onPendingAnimation()
      this.disabledAllButtons(e)
      return cb(e.target.textContent)
    }
  }

  disabledAllButtons(e) {
    Array.prototype.forEach.call(e.currentTarget.getElementsByTagName('button'), (button) => button.disabled = true)
  }

  enabledAllButtons() {
    Array.prototype.forEach.call(this._buttonElementsNav.getElementsByTagName('button'), (button) => button.disabled = false)
  }

  setupOnCleanWasteOnEventClick(cb) {
    document.getElementsByClassName('button-clean-waste')[0].addEventListener('click', cb)
  }

  async _playSoundClickButtons() {
    try {
      await this._soundClickButtons.play()
    } catch (err) {
      console.error(err)
    }
  }

  onPendingAnimation() {
    this._switchOnButton.classList.add('pending-mode')
  }

  onPouringDrinkAnimation(ms, colorCoffee) {
    this._cupElement.style.fill = colorCoffee;
    this._cupElement.classList.add('pouring-mode')
    this._cupElement.style.animationDuration = ms;
  }

  stopPendingAnimation() {
    this._switchOnButton.setAttribute('aria-checked', "true")
    this._switchOnButton.classList.remove('pending-mode')
  }

  setupPlaySoundOnEventClick() {
    Array.prototype.forEach.call(this._buttonElements, (button => button.addEventListener('click', this._playSoundClickButtons.bind(this))))
  }

  setupOnSwitchOnEventClick(cb) {
    this._switchOnButton.addEventListener('click', cb, {once: true})
  }

  showTypesCoffee(coffee) {
    if (document.getElementsByClassName('coffee-list')[0].childElementCount === 0) {
      const coffeeListElement = document.getElementsByClassName('coffee-list')[0];

      coffee.forEach((coffeeName) => {
        const buttonElement = document.createElement('button')
        buttonElement.type = 'button'
        const listItemElement = document.createElement('li')
        buttonElement.textContent = coffeeName
        listItemElement.appendChild(buttonElement);
        coffeeListElement.appendChild(listItemElement)
      })
    }
  }
}

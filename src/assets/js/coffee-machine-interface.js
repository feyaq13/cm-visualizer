import clickButtonSound from '../sounds/switch-click-button.mp3';
import pouringCoffeeSound from '../sounds/pouring-coffee.mp3';
import { Publisher } from './coffee-machine';

export class CoffeeMachineInterface extends Publisher {
  constructor() {
    super();
    this.clickButtonsSound = new Audio(clickButtonSound);
    this.pouringCoffeeSound = new Audio(pouringCoffeeSound);
    this._buttonElements = document.getElementsByClassName('button');
    this._switchOnButton = Array.prototype.filter.call(this._buttonElements, (button) =>
      button.classList.contains('button_is-switch-on'),
    )[0];
    this._buttonElementsNav = document.getElementsByClassName('coffee-list')[0];
    this._cupElement = document.getElementsByClassName('coffee-cup')[0];
    this._eventHandlers = {
      switchOn: [],
      cleanUp: [],
      coffeeSelected: [],
    };
    this.setupPlaySoundOnEventClick();
    this.setupOnSwitchOnEventClick();
    this.setupOnCleanWasteOnEventClick();
  }

  setupEvents(machine) {
    machine.on('coffeeReady', () => {
      this.stopBusyAnimation();
      this.enableAllButtons();
      console.log('Кофе готов!');
    });
    machine.on('noMilk', () => {
      console.log('кажется нет молока');
    });
    machine.on('noGrains', () => {
      console.log('нет зерен');
    });
    machine.on('noWater', () => {
      console.log('кажется нет воды');
    });
    machine.on('whipping', () => {
      console.log('взбиваю 🥛...');
    });
    machine.on('pouring', ({ colorCoffee }) => {
      this.startPouringDrinkAnimation(40, colorCoffee);
      this.playSound(this.pouringCoffeeSound);
    });
    machine.on('cleaning', () => {
      console.log('очищаю...');
    });
    machine.on('clear', () => {
      console.log('очистил 🧹');
    });
    machine.on('ready', () => {
      this.stopBusyAnimation();
      this.setupOnMakeCoffeeTypesOnEventClick((coffeeType) => coffeeType);
      console.log('я готова делать кофе!');
    });
    machine.on('checking', () => {
      console.log('проверяю...');
      this.startBusyAnimation();
    });
    machine.on('brewing', ({ coffeeType }) => {
      console.log(`завариваю ${coffeeType.coffeeName}`);
    });
    machine.on('welcome', ({ coffeeTypes, ingredientsAvailable }) => {
      this.showTypesCoffee(coffeeTypes);
      this.showIngredientsAvailable(ingredientsAvailable);
      console.log(`
        Добро пожаловать!
        Ознакомьтесь, пожалуйста, с нашим меню:
        ${coffeeTypes.join(', ')}
        Для выбора напитка просто напишите его название.
        Приятного аппетита!
      `);
    });
  }

  showIngredientsAvailable(ingredientsAvailable) {
    const listIngredients = document.getElementsByClassName('information')[0];
    for (const ingName of Object.keys(ingredientsAvailable)) {
      if (ingredientsAvailable.hasOwnProperty(ingName)) {
        const ingredient = document.createElement('li');
        ingredient.classList.add(`coffee-machine__${ingName}`);
        ingredient.textContent = `${ingName} ${ingredientsAvailable[ingName]}`;
        listIngredients.appendChild(ingredient);
      }
    }
  }

  setupOnMakeCoffeeTypesOnEventClick() {
    this._buttonElementsNav.addEventListener('click', (e) => {
      if (e.target.type === 'button') {
        this.startBusyAnimation();
        this.disableAllButtons(e);

        this._emit('coffeeSelected', { coffeeName: e.target.textContent });
      }
    });
  }

  disableAllButtons(e) {
    Array.prototype.forEach.call(e.currentTarget.getElementsByTagName('button'), (button) => (button.disabled = true));
  }

  enableAllButtons() {
    Array.prototype.forEach.call(
      this._buttonElementsNav.getElementsByTagName('button'),
      (button) => (button.disabled = false),
    );
  }

  setupOnCleanWasteOnEventClick() {
    document.getElementsByClassName('button-clean-waste')[0].addEventListener('click', () => {
      this._eventHandlers.cleanUp.forEach((handler) => handler());
    });
  }

  playSound(sound) {
    sound.play();
  }

  startBusyAnimation() {
    this._switchOnButton.classList.add('pending-mode');
  }

  startPouringDrinkAnimation(ms, colorCoffee) {
    this._cupElement.style.fill = colorCoffee;
    this._cupElement.classList.add('pouring-mode');
    this._cupElement.style.animationDuration = `${ms}ms`;
  }

  stopBusyAnimation() {
    this._switchOnButton.setAttribute('aria-checked', 'true');
    this._switchOnButton.classList.remove('pending-mode');
  }

  setupPlaySoundOnEventClick() {
    Array.prototype.forEach.call(this._buttonElements, (button) =>
      button.addEventListener('click', this.playSound.bind(this, this.clickButtonsSound)),
    );
  }

  setupOnSwitchOnEventClick() {
    this._switchOnButton.addEventListener('click', () => {
      this._eventHandlers.switchOn.forEach((handler) => handler());
    });
  }

  showTypesCoffee(coffeeTypes) {
    if (document.getElementsByClassName('coffee-list')[0].childElementCount === 0) {
      const coffeeListElement = document.getElementsByClassName('coffee-list')[0];

      coffeeTypes.forEach((coffeeName) => {
        const buttonElement = document.createElement('button');
        buttonElement.type = 'button';
        const listItemElement = document.createElement('li');
        buttonElement.textContent = coffeeName;
        listItemElement.appendChild(buttonElement);
        coffeeListElement.appendChild(listItemElement);
      });
    }
  }
}

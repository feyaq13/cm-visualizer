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
    this._ingredientContainers = document.getElementsByClassName('container');
    this._buttonElementsNav = document.getElementsByClassName('coffee-list')[0];
    this._cupElement = document.getElementsByClassName('coffee-cup')[0];
    this.setupControlsHandlers();
  }

  setupEvents(machine) {
    machine.onEvents({
      coffeeReady: (ingredientsAvailable) => {
        this.stopAnimation('busy');
        this.enableAllButtons();
        console.log('Кофе готов!');
        this.showIngredientsAvailable(ingredientsAvailable);
      },
      noMilk: () => {
        console.log('кажется нет молока');
        this.stopAnimation('busy');
        this.startAnimation('error');
      },
      noGrains: () => {
        console.log('нет зерен');
        this.stopAnimation('busy');
        this.startAnimation('error');
      },
      replenishmentOfIngredients: (ingredientsAvailable, amount) => {
        console.log(`пополняю запасы на ${amount}`)
        this.stopAnimation('error');

        this.showIngredientsAvailable(ingredientsAvailable);
        console.log('я готова делать кофе!');
      },
      noWater: () => {
        console.log('кажется нет воды');
        this.stopAnimation('busy');
        this.startAnimation('error');
      },
      whipping: () => {
        console.log('взбиваю 🥛...');
      },
      pouring: ({ colorCoffee }) => {
        this.startPouringDrinkAnimation(40, colorCoffee);
        this.playSound(this.pouringCoffeeSound);
      },
      cleaning: () => {
        console.log('очищаю...');
      },
      clear: () => {
        console.log('очистил 🧹');
      },
      ready: () => {
        this.stopAnimation('busy');
        this.setupOnMakeCoffeeTypesOnEventClick((coffeeType) => coffeeType);
        console.log('я готова делать кофе!');
      },
      checking: () => {
        console.log('проверяю...');
        this.startAnimation('busy');
      },
      brewing: ({ coffeeType }) => {
        console.log(`завариваю ${coffeeType.coffeeName}`);
      },
      welcome: ({ coffeeTypes, ingredientsAvailable }) => {
        this.showTypesCoffee(coffeeTypes);
        this.showIngredientsAvailable(ingredientsAvailable);
        console.log(`
        Добро пожаловать!
        Ознакомьтесь, пожалуйста, с нашим меню:
        ${coffeeTypes.join(', ')}
        Для выбора напитка просто напишите его название.
        Приятного аппетита!
      `);
      },
    });
  }

  showIngredientsAvailable(ingredientsAvailable) {
    const listIngredients = document.getElementsByClassName('information')[0];
    const itemsIngredient = listIngredients.children;
    for (const ingName of Object.keys(ingredientsAvailable)) {
      if (ingredientsAvailable.hasOwnProperty(ingName)) {
        Array.prototype.forEach.call(itemsIngredient, item =>
          item.dataset.name === ingName ? item.textContent = `${ingName}: ${ingredientsAvailable[ingName]}` :  ''
        )
      }
    }
  }

  setupOnMakeCoffeeTypesOnEventClick() {
    this._buttonElementsNav.addEventListener('click', (e) => {
      if (e.target.type === 'button') {
        this.startAnimation('busy');
        this.disableAllButtons(e);

        this._emit('coffeeSelected', { coffeeName: e.target.textContent });
      }
    });
  }

  disableAllButtons(e) {
    Array.prototype.forEach.call(
      e.currentTarget.getElementsByTagName('button'),
      (button) => (button.disabled = true));
  }

  enableAllButtons() {
    Array.prototype.forEach.call(
      this._buttonElementsNav.getElementsByTagName('button'),
      (button) => (button.disabled = false),
    );
  }

  playSound(sound) {
    sound.play();
  }

  startAnimation(type) {
    this._switchOnButton.classList.add(`${type}-mode`);
  }

  stopAnimation(type) {
    this._switchOnButton.classList.remove(`${type}-mode`);
  }

  startPouringDrinkAnimation(ms, colorCoffee) {
    this._cupElement.style.fill = colorCoffee;
    this._cupElement.classList.add('pouring-mode');
    this._cupElement.style.animationDuration = `${ms}ms`;
  }

  setupControlsHandlers() {
    Array.prototype.forEach.call(this._buttonElements, (button) =>
      button.addEventListener('click', this.playSound.bind(this, this.clickButtonsSound)),
    );

    this._switchOnButton.addEventListener('click', () => {
      this._eventHandlers.switchOn.forEach((handler) => handler());
    });

    document.getElementsByClassName('button-clean-waste')[0]
    .addEventListener('click', () => {
      this._eventHandlers.cleanUp.forEach((handler) => handler());
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

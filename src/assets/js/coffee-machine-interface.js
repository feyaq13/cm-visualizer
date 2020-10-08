import { AudioManager } from './audio-manager';
import pouringCoffeeSound from '../sounds/pouring-coffee.mp3';
import clickButtonSound from '../sounds/switch-click-button.mp3';
import { Publisher } from './coffee-machine';

export class CoffeeMachineInterface extends Publisher {
  constructor() {
    super();
    this.clickButtonsSound = new AudioManager(clickButtonSound);
    this.pouringCoffeeSound = new AudioManager(pouringCoffeeSound);
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
        this.pouringCoffeeSound.stop();
        this._emit('fullCup')
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable)
        this.setupOnMakeCoffeeTypesOnEventClick();
      },
      noMilk: () => {
        console.log('кажется нет молока');
        this.stopAnimation('busy');
        this.startAnimation('error');
        this.fullIn('milk')
        this.showContainerIsEmpty('milk')
      },
      noGrains: () => {
        console.log('нет зерен');
        this.stopAnimation('busy');
        this.startAnimation('error');
        this.fullIn('grain')
        this.showContainerIsEmpty('grain')
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
        this.showContainerIsEmpty('water')
        this.fullIn('water')
      },
      whipping: () => {
        console.log('взбиваю 🥛...');
      },
      pouring: ({ colorCoffee }) => {
        this.startPouringDrinkAnimation(9500, colorCoffee);
        this.pouringCoffeeSound.play();
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
      checking: (isFullCup) => {
        console.log('проверяю...');
        if (isFullCup) {
          this._cupElement.classList.remove('pouring-mode');
        }
        this.startAnimation('busy');
      },
      brewing: ({ coffeeType }) => {
        console.log(`завариваю ${coffeeType.coffeeName}`);
      },
      welcome: ({ coffeeTypes, ingredientsAvailable }) => {
        this.showTypesCoffee(coffeeTypes);
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable);
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

  renderIngredientsAvailable(ingredientsAvailable) {
      Array.prototype.map.call(document.getElementsByClassName('container'),
        (container) => {
          for (const name in ingredientsAvailable) {
            const ingredient = container.getElementsByClassName(`${name}`)[0]
            if (ingredient) {
              ingredient.style.clipPath = `polygon(0 ${100 - ingredientsAvailable[name]}%, 100% ${100 - ingredientsAvailable[name]}%, 100% 100%, 0 100%)`
            }
          }
      })
  }

  fullIn(containerName) {
    Array.prototype.find.call(
      this._ingredientContainers,
      (container => container.children[0].dataset.containerName === containerName)
    )
    .addEventListener('click', () => {
      const amountOf = prompt('Сколько положить?', '100')
      alert(`Пополнение в ${containerName}: ${amountOf}`)
      this._emit('fulledIn', {amountOf, containerName})
    })
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
    }, {once: true} );
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

  startAnimation(type) {
    this._switchOnButton.classList.add(`${type}-mode`);
  }

  stopAnimation(type) {
    this._switchOnButton.setAttribute('aria-checked', 'true');
    this._switchOnButton.classList.remove(`${type}-mode`);
  }

  startPouringDrinkAnimation(ms, colorCoffee) {
    this._cupElement.style.fill = colorCoffee;
    this._cupElement.classList.add('pouring-mode');
    this._cupElement.style.animationDuration = `${ms}ms`;
  }

  setupControlsHandlers() {
    Array.prototype.forEach.call(this._buttonElements, (button) =>
      button.addEventListener('click', this.clickButtonsSound.play.bind(this.clickButtonsSound)),
    );

    this._switchOnButton.addEventListener('click', () => {
      this._eventHandlers.switchOn.forEach((handler) => handler());
    }, {once: true} );

    document.getElementsByClassName('button-clean-waste')[0]
    .addEventListener('click', () => {
      this._eventHandlers.cleanUp.forEach((handler) => handler());
    });

  }

  showContainerIsEmpty(containerName) {
    Array.prototype.find.call(
      document.getElementsByClassName('container-inner'),
      (container) => container.dataset.containerName === containerName
    ).classList.add('error-mode');
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

import { Hints } from './coffee-machine-hints';
import { AudioManager } from './audio-manager';
import { Publisher } from './coffee-machine';
import { CoffeeCup } from './coffee-cup';

export class CoffeeMachineInterface extends Publisher {
  constructor(hints) {
    super();
    this._audioManager = new AudioManager({ volume: 0.5 });
    this._buttonElements = document.getElementsByClassName('button');
    this._switchOnButton = Array.prototype.filter.call(this._buttonElements, (button) =>
      button.classList.contains('button_is-switch-on'),
    )[0];
    this._ingredientContainers = document.getElementsByClassName('container');
    this._buttonElementsNav = document.getElementsByClassName('coffee-list')[0];
    this._cup = new CoffeeCup({
      _cupElement: document.getElementsByClassName('coffee-cup-factor')[0],
      _pouredLiquidElement: document.getElementsByClassName('coffee-cup')[0]
    });
    this._hinter = typeof hints === 'undefined' ? null : new Hints(
      [this._switchOnButton, ...this._ingredientContainers, this._cup._cupElement]
    );
    this.boundhandlerOnSelectedCoffee = this.handlerOnSelectedCoffee.bind(this)
    this.boundclickButtonsSound = this._audioManager.play.bind(this._audioManager, 'clickButtonsSound')
    this.setupClickButtonsSound()
    this.setupSwitchOnHandler()
  }

  setupEvents(machine) {
    machine.onEvents({
      coffeeReady: (ingredientsAvailable) => {
        this.stopAnimation('busy');
        this.enableAllButtons();
        this._audioManager.stop('grindCoffeeBeansSound');
        this.setupOnMakeCoffeeTypesOnEventClick();
        console.log('Кофе готов!');
        this._audioManager.stop('pouringCoffeeSound')
        // this.emit('filledCup')
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable)
      },
      // noMilk: () => {
      //   console.log('кажется нет молока');
      //   this.stopAnimation('busy');
      //   this.startAnimation('error');
      //   this.showContainerStatus('milk');
      //   this.fillContainer('milk');
      // },
      // noGrains: () => {
      //   console.log('нет зерен');
      //   this.stopAnimation('busy');
      //   this.startAnimation('error');
      //   this.showContainerStatus('grain');
      //   this.fillContainer('grain');
      // },
      // replenishmentOfIngredients: (data) => {
      //   if (Object.values(data.ingredientsAvailable).every(ingredientAmount => ingredientAmount > 10)) {
      //     this.stopAnimation('error');
      //     this._emit('filledAllContainers')
      //   }
      //
      //   this.showIngredientsAvailable(data.ingredientsAvailable);
      //   this.renderIngredientsAvailable(data.ingredientsAvailable)
      // },
      returnCoffeeTypes: (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes)
        this.enableAllButtons()
        this.setupOnMakeCoffeeTypesOnEventClick()
      },
      // noWater: () => {
      //   console.log('кажется нет воды');
      //   this.stopAnimation('busy');
      //   this.startAnimation('error');
      //   this.showContainerStatus('water')
      //   this.fillContainer('water')
      // },
      whipping: () => {
        console.log('взбиваю 🌀...');
      },
      pouring: ({ colorCoffee, ms }) => {
        this.startPouringDrinkAnimation(ms, colorCoffee);
        this._audioManager.play('pouringCoffeeSound')
        console.log('наливаю 🥛...');
      },
      cleaning: () => {
        console.log('очищаю...');
      },
      clear: () => {
        console.log('очистил 🧹');
      },
      ready: (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes);
        this.stopAnimation('busy');
        this.setupOnMakeCoffeeTypesOnEventClick();
        this.setupSwitchOffHandler()
        console.log('я готова делать кофе!');
      },
      off: () => {
        this.removeOnMakeCoffeeTypesOnEventClick()
        this.setupSwitchOnHandler()
        this._switchOnButton.setAttribute('aria-checked', 'false');
        console.clear()
      },
      checking: (cupIsFull) => {
        console.log('проверяю...');
        if (cupIsFull) {
          this._cup._pouredLiquidElement.classList.remove('pouring-mode');
        }
        this.startAnimation('busy');
      },
      brewing: ({ coffeeType }) => {
        this._audioManager.play('grindCoffeeBeansSound')
        console.log(`завариваю ${coffeeType.coffeeName}`);
      },
      welcome: ({ coffeeTypes, ingredientsAvailable }) =>
        this.greeting({
        coffeeTypes, ingredientsAvailable
      })
    });
  }

  renderIngredientsAvailable(ingredientsAvailable) {
    Array.prototype.map.call(document.getElementsByClassName('container'),
      (container) => {
        for (const name of Reflect.ownKeys(ingredientsAvailable)) {
          const ingredient = container.getElementsByClassName(`${name}`)[0]
          if (ingredient) {
            ingredient.style.clipPath =
              `polygon(0 ${100 - ingredientsAvailable[name]}%,
               100% ${100 - ingredientsAvailable[name]}%, 100% 100%, 0 100%)`
          }
        }
    })
  }

  // fillContainer(containerName) {
  //   Array.prototype.find.call(
  //     this._ingredientContainers,
  //     (container => container.children[0].dataset.containerName === containerName)
  //   )
  //   .addEventListener('click', () => {
  //     let amountOf = prompt('Сколько положить?', '100')
  //     if (amountOf > 100 || amountOf === null) {
  //       amountOf = 100;
  //     }
  //
  //     this.showContainerStatus(containerName);
  //     this._audioManager.play('fillingContainerSound');
  //     // alert(`Пополнение в ${containerName}: ${amountOf}`)
  //     this._emit('fillingContainer', {containerName, amountOf})
  //   })
  // }

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
    this._buttonElementsNav.addEventListener('click', this.boundhandlerOnSelectedCoffee);
  }

  removeOnMakeCoffeeTypesOnEventClick() {
    this._buttonElementsNav.removeEventListener('click', this.boundhandlerOnSelectedCoffee);
  }

  handlerOnSelectedCoffee(e) {
    console.clear()
    if (e.target.type === 'button') {
      this.startAnimation('busy');
      this.disableAllButtons(e);
      this.removeOnMakeCoffeeTypesOnEventClick()

      this.emit('coffeeSelected', e.target.textContent);
    }
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
    this._cup._pouredLiquidElement.style.fill = colorCoffee;
    this._cup._pouredLiquidElement.classList.add('pouring-mode');
    this._cup._pouredLiquidElement.style.animationDuration = `${ms}ms`;
  }

  setupClickButtonsSound() {
    Array.prototype.forEach.call(this._buttonElements, (button) =>
      button.addEventListener('click', this.boundclickButtonsSound)
    );

    //
    // document.getElementsByClassName('button-clean-waste')[0]
    // .addEventListener('click',
    //   () => this._eventHandlers.cleanUp.forEach((handler) => handler()));
  }

  setupSwitchOnHandler() {
    this._switchOnButton.addEventListener('click', () => {
      this._eventHandlers.switchOn.forEach((handler) => handler());
    }, {once: true});
  }

  setupSwitchOffHandler() {
    this._switchOnButton.addEventListener('click', () => {
      this._eventHandlers.switchOff.forEach((handler) => handler());
    }, {once: true});
  }

  // showContainerStatus(containerName) {
  //   const targetContainer = Array.prototype.find.call(
  //     document.getElementsByClassName('container-inner'),
  //     (container) => container.dataset.containerName === containerName
  //   )
  //
  //   targetContainer.classList.toggle('error-mode');
  // }

  greeting({ coffeeTypes, ingredientsAvailable }) {
    this.renderIngredientsAvailable(ingredientsAvailable);
    this.showIngredientsAvailable(ingredientsAvailable);
    console.log(`
      Добро пожаловать!
      Ознакомьтесь, пожалуйста, с нашим меню:
      ${coffeeTypes.join(', ')}
      Для выбора напитка просто выберете его в панели навигации.
      Приятного аппетита!
    `);
  }

  showTypesCoffee(coffeeTypes) {
    if (this._buttonElementsNav.childElementCount === 0) {
      const coffeeListElement = this._buttonElementsNav;

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

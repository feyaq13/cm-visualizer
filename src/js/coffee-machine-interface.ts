import { Hints } from './coffee-machine-hints';
import { AudioManager } from './audio-manager';
import { CoffeeCup } from './coffee-cup';
import { Publisher } from './publisher';
import { CoffeeMachineEvents, CoffeeMachinePublisher } from './coffee-machine';

export enum CoffeeMachineInterfaceEvents {
  SwitchOn = 'switchOn',
  SwitchOff = 'switchOff',
  CoffeeSelected = 'coffeeSelected',
}

export interface InterfacePublisher {
  onEvents(param: { [key in CoffeeMachineInterfaceEvents]?: Function });
  setupEvents(machine: CoffeeMachinePublisher);
}

export class CoffeeMachineInterface extends Publisher implements InterfacePublisher {
  private audioManager: AudioManager;
  private buttonElements: HTMLCollectionOf<Element>;
  private switchOnButton: Element;
  private ingredientContainers: HTMLCollectionOf<Element>;
  private buttonElementsNav: Element;
  private cup: CoffeeCup;
  // private hinter: Hints;
  private boundHandlerOnSelectedCoffee: (e: Event) => void;

  constructor({ hints }: { hints?: boolean }) {
    super();
    this.audioManager = new AudioManager({ volume: 0.5 });
    this.buttonElements = document.getElementsByClassName('button');
    this.switchOnButton = Array.prototype.filter.call(this.buttonElements, (button) =>
      button.classList.contains('button_is-switch-on'),
    )[0];
    this.ingredientContainers = document.getElementsByClassName('container');
    this.buttonElementsNav = document.getElementsByClassName('coffee-list')[0];
    this.cup = new CoffeeCup({
      cupElement: document.getElementsByClassName('coffee-cup-factor')[0],
      pouredLiquidElement: document.getElementsByClassName('coffee-cup')[0],
    });
    // this.hinter = hints ? new Hints(
    //   [this._switchOnButton, ...this._ingredientContainers, this._cup.cupElement],
    // ) : null;
    this.boundHandlerOnSelectedCoffee = this.handlerOnSelectedCoffee.bind(this);
    this.setupControlsHandlers();
  }

  setupEvents(machine: CoffeeMachinePublisher) {
    machine.onEvents({
      [CoffeeMachineEvents.CoffeeReady]: (ingredientsAvailable) => {
        this.stopAnimation('busy');
        this.enableAllButtons();
        this.audioManager.stop('grindCoffeeBeansSound');
        this.setupOnMakeCoffeeTypesOnEventClick();
        console.log('Кофе готов!');
        this.audioManager.stop('pouringCoffeeSound');
        // this.emit('filledCup')
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable);
      },
      [CoffeeMachineEvents.NoMilk]: () => {
        console.log('кажется нет молока');
        this.stopAnimation('busy');
        this.startAnimation('error');
        // this.showContainerStatus('milk');
        // this.fillContainer('milk');
      },
      [CoffeeMachineEvents.NoGrains]: () => {
        console.log('нет зерен');
        this.stopAnimation('busy');
        this.startAnimation('error');
        // this.showContainerStatus('grain');
        // this.fillContainer('grain');
      },
      [CoffeeMachineEvents.ReplenishmentOfIngredients]: (data) => {
        if (Object.values(data.ingredientsAvailable).every(ingredientAmount => ingredientAmount > 10)) {
          this.stopAnimation('error');
          // this._emit('filledAllContainers')
        }

        this.showIngredientsAvailable(data.ingredientsAvailable);
        this.renderIngredientsAvailable(data.ingredientsAvailable)
      },
      [CoffeeMachineEvents.ReturnCoffeeTypes]: (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes);
        this.enableAllButtons();
        this.setupOnMakeCoffeeTypesOnEventClick();
      },
      [CoffeeMachineEvents.Whipping]: () => {
        console.log('взбиваю 🌀...');
      },
      [CoffeeMachineEvents.Pouring]: ({ colorCoffee, ms }) => {
        this.startPouringDrinkAnimation(ms, colorCoffee);
        this.audioManager.play('pouringCoffeeSound');
        console.log('наливаю 🥛...');
      },
      [CoffeeMachineEvents.Cleaning]: () => {
        console.log('очищаю...');
      },
      [CoffeeMachineEvents.Clear]: () => {
        console.log('очистил 🧹');
      },
      [CoffeeMachineEvents.Ready]: (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes);
        this.stopAnimation('busy');
        this.setupOnMakeCoffeeTypesOnEventClick();
        this.setupSwitchOffHandler();
        console.log('я готова делать кофе!');
      },
      [CoffeeMachineEvents.Off]: () => {
        this.removeOnMakeCoffeeTypesOnEventClick();
        this.switchOnButton.setAttribute('aria-checked', 'false');
        this.setupControlsHandlers();
        console.clear();
      },
      [CoffeeMachineEvents.Checking]: (cupIsFull) => {
        console.log('проверяю...');
        if (cupIsFull) {
          this.cup.pouredLiquidElement.classList.remove('pouring-mode');
        }
        this.startAnimation('busy');
      },
      [CoffeeMachineEvents.Brewing]: ({ coffeeType }) => {
        this.audioManager.play('grindCoffeeBeansSound');
        console.log(`завариваю ${coffeeType.coffeeName}`);
      },
      [CoffeeMachineEvents.Welcome]: ({ coffeeTypes, ingredientsAvailable }) =>
        this.greeting({
          coffeeTypes,
          ingredientsAvailable,
        }),
    });
  }

  renderIngredientsAvailable(ingredientsAvailable) {
    Array.prototype.map.call(document.getElementsByClassName('container'), (container) => {
      for (const name of Reflect.ownKeys(ingredientsAvailable)) {
        const ingredient = container.getElementsByClassName(`${String(name)}`)[0];
        if (ingredient) {
          ingredient.style.clipPath = `polygon(0 ${100 - ingredientsAvailable[name]}%,
               100% ${100 - ingredientsAvailable[name]}%, 100% 100%, 0 100%)`;
        }
      }
    });
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
        Array.prototype.forEach.call(itemsIngredient, (item) =>
          item.dataset.name === ingName ? (item.textContent = `${ingName}: ${ingredientsAvailable[ingName]}`) : '',
        );
      }
    }
  }

  setupOnMakeCoffeeTypesOnEventClick() {
    this.buttonElementsNav.addEventListener('click', this.boundHandlerOnSelectedCoffee);
  }

  removeOnMakeCoffeeTypesOnEventClick() {
    this.buttonElementsNav.removeEventListener('click', this.boundHandlerOnSelectedCoffee);
  }

  handlerOnSelectedCoffee(e) {
    console.clear();
    if (e.target.type === 'button') {
      this.startAnimation('busy');
      this.disableAllButtons(e);
      this.removeOnMakeCoffeeTypesOnEventClick();

      this.emit(CoffeeMachineInterfaceEvents.CoffeeSelected, e.target.textContent);
    }
  }

  disableAllButtons(e) {
    Array.prototype.forEach.call(e.currentTarget.getElementsByTagName('button'), (button) => (button.disabled = true));
  }

  enableAllButtons() {
    Array.prototype.forEach.call(
      this.buttonElementsNav.getElementsByTagName('button'),
      (button) => (button.disabled = false),
    );
  }

  startAnimation(type) {
    this.switchOnButton.classList.add(`${type}-mode`);
  }

  stopAnimation(type) {
    this.switchOnButton.setAttribute('aria-checked', 'true');
    this.switchOnButton.classList.remove(`${type}-mode`);
  }

  startPouringDrinkAnimation(ms, colorCoffee) {
    this.cup.pouredLiquidElement.style.fill = colorCoffee;
    this.cup.pouredLiquidElement.classList.add('pouring-mode');
    this.cup.pouredLiquidElement.style.animationDuration = `${ms}ms`;
  }

  setupControlsHandlers() {
    Array.prototype.forEach.call(this.buttonElements, (button) =>
      button.addEventListener('click', this.audioManager.play.bind(this.audioManager, 'clickButtonsSound')),
    );

    this.switchOnButton.addEventListener(
      'click',
      () => {
        this.eventHandlers.switchOn.forEach((handler) => handler());
      },
      { once: true },
    );
    //
    // document.getElementsByClassName('button-clean-waste')[0]
    // .addEventListener('click',
    //   () => this._eventHandlers.cleanUp.forEach((handler) => handler()));
  }

  setupSwitchOffHandler() {
    this.switchOnButton.addEventListener(
      'click',
      () => {
        this.eventHandlers.switchOff.forEach((handler) => handler());
      },
      { once: true },
    );
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
    if (this.buttonElementsNav.childElementCount === 0) {
      const coffeeListElement = this.buttonElementsNav;

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

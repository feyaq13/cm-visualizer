import { AudioManager } from './audio-manager';
import { CoffeeCup } from './coffee-cup';
import { AbstractCoffeeMachineUI } from './abstract-coffee-machine-ui';

export class CoffeeMachineGUI extends AbstractCoffeeMachineUI {
  private audioManager: AudioManager;
  private buttonElements: HTMLCollectionOf<Element>;
  private switchOnButton: Element;
  private coffeeMachineElement: Element;
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
    this.coffeeMachineElement = document.getElementsByClassName('coffee-machine')[0]
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

  setupEvents(machine) {
    machine.onEvents({
      'coffeeReady': (ingredientsAvailable) => {
        this.stopAnimation('busy');
        this.enableAllButtons();
        this.audioManager.stop('grindCoffeeBeansSound');
        this.setupOnMakeCoffeeTypesOnEventClick();
        console.log('Кофе готов!');
        this.audioManager.stop('pouringCoffeeSound');
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable);
      },
      'noAnythingIngredient': () => {
        this.stopAnimation('busy');
        this.startAnimation('error');
      },
      'noMilk': () => {
        console.log('кажется нет молока');
        // this.stopAnimation('busy');
        // this.startAnimation('error');
        this.showContainerStatus('milk');
        this.fillContainer('milk');
      },
      'noGrains': () => {
        console.log('нет зерен');
        // this.stopAnimation('busy');
        // this.startAnimation('error');
        this.showContainerStatus('grain');
        this.fillContainer('grain');
      },
      'noWater': () => {
        console.log('нет воды');
        // this.stopAnimation('busy');
        // this.startAnimation('error');
        this.showContainerStatus('water');
        this.fillContainer('water');
      },
      'replenishmentOfIngredients': (data) => {
        if (Object.values(data).every(ingredientAmount => ingredientAmount > 10)) {
          this.stopAnimation('error');
          this.emit('filledAllContainers')
        }
      },
      'returnCoffeeTypes': (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes);
        this.enableAllButtons();
        this.setupOnMakeCoffeeTypesOnEventClick();
      },
      'whipping': () => {
        console.log('взбиваю 🌀...');
      },
      'pouring': ({ colorCoffee, ms }) => {
        this.startPouringDrinkAnimation(ms, colorCoffee);
        this.audioManager.play('pouringCoffeeSound');
        console.log('наливаю 🥛...');
      },
      'cleaning': () => {
        console.log('очищаю...');
      },
      'clear': () => {
        console.log('очистил 🧹');
      },
      'canOff': () => {
        // ???? //
        this.setupSwitchOffHandler();
      },
      'ready': (coffeeTypes) => {
        this.showTypesCoffee(coffeeTypes);
        this.stopAnimation('busy');
        this.setupOnMakeCoffeeTypesOnEventClick();
        this.setupSwitchOffHandler();
        console.log('я готова делать кофе!');
      },
      'on': () => {
        this.coffeeMachineElement.classList.remove('off')
      },
      'off': () => {
        this.removeOnMakeCoffeeTypesOnEventClick();
        this.switchOnButton.setAttribute('aria-checked', 'false');
        this.coffeeMachineElement.classList.add('off');
        this.setupControlsHandlers();
        console.log('\n\n\n\n\n\n\n\n');
      },
      'checking': (cupIsFull) => {
        console.log('проверяю...');
        if (cupIsFull) {
          this.cup.pouredLiquidElement.classList.remove('pouring-mode');
        }
        this.startAnimation('busy');
      },
      'brewing': ({ coffeeType }) => {
        this.audioManager.play('grindCoffeeBeansSound');
        console.log(`завариваю ${coffeeType.coffeeName}`);
      },
      'welcome': (coffeeTypes) => this.greeting(coffeeTypes),
      'init': (ingredientsAvailable) => {
        this.showIngredientsAvailable(ingredientsAvailable);
        this.renderIngredientsAvailable(ingredientsAvailable);
      }
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

  fillContainer(containerName) {
    Array.prototype.find.call(
      this.ingredientContainers,
      (container => container.children[0].dataset.containerName === containerName)
    )
    .addEventListener('click', () => {
      let amountOf = +prompt('Сколько положить?', '100')
      if (amountOf > 100 || amountOf === null) {
        amountOf = 100;
      }

      this.renderInfoContainer(containerName, amountOf)

      this.showContainerStatus(containerName);
      this.audioManager.play('fillingContainerSound');
      console.log(`Пополнение в ${containerName}: ${amountOf}`)
      this.emit('filledContainer', { containerName, amountOf })
    })
  }

  renderInfoContainer(containerName: string, amountOf: number) {
    const container = <HTMLElement>document.getElementsByClassName(containerName)[0]
    document.getElementsByClassName(`coffee-machine__${containerName}`)[0]
      .textContent = String(containerName + ": " + amountOf);
    container.style
      .clipPath = `polygon(0 ${100 - amountOf}%, 100% ${100 - amountOf}%, 100% 100%, 0 100%)`;
  }

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

      this.emit('coffeeSelected', e.target.textContent);
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

  showContainerStatus(containerName) {
    const targetContainer = Array.prototype.find.call(
      document.getElementsByClassName('container-inner'),
      (container) => container.dataset.containerName === containerName
    )

    // в данном случае тоглить !!!! нецелесообразно !!!!

    targetContainer.classList.toggle('error-mode');
  }

  showIngredients(ingredientsAvailable) {
    this.renderIngredientsAvailable(ingredientsAvailable);
    this.showIngredientsAvailable(ingredientsAvailable);
  }

  greeting({coffeeTypes}) {
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

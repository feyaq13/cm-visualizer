export class CoffeeMachine {
  constructor(machineInterface, hasCappuccinoMaker) {
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    this._machineInterface = machineInterface;
    this.isOn = false;
    this._isClean = true;
    this._isBroken = false;
    this.recipes = [
      {
        coffeeName: 'cappuccino',
        color: '#CFAA8F',
        recipe: {
          withMilk: true,
          milkRequired: 20,
          waterRequired: 10,
          grainRequired: 20,
        },
      },
      {
        coffeeName: 'raf',
        color: '#CFA780',
        recipe: {
          withMilk: true,
          milkRequired: 20,
          waterRequired: 10,
          grainRequired: 20,
        },
      },
      {
        coffeeName: 'dark coffee',
        color: '#4F240A',
        recipe: {
          withMilk: false,
          milkRequired: 0,
          waterRequired: 10,
          grainRequired: 20,
        },
      },
    ];
    this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this._grainAvailable = 100;
    this._waterAvailable = 100;
    this._milkAvailable = 100;
    this._init();
  }

  _init() {
    console.log(`
      Добро пожаловать!
      Ознакомьтесь, пожалуйста, с нашим меню:
      ${this.coffeeTypes.join(', ')}
      Для выбора напитка просто напишите его название.
      Приятного аппетита!
    `);

    this._machineInterface.setupPlaySoundOnEventClick();
    this._machineInterface.setupOnSwitchOnEventClick(this.pendingSelectCoffee.bind(this));
    this._machineInterface.showTypesCoffee(this.coffeeTypes);
    this._machineInterface.setupOnCleanWasteOnEventClick(this.clean.bind(this));
  }

  searchTargetRecipe(coffeeType) {
    return this.recipes.find((recipe) => recipe.coffeeName === coffeeType);
  }

  clean() {
    if (this._wasteAmount >= 50 && this._wasteAmount <= 100) {
      this._wasteAmount = 0;
      console.log('очистил 🧹');
    }

    this._isClean = true;
    return true;
  }

  _checkContentsForMakingCoffee() {
    if (this._grainAvailable <= 0) {
      console.log('добавьте кофе');

      return false;
    }

    if (this._waterAvailable <= 0) {
      console.log('долейте воды');

      return false;
    }

    if (this._milkAvailable <= 0) {
      console.log(
        `
    уровень молока ниже необходимого: ${this._milkAvailable},
    долейте молока
    `,
      );
      return false;
    }

    return true;
  }

  _prepare(delayMs) {
    console.log('проверяю...');
    return new Promise((resolve, reject) => {
      this._machineInterface.onPendingAnimation();

      this._delay(delayMs).then(() => {
        if (!this._isClean && !this._isBroken) {
          console.log('очищаю...');
          this.clean();
        }

        if (!this._checkContentsForMakingCoffee()) {
          reject(new Error('добавьте недостающее в кофе-машину!'));
          return false;
        }

        resolve(console.log('я готова делать кофе!'));
        this._machineInterface.stopPendingAnimation();
      });
    });
  }

  pendingSelectCoffee(selectedCoffeeType) {
    if (this.isOn) {
      this.afterTurnOn();
      return this._makeCoffee(this.searchTargetRecipe(selectedCoffeeType)).then(() =>
        this._machineInterface.enableAllButtons(),
      );
    } else {
      this.turnOn();
    }
  }

  turnOn() {
    this.isOn = true;
    this._prepare(0).then(this.afterTurnOn());
  }

  afterTurnOn() {
    return this._machineInterface
      .setupOnMakeCoffeeTypesOnEventClick((coffeeType) => coffeeType)
      .then((coffeeType) => this.pendingSelectCoffee(coffeeType));
  }

  _makeCoffee(coffeeType) {
    return new Promise((resolve) => {
      console.log(`завариваю ${coffeeType.coffeeName}`);
      resolve(this._brewCoffee(coffeeType, 4000));
    });
  }

  _brewCoffee(coffeeType, ms) {
    return new Promise((resolve) => {
      this._delay(ms).then(() => {
        this._consumeIngredients(coffeeType);

        if (coffeeType.recipe.withMilk) {
          this._whipMilk()
            .then(
              () => this._pourCoffee(coffeeType.color),
              (err) => console.error(new Error('красная кнопка заглушка!1'), err),
            )
            .then(resolve);
        } else {
          this._pourCoffee(coffeeType.color).then(resolve);
        }
      });
    });
  }

  _consumeIngredients(coffeeType) {
    const { waterRequired, grainRequired, milkRequired } = coffeeType.recipe;

    this._milkAvailable -= milkRequired;
    this._grainAvailable -= grainRequired;
    this._waterAvailable -= waterRequired;
    this._wasteAmount += grainRequired;

    this._isClean = false;
  }

  _pourCoffee(colorCoffee) {
    return new Promise((resolve) => {
      this._machineInterface.onPouringDrinkAnimation(4, colorCoffee);

      this._delay(10000).then(() => {
        this._machineInterface.stopPendingAnimation();
        resolve(console.log('кофе готов!'));
      });
    });
  }

  _delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  _whipMilk() {
    return new Promise((resolve, reject) => {
      this._delay(2000).then(() => {
        if (this._hasCappuccinoMaker && this._milkAvailable > 0) {
          resolve(console.log('взбиваю 🥛...'));
        } else {
          reject(console.log('кажется нет молока'));
        }
      });
    });
  }
}

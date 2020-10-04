export class Publisher {
  constructor() {
    this._eventHandlers = {};
  }

  _emit(event, data) {
    this._eventHandlers[event].forEach((handler) => handler(data));
  }

  on(event, handler) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
    }

    this._eventHandlers[event].push(handler);
  }

  onEvents(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.on(key, obj[key]);
      }
    }
  }
}

export class CoffeeMachine extends Publisher {
  constructor(config) {
    super();
    const { hasCappuccinoMaker, dev, interfaces, recipes } = config;
    this._isDev = dev;
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    this.isOn = false;
    this._isClean = true;
    this._isBroken = false;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this._ingredientsAvailable = {
      grainAvailable: 100,
      waterAvailable: 100,
      milkAvailable: 100,
    };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this.pendingSelectCoffee(),
        cleanUp: () => this.clean(),
        coffeeSelected: ({ coffeeName }) => {
          const coffeeType = this.searchTargetRecipe(coffeeName);
          this._brewCoffee(coffeeType);
        },
      });

      machineInterface.setupEvents(this);
    });

    this._emit('welcome', { coffeeTypes: this.coffeeTypes, ingredientsAvailable: this._ingredientsAvailable });
  }

  searchTargetRecipe(coffeeName) {
    return this.recipes.find((recipe) => recipe.coffeeName === coffeeName);
  }

  clean() {
    if (this._wasteAmount >= 50 && this._wasteAmount <= 100) {
      this._wasteAmount = 0;
      this._emit('clear');
    }

    this._isClean = true;
    return true;
  }

  _ingredientsAreSufficient() {
    if (this._ingredientsAvailable.grainAvailable <= 0) {
      this._emit('noGrains');

      return false;
    }

    if (this._ingredientsAvailable.waterAvailable <= 0) {
      this._emit('noWater');

      return false;
    }

    if (this._ingredientsAvailable.milkAvailable <= 0) {
      this._emit('noMilk');

      return false;
    }

    return true;
  }

  _prepare(delayMs) {
    this._emit('checking');

    this._delay(delayMs).then(() => {
      if (!this._isClean && !this._isBroken) {
        this._emit('cleaning');
        this.clean();
      }

      if (!this._ingredientsAreSufficient()) {
        return;
      }

      this._emit('ready');
    });
  }

  pendingSelectCoffee(selectedCoffeeType) {
    if (this.isOn) {
      this._emit('ready');

      this._brewCoffee(this.searchTargetRecipe(selectedCoffeeType));
    } else {
      this.turnOn();
    }
  }

  turnOn() {
    this.isOn = true;
    this._prepare(1000);
  }

  _brewCoffee(coffeeType, ms = 4000) {
    this._emit('brewing', { coffeeType });

    this._delay(ms).then(() => {
      this._consumeIngredients(coffeeType);

      if (coffeeType.recipe.withMilk) {
        this._whipMilk()
          .then(() => this._pourCoffee(coffeeType.color))
          .catch((e) => console.error(new Error('красная кнопка заглушка!1'), e));
      } else {
        this._pourCoffee(coffeeType.color);
      }
    });
  }

  _consumeIngredients(coffeeType) {
    const { waterRequired, grainRequired, milkRequired } = coffeeType.recipe;

    this._ingredientsAvailable.milkAvailable -= milkRequired;
    this._ingredientsAvailable.grainAvailable -= grainRequired;
    this._ingredientsAvailable.waterAvailable -= waterRequired;
    this._wasteAmount += grainRequired;

    this._isClean = false;
  }

  _pourCoffee(colorCoffee) {
    this._emit('pouring', { colorCoffee });
    this._delay(10000).then(() => {
      this._emit('coffeeReady', this._ingredientsAvailable);
    });
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, this._isDev ? 10 : ms));
  }

  _whipMilk() {
    return this._delay(2000).then(() => {
      if (this._hasCappuccinoMaker && this._ingredientsAvailable.milkAvailable > 0) {
        this._emit('whipping');
      } else {
        this._emit('noMilk');
      }
    });
  }
}

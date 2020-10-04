export class Publisher {
  constructor() {
    this._eventHandlers = {};
  }

  _emit(event, data) {
    this._eventHandlers[event].forEach((handler) => handler(data));
  }

  on(event, handler) {
    this._eventHandlers[event].push(handler);
  }
}

export class CoffeeMachine extends Publisher {
  constructor(config) {
    super();
    const { hasCappuccinoMaker, dev, interfaces } = config;
    this._isDev = dev;
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    this.isOn = false;
    this._isClean = true;
    this._eventHandlers = {
      noWater: [],
      noGrains: [],
      noMilk: [],
      whipping: [],
      coffeeReady: [],
      brewing: [],
      welcome: [],
      pouring: [],
      cleaning: [],
      ready: [],
      clear: [],
      checking: [],
    };
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
    this._ingredientsAvailable = {
      get grainAvailable() {
        return this._grainAvailable;
      },
      set grainAvailable(value) {
        this._grainAvailable = value;
      },
      get waterAvailable() {
        return this._waterAvailable;
      },
      set waterAvailable(value) {
        this._waterAvailable = value;
      },
      get milkAvailable() {
        return this._milkAvailable;
      },
      set milkAvailable(value) {
        this._milkAvailable = value;
      },
    };

    Object.defineProperties(this._ingredientsAvailable, {
      _grainAvailable: {
        value: 100,
        writable: true,
      },
      _waterAvailable: {
        value: 100,
        writable: true,
      },
      _milkAvailable: {
        value: 100,
        writable: true,
      },
    });

    interfaces.forEach((machineInterface) => {
      machineInterface.on('switchOn', this.pendingSelectCoffee.bind(this));
      machineInterface.on('cleanUp', this.clean.bind(this));
      machineInterface.on('coffeeSelected', ({ coffeeName }) => {
        const coffeeType = this.searchTargetRecipe(coffeeName);
        this._brewCoffee(coffeeType);
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
      this._emit('coffeeReady');
    });
  }

  _delay(ms) {
    const isDev = this._isDev;

    return new Promise((resolve) => {
      setTimeout(resolve, isDev ? 10 : ms);
    });
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

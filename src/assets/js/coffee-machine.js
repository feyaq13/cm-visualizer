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

  onEvents(eventsMap) {
    for (const event of Reflect.ownKeys(eventsMap)) {
      this.on(event, eventsMap[event]);
    }
  }
}

export class CoffeeMachine extends Publisher {
  constructor(config) {
    super();
    const { dev, interfaces, recipes } = config;
    this._isDev = dev;
    this.isOn = false;
    this._isFullCup = false;
    this._isClean = true;
    this._isBroken = false;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this._ingredientsAvailable = { grain: 100, water: 100, milk: 100 };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this._turnOn(),
        cleanUp: () => this.clean(),
        coffeeSelected: ({ coffeeName }) => {
          if (this._isFullCup) {
            debugger
            this._emit('checking', this._isFullCup);
            this._isFullCup = false;
          }

          if (this._ingredientsAreSufficient()) {
            const coffeeType = this.searchTargetRecipe(coffeeName);
            this._brewCoffee(coffeeType);
          } else {
            return false
          }
        },
        fulling: ({amountOf, containerName}) => {
          this._replenishmentOfIngredients(amountOf, containerName)
        },
        fulled: () => {
          this._getCoffeeTypes(this.coffeeTypes)
        },
        fullCup: () => {
          this._isFullCup = true;
        }
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
    let emptyContainers = [];
    if (this._ingredientsAvailable.grain <= 20) {
      emptyContainers.push(this._ingredientsAvailable.grain)
      this._emit('noGrains');
    }

    if (this._ingredientsAvailable.water <= 20) {
      emptyContainers.push(this._ingredientsAvailable.water)
      this._emit('noWater');
    }

    if (this._ingredientsAvailable.milk <= 20) {
      emptyContainers.push(this._ingredientsAvailable.milk)
      this._emit('noMilk');
    }

    return !emptyContainers.length
  }

  _replenishmentOfIngredients(amount, ingredient) {
    this._ingredientsAvailable[ingredient] = Number(amount);
    this._emit('replenishmentOfIngredients', {amount, ingredientsAvailable: this._ingredientsAvailable})
  }

  _getCoffeeTypes(coffeeTypes) {
    this._emit('returnCoffeeTypes', coffeeTypes)
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

      this._emit('ready', this.coffeeTypes);
    });
  }

  _turnOn() {
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

    this._ingredientsAvailable.milk -= milkRequired;
    this._ingredientsAvailable.grain -= grainRequired;
    this._ingredientsAvailable.water -= waterRequired;
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
      if (this._ingredientsAvailable.milk > 0) {
        this._emit('whipping');
      } else {
        this._emit('noMilk');
      }
    });
  }
}

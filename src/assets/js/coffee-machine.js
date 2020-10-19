import { CoffeeMachineState,
  Off, TurnOn, Prepare, Ready, CoffeeSelected, WhipMilk, PourCoffee, BrewCoffee,
  Idle, NoGrains, NoMilk, NoWater
} from './states'

export class Publisher {
  constructor() {
    this._eventHandlers = {};
  }

  emit(event, data) {
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
    this.state = new Off()
    this._isDev = dev;
    this.isOn = false;
    // this._cupIsFull = interfaces[0]._cup._isFull;
    this.cupIsFull = false
    this.isClean = true;
    this.isBroken = false;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this.ingredientsAvailable = { grain: 100, water: 100, milk: 100 };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this._turnOn(),
        switchOff: () => this._turnOff(),
        // cleanUp: () => this.clean(),
        coffeeSelected: ({ coffeeName }) => this.makeCoffee(coffeeName)
        // fillingContainer: ({amountOf, containerName}) => {
        //   this._replenishmentOfIngredients(amountOf, containerName)
        // },
        // filledAllContainers: () => {
        //   this._getCoffeeTypes(this.coffeeTypes)
        // },
        // filledCup: () => {
        //   this._cupIsFull = true;
        // }
      });

      machineInterface.setupEvents(this);
    });
  }

  searchTargetRecipe(coffeeName) {
    return this.recipes.find((recipe) => recipe.coffeeName === coffeeName);
  }

  clean() {
    if (this._wasteAmount >= 50 && this._wasteAmount <= 100) {
      this._wasteAmount = 0;
      this.emit('clear');
    }

    this.isClean = true;
    return true;
  }

  makeCoffee(coffeeName) {
    this._setState(CoffeeSelected);
    this.emit('checking', this._cupIsFull);
    this._cupIsFull = false;

    if (this.ingredientsAreSufficient()) {
      const coffeeType = this.searchTargetRecipe(coffeeName);
      // this._brewCoffee(coffeeType);
    } else {
      return false
    }
  }

  ingredientsAreSufficient() {
    let emptyContainers = [];
    if (this.ingredientsAvailable.grain <= 20) {
      emptyContainers.push(this.ingredientsAvailable.grain)
      this.emit('noGrains');
    }

    if (this.ingredientsAvailable.water <= 20) {
      emptyContainers.push(this.ingredientsAvailable.water)
      this.emit('noWater');
    }

    if (this.ingredientsAvailable.milk <= 20) {
      emptyContainers.push(this.ingredientsAvailable.milk)
      this.emit('noMilk');
    }

    return !emptyContainers.length
  }

  // _replenishmentOfIngredients(amount, ingredient) {
  //   if (this._ingredientsAvailable[ingredient] + amount < 100 ) {
  //     this._ingredientsAvailable[ingredient] += amount;
  //   } else if (isNaN(amount)) {
  //     this._ingredientsAvailable[ingredient] = 100;
  //   } else {
  //     amount -= this._ingredientsAvailable[ingredient];
  //     this._ingredientsAvailable[ingredient] += amount;
  //   }
  //
  //   this._emit('replenishmentOfIngredients', {amount, ingredientsAvailable: this._ingredientsAvailable})
  // }

  // _getCoffeeTypes(coffeeTypes) {
  //   this._emit('returnCoffeeTypes', coffeeTypes)
  // }

  nextState() {
    this.state = this.state.next({
      context: this
    })

  }

  _setState(state) {
    this.state = new state({
      context: this
    })
  }

  _prepare(delayMs) {
    this.state.init(delayMs);
  }

  _turnOn() {
    this.isOn = true;
    if (this.state.name === 'off') {
      this._setState(TurnOn)
      this.state.init()
      this._prepare(2000);
    }
  }

  _turnOff() {
    debugger
    if (this.state.name !== 'coffeeSelected') {
      this.isOn = false;
      this._setState(Off);
      this.emit('off')
    }
  }

  // _brewCoffee(coffeeType, ms = 4000) {
  //   this._emit('brewing', { coffeeType });
  //
  //   this._delay(ms).then(() => {
  //     this._consumeIngredients(coffeeType);
  //
  //     if (coffeeType.recipe.withMilk) {
  //       this._whipMilk()
  //         .then(() => this._pourCoffee(coffeeType.color))
  //         .catch((e) => console.error(new Error('красная кнопка заглушка!1'), e));
  //     } else {
  //       this._pourCoffee(coffeeType.color);
  //     }
  //   });
  // }

  // _consumeIngredients(coffeeType) {
  //   const { waterRequired, grainRequired, milkRequired } = coffeeType.recipe;
  //
  //   this._ingredientsAvailable.milk -= milkRequired;
  //   this._ingredientsAvailable.grain -= grainRequired;
  //   this._ingredientsAvailable.water -= waterRequired;
  //   this._wasteAmount += grainRequired;
  //
  //   this._isClean = false;
  // }

  // _pourCoffee(colorCoffee) {
  //   this._emit('pouring', { colorCoffee });
  //   this._delay(10000).then(() => {
  //     this._emit('coffeeReady', this._ingredientsAvailable);
  //   });
  // }

  delay(ms) {
    return new Promise(
      (resolve) => setTimeout(resolve, this._isDev ? 10 : ms)
    );
  }

  // _whipMilk() {
  //   return this._delay(2000).then(() => {
  //     if (this._ingredientsAvailable.milk > 0) {
  //       this._emit('whipping');
  //     } else {
  //       this._emit('noMilk');
  //     }
  //   });
  // }
}

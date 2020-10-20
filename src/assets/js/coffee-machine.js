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
    this._recipes = recipes;
    this.coffeeTypes = this._recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this.ingredientsAvailable = { grain: 100, water: 100, milk: 100 };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this._turnOn(),
        switchOff: () => this._turnOff(),
        // cleanUp: () => this.clean(),
        coffeeSelected: (coffeeName) => this._makeCoffee(coffeeName)
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

  _searchTargetRecipe(coffeeName) {
    return this._recipes.find((recipe) => recipe.coffeeName === coffeeName);
  }

  clean() {
    if (this._wasteAmount >= 50 && this._wasteAmount <= 100) {
      this._wasteAmount = 0;
      this.emit('clear');
    }

    this.isClean = true;
    return true;
  }

  ingredientsAreSufficient() {
    let emptyContainers = [];

    //TODO - отрефакторить код покороче дабы избежать дублирования
    if (this.ingredientsAvailable.grain <= 20) {
      emptyContainers.push(this.ingredientsAvailable.grain)
      this._setState(NoGrains)
    }

    if (this.ingredientsAvailable.water <= 20) {
      emptyContainers.push(this.ingredientsAvailable.water)
      this._setState(NoWater)
    }

    if (this.ingredientsAvailable.milk <= 20) {
      emptyContainers.push(this.ingredientsAvailable.milk)
      this._setState(NoMilk)
    }

    return !emptyContainers.length
  }

  _replenishmentOfIngredients(amount, ingredient) {
    if (this.ingredientsAvailable[ingredient] + amount < 100 ) {
      this.ingredientsAvailable[ingredient] += amount;
    } else if (isNaN(amount)) {
      this.ingredientsAvailable[ingredient] = 100;
    } else {
      amount -= this.ingredientsAvailable[ingredient];
      this.ingredientsAvailable[ingredient] += amount;
    }

    this.emit('replenishmentOfIngredients', {amount, ingredientsAvailable: this._ingredientsAvailable})
  }

  _getCoffeeTypes(coffeeTypes) {
    this.emit('returnCoffeeTypes', coffeeTypes)
  }

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
    if (this.state.name === 'off') {
      this._setState(TurnOn)
      this.state.init()
      this.isOn = true;
      this._prepare(2000);
    }
  }

  _turnOff() {
    if (this.state.name !== 'coffeeSelected' &&
      this.state.name !== 'whipMilk' &&
      this.state.name !== 'brewCoffee' &&
      this.state.name !== 'pourCoffee' ) {
      this._setState(Off);
      this.isOn = false;
    }
  }

  async _makeCoffee(coffeeName) {
    this._setState(CoffeeSelected);
    this.emit('checking', this._cupIsFull);
    this._cupIsFull = false;

    if (this.ingredientsAreSufficient()) {
      const coffeeType = this._searchTargetRecipe(coffeeName);
      await this._brewCoffee(coffeeType)

        if (coffeeType.recipe.withMilk) {
          await this._whipMilk()
        }

      await this._pourCoffee(coffeeType.color);
    }
  }

  _brewCoffee(coffeeType, ms = 4000) {
    this._setState(BrewCoffee)
    this.state.init(coffeeType, ms)
  }

  consumeIngredients(coffeeType) {
    const { waterRequired, grainRequired, milkRequired } = coffeeType.recipe;

    this.ingredientsAvailable.milk -= milkRequired;
    this.ingredientsAvailable.grain -= grainRequired;
    this.ingredientsAvailable.water -= waterRequired;
    this._wasteAmount += grainRequired;

    this.isClean = false;
  }

  _pourCoffee(colorCoffee, ms = 10000) {
    this._setState(PourCoffee)
    this.state.init(colorCoffee, ms)
  }

  delay(ms) {
    return new Promise(
    (resolve) => setTimeout(resolve, this._isDev ? 10 : ms)
    );
  }

  _whipMilk(ms = 6000) {
    this._setState(WhipMilk)
    this.state.init(ms)
  }
}

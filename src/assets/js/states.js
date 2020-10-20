export class CoffeeMachineState {
  constructor(name, nextState) {
    this.name = name;
    this.nextState = nextState;
  }

  next(context) {
    return new this.nextState(context);
  }

  _setContext(context) {
    this.context = context;
  }
}

export class Off extends CoffeeMachineState {
  constructor(config) {
    super('off', TurnOn);
    const { context } = config
    this.context = context;
  }

  init() {
    this.context.emit('off')
  }
}

export class TurnOn extends CoffeeMachineState {
  constructor(config) {
    super('turnOn', Prepare);
    const { context } = config
    this.context = context;
  }

  init() {
    console.log(this.context.state)
    this.context.emit('welcome', {
      coffeeTypes: this.context.coffeeTypes,
      ingredientsAvailable: this.context.ingredientsAvailable
    });
  }
}

export class Prepare extends CoffeeMachineState {
  constructor(config) {
    super('prepare', Ready);
    const { context } = config
    this.context = context
  }

  init(delayMs = 1000) {
    this.context.emit('checking', this.context.cupIsFull);

    this.context.delay(delayMs).then(() => {
      if (!this.context.isClean && !this.context.isBroken) {
        this.context.emit('cleaning');
        this.context.clean();
      }

      if (this.context.ingredientsAreSufficient()) {
        this.context.nextState()
        this.context.emit('ready', this.context.coffeeTypes);
      }
    });
  }
}

export class Ready extends CoffeeMachineState {
  constructor(config) {
    super('ready', CoffeeSelected);
    const { context } = config
    this.context = context
  }
}

export class CoffeeSelected extends CoffeeMachineState {
  constructor() {
    super('coffeeSelected', WhipMilk);
  }
}

export class WhipMilk extends CoffeeMachineState {
  constructor(config) {
    super('whipMilk', BrewCoffee);
    const { context } = config
    this.context = context
  }

  init(ms = 1000) {
    return this.context.delay(ms).then(() => {
      if (this.context.ingredientsAvailable.milk > 0) {
        this.context.emit('whipping');
      } else {
        this.context.emit('noMilk');
      }
    });
  }

}

export class BrewCoffee extends CoffeeMachineState {
  constructor(config) {
    super('brewCoffee', PourCoffee);
    const { context } = config
    this.context = context
  }

  init(coffeeType, ms = 1000) {
    this.context.emit('brewing', { coffeeType });

    return this.context.delay(ms).then(() => {
      this.context.consumeIngredients(coffeeType);
    });
  }
}

export class PourCoffee extends CoffeeMachineState {
  constructor(config) {
    super('pourCoffee', Idle);
    const { context } = config
    this.context = context
  }

  init(colorCoffee, ms = 1000) {
    this.context.emit('pouring', { colorCoffee, ms });

    return this.context.delay(ms).then(() => {
      this.context.cupIsFull = true;
      this.context.emit('coffeeReady', this.context.ingredientsAvailable)
    });
  }
}

export class Idle extends CoffeeMachineState {
  constructor(config) {
    super('idle', Prepare);
    const { context } = config
    this.context = context
  }

  init(coffeeTypes) {
    console.log('я свободен!')
    this.context.emit('returnCoffeeTypes', coffeeTypes)
  }
}

export class NoGrains extends CoffeeMachineState {
  constructor(config) {
    super('noGrains', Ready);
    const { context } = config
    this.context = context
    this.context.emit('noGrains');
  }
}

export class NoMilk extends CoffeeMachineState {
  constructor(config) {
    super('noMilk', Ready);
    const { context } = config
    this.context = context
    this.context.emit('noMilk');
  }
}

export class NoWater extends CoffeeMachineState {
  constructor(config) {
    super('noWater', Ready);
    const { context } = config
    this.context = context
    this.context.emit('noWater');
  }
}

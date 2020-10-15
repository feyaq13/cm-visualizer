class CoffeeMachineState {
  constructor(name, nextState) {
    this.name = name;
    this.nextState = nextState;
  }

  next() {
    return new this.nextState();
  }
}

class Off extends CoffeeMachineState {
  constructor() {
    super('off', turnOn);
  }
}

class turnOn extends CoffeeMachineState {
  constructor() {
    super('turnOn', Prepare);
  }
}

class Idle extends CoffeeMachineState {
  constructor() {
    super('idle', Prepare);
  }
}

class Prepare extends CoffeeMachineState {
  constructor() {
    super('prepare', Ready);
  }
}

class Ready extends CoffeeMachineState {
  constructor() {
    super('ready', CoffeeSelected);
  }
}

class CoffeeSelected extends CoffeeMachineState {
  constructor() {
    super('coffeeSelected', WhipMilk);
  }
}

class WhipMilk extends CoffeeMachineState {
  constructor() {
    super('whipMilk', BrewCoffee);
  }
}

class BrewCoffee extends CoffeeMachineState {
  constructor() {
    super('brewCoffee', Idle);
  }
}

class CoffeeCup {
  constructor() {
    // ??? this.cupIsFull ???
    this.isFull = false;
  }
}

class CoffeeMachineContainers {
  constructor(ingredients) {
    this.grain = ingredients.grain;
    this.milk = ingredients.milk;
    this.water = ingredients.water;
  }
}

class CoffeeMachine {
  constructor(config) {
    const { recipes, cli } = config;
    this.state = new Off()
    this._on = false;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    this._wasteAmount = 0;
    this._isClean = true;
    this._isBroken = false;
    this._isChecking = false;
    this.cup = new CoffeeCup();
    this.ingredientsContainers = new CoffeeMachineContainers({
      'grain':100, 'milk':100, 'water':100
    })
  }

  on() {
    if (this.state.name === 'off') {
      this.nextState()
      // this.showState(this.state)
      this.goTo(new Prepare())
      this._on = true;
    }
  }

  off() {
    if (this.state.name !== 'off') {
      this.state = new Off()
      this._on = false;
    }

  }

  checking() {
    if (!this._isChecking) {
      if (!this._isClean) {
        this._isClean = true;
        console.log('почистила')
      }

      if (this._isBroken) {
        this._isBroken = false;
      }

      this._isChecking = true
      this.nextState()
    }
  }

  searchCoffeeType(coffeeType) {
    return this.recipes.find(recipe => recipe.coffeeName === coffeeType)
  }

  makeCoffee(coffeeName) {
    if (this.state.name === 'idle') {
      this.nextState()
    }

    if (this.state.name === 'prepare') {
      this.checking()
    }

    if (this._on) {
      if (this.state.name === 'coffeeSelected' || this.state.name === 'ready') {
        this.nextState()

        const coffeeType = this.searchCoffeeType(coffeeName)

        try {
          if (coffeeType.recipe.withMilk) {
            this.nextState()
            console.log(`взбиваю молоко`)
            this.nextState()
          } else {
            this.goTo(new BrewCoffee())
            console.log(this.state)
          }

          console.log(`завариваю ${coffeeType.coffeeName}`)

        } catch (e) {
          console.error(new Error(`coffeeType ${coffeeName} is ${coffeeType}`))
        }

      }

      this.finally()
    } else {
      console.log('включите кофе-машину')
    }
  }

  finally() {
    console.log(`---`)
    this.nextState()
    this._isChecking = false;
    this._isClean = false;
    this.goTo(new Idle())
  }

  nextState() {
    this.state = this.state.next()
    console.log(this.state)
  }

  goTo(state) {
    this.state = state
  }
}

const cm = new CoffeeMachine({
  recipes:  [
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
  ],
});

cm.on()
cm.checking()
cm.makeCoffee('dark coffee')
// cm.makeCoffee('cappuccino')

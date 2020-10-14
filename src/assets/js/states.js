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
    super('brewCoffee', turnOn);
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
    this._cli = cli;
    this.cup = new CoffeeCup();
    this.ingredientsContainers = new CoffeeMachineContainers({
      'grain':100, 'milk':100, 'water':100
    })
  }

  on() {
    if (this.state.name === 'off') {
      this.nextState()
      console.log(this.state)
      this.goTo(new Prepare())
      // console.log(this.state)
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
    if (this.state.name === 'ready') {
      this.nextState()
      return
    }

    if (this._wasteAmount !== 100) {
      console.log('prepared - ok')
      this.nextState()
      console.log(this.state)
    }

  }

  searchCoffeeType(coffeeType) {
    return this.recipes.find(recipe => recipe.coffeeName === coffeeType)
  }

  makeCoffee(coffeeType) {
    if (this.state.name !== 'ready') {
      this.checking()
      this.nextState()
      console.log(this.state)
    }

    if (this.state.name === 'coffeeSelected' || this.state.name === 'ready') {
      this.nextState()

      coffeeType = this.searchCoffeeType(coffeeType)

      try {
        if (!coffeeType.recipe.withMilk) {
          this.nextState()
        } else {
          console.log(this.state)
          this.nextState()
          console.log(`взбиваю молоко`)
        }
        console.log(this.state)
        console.log(`завариваю ${coffeeType.coffeeName}`)
      } catch (e) {
        console.error(new Error(`coffeeType is ${coffeeType}`))
      }

    }

    this.finally()
  }

  finally() {
    console.log(`---`)
    this.goTo(new Prepare())
  }

  nextState() {
    this.state = this.state.next()
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
cm.makeCoffee('dark coffee')
cm.makeCoffee('cappuccino')
cm.makeCoffee('raf')

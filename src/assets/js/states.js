export class CoffeeMachineState {
  constructor(name, nextState) {
    this.name = name;
    this.nextState = nextState;
  }

  next() {
    return new this.nextState();
  }
}

export class Off extends CoffeeMachineState {
  constructor() {
    super('off', turnOn);
  }
}

export class turnOn extends CoffeeMachineState {
  constructor() {
    super('turnOn', Prepare);
  }
}

export class Idle extends CoffeeMachineState {
  constructor() {
    super('idle', Prepare);
  }
}

export class Prepare extends CoffeeMachineState {
  constructor() {
    super('prepare', Ready);
  }
}

export class Ready extends CoffeeMachineState {
  constructor() {
    super('ready', CoffeeSelected);
  }
}

export class CoffeeSelected extends CoffeeMachineState {
  constructor() {
    super('coffeeSelected', WhipMilk);
  }
}

export class WhipMilk extends CoffeeMachineState {
  constructor() {
    super('whipMilk', BrewCoffee);
  }
}

export class BrewCoffee extends CoffeeMachineState {
  constructor() {
    super('brewCoffee', Idle);
  }
}
//
// class CoffeeCup {
//   constructor(options) {
//     const { pouredLiquidElement, cupElement } = options
//     // ??? this.cupIsFull ???
//     this._isFull = false;
//     this._cupElement = cupElement;
//     this._pouredLiquidElement = pouredLiquidElement;
//   }
// }

class CoffeeMachineContainers {
  constructor(ingredients) {
    this.grain = ingredients.grain;
    this.milk = ingredients.milk;
    this.water = ingredients.water;
  }
}

class Publisher {
  constructor() {
    this._notifiable = null;
  }

  _emit(event, data) {
    this._notifiable.events[event](data)
  }
}

class CoffeeMachine extends Publisher {
  constructor(config) {
    super()
    // this.events = this.setupEvents()
    // const { recipes, interfaces } = config;
    // this.state = new Off()
    // this._on = false;
    // this.recipes = recipes;
    // this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
    // this._wasteAmount = 0;
    // this._isClean = true;
    // this._isBroken = false;
    // this._isChecking = false;
    // this.interfaces = interfaces;
    // // this._cup = new CoffeeCup({
    // //   _cupElement: document.getElementsByClassName('coffee-cup-factor')[0],
    // //   _pouredLiquidElement: document.getElementsByClassName('coffee-cup')[0]
    // // });
    // this.ingredientsContainers = new CoffeeMachineContainers({ 'grain':100, 'milk':100, 'water':100 })
    // this._init()
  }

  // _init() {
  //   this._notifiable = this.interfaces;
  //   this.setupEvents();
  // }  //
  //   // setupEvents() {
  //   //   return {
  //   //     'onEventName': (data) => {
  //   //       this.foo(data)
  //   //     },
  //   //   }
  //   // }

  on() {
    if (this.state.name === 'off') {
      this.nextState()
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

  cleanCup() {
    // if (this._cup._isFull) {
      this._cup._isFull = false;
    // }
  }

  makeCoffee(coffeeName) {

    if (this.state.name === 'idle') {
      this.cleanCup()
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
    console.log(`кофе готов!`)
    console.log(`---`)
    this.nextState()
    this._isChecking = false;
    this._isClean = false;
    this._cup._isFull = true;
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

// const cm = new CoffeeMachine({
//   recipes:  [
//     {
//       coffeeName: 'cappuccino',
//       color: '#CFAA8F',
//       recipe: {
//         withMilk: true,
//         milkRequired: 20,
//         waterRequired: 10,
//         grainRequired: 20,
//       },
//     },
//     {
//       coffeeName: 'raf',
//       color: '#CFA780',
//       recipe: {
//         withMilk: true,
//         milkRequired: 20,
//         waterRequired: 10,
//         grainRequired: 20,
//       },
//     },
//     {
//       coffeeName: 'dark coffee',
//       color: '#4F240A',
//       recipe: {
//         withMilk: false,
//         milkRequired: 0,
//         waterRequired: 10,
//         grainRequired: 20,
//       },
//     },
//   ],
//   // interface: new CoffeeMachineInterface(),
// });

// cm.on()
// cm.makeCoffee('dark coffee')
// cm.makeCoffee('cappuccino')


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
  constructor() {
    super('off', TurnOn);
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

    this.context.nextState()
  }
}

export class Prepare extends CoffeeMachineState {
  constructor(config) {
    super('prepare', Ready);
    const { context } = config
    this.context = context
  }

  init(delayMs) {
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
    // const { context } = config
    // this.context = context
  }
  //
  // init() {
  //   // console.log('взбиваю 🥛...')
  //   return this.context.delay(2000).then(() => {
  //     if (this.context.ingredientsAvailable.milk > 0) {
  //       this.context.emit('whipping');
  //     } else {
  //       this.context.emit('noMilk');
  //     }
  //   });
  // }
}

export class BrewCoffee extends CoffeeMachineState {
  constructor(config) {
    super('brewCoffee', PourCoffee);
    // const { context } = config
    // this.context = context
  }

  // init(coffeeType, ms) {
  // }
}

export class PourCoffee extends CoffeeMachineState {
  constructor(config) {
    super('pourCoffee', Idle);
    const { context } = config
    this.context = context
  }
  //
  // init(colorCoffee) {
  //   console.log('наливааюю')
  //
  //   return this.context.delay(10000).then(() => {
  //     this.context.emit('pouring', { colorCoffee });
  //   });
  // }
}

export class Idle extends CoffeeMachineState {
  constructor() {
    super('idle', Prepare);
  }
}

export class NoGrains extends CoffeeMachineState {
  constructor() {
    super('noGrains', Ready);
  }
}

export class NoMilk extends CoffeeMachineState {
  constructor() {
    super('noMilk', Ready);
  }
}

export class NoWater extends CoffeeMachineState {
  constructor() {
    super('noWater', Ready);
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
// class CoffeeMachineContainers {
//   constructor(ingredients) {
//     this.grain = ingredients.grain;
//     this.milk = ingredients.milk;
//     this.water = ingredients.water;
//   }
// }
//
// class Publisher {
//   constructor() {
//     this._notifiable = null;
//   }
//
//   _emit(event, data) {
//     this._notifiable.events[event](data)
//   }
// }
// class CoffeeMachine extends Publisher {
//   constructor(config) {
//     super()
//     // this.events = this.setupEvents()
//     // const { recipes, interfaces } = config;
//     // this.state = new Off()
//     // this._on = false;
//     // this.recipes = recipes;
//     // this.coffeeTypes = this.recipes.map((r) => r.coffeeName);
//     // this._wasteAmount = 0;
//     // this._isClean = true;
//     // this._isBroken = false;
//     // this._isChecking = false;
//     // this.interfaces = interfaces;
//     // // this._cup = new CoffeeCup({
//     // //   _cupElement: document.getElementsByClassName('coffee-cup-factor')[0],
//     // //   _pouredLiquidElement: document.getElementsByClassName('coffee-cup')[0]
//     // // });
//     // this.ingredientsContainers = new CoffeeMachineContainers({ 'grain':100, 'milk':100, 'water':100 })
//     // this._init()
//   }
//
//   // _init() {
//   //   this._notifiable = this.interfaces;
//   //   this.setupEvents();
//   // }  //
//   //   // setupEvents() {
//   //   //   return {
//   //   //     'onEventName': (data) => {
//   //   //       this.foo(data)
//   //   //     },
//   //   //   }
//   //   // }
//
//   on() {
//     if (this.state.name === 'off') {
//       this.nextState()
//       this.goTo(new Prepare())
//       this._on = true;
//     }
//   }
//
//   off() {
//     if (this.state.name !== 'off') {
//       this.state = new Off()
//       this._on = false;
//     }
//
//   }
//
//   checking() {
//     if (!this._isChecking) {
//       if (!this._isClean) {
//         this._isClean = true;
//         console.log('почистила')
//       }
//
//       if (this._isBroken) {
//         this._isBroken = false;
//       }
//
//       this._isChecking = true
//       this.nextState()
//     }
//   }
//
//   searchCoffeeType(coffeeType) {
//     return this.recipes.find(recipe => recipe.coffeeName === coffeeType)
//   }
//
//   cleanCup() {
//     // if (this._cup._isFull) {
//       this._cup._isFull = false;
//     // }
//   }
//
//   makeCoffee(coffeeName) {
//
//     if (this.state.name === 'idle') {
//       this.cleanCup()
//       this.nextState()
//     }
//
//     if (this.state.name === 'prepare') {
//       this.checking()
//     }
//
//     if (this._on) {
//       if (this.state.name === 'coffeeSelected' || this.state.name === 'ready') {
//         this.nextState()
//
//         const coffeeType = this.searchCoffeeType(coffeeName)
//
//         try {
//           if (coffeeType.recipe.withMilk) {
//             this.nextState()
//             console.log(`взбиваю молоко`)
//             this.nextState()
//           } else {
//             this.goTo(new BrewCoffee())
//             console.log(this.state)
//           }
//
//           console.log(`завариваю ${coffeeType.coffeeName}`)
//
//         } catch (e) {
//           console.error(new Error(`coffeeType ${coffeeName} is ${coffeeType}`))
//         }
//
//       }
//
//       this.finally()
//     } else {
//       console.log('включите кофе-машину')
//     }
//   }
//
//   finally() {
//     console.log(`кофе готов!`)
//     console.log(`---`)
//     this.nextState()
//     this._isChecking = false;
//     this._isClean = false;
//     this._cup._isFull = true;
//     this.goTo(new Idle())
//   }
//
//   nextState() {
//     this.state = this.state.next()
//     console.log(this.state)
//   }
//
//   goTo(state) {
//     this.state = state
//   }
// }
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


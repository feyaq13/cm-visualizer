export class CoffeeMachine {
  constructor(machineInterface, hasCappuccinoMaker, hasCoffeeMill) {
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    // this._hasCoffeeMill = hasCoffeeMill;
    this._machineInterface = machineInterface;
    this._isClean = true;
    this._isBroken = false;
    // this._grainType = ['ground', 'whole grains'];
    this.typesOfCoffee = ['cappuccino', 'raf', 'dark coffee'];
    this.recipes = [
      {coffeeName: 'cappuccino', color: 'rosybrown', withMilk: true},
      {coffeeName: 'raf', color: 'brown',  withMilk: true},
      {coffeeName: 'dark coffee', color: '#392919',  withMilk: false},
    ];
    this._amountWaste = 0;
    this._isAvailableGrain = 100;
    this._isAvailableWater = 100;
    this._isAvailableMilk = 100;
    this._init();
  }

  _init() {
      console.log(`
    Добро пожаловать!
    Ознакомьтесь, пожалуйста, с нашим меню:
    ${this.typesOfCoffee.join(', ')}
    Для выбора напитка просто напишите его название.
    Приятного аппетита!
    `);

      this._machineInterface.setupPlaySoundOnEventClick()
      this._machineInterface.setupOnSwitchOnEventClick(this.turnOn.bind(this))
      this._machineInterface.showTypesCoffee(this.typesOfCoffee)
      this._machineInterface.setupOnCleanWasteOnEventClick(this.clean.bind(this))
  }

  searchTargetRecipe(typeOfCoffee) {
    return this.recipes.filter(recipe => recipe.coffeeName === typeOfCoffee)
  }

  clean() {
    if (this._amountWaste >= 50 && this._amountWaste <= 100) {
      this._amountWaste = 0
      console.log('очистил 🧹')
    }

    this._isClean = true;
    return true;
  }

  _checkContentsForMakingCoffee() {
    if (this._isAvailableGrain <= 0) {
      console.log('добавьте кофе');
      return false;
    }

    if (this._isAvailableWater <= 0) {
      console.log('долейте воды');
      return false;
    }

    if (this._isAvailableMilk <= 0) {
      console.log(
    `
    уровень молока ниже необходимого: ${this._isAvailableMilk},
    долейте молока
    `
      );
      return false;
    }

    return true;
  }

  _prepare() {
    console.log('проверяю...');
      return new Promise((resolve, reject) => {

        this._machineInterface.onPendingAnimation()

        this._delay(() => {
          if (!this._isClean && !this._isBroken) {
            console.log('очищаю...');
            this.clean();
          }

          if (!this._checkContentsForMakingCoffee()) {
            reject(new Error('добавьте недостающее в кофе-машину!'));
            return false;
          }

          resolve(console.log('я готова делать кофе!'));
          this._machineInterface.stopPendingAnimation()

        }, 5000);
      });
  }

  turnOn() {
    this._prepare()
    .then(() => this._machineInterface.setupOnMakeCoffeeTypesOnEventClick((typeOfCoffee => typeOfCoffee)))
    .then((selectTypeOfCoffee) => {
      selectTypeOfCoffee = this.searchTargetRecipe(selectTypeOfCoffee)[0];
      return this._makeCoffee(selectTypeOfCoffee)
    })
  }

  _makeCoffee(typeOfCoffee) {
    return new Promise((resolve) => {
      console.log(`завариваю ${typeOfCoffee.coffeeName}`)
      resolve(this._brewingCoffee(typeOfCoffee, 4000))
    })
  }

  _brewingCoffee(typeOfCoffee, ms) {
    this._delay(() => {

      this._consumeIngredients(typeOfCoffee.coffeeName)

      if (typeOfCoffee.withMilk) {
        this._whipMilk()
        .then(() => this._pouringCoffee(typeOfCoffee.color))
      } else {
        this._pouringCoffee(typeOfCoffee.color)
      }

    }, ms)
  }

  _consumeIngredients(typeOfCoffee) {
    switch (typeOfCoffee) {
      case 'cappuccino':
      case 'raf':
        this._isAvailableMilk -= 20;
        this._isAvailableGrain -= 20;
        this._isAvailableWater -= 10;
        this._amountWaste += 20;
        break;
      case 'dark coffee':
        this._isAvailableGrain -= 20;
        this._isAvailableWater -= 10;
        this._amountWaste += 20;
        break
    }
  }

  _pouringCoffee(colorCoffee) {
    this._machineInterface.onPouringDrinkAnimation(4, colorCoffee)

    this._delay(() => {
      console.log('кофе готов!')
      this._machineInterface.stopPendingAnimation()
    }, 10000)
  }

  _delay(cb, ms) {
    setTimeout(cb, ms)
  }

  _whipMilk() {
    return new Promise((resolve, reject) => {
      this._delay(() => {
        if (this._hasCappuccinoMaker && this._isAvailableMilk > 0) {
          this._isAvailableMilk -= 20;
          resolve(console.log('взбиваю 🥛...'))
        } else {
          reject(console.log('кажется нет молока'))
        }
      }, 2000)
    })
  }

  _grindGrain() {
    console.log('измельчаю! 😊');
    return true;
  }
}

//   const fetchMachine = Machine({
//     id: 'coffee-machine',
//     initial: 'idle',
//     context: {
//       pickedCoffeeType: null
//     },
//     states: {
//       idle: {
//         on: {
//           MAKE_COFFEE: 'checking'
//         }
//       },
//       checking: {
//         on: {
//           RESOLVE: 'picking',
//           REJECT: 'broken'
//         }
//       },
//       picking: {
//         on: {
//           latte: {
//             target: 'whip_milk',
//             actions: ['savePickedCoffeeType']
//           },
//           cappuccino: {
//             target: 'whip_milk',
//             actions: ['savePickedCoffeeType']
//           },
//           espresso: {
//             target: 'grind',
//             actions: ['savePickedCoffeeType']
//           },
//         }
//       },
//       broken: {
//         type: 'final'
//       },
//       whip_milk: {
//         on: {
//           WHIPPED_MILK: 'grind'
//         }
//       },
//       grind: {
//         on: {
//           GRINDED: 'pouring'
//         }
//       },
//       pouring: {
//         on: {
//           POURED: {
//             target: 'idle',
//             actions: () => alert('enjoy your coffee')
//           }
//         }
//       }
//     }
//   }, {
//     actions: {
//       savePickedCoffeeType: (context, event) => {
//         context.pickedCoffeeType = event.type;
//       }
//     }
//   });

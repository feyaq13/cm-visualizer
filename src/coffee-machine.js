export class CoffeeMachine {
  constructor(machineInterface, hasCappuccinoMaker, hasCoffeeMill) {
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    // this._hasCoffeeMill = hasCoffeeMill;
    this._machineInterface = machineInterface;
    this.isOn = false;
    this._isClean = true;
    this._isBroken = false;
    // this._grainType = ['ground', 'whole grains'];
    this.typesOfCoffee = ['cappuccino', 'raf', 'dark coffee'];
    this.recipes = [
      {coffeeName: 'cappuccino', color: '#CFAA8F', withMilk: true},
      {coffeeName: 'raf', color: '#CFA780',  withMilk: true},
      {coffeeName: 'dark coffee', color: '#4F240A',  withMilk: false},
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
      this._machineInterface.setupOnSwitchOnEventClick(this.pendingSelectCoffee.bind(this))
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

  _prepare(delayMs) {
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

        }, delayMs);
      });
  }

  pendingSelectCoffee(selectTypeOfCoffee) {
    if (this.isOn) {
      this.afterTurnOn();
      return this._makeCoffee(this.searchTargetRecipe(selectTypeOfCoffee)[0]).finally(() => this._machineInterface.enabledAllButtons())
    } else {
      this.turnOn()
    }
  }

  turnOn() {
    this.isOn = true;
    this._prepare(0).then(this.afterTurnOn())
  }

  afterTurnOn() {
    return this._machineInterface.setupOnMakeCoffeeTypesOnEventClick((typeOfCoffee => typeOfCoffee))
    .then((typeOfCoffee) => this.pendingSelectCoffee(typeOfCoffee))
  }

  _makeCoffee(typeOfCoffee) {
    return new Promise((resolve) => {
      console.log(`завариваю ${typeOfCoffee.coffeeName}`)
      resolve(this._brewingCoffee(typeOfCoffee, 4000))
    })
  }

  _brewingCoffee(typeOfCoffee, ms) {
    return new Promise((resolve) => {
      this._delay(() => {

        this._consumeIngredients(typeOfCoffee.coffeeName)

        if (typeOfCoffee.withMilk) {
          resolve(this._whipMilk()
          .then(
            () => this._pouringCoffee(typeOfCoffee.color),
            (err) => console.error(new Error('красная кнопка заглушка!1'), err)
          ))
        } else {
          resolve(this._pouringCoffee(typeOfCoffee.color))
        }

      }, ms)
    })
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

    this._isClean = false;
  }

  _pouringCoffee(colorCoffee) {
    return new Promise ((resolve) => {
      this._machineInterface.onPouringDrinkAnimation(4, colorCoffee)

      this._delay(() => {
        this._machineInterface.stopPendingAnimation()
        resolve(console.log('кофе готов!'))
      }, 10000)
    })
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

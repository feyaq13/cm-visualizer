export class CoffeeMachine {
  constructor(machineInterface, hasCappuccinoMaker, hasCoffeeMill /*...*/) {
    this._hasCappuccinoMaker = hasCappuccinoMaker;
    this._hasCoffeeMill = hasCoffeeMill;
    this._machineInterface = machineInterface;
    this._isClean = true;
    this._isBroken = false;
    this._grainType = ['ground', 'whole grains'];
    this._typesOfCoffee = ['cappuccino', ' raf', ' dark coffee'];
    this._isAvailableGrain = 100;
    this._isAvailableWater = 100;
    this._isAvailableMilk = 100;
    this._init();
  }

  _init() {
      console.log(`
    Добро пожаловать!
    Ознакомьтесь, пожалуйста, с нашим меню:
    ${this._typesOfCoffee}
    Для выбора напитка просто напишите его название.
    Приятного аппетита!
    `);

      this._machineInterface.setupEventClick()
      this._machineInterface.addEventListenerClick(this.makeCoffee.bind(this))
  }

  clean() {
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
      setTimeout(() => {
        if (!this._isClean && !this._isBroken) {
          console.log('очищаю...');
          this.clean();
        }

        if (!this._checkContentsForMakingCoffee()) {
          reject(new Error('добавьте недостающее в кофе-машину!'));
          return false;
        }

        resolve(console.log('я готова делать кофе!'));

      }, 3000);
    });
  }

  async makeCoffee(typeOfCoffee, grainType) {

    this._prepare()
    .then(() => {

        if (this._grainType === 'whole grains' && !this._hasCoffeeMill) {
          this._grindGrain();
        }

        this._isClean = false;

    })
    .then((this._whipMilk.bind(this)))
    .then((this._brewingCoffee.bind(this)))
    .catch((err) => console.error(err))
    .finally( () => setTimeout(this._init.bind(this), 500))
  }

  _brewingCoffee() {
    return new Promise((resolve) => {
      this._delay(() => {
        console.log('завариваю кофе...')
        resolve(console.log('кофе готов!'))
      }, 2000)
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
            console.log('взбиваю 🥛...');
            resolve(console.log(`осталось ${this._isAvailableMilk}`))
          } else {
            reject(console.log('кажется нет молока'))
          }
        }, 1500)
    })
  }

  _grindGrain() {
    this._isAvailableGrain -= 20;
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

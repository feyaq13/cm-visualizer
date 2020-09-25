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
    this._machineInterface._setupEventClick()
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
          reject();
          return false;
        }

        resolve(console.log('я готова делать кофе!'));

      }, 3000);
    });
  }

  makeCoffee(typeOfCoffee, grainType) {
    this._prepare().then(() => {

      if (this._grainType === 'whole grains' && !this._hasCoffeeMill) {
        this._grindGrain();
      }

      this._isClean = false;

      setTimeout(() => console.log('завариваю ☕️...'), 2000);

    });
  }

  _whipMilk() {
    setTimeout(() => {
      if (this._hasCappuccinoMaker) {
        console.log('взбиваю 🥛...');
      }
    }, 1000);
  }

  _grindGrain() {
    this._isAvailableGrain -= 20;
    console.log('измельчаю! 😊');

    return true;
  }
}

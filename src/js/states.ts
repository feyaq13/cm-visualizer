import { CoffeeMachine } from './coffee-machine';

export abstract class CoffeeMachineState {
  protected coffeeMachine: CoffeeMachine;

  constructor(coffeeMachine: CoffeeMachine) {
    this.coffeeMachine = coffeeMachine;
    console.dir(this);

    this.onEnter();
  }

  abstract turnOn(): void;
  abstract turnOff(): void;

  onEnter(): void {}
}

export class OffCoffeeMachineState extends CoffeeMachineState {
  onEnter() {
    this.coffeeMachine.isOn = false;
  }

  turnOff() {}
  turnOn() {
    this.coffeeMachine.setState(StartCoffeeMachineState);
  }
}

export class StartCoffeeMachineState extends CoffeeMachineState {
  onEnter() {
    this.coffeeMachine.isOn = true;
    this.coffeeMachine.emit('welcome', {
      coffeeTypes: this.coffeeMachine.coffeeTypes
    });
    this.coffeeMachine.prepare(2000);
  }

  turnOff() {}
  turnOn() {}
}

export class PrepareCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class CoffeeSelectedCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class ReadyCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {
    this.coffeeMachine.setState(OffCoffeeMachineState);
  }
}
export class BrewCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class WhipMilkCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class PourCoffeeCoffeeMachineState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class InsufficientIngredientsCoffeeMachineState extends CoffeeMachineState {
  onEnter() {
    // навещивается два раза!
    this.coffeeMachine.emit('canOff');
  }

  turnOn() {}
  turnOff() {
    this.coffeeMachine.setState(OffCoffeeMachineState);
  }
}

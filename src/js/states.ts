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

export class OffState extends CoffeeMachineState {
  onEnter() {
    this.coffeeMachine.isOn = false;
  }

  turnOff() {}
  turnOn() {
    this.coffeeMachine.setState(StartState);
  }
}

export class StartState extends CoffeeMachineState {
  onEnter() {
    this.coffeeMachine.isOn = true;
    this.coffeeMachine.emit('welcome', {
      coffeeTypes: this.coffeeMachine.coffeeTypes,
      ingredientsAvailable: this.coffeeMachine.ingredientsAvailable,
    });
    this.coffeeMachine.prepare(2000);
  }

  turnOff() {}
  turnOn() {}
}

export class PrepareCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class CoffeeSelectedCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class ReadyCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {
    this.coffeeMachine.setState(OffState);
  }
}
export class BrewCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class WhipMilkCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class PourCoffeeCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {}
}

export class InsufficientIngredientsCmState extends CoffeeMachineState {
  turnOn() {}
  turnOff() {
    this.coffeeMachine.setState(OffState);
  }
}

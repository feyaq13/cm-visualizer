import { CoffeeMachineInterface } from './coffee-machine-interface';
import { CoffeeMachine } from './coffee-machine';

const myCoffeeMachine = new CoffeeMachine({
  hasCappuccinoMaker: true,
  dev: false,
  interfaces: [new CoffeeMachineInterface()],
});

window.cm = myCoffeeMachine;

import { CoffeeMachineInterface } from './coffee-machine-interface';
import { CoffeeMachine } from './coffee-machine';

const myCoffeeMachine = new CoffeeMachine(new CoffeeMachineInterface(), true);

window.cm = myCoffeeMachine;

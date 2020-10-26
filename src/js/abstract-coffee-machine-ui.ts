import { Publisher } from './publisher';
import { CoffeeMachine } from './coffee-machine';

export abstract class AbstractCoffeeMachineUI extends Publisher {
  abstract setupEvents(machine: CoffeeMachine);
}

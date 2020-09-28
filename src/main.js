import { CoffeeMachineInterface } from './coffee-machine-interface'
import { CoffeeMachine } from './coffee-machine';

const myCoffeeMachine = new CoffeeMachine(new CoffeeMachineInterface(), true, false)
// myCoffeeMachine.makeCoffee('cappuccino', 'ground')

window.cm = myCoffeeMachine

import { CoffeeMachineGUI } from './coffee-machine-gui';
import { CoffeeMachine } from './coffee-machine';

const myCoffeeMachine = new CoffeeMachine({
  dev: false,
  interfaces: [new CoffeeMachineGUI({ hints: false })],
  recipes: [
    {
      coffeeName: 'cappuccino',
      color: '#CFAA8F',
      recipe: {
        withMilk: true,
        milkRequired: 20,
        waterRequired: 10,
        grainRequired: 20,
      },
    },
    {
      coffeeName: 'raf',
      color: '#CFA780',
      recipe: {
        withMilk: true,
        milkRequired: 20,
        waterRequired: 10,
        grainRequired: 20,
      },
    },
    {
      coffeeName: 'dark coffee',
      color: '#4F240A',
      recipe: {
        withMilk: false,
        milkRequired: 0,
        waterRequired: 10,
        grainRequired: 20,
      },
    },
  ],
});

window['cm'] = myCoffeeMachine;

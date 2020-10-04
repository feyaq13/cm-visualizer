'use strict'

import { CoffeeMachineInterface } from './coffee-machine-interface';
import { CoffeeMachine } from './coffee-machine';

const myCoffeeMachine = new CoffeeMachine(new CoffeeMachineInterface(), {hasCappuccinoMaker: true, dev: true});

window.cm = myCoffeeMachine;

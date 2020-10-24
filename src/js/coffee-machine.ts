import {
  BrewCmState,
  CoffeeMachineState,
  CoffeeSelectedCmState,
  InsufficientIngredientsCmState,
  OffState,
  PourCoffeeCmState,
  PrepareCmState,
  ReadyCmState,
  WhipMilkCmState,
} from './states';
import { Publisher } from './publisher';
import { Interface } from './coffee-machine-interface';
import { CoffeeType } from './recipe.interface';
import { delay } from './utils';

interface CoffeeMachineParams {
  dev: boolean;
  interfaces: Interface[];
  recipes: CoffeeType[];
}

interface Ingredients {
  milk: number;
  grain: number;
  water: number;
}

export class CoffeeMachine extends Publisher {
  isOn: boolean;
  coffeeTypes: string[];
  ingredientsAvailable: Ingredients;

  private state: CoffeeMachineState;
  private isDev: boolean;
  private cupIsFull: boolean;
  private isClean: boolean;
  private recipes: CoffeeType[];
  private wasteAmount: number;

  constructor(config: CoffeeMachineParams) {
    super();
    const { dev, interfaces, recipes } = config;
    this.state = new OffState(this);
    this.isDev = dev;
    this.isOn = false;
    this.cupIsFull = false;
    this.isClean = true;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map(({ coffeeName }) => coffeeName);
    this.wasteAmount = 0;
    this.ingredientsAvailable = { grain: 100, water: 100, milk: 100 };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this.turnOn(),
        switchOff: () => this.turnOff(),
        coffeeSelected: (coffeeName) => this.makeCoffee(coffeeName),
      });

      machineInterface.setupEvents(this);
    });
  }

  private searchTargetRecipe(coffeeName) {
    return this.recipes.find((recipe) => recipe.coffeeName === coffeeName);
  }

  private clean() {
    if (this.wasteAmount >= 50 && this.wasteAmount <= 100) {
      this.wasteAmount = 0;
      this.emit('clear');
    }

    this.isClean = true;
  }

  private ingredientsAreSufficient() {
    let emptyContainers = [];

    //TODO - отрефакторить код покороче дабы избежать дублирования
    if (this.ingredientsAvailable.grain <= 20) {
      emptyContainers.push(this.ingredientsAvailable.grain);
      this.setState(InsufficientIngredientsCmState);
    }

    if (this.ingredientsAvailable.water <= 20) {
      emptyContainers.push(this.ingredientsAvailable.water);
      this.setState(InsufficientIngredientsCmState);
    }

    if (this.ingredientsAvailable.milk <= 20) {
      emptyContainers.push(this.ingredientsAvailable.milk);
      this.setState(InsufficientIngredientsCmState);
    }

    return !emptyContainers.length;
  }

  setState(state) {
    this.state = new state(this);
  }

  prepare(delayMs = 2000) {
    this.setState(PrepareCmState);
    this.emit('checking', this.cupIsFull);

    delay(delayMs).then(() => {
      if (!this.isClean) {
        this.emit('cleaning');
        this.clean();
      }

      if (this.ingredientsAreSufficient()) {
        this.setState(ReadyCmState);
        this.emit('ready', this.coffeeTypes);
      }
    });
  }

  private turnOn() {
    this.state.turnOn();
  }

  private turnOff() {
    this.state.turnOff();
  }

  async makeCoffee(coffeeName) {
    this.setState(CoffeeSelectedCmState);
    this.emit('checking', this.cupIsFull);

    const coffeeType = this.searchTargetRecipe(coffeeName);

    await this.brewCoffee(coffeeType);

    if (coffeeType.recipe.withMilk) {
      await this.whipMilk();
    }

    await this.pourCoffee(coffeeType.color);
    await this.coffeeReady();
  }

  private coffeeReady() {
    this.setState(ReadyCmState);
    console.log('я свободен!');
    this.emit('returnCoffeeTypes', this.coffeeTypes);
  }

  private brewCoffee(coffeeType, ms = 4000) {
    this.setState(BrewCmState);
    this.emit('brewing', { coffeeType });

    return delay(ms).then(() => {
      this.consumeIngredients(coffeeType);
    });
  }

  private consumeIngredients(coffeeType) {
    const { waterRequired, grainRequired, milkRequired } = coffeeType.recipe;

    this.ingredientsAvailable.milk -= milkRequired;
    this.ingredientsAvailable.grain -= grainRequired;
    this.ingredientsAvailable.water -= waterRequired;
    this.wasteAmount += grainRequired;
    this.isClean = false;
  }

  private pourCoffee(colorCoffee, ms = 2000) {
    this.setState(PourCoffeeCmState);
    this.emit('pouring', { colorCoffee, ms });

    return delay(ms).then(() => {
      this.cupIsFull = true;
      this.emit('coffeeReady', this.ingredientsAvailable);
    });
  }

  private whipMilk(ms = 6000) {
    this.setState(WhipMilkCmState);
    return delay(ms).then(() => {
      if (this.ingredientsAvailable.milk > 0) {
        this.emit('whipping');
      } else {
        this.emit('noMilk');
      }
    });
  }
}

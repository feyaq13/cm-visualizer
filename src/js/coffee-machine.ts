import {
  BrewCoffeeMachineState,
  CoffeeMachineState,
  CoffeeSelectedCoffeeMachineState,
  InsufficientIngredientsCoffeeMachineState,
  OffCoffeeMachineState,
  PourCoffeeCoffeeMachineState,
  PrepareCoffeeMachineState,
  ReadyCoffeeMachineState,
  WhipMilkCoffeeMachineState,
} from './states';
import { Publisher } from './publisher';
import { CoffeeType } from './recipe';
import { delay } from './utils';
import { AbstractCoffeeMachineUI } from './abstract-coffee-machine-ui';

interface CoffeeMachineParams {
  dev: boolean;
  interfaces: AbstractCoffeeMachineUI[];
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
    this.state = new OffCoffeeMachineState(this);
    this.isDev = dev;
    this.isOn = false;
    this.cupIsFull = false;
    this.isClean = true;
    this.recipes = recipes;
    this.coffeeTypes = this.recipes.map(({ coffeeName }) => coffeeName);
    this.wasteAmount = 0;
    this.ingredientsAvailable = { grain: 10, water: 100, milk: 10 };

    interfaces.forEach((machineInterface) => {
      machineInterface.onEvents({
        switchOn: () => this.turnOn(),
        switchOff: () => this.turnOff(),
        coffeeSelected: (coffeeName) => this.makeCoffee(coffeeName),
        filledContainer: (container) => {
          this.ingredientsAvailable[container.containerName] = container.amountOf
          this.emit('replenishmentOfIngredients',  this.ingredientsAvailable)
        },
        filledAllContainers: () => {
          this.setState(ReadyCoffeeMachineState);
          this.emit('ready', this.coffeeTypes);
        }
      });

      machineInterface.setupEvents(this);
    });

    this.emit('init', this.ingredientsAvailable)
  }

  private searchTargetRecipe(coffeeName) {
    return this.recipes.find((recipe) => recipe.coffeeName === coffeeName);
  }

  private clean() {
    this.emit('cleaning');

    if (this.wasteAmount >= 50 && this.wasteAmount <= 100) {
      this.wasteAmount = 0;
      this.emit('clear');
    }

    this.isClean = true;
  }

  private getLowIngredients(): Partial<Ingredients> {
    const lowIngredients = {};

    for (const ingredientName of Reflect.ownKeys(this.ingredientsAvailable)) {
      const ingredientAmount = this.ingredientsAvailable[ingredientName];

      if (ingredientAmount <= 20) {
        lowIngredients[ingredientName] = ingredientAmount;
      }
    }

    return lowIngredients;
  }

  setState(state) {
    this.state = new state(this);
  }

  prepare(delayMs = 2000) {
    this.setState(PrepareCoffeeMachineState);
    this.emit('checking', this.cupIsFull);

    delay(delayMs).then(() => {
      if (!this.isClean) {
        this.clean();
      }

      const { milk, grain, water } = this.getLowIngredients();

      if (milk || grain || water) {
        this.setState(InsufficientIngredientsCoffeeMachineState);
        this.emit('noAnythingIngredient');

        if (milk) {
          this.emit('noMilk');
        }

        if (grain) {
          this.emit('noGrains');
        }

        if (water) {
          this.emit('noWater');
        }

        return;
      }

      this.setState(ReadyCoffeeMachineState);
      this.emit('ready', this.coffeeTypes);
    });
  }

  private turnOn() {
    this.state.turnOn();
    this.emit('switchedOn');
  }

  private turnOff() {
    this.state.turnOff();
    this.emit('switchedOff');
  }

  async makeCoffee(coffeeName) {
    this.setState(CoffeeSelectedCoffeeMachineState);
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
    this.setState(ReadyCoffeeMachineState);
    this.emit('returnCoffeeTypes', this.coffeeTypes);
  }

  private brewCoffee(coffeeType, ms = 4000) {
    this.setState(BrewCoffeeMachineState);
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
    this.setState(PourCoffeeCoffeeMachineState);
    this.emit('pouring', { colorCoffee, ms });

    return delay(ms).then(() => {
      this.cupIsFull = true;
      this.emit('coffeeReady', this.ingredientsAvailable);
    });
  }

  private whipMilk(ms = 6000) {
    this.setState(WhipMilkCoffeeMachineState);
    return delay(ms).then(() => {
        this.emit('whipping');
    });
  }
}

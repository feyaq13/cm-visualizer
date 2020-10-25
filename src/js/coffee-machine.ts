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
import { InterfacePublisher } from './coffee-machine-interface';
import { CoffeeType } from './recipe.interface';
import { delay } from './utils';

interface CoffeeMachineParams {
  dev: boolean;
  interfaces: InterfacePublisher[];
  recipes: CoffeeType[];
}

interface Ingredients {
  milk: number;
  grain: number;
  water: number;
}

export enum CoffeeMachineEvents {
  CoffeeReady = 'coffeeReady',
  NoMilk = 'noMilk',
  NoGrains = 'noGrains',
  NoWater = 'noWater',
  ReplenishmentOfIngredients = 'replenishmentOfIngredients',
  ReturnCoffeeTypes = 'returnCoffeeTypes',
  Whipping = 'whipping',
  Pouring = 'pouring',
  Cleaning = 'cleaning',
  Clear = 'clear',
  Ready = 'ready',
  Off = 'off',
  Checking = 'checking',
  Brewing = 'brewing',
  Welcome = 'welcome'
}

export interface CoffeeMachinePublisher {
  onEvents(param: { [key in CoffeeMachineEvents]?: Function });
  on(event: CoffeeMachineEvents, handler: Function)
}

export class CoffeeMachine extends Publisher implements CoffeeMachinePublisher {
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
    this.emit(CoffeeMachineEvents.Cleaning);

    if (this.wasteAmount >= 50 && this.wasteAmount <= 100) {
      this.wasteAmount = 0;
      this.emit(CoffeeMachineEvents.Clear);
    }

    this.isClean = true;
  }

  private getLowIngredients(): Partial<Ingredients> {
    const lowIngredients = {};

    for (const ingredientName in Reflect.ownKeys(this.ingredientsAvailable)) {
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
    this.setState(PrepareCmState);
    this.emit(CoffeeMachineEvents.Checking, this.cupIsFull);

    delay(delayMs).then(() => {
      if (!this.isClean) {
        this.clean();
      }

      const { milk, grain, water } = this.getLowIngredients();

      if (milk || grain || water) {
        this.setState(InsufficientIngredientsCmState);

        if (milk) {
          this.emit(CoffeeMachineEvents.NoMilk);
        }

        if (grain) {
          this.emit(CoffeeMachineEvents.NoGrains);
        }

        if (water) {
          this.emit(CoffeeMachineEvents.NoWater);
        }

        return;
      }

      this.setState(ReadyCmState);
      this.emit(CoffeeMachineEvents.Ready, this.coffeeTypes);
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
    this.emit(CoffeeMachineEvents.Checking, this.cupIsFull);

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
    this.emit(CoffeeMachineEvents.ReturnCoffeeTypes, this.coffeeTypes);
  }

  private brewCoffee(coffeeType, ms = 4000) {
    this.setState(BrewCmState);
    this.emit(CoffeeMachineEvents.Brewing, { coffeeType });

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
    this.emit(CoffeeMachineEvents.Pouring, { colorCoffee, ms });

    return delay(ms).then(() => {
      this.cupIsFull = true;
      this.emit(CoffeeMachineEvents.CoffeeReady, this.ingredientsAvailable);
    });
  }

  private whipMilk(ms = 6000) {
    this.setState(WhipMilkCmState);
    return delay(ms).then(() => {
      if (this.ingredientsAvailable.milk > 0) {
        this.emit(CoffeeMachineEvents.Whipping);
      } else {
        this.emit(CoffeeMachineEvents.NoMilk);
      }
    });
  }
}

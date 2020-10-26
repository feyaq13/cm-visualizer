export interface CoffeeRecipe {
  withMilk: boolean;
  milkRequired: number;
  waterRequired: number;
  grainRequired: number;
}

export interface CoffeeType {
  coffeeName: string;
  color: string;
  recipe: CoffeeRecipe;
}

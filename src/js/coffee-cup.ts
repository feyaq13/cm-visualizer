export class CoffeeCup {
  isFull: boolean;
  cupElement: Element;
  pouredLiquidElement: HTMLElement;

  constructor(options) {
    this.isFull = false;
    this.cupElement = options.cupElement;
    this.pouredLiquidElement = options.pouredLiquidElement;
  }
}

export class Publisher {
  protected readonly eventHandlers: { [key: string]: Function[] };

  constructor() {
    this.eventHandlers = {};
  }

  emit(event, data?) {
    this.eventHandlers[event].forEach((handler) => handler(data));
  }

  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(handler);
  }

  onEvents(eventsMap) {
    for (const event of Reflect.ownKeys(eventsMap)) {
      this.on(event, eventsMap[event]);
    }
  }
}

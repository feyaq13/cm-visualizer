export class Publisher {
  protected readonly eventHandlers: { [key: string]: Function[] } = {};

  emit(event: string, data?: unknown) {
    this.eventHandlers[event].forEach((handler) => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(handler);
  }

  onEvents(eventsMap: { [key: string]: Function }) {
    for (const event of Reflect.ownKeys(eventsMap)) {
      this.on(String(event), eventsMap[String(event)]);
    }
  }
}

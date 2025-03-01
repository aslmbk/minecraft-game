/* eslint-disable @typescript-eslint/no-explicit-any */
type CallbackFunction<Args extends any[]> = (...args: Args) => void;
type CallbacksStore<Args extends any[]> = {
  [eventName: string]: Array<Array<CallbackFunction<Args>>>;
};

export class Events<
  T extends { trigger: string; args: any[] },
  O extends number = 1 | 2 | 3 | 4 | 5
> {
  private callbacks: CallbacksStore<T["args"]> = {};

  on(
    eventName: T["trigger"],
    callback: CallbackFunction<T["args"]>,
    order: O = 1 as O
  ): this {
    if (!Array.isArray(this.callbacks[eventName])) {
      this.callbacks[eventName] = [];
    }

    if (!Array.isArray(this.callbacks[eventName][order])) {
      this.callbacks[eventName][order] = [];
    }

    this.callbacks[eventName][order].push(callback);
    return this;
  }

  off(eventName: T["trigger"], callback?: CallbackFunction<T["args"]>): this {
    if (!this.callbacks[eventName]) return this;
    if (typeof callback === "function") {
      for (const orderGroup of this.callbacks[eventName]) {
        if (Array.isArray(orderGroup)) {
          const index = orderGroup.indexOf(callback);
          if (index !== -1) {
            orderGroup.splice(index, 1);
          }
        }
      }
    } else {
      delete this.callbacks[eventName];
    }

    return this;
  }

  trigger(eventName: T["trigger"], ...args: T["args"]): this {
    const callbacks = this.callbacks[eventName];
    if (!Array.isArray(callbacks)) return this;

    for (const orderGroup of callbacks) {
      if (Array.isArray(orderGroup)) {
        for (const callback of orderGroup) {
          callback.apply(this, args);
        }
      }
    }

    return this;
  }
}

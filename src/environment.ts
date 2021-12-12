import {MonkeyObject} from './object';

class Environment {
  public store: {[key: string]: MonkeyObject | undefined};
  public outer: Environment | null;

  constructor(outer: Environment | null = null) {
    this.store = {};
    this.outer = outer;
  }

  public get(name: string): MonkeyObject | undefined {
    const value = this.store[name];
    if (value !== undefined) {
      return value;
    }
    if (this.outer) {
      return this.outer.get(name);
    }
    return value;
  }

  public set(name: string, value: MonkeyObject): MonkeyObject {
    this.store[name] = value;
    return value;
  }
}

export {Environment};

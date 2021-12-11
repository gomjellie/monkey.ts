import {MonkeyObject} from './object';

class Environment {
  public store: {[key: string]: MonkeyObject};

  constructor() {
    this.store = {};
  }

  public get(name: string): MonkeyObject {
    return this.store[name];
  }

  public set(name: string, value: MonkeyObject): MonkeyObject {
    this.store[name] = value;
    return value;
  }
}

export {Environment};

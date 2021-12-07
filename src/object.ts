type ObjectType = 'INTEGER' | 'BOOLEAN' | 'NULL';

abstract class MonkeyObject {
  abstract type(): ObjectType;
  abstract inspect(): string;
}

class MonkeyInteger extends MonkeyObject {
  constructor(public value: number) {
    super();
  }

  type(): ObjectType {
    return 'INTEGER';
  }

  inspect(): string {
    return `${this.value}`;
  }
}

class MonkeyBoolean extends MonkeyObject {
  constructor(public value: boolean) {
    super();
  }

  type(): ObjectType {
    return 'BOOLEAN';
  }

  inspect(): string {
    return `${this.value}`;
  }
}

class MonkeyNull extends MonkeyObject {
  type(): ObjectType {
    return 'NULL';
  }

  inspect(): string {
    return 'null';
  }
}

export {MonkeyObject, MonkeyInteger, MonkeyBoolean, MonkeyNull};

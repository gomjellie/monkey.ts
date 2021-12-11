type ObjectType = 'INTEGER' | 'BOOLEAN' | 'NULL' | 'RETURN_VALUE' | 'ERROR';

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

class MonkeyReturnValue extends MonkeyObject {
  constructor(public value: MonkeyObject) {
    super();
  }

  type(): ObjectType {
    return 'RETURN_VALUE';
  }

  inspect(): string {
    return this.value.inspect();
  }
}

class MonkeyError extends MonkeyObject {
  constructor(public message: string) {
    super();
  }

  type(): ObjectType {
    return 'ERROR';
  }

  inspect(): string {
    return `ERROR: ${this.message}`;
  }
}

export {
  MonkeyObject,
  MonkeyInteger,
  MonkeyBoolean,
  MonkeyReturnValue,
  MonkeyNull,
  MonkeyError,
};

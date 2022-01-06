import {Environment} from './environment';
import {Identifier, BlockStatement} from './ast';

type ObjectType =
  | 'INTEGER'
  | 'BOOLEAN'
  | 'NULL'
  | 'RETURN_VALUE'
  | 'ERROR'
  | 'FUNCTION'
  | 'STRING'
  | 'BUILTIN';

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

class MonkeyFunction extends MonkeyObject {
  constructor(
    public parameters: Identifier[],
    public body: BlockStatement,
    public env: Environment
  ) {
    super();
  }

  type(): ObjectType {
    return 'FUNCTION';
  }

  inspect(): string {
    return `fn(${this.parameters.join(', ')}) {\n${this.body.toString()}\n}`;
  }
}

class MonkeyString extends MonkeyObject {
  constructor(public value: string) {
    super();
  }

  type(): ObjectType {
    return 'STRING';
  }

  inspect(): string {
    return `"${this.value}"`;
  }
}

type MonkeyBuiltinFunction = (args: MonkeyObject[]) => MonkeyObject;

class MonkeyBuiltin extends MonkeyObject {
  constructor(public func: MonkeyBuiltinFunction) {
    super();
  }

  type(): ObjectType {
    return 'BUILTIN';
  }

  inspect(): string {
    return 'builtin function';
  }
}

export {
  MonkeyObject,
  MonkeyInteger,
  MonkeyBoolean,
  MonkeyReturnValue,
  MonkeyNull,
  MonkeyError,
  MonkeyFunction,
  MonkeyString,
  MonkeyBuiltin,
  MonkeyBuiltinFunction,
};

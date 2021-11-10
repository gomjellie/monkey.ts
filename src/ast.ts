import {Token} from './lexer';

abstract class Node {
  constructor() {}

  abstract tokenLiteral(): string;
  abstract toString(): string;
}

abstract class Statement extends Node {
  abstract statementNode(): void;
}

abstract class Expression extends Node {
  abstract expressionNode(): void;
}

class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  tokenLiteral(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  expressionNode(): void {}
}

class LetStatement implements Statement {
  token: Token;
  name: Identifier;
  value?: Expression;

  constructor(token: Token, name: Identifier, value?: Expression) {
    this.token = token;
    this.name = name;
    this.value = value;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  toString() {
    return `${this.tokenLiteral()} ${this.name.toString()} = ${
      this.value?.toString() ?? ''
    };`;
  }
}

class ReturnStatement implements Statement {
  token: Token;
  returnValue?: Expression;

  constructor(token: Token, returnValue?: Expression) {
    this.token = token;
    this.returnValue = returnValue;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.returnValue?.toString() ?? ''};`;
  }
}

class ExpressionStatement implements Statement {
  token: Token;
  expression?: Expression;

  constructor(token: Token, expression?: Expression) {
    this.token = token;
    this.expression = expression;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  toString(): string {
    return this.expression?.toString() ?? '';
  }
}

class Program extends Node {
  public statements: Statement[];

  constructor(statements: Statement[]) {
    super();
    this.statements = statements;
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
  }

  toString(): string {
    let out = '';
    for (let i = 0; i < this.statements.length; i++) {
      out += this.statements[i].toString();
    }
    return out;
  }
}

export {
  Node,
  Statement,
  Expression,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  Program,
  Identifier,
};

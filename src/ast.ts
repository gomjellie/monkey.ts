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

class IllegalExpression implements Expression {
  constructor(public token: Token) {}

  expressionNode() {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }
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

class StringLiteral implements Expression {
  constructor(public token: Token, public value: string) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }

  expressionNode(): void {}
}

class BooleanLiteral implements Expression {
  constructor(public token: Token, public value: boolean) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }

  expressionNode(): void {}
}

class IntegerLiteral implements Expression {
  constructor(public token: Token, public value: number) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }

  expressionNode(): void {}
}

class FunctionLiteral implements Expression {
  constructor(
    public token: Token,
    public parameters: Identifier[],
    public body: BlockStatement
  ) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} (${this.parameters.join(
      ', '
    )}) ${this.body.toString()}`;
  }

  expressionNode(): void {}
}

class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right: Expression
  ) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.operator}${this.right.toString()})`;
  }

  expressionNode(): void {}
}

class InfixExpression implements Expression {
  constructor(
    public token: Token,
    public left: Expression,
    public operator: string,
    public right: Expression
  ) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.left.toString()} ${
      this.operator
    } ${this.right.toString()})`;
  }

  expressionNode(): void {}
}

class IfExpression implements Expression {
  constructor(
    public token: Token,
    public condition: Expression,
    public consequence: BlockStatement,
    public alternative?: BlockStatement
  ) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `if ${this.condition.toString()} ${this.consequence.toString()} ${
      this.alternative ? 'else ' : ''
    }${this.alternative?.toString() ?? ''}`;
  }

  expressionNode(): void {}
}

class CallExpression implements Expression {
  constructor(
    public token: Token, // '('
    public func: Expression, // identifier or function literal
    public args: Expression[]
  ) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.func.toString()}(${this.args.join(', ')})`;
  }

  expressionNode(): void {}
}

class BlockStatement implements Statement {
  constructor(public token: Token, public statements: Statement[]) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.statements.map(s => s.toString()).join('');
  }

  statementNode(): void {}
}

class LetStatement implements Statement {
  token: Token;
  name: Identifier;
  value: Expression;

  constructor(token: Token, name: Identifier, value: Expression) {
    this.token = token;
    this.name = name;
    this.value = value;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  toString() {
    return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value.toString()};`;
  }
}

class ReturnStatement implements Statement {
  token: Token;
  returnValue: Expression;

  constructor(token: Token, returnValue: Expression) {
    this.token = token;
    this.returnValue = returnValue;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.returnValue.toString()};`;
  }
}

class ExpressionStatement implements Statement {
  token: Token;
  expression: Expression;

  constructor(token: Token, expression: Expression) {
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
  IntegerLiteral,
  Expression,
  IllegalExpression,
  StringLiteral,
  BooleanLiteral,
  FunctionLiteral,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  CallExpression,
  BlockStatement,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  Program,
  Identifier,
};

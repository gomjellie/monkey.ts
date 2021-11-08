import {Token} from './lexer';

abstract class Node {
  constructor() {}

  abstract TokenLiteral(): string;
}

abstract class Statement extends Node {
  abstract statementNode(): void;
}

abstract class Expression extends Node {
  abstract expressionNode(): void;
}

class Identifier implements Expression {
  constructor(public value: string) {}

  TokenLiteral(): string {
    return this.value;
  }

  expressionNode(): void {}
}

class LetStatement implements Statement {
  token: Token;
  name: Identifier;
  expression: Expression;

  constructor(token: Token, name: Identifier, expression: Expression) {
    this.token = token;
    this.name = name;
    this.expression = expression;
  }

  statementNode() {}

  TokenLiteral() {
    return this.token.literal;
  }
}

class Program extends Node {
  public statements: Statement[];

  constructor(statements: Statement[]) {
    super();
    this.statements = statements;
  }

  TokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].TokenLiteral();
    } else {
      return '';
    }
  }
}

export {Node, Statement, Expression, Program};

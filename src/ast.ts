import {Token} from './lexer';

abstract class Node {
  constructor() {}

  abstract tokenLiteral(): string;
}

abstract class Statement extends Node {
  abstract statementNode(): void;
}

abstract class Expression extends Node {
  abstract expressionNode(): void;
}

class Identifier implements Expression {
  constructor(public value: string) {}

  tokenLiteral(): string {
    return this.value;
  }

  expressionNode(): void {}
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
}

export {Node, Statement, Expression, LetStatement, Program, Identifier};

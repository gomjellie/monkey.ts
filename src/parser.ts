import {
  LetStatement,
  ReturnStatement,
  Program,
  Statement,
  Identifier,
  Expression,
  ExpressionStatement,
  IntegerLiteral,
} from './ast';
import {Lexer, Token, TokenType} from './lexer';

type PrefixParseFn = (parser: Parser) => Expression;
type InfixParseFn = (parser: Parser, left: Expression) => Expression;
type Precedence =
  | 'LOWEST'
  | 'EQUALS'
  | 'LESSGREATER'
  | 'SUM'
  | 'PRODUCT'
  | 'PREFIX'
  | 'CALL';

class Parser {
  public l: Lexer;
  public curToken: Token;
  public peekToken: Token;
  public errors: string[] = [];
  public prefixParseFns: {[key in TokenType]?: PrefixParseFn} = {};
  public infixParseFns: {[key in TokenType]?: InfixParseFn} = {};

  constructor(l: Lexer) {
    this.l = l;
    this.curToken = {type: 'ILLEGAL', literal: 'initialCurtoken'};
    this.peekToken = {type: 'EOF', literal: 'initialPeekToken'};
    this.registerPrefix('IDENT', this.parseIdentifier);
    this.registerPrefix('INT', this.parseIntegerLiteral);
    this.nextToken();
    this.nextToken();
  }

  parseIdentifier = () => {
    return new Identifier(this.curToken, this.curToken.literal);
  };

  parseIntegerLiteral = (): Expression => {
    const literal = new IntegerLiteral(
      this.curToken,
      parseInt(this.curToken.literal, 10)
    );
    return literal;
  };

  registerPrefix(tokenType: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: TokenType, fn: InfixParseFn) {
    this.infixParseFns[tokenType] = fn;
  }

  getErrors(): string[] {
    return this.errors;
  }

  peekError(t: TokenType): void {
    this.errors.push(
      `expected next token to be ${t}, got ${this.peekToken.type} instead`
    );
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  curTokenIs(t: TokenType): boolean {
    return this.curToken.type === t;
  }

  peekTokenIs(t: TokenType): boolean {
    return this.peekToken.type === t;
  }

  expectPeek(t: TokenType): boolean {
    if (this.peekToken.type === t) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  parseLetStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek('IDENT')) {
      return null;
    }

    const name = new Identifier(
      {
        literal: this.curToken.literal,
        type: 'IDENT',
      },
      this.curToken.literal
    );

    if (!this.expectPeek('=')) {
      return null;
    }

    while (this.curToken.type !== ';') {
      this.nextToken();
    }

    return new LetStatement(token, name);
  }

  parseReturnStatement(): Statement | null {
    const token = this.curToken;
    this.nextToken();

    while (this.curToken.type !== ';') {
      this.nextToken();
    }

    return new ReturnStatement(token); // TODO: 2번째 인자 returnValue 넘긴 identifier 나중에 변경해야함.
  }

  parseExpression(precedence: Precedence) {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      return undefined;
    }
    const leftExp = prefix(this);

    return leftExp;
  }

  parseExpressionStatement(): Statement | null {
    const stmt = new ExpressionStatement(this.curToken);
    stmt.expression = this.parseExpression('LOWEST');

    if (this.peekTokenIs(';')) {
      this.nextToken();
    }

    return stmt;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case 'LET':
        return this.parseLetStatement();
      case 'RETURN':
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseProgram(): Program | null {
    const program = new Program([]);
    while (this.curToken.type !== 'EOF') {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }
}

export {Parser};

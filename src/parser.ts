import {
  LetStatement,
  ReturnStatement,
  Program,
  Statement,
  Identifier,
  Expression,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  BooleanExpression,
} from './ast';
import {Lexer, Token, TokenType} from './lexer';

type PrefixParseFn = () => Expression;
type InfixParseFn = (left: Expression) => Expression;
type Precedence =
  | 'LOWEST'
  | 'EQUALS'
  | 'LESSGREATER'
  | 'SUM'
  | 'PRODUCT'
  | 'PREFIX'
  | 'CALL';

/** return true if a < b */
function Precedence_cmp(a: Precedence, b: Precedence): boolean {
  const precedenceMap: {[key: string]: number} = {
    LOWEST: 0,
    EQUALS: 1,
    LESSGREATER: 2,
    SUM: 3,
    PRODUCT: 4,
    PREFIX: 5,
    CALL: 6,
  };
  return precedenceMap[a] - precedenceMap[b] < 0;
}

const PRECEDENCES: {[key in TokenType]?: Precedence} = {
  '==': 'EQUALS',
  '!=': 'EQUALS',
  '<': 'LESSGREATER',
  '>': 'LESSGREATER',
  '+': 'SUM',
  '-': 'SUM',
  '*': 'PRODUCT',
  '/': 'PRODUCT',
};

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
    this.registerPrefix('-', this.parsePrefixExpression);
    this.registerPrefix('!', this.parsePrefixExpression);
    this.registerPrefix('TRUE', this.parseBoolean);
    this.registerPrefix('FALSE', this.parseBoolean);
    this.registerPrefix('(', this.parseGroupedExpression);
    this.registerInfix('+', this.parseInfixExpression);
    this.registerInfix('-', this.parseInfixExpression);
    this.registerInfix('*', this.parseInfixExpression);
    this.registerInfix('/', this.parseInfixExpression);
    this.registerInfix('==', this.parseInfixExpression);
    this.registerInfix('!=', this.parseInfixExpression);
    this.registerInfix('<', this.parseInfixExpression);
    this.registerInfix('>', this.parseInfixExpression);
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

  parseBoolean = (): Expression => {
    return new BooleanExpression(this.curToken, this.curTokenIs('TRUE'));
  };

  parseGroupedExpression = (): Expression => {
    this.nextToken();
    const exp = this.parseExpression('LOWEST');
    if (!this.expectPeek(')')) {
      this.errors.push('expected )');
      throw new Error('expected )');
    }
    return exp;
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

  parsePrefixExpression = (): Expression => {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );
    this.nextToken();

    expression.right = this.parseExpression('PREFIX');

    return expression;
  };

  curPrecedence(): Precedence {
    return PRECEDENCES[this.curToken.type] || 'LOWEST';
  }

  peekPrecedence(): Precedence {
    return PRECEDENCES[this.peekToken.type] || 'LOWEST';
  }

  parseInfixExpression = (left: Expression): Expression => {
    const expression = new InfixExpression(
      this.curToken,
      left,
      this.curToken.literal
    );
    const precedence = this.curPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);
    return expression;
  };

  parseExpression(precedence: Precedence) {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      throw new Error('no prefix parse function');
    }
    let leftExp = prefix();

    while (
      !this.peekTokenIs(';') &&
      Precedence_cmp(precedence, this.peekPrecedence())
    ) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (!infix) {
        return leftExp;
      }
      this.nextToken();

      leftExp = infix(leftExp);
    }

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

  noPrefixParseFnError(t: TokenType): void {
    this.errors.push(`no prefix parse function for ${t} found`);
  }
}

export {Parser};

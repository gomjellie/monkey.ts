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
  BooleanLiteral,
  IllegalExpression,
  IfExpression,
  BlockStatement,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
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
  const precedenceMap: {[key in Precedence]: number} = {
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
  '(': 'CALL',
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
    this.registerPrefix('(', this.handleOpenParen);
    this.registerPrefix('IF', this.parseIfExpression);
    this.registerPrefix('FUNCTION', this.parseFunctionLiteral);
    this.registerPrefix('STRING', this.parseStringLiteral);
    this.registerInfix('(', this.parseCallExpression);
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

  parseStringLiteral = (): Expression => {
    return new StringLiteral(this.curToken, this.curToken.literal);
  };

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
    return new BooleanLiteral(this.curToken, this.curTokenIs('TRUE'));
  };

  /** ArrowFunction ?????? GroupExpression ?????? */
  handleOpenParen = (): Expression => {
    this.nextToken();
    if (this.curTokenIs(')')) {
      if (this.expectPeek('=>')) {
        if (!this.expectPeek('{')) {
          return new IllegalExpression(this.curToken);
        }
        const body = this.parseBlockStatement();
        return new FunctionLiteral(this.curToken, [], body);
      }
      return new IllegalExpression(this.curToken);
    }
    const exp = this.parseExpression('LOWEST');
    if (exp instanceof Identifier) {
      if (this.peekTokenIs(',')) {
        return this.parseArrowFunction();
      }
      if (this.peekTokenIs(')')) {
        this.nextToken();
        if (this.peekTokenIs('=>')) {
          this.nextToken();
          if (!this.expectPeek('{')) {
            return new IllegalExpression(this.curToken);
          }
          const body = this.parseBlockStatement();
          return new FunctionLiteral(this.curToken, [exp], body);
        }
        return exp;
      }
    }
    if (!this.expectPeek(')')) {
      return new IllegalExpression(this.curToken);
    }
    return exp;
  };

  parseArrowFunction = (): Expression => {
    const params = this.parseFunctionParameters();
    if (!this.expectPeek('=>')) {
      return new IllegalExpression(this.curToken);
    }
    if (!this.expectPeek('{')) {
      return new IllegalExpression(this.curToken);
    }
    const body = this.parseBlockStatement();
    return new FunctionLiteral(this.curToken, params, body);
  };

  parseGroupedExpression = (): Expression => {
    const exp = this.parseExpression('LOWEST');
    if (!this.expectPeek(')')) {
      return new IllegalExpression(this.curToken);
    }
    return exp;
  };

  parseFunctionLiteral = (): Expression => {
    const token = this.curToken;
    if (!this.expectPeek('(')) {
      return new IllegalExpression(token);
    }

    const params = this.parseFunctionParameters();

    if (!this.expectPeek('{')) {
      return new IllegalExpression(token);
    }

    const body = this.parseBlockStatement();

    return new FunctionLiteral(token, params, body);
  };

  parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = [];
    if (this.peekTokenIs(')')) {
      this.nextToken();
      return identifiers;
    }
    this.curTokenIs('IDENT') || this.nextToken();
    identifiers.push(new Identifier(this.curToken, this.curToken.literal));
    while (this.peekTokenIs(',')) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new Identifier(this.curToken, this.curToken.literal));
    }
    if (!this.expectPeek(')')) {
      return [];
    }
    return identifiers;
  }

  parseCallExpression = (func: Expression): Expression => {
    const token = this.curToken;
    const args = this.parseCallArguments();
    return new CallExpression(token, func, args);
  };

  parseCallArguments = (): Expression[] => {
    const args: Expression[] = [];
    if (this.peekTokenIs(')')) {
      this.nextToken();
      return args;
    }
    this.nextToken();
    args.push(this.parseExpression('LOWEST'));
    while (this.peekTokenIs(',')) {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression('LOWEST'));
    }
    if (!this.expectPeek(')')) {
      return [];
    }
    return args;
  };

  parseIfExpression = (): Expression => {
    const token = this.curToken;

    if (!this.expectPeek('(')) {
      return new IllegalExpression(this.curToken);
    }

    this.nextToken();
    const condition = this.parseExpression('LOWEST');

    if (!this.expectPeek(')')) {
      return new IllegalExpression(this.curToken);
    }

    if (!this.expectPeek('{')) {
      return new IllegalExpression(this.curToken);
    }

    const consequence = this.parseBlockStatement();

    if (this.peekTokenIs('ELSE')) {
      this.nextToken();

      if (!this.expectPeek('{')) {
        return new IllegalExpression(this.curToken);
      }
      const alternative = this.parseBlockStatement();
      return new IfExpression(token, condition, consequence, alternative);
    }

    return new IfExpression(token, condition, consequence);
  };

  parseBlockStatement = (): BlockStatement => {
    const token = this.curToken;
    const statements: Statement[] = [];
    this.nextToken();
    while (!this.curTokenIs('}') && !this.curTokenIs('EOF')) {
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
      this.nextToken();
    }
    return new BlockStatement(token, statements);
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

  /**
   * expectPeek checks if the next token is of the expected type and advances the token if it is.
   * @param t the token type to expect
   * @returns true if the next token is of type t
   */
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

    this.nextToken();

    const value = this.parseExpression('LOWEST');

    if (this.peekTokenIs(';')) {
      this.nextToken();
    }

    return new LetStatement(token, name, value);
  }

  parseReturnStatement(): Statement {
    const token = this.curToken;
    this.nextToken();

    const returnValue = this.parseExpression('LOWEST');

    if (this.peekTokenIs(';')) {
      this.nextToken();
    }

    return new ReturnStatement(token, returnValue);
  }

  parsePrefixExpression = (): Expression => {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal,
      (() => {
        this.nextToken();
        return this.parseExpression('PREFIX');
      })()
    );

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
      this.curToken.literal,
      (() => {
        const precedence = this.curPrecedence();
        this.nextToken();
        return this.parseExpression(precedence);
      })()
    );
    return expression;
  };

  parseExpression(precedence: Precedence): Expression {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return new IllegalExpression(this.curToken);
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

  parseExpressionStatement(): Statement {
    const stmt = new ExpressionStatement(
      this.curToken,
      this.parseExpression('LOWEST')
    );

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

  parseProgram(): Program {
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

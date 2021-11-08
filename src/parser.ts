import {LetStatement, Program, Statement, Identifier} from './ast';
import {Lexer, Token, TokenType} from './lexer';

class Parser {
  public l: Lexer;
  public curToken: Token;
  public peekToken: Token;

  constructor(l: Lexer) {
    this.l = l;
    this.curToken = {type: 'ILLEGAL', literal: 'initialCurtoken'};
    this.peekToken = {type: 'EOF', literal: 'initialPeekToken'};
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  parseLetStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek('IDENT')) {
      return null;
    }

    const name = new Identifier(this.curToken.literal);

    if (!this.expectPeek('=')) {
      return null;
    }

    while (this.curToken.type !== ';') {
      this.nextToken();
    }

    return new LetStatement(token, name, name); // TODO: 3번째 인자 value로 넘긴 name 나중에 변경해야함.
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
      return false;
    }
  }

  parseReturnStatement(): Statement | null {
    throw new Error('Not implemented');
  }

  parseExpressionStatement(): Statement | null {
    throw new Error('Not implemented');
  }

  parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case 'LET':
        return this.parseLetStatement();
      case 'RETURN':
        return this.parseReturnStatement();
      default:
        return null;
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

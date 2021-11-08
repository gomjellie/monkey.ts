import {Program} from './ast';
import {Lexer, Token} from './lexer';

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

  parseProgram(): Program | null {
    return null;
  }
}

export {Parser};

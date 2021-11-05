// export type TokenType =
//   | 'ILLEGAL'
//   | 'EOF'
//   | 'IDENT'
//   | 'ASSIGN'
//   | 'PLUS'
//   | 'COMMA'
//   | 'SEMICOLON'
//   | '('
//   | ')'
//   | '{'
//   | '}'
//   | 'FUNCTION'
//   | 'LET';

export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  IDENT = 'IDENT',
  ASSIGN = '=',
  PLUS = '+',
  COMMA = ',',
  SEMICOLON = ';',
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  UNKNOWN = 'UNKNOWN',
}

export type Token = {
  type: TokenType;
  literal: string;
};

export class Lexer {
  private readonly source: string;
  private tokens: Token[];
  private position: number; // 입력에서 현재 위치 (현재 문자를 가리킴)
  private readPosition: number; // 입력에서 현재 읽는 위치(현재 문자의 다음을 가리킴)
  private ch: string | null; // 현재 조사하고 있는 문자

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.position = 0;
    this.readPosition = 0;
    this.ch = null;
    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.source.length) {
      this.ch = null;
    } else {
      this.ch = this.source[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  nextToken(): Token {
    let tok: Token;

    switch (this.ch) {
      case '=':
        tok = {
          type: TokenType.ASSIGN,
          literal: this.ch,
        };
        break;
      case '+':
        tok = {type: TokenType.PLUS, literal: this.ch};
        break;
      case ',':
        tok = {type: TokenType.COMMA, literal: this.ch};
        break;
      case ';':
        tok = {type: TokenType.SEMICOLON, literal: this.ch};
        break;
      case '(':
        tok = {type: TokenType.LPAREN, literal: this.ch};
        break;
      case ')':
        tok = {type: TokenType.RPAREN, literal: this.ch};
        break;
      case '{':
        tok = {type: TokenType.LBRACE, literal: this.ch};
        break;
      case '}':
        tok = {type: TokenType.RBRACE, literal: this.ch};
        break;
      case null:
        tok = {type: TokenType.EOF, literal: ''};
        break;
      default:
        throw new SyntaxError(`Unexpected character: ${this.ch}`);
    }

    this.readChar();
    return tok;
  }
}

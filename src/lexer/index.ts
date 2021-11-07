import {lookupIdentifier} from '../token';
export type TokenType =
  | 'ILLEGAL'
  | 'EOF'
  | 'IDENT'
  | '='
  | '+'
  | '-'
  | '*'
  | '/'
  | '!'
  | ','
  | '<'
  | '>'
  | ';'
  | '('
  | ')'
  | '{'
  | '}'
  | 'FUNCTION'
  | 'LET'
  | 'INT'
  | 'IF'
  | 'ELSE'
  | 'RETURN'
  | 'TRUE'
  | 'FALSE';

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

  skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n') {
      this.readChar();
    }
  }

  nextToken = () => {
    let tok: Token;

    this.skipWhitespace();

    switch (this.ch) {
      case '=':
        tok = {
          type: '=',
          literal: this.ch,
        };
        break;
      case '+':
        tok = {type: '+', literal: this.ch};
        break;
      case ',':
        tok = {type: ',', literal: this.ch};
        break;
      case ';':
        tok = {type: ';', literal: this.ch};
        break;
      case '(':
        tok = {type: '(', literal: this.ch};
        break;
      case ')':
        tok = {type: ')', literal: this.ch};
        break;
      case '{':
        tok = {type: '{', literal: this.ch};
        break;
      case '}':
        tok = {type: '}', literal: this.ch};
        break;
      case '!':
        tok = {type: '!', literal: this.ch};
        break;
      case '-':
        tok = {type: '-', literal: this.ch};
        break;
      case '/':
        tok = {type: '/', literal: this.ch};
        break;
      case '*':
        tok = {type: '*', literal: this.ch};
        break;
      case '<':
        tok = {type: '<', literal: this.ch};
        break;
      case '>':
        tok = {type: '>', literal: this.ch};
        break;
      case null:
        tok = {type: 'EOF', literal: ''};
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = {
            literal,
            type: lookupIdentifier(literal),
          };
          return tok;
        } else if (this.isDigit(this.ch)) {
          const literal = this.readNumber();
          tok = {
            literal,
            type: 'INT',
          };
          return tok;
        } else {
          tok = {type: 'ILLEGAL', literal: this.ch};
          return tok;
        }
    }

    this.readChar();
    return tok;
  };

  isLetter = (ch: string | null) => {
    if (ch === null) return false;
    return /[a-zA-Z_]/.test(ch);
  };

  isDigit = (ch: string | null) => {
    if (ch === null) return false;
    return /[0-9]/.test(ch);
  };

  readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.source.slice(position, this.position);
  }

  readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }

    return this.source.slice(position, this.position);
  }
}

export type TokenType =
  | 'ILLEGAL'
  | 'EOF'
  | 'IDENT'
  | 'ASSIGN'
  | 'PLUS'
  | 'COMMA'
  | 'SEMICOLON'
  | '('
  | ')'
  | '{'
  | '}'
  | 'FUNCTION'
  | 'LET';

export type Token = {
  type: TokenType;
  value: string;
};

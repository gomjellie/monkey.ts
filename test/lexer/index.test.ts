import {TokenType, Lexer} from '../../src/lexer';

test('asdf', () => {
  const input = '=+(){},;';

  const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
    {expectedType: TokenType.ASSIGN, expectedLiteral: '='},
    {expectedType: TokenType.PLUS, expectedLiteral: '+'},
    {expectedType: TokenType.LPAREN, expectedLiteral: '('},
    {expectedType: TokenType.RPAREN, expectedLiteral: ')'},
    {expectedType: TokenType.LBRACE, expectedLiteral: '{'},
    {expectedType: TokenType.RBRACE, expectedLiteral: '}'},
    {expectedType: TokenType.COMMA, expectedLiteral: ','},
    {expectedType: TokenType.SEMICOLON, expectedLiteral: ';'},
  ];

  const l = new Lexer(input);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const tok = l.nextToken();
    expect(tok.type).toBe(test.expectedType);
    expect(tok.literal).toBe(test.expectedLiteral);
  }
});

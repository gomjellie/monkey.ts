import {TokenType, Lexer} from '../../src/lexer';

test('NextToken should parse special characters', () => {
  const input = '=+(){},;!-/*<>';

  const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
    {expectedType: '=', expectedLiteral: '='},
    {expectedType: '+', expectedLiteral: '+'},
    {expectedType: '(', expectedLiteral: '('},
    {expectedType: ')', expectedLiteral: ')'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: '}', expectedLiteral: '}'},
    {expectedType: ',', expectedLiteral: ','},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '!', expectedLiteral: '!'},
    {expectedType: '-', expectedLiteral: '-'},
    {expectedType: '/', expectedLiteral: '/'},
    {expectedType: '*', expectedLiteral: '*'},
    {expectedType: '<', expectedLiteral: '<'},
    {expectedType: '>', expectedLiteral: '>'},
  ];

  const l = new Lexer(input);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const tok = l.nextToken();
    expect(tok.type).toBe(test.expectedType);
    expect(tok.literal).toBe(test.expectedLiteral);
  }
});

test('NextToken should parse simple monkey code', () => {
  const input = `let five = 5;
  let ten = 10;
  
  let add = fn(x, y) {
    x + y;
  };

  let result = add(five, ten);
  `;

  const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
    {expectedType: 'LET', expectedLiteral: 'let'},
    {expectedType: 'IDENT', expectedLiteral: 'five'},
    {expectedType: '=', expectedLiteral: '='},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'LET', expectedLiteral: 'let'},
    {expectedType: 'IDENT', expectedLiteral: 'ten'},
    {expectedType: '=', expectedLiteral: '='},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'LET', expectedLiteral: 'let'},
    {expectedType: 'IDENT', expectedLiteral: 'add'},
    {expectedType: '=', expectedLiteral: '='},
    {expectedType: 'FUNCTION', expectedLiteral: 'fn'},
    {expectedType: '(', expectedLiteral: '('},
    {expectedType: 'IDENT', expectedLiteral: 'x'},
    {expectedType: ',', expectedLiteral: ','},
    {expectedType: 'IDENT', expectedLiteral: 'y'},
    {expectedType: ')', expectedLiteral: ')'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: 'IDENT', expectedLiteral: 'x'},
    {expectedType: '+', expectedLiteral: '+'},
    {expectedType: 'IDENT', expectedLiteral: 'y'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '}', expectedLiteral: '}'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'LET', expectedLiteral: 'let'},
    {expectedType: 'IDENT', expectedLiteral: 'result'},
    {expectedType: '=', expectedLiteral: '='},
    {expectedType: 'IDENT', expectedLiteral: 'add'},
    {expectedType: '(', expectedLiteral: '('},
    {expectedType: 'IDENT', expectedLiteral: 'five'},
    {expectedType: ',', expectedLiteral: ','},
    {expectedType: 'IDENT', expectedLiteral: 'ten'},
    {expectedType: ')', expectedLiteral: ')'},
    {expectedType: ';', expectedLiteral: ';'},
  ];

  const l = new Lexer(input);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const tok = l.nextToken();
    expect(tok.literal).toBe(test.expectedLiteral);
    expect(tok.type).toBe(test.expectedType);
  }
});

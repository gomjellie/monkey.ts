import {TokenType, Lexer} from '../src/lexer';

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
  !-/*5;
  5 < 10 > 5;

  if (5 < 10) {
    return true;
  } else {
    return false;
  }

  10 == 10;
  10 != 9;

  "foobar";
  "foo bar";
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
    {expectedType: '!', expectedLiteral: '!'},
    {expectedType: '-', expectedLiteral: '-'},
    {expectedType: '/', expectedLiteral: '/'},
    {expectedType: '*', expectedLiteral: '*'},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: '<', expectedLiteral: '<'},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: '>', expectedLiteral: '>'},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'IF', expectedLiteral: 'if'},
    {expectedType: '(', expectedLiteral: '('},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: '<', expectedLiteral: '<'},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: ')', expectedLiteral: ')'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: 'RETURN', expectedLiteral: 'return'},
    {expectedType: 'TRUE', expectedLiteral: 'true'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '}', expectedLiteral: '}'},
    {expectedType: 'ELSE', expectedLiteral: 'else'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: 'RETURN', expectedLiteral: 'return'},
    {expectedType: 'FALSE', expectedLiteral: 'false'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '}', expectedLiteral: '}'},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: '==', expectedLiteral: '=='},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: '!=', expectedLiteral: '!='},
    {expectedType: 'INT', expectedLiteral: '9'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'STRING', expectedLiteral: 'foobar'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'STRING', expectedLiteral: 'foo bar'},
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

test('NextToken Should Parse if else', () => {
  const input = `if (5 < 10) {
    return true;
  } else {
    return false;
  }`;

  const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
    {expectedType: 'IF', expectedLiteral: 'if'},
    {expectedType: '(', expectedLiteral: '('},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: '<', expectedLiteral: '<'},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: ')', expectedLiteral: ')'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: 'RETURN', expectedLiteral: 'return'},
    {expectedType: 'TRUE', expectedLiteral: 'true'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '}', expectedLiteral: '}'},
    {expectedType: 'ELSE', expectedLiteral: 'else'},
    {expectedType: '{', expectedLiteral: '{'},
    {expectedType: 'RETURN', expectedLiteral: 'return'},
    {expectedType: 'FALSE', expectedLiteral: 'false'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: '}', expectedLiteral: '}'},
  ];

  const l = new Lexer(input);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const tok = l.nextToken();
    expect(tok.literal).toBe(test.expectedLiteral);
    expect(tok.type).toBe(test.expectedType);
  }
});

test('NextToken Should Parse == and !=', () => {
  const input = `5 == 10;
  5 != 10;`;

  const tests: {expectedType: TokenType; expectedLiteral: string}[] = [
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: '==', expectedLiteral: '=='},
    {expectedType: 'INT', expectedLiteral: '10'},
    {expectedType: ';', expectedLiteral: ';'},
    {expectedType: 'INT', expectedLiteral: '5'},
    {expectedType: '!=', expectedLiteral: '!='},
    {expectedType: 'INT', expectedLiteral: '10'},
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

import {
  Statement,
  LetStatement,
  Identifier,
  ExpressionStatement,
  IntegerLiteral,
  Expression,
  PrefixExpression,
  InfixExpression,
  BooleanLiteral,
  IfExpression,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
} from '../src/ast';
import {Lexer} from '../src/lexer';
import {Parser} from '../src/parser';

test('Parser Should parse let statements', () => {
  const tests: {
    input: string;
    expectedIdentifier: string;
    expectedValue: string | number | boolean;
  }[] = [
    {
      input: 'let x = 5;',
      expectedIdentifier: 'x',
      expectedValue: 5,
    },
    {
      input: 'let y = true;',
      expectedIdentifier: 'y',
      expectedValue: true,
    },
    {
      input: 'let foobar = y;',
      expectedIdentifier: 'foobar',
      expectedValue: 'y',
    },
  ];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const l = new Lexer(t.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0] as LetStatement;
    testLetStatement(stmt, t.expectedIdentifier);
    const val = stmt.value;
    expect(val).not.toBeUndefined();
    if (!val) return;
    testLiteralExpression(val, t.expectedValue);
  }
});

test('Parser Should parse return statements', () => {
  const input = `
return 5;
return 10;
return 993322;
  `;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);
  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(3);

  for (let i = 0; i < program.statements.length; i++) {
    const stmt = program.statements[i];
    expect(stmt.tokenLiteral()).toBe('return');
  }
});

test('Parser Should parse Identifier foobar;', () => {
  const input = 'foobar;';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.tokenLiteral()).toBe('foobar');

  expect(stmt.expression).toBeInstanceOf(Identifier);
  const ident: Identifier = stmt.expression as Identifier;
  expect(ident.value).toBe('foobar');
  expect(ident.tokenLiteral()).toBe('foobar');
});

test('Parser Should parse Boolean Literal', () => {
  const booleaTests: {input: string; expected: boolean}[] = [
    {input: 'true;', expected: true},
    {input: 'false;', expected: false},
  ];

  for (let i = 0; i < booleaTests.length; i++) {
    const test = booleaTests[i];
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.statements.length).toBe(1);

    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.expression).not.toBeUndefined();
    if (stmt.expression === undefined) return;
    expect(stmt.expression).toBeInstanceOf(BooleanLiteral);
    testBooleanLiteral(stmt.expression as BooleanLiteral, test.expected);
  }
});

test('Parser Should parse ExpressionStatement Integer Literal 5', () => {
  const input = '5;';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.tokenLiteral()).toBe('5');

  expect(stmt.expression).toBeInstanceOf(IntegerLiteral);
  const literal = stmt.expression as IntegerLiteral;
  expect(literal.value).toBe(5);
  expect(literal.tokenLiteral()).toBe('5');
});

test('Parser should parse Prefix Expressions', () => {
  const prefixTests: {
    input: string;
    operator: string;
    value: number | boolean;
  }[] = [
    {input: '!5;', operator: '!', value: 5},
    {input: '-15;', operator: '-', value: 15},
    {input: '!true;', operator: '!', value: true},
    {input: '!false;', operator: '!', value: false},
  ];

  for (let i = 0; i < prefixTests.length; i++) {
    const test = prefixTests[i];
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.statements.length).toBe(1);

    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(PrefixExpression);
    const exp = stmt.expression as PrefixExpression;
    expect(exp.operator).toBe(test.operator);
    expect(exp.right).not.toBeUndefined();
    if (!exp.right) return;
    const right = exp.right;
    testLiteralExpression(right, test.value);
  }
});

test('Parser Should parse Infix Expressions', () => {
  const infixTests: {
    input: string;
    leftValue: number | boolean;
    operator: string;
    rightValue: number | boolean;
  }[] = [
    {input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5},
    {input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5},
    {input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5},
    {input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5},
    {input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5},
    {input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5},
    {input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5},
    {input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5},
    {input: 'true == true', leftValue: true, operator: '==', rightValue: true},
    {
      input: 'true != false',
      leftValue: true,
      operator: '!=',
      rightValue: false,
    },
    {
      input: 'false == false',
      leftValue: false,
      operator: '==',
      rightValue: false,
    },
  ];

  for (let i = 0; i < infixTests.length; i++) {
    const test = infixTests[i];
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.statements.length).toBe(1);

    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.expression).toBeInstanceOf(InfixExpression);
    const exp = stmt.expression as InfixExpression;
    testInfixExpression(exp, test.leftValue, test.operator, test.rightValue);
  }
});

test('Parser Should parse Operator Precedence', () => {
  const tests: {input: string; expected: string}[] = [
    {input: '-a * b', expected: '((-a) * b)'},
    {input: '!-a', expected: '(!(-a))'},
    {input: 'a + b + c', expected: '((a + b) + c)'},
    {input: 'a + b - c', expected: '((a + b) - c)'},
    {input: 'a * b * c', expected: '((a * b) * c)'},
    {input: 'a * b / c', expected: '((a * b) / c)'},
    {input: 'a + b / c', expected: '(a + (b / c))'},
    {
      input: 'a + b * c + d / e - f',
      expected: '(((a + (b * c)) + (d / e)) - f)',
    },
    {input: '3 + 4; -5 * 5', expected: '(3 + 4)((-5) * 5)'},
    {input: '5 > 4 == 3 < 4', expected: '((5 > 4) == (3 < 4))'},
    {input: '5 < 4 != 3 > 4', expected: '((5 < 4) != (3 > 4))'},
    {
      input: '3 + 4 * 5 == 3 * 1 + 4 * 5',
      expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
    },
    {
      input: '1 + (2 + 3) + 4',
      expected: '((1 + (2 + 3)) + 4)',
    },
    {
      input: '(5 + 5) * 2',
      expected: '((5 + 5) * 2)',
    },
    {
      input: '2 / (5 + 5)',
      expected: '(2 / (5 + 5))',
    },
    {
      input: '-(5 + 5)',
      expected: '(-(5 + 5))',
    },
    {
      input: '!(true == true)',
      expected: '(!(true == true))',
    },
    {
      input: 'a + add(b * c) + d',
      expected: '((a + add((b * c))) + d)',
    },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    },
    {
      input: 'add(a + b + c * d / f + g)',
      expected: 'add((((a + b) + ((c * d) / f)) + g))',
    },
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.toString()).toBe(test.expected);
  }
});

test('Parser Should parse If Expression', () => {
  const input = 'if (x < y) { x }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(IfExpression);
  const exp = stmt.expression as IfExpression;
  expect(exp.condition).not.toBeUndefined();
  const condition = exp.condition;
  expect(condition).toBeInstanceOf(InfixExpression);
  const infix = condition as InfixExpression;
  testInfixExpression(infix, 'x', '<', 'y');

  const consequence = exp.consequence;
  expect(consequence.statements.length).toBe(1);
  expect(consequence.statements[0]).toBeInstanceOf(ExpressionStatement);
  const consequenceStmt = consequence.statements[0] as ExpressionStatement;
  expect(consequenceStmt.expression).toBeInstanceOf(Identifier);
  if (!consequenceStmt.expression) return;
  testIdentifier(consequenceStmt.expression, 'x');
});

test('Parser Should parse If-Else Expression', () => {
  const input = 'if (x < y) { x } else { y }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(IfExpression);
  const exp = stmt.expression as IfExpression;
  expect(exp.condition).not.toBeUndefined();
  const condition = exp.condition;
  expect(condition).toBeInstanceOf(InfixExpression);
  const infix = condition as InfixExpression;
  testInfixExpression(infix, 'x', '<', 'y');

  const consequence = exp.consequence;
  expect(consequence.statements.length).toBe(1);
  expect(consequence.statements[0]).toBeInstanceOf(ExpressionStatement);
  const consequenceStmt = consequence.statements[0] as ExpressionStatement;
  expect(consequenceStmt.expression).toBeInstanceOf(Identifier);
  if (!consequenceStmt.expression) return;

  testIdentifier(consequenceStmt.expression, 'x');

  const alternative = exp.alternative;
  expect(alternative).not.toBeUndefined();
  if (!alternative) return;
  expect(alternative.statements.length).toBe(1);
  expect(alternative.statements[0]).toBeInstanceOf(ExpressionStatement);
  const alternativeStmt = alternative.statements[0] as ExpressionStatement;
  expect(alternativeStmt.expression).toBeInstanceOf(Identifier);
  if (!alternativeStmt.expression) return;

  testIdentifier(alternativeStmt.expression, 'y');
});

test('StringLiteral', () => {
  const input = '"hello world"';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(StringLiteral);
  if (!stmt.expression) return;
  const literal = stmt.expression as StringLiteral;
  expect(literal.value).toBe('hello world');
});

test('Parser Should parse FunctionLiteral', () => {
  const input = 'fn(x, y) { x + y; }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(FunctionLiteral);
  const fn = stmt.expression as FunctionLiteral;
  expect(fn.parameters.length).toBe(2);
  testLiteralExpression(fn.parameters[0], 'x');
  testLiteralExpression(fn.parameters[1], 'y');
  expect(fn.body.statements.length).toBe(1);
  expect(fn.body.statements[0]).toBeInstanceOf(ExpressionStatement);
  const bodyStmt = fn.body.statements[0] as ExpressionStatement;
  expect(bodyStmt.expression).toBeInstanceOf(InfixExpression);
  const infix = bodyStmt.expression as InfixExpression;
  testInfixExpression(infix, 'x', '+', 'y');
});

test('Arrow FunctionLiteral', () => {
  const input = '(x, y) => { x + y; }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(FunctionLiteral);
  const fn = stmt.expression as FunctionLiteral;
  expect(fn.parameters.length).toBe(2);
  testLiteralExpression(fn.parameters[0], 'x');
  testLiteralExpression(fn.parameters[1], 'y');
  expect(fn.body.statements.length).toBe(1);
  expect(fn.body.statements[0]).toBeInstanceOf(ExpressionStatement);
  const bodyStmt = fn.body.statements[0] as ExpressionStatement;
  expect(bodyStmt.expression).toBeInstanceOf(InfixExpression);
  const infix = bodyStmt.expression as InfixExpression;
  testInfixExpression(infix, 'x', '+', 'y');
});

test('Function Parameter Parsing', () => {
  const tests: {input: string; expectedParams: string[]}[] = [
    {input: 'fn() {};', expectedParams: []},
    {input: 'fn(x) {};', expectedParams: ['x']},
    {input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z']},
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const l = new Lexer(test.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull();
    if (program === null) return;
    expect(program.statements.length).toBe(1);

    expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.expression).toBeInstanceOf(FunctionLiteral);
    const fn = stmt.expression as FunctionLiteral;
    expect(fn.parameters.length).toBe(test.expectedParams.length);
    for (let i = 0; i < fn.parameters.length; i++) {
      testLiteralExpression(fn.parameters[i], test.expectedParams[i]);
    }
  }
});

test('Call Expression Parsing', () => {
  const input = 'add(1, 2 * 3, 4 + 5);';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(1);

  expect(program.statements[0]).toBeInstanceOf(ExpressionStatement);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.expression).toBeInstanceOf(CallExpression);
  const exp = stmt.expression as CallExpression;
  expect(exp.func).not.toBeUndefined();
  const func = exp.func;
  expect(func).toBeInstanceOf(Identifier);
  testIdentifier(func, 'add');
  expect(exp.args.length).toBe(3);
  testLiteralExpression(exp.args[0], 1);
  testInfixExpression(exp.args[1], 2, '*', 3);
  testInfixExpression(exp.args[2], 4, '+', 5);
});

function testLetStatement(s: Statement, name: string) {
  expect(s).not.toBeNull();
  if (s === null) return;
  expect(s.tokenLiteral()).toBe('let');

  expect(s).toBeInstanceOf(LetStatement);
  const letStmt = s as LetStatement;
  expect(letStmt.name.value).toBe(name);

  expect(letStmt.name.tokenLiteral()).toBe(name);
}

function testIntegerLiteral(il: IntegerLiteral, value: number) {
  expect(il).not.toBeNull();
  if (il === null) return;
  expect(il.value).toBe(value);
  expect(il.tokenLiteral()).toBe(String(value));
}

function checkParserErrors(p: Parser) {
  const errors = p.getErrors();
  if (errors.length > 0) {
    console.error(errors);
  }
  expect(errors.length).toBe(0);
}

function testIdentifier(exp: Expression, value: string) {
  expect(exp).not.toBeNull();
  if (exp === null) return;
  expect(exp).toBeInstanceOf(Identifier);
  const ident = exp as Identifier;
  expect(ident.value).toBe(value);
}

function testLiteralExpression(
  exp: Expression,
  expected: number | string | boolean
) {
  if (typeof expected === 'number') {
    testIntegerLiteral(exp as IntegerLiteral, expected);
  } else if (typeof expected === 'string') {
    testIdentifier(exp as Identifier, expected);
  } else if (typeof expected === 'boolean') {
    testBooleanLiteral(exp as BooleanLiteral, expected);
  }
}

function testBooleanLiteral(bl: BooleanLiteral, value: boolean) {
  expect(bl).not.toBeNull();
  if (bl === null) return;
  expect(bl.value).toBe(value);
}

function testInfixExpression(
  exp: Expression,
  left: number | string | boolean,
  operator: string,
  right: number | string | boolean
) {
  expect(exp).toBeInstanceOf(InfixExpression);
  const opExp = exp as InfixExpression;
  testLiteralExpression(opExp.left, left);
  expect(opExp.operator).toBe(operator);
  expect(opExp.right).not.toBeUndefined();
  if (!opExp.right) return;
  testLiteralExpression(opExp.right, right);
}

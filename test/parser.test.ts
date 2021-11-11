import {
  Statement,
  LetStatement,
  Identifier,
  ExpressionStatement,
  IntegerLiteral,
  Expression,
  PrefixExpression,
  InfixExpression,
  BooleanExpression,
} from '../src/ast';
import {Lexer} from '../src/lexer';
import {Parser} from '../src/parser';

test('Parser Should parse let statements', () => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
  `;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
  checkParserErrors(p);
  expect(program).not.toBeNull();
  if (program === null) return;
  expect(program.statements.length).toBe(3);

  const tests: {expectedIdentifier: string}[] = [
    {expectedIdentifier: 'x'},
    {expectedIdentifier: 'y'},
    {expectedIdentifier: 'foobar'},
  ];

  for (let i = 0; i < tests.length; i++) {
    const stmt = program.statements[i];
    const name = tests[i].expectedIdentifier;
    testLetStatement(stmt, name);
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
    expect(stmt.expression).toBeInstanceOf(BooleanExpression);
    testBooleanLiteral(stmt.expression as BooleanExpression, test.expected);
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
  const prefixTests: {input: string; operator: string; integerValue: number}[] =
    [
      {input: '!5;', operator: '!', integerValue: 5},
      {input: '-15;', operator: '-', integerValue: 15},
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
    expect(exp.right).toBeInstanceOf(IntegerLiteral);
    const right = exp.right as IntegerLiteral;
    testIntegerLiteral(right, test.integerValue);
  }
});

test('Parser Should parse Infix Expressions', () => {
  const infixTests: {
    input: string;
    leftValue: number;
    operator: string;
    rightValue: number;
  }[] = [
    {input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5},
    {input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5},
    {input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5},
    {input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5},
    {input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5},
    {input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5},
    {input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5},
    {input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5},
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
    testBooleanLiteral(exp as BooleanExpression, expected);
  }
}

function testBooleanLiteral(bl: BooleanExpression, value: boolean) {
  expect(bl).not.toBeNull();
  if (bl === null) return;
  expect(bl.value).toBe(value);
}

function testInfixExpression(
  exp: Expression,
  left: number | string,
  operator: string,
  right: number | string
) {
  expect(exp).toBeInstanceOf(InfixExpression);
  const opExp = exp as InfixExpression;
  testLiteralExpression(opExp.left, left);
  expect(opExp.operator).toBe(operator);
  expect(opExp.right).not.toBeUndefined();
  if (!opExp.right) return;
  testLiteralExpression(opExp.right, right);
}

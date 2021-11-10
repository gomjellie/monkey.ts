import {
  Statement,
  LetStatement,
  Identifier,
  ExpressionStatement,
  IntegerLiteral,
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

function testLetStatement(s: Statement, name: string) {
  expect(s).not.toBeNull();
  if (s === null) return;
  expect(s.tokenLiteral()).toBe('let');

  expect(s).toBeInstanceOf(LetStatement);
  const letStmt = s as LetStatement;
  expect(letStmt.name.value).toBe(name);

  expect(letStmt.name.tokenLiteral()).toBe(name);
}

function checkParserErrors(p: Parser) {
  const errors = p.getErrors();
  if (errors.length > 0) {
    console.error(errors);
  }
  expect(errors.length).toBe(0);
}

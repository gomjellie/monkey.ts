import {Statement, LetStatement} from '../src/ast';
import {Lexer} from '../src/lexer';
import {Parser} from '../src/parser';

test('Parser Should parse let expressions', () => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
  `;

  const l = new Lexer(input);
  const p = new Parser(l);

  const program = p.parseProgram();
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

function testLetStatement(s: Statement, name: string) {
  expect(s).not.toBeNull();
  if (s === null) return;
  expect(s.tokenLiteral()).toBe('let');

  expect(s).toBeInstanceOf(LetStatement);
  const letStmt = s as LetStatement;
  expect(letStmt.name.value).toBe(name);

  expect(letStmt.name.tokenLiteral()).toBe(name);
}

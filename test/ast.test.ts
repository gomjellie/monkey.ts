import {Program, LetStatement, Identifier} from '../src/ast';

test('AST.toString() should return right string', () => {
  const program: Program = new Program([]);
  program.statements = [
    new LetStatement(
      {literal: 'let', type: 'LET'},
      new Identifier({literal: 'myVar', type: 'IDENT'}, 'myVar'),
      new Identifier({literal: 'anotherVar', type: 'IDENT'}, 'anotherVar')
    ),
  ];

  expect(program.toString()).toBe('let myVar = anotherVar;');
});

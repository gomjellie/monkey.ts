import {monkeyEval} from '../src/evaluator';
import {Lexer} from '../src/lexer';
import {MonkeyBoolean, MonkeyInteger, MonkeyObject} from '../src/object';
import {Parser} from '../src/parser';

test('EvalIntegerExpression', () => {
  const tests = [
    {
      input: '5',
      expected: 5,
    },
    {
      input: '10',
      expected: 10,
    },
    {
      input: '-5',
      expected: -5,
    },
    {
      input: '-10',
      expected: -10,
    },
    {
      input: '5 + 5 + 5 + 5 - 10',
      expected: 10,
    },
    {
      input: '2 * 2 * 2 * 2 * 2',
      expected: 32,
    },
    {
      input: '-50 + 100 + -50',
      expected: 0,
    },
    {
      input: '5 * 2 + 10',
      expected: 20,
    },
    {
      input: '5 + 2 * 10',
      expected: 25,
    },
    {
      input: '20 + 2 * -10',
      expected: 0,
    },
    {
      input: '50 / 2 * 2 + 10',
      expected: 60,
    },
    {
      input: '2 * (5 + 10)',
      expected: 30,
    },
    {
      input: '3 * 3 * 3 + 10',
      expected: 37,
    },
    {
      input: '3 * (3 * 3) + 10',
      expected: 37,
    },
    {
      input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
      expected: 50,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBeNull();
    if (evaluated === null) return;
    testIntegerObject(evaluated, test.expected);
  });
});

test('BooleanExpression', () => {
  const tests = [
    {
      input: 'true',
      expected: true,
    },
    {
      input: 'false',
      expected: false,
    },
    {
      input: '1 < 2',
      expected: true,
    },
    {
      input: '1 > 2',
      expected: false,
    },
    {
      input: '1 < 1',
      expected: false,
    },
    {
      input: '1 > 1',
      expected: false,
    },
    {
      input: '1 == 1',
      expected: true,
    },
    {
      input: '1 != 1',
      expected: false,
    },
    {
      input: '1 == 2',
      expected: false,
    },
    {
      input: '1 != 2',
      expected: true,
    },
    {
      input: 'true == true',
      expected: true,
    },
    {
      input: 'false == false',
      expected: true,
    },
    {
      input: 'true == false',
      expected: false,
    },
    {
      input: 'true != false',
      expected: true,
    },
    {
      input: 'false != true',
      expected: true,
    },
    {
      input: '(1 < 2) == true',
      expected: true,
    },
    {
      input: '(1 < 2) == false',
      expected: false,
    },
    {
      input: '(1 > 2) == true',
      expected: false,
    },
    {
      input: '(1 > 2) == false',
      expected: true,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBeNull();
    if (evaluated === null) return;
    testBooleanObject(evaluated, test.expected);
  });
});

test('BangOperator', () => {
  const tests = [
    {
      input: '!true',
      expected: false,
    },
    {
      input: '!false',
      expected: true,
    },
    {
      input: '!5',
      expected: false,
    },
    {
      input: '!!true',
      expected: true,
    },
    {
      input: '!!false',
      expected: false,
    },
    {
      input: '!!5',
      expected: true,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    expect(evaluated).not.toBeNull();
    if (evaluated === null) return;
    testBooleanObject(evaluated, test.expected);
  });
});

function testEval(input: string): MonkeyObject | null {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  return monkeyEval(program);
}

function testIntegerObject(obj: MonkeyObject, expected: number): void {
  expect(obj).toBeInstanceOf(MonkeyInteger);
  if (!(obj instanceof MonkeyInteger)) return;
  expect(obj.value).toBe(expected);
}

function testBooleanObject(obj: MonkeyObject, expected: boolean): void {
  expect(obj).toBeInstanceOf(MonkeyObject);
  if (!(obj instanceof MonkeyBoolean)) return;
  expect(obj.value).toBe(expected);
}

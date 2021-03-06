import {monkeyEval, NULL} from '../src/evaluator';
import {Lexer} from '../src/lexer';
import {
  MonkeyBoolean,
  MonkeyError,
  MonkeyFunction,
  MonkeyInteger,
  MonkeyNull,
  MonkeyObject,
  MonkeyString,
} from '../src/object';
import {Environment} from '../src/environment';
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

test('IfElseExpression', () => {
  const tests = [
    {
      input: 'if (true) { 10 }',
      expected: 10,
    },
    {
      input: 'if (false) { 10 }',
      expected: NULL,
    },
    {
      input: 'if (1) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 < 2) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 > 2) { 10 }',
      expected: NULL,
    },
    {
      input: 'if (1 > 2) { 10 } else { 20 }',
      expected: 20,
    },
    {
      input: 'if (1 < 2) { 10 } else { 20 }',
      expected: 10,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    if (typeof test.expected === 'number') {
      testIntegerObject(evaluated, test.expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

test('ReturnStatements', () => {
  const tests = [
    {
      input: 'return 10;',
      expected: 10,
    },
    {
      input: 'return 10; 9;',
      expected: 10,
    },
    {
      input: 'return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: '9; return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: 'if (10 > 1) { return 10; }',
      expected: 10,
    },
    {
      input: 'if (1 < 10) { return 10; }',
      expected: 10,
    },
    {
      input: 'if (1 < 10) { return 10; } else { return 20; }',
      expected: 10,
    },
    {
      input: 'if (1 > 10) { return 10; } else { return 20; }',
      expected: 20,
    },
    {
      input: `
        if (10 > 1) {
          if (10 > 1) {
            return 10;
          }
          return 1;
        }
        `,
      expected: 10,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    testIntegerObject(evaluated, test.expected);
  });
});

test('ErrorHandling', () => {
  const tests = [
    {
      input: '5 + true;',
      expected: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '5 + true; 5;',
      expected: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '-true;',
      expected: 'unknown operator: -BOOLEAN',
    },
    {
      input: 'true + false;',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: '5; true + false; 5;',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { true + false; }',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { if (10 > 1) { return true + false; } return 1; }',
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'foobar',
      expected: 'identifier not found: foobar',
    },
    {
      input: '"Hello" - "World"',
      expected: 'unknown operator: STRING - STRING',
    },
    // {
    //   input: '{"name": "Monkey"}[fn(x) { x }];',
    //   expected: 'unusable as hash key: FUNCTION',
    // },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    testErrorObject(evaluated, test.expected);
  });
});

test('LetStatements', () => {
  const tests = [
    {
      input: 'let a = 5; a;',
      expected: 5,
    },
    {
      input: 'let a = 5 * 5; a;',
      expected: 25,
    },
    {
      input: 'let a = 5; let b = a; b;',
      expected: 5,
    },
    {
      input: 'let a = 5; let b = a; let c = a + b + 5; c;',
      expected: 15,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    testIntegerObject(evaluated, test.expected);
  });
});

test('FunctionObject', () => {
  const input = 'fn(x) { x + 2; };';

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyFunction);
  if (!(evaluated instanceof MonkeyFunction)) return;
  expect(evaluated.parameters.length).toBe(1);
  expect(evaluated.parameters[0].value).toBe('x');
  expect(evaluated.body.toString()).toEqual('(x + 2)');
});

test('Empty Arrow Function', () => {
  const input = '() => { "hello world" }();';

  const evaluated = testEval(input);
  expect(evaluated).toBeInstanceOf(MonkeyString);
  if (!(evaluated instanceof MonkeyString)) return;
  expect(evaluated.value).toBe('hello world');
});

test('FunctionApplication', () => {
  const tests = [
    {
      input: 'let identity = fn(x) { x; }; identity(5);', // ???????????? ??? ??????
      expected: 5,
    },
    {
      input: 'let identity = fn(x) { return x; }; identity(5);', // return ?????? ???????????? ??????
      expected: 5,
    },
    {
      input: 'let double = fn(x) { x * 2; }; double(5);', // ????????? ????????? ??????
      expected: 10,
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5, 5);', // ?????? ?????? ????????? ????????? ??????
      expected: 10,
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', // ????????? ????????? ????????? ??????
      expected: 20,
    },
    {
      input: 'fn(x) { x; }(5);', // ????????? ???????????? ?????? ?????? ??????
      expected: 5,
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    testIntegerObject(evaluated, test.expected);
  });
});

test('Closures', () => {
  const input = `
    let newAdder = fn(x) {
      fn(y) { x + y; };
    };

    let addTwo = newAdder(2);
    addTwo(2);
  `;

  const evaluated = testEval(input);
  testIntegerObject(evaluated, 4);
});

test('Grouped Expression', () => {
  const test = [
    {
      input: 'let a = 5; let b = 10; (a + b);',
      expected: 15,
    },
    {
      input: 'let a = 5; let b = 10; ((a) + b);',
      expected: 15,
    },
  ];

  test.forEach(t => {
    const evaluated = testEval(t.input);
    testIntegerObject(evaluated, t.expected);
  });
});

test('HigherOrderFunction', () => {
  const tests = [
    {
      input: `
        let makeGreeter = (greeting) => { (name) => { greeting + " " + name + "!" } };
        let greeter = makeGreeter("Hello");
        greeter("World");
      `,
      expected: 'Hello World!',
    },
    {
      input: `
          let makeGreeter = fn(greeting) { fn(name) { greeting + " " + name + "!" } };
          let greeter = makeGreeter("Hello");
          greeter("World");
        `,
      expected: 'Hello World!',
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    if (!(evaluated instanceof MonkeyString)) return;
    testStringObject(evaluated, test.expected);
  });
});

test('StringConcatenation', () => {
  const tests = [
    {
      input: '"Hello" + " " + "World!"',
      expected: 'Hello World!',
    },
    {
      input: '"Hello" + " " + "World" + "!"',
      expected: 'Hello World!',
    },
    {
      input: '"Hello" + " " + "World" + "" + "!"',
      expected: 'Hello World!',
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    testStringObject(evaluated, test.expected);
  });
});

test('BuiltinFunctions', () => {
  const tests = [
    {
      input: 'len("")',
      expected: 0,
    },
    {
      input: 'len("four")',
      expected: 4,
    },
    {
      input: 'len("hello world")',
      expected: 11,
    },
    {
      input: 'len("hello world!")',
      expected: 12,
    },
    {
      input: 'len(1)',
      expected: 'argument to `len` not supported, got INTEGER',
    },
    {
      input: 'len("one", "two")',
      expected: 'wrong number of arguments. got=2, want=1',
    },
  ];

  tests.forEach(test => {
    const evaluated = testEval(test.input);
    if (typeof test.expected === 'number') {
      testIntegerObject(evaluated, test.expected);
    } else {
      testErrorObject(evaluated, test.expected);
    }
  });
});

function testEval(input: string): MonkeyObject {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = new Environment();
  return monkeyEval(program, env);
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

function testNullObject(obj: MonkeyObject): void {
  expect(obj).toBeInstanceOf(MonkeyNull);
  if (!(obj instanceof MonkeyNull)) return;
}

function testErrorObject(obj: MonkeyObject, expected: string): void {
  expect(obj).toBeInstanceOf(MonkeyError);
  if (!(obj instanceof MonkeyError)) return;
  expect(obj.message).toBe(expected);
}

function testStringObject(obj: MonkeyObject, expected: string): void {
  expect(obj).toBeInstanceOf(MonkeyString);
  if (!(obj instanceof MonkeyString)) return;
  expect(obj.value).toBe(expected);
}

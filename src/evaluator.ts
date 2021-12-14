import {
  IntegerLiteral,
  Node,
  Program,
  Statement,
  ExpressionStatement,
  BooleanLiteral,
  PrefixExpression,
  InfixExpression,
  BlockStatement,
  IfExpression,
  ReturnStatement,
  LetStatement,
  Identifier,
  FunctionLiteral,
  CallExpression,
  Expression,
  StringLiteral,
} from './ast';
import {Environment} from './environment';
import {
  MonkeyBoolean,
  MonkeyError,
  MonkeyFunction,
  MonkeyInteger,
  MonkeyNull,
  MonkeyObject,
  MonkeyReturnValue,
  MonkeyString,
} from './object';

export const TRUE = new MonkeyBoolean(true);
export const FALSE = new MonkeyBoolean(false);
export const NULL = new MonkeyNull();

function monkeyEval(node: Node, env: Environment): MonkeyObject {
  if (node instanceof Program) {
    return evalProgram(node.statements, env);
  }
  if (node instanceof ExpressionStatement) {
    return monkeyEval(node.expression, env);
  }
  if (node instanceof PrefixExpression) {
    const right = monkeyEval(node.right, env);
    if (isMonkeyError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = monkeyEval(node.left, env);
    if (isMonkeyError(left)) {
      return left;
    }
    const right = monkeyEval(node.right, env);
    if (isMonkeyError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node.statements, env);
  }
  if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  }
  if (node instanceof ReturnStatement) {
    const value = monkeyEval(node.returnValue, env);
    if (isMonkeyError(value)) {
      return value;
    }
    return new MonkeyReturnValue(value);
  }
  if (node instanceof LetStatement) {
    const value = monkeyEval(node.value, env);
    if (isMonkeyError(value)) {
      return value;
    }
    env.set(node.name.value, value);
  }
  if (node instanceof StringLiteral) {
    return new MonkeyString(node.value);
  }
  if (node instanceof FunctionLiteral) {
    const params = node.parameters;
    const body = node.body;
    return new MonkeyFunction(params, body, env);
  }
  if (node instanceof CallExpression) {
    const func = monkeyEval(node.func, env);
    if (isMonkeyError(func)) {
      return func;
    }
    const args = evalExpressions(node.args, env);
    if (args.some(isMonkeyError)) {
      return args.find(isMonkeyError)!;
    }
    return applyFunction(func, args);
  }
  if (node instanceof Identifier) {
    return evalIdentifier(node, env);
  }
  if (node instanceof IntegerLiteral) {
    return new MonkeyInteger(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return nativeBooleanToMonkeyBoolean(node.value);
  }
  return NULL;
}

function applyFunction(func: MonkeyObject, args: MonkeyObject[]): MonkeyObject {
  if (!(func instanceof MonkeyFunction)) {
    return new MonkeyError(`not a function: ${func.type()}`);
  }
  const extendedEnv = extendFunctionEnv(func, args);
  const evaluated = monkeyEval(func.body, extendedEnv);
  return unwrapReturnValue(evaluated);
}

function unwrapReturnValue(obj: MonkeyObject): MonkeyObject {
  if (obj instanceof MonkeyReturnValue) {
    return obj.value;
  }
  return obj;
}

function extendFunctionEnv(
  func: MonkeyFunction,
  args: MonkeyObject[]
): Environment {
  const env = new Environment(func.env);
  for (let i = 0; i < func.parameters.length; i++) {
    env.set(func.parameters[i].value, args[i]);
  }
  return env;
}

function evalExpressions(
  expressions: Expression[],
  env: Environment
): MonkeyObject[] {
  return expressions.map(expression => monkeyEval(expression, env));
}

function evalIdentifier(node: Identifier, env: Environment): MonkeyObject {
  const val = env.get(node.value);
  if (val) {
    return val;
  }
  return new MonkeyError(`identifier not found: ${node.value}`);
}

function evalProgram(statements: Statement[], env: Environment): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const statement of statements) {
    result = monkeyEval(statement, env);

    if (result instanceof MonkeyReturnValue) {
      return result.value;
    }
    if (result instanceof MonkeyError) {
      return result;
    }
  }
  return result;
}

function evalBlockStatement(
  statements: Statement[],
  env: Environment
): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const statement of statements) {
    result = monkeyEval(statement, env);

    if (result instanceof MonkeyReturnValue || result instanceof MonkeyError) {
      return result; // result.value로 unwrap하지 않고 MonkeyReturnValue를 반환한다.
    }
  }
  return result;
}

function evalIfExpression(node: IfExpression, env: Environment): MonkeyObject {
  const condition = monkeyEval(node.condition, env);
  if (isMonkeyError(condition)) {
    return condition;
  }
  if (isTruthy(condition)) {
    return monkeyEval(node.consequence, env);
  } else if (node.alternative) {
    return monkeyEval(node.alternative, env);
  }
  return NULL;
}

function nativeBooleanToMonkeyBoolean(input: boolean): MonkeyBoolean {
  if (input) {
    return TRUE;
  } else {
    return FALSE;
  }
}

function evalPrefixExpression(
  operator: string,
  right: MonkeyObject
): MonkeyObject {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
    default:
      return new MonkeyError(`unknown operator: ${operator}${right.type()}`);
  }
}

function evalBangOperatorExpression(right: MonkeyObject): MonkeyObject {
  if (right === TRUE) {
    return FALSE;
  }
  if (right === FALSE) {
    return TRUE;
  }
  if (right === NULL) {
    return TRUE;
  }
  return FALSE;
}

function evalMinusPrefixOperatorExpression(right: MonkeyObject): MonkeyObject {
  if (right instanceof MonkeyInteger) {
    return new MonkeyInteger(-right.value);
  }
  return new MonkeyError(`unknown operator: -${right.type()}`);
}

function evalInfixExpression(
  operator: string,
  left: MonkeyObject,
  right: MonkeyObject
): MonkeyObject {
  if (left instanceof MonkeyInteger && right instanceof MonkeyInteger) {
    return evalIntegerInfixExpression(operator, left, right);
  }
  if (operator === '==') {
    return nativeBooleanToMonkeyBoolean(left === right);
  }
  if (operator === '!=') {
    return nativeBooleanToMonkeyBoolean(left !== right);
  }
  if (left.type() !== right.type()) {
    return new MonkeyError(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  }
  if (left instanceof MonkeyString && right instanceof MonkeyString) {
    return evalStringInfixExpression(operator, left, right);
  }
  return new MonkeyError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  );
}

function evalStringInfixExpression(
  operator: string,
  left: MonkeyString,
  right: MonkeyString
): MonkeyObject {
  if (operator === '+') {
    return new MonkeyString(left.value + right.value);
  }
  return new MonkeyError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  );
}

function evalIntegerInfixExpression(
  operator: string,
  left: MonkeyInteger,
  right: MonkeyInteger
): MonkeyObject {
  switch (operator) {
    case '+':
      return new MonkeyInteger(left.value + right.value);
    case '-':
      return new MonkeyInteger(left.value - right.value);
    case '*':
      return new MonkeyInteger(left.value * right.value);
    case '/':
      return new MonkeyInteger(left.value / right.value);
    case '<':
      return nativeBooleanToMonkeyBoolean(left.value < right.value);
    case '>':
      return nativeBooleanToMonkeyBoolean(left.value > right.value);
    case '==':
      return nativeBooleanToMonkeyBoolean(left.value === right.value);
    case '!=':
      return nativeBooleanToMonkeyBoolean(left.value !== right.value);
    default:
      return new MonkeyError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      );
  }
}

/** false, null이 아니면 참이다. */
function isTruthy(obj: MonkeyObject): boolean {
  if (obj === NULL) {
    return false;
  }
  if (obj === FALSE) {
    return false;
  }
  return true;
}

function isMonkeyError(obj: MonkeyObject): obj is MonkeyError {
  return obj instanceof MonkeyError;
}

export {monkeyEval};

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
} from './ast';
import {
  MonkeyBoolean,
  MonkeyError,
  MonkeyInteger,
  MonkeyNull,
  MonkeyObject,
  MonkeyReturnValue,
} from './object';

export const TRUE = new MonkeyBoolean(true);
export const FALSE = new MonkeyBoolean(false);
export const NULL = new MonkeyNull();

function monkeyEval(node: Node): MonkeyObject {
  if (node instanceof Program) {
    return evalProgram(node.statements);
  }
  if (node instanceof ExpressionStatement) {
    return monkeyEval(node.expression);
  }
  if (node instanceof PrefixExpression) {
    const right = monkeyEval(node.right);
    if (isMonkeyError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = monkeyEval(node.left);
    if (isMonkeyError(left)) {
      return left;
    }
    const right = monkeyEval(node.right);
    if (isMonkeyError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node.statements);
  }
  if (node instanceof IfExpression) {
    return evalIfExpression(node);
  }
  if (node instanceof ReturnStatement) {
    const value = monkeyEval(node.returnValue);
    if (isMonkeyError(value)) {
      return value;
    }
    return new MonkeyReturnValue(value);
  }
  if (node instanceof IntegerLiteral) {
    return new MonkeyInteger(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return nativeBooleanToMonkeyBoolean(node.value);
  }
  return NULL;
}

function evalProgram(statements: Statement[]): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const statement of statements) {
    result = monkeyEval(statement);

    if (result instanceof MonkeyReturnValue) {
      return result.value;
    }
    if (result instanceof MonkeyError) {
      return result;
    }
  }
  return result;
}

function evalBlockStatement(statements: Statement[]): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const statement of statements) {
    result = monkeyEval(statement);

    if (result instanceof MonkeyReturnValue || result instanceof MonkeyError) {
      return result; // result.value로 unwrap하지 않고 MonkeyReturnValue를 반환한다.
    }
  }
  return result;
}

function evalIfExpression(node: IfExpression): MonkeyObject {
  const condition = monkeyEval(node.condition);
  if (isMonkeyError(condition)) {
    return condition;
  }
  if (isTruthy(condition)) {
    return monkeyEval(node.consequence);
  } else if (node.alternative) {
    return monkeyEval(node.alternative);
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

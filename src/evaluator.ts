import {
  IntegerLiteral,
  Node,
  Program,
  Statement,
  ExpressionStatement,
  BooleanLiteral,
  PrefixExpression,
  InfixExpression,
} from './ast';
import {MonkeyBoolean, MonkeyInteger, MonkeyNull, MonkeyObject} from './object';

const TRUE = new MonkeyBoolean(true);
const FALSE = new MonkeyBoolean(false);
const NULL = new MonkeyNull();

function monkeyEval(node: Node): MonkeyObject {
  if (node instanceof Program) {
    return evalStatements(node.statements);
  }
  if (node instanceof ExpressionStatement) {
    return monkeyEval(node.expression);
  }
  if (node instanceof PrefixExpression) {
    const right = monkeyEval(node.right);
    return evalPrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = monkeyEval(node.left);
    const right = monkeyEval(node.right);
    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof IntegerLiteral) {
    return new MonkeyInteger(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return nativeBooleanToMonkeyBoolean(node.value);
  }
  return NULL;
}

function evalStatements(statements: Statement[]): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const statement of statements) {
    result = monkeyEval(statement);
  }
  return result;
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
      return NULL;
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
  return NULL;
}

function evalInfixExpression(
  operator: string,
  left: MonkeyObject,
  right: MonkeyObject
): MonkeyObject {
  if (left instanceof MonkeyInteger && right instanceof MonkeyInteger) {
    return evalIntegerInfixExpression(operator, left, right);
  }
  return NULL;
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
      return NULL;
  }
}

export {monkeyEval};

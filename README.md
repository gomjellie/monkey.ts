# `monkey`

monkey는 typescript로 작성된 node.js런타임 환경에서 실행되는 인터프리터 언어입니다.

[Writing an INTERPRETER in go](https://edu.anarcho-copy.org/Programming%20Languages/Go/writing%20an%20INTERPRETER%20in%20go.pdf)에서 소개된 간단한 장난감 언어를 Typescript로 구현하였습니다.

# EBNF Grammar

```bnf

literal: <boolean_literal> | <integer_literal> | <identifier>

boolean_literal: true | false

integer_literal: [0-9]+

string_literal: "([a-zA-Z_])*"

function_literal:
  fn <parameters> <blockstatement>

parameters:
  ( <parameter one>, <parameter two>, <parameter three>, ... )

identifier: [a-zA-Z_]+

expression:
  <literal> | <identifier> |
  <infix_expression> |
  <prefix_expression> |

prefix_expression: <prefix_operator><expression>

prefix_operator: + | - | !

infix_expression: <expression> <infix_operator> <expression>

statement: <expression>; <if_statement> | <let_statement>

if_statement:
  if (<condition>) <consequence> else <alternative> |
  if (<condition>) <consequence>

let_statement:
  let <identifier> = <expression>

...

```

# 표현식(expression) vs 명령문(statement)

명령문은 값을 생성하지 않는반면 표현식은 값을 생성해냅니다.

let a = fn(x) { x + 5 }; 은 명령문입니다.

a(10); 은 표현식입니다.

monkey언어에서 let 문과 return 문을 제외하면 모두 표현식입니다.

# 표현식 문법

## 전위 연산자가 포함된 표현식을 쓸 수 있습니다.

```js
-5;
!true;
```

## 이항 연산자(binary operator)가 가능합니다.

```js
5 + 5;
5 - 5;
5 / 5;
5 * 5;
```

## 비교 연산이 가능합니다.

```js
5 * (5 + 5)((5 + 5) * 5) * 5;
```

## 함수 호출, 식별자(identifier)는 표현식으로 취급합니다.

```js
add(2, 3);
add(add(2, 3), add(5, 10));
max(5, add(5, 5 * 5));

(foo * bar) / foobar;
add(foo, bar);
```

함수는 일급 시민입니다. 따라서 함수 리터럴 역시 표현식입니다.

## if 표현식

Monkey 언어에는 if 표현식이 이라는 특이한 문법이 있습니다.

```js
let result = if (10 > 5) { true } else { false };
result // => true
```

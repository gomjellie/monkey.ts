import {TokenType} from './lexer';

type Keywords = 'fn' | 'let' | 'if' | 'else' | 'return' | 'true' | 'false';

const keywords: {[key in Keywords]: TokenType} = {
  fn: 'FUNCTION',
  let: 'LET',
  if: 'IF',
  else: 'ELSE',
  return: 'RETURN',
  true: 'TRUE',
  false: 'FALSE',
};

function isKeywords(key: string): key is Keywords {
  if (Object.keys(keywords).includes(key)) {
    return true;
  }
  return false;
}

const lookupIdentifier = (identifier: string): TokenType => {
  if (isKeywords(identifier)) {
    return keywords[identifier];
  }
  return 'IDENT';
};

export {lookupIdentifier};

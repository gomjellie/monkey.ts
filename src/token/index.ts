import {TokenType} from '../lexer';

type Keywords = 'fn' | 'let';

const keywords: {[key in Keywords]: TokenType} = {
  fn: 'FUNCTION',
  let: 'LET',
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

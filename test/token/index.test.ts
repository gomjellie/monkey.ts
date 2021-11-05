import {Token} from '../../src/token';

test('asdf', () => {
  const t: Token = {type: '(', value: '('};
  expect(t.type).toBe('(');
});

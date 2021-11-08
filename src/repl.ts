import {Lexer} from './lexer';

const PROMPT = '> ';

const init = (stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream) => {
  stdin.setEncoding('utf8');
  stdin.on('data', (data: string) => {
    stdout.write(PROMPT);
    const line = data.trim();
    const l = new Lexer(line);

    for (
      let token = l.nextToken();
      token.type !== 'EOF';
      token = l.nextToken()
    ) {
      console.log(token);
    }
  });
};

export {init};

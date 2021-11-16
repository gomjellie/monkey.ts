import {STATUS_CODES} from 'http';
import {Lexer} from './lexer';
import {Parser} from './parser';

const PROMPT = '> ';
const MONKEY_FACE = String.raw`
            __,__
   .--.  .-"     "-.  .--.
  / .. \/  .-. .-.  \/ .. \
 | |  '|  /   Y   \  |'  | |
 | \   \  \ 0 | 0 /  /   / |
  \ '- ,\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \._   _./  |
       \   \ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

const init = (stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream) => {
  stdout.write(PROMPT);
  stdin.setEncoding('utf8');
  stdin.on('data', (data: string) => {
    const line = data.trim();
    const l = new Lexer(line);
    const p = new Parser(l);
    const program = p.parseProgram();

    if (!program) {
      stdout.write('Parse error\n');
      return;
    }

    if (p.errors.length > 0) {
      printParseErrors(stdout, p.errors);
    }

    stdout.write(program.toString());
    stdout.write('\n');
    stdout.write(PROMPT);
  });
};

function printParseErrors(stdout: NodeJS.WriteStream, errors: string[]) {
  stdout.write(MONKEY_FACE);
  stdout.write('Woops! We ran into some monkey business here!\n');
  stdout.write('parser errors:\n');
  stdout.write(`${errors.join('\n')}`);
}

export {init};

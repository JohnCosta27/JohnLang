import { InputStreamType } from 'InputStream';

const PuncArray = ['(', ')', '{', '}'] as const;
type Punc = typeof PuncArray[number];

export type Num = number;
export type Str = string;

const KeywordArray = ['if', 'then', 'lambda', 'true', 'false'] as const;
type Keyword = typeof KeywordArray[number];

export type Var = string;

const OpArray = [
  '*',
  '+',
  '-',
  '/',
  '=',
  '==',
  '>',
  '<',
  '!=',
  '&',
  '|',
  '!',
  '%',
] as const;
type Op = OpArray[number];

type Predicate = (arg0: string) => boolean;

type Token =
  | {
      type: 'punc';
      value: Punc;
    }
  | {
      type: 'num';
      value: number;
    }
  | {
      type: 'str' | 'var';
      value: string;
    }
  | {
      type: 'keyword';
      value: Keyword;
    }
  | {
      type: 'op';
      value: Op;
    }
  | null;

export interface TokenStreamType {
  readNext: () => Token;
}

export function TokenStream(input: InputStreamType): TokenStreamType {
  let current = null;

  const isKeyword = (x: string): boolean => KeywordArray.includes(x as Keyword);

  const isDigit = (ch: string): boolean => /[0-9]/i.test(ch);

  const isIdStart = (ch: string): boolean => /[A-Z_]/i.test(ch);

  const isId = (ch: string): boolean => isIdStart(ch) || /[a-z]/i.test(ch);

  const isOpChar = (ch: string): boolean => OpArray.includes(ch as Op);

  const isPunc = (ch: string): boolean => PuncArray.includes(ch as Punc);

  const isWhitespace = (ch: string): boolean => ' \t\n'.indexOf(ch) >= 0;

  const readWhile = (predicate: Predicate): string => {
    let str = '';
    while (!input.eof() && predicate(input.peek())) str += input.next();
    return str;
  };

  const readNumber = (): Token => {
    let hasDot = false;
    const number = readWhile((ch: string): boolean => {
      if (ch === '.') {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return isDigit(ch);
    });
    return { type: 'num', value: parseFloat(number) };
  };

  const readIdent = (): Token => {
    const id = readWhile(isId);
    if (isKeyword(id)) {
      return {
        type: 'keyword',
        value: id as Keyword,
      };
    }
    return {
      type: 'var',
      value: id,
    };
  };

  const readEscaped = (end: string) => {
    let escaped = false;
    let str = '';

    input.next();
    while (!input.eof()) {
      const ch = input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  };

  const readString = (): Token => ({ type: 'str', value: readEscaped('"') });

  const skipComment = () => {
    readWhile((ch: string) => ch !== '\n');
    input.next();
  };

  const readNext = (): Token => {
    readWhile(isWhitespace);
    if (input.eof()) return null;
    const ch = input.peek();
    if (ch === '#') {
      skipComment();
      return readNext();
    }
    if (ch === '"') return readString();
    if (isDigit(ch)) return readNumber();
    if (isIdStart(ch)) return readIdent();

    if (isPunc(ch)) {
      return {
        type: 'punc',
        value: input.next() as Punc,
      };
    }

    if (isOpChar(ch)) {
      return {
        type: 'op',
        value: readWhile(isOpChar) as Op,
      };
    }
    input.croak(`Can't handle character: ${ch}`);
    return null;
  };

  const peek = (): string => {
    if (current === null) {
      current = readNext();
    }
    return current;
  };

  const next = (): string => {
    const tok = current;
    current = null;
    return tok || readNext();
  };

  const eof = (): boolean => peek() === null;

  return { readNext };
}

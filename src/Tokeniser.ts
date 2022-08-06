import { InputSteam } from "./InputStream";

const PuncArray = ['(', ')', '{', '}'];
type PuncTuple = typeof PuncArray;
export type Punc = PuncTuple[number];

export type Num = number;
export type Str = string;

const KeywordArray = ['if', 'then', 'lambda', 'true', 'false'] as const;
type KeywordTuple = typeof KeywordArray;
export type Keyword = KeywordTuple[number];

export type Var = string;
export type Op = '!=' | '==' | '=';

type Predicate = (arg0: string) => boolean;

type TokenTypes = 'punc' | 'num' | 'str' | 'keyword' | 'var' | 'op';
type TokenTypes = {
  'punc': string;
  'num': number;
  'str': string;
}

function TokenStream(input: InputSteam) {
  var current = null;
  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: input.croak,
  };
  function is_keyword(x: strin): boolean {
    return KeywordArray.includes(x as Keyword);
  }
  function is_digit(ch: string): boolean {
    return /[0-9]/i.test(ch);
  }
  function is_id_start(ch: string): boolean {
    return /[a-zλ_]/i.test(ch);
  }
  function is_id(ch: string): boolean {
    return is_id_start(ch) || '?!-<>=0123456789'.indexOf(ch) >= 0;
  }
  function is_op_char(ch: string): boolean {
    return '+-*/%=&|<>!'.indexOf(ch) >= 0;
  }
  function is_punc(ch: string): boolean {
    return ',;(){}[]'.indexOf(ch) >= 0;
  }
  function is_whitespace(ch: string): boolean {
    return ' \t\n'.indexOf(ch) >= 0;
  }
  function read_while(predicate: Predicate) {
    var str = '';
    while (!input.eof() && predicate(input.peek())) str += input.next();
    return str;
  }
  function read_number() {
    var has_dot = false;
    var number = read_while((ch: string): boolean => {
      if (ch == '.') {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return is_digit(ch);
    });
    return { type: 'num', value: parseFloat(number) };
  }
  function read_ident() {
    var id = read_while(is_id);
    return {
      type: is_keyword(id) ? 'kw' : 'var',
      value: id,
    };
  }
  function read_escaped(end) {
    var escaped = false,
      str = '';
    input.next();
    while (!input.eof()) {
      var ch = input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch == '\\') {
        escaped = true;
      } else if (ch == end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }
  function read_string() {
    return { type: 'str', value: read_escaped('"') };
  }
  function skip_comment() {
    read_while(function (ch) {
      return ch != '\n';
    });
    input.next();
  }
  function read_next() {
    read_while(is_whitespace);
    if (input.eof()) return null;
    var ch = input.peek();
    if (ch == '#') {
      skip_comment();
      return read_next();
    }
    if (ch == '"') return read_string();
    if (is_digit(ch)) return read_number();
    if (is_id_start(ch)) return read_ident();
    if (is_punc(ch))
      return {
        type: 'punc',
        value: input.next(),
      };
    if (is_op_char(ch))
      return {
        type: 'op',
        value: read_while(is_op_char),
      };
    input.croak("Can't handle character: " + ch);
  }
  function peek() {
    return current || (current = read_next());
  }
  function next() {
    var tok = current;
    current = null;
    return tok || read_next();
  }
  function eof() {
    return peek() == null;
  }
}

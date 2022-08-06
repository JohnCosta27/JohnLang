export interface InputSteam {
  next: () => string;
  peek: () => string;
  eof: () => boolean;
  croak: (arg0: string) => void;
}

export function InputStream(input: string): InputSteam {
    var pos = 0, line = 1, col = 0;
    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: croak,
    };
    function next() {
        var ch = input.charAt(pos++);
        if (ch == "\n") line++, col = 0; else col++;
        return ch;
    }
    function peek() {
        return input.charAt(pos);
    }
    function eof() {
        return peek() == "";
    }
    function croak(msg: string) {
        throw new Error(msg + " (" + line + ":" + col + ")");
    }
}

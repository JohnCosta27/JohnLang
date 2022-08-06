export interface InputStreamType {
  next: () => string;
  peek: () => string;
  eof: () => boolean;
  croak: (arg0: string) => void;
}

const InputStream = (input: string): InputStreamType => {
  let pos = 0;
  let line = 1;
  let col = 0;

  const next = (): string => {
    const ch = input.charAt(pos++);
    if (ch === '\n') {
      line++;
      col = 0;
    } else col++;
    return ch;
  };

  const peek = (): string => input.charAt(pos);
  const eof = (): boolean => peek() === '';

  const croak = (msg: string) => {
    throw new Error(`${msg} (${line}: ${col})`);
  };

  return {
    next,
    peek,
    eof,
    croak,
  };
};
export default InputStream;

import InputStream, { InputStreamType } from 'InputStream';
import { TokenStream, TokenStreamType } from 'Tokeniser';

const Example = `
  Variable = 5
  AnotherVariable = 5 + 10 / 3
`;
const myStream: InputStreamType = InputStream(Example);
const myTokeniser: TokenStreamType = TokenStream(myStream);

for (
  let next = myTokeniser.readNext();
  next !== null;
  next = myTokeniser.readNext()
) {
  console.log(next);
}

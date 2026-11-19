// Chinese text helper: interpolate a name into zh copy with the usual CJK typography.
// A space goes between Latin/digit and CJK at a boundary, none between CJK and CJK.
// Use as a tag: zhText`在${name}之外传播`.
const CJK = /[⺀-鿿豈-﫿＀-￯　-〿]/u;
const WORD = /[A-Za-z0-9]/;
const isCjk = (c) => c !== undefined && c !== '' && CJK.test(c);
const isWord = (c) => c !== undefined && c !== '' && WORD.test(c);
const needsSpace = (a, b) => (isCjk(a) && isWord(b)) || (isWord(a) && isCjk(b));

export function zhText(strings, ...vals) {
  let out = strings[0];
  vals.forEach((v, i) => {
    const s = String(v ?? '');
    if (s) {
      if (needsSpace(out.slice(-1), s[0])) out += ' ';
      out += s;
    }
    const next = strings[i + 1];
    if (s && needsSpace(out.slice(-1), next[0])) out += ' ';
    out += next;
  });
  return out;
}

// Preloaded (node --import) into embed-latin.mjs by tests/embed-latin.spec.mjs: every fetch() goes to the
// local test server instead of the network. The original host is sent in x-orig-host so that the test can
// assert that only jsDelivr hosts were asked for; any other host is a hard error.
const ALLOWED = new Set(['cdn.jsdelivr.net', 'fastly.jsdelivr.net']);
const base = process.env.SC_TEST_LATIN_BASE;
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init = {}) => {
  const u = new URL(typeof input === 'string' ? input : input.url ?? String(input));
  if (!ALLOWED.has(u.hostname)) throw new Error(`UNEXPECTED HOST ${u.hostname}`);
  const target = `${base}/${u.hostname === 'cdn.jsdelivr.net' ? 'cdn' : 'fastly'}${u.pathname}`;
  return realFetch(target, { ...init, headers: { ...(init.headers ?? {}), 'x-orig-host': u.hostname } });
};

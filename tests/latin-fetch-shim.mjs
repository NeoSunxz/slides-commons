// Preloaded (node --import) into embed-latin.mjs by tests/embed-latin.spec.mjs: every fetch() goes to the
// local test server instead of the network. The original host is sent in x-orig-host so that the test can
// assert which hosts were asked for. Allowed: the jsDelivr hosts, and the fake "site" hosts listed in
// SC_TEST_SITE_HOSTS (comma separated; they map to /site<pathname> on the test server). Any other host is
// a hard error.
const ALLOWED = new Set(['cdn.jsdelivr.net', 'fastly.jsdelivr.net']);
const SITE_HOSTS = new Set((process.env.SC_TEST_SITE_HOSTS ?? '').split(',').filter(Boolean));
const base = process.env.SC_TEST_LATIN_BASE;
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init = {}) => {
  const u = new URL(typeof input === 'string' ? input : input.url ?? String(input));
  if (!ALLOWED.has(u.hostname) && !SITE_HOSTS.has(u.host)) throw new Error(`UNEXPECTED HOST ${u.host}`);
  const prefix = SITE_HOSTS.has(u.host) ? 'site' : u.hostname === 'cdn.jsdelivr.net' ? 'cdn' : 'fastly';
  const target = `${base}/${prefix}${u.pathname}`;
  return realFetch(target, { ...init, headers: { ...(init.headers ?? {}), 'x-orig-host': u.host } });
};

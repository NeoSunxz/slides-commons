/* slides-commons gallery filters: search, source, scheme and mood.
 * State lives in the URL hash (#q=…&scheme=dark&mood=warm,bold&source=id) so a filtered
 * view can be linked; it works from file:// too. Without JS every card stays visible. */
(function () {
  'use strict';
  var panel = document.getElementById('filters');
  var grid = document.getElementById('grid');
  if (!panel || !grid) return;
  panel.hidden = false;

  var input = document.getElementById('q');
  var countEl = document.getElementById('fcount');
  var clearBtn = document.getElementById('fclear');
  var noneEl = document.getElementById('fnone');
  var cards = Array.prototype.slice.call(grid.children);
  var chips = Array.prototype.slice.call(panel.querySelectorAll('button.chip'));
  var GROUPS = ['source', 'scheme', 'mood'];

  function emptyState() { return { q: '', source: [], scheme: [], mood: [] }; }

  function parseHash() {
    var st = emptyState();
    var h = location.hash.replace(/^#/, '');
    if (!h) return st;
    var params;
    try { params = new URLSearchParams(h); } catch (e) { return st; }
    st.q = params.get('q') || '';
    GROUPS.forEach(function (g) {
      var v = params.get(g);
      st[g] = v ? v.split(',').filter(Boolean) : [];
    });
    return st;
  }

  function toHash(st) {
    var params = new URLSearchParams();
    if (st.q) params.set('q', st.q);
    GROUPS.forEach(function (g) { if (st[g].length) params.set(g, st[g].join(',')); });
    var s = params.toString().replace(/%2C/gi, ',');
    return s ? '#' + s : '';
  }

  // Within a group any selected value matches (OR); the groups and the text combine with AND.
  function matches(card, st, tokens) {
    if (st.source.length && st.source.indexOf(card.getAttribute('data-source')) < 0) return false;
    if (st.scheme.length && st.scheme.indexOf(card.getAttribute('data-scheme')) < 0) return false;
    if (st.mood.length) {
      var moods = card.getAttribute('data-mood').split('|');
      if (!st.mood.some(function (m) { return moods.indexOf(m) >= 0; })) return false;
    }
    var hay = card.getAttribute('data-search');
    for (var i = 0; i < tokens.length; i++) if (hay.indexOf(tokens[i]) < 0) return false;
    return true;
  }

  var state = parseHash();

  function render() {
    var tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var ok = matches(c, state, tokens);
      c.hidden = !ok;
      if (ok) shown++;
    });
    chips.forEach(function (b) {
      var on = state[b.getAttribute('data-group')].indexOf(b.getAttribute('data-value')) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (input.value !== state.q) input.value = state.q;
    var total = Number(countEl.getAttribute('data-total'));
    countEl.textContent = countEl.getAttribute('data-template').replace('{n}', shown).replace('{total}', total);
    var active = Boolean(state.q || state.source.length || state.scheme.length || state.mood.length);
    clearBtn.hidden = !active;
    noneEl.hidden = shown !== 0;
    // A chip hidden inside a closed "more" list must not hide an active filter.
    var more = panel.querySelector('details.more');
    if (more && state.mood.some(function (m) { return !!more.querySelector('[data-value="' + m + '"]'); })) more.open = true;
    // Keep the language switcher on the same filtered view.
    var h = toHash(state);
    Array.prototype.forEach.call(document.querySelectorAll('a[data-lang-switch]'), function (a) {
      a.setAttribute('href', a.getAttribute('href').replace(/#.*$/, '') + h);
    });
  }

  function writeHash() {
    var h = toHash(state);
    if (h === location.hash || (!h && !location.hash)) return;
    try { history.replaceState(null, '', location.pathname + location.search + h); }
    catch (e) { location.hash = h; }
  }

  function update() { render(); writeHash(); }

  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.getAttribute('data-group');
      var v = b.getAttribute('data-value');
      var i = state[g].indexOf(v);
      if (i >= 0) state[g].splice(i, 1); else state[g].push(v);
      update();
    });
  });
  input.addEventListener('input', function () { state.q = input.value.trim(); update(); });
  clearBtn.addEventListener('click', function () { state = emptyState(); update(); });
  window.addEventListener('hashchange', function () { state = parseHash(); render(); });

  render();
})();

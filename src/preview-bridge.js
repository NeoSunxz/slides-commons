/* slides-commons preview bridge.
 * Injected at build time into the copy of a template under site/preview/<slug>/
 * (never into upstream files). The detail page embeds that copy in an iframe with
 * sandbox="allow-scripts" (opaque origin), so it cannot reach into the document;
 * instead it posts {type:'slides-commons:nav', dir:'next'|'prev'} and this script
 * turns that into ArrowRight / ArrowLeft keydown events. It reports the current
 * position back as {type:'slides-commons:state', index, total} when it can tell. */
(function () {
  'use strict';
  if (window.parent === window) return;

  var KEYS = {
    next: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
    prev: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 }
  };

  function deck() { return document.querySelector('deck-stage'); }

  function makeKey(k) {
    var ev = new KeyboardEvent('keydown', {
      key: k.key, code: k.code, bubbles: true, cancelable: true, composed: true
    });
    // Older inline handlers read keyCode / which; KeyboardEventInit cannot set them everywhere.
    try {
      Object.defineProperty(ev, 'keyCode', { get: function () { return k.keyCode; } });
      Object.defineProperty(ev, 'which', { get: function () { return k.keyCode; } });
    } catch (e) { /* ignore */ }
    return ev;
  }

  function send(dir) {
    var k = KEYS[dir];
    if (!k) return;
    // Dispatch exactly once. An event dispatched on <deck-stage> (or <body>) bubbles
    // through document to window, so listeners on any of those fire. Dispatching on
    // several targets would move two slides.
    var target = deck() || document.body || document;
    target.dispatchEvent(makeKey(k));
  }

  // Activity detector: anything that shows a key press did something. A DOM class/style/
  // text change, a CSS transition or animation starting, or a scroll all count. (Animations
  // that were already running do not fire new events, so ambient decoration is ignored.)
  var activity = 0;      // any change at all: used to wait for the deck to be idle
  var motionAt = 0;      // a transition / animation / scroll started: async proof of a move
  var mo = null;
  function touch() { activity = performance.now(); }
  function motion() { activity = motionAt = performance.now(); }
  try {
    mo = new MutationObserver(touch);
    mo.observe(document, { subtree: true, attributes: true, characterData: true, attributeFilter: ['class', 'style', 'data-deck-active'] });
  } catch (e) { mo = null; }
  ['transitionrun', 'transitionstart', 'animationstart', 'scroll'].forEach(function (n) {
    document.addEventListener(n, motion, true);
  });
  // Mutations queued synchronously by the key handler (class / style changes). Called right
  // before and right after a key is sent, so only the handler's own effects are counted.
  function drain() {
    if (!mo) return 0;
    var n = mo.takeRecords().length;
    if (n) touch();
    return n;
  }

  // Requests are served one at a time, in order. What counts as "the key worked" depends
  // on how the position can be read:
  //
  //  * <deck-stage> and class-based decks (the position is an index that changes in the
  //    key handler): the key worked ONLY if the slide position actually changed. Nothing
  //    else is evidence. Other page activity is common while a deck is locked (staggered
  //    animation-delay children fire animationstart 0.3-0.8 s after a move, class changes
  //    from the previous move, counters), and counting it made an ignored key look
  //    accepted, which silently dropped the click. If the position has not changed, the
  //    key is sent again every RETRY_MS, for at most RETRY_MAX_MS (> the longest lock, a
  //    900 ms animation lock), and the request ends as soon as the position moves.
  //  * geometry decks (position inferred from where the slides are, so it lags the key by
  //    a whole transition or smooth scroll): the deck must first be idle for IDLE ms, then
  //    one key is sent; it worked if the position changed, the handler itself changed the
  //    DOM synchronously (checked with MutationObserver.takeRecords), or a transition /
  //    animation / scroll started in the following window. These decks have no key lock,
  //    so the key is not sent again unless none of that happened.
  //
  // Guarantee: a request never moves more than one slide. A key is only re-sent while the
  // position is still unchanged, so once the slide has moved nothing more is sent; a key
  // that is ignored for good (end of deck) stops after RETRY_MAX_MS (about 12 extra keys
  // at most) and is not sent again. A newer click is queued behind the current request.
  var IDLE = 250, WAIT_MAX = 1400, RETRY_MS = 250, RETRY_MAX_MS = 3000;
  var GEO_SETTLE = 280, GEO_TRIES = 7, MAX_QUEUE = 40;
  var queue = [];
  var busy = false;

  function navigate(dir) {
    if (queue.length >= MAX_QUEUE) return;
    queue.push(dir);
    if (!busy) { busy = true; next(); }
  }

  function next() {
    var dir = queue.shift();
    if (!dir) { busy = false; return; }
    var st = readState();
    if (!st || st.via !== 'geometry') return run(dir, st); // no idle wait: a locked deck just ignores the key
    var waited = 0;
    (function waitIdle() {
      if (performance.now() - activity >= IDLE || waited >= WAIT_MAX) return run(dir, st);
      waited += 60;
      setTimeout(waitIdle, 60);
    })();
  }

  function run(dir, st) {
    var start = readState() || st;
    var startKey = start ? start.index + '/' + start.total : '';
    var geometry = !!start && start.via === 'geometry';
    var moved = function () {
      var now = readState();
      return !!now && now.index + '/' + now.total !== startKey;
    };
    var begun = performance.now();
    var tries = 0;
    (function attempt() {
      drain();
      var sentAt = performance.now();
      send(dir);
      if (moved() || (geometry && drain() > 0)) { post(); return next(); } // handled synchronously
      setTimeout(function () {
        post();
        if (moved()) return next();
        if (geometry) {
          if (motionAt >= sentAt || ++tries >= GEO_TRIES) return next();
        } else if (performance.now() - begun >= RETRY_MAX_MS) {
          return next();
        }
        attempt(); // position unchanged: the key was ignored (locked deck) - send it again
      }, geometry ? GEO_SETTLE : RETRY_MS);
    })();
  }

  function visibleArea(el) {
    var r = el.getBoundingClientRect();
    var w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    var h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    return w * h;
  }

  function readState() {
    var d = deck();
    var slides, i;
    if (d) {
      slides = d.querySelectorAll(':scope > [data-deck-slide]');
      for (i = 0; i < slides.length; i++) {
        if (slides[i].hasAttribute('data-deck-active')) return { index: i, total: slides.length, via: 'deck-stage' };
      }
      if (slides.length) return null;
    }
    slides = document.querySelectorAll('.slide');
    if (!slides.length) slides = document.querySelectorAll('body > section, main > section, section');
    if (!slides.length) return null;
    // Exactly one slide carrying an "active" class marks the current one.
    var marked = -1, markedCount = 0;
    for (i = 0; i < slides.length; i++) {
      var c = slides[i].classList;
      if (c.contains('active') || c.contains('current') || c.contains('is-active') ||
          slides[i].getAttribute('aria-current') === 'true') {
        marked = i; markedCount++;
      }
    }
    if (markedCount === 1) return { index: marked, total: slides.length, via: 'class' };
    // Scroll-based decks: pick the slide that covers most of the viewport.
    var best = -1, bestArea = 0;
    for (i = 0; i < slides.length; i++) {
      var a = visibleArea(slides[i]);
      if (a > bestArea) { bestArea = a; best = i; }
    }
    return best >= 0 ? { index: best, total: slides.length, via: 'geometry' } : null;
  }

  var last = '';
  function post(state) {
    state = state || readState();
    if (!state) return;
    var sig = state.index + '/' + state.total;
    if (sig === last) return;
    last = sig;
    try {
      window.parent.postMessage({ type: 'slides-commons:state', index: state.index, total: state.total, via: state.via || 'deck-stage' }, '*');
    } catch (e) { /* ignore */ }
  }

  function postSoon() {
    setTimeout(function () { post(); }, 60);
    setTimeout(function () { post(); }, 500);
    setTimeout(function () { post(); }, 1100); // smooth scrolling / long transitions
  }

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var m = e.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === 'slides-commons:nav') { navigate(m.dir); postSoon(); }
    else if (m.type === 'slides-commons:ping') { last = ''; post(); }
  });

  document.addEventListener('slidechange', function (e) {
    var d = e.detail;
    if (d && typeof d.index === 'number' && typeof d.total === 'number') post({ index: d.index, total: d.total, via: 'deck-stage' });
  });
  window.addEventListener('keydown', postSoon);
  window.addEventListener('click', postSoon);
  window.addEventListener('touchend', postSoon);
  var scrollTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { post(); }, 120);
  }, true);
  // Report as early as possible (the deck may have initialised before this script ran).
  post();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { post(); });
  if (document.readyState === 'complete') postSoon();
  else window.addEventListener('load', postSoon);
})();

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
    // Dispatch exactly once. An event dispatched on <deck-stage> bubbles through
    // document to window; one dispatched on document still reaches window
    // listeners. Dispatching on both would move two slides.
    var target = deck() || document;
    target.dispatchEvent(makeKey(k));
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
        if (slides[i].hasAttribute('data-deck-active')) return { index: i, total: slides.length };
      }
      if (slides.length) return null;
    }
    slides = document.querySelectorAll('.slide');
    if (!slides.length) return null;
    for (i = 0; i < slides.length; i++) {
      var c = slides[i].classList;
      if (c.contains('active') || c.contains('current') || c.contains('is-active') ||
          slides[i].getAttribute('aria-current') === 'true') {
        return { index: i, total: slides.length };
      }
    }
    // Scroll-based decks: pick the slide that covers most of the viewport.
    var best = -1, bestArea = 0;
    for (i = 0; i < slides.length; i++) {
      var a = visibleArea(slides[i]);
      if (a > bestArea) { bestArea = a; best = i; }
    }
    return best >= 0 ? { index: best, total: slides.length } : null;
  }

  var last = '';
  function post(state) {
    state = state || readState();
    if (!state) return;
    var sig = state.index + '/' + state.total;
    if (sig === last) return;
    last = sig;
    try {
      window.parent.postMessage({ type: 'slides-commons:state', index: state.index, total: state.total }, '*');
    } catch (e) { /* ignore */ }
  }

  function postSoon() {
    setTimeout(function () { post(); }, 60);
    setTimeout(function () { post(); }, 500);
  }

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var m = e.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === 'slides-commons:nav') { send(m.dir); postSoon(); }
    else if (m.type === 'slides-commons:ping') { last = ''; post(); }
  });

  document.addEventListener('slidechange', function (e) {
    var d = e.detail;
    if (d && typeof d.index === 'number' && typeof d.total === 'number') post({ index: d.index, total: d.total });
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

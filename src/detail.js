/* slides-commons detail page: preview paging + copy-prompt buttons. No dependencies. */
(function () {
  'use strict';

  // --- Preview paging -------------------------------------------------------
  // The iframe is sandboxed without allow-same-origin, so we talk to the bridge
  // script injected into the preview copy via postMessage (target origin '*',
  // because a sandboxed frame has an opaque origin) and check e.source instead.
  var frame = document.getElementById('preview');
  var counter = document.getElementById('counter');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');

  function nav(dir) {
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'slides-commons:nav', dir: dir }, '*');
  }

  if (frame) {
    prev.addEventListener('click', function () { nav('prev'); });
    next.addEventListener('click', function () { nav('next'); });

    // The preview may finish loading before this script runs, or its first report may be
    // sent before we listen, so ask for the position until the first answer arrives.
    var gotState = false;
    function ping() {
      try { frame.contentWindow.postMessage({ type: 'slides-commons:ping' }, '*'); } catch (e) { /* not ready */ }
    }

    window.addEventListener('message', function (e) {
      if (e.source !== frame.contentWindow) return;
      var m = e.data;
      if (!m || m.type !== 'slides-commons:state') return;
      if (typeof m.index !== 'number' || typeof m.total !== 'number') return;
      gotState = true;
      counter.textContent = (m.index + 1) + ' / ' + m.total;
      if (m.via) counter.setAttribute('data-via', m.via);
      // Slide count comes from the running deck, not from template.json metadata.
      var total = document.getElementById('slide-total');
      if (total) total.textContent = String(m.total);
      prev.disabled = m.index <= 0;
      next.disabled = m.index >= m.total - 1;
    });

    frame.addEventListener('load', ping);
    ping(); // right after the listener is attached
    var pings = 0;
    var pinger = setInterval(function () {
      if (gotState || ++pings > 40) { clearInterval(pinger); return; } // ~10 s
      ping();
    }, 250);

    // Arrow keys on the page itself (when focus is not in a form field / the frame).
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Same limits as the buttons: some decks wrap around at the ends, the page does not.
      if (e.key === 'ArrowRight') { if (!next.disabled) nav('next'); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { if (!prev.disabled) nav('prev'); e.preventDefault(); }
    });
  }

  // --- Scale the preview -----------------------------------------------------
  // The page inside the iframe always lays out at 1920x1080 (like the screenshots) and is
  // scaled to the frame, so viewport-fluid templates look the same at any frame size, in
  // fullscreen and on phones. Without JS the iframe simply fills the frame.
  var box = document.getElementById('preview-wrap');
  function fit() {
    if (!box || !frame) return;
    var w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    var k = Math.min(w / 1920, h / 1080);
    box.style.setProperty('--s', String(k));
    box.style.setProperty('--x', Math.max(0, (w - 1920 * k) / 2) + 'px');
    box.style.setProperty('--y', Math.max(0, (h - 1080 * k) / 2) + 'px');
  }
  if (box && frame) {
    box.classList.add('scaled');
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', fit);
    document.addEventListener('webkitfullscreenchange', fit);
  }

  // --- Fullscreen ------------------------------------------------------------
  // Fullscreen the frame's container (not the iframe, which would need allow="fullscreen").
  // The deck inside letterboxes itself. Esc exits (browser default).
  var wrap = document.getElementById('preview-wrap');
  var fsBtn = document.getElementById('fullscreen');
  if (wrap && fsBtn) {
    var request = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    var enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    var current = function () { return document.fullscreenElement || document.webkitFullscreenElement || null; };
    if (request && enabled) {
      fsBtn.hidden = false;
      fsBtn.addEventListener('click', function () {
        try {
          var p = request.call(wrap);
          if (p && p.catch) p.catch(function () { /* denied; stay inline */ });
        } catch (e) { /* ignore */ }
      });
      var onChange = function () {
        // Give the deck keyboard focus while fullscreen, so arrows / space / PageDown page it
        // directly; arrow keys on the parent page keep working too (handler above).
        if (current() === wrap && frame) { try { frame.focus(); } catch (e) { /* ignore */ } }
      };
      document.addEventListener('fullscreenchange', onChange);
      document.addEventListener('webkitfullscreenchange', onChange);
    }
  }

  // --- Copy prompt ------------------------------------------------------------
  var zhPage = /^zh/i.test(document.documentElement.lang);
  var MSG = zhPage
    ? { ok: '已复制提示词。', fail: '无法自动复制，请在下方手动选择复制。' }
    : { ok: 'Prompt copied.', fail: 'Could not copy automatically; select the text below.' };
  var status = document.querySelector('.copy-status');
  var statusTimer;

  function say(msg) {
    if (!status) return;
    status.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.textContent = ''; }, 4000);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy'));
      if (!src) return;
      copy(src.textContent).then(function (ok) {
        if (ok) {
          say(MSG.ok);
        } else {
          var d = src.closest('details');
          if (d) d.open = true;
          say(MSG.fail);
        }
      });
    });
  });
})();

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

    window.addEventListener('message', function (e) {
      if (e.source !== frame.contentWindow) return;
      var m = e.data;
      if (!m || m.type !== 'slides-commons:state') return;
      if (typeof m.index !== 'number' || typeof m.total !== 'number') return;
      counter.textContent = (m.index + 1) + ' / ' + m.total;
      // Slide count comes from the running deck, not from template.json metadata.
      var total = document.getElementById('slide-total');
      if (total) total.textContent = String(m.total);
      prev.disabled = m.index <= 0;
      next.disabled = m.index >= m.total - 1;
    });

    frame.addEventListener('load', function () {
      frame.contentWindow.postMessage({ type: 'slides-commons:ping' }, '*');
    });

    // Arrow keys on the page itself (when focus is not in a form field / the frame).
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowRight') { nav('next'); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { nav('prev'); e.preventDefault(); }
    });
  }

  // --- Copy prompt ------------------------------------------------------------
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
      var zh = btn.getAttribute('data-copy') === 'prompt-zh';
      copy(src.textContent).then(function (ok) {
        if (ok) {
          say(zh ? '已复制中文提示词。' : 'Prompt copied. 提示词已复制。');
        } else {
          var d = src.closest('details');
          if (d) d.open = true;
          say(zh ? '无法自动复制，请在下方手动选择复制。' : 'Could not copy automatically; select the text below. 请手动复制。');
        }
      });
    });
  });
})();

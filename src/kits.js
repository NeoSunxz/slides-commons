/* slides-commons Convert / Skills pages: copy buttons for the install commands. No dependencies. */
(function () {
  'use strict';
  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy-code]'), function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy-code'));
      if (!src) return;
      var text = src.textContent;
      var done = function (ok) {
        if (!ok) return;
        btn.textContent = btn.getAttribute('data-done') || label;
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = label; btn.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else {
        done(fallback(text));
      }
    });
  });

  // Header takes the colours of the hero band while it is under the header (same mechanism as home).
  var header = document.querySelector('.site-header');
  var bands = document.querySelectorAll('[data-header-theme]');
  if (header && bands.length && window.SCHeaderTheme) {
    var theme = window.SCHeaderTheme(header);
    var themes = [];
    var frame = 0;
    var render = function () {
      frame = 0;
      var active = -1;
      var h = header.offsetHeight / 2;
      for (var i = 0; i < bands.length; i++) {
        var r = bands[i].getBoundingClientRect();
        if (r.top <= header.offsetHeight + 1 && r.bottom > h) active = i;
      }
      theme.apply(themes, active);
    };
    var configure = function () { themes = theme.read(bands); theme.reset(); render(); };
    window.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(render); }, { passive: true });
    window.addEventListener('resize', configure);
    configure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(configure);
  }
})();

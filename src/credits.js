/* slides-commons Credits page: the header takes the hero colours while the hero is under it. No dependencies. */
(function () {
  'use strict';
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

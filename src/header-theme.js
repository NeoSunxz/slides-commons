/* Shared by home and the Convert / Skills pages: the sticky .site-header takes the colours of the
   band (chapter) under it. Usage: const t = SCHeaderTheme(header); t.read(elements) -> themes; t.apply(themes, index).
   index -1 restores the neutral page header. No dependencies. */
(function () {
  'use strict';
  window.SCHeaderTheme = function (header) {
    var current = null;
    var names = ['--bg', '--ink', '--muted', '--accent', '--line'];
    return {
      read: function (elements) {
        return Array.prototype.map.call(elements, function (el) {
          var style = getComputedStyle(el);
          return { '--bg': style.backgroundColor, '--ink': style.color, '--muted': style.color, '--accent': style.color, '--line': style.getPropertyValue('--line') };
        });
      },
      reset: function () { current = null; },
      apply: function (themes, index) {
        if (index === current) return;
        current = index;
        if (index < 0) {
          delete header.dataset.chapter;
          names.forEach(function (n) { header.style.removeProperty(n); });
          return;
        }
        header.dataset.chapter = String(index);
        for (var name in themes[index]) header.style.setProperty(name, themes[index][name]);
      }
    };
  };
})();

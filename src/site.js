/* slides-commons: small helpers loaded on every page. No dependencies. */
(function () {
  'use strict';

  // Remember an explicit language choice. Only the English home page reads it back
  // (inline script in its <head>); nothing redirects based on the browser language.
  var KEY = 'slides-commons:lang';
  var switches = document.querySelectorAll('a[data-lang-switch]');
  for (var k = 0; k < switches.length; k++) {
    switches[k].addEventListener('click', function (e) {
      try { localStorage.setItem(KEY, e.currentTarget.getAttribute('data-lang-switch')); } catch (err) { /* storage blocked */ }
    });
  }

  // Directory links work over http(s), where "t/<slug>/" serves index.html. Under
  // file:// they would open a folder listing, so point them at index.html instead.
  if (location.protocol !== 'file:') return;
  var links = document.querySelectorAll('a[href]');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href');
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(href)) continue; // absolute, root-relative or fragment
    var m = href.match(/^([^?#]*)(.*)$/);
    var p = m[1];
    if (p === '' || p === '.' || p === '..') p += (p ? '/' : './');
    if (/\/$/.test(p)) links[i].setAttribute('href', p + 'index.html' + m[2]);
  }
})();

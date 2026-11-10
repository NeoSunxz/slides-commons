/* slides-commons: make directory links work when the built site is opened from disk.
 * Over http(s) "t/<slug>/" serves index.html; under file:// it would open a folder
 * listing, so point relative directory links at their index.html instead. */
(function () {
  'use strict';
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

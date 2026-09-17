/* First-touch attribution — required day one (page order, 9/4 addition).
   Persists utm_* + gclid on first load for ~90 days; FIRST TOUCH WINS (never overwritten).
   Hydrates stored values into every survey POST and every Givebutter URL, even when the
   current URL carries none — so an ad-click visitor who returns organically still credits the ad.
   This is what the 10% attribution invoice runs on. */
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"];
  var STORE = "mjf_first_touch"; var DAYS = 90;

  function readCookie(n) { var m = document.cookie.match("(?:^|; )" + n + "=([^;]*)"); return m ? decodeURIComponent(m[1]) : null; }
  function writeCookie(n, v) { var d = new Date(Date.now() + DAYS * 864e5).toUTCString(); document.cookie = n + "=" + encodeURIComponent(v) + "; expires=" + d + "; path=/; SameSite=Lax"; }
  function load() {
    try { var s = localStorage.getItem(STORE); if (s) return JSON.parse(s); } catch (e) {}
    try { var c = readCookie(STORE); if (c) return JSON.parse(c); } catch (e) {}
    return null;
  }
  function save(o) {
    try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {}
    try { writeCookie(STORE, JSON.stringify(o)); } catch (e) {}
  }
  function fromUrl() {
    var q = new URLSearchParams(location.search), o = {}, any = false;
    KEYS.forEach(function (k) { var v = q.get(k); if (v) { o[k] = v; any = true; } });
    return any ? o : null;
  }

  var stored = load();
  var incoming = fromUrl();
  if (!stored && incoming) { incoming._ts = Date.now(); save(incoming); stored = incoming; }   // first touch wins

  var attr = {};
  KEYS.forEach(function (k) { if (stored && stored[k]) attr[k] = stored[k]; });

  // hydrate every Givebutter link + any [data-attr] link with the stored params
  function decorate() {
    document.querySelectorAll('a[href*="givebutter.com"], a[data-attr]').forEach(function (a) {
      try {
        var u = new URL(a.getAttribute("href"), location.origin);
        Object.keys(attr).forEach(function (k) { if (!u.searchParams.get(k)) u.searchParams.set(k, attr[k]); });
        a.setAttribute("href", u.toString());
      } catch (e) {}
    });
  }
  document.addEventListener("DOMContentLoaded", decorate);

  window.MJF = window.MJF || {};
  window.MJF.attribution = attr;      // survey.js merges this into the POST
  window.MJF.decorateLinks = decorate;
})();

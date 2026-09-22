/* Google Ads conversion tracking — MJF Ads account 992-387-0115, Google tag AW-16468529105.
   Every conversion fires twice on purpose: the gtag event, plus a direct pixel to googleadservices.com.
   Google auto-enrolls tags in first-party mode, which routes gtag pings to paths on this domain that
   Netlify answers with 404 (proven on medicaidanswers.org 9/21); the direct pixel guarantees delivery.
   Load in <head>, before attribution.js / survey.js. Pages call MJF.conversion("prayer"|"signup"|"giving"). */
(function () {
  var ID = "AW-16468529105";
  var LABELS = { prayer: "754QCIjS0oEdENGf56w9", giving: "thVRCIvS0oEdENGf56w9", signup: "bCT2CJWX04EdENGf56w9" };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ID);
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);

  function conversion(kind) {
    var label = LABELS[kind];
    if (!label) return;
    try { gtag("event", "conversion", { send_to: ID + "/" + label, transport_type: "beacon" }); } catch (e) {}
    var px = "https://www.googleadservices.com/pagead/conversion/16468529105/?label=" + label + "&guid=ON&script=0"
      + "&url=" + encodeURIComponent(location.href.split("#")[0]);
    try { fetch(px, { mode: "no-cors", keepalive: true }).catch(function () {}); }
    catch (e) { try { new Image().src = px; } catch (e2) {} }
  }

  // Giving click-out: any link to a payment page. keepalive lets the ping survive the navigation.
  var gave = false;
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || gave) return;
    if (/square\.link|givebutter\.com/i.test(a.href)) { gave = true; conversion("giving"); }
  }, true);

  window.MJF = window.MJF || {};
  window.MJF.conversion = conversion;
})();

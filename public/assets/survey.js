/* Partner Path — 4–5 taps, Medicaid webhook pattern.
   POSTs to MW8 with keepalive:true BEFORE any redirect (the Medicaid lesson), then routes by p_intent.
   Pages set INTENT only. Donor tags fire on the GIFT (Square webhook -> MW1) — never here. */
(function () {
  var WEBHOOK = "https://services.leadconnectorhq.com/hooks/e4poIvyAFiLf6JN9ubzj/webhook-trigger/5cec18ae-dae2-449a-8390-361ea978b7d0";
  // One Square link per channel: which link a gift comes through IS the 10% attribution record.
  // Never collapse them, and never use Dean's pastor-lane link here.
  var SQUARE = {
    website: "https://square.link/u/DwpwvAA8",
    ads: "https://square.link/u/SlypZoUN",
    email: "https://square.link/u/XeUN36Ja",
    social: "https://square.link/u/FSNdjddl"
  };
  var MONTHLY = {
    "tier-39": "https://square.link/u/LpBJxXqV",
    "tier-99": "https://square.link/u/5tPctgK9",
    "tier-250": "https://square.link/u/X0sAvbPd"
  };

  var state = { p_interest: "", p_intent: "", p_vehicle: "", p_amount_band: "", p_source: "" };
  var modal, steps, order, pathDone = false;

  // Channel comes from first-touch attribution (attribution.js), so a visitor who first arrived
  // from an ad still credits the ad when they come back and give.
  function channel() {
    var a = (window.MJF && window.MJF.attribution) || {}, q = new URLSearchParams(location.search);
    var src = String(a.utm_source || q.get("utm_source") || "").toLowerCase();
    var med = String(a.utm_medium || q.get("utm_medium") || "").toLowerCase();
    if (a.gclid || q.get("gclid") || (/google|adwords/.test(src) && /cpc|ppc|paid/.test(med))) return "ads";
    if (/email|newsletter/.test(med) || /email|newsletter/.test(src)) return "email";
    if (/social/.test(med) || /facebook|instagram|^fb$|^ig$|youtube|tiktok|twitter|linkedin/.test(src)) return "social";
    return "website";
  }
  function oneTimeLink() { return SQUARE[channel()]; }

  function $(s, r) { return (r || document).querySelector(s); }
  function show(i) {
    steps.forEach(function (s) { s.classList.remove("on"); });
    var s = $('[data-step="' + order[i] + '"]', modal); s.classList.add("on");
    $(".progress i", modal).style.width = ((i + 1) / order.length * 100) + "%";
    modal.dataset.idx = i;
  }
  function route() {
    var t = state.p_intent;
    if (t === "monthly_partner") {
      // Came in from a tier button: hand straight to that tier's monthly link.
      if (MONTHLY[state.p_source]) { conversion("giving"); location.href = MONTHLY[state.p_source]; }
      else { pathDone = true; close(); location.hash = "#tiers"; }
    }
    else if (t === "one_time") { conversion("giving"); location.href = oneTimeLink(); }
    else if (t === "smart_giving") { location.href = "/contact/"; }
    else { location.href = "/thank-you-prayer/"; }
  }
  function open(source) {
    state.p_source = source || "partner-cta";
    order = ["interest", "intent", "vehicle", "amount", "contact"];
    modal.classList.add("open"); show(0);
  }
  function close() { modal.classList.remove("open"); }
  function conversion(kind) { try { if (window.MJF && window.MJF.conversion) window.MJF.conversion(kind); } catch (e) {} }

  function next() {
    var i = +modal.dataset.idx;
    // vehicle only matters for smart giving; skip it otherwise
    if (order[i] === "intent" && state.p_intent !== "smart_giving") { order = order.filter(function (s) { return s !== "vehicle"; }); }
    // pray-first skips the amount question
    if (order[i] === "intent" && state.p_intent === "pray_first") { order = order.filter(function (s) { return s !== "amount"; }); }
    show(Math.min(i + 1, order.length - 1));
  }

  function submit(e) {
    e.preventDefault();
    var f = e.target, err = $(".err", f); err.textContent = "";
    var data = Object.fromEntries(new FormData(f).entries());
    if (!data.name || !data.email) { err.textContent = "Name and email help us follow up — please add both."; return; }
    if (!f.consent_email.checked) { err.textContent = "Please tick the box so we may email you."; return; }
    var q = new URLSearchParams(location.search);
    var payload = Object.assign({}, state, {
      name: data.name, email: data.email, phone: data.phone || "",
      address1: data.address1 || "", city: data.city || "", state: data.state || "", postal_code: data.postal_code || "",
      prayer_request: data.prayer_request || "",
      consent_email: "yes", consent_sms_transactional: f.consent_sms_tx.checked ? "yes" : "no", consent_sms_updates: f.consent_sms_upd.checked ? "yes" : "no",
      page: location.pathname, gclid: q.get("gclid") || ((window.MJF && window.MJF.attribution && window.MJF.attribution.gclid) || "")
    }, (window.MJF && window.MJF.attribution) || {});
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(function (k) { if (!payload[k]) payload[k] = q.get(k) || ""; });
    $("button[type=submit]", f).disabled = true;
    try {
      fetch(WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true })
        .catch(function () {});   // keepalive: the POST survives the redirect either way
    } catch (e) {}
    conversion("signup");
    setTimeout(route, 250);
  }

  document.addEventListener("DOMContentLoaded", function () {
    modal = $("#partner-path"); if (!modal) return;
    steps = Array.prototype.slice.call(modal.querySelectorAll(".step"));
    document.querySelectorAll("[data-open-path]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var src = b.getAttribute("data-open-path");
        // Already answered the Partner Path this visit: a tier button goes straight to its monthly link.
        if (pathDone && MONTHLY[src]) { conversion("giving"); location.href = MONTHLY[src]; return; }
        open(src);
      });
    });
    $(".close", modal).addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    modal.querySelectorAll(".opt").forEach(function (o) {
      o.addEventListener("click", function () { state[o.dataset.key] = o.dataset.val; next(); });
    });
    $("form", modal).addEventListener("submit", submit);
    // one-time give links get this visitor's channel link
    document.querySelectorAll("[data-give]").forEach(function (a) { a.setAttribute("href", oneTimeLink()); });
    if (window.MJF && window.MJF.decorateLinks) window.MJF.decorateLinks();
  });
})();

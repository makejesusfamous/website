/* Form sends that never say "thank you" when the send failed (spec: mjf-form-failure-spec.md, Josh's decisions 10/19).
   MJF.send(key, url, data, ms) keeps a copy of what the person typed (localStorage mjf_pending_<key>) before sending,
   waits up to ms (default 8 s) for the server's answer, and resolves true only on an OK status. The copy is removed
   on success; otherwise the next page visit sends it again quietly (up to 3 tries, 14 days).
   MJF.fail(note, retry, prayer) shows the failure words + a Try again button where the thank-you text would go.
   MJF.prayerBackup(data) posts a second copy of a prayer request to MJF's own Netlify Forms (form "prayer-backup"). */
(function () {
  var PREFIX = 'mjf_pending_', MAX_TRIES = 3, MAX_AGE = 14 * 864e5;
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(PREFIX + k) || 'null'); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(PREFIX + k); } catch (e) {} },
    keys: function () { var out = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length)); } } catch (e) {} return out; }
  };

  function post(url, data, ms) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 8000);
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), keepalive: true, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); return r.ok; })
      .catch(function () { clearTimeout(timer); return false; });
  }

  function send(key, url, data, ms) {
    store.set(key, { url: url, data: data, t: Date.now(), tries: 1 });
    return post(url, data, ms).then(function (ok) { if (ok) store.del(key); return ok; });
  }

  function fail(note, retry, prayer) {
    if (!note) return;
    note.textContent = "We couldn't send this just now. Please try again in a minute.";
    if (prayer) {
      var p = document.createElement('span');
      p.appendChild(document.createTextNode(' Your prayer request matters to us. If it still won’t send, please email '));
      var a = document.createElement('a'); a.href = 'mailto:paul@r3dpillai.com'; a.textContent = 'paul@r3dpillai.com';
      p.appendChild(a); p.appendChild(document.createTextNode('.'));
      note.appendChild(p);
    }
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.textContent = 'Try again';
    b.style.cssText = 'display:flex;margin-top:.6rem;min-height:0;padding:.55rem 1rem';
    b.addEventListener('click', function () { b.disabled = true; retry(); });
    note.appendChild(b);
  }

  // Second copy of a prayer request in the ministry's own Netlify (Netlify Forms). Never blocks the person.
  function prayerBackup(d) {
    try {
      var f = { 'form-name': 'prayer-backup', name: d.name || '', email: d.email || '', prayer_request: d.prayer_request || '', source: d.p_source || location.pathname, sent_at: new Date().toISOString() };
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(f).toString(), keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  // Quiet second try: any copy still waiting from an earlier visit goes once more, with nothing shown.
  function retryPending() {
    store.keys().forEach(function (k) {
      var p = store.get(k);
      if (!p || !p.url || Date.now() - p.t > MAX_AGE || (p.tries || 0) >= MAX_TRIES) { store.del(k); return; }
      p.tries = (p.tries || 0) + 1; store.set(k, p);
      post(p.url, p.data, 8000).then(function (ok) { if (ok) store.del(k); });
    });
  }

  window.MJF = window.MJF || {};
  window.MJF.send = send;
  window.MJF.fail = fail;
  window.MJF.prayerBackup = prayerBackup;
  if (document.readyState === 'complete') setTimeout(retryPending, 1500);
  else window.addEventListener('load', function () { setTimeout(retryPending, 1500); });
})();

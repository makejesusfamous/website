/* Make Jesus Famous — shared behaviour. Vanilla, no build step. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menu
  var menu = document.querySelector('.menu-button'), nav = document.querySelector('.nav-links');
  if (menu && nav) {
    var closeMenu = function () { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); nav.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
    menu.addEventListener('click', function () { var open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); menu.setAttribute('aria-label', open ? 'Open menu' : 'Close menu'); nav.classList.toggle('is-open', !open); document.body.classList.toggle('menu-open', !open); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    addEventListener('resize', function () { if (innerWidth > 780) closeMenu(); });
    // mark the current page
    var here = location.pathname.replace(/index\.html$/, '');
    nav.querySelectorAll('a[href]').forEach(function (a) { var h = a.getAttribute('href'); if (h && h !== '/' && here.indexOf(h.replace(/#.*$/, '')) === 0 && h.length > 1) a.setAttribute('aria-current', 'page'); });
  }

  // Scroll reveals (html.js is set inline in <head>; without JS everything is simply visible)
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) reveals.forEach(function (x) { x.classList.add('is-visible'); });
  else { var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -5% 0px' }); reveals.forEach(function (x) { ro.observe(x); }); }

  // Count-ups
  var set = function (el, n) { el.textContent = Number(n).toLocaleString('en-US'); };
  var run = function (el) { var target = +el.dataset.count; if (reduced) return set(el, target); var start = performance.now(); var tick = function (now) { var p = Math.min((now - start) / 1500, 1), e = 1 - Math.pow(1 - p, 4); set(el, Math.floor(target * e)); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) { var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } }); }, { threshold: .45 }); counters.forEach(function (x) { co.observe(x); }); }
  else counters.forEach(function (x) { set(x, x.dataset.count); });

  // Fallback: if observers never fire (slow device, odd viewport), show everything and finish the numbers
  setTimeout(function () { reveals.forEach(function (x) { x.classList.add('is-visible'); }); counters.forEach(function (x) { if (x.textContent === '0' && +x.dataset.count !== 0) set(x, x.dataset.count); }); }, 2500);

  // Home loop: 1080p on wide screens, 720p otherwise; pause while the modal is open
  var loop = document.getElementById('field-loop');
  if (loop && innerWidth >= 1100 && !matchMedia('(prefers-reduced-data: reduce)').matches) { var s = loop.querySelector('source'); if (s) { s.src = '/assets/video/mjf-home-1080p.mp4'; loop.load(); loop.play().catch(function () {}); } }

  // Story video modal (same loop with sound until Dean's 90-second story video lands)
  var modal = document.querySelector('[data-video-modal]'), mv = document.getElementById('modal-video');
  if (modal) {
    var open = function (e) { e.preventDefault(); if (loop) loop.pause(); modal.showModal(); if (mv) { mv.currentTime = 0; mv.muted = false; mv.play().catch(function () {}); } };
    var close = function () { if (mv) mv.pause(); modal.close(); if (loop) loop.play().catch(function () {}); };
    document.querySelectorAll('[data-open-video]').forEach(function (b) { b.addEventListener('click', open); });
    var closer = modal.querySelector('[data-close-video]');
    if (closer) closer.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.addEventListener('cancel', function () { if (mv) mv.pause(); if (loop) loop.play().catch(function () {}); });
  }

  // Mailing list -> GHL webhook (magazine/mailing intake), with first-touch attribution when available
  var WEBHOOK = 'https://services.leadconnectorhq.com/hooks/e4poIvyAFiLf6JN9ubzj/webhook-trigger/48ea2b02-a549-4600-a2e2-04691349676e';
  document.querySelectorAll('[data-signup]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.parentElement.querySelector('[data-form-note]') || form.querySelector('[data-form-note]');
      var email = (form.querySelector('input[type=email]') || {}).value || '';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { if (note) note.textContent = 'Please enter a valid email address.'; return; }
      var a = (window.MJF && window.MJF.attribution) || {}, q = new URLSearchParams(location.search);
      var d = { email: email, tag: 'mailing-list', p_source: 'site:' + location.pathname, consent_email: 'yes' };
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) { d[k] = a[k] || q.get(k) || ''; });
      try { fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), keepalive: true }).catch(function () {}); } catch (err) {}
      form.reset();
      if (note) note.textContent = 'You are on the list. Watch for the next update from the field.';
    });
  });

  // Contact form -> same intake webhook, tagged contact-form (Dean's current site: first/last/email/phone/message)
  document.querySelectorAll('[data-contact]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[data-form-note]');
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      if (!d.first_name || !d.last_name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '') || !d.message) { if (note) note.textContent = 'Please add your name, a valid email, and your message.'; return; }
      d.name = d.first_name + ' ' + d.last_name; d.tag = 'contact-form'; d.p_source = 'site:/contact/';
      var a = (window.MJF && window.MJF.attribution) || {}, q = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) { d[k] = a[k] || q.get(k) || ''; });
      try { fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), keepalive: true }).catch(function () {}); } catch (err) {}
      form.querySelectorAll('input,textarea,button').forEach(function (el) { el.disabled = true; });
      if (note) { note.style.color = ''; note.textContent = 'Thanks for reaching out. Your message is on its way to the MJF team.'; }
    });
  });
})();

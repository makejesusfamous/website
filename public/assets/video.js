// Dean's videos on the partner and thank-you pages.
// A box like <div class="video placeholder" data-yt="" hidden> stays hidden until its data-yt holds a
// YouTube video ID. Then it shows YouTube's own thumbnail (served by YouTube, not by our host) and only
// loads the player when someone taps play, so the videos cost this site no bandwidth.
// Add data-yt-tall for a vertical (phone-shot) video.
(function () {
  document.querySelectorAll('.video[data-yt]').forEach(function (box) {
    var id = (box.getAttribute('data-yt') || '').trim();
    if (!/^[\w-]{11}$/.test(id)) return;
    var badge = box.querySelector('.badge');
    box.hidden = false;
    box.classList.remove('placeholder');
    box.classList.add('yt');
    if (box.hasAttribute('data-yt-tall')) box.classList.add('yt--tall');
    // the sentences that introduce the video, and the one-column hero used while it was missing
    var scope = box.closest('section, main') || document;
    scope.querySelectorAll('[data-with-video]').forEach(function (s) { s.hidden = false; });
    var solo = box.closest('.hero--solo');
    if (solo) solo.classList.remove('hero--solo');
    box.innerHTML = '<button type="button" class="yt-play" aria-label="Play the video from Dean">'
      + '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">'
      + '<span class="yt-btn" aria-hidden="true">&#9654;</span></button>';
    if (badge) box.appendChild(badge);
    box.querySelector('.yt-play').addEventListener('click', function () {
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id
        + '?autoplay=1&rel=0&playsinline=1" title="A word from Dean Morris" '
        + 'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    });
  });
})();

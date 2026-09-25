// Dean's videos, played from YouTube.
// A slot is any element with data-yt: the partner/thank-you boxes (<div class="video ..." data-yt="" hidden>)
// and the festival-report video cards (<div class="story" data-video-card hidden><div class="video-embed"
// data-yt=""></div><p>caption</p></div>). A slot stays hidden until its data-yt holds a YouTube video ID.
// Then it shows YouTube's own thumbnail (served by YouTube, not by our host) and only loads the player
// when someone taps play, so the videos cost this site no bandwidth. Add data-yt-tall for a vertical video.
// A block marked data-video-group appears once at least one of its cards has a video.
(function () {
  var valid = function (id) { return /^[\w-]{11}$/.test(id); };
  document.querySelectorAll('.video[data-yt], .video-embed[data-yt]').forEach(function (box) {
    var id = (box.getAttribute('data-yt') || '').trim();
    if (!valid(id)) return;
    var card = box.closest('[data-video-card]');
    if (card) card.hidden = false;
    var badge = box.querySelector('.badge');
    box.hidden = false;
    box.classList.remove('placeholder');
    box.classList.add('yt');
    if (box.hasAttribute('data-yt-tall')) box.classList.add('yt--tall');
    // the sentences that introduce a page video, and the one-column hero used while it was missing
    if (!card) {
      var scope = box.closest('section, main') || document;
      scope.querySelectorAll('[data-with-video]').forEach(function (s) { s.hidden = false; });
      var solo = box.closest('.hero--solo');
      if (solo) solo.classList.remove('hero--solo');
    }
    var label = box.getAttribute('data-yt-title') || 'A video from Make Jesus Famous';
    box.innerHTML = '<button type="button" class="yt-play" aria-label="Play: ' + label.replace(/"/g, '&quot;') + '">'
      + '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">'
      + '<span class="yt-btn" aria-hidden="true">&#9654;</span></button>';
    if (badge) box.appendChild(badge);
    box.querySelector('.yt-play').addEventListener('click', function () {
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id
        + '?autoplay=1&rel=0&playsinline=1" title="' + label.replace(/"/g, '&quot;') + '" '
        + 'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    });
  });
  document.querySelectorAll('[data-video-group]').forEach(function (g) {
    if (g.querySelector('[data-video-card]:not([hidden])')) g.hidden = false;
  });
})();

// Progressive enhancements. Everything here is optional: with JavaScript off, all content is
// visible, reviews show in full and a hero video simply shows its poster image.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Reviews: clamp long text behind a "Read more" toggle --- */
  document.querySelectorAll('[data-review]').forEach(function (card) {
    var text = card.querySelector('.review__text');
    var button = card.querySelector('.review__more');
    if (!text || !button) return;
    text.classList.add('is-clamped');
    if (text.scrollHeight <= text.clientHeight + 2) { text.classList.remove('is-clamped'); return; }
    button.hidden = false;
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      text.classList.toggle('is-clamped', open);
      button.textContent = open ? 'Read more' : 'Show less';
    });
  });

  /* --- Hero background video: plays only when motion is welcome, and can be paused --- */
  var video = document.querySelector('[data-hero-video]');
  var toggle = document.querySelector('[data-hero-video-toggle]');
  if (video && toggle) {
    var setLabel = function () { toggle.textContent = video.paused ? 'Play background video' : 'Pause background video'; };
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      if (video.paused) video.play(); else video.pause();
    });
    video.addEventListener('play', setLabel);
    video.addEventListener('pause', setLabel);
    if (!reduceMotion) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    setLabel();
  }

  /* --- Light reveal on scroll. Only elements below the first screen are ever hidden,
         and only once this script is running. --- */
  if (reduceMotion) return;
  // [selector, animation, stagger siblings?]
  var groups = [
    ['.section-head, .page-intro, .menu-cat__head, .menu-nav, .faq, .enquiry, .form-notice, .placeholder-block:not(.placeholder-block--portrait)', 'up', false],
    ['.essentials > div, .food-grid li, .reviews li, .option, .steps li, .menu-group, .menu-notes > div, .fact-group, .site-footer__grid > div', 'up', true],
    ['.owner__media, .split > div:first-child:not(.owner__media)', 'left', false],
    ['.note, .facts--visit, .split > div:last-child:not(:first-child), .split > dl', 'right', false],
    ['.menu-figure, .cta-band .container, .hero__media', 'zoom', false],
    ['.rating-badge', 'pop', false]
  ];
  // Anything at or above the reveal line is shown, so content you jump past (End key,
  // anchor links, fast scrolling) is never left hidden.
  var pending = [];
  var queued = false;
  function check() {
    queued = false;
    var line = window.innerHeight * 0.9;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top > line) return true;
      el.classList.add('is-visible');
      return false;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    }
  }
  function request() { if (!queued) { queued = true; window.requestAnimationFrame(check); } }

  groups.forEach(function (group) {
    document.querySelectorAll(group[0]).forEach(function (el) {
      if (el.classList.contains('reveal') || el.closest('.hero-full')) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen: leave alone
      if (group[2] && el.parentElement) {
        var index = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = Math.min(index, 5) * 110 + 'ms';
      }
      el.setAttribute('data-anim', group[1]);
      el.classList.add('reveal');
      pending.push(el);
    });
  });
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('load', request);
  request();
  // If the page is opened at an anchor or focus moves into hidden content, show it at once.
  document.addEventListener('focusin', function (e) {
    var hidden = e.target.closest && e.target.closest('.reveal:not(.is-visible)');
    if (hidden) hidden.classList.add('is-visible');
  });
})();

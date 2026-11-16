// Mobile navigation disclosure. Without JS the navigation is simply always visible.
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  var mq = window.matchMedia('(max-width: 55.99em)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = mq.matches ? !open : false;
  }
  function sync() { setOpen(false); }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else mq.addListener(sync);
  sync();
})();

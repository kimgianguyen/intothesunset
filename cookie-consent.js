(function () {
  'use strict';

  var COOKIE_NAME = 'its_consent';
  var COOKIE_DAYS = 365;

  // ── Cookie helpers ──────────────────────────────────────────
  function getCookie(name) {
    var m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + exp + '; path=/; SameSite=Lax';
  }

  // ── Navigation tracking (only when accepted) ─────────────────
  function trackPage() {
    try {
      var log = JSON.parse(localStorage.getItem('its_nav') || '[]');
      log.push({ page: location.pathname, time: Date.now() });
      if (log.length > 100) log = log.slice(-100);
      localStorage.setItem('its_nav', JSON.stringify(log));
    } catch (e) {}
  }

  // ── Check existing consent ────────────────────────────────────
  var consent = getCookie(COOKIE_NAME);
  if (consent === 'accepted') { trackPage(); return; }
  if (consent === 'declined') { return; }

  // ── Dismiss banner ────────────────────────────────────────────
  function dismiss(val) {
    setCookie(COOKIE_NAME, val, COOKIE_DAYS);
    if (val === 'accepted') trackPage();
    var el = document.getElementById('its-cookie');
    if (!el) return;
    el.style.transform = 'translateX(-50%) translateY(120%)';
    el.style.opacity = '0';
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
  }

  // ── Detect language ──────────────────────────────────────────
  var isFr = (localStorage.getItem('its_lang') || 'en') === 'fr';

  // ── Build banner ──────────────────────────────────────────────
  var banner = document.createElement('div');
  banner.id = 'its-cookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', isFr ? 'Consentement aux témoins' : 'Cookie consent');

  banner.innerHTML =
    '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">' +

      '<div style="flex:1;min-width:200px;">' +
        '<p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#E09500;">' + (isFr ? 'Témoins &amp; Confidentialité' : 'Cookies &amp; Privacy') + '</p>' +
        '<p style="margin:0;font-size:12px;line-height:1.65;color:rgba(253,246,236,0.65);">' +
          (isFr
            ? 'Nous utilisons des témoins pour mémoriser vos préférences et comprendre comment les visiteurs naviguent sur le site. '
            : 'We use cookies to remember your preferences and understand how visitors navigate the site. ') +
          '<a href="privacy.html" style="color:#E09500;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;">' + (isFr ? 'Politique de confidentialité' : 'Privacy policy') + '</a>' +
        '</p>' +
      '</div>' +

      '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">' +
        '<button id="its-decline" style="' +
          'padding:9px 18px;border-radius:999px;' +
          'border:1px solid rgba(253,246,236,0.18);background:transparent;' +
          'color:rgba(253,246,236,0.55);font-size:11px;font-weight:600;' +
          'letter-spacing:.1em;text-transform:uppercase;cursor:pointer;' +
          'font-family:inherit;transition:border-color .2s,color .2s;' +
        '">' + (isFr ? 'Refuser' : 'Decline') + '</button>' +
        '<button id="its-accept" style="' +
          'padding:9px 20px;border-radius:999px;border:none;' +
          'background:#E09500;color:#0A0814;font-size:11px;font-weight:700;' +
          'letter-spacing:.1em;text-transform:uppercase;cursor:pointer;' +
          'font-family:inherit;box-shadow:0 0 20px rgba(224,149,0,.38);' +
          'transition:box-shadow .2s,transform .15s;' +
        '">' + (isFr ? 'Accepter tout' : 'Accept all') + '</button>' +
      '</div>' +

    '</div>';

  // Banner container style
  var s = banner.style;
  s.position        = 'fixed';
  s.bottom          = '24px';
  s.left            = '50%';
  s.transform       = 'translateX(-50%) translateY(140%)';
  s.zIndex          = '9999';
  s.background      = 'rgba(10,8,20,0.97)';
  s.backdropFilter  = 'blur(18px)';
  s.webkitBackdropFilter = 'blur(18px)';
  s.border          = '1px solid rgba(224,149,0,0.28)';
  s.borderRadius    = '16px';
  s.padding         = '18px 24px';
  s.maxWidth        = '580px';
  s.width           = 'calc(100vw - 48px)';
  s.boxSizing       = 'border-box';
  s.boxShadow       = '0 12px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(224,149,0,.08)';
  s.fontFamily      = "'Inter', system-ui, sans-serif";
  s.opacity         = '0';
  s.transition      = 'transform .5s cubic-bezier(.22,1,.36,1), opacity .5s ease';

  document.body.appendChild(banner);

  // Slide in after page has settled
  setTimeout(function () {
    banner.style.transform = 'translateX(-50%) translateY(0)';
    banner.style.opacity   = '1';
  }, 600);

  // ── Button events ─────────────────────────────────────────────
  var acceptBtn  = document.getElementById('its-accept');
  var declineBtn = document.getElementById('its-decline');

  acceptBtn.addEventListener('click',  function () { dismiss('accepted'); });
  declineBtn.addEventListener('click', function () { dismiss('declined'); });

  acceptBtn.addEventListener('mouseenter', function () {
    this.style.boxShadow = '0 0 32px rgba(224,149,0,.6)';
    this.style.transform = 'scale(1.04)';
  });
  acceptBtn.addEventListener('mouseleave', function () {
    this.style.boxShadow = '0 0 20px rgba(224,149,0,.38)';
    this.style.transform = 'scale(1)';
  });

  declineBtn.addEventListener('mouseenter', function () {
    this.style.borderColor = 'rgba(253,246,236,.45)';
    this.style.color = 'rgba(253,246,236,.85)';
  });
  declineBtn.addEventListener('mouseleave', function () {
    this.style.borderColor = 'rgba(253,246,236,.18)';
    this.style.color = 'rgba(253,246,236,.55)';
  });

})();

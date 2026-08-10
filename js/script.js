/* ================================================================
   PGG LEGACY — script.js (Optimized for Lighthouse & GDPR)
   ================================================================ */
'use strict';

var SERVER_IP = 'play.PGGlegacy.gr';
var API_BASE  = 'https://pgg-leaderboard-api.onrender.com';
var MC_API    = 'https://api.mcstatus.io/v2/status/java/' + SERVER_IP;

/* ── Copyright Year ─────────────────────────────────────────── */
function initCopyrightYear() {
  var el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── AOS Animations ─────────────────────────────────────────── */
function initAnimations() {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('[data-aos]').forEach(function(el) {
      el.classList.add('aos-animate');
    });
    return;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.aosDelay || 0;
          setTimeout(function() {
            entry.target.classList.add('aos-animate');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-aos]').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('[data-aos]').forEach(function(el) {
      el.classList.add('aos-animate');
    });
  }
}

/* ── Custom Cursor ───────────────────────────────────────────── */
function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var cursor = document.getElementById('cursor');
  var glow   = document.getElementById('cursorGlow');
  if (!cursor || !glow) return;

  var rafId = null;
  var mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(function() {
        cursor.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px) translate(-50%, -50%)';
        glow.style.transform   = 'translate(' + mouseX + 'px, ' + mouseY + 'px) translate(-50%, -50%)';
        rafId = null;
      });
    }
  }, { passive: true });

  document.querySelectorAll('.main2_feature').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  });
}

/* ── Toggle Mobile Menu ──────────────────────────────────────── */
window.toggleMobileMenu = function() {
  var menu    = document.getElementById('mobile_navbar_links');
  var btn     = document.querySelector('.mobile_navbar .icon');
  var iconSvg = document.getElementById('menuIcon');
  if (!menu || !btn) return;

  var open = !menu.classList.contains('active');
  menu.classList.toggle('active', open);
  btn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);

  if (iconSvg) {
    iconSvg.innerHTML = open
      ? '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'
      : '<path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>';
  }
};

/* ── Mobile Menu Init ────────────────────────────────────────── */
function initMobileMenu() {
  var btn  = document.querySelector('.mobile_navbar .icon');
  var menu = document.getElementById('mobile_navbar_links');
  if (!btn || !menu) return;
  if (btn.dataset.menuInit) return;
  btn.dataset.menuInit = 'true';
  btn.removeAttribute('onclick');

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.toggleMobileMenu();
  });

  /* ── FIX #2: Χειρισμός /#hash links από mobile menu ── */
  menu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href') || '';

      /* Κλείσε πάντα το menu */
      if (menu.classList.contains('active')) {
        window.toggleMobileMenu();
      }

      /*
       * Αν είμαστε ΗΔΗ στην αρχική σελίδα και το href είναι /#hash,
       * κάνε smooth scroll αντί full page reload.
       */
      var isHomePage = (location.pathname === '/' || location.pathname === '/index.html');
      var hashMatch  = href.match(/^\/?#(.+)$/) || (href.startsWith('/#') && isHomePage ? [null, href.slice(2)] : null);

      if (hashMatch && isHomePage) {
        e.preventDefault();
        var targetId = href.replace(/^\/?#/, '');
        var target   = document.getElementById(targetId);
        if (target) {
          setTimeout(function() {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
      /* Αν δεν είμαστε στην αρχική, αφήνουμε τον browser να κάνει
         κανονική πλοήγηση στο /#section — δεν χρειάζεται preventDefault */
    });
  });

  /* Escape key για κλείσιμο */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      window.toggleMobileMenu();
      btn.focus();
    }
  });

  /* Κλείσιμο με click έξω από το menu */
  document.addEventListener('click', function(e) {
    if (
      menu.classList.contains('active') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      window.toggleMobileMenu();
    }
  });
}

/* ── Desktop Smooth Scroll ───────────────────────────────────── */
/* FIX #3: Πιάνει όλα τα navbar links που έχουν /#hash ή #hash */
function initDesktopScroll() {
  document.querySelectorAll('.desktop_navbar a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href') || '';
      var isHomePage = (location.pathname === '/' || location.pathname === '/index.html');

      /* Μόνο αν είμαστε στην αρχική και το href είναι /#section ή #section */
      if (!isHomePage) return;
      var hashOnly = href.match(/^\/?#(.+)$/);
      if (!hashOnly) return;

      e.preventDefault();
      var targetId = hashOnly[1];
      var target   = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Copy IP Button ──────────────────────────────────────────── */
function initCopyButton() {
  var btn = document.getElementById('ip-copy-btn');
  if (!btn) return;
  btn.addEventListener('click', function() { copyIP(SERVER_IP); });
}

function copyIP(ip) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ip).then(showCopyPopup).catch(function() { copyIPFallback(ip); });
  } else {
    copyIPFallback(ip);
  }
}

function copyIPFallback(ip) {
  var ta = document.createElement('textarea');
  ta.value = ip;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showCopyPopup(); }
  catch(err) { console.warn('Copy failed:', err); }
  document.body.removeChild(ta);
}

function showCopyPopup() {
  document.querySelectorAll('.main1_popup').forEach(function(el) { el.remove(); });
  var btn = document.getElementById('ip-copy-btn');
  if (!btn) return;
  var popup = document.createElement('div');
  popup.className = 'main1_popup';
  popup.setAttribute('role', 'status');
  popup.setAttribute('aria-live', 'polite');
  var msg = document.createElement('p');
  msg.textContent = 'Η IP αντιγράφηκε!';
  popup.appendChild(msg);
  btn.appendChild(popup);
  setTimeout(function() {
    popup.style.transition = 'opacity 0.3s ease';
    popup.style.opacity = '0';
    setTimeout(function() { popup.remove(); }, 300);
  }, 1500);
}

/* ── Player Count ────────────────────────────────────────────── */
/* FIX #4: Timeout 12s αντί 35s */
function fetchPlayerCount() {
  var el = document.getElementById('player-count');
  if (!el) return;

  var controller = new AbortController();
  var timeout = setTimeout(function() { controller.abort(); }, 12000);

  fetch(MC_API, { signal: controller.signal })
    .then(function(res) {
      clearTimeout(timeout);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (data.online) {
        el.textContent = data.players.online + ' / ' + data.players.max + ' Online — Πάτησε για αντιγραφή';
      } else {
        el.textContent = 'Server Offline — Πάτησε για αντιγραφή';
      }
    })
    .catch(function() {
      el.textContent = 'Πάτησε για αντιγραφή IP';
    });
}

/* ── Lazy Video Loading ──────────────────────────────────────── */
function initLazyVideos() {
  if (!('IntersectionObserver' in window)) return;

  var videoObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var video = entry.target;
        video.querySelectorAll('source').forEach(function(source) {
          if (source.dataset.src) {
            source.src = source.dataset.src;
          }
        });
        video.load();
        video.play().catch(function() {});
        videoObserver.unobserve(video);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('video[preload="none"]').forEach(function(video) {
    videoObserver.observe(video);
  });
}

/* ── Police Form Logic ───────────────────────────────────────── */
function initPoliceAppLogic() {
  var form = document.querySelector('.police-form');
  if (!form) return;

  var params = new URLSearchParams(window.location.search);
  if (params.get('reset') === 'true') {
    localStorage.removeItem('pgg_police_submitted');
    var cleanUrl = location.protocol + '//' + location.host + location.pathname;
    history.replaceState({}, '', cleanUrl);
  }

  if (hasSubmittedRecently()) {
    showAlreadySubmitted(form);
  } else {
    form.addEventListener('submit', function() { saveSubmission(168); });
  }
}

function saveSubmission(hours) {
  localStorage.setItem('pgg_police_submitted', JSON.stringify({
    submitted: true,
    expiry: Date.now() + hours * 3600000
  }));
}

function hasSubmittedRecently() {
  var raw = localStorage.getItem('pgg_police_submitted');
  if (!raw) return false;
  try {
    var data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return true;
    if (Date.now() > data.expiry) {
      localStorage.removeItem('pgg_police_submitted');
      return false;
    }
    return true;
  } catch(e) { return true; }
}

function showAlreadySubmitted(form) {
  var msg   = document.createElement('div');
  msg.className = 'already-submitted-msg';
  msg.setAttribute('role', 'alert');
  var title = document.createElement('strong');
  title.textContent = 'Έχεις ήδη υποβάλει μια αίτηση!';
  var sub   = document.createElement('span');
  sub.textContent = 'Παρακαλώ περίμενε να εξεταστεί από το Staff.';
  msg.appendChild(title);
  msg.appendChild(sub);
  form.replaceWith(msg);
}

/* ── Leaderboard ─────────────────────────────────────────────── */
function initLeaderboardLogic() {
  var listContainer = document.getElementById('leaderboard-list');
  var btnWeekly     = document.getElementById('btn-weekly');
  var btnAll        = document.getElementById('btn-all');
  if (!listContainer || !btnWeekly || !btnAll) return;

  btnWeekly.addEventListener('click', function() { switchPeriod('weekly'); });
  btnAll.addEventListener('click',    function() { switchPeriod('all'); });

  fetchLeaderboard('weekly');
}

function switchPeriod(period) {
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  var activeBtn = document.getElementById(period === 'all' ? 'btn-all' : 'btn-weekly');
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }
  fetchLeaderboard(period);
}

/* FIX #4: Leaderboard timeout επίσης 12s */
function fetchLeaderboard(period) {
  var listContainer = document.getElementById('leaderboard-list');
  if (!listContainer) return;

  listContainer.setAttribute('aria-busy', 'true');
  showSkeleton(listContainer);

  var controller = new AbortController();
  var timeout    = setTimeout(function() { controller.abort(); }, 12000);

  fetch(API_BASE + '?period=' + period, { signal: controller.signal })
    .then(function(res) {
      clearTimeout(timeout);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(players) {
      listContainer.innerHTML = '';
      if (!Array.isArray(players) || players.length === 0) {
        showLeaderboardMessage(
          listContainer,
          period === 'weekly'
            ? 'Δεν υπάρχουν δεδομένα για αυτήν την εβδομάδα.'
            : 'Δεν βρέθηκαν δεδομένα ακόμα.',
          'leaderboard-msg'
        );
        return;
      }
      var fragment = document.createDocumentFragment();
      players.slice(0, 25).forEach(function(player, index) {
        fragment.appendChild(createLeaderboardItem(player, index + 1));
      });
      listContainer.appendChild(fragment);
    })
    .catch(function(err) {
      console.error('Leaderboard error:', err);
      listContainer.innerHTML = '';
      showLeaderboardMessage(
        listContainer,
        'Δεν ήταν δυνατή η σύνδεση με το API. Δοκίμασε ξανά αργότερα.',
        'leaderboard-error-msg'
      );
    })
    .finally(function() {
      listContainer.setAttribute('aria-busy', 'false');
    });
}

function createLeaderboardItem(player, rank) {
  var rankColors  = { 1: '#00b4d8', 2: '#ffd700', 3: '#c0c0c0' };
  var rankClasses = { 1: 'rank-1', 2: 'rank-2', 3: 'rank-3' };

  var item = document.createElement('div');
  item.className = ('list-item ' + (rankClasses[rank] || '')).trim();
  item.setAttribute('role', 'listitem');

  var rankEl = document.createElement('div');
  rankEl.className = 'item-rank';
  rankEl.style.color = rankColors[rank] || '#b0b8d0';
  rankEl.setAttribute('aria-label', 'Θέση ' + rank);
  rankEl.textContent = '#' + rank;

  var img = document.createElement('img');
  img.className = 'item-head';
  img.src     = player.headUrl;
  img.alt     = player.username + ' avatar';
  img.width   = 44;
  img.height  = 44;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.onerror = function() { this.src = 'https://mc-heads.net/avatar/steve/44'; };

  var username = document.createElement('div');
  username.className   = 'item-username';
  username.textContent = player.username;

  var time = document.createElement('div');
  time.className = 'item-time';
  time.setAttribute('aria-label', 'Χρόνος: ' + player.playtime);
  time.textContent = player.playtime;

  item.appendChild(rankEl);
  item.appendChild(img);
  item.appendChild(username);
  item.appendChild(time);
  return item;
}

function showSkeleton(container) {
  container.innerHTML = '';
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < 5; i++) {
    var item = document.createElement('div');
    item.className = 'list-item skeleton-item';
    item.setAttribute('aria-hidden', 'true');
    ['item-rank skeleton-block',
     'item-head skeleton-block',
     'item-username skeleton-block skeleton-username'
    ].forEach(function(cls) {
      var el = document.createElement('div');
      el.className = cls;
      item.appendChild(el);
    });
    fragment.appendChild(item);
  }
  container.appendChild(fragment);
}

function showLeaderboardMessage(container, text, className) {
  var p = document.createElement('p');
  p.className   = className;
  p.textContent = text;
  container.appendChild(p);
}

/* ── DOM Ready Initializations ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  initCopyrightYear();
  initAnimations();
  initCursor();
  initMobileMenu();
  initDesktopScroll();
  initCopyButton();
  initLazyVideos();
  initPoliceAppLogic();
  initLeaderboardLogic();

  setTimeout(fetchPlayerCount, 1000);
});

/* ── Cookie Consent & GDPR System ────────────────────────────── */
(function () {
  var STORAGE_KEY = 'pgg_cookie_consent';
  var GA_ID       = 'G-49NVHWZZV8';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch (e) {}
  }

  function loadGoogleAnalytics() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;

    var script  = document.createElement('script');
    script.async = true;
    script.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    /* FIX #6: requestAnimationFrame για σωστό animation */
    requestAnimationFrame(function() {
      setTimeout(function() {
        banner.classList.add('cookie-visible');
      }, 600);
    });
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.remove('cookie-visible');
    setTimeout(function() {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 450);
  }

  function acceptCookies() {
    setConsent('accepted');
    loadGoogleAnalytics();
    hideBanner();
  }

  function declineCookies() {
    setConsent('declined');
    hideBanner();
  }

  /* FIX #5: <div> αντί <p> για το cookie-text */
  function createBanner() {
    if (document.getElementById('cookie-banner')) {
      return document.getElementById('cookie-banner');
    }

    var banner = document.createElement('div');
    banner.id  = 'cookie-banner';
    banner.setAttribute('role',       'dialog');
    banner.setAttribute('aria-label', 'Συγκατάθεση Cookies');
    banner.setAttribute('aria-live',  'polite');

    var text = document.createElement('div');
    text.className = 'cookie-text';
    text.innerHTML = [
      '🍪 <strong>Cookies &amp; Απόρρητο</strong><br>',
      'Χρησιμοποιούμε cookies για ανώνυμα στατιστικά επισκεψιμότητας (Google Analytics) ',
      'και για την ομαλή λειτουργία του site. Διαβάστε την ',
      '<a href="/privacy" target="_blank" rel="noopener noreferrer">Πολιτική Απορρήτου</a>',
      ' μας.'
    ].join('');

    var buttons = document.createElement('div');
    buttons.className = 'cookie-buttons';

    var acceptBtn = document.createElement('button');
    acceptBtn.id          = 'cookie-accept';
    acceptBtn.type        = 'button';
    acceptBtn.className   = 'cookie-btn-accept';
    acceptBtn.setAttribute('aria-label', 'Αποδοχή cookies');
    acceptBtn.textContent = 'Αποδοχή';

    var declineBtn = document.createElement('button');
    declineBtn.id          = 'cookie-decline';
    declineBtn.type        = 'button';
    declineBtn.className   = 'cookie-btn-decline';
    declineBtn.setAttribute('aria-label', 'Απόρριψη cookies');
    declineBtn.textContent = 'Απόρριψη';

    buttons.appendChild(acceptBtn);
    buttons.appendChild(declineBtn);
    banner.appendChild(text);
    banner.appendChild(buttons);

    return banner;
  }

  function attachBannerEvents() {
    var acceptBtn  = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn)  acceptBtn.addEventListener('click',  acceptCookies);
    if (declineBtn) declineBtn.addEventListener('click', declineCookies);
  }

  window.resetCookieConsent = function() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    var existing = document.getElementById('cookie-banner');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var banner = createBanner();
    document.body.appendChild(banner);
    attachBannerEvents();
    showBanner();
  };

  function init() {
    var consent = getConsent();

    if (consent === 'accepted') {
      loadGoogleAnalytics();
      return;
    }

    if (consent === 'declined') {
      return;
    }

    /* Δεν έχει δοθεί consent ακόμα — εμφάνισε banner */
    var banner = createBanner();
    document.body.appendChild(banner);
    attachBannerEvents();
    showBanner();

    /* Reset button στη privacy page */
    document.addEventListener('click', function(e) {
      var resetBtn = e.target.closest('#reset-cookies-btn');
      if (resetBtn) {
        e.preventDefault();
        window.resetCookieConsent();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
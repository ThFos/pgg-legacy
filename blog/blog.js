/* ==========================================================================
   PGG LEGACY — blog.js
   ΣΗΜΑΝΤΙΚΟ: Φορτώνεται ΜΕΤΑ το script.js
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function() {

  /* ── 1. Copyright Year ─────────────────────────────────────────────────── */
  var yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2. AOS Animations ─────────────────────────────────────────────────── */
  if (window.innerWidth <= 768) {
    document.querySelectorAll('[data-aos]').forEach(function(el) {
      el.classList.add('aos-animate');
    });
  } else {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-aos]').forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ── 3. Custom Cursor ──────────────────────────────────────────────────── */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cursor = document.getElementById('cursor');
    var glow   = document.getElementById('cursorGlow');
    if (cursor && glow) {
      document.addEventListener('mousemove', function(e) {
        var x = e.clientX;
        var y = e.clientY;
        cursor.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
        glow.style.transform   = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
      }, { passive: true });
    }
  }

  /* ── 4. Mobile Menu ────────────────────────────────────────────────────── */
  /* ΔΕΝ χρειάζεται τίποτα εδώ — το script.js έχει ήδη βάλει */
  /* τον listener στο .icon μέσω initMobileMenu().            */
  /* Το window.toggleMobileMenu είναι ήδη global.             */

  /* ── 5. Smooth scroll για blog internal anchors ────────────────────────── */
  document.querySelectorAll('.cmd-quicknav a, .blog-breadcrumb a').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });

});
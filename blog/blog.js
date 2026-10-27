/* ==========================================================================
   PGG LEGACY — blog.js
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function() {

  /* ── Smooth scroll (breadcrumb & command quicknav anchors) ──────────────── */
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
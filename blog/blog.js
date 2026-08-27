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

  /* ── 4. Smooth scroll για blog internal anchors ────────────────────────── */
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

  /* ── 5. CMS Markdown Parser & Loader ───────────────────────────────────── */
  
  // Helper: Διαχωρισμός YAML Frontmatter & Markdown
  function parseFrontmatter(text) {
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };

    var yamlStr = match[1];
    var body = match[2];
    var meta = {};

    yamlStr.split('\n').forEach(function(line) {
      var parts = line.split(':');
      if (parts.length >= 2) {
        var key = parts[0].trim();
        var value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
        meta[key] = value;
      }
    });

    return { meta: meta, body: body };
  }

  // Φόρτωση και προβολή μεμονωμένου άρθρου (αν υπάρχει container #blog-article-content)
  var articleContainer = document.getElementById('blog-article-content');
  if (articleContainer) {
    var articlePath = articleContainer.getAttribute('data-md-path');
    if (articlePath) {
      fetch(articlePath)
        .then(function(res) { return res.text(); })
        .then(function(mdText) {
          var parsed = parseFrontmatter(mdText);
          
          // Ενημέρωση τίτλου & ημερομηνίας αν υπάρχουν elements
          var titleEl = document.getElementById('article-title');
          var dateEl = document.getElementById('article-date');
          if (titleEl && parsed.meta.title) titleEl.textContent = parsed.meta.title;
          if (dateEl && parsed.meta.date) dateEl.textContent = new Date(parsed.meta.date).toLocaleDateString('el-GR');

          // Μετατροπή Markdown σε HTML μέσω της βιβλιοθήκης marked
          if (typeof marked !== 'undefined') {
            articleContainer.innerHTML = marked.parse(parsed.body);
          } else {
            articleContainer.textContent = parsed.body;
          }
        })
        .catch(function(err) {
          console.error('Σφάλμα φόρτωσης άρθρου:', err);
        });
    }
  }

});
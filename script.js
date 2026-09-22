/* =========================================================
   EIA x Green Infrastructure — External JavaScript
   All original scripts preserved + new animation enhancements
   ========================================================= */

(function () {
  'use strict';

  /* ── Globals ── */
  var slides = Array.from(document.querySelectorAll('.slide'));
  var total = slides.length;
  var current = 0;
  var autoplayTimer = null;
  var autoplayActive = false;

  /* ── Inject depth grid + orbs ── */
  var g = document.createElement('div');
  g.className = 'depth-grid';
  document.body.insertBefore(g, document.body.firstChild);
  for (var oi = 0; oi < 4; oi++) {
    var o = document.createElement('div');
    o.className = 'orb-3d';
    document.body.insertBefore(o, document.body.firstChild);
  }

  /* ── Helper: mark active slide ── */
  function setActive(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === idx);
    });
    current = idx;
    updateUI();
    spawnRipple(slides[idx]);
    spawnParticles(slides[idx]);
    addScanLine(slides[idx]);
  }

  /* ── Update topbar UI ── */
  function updateUI() {
    var countEl = document.getElementById('slideCount');
    if (countEl) countEl.textContent = pad(current + 1) + ' / ' + pad(total);

    var bar = document.getElementById('progressBar');
    if (bar) bar.style.width = ((current + 1) / total * 100) + '%';

    /* nav buttons */
    var activeSec = slides[current] ? slides[current].dataset.section : '';
    var sCol = { eia: '#5de4a8', gi: '#6effc7', qa: '#ffb380', sources: '#b0c4f0' };
    document.querySelectorAll('.nav button').forEach(function (btn) {
      var sec = btn.dataset.sectionJump;
      var isActive = sec === activeSec;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.style.color = sCol[sec] || '';
        btn.style.borderColor = (sCol[sec] || '') + '44';
        btn.style.textShadow = '0 0 16px ' + (sCol[sec] || '') + '80';
      } else {
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.style.textShadow = '';
      }
    });

    /* mini progress on each meta card */
    slides.forEach(function (s, i) {
      var fill = s.querySelector('.slide-mini-progress-fill');
      var count = s.querySelector('.slide-mini-progress-count');
      if (fill) fill.style.width = ((i + 1) / total * 100) + '%';
      if (count) count.textContent = pad(i + 1) + '/' + pad(total);
    });

    /* progress bar gradient per section */
    var gradients = { eia: 'linear-gradient(90deg,#5de4a8,#a8f0d0 60%,#e8894a)', gi: 'linear-gradient(90deg,#2ad991,#6effc7)', qa: 'linear-gradient(90deg,#e8894a,#ffb380)', sources: 'linear-gradient(90deg,#6489dc,#b0c4f0)' };
    if (bar) bar.style.background = gradients[activeSec] || gradients.eia;

    updateDots();
    updateSection();
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ── IntersectionObserver → active slide detection ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        var idx = slides.indexOf(entry.target);
        if (idx !== -1 && idx !== current) setActive(idx);
      }
    });
  }, { threshold: 0.5 });
  slides.forEach(function (s) { io.observe(s); });

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight': case 'PageDown':
        e.preventDefault(); navigateBy(1); break;
      case 'ArrowUp': case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); navigateBy(-1); break;
      case 'Home': e.preventDefault(); navigateTo(0); break;
      case 'End': e.preventDefault(); navigateTo(total - 1); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'o': case 'O': toggleOverview(); break;
      case 'a': case 'A': toggleAutoplay(); break;
      case 'Escape': closeOverview(); break;
    }
  });

  function navigateBy(delta) { navigateTo(current + delta); }
  function navigateTo(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth' });
  }

  /* ── Overview modal ── */
  var overviewBtn = document.getElementById('overviewBtn');
  var modal = document.querySelector('.modal');
  var searchEl = document.querySelector('.search');
  if (overviewBtn) overviewBtn.addEventListener('click', toggleOverview);

  function toggleOverview() {
    if (modal) modal.classList.toggle('open');
  }
  function closeOverview() {
    if (modal) modal.classList.remove('open');
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeOverview();
    });
  }
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      var q = searchEl.value.toLowerCase();
      document.querySelectorAll('.thumb').forEach(function (t) {
        var text = (t.dataset.search || t.textContent).toLowerCase();
        t.hidden = !text.includes(q);
      });
    });
  }

  /* thumbnail clicks → go to slide */
  document.querySelectorAll('.thumb').forEach(function (t) {
    t.addEventListener('click', function () {
      var go = parseInt(t.dataset.go || '1', 10) - 1;
      closeOverview();
      setTimeout(function () { navigateTo(go); }, 200);
    });
  });

  /* ── Autoplay ── */
  var autoBtn = document.getElementById('autoplayBtn');
  if (autoBtn) autoBtn.addEventListener('click', toggleAutoplay);
  function toggleAutoplay() {
    autoplayActive = !autoplayActive;
    if (autoBtn) autoBtn.textContent = autoplayActive ? '⏸' : '▶';
    if (autoBtn) autoBtn.title = autoplayActive ? 'Pause autoplay (A)' : 'Start autoplay (A)';
    if (autoplayActive) {
      autoplayTimer = setInterval(function () {
        if (current >= total - 1) { navigateTo(0); } else { navigateBy(1); }
      }, 5000);
    } else {
      clearInterval(autoplayTimer);
    }
  }

  /* ── Fullscreen ── */
  var fsBtn = document.getElementById('fullscreenBtn');
  if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }

  /* ── Section nav buttons ── */
  document.querySelectorAll('[data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var go = parseInt(btn.dataset.go, 10) - 1;
      navigateTo(go);
    });
  });

  /* ── Transcript dialogs ── */
  document.querySelectorAll('.text-btn[data-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = document.getElementById(btn.dataset.dialog);
      if (dlg && dlg.showModal) dlg.showModal();
    });
  });
  document.querySelectorAll('.dialog-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = btn.closest('dialog');
      if (dlg) dlg.close();
    });
  });

  /* ── Toast ── */
  var toastEl = document.querySelector('.toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ── Copy link ── */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(window.location.href).then(function () {
        showToast('Link copied!');
      });
    });
  });

  /* ── 3D tilt on slide-shell ── */
  slides.forEach(function (slide) {
    var shell = slide.querySelector('.slide-shell');
    if (!shell) return;

    /* Spotlight element */
    var spot = document.createElement('div');
    spot.className = 'slide-spotlight';
    slide.appendChild(spot);

    slide.addEventListener('mousemove', function (e) {
      var r = slide.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      shell.style.transform = 'perspective(1200px) rotateX(' + (-dy * 3.5) + 'deg) rotateY(' + (dx * 3.5) + 'deg)';
      var card = shell.querySelector('.slide-card');
      if (card) card.style.transform = 'perspective(1000px) rotateX(' + (-dy * 2) + 'deg) rotateY(' + (dx * 2) + 'deg) translateZ(10px)';

      /* move spotlight */
      spot.style.left = (e.clientX - r.left) + 'px';
      spot.style.top = (e.clientY - r.top) + 'px';
    });
    slide.addEventListener('mouseleave', function () {
      shell.style.transform = '';
      var card = shell.querySelector('.slide-card');
      if (card) card.style.transform = '';
    });
  });

  /* ── Thumb 3D tilt ── */
  document.querySelectorAll('.thumb').forEach(function (t) {
    t.addEventListener('mousemove', function (e) {
      var r = t.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width - .5) * 2;
      var dy = ((e.clientY - r.top) / r.height - .5) * 2;
      t.style.transform = 'perspective(600px) rotateX(' + (-dy * 4) + 'deg) rotateY(' + (dx * 4) + 'deg) translateY(-8px) scale(1.015)';
    });
    t.addEventListener('mouseleave', function () { t.style.transform = ''; });
  });

  /* ── Scroll-depth rail ── */
  var rail = document.createElement('div');
  rail.className = 'scroll-depth-rail';
  rail.setAttribute('aria-hidden', 'true');
  var dots = [];
  slides.forEach(function (s, i) {
    var d = document.createElement('div');
    d.className = 'scroll-depth-dot';
    d.title = s.dataset.title || 'Slide ' + (i + 1);
    d.addEventListener('click', function () { s.scrollIntoView({ behavior: 'smooth' }); });
    rail.appendChild(d);
    dots.push(d);
  });
  document.body.appendChild(rail);

  function updateDots() {
    var sCol = { eia: '#5de4a8', gi: '#6effc7', qa: '#ffb380', sources: '#b0c4f0' };
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === current);
      var sec = slides[i] ? slides[i].dataset.section : '';
      if (i === current && sCol[sec]) {
        d.style.background = sCol[sec];
        d.style.boxShadow = '0 0 10px ' + sCol[sec] + '99';
      } else {
        d.style.background = '';
        d.style.boxShadow = '';
      }
    });
  }

  /* ── Section colour logic ── */
  function updateSection() {
    var active = slides[current];
    if (!active) return;
    var sec = active.dataset.section;
    var sCol = { eia: '#5de4a8', gi: '#6effc7', qa: '#ffb380', sources: '#b0c4f0' };
    var color = sCol[sec] || '#5de4a8';
    document.querySelectorAll('.nav button').forEach(function (btn) {
      if (btn.classList.contains('active')) {
        btn.style.color = color;
        btn.style.borderColor = color + '44';
        btn.style.textShadow = '0 0 16px ' + color + '80';
      }
    });
  }

  /* ── Data-node orbits on each card ── */
  var nc = { eia: 'rgba(93,228,168,.25)', gi: 'rgba(30,200,120,.25)', qa: 'rgba(232,137,74,.25)', sources: 'rgba(100,140,220,.25)' };
  document.querySelectorAll('.slide-card').forEach(function (card) {
    var sl = card.closest('.slide'); if (!sl) return;
    var nodeColor = nc[sl.dataset.section] || nc.eia;
    for (var ni = 0; ni < 2; ni++) {
      var n = document.createElement('div');
      n.className = 'data-node';
      var sz = 6 + ni * 4;
      n.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;--orbit-r:' + (50 + ni * 30) + 'px;--spin-speed:' + (12 + ni * 8) + 's;top:50%;left:50%;margin-top:-' + (sz / 2) + 'px;margin-left:-' + (sz / 2) + 'px;border-color:' + nodeColor + ';animation-delay:-' + (ni * 4) + 's;box-shadow:0 0 10px ' + nodeColor + ';';
      card.appendChild(n);
    }
  });

  /* ── Shine reset on card entry ── */
  var shineObs = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var slide = m.target;
      if (!slide.classList.contains('active')) return;
      var shine = slide.querySelector('.shine');
      if (shine) {
        shine.style.animation = 'none';
        void shine.offsetWidth;
        shine.style.animation = '';
      }
    });
  });
  slides.forEach(function (s) { shineObs.observe(s, { attributes: true, attributeFilter: ['class'] }); });

  /* ── Detail & tag stagger ── */
  slides.forEach(function (s) {
    s.querySelectorAll('.slide-detail').forEach(function (el) {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s,transform .6s';
    });
    s.querySelectorAll('.slide-tag').forEach(function (t) {
      t.style.opacity = '0'; t.style.transform = 'scale(.7)';
      t.style.transition = 'opacity .4s,transform .4s';
    });
  });

  var detailObs = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var s = m.target;
      var show = s.classList.contains('active');
      s.querySelectorAll('.slide-detail').forEach(function (el, i) {
        if (show) { el.style.opacity = ''; el.style.transform = ''; el.style.transitionDelay = (.4 + i * .12) + 's'; }
        else { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transitionDelay = '0s'; }
      });
      s.querySelectorAll('.slide-tag').forEach(function (tag, i) {
        if (show) { setTimeout(function () { tag.style.opacity = ''; tag.style.transform = ''; }, 600 + i * 80); }
        else { tag.style.opacity = '0'; tag.style.transform = 'scale(.7)'; }
      });
    });
  });
  slides.forEach(function (s) { detailObs.observe(s, { attributes: true, attributeFilter: ['class'] }); });

  /* ── NEW: Floating particles per slide ── */
  function spawnParticles(slide) {
    /* Remove old particles from this slide */
    slide.querySelectorAll('.particle').forEach(function (p) { p.remove(); });
    var sCol = { eia: '93,228,168', gi: '30,200,120', qa: '232,137,74', sources: '100,140,220' };
    var col = sCol[slide.dataset.section] || '93,228,168';
    var count = 12;
    for (var pi = 0; pi < count; pi++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = 2 + Math.random() * 4;
      var left = 5 + Math.random() * 90;
      var duration = 6 + Math.random() * 8;
      var delay = Math.random() * 5;
      var px = (Math.random() - .5) * 80;
      p.style.cssText = [
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + left + '%',
        'bottom:-10px',
        'background:rgba(' + col + ',' + (.3 + Math.random() * .4) + ')',
        'animation-duration:' + duration + 's',
        'animation-delay:' + delay + 's',
        '--px:' + px + 'px',
        'filter:blur(' + (Math.random() > .5 ? 1 : 0) + 'px)'
      ].join(';');
      slide.appendChild(p);
    }
  }

  /* ── NEW: Ripple on activation ── */
  function spawnRipple(slide) {
    var old = slide.querySelector('.slide-ripple');
    if (old) old.remove();
    var r = document.createElement('div');
    r.className = 'slide-ripple';
    var size = Math.max(slide.offsetWidth, slide.offsetHeight) * 1.2;
    r.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:50%;top:50%;margin-left:-' + (size/2) + 'px;margin-top:-' + (size/2) + 'px;';
    slide.appendChild(r);
    setTimeout(function () { r.remove(); }, 1000);
  }

  /* ── NEW: Scan line ── */
  function addScanLine(slide) {
    if (slide.querySelector('.scan-line')) return;
    var sc = document.createElement('div');
    sc.className = 'scan-line';
    slide.appendChild(sc);
  }

  /* ── NEW: Nav button colour hover ── */
  var sColMap = { eia: '#5de4a8', gi: '#6effc7', qa: '#ffb380', sources: '#b0c4f0' };
  document.querySelectorAll('.nav button').forEach(function (btn) {
    var sec = btn.dataset.sectionJump;
    if (sec && sColMap[sec]) {
      btn.addEventListener('mouseenter', function () {
        if (!btn.classList.contains('active')) {
          btn.style.color = sColMap[sec];
          btn.style.textShadow = '0 0 16px ' + sColMap[sec] + '80';
          btn.style.borderColor = sColMap[sec] + '44';
        }
      });
      btn.addEventListener('mouseleave', function () {
        if (!btn.classList.contains('active')) {
          btn.style.color = '';
          btn.style.textShadow = '';
          btn.style.borderColor = '';
        }
      });
    }
  });

  /* ── NEW: Particle colour change on section change ── */
  var particleObs = new MutationObserver(function () {
    var active = slides[current];
    if (!active) return;
    var sCol = { eia: '93,228,168', gi: '30,200,120', qa: '232,137,74', sources: '100,140,220' };
    var col = sCol[active.dataset.section] || '93,228,168';
    active.querySelectorAll('.particle').forEach(function (p) {
      p.style.background = 'rgba(' + col + ',' + (.3 + Math.random() * .4) + ')';
    });
  });
  slides.forEach(function (s) { particleObs.observe(s, { attributes: true, attributeFilter: ['class'] }); });

  /* ── Initial state ── */
  setActive(0);
  var initialActive = slides[0];
  if (initialActive) {
    spawnParticles(initialActive);
    addScanLine(initialActive);
  }

})();

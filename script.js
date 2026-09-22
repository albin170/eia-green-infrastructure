/* ==========================================================================
   EIA x Green Infrastructure — Animation & Interaction Engine
   Features:
   - Subtle Floating Leaves Ambient Canvas (slow, organic motion)
   - Animated Number Counters on slide activation
   - Visible "Reduce Motion" accessibility manager
   - Active section tracking for the 7 navigation items
   - Keyboard & Touch navigation with progress bar
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. ACCESSIBILITY: REDUCE MOTION CONTROLLER
     ======================================================================== */
  var motionBtn = document.getElementById('motionToggleBtn');
  var isMotionReduced = false;

  function setReduceMotion(reduce) {
    isMotionReduced = reduce;
    document.documentElement.classList.toggle('reduced-motion', reduce);
    if (motionBtn) {
      motionBtn.classList.toggle('active', reduce);
      motionBtn.setAttribute('aria-pressed', reduce ? 'true' : 'false');
      var label = motionBtn.querySelector('span');
      if (label) {
        label.textContent = reduce ? 'Motion reduced' : 'Reduce motion';
      }
    }
    try {
      localStorage.setItem('eia_reduced_motion', reduce ? '1' : '0');
    } catch (e) {}
  }

  // Check saved preference or system preference
  var savedPref = null;
  try {
    savedPref = localStorage.getItem('eia_reduced_motion');
  } catch (e) {}

  if (savedPref !== null) {
    setReduceMotion(savedPref === '1');
  } else if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setReduceMotion(true);
  }

  if (motionBtn) {
    motionBtn.addEventListener('click', function () {
      setReduceMotion(!isMotionReduced);
    });
  }

  /* ========================================================================
     2. AMBIENT FLOATING LEAVES CANVAS (Subtle, Organic & Gentle)
     ======================================================================== */
  var leavesCanvas = document.getElementById('ambientLeavesCanvas');
  if (!leavesCanvas) {
    leavesCanvas = document.createElement('canvas');
    leavesCanvas.id = 'ambientLeavesCanvas';
    leavesCanvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(leavesCanvas, document.body.firstChild);
  }

  var ctx = leavesCanvas.getContext('2d');
  var leaves = [];
  var leafCount = 14;
  var animFrameId = null;

  function resizeCanvas() {
    leavesCanvas.width = window.innerWidth;
    leavesCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function createLeaf(initialY) {
    return {
      x: Math.random() * leavesCanvas.width,
      y: initialY !== undefined ? initialY : Math.random() * leavesCanvas.height,
      size: 14 + Math.random() * 18,
      speedY: 0.35 + Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      opacity: 0.12 + Math.random() * 0.16,
      swayOffset: Math.random() * 100,
      color: Math.random() > 0.4 ? 'rgba(74, 222, 128, ' : 'rgba(45, 212, 191, '
    };
  }

  for (var i = 0; i < leafCount; i++) {
    leaves.push(createLeaf());
  }

  function drawLeaf(leaf) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.fillStyle = leaf.color + leaf.opacity + ')';
    
    // Draw minimalist stylized curved leaf silhouette
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size);
    ctx.bezierCurveTo(leaf.size * 0.7, -leaf.size * 0.3, leaf.size * 0.6, leaf.size * 0.5, 0, leaf.size);
    ctx.bezierCurveTo(-leaf.size * 0.6, leaf.size * 0.5, -leaf.size * 0.7, -leaf.size * 0.3, 0, -leaf.size);
    ctx.fill();

    // Subtle central stem vein
    ctx.strokeStyle = leaf.color + (leaf.opacity * 1.5) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -leaf.size * 0.9);
    ctx.lineTo(0, leaf.size * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  function animateLeaves() {
    if (isMotionReduced) {
      ctx.clearRect(0, 0, leavesCanvas.width, leavesCanvas.height);
      return;
    }

    ctx.clearRect(0, 0, leavesCanvas.width, leavesCanvas.height);

    for (var j = 0; j < leaves.length; j++) {
      var l = leaves[j];
      l.y += l.speedY;
      l.x += l.speedX + Math.sin((l.y + l.swayOffset) * 0.008) * 0.45;
      l.rotation += l.rotSpeed;

      // Wrap around top when falling off screen
      if (l.y > leavesCanvas.height + 40) {
        leaves[j] = createLeaf(-30);
      }
      if (l.x < -40) l.x = leavesCanvas.width + 30;
      if (l.x > leavesCanvas.width + 40) l.x = -30;

      drawLeaf(l);
    }

    animFrameId = requestAnimationFrame(animateLeaves);
  }

  animateLeaves();

  /* ========================================================================
     3. ANIMATED NUMBER COUNTERS (For statistics and key metrics)
     ======================================================================== */
  function animateCountersInSlide(slideEl) {
    if (isMotionReduced) return;

    var numElements = slideEl.querySelectorAll('.stat-num, .metric-number, [data-counter]');
    numElements.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-target') || el.textContent.replace(/[^\d.]/g, ''));
      if (isNaN(target)) return;

      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var startTime = null;
      var duration = 1200;

      function step(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        // easeOutQuad
        var current = Math.floor(target * (1 - (1 - progress) * (1 - progress)));
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }
      requestAnimationFrame(step);
    });
  }

  /* ========================================================================
     4. SLIDE TRACKING & SECTION NAVIGATION
     ======================================================================== */
  var slides = Array.from(document.querySelectorAll('.slide'));
  var navButtons = document.querySelectorAll('.nav button');
  var progressBar = document.getElementById('progressBar');
  var slideCountEl = document.getElementById('slideCount');
  var totalSlides = slides.length;

  // Map slide index to the 7 sections:
  // 1: Overview, 2-5: EIA, 6-18: Process, 19-23: Green Infrastructure,
  // 24-25 & 28-30: Benefits, 26 & 31: Case Study, 32-40: Q&A
  function getSectionKey(slideNum) {
    if (slideNum === 1) return 'overview';
    if (slideNum >= 2 && slideNum <= 5) return 'eia';
    if (slideNum >= 6 && slideNum <= 18) return 'process';
    if (slideNum >= 19 && slideNum <= 23) return 'gi';
    if (slideNum === 26 || slideNum === 31) return 'casestudy';
    if ((slideNum >= 24 && slideNum <= 25) || (slideNum >= 27 && slideNum <= 30)) return 'benefits';
    if (slideNum >= 32 && slideNum <= 40) return 'qa';
    return 'overview';
  }

  function updateNavigation(activeSlide) {
    if (!activeSlide) return;
    var slideNum = parseInt(activeSlide.getAttribute('data-slide') || '1', 10);

    // Update Counter (01 / 41)
    if (slideCountEl) {
      var numStr = (slideNum < 10 ? '0' : '') + slideNum;
      var totalStr = (totalSlides < 10 ? '0' : '') + totalSlides;
      slideCountEl.textContent = numStr + ' / ' + totalStr;
    }

    // Update Progress Bar
    if (progressBar) {
      var pct = ((slideNum - 1) / Math.max(1, totalSlides - 1)) * 100;
      progressBar.style.width = pct + '%';
    }

    // Update active nav button
    var activeSecKey = getSectionKey(slideNum);
    navButtons.forEach(function (btn) {
      var jumpKey = btn.getAttribute('data-section-jump');
      var isActive = (jumpKey === activeSecKey);
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Trigger number counter animation
    animateCountersInSlide(activeSlide);
  }

  // Section button click handler
  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetGo = btn.getAttribute('data-go');
      if (targetGo) {
        var targetSlide = document.getElementById('slide-' + targetGo);
        if (targetSlide) {
          targetSlide.scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
        }
      }
    });
  });

  // IntersectionObserver to detect active slide smoothly
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        slides.forEach(function (s) { s.classList.remove('active'); });
        entry.target.classList.add('active');
        updateNavigation(entry.target);
      }
    });
  }, { threshold: 0.45 });

  slides.forEach(function (s) {
    observer.observe(s);
  });

  // Initial trigger for first slide
  var initialSlide = document.querySelector('.slide.active') || slides[0];
  if (initialSlide) {
    initialSlide.classList.add('active');
    updateNavigation(initialSlide);
  }

  /* ========================================================================
     5. HERO SLIDE "START" BUTTON
     ======================================================================== */
  var heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function () {
      var slide2 = document.getElementById('slide-2');
      if (slide2) {
        slide2.scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
      }
    });
  }

  /* ========================================================================
     6. KEYBOARD NAVIGATION
     ======================================================================== */
  window.addEventListener('keydown', function (e) {
    // Avoid interfering with inputs/search
    if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) !== -1) return;

    var currentActive = document.querySelector('.slide.active') || slides[0];
    var currentIndex = slides.indexOf(currentActive);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      if (currentIndex < slides.length - 1) {
        e.preventDefault();
        slides[currentIndex + 1].scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentIndex > 0) {
        e.preventDefault();
        slides[currentIndex - 1].scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      slides[0].scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      slides[slides.length - 1].scrollIntoView({ behavior: isMotionReduced ? 'auto' : 'smooth' });
    }
  });

})();

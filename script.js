/* =========================================================
   EIA x Green Infrastructure — Extra Animations (script.js)
   NEW: Morphing Blobs, Glitch, Starfield, Neon Cursor Trail,
        3D Card Flip, Wave Surface, Matrix Rain, Gradient Shift
   ========================================================= */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. MORPHING LIQUID BLOBS
  ══════════════════════════════════════════ */
  for (var bi = 0; bi < 3; bi++) {
    var blob = document.createElement('div');
    blob.className = 'liquid-blob';
    document.body.insertBefore(blob, document.body.firstChild);
  }

  /* ══════════════════════════════════════════
     2. STARFIELD — 120 twinkling stars
  ══════════════════════════════════════════ */
  var starFrag = document.createDocumentFragment();
  for (var si = 0; si < 120; si++) {
    var star = document.createElement('div');
    star.className = 'star';
    var sz = 0.5 + Math.random() * 2.5;
    star.style.cssText = [
      'width:' + sz + 'px',
      'height:' + sz + 'px',
      'left:' + Math.random() * 100 + 'vw',
      'top:' + Math.random() * 100 + 'vh',
      'animation-duration:' + (2 + Math.random() * 5) + 's,' + (8 + Math.random() * 12) + 's',
      'animation-delay:-' + (Math.random() * 5) + 's,-' + (Math.random() * 10) + 's',
      'opacity:' + (0.1 + Math.random() * 0.5)
    ].join(';');
    starFrag.appendChild(star);
  }
  document.body.insertBefore(starFrag, document.body.firstChild);

  /* ══════════════════════════════════════════
     3. MATRIX RAIN CANVAS
  ══════════════════════════════════════════ */
  var matCanvas = document.createElement('canvas');
  matCanvas.id = 'matrix-canvas';
  document.body.insertBefore(matCanvas, document.body.firstChild);

  function initMatrix() {
    var ctx = matCanvas.getContext('2d');
    matCanvas.width  = window.innerWidth;
    matCanvas.height = window.innerHeight;

    var cols   = Math.floor(matCanvas.width / 16);
    var drops  = [];
    for (var di = 0; di < cols; di++) drops[di] = Math.random() * -50;

    var chars  = 'エイアグリーンインフラEIAGREEN0123456789アイウエオ';

    function draw() {
      ctx.fillStyle = 'rgba(5,15,10,0.05)';
      ctx.fillRect(0, 0, matCanvas.width, matCanvas.height);
      ctx.font = '13px monospace';

      for (var ci = 0; ci < drops.length; ci++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        /* gradient: bright head, dim tail */
        var y = drops[ci] * 16;
        ctx.fillStyle = drops[ci] > 2 ? 'rgba(93,228,168,0.7)' : 'rgba(180,255,220,0.95)';
        ctx.fillText(ch, ci * 16, y);
        if (y > matCanvas.height && Math.random() > 0.975) drops[ci] = 0;
        drops[ci] += 0.4;
      }
    }
    return setInterval(draw, 50);
  }

  var matrixInterval = initMatrix();
  window.addEventListener('resize', function () {
    clearInterval(matrixInterval);
    matrixInterval = initMatrix();
  });

  /* ══════════════════════════════════════════
     4. NEON CURSOR TRAIL
  ══════════════════════════════════════════ */
  var trailColors = ['#5de4a8','#a8f0d0','#e8894a','#ffb380','#6effc7','#b0c4f0'];
  var trailCount  = 0;

  document.addEventListener('mousemove', function (e) {
    trailCount++;
    if (trailCount % 3 !== 0) return; /* every 3rd move = smoother perf */

    var dot = document.createElement('div');
    dot.className = 'cursor-trail';
    var size  = 6 + Math.random() * 10;
    var color = trailColors[Math.floor(Math.random() * trailColors.length)];
    dot.style.cssText = [
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + (e.clientX - size / 2) + 'px',
      'top:' + (e.clientY - size / 2) + 'px',
      'background:' + color,
      'box-shadow: 0 0 ' + (size * 2) + 'px ' + color + ', 0 0 ' + (size * 4) + 'px ' + color + '44'
    ].join(';');
    document.body.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 600);
  });

  /* ══════════════════════════════════════════
     5. WAVE BOTTOM BAR (animated)
  ══════════════════════════════════════════ */
  var waveBar = document.createElement('div');
  waveBar.className = 'wave-bar';
  document.body.appendChild(waveBar);

  /* WAVE SVG CANVAS at bottom */
  var waveCanvas = document.createElement('canvas');
  waveCanvas.className = 'wave-canvas';
  document.body.appendChild(waveCanvas);

  function initWave() {
    var wctx  = waveCanvas.getContext('2d');
    waveCanvas.width  = window.innerWidth;
    waveCanvas.height = 120;
    var offset = 0;

    function drawWave() {
      wctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

      /* Three layered waves */
      [[0.018, 28, '#5de4a8', 0.35], [0.012, 20, '#a8f0d0', 0.22], [0.025, 14, '#e8894a', 0.18]]
        .forEach(function (cfg, wi) {
          wctx.beginPath();
          wctx.moveTo(0, waveCanvas.height);
          for (var x = 0; x <= waveCanvas.width; x += 2) {
            var y = waveCanvas.height - cfg[1] - Math.sin((x * cfg[0]) + offset + wi * 1.2) * cfg[1];
            wctx.lineTo(x, y);
          }
          wctx.lineTo(waveCanvas.width, waveCanvas.height);
          wctx.closePath();
          wctx.fillStyle = cfg[2];
          wctx.globalAlpha = cfg[3];
          wctx.fill();
          wctx.globalAlpha = 1;
        });

      offset += 0.03;
      requestAnimationFrame(drawWave);
    }
    drawWave();
  }
  initWave();
  window.addEventListener('resize', function () {
    waveCanvas.width = window.innerWidth;
  });

  /* ══════════════════════════════════════════
     6. GLITCH — add data-text attr to brand
  ══════════════════════════════════════════ */
  var brandDiv = document.querySelector('.brand > div');
  if (brandDiv) {
    var originalText = brandDiv.childNodes[0]
      ? brandDiv.childNodes[0].textContent.trim()
      : 'EIA × Green Infrastructure';
    brandDiv.setAttribute('data-text', originalText);
  }

  /* Occasional full-page glitch flash */
  function triggerGlitch() {
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9998', 'pointer-events:none',
      'background:rgba(93,228,168,0.04)',
      'animation:none',
      'transform:translateX(' + (Math.random() > 0.5 ? 3 : -3) + 'px)'
    ].join(';');
    document.body.appendChild(overlay);
    setTimeout(function () { overlay.remove(); }, 80);

    /* Chromatic aberration flash */
    document.body.style.filter = 'hue-rotate(' + (Math.random() * 30 - 15) + 'deg) brightness(1.05)';
    setTimeout(function () { document.body.style.filter = ''; }, 100);
  }
  /* Trigger glitch randomly every 8-20s */
  function scheduleGlitch() {
    var delay = 8000 + Math.random() * 12000;
    setTimeout(function () { triggerGlitch(); scheduleGlitch(); }, delay);
  }
  scheduleGlitch();

  /* ══════════════════════════════════════════
     7. 3D CARD FLIP — enhanced tilt on mouse
  ══════════════════════════════════════════ */
  document.querySelectorAll('.slide').forEach(function (slide) {
    var shell = slide.querySelector('.slide-shell');
    if (!shell) return;

    slide.addEventListener('mousemove', function (e) {
      if (!slide.classList.contains('active')) return;
      var r   = slide.getBoundingClientRect();
      var dx  = (e.clientX - r.left - r.width / 2)  / (r.width / 2);
      var dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      shell.style.transform = 'perspective(1200px) rotateX(' + (-dy * 5) + 'deg) rotateY(' + (dx * 5) + 'deg)';
      var card = shell.querySelector('.slide-card');
      if (card) {
        card.style.transform = 'perspective(900px) rotateX(' + (-dy * 3) + 'deg) rotateY(' + (dx * 3) + 'deg) translateZ(20px)';
        card.style.boxShadow = '0 ' + (40 + dy * 20) + 'px 100px rgba(0,0,0,.7), 0 0 40px rgba(93,228,168,' + (0.1 + Math.abs(dx) * 0.15) + ')';
      }
    });
    slide.addEventListener('mouseleave', function () {
      shell.style.transform = '';
      var card = shell.querySelector('.slide-card');
      if (card) { card.style.transform = ''; card.style.boxShadow = ''; }
    });
  });

  /* ══════════════════════════════════════════
     8. GRADIENT COLOR SHIFT — section-aware
  ══════════════════════════════════════════ */
  var sectionGradients = {
    eia:     'linear-gradient(135deg, #050f0a 0%, #0a2a18 40%, #071811 80%, #050f0a 100%)',
    gi:      'linear-gradient(135deg, #040e08 0%, #083318 40%, #0a2010 80%, #040e08 100%)',
    qa:      'linear-gradient(135deg, #0f0905 0%, #2a1408 40%, #180a04 80%, #0f0905 100%)',
    sources: 'linear-gradient(135deg, #060810 0%, #0c1030 40%, #080c20 80%, #060810 100%)'
  };

  var slideEls = document.querySelectorAll('.slide');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        var sec = entry.target.dataset.section;
        if (sec && sectionGradients[sec]) {
          document.body.style.transition = 'background 1.2s ease';
          document.body.style.background = sectionGradients[sec];
        }
        /* Update wave color */
        var waveColors = { eia:'#5de4a8', gi:'#2ad991', qa:'#e8894a', sources:'#6489dc' };
        if (waveBar && waveColors[sec]) {
          waveBar.style.background = 'linear-gradient(90deg,transparent,' + waveColors[sec] + ',transparent)';
        }
      }
    });
  }, { threshold: 0.5 });

  slideEls.forEach(function (s) { io.observe(s); });

})();

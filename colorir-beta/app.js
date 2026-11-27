/* Colorir e Desenhar — app para crianças. Sem rede, sem dados, sem links. */
(function () {
  'use strict';
  var W = 1200, H = 900;
  var COLORS = ['#FF3B30', '#FF9500', '#FFD60A', '#7ED957', '#1E9E4A', '#20C9C9',
                '#1E88FF', '#8E5CF0', '#FF6FB5', '#8B5A2B', '#222222', '#FFFFFF'];
  var NOTES = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175];
  var SIZES = [14, 30, 56];
  var UNDO_MAX = 12;

  function $(id) { return document.getElementById(id); }
  var screens = { home: $('home'), gallery: $('gallery'), editor: $('editor') };
  function show(name) { for (var k in screens) screens[k].hidden = (k !== name); if (name === 'editor') fit(); }

  var paint = $('paint'), lines = $('lines'), stage = $('stage'), area = $('area');
  var pctx = paint.getContext('2d', { willReadFrequently: true });
  var lctx = lines.getContext('2d');

  var mode = 'draw';          // 'draw' (livre) ou 'color' (página)
  var tool = 'brush';
  var colorIdx = 0;
  var sizeIdx = 1;
  var muted = false;
  var lineAlpha = null;       // contornos da página (Uint8Array) ou null
  var pageId = 'livre';
  var undoStack = [];
  var memory = {};            // guarda o trabalho enquanto o app está aberto (só na memória)

  /* ---------- sons leves ---------- */
  var actx = null;
  function audio() {
    if (muted) return null;
    if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(f, dur, type, vol, delay, to) {
    var a = audio(); if (!a) return;
    var t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  var snd = {
    tap: function () { tone(660, 0.07, 'sine', 0.12); },
    color: function (i) { tone(NOTES[i], 0.18, 'triangle', 0.18); },
    fill: function (i) { tone(NOTES[i] / 2, 0.12, 'sine', 0.2, 0, NOTES[i]); tone(NOTES[i], 0.22, 'triangle', 0.15, 0.08); },
    undo: function () { tone(500, 0.12, 'sine', 0.14, 0, 300); },
    clear: function () { tone(700, 0.3, 'sawtooth', 0.05, 0, 120); },
    save: function () { tone(523, 0.12, 'triangle', 0.18); tone(659, 0.12, 'triangle', 0.18, 0.1); tone(784, 0.25, 'triangle', 0.18, 0.2); }
  };

  /* ---------- paleta e botões ---------- */
  var palette = $('palette');
  COLORS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'sw'; b.style.background = c; b.setAttribute('aria-label', 'Cor ' + (i + 1));
    b.addEventListener('click', function () {
      colorIdx = i; if (tool === 'eraser') setTool(mode === 'color' ? 'bucket' : 'brush');
      refreshUI(); snd.color(i);
    });
    palette.appendChild(b);
  });
  var swatches = palette.children;

  function setTool(t) { tool = t; refreshUI(); }
  function refreshUI() {
    for (var i = 0; i < swatches.length; i++) swatches[i].classList.toggle('on', i === colorIdx && tool !== 'eraser');
    $('bBrush').classList.toggle('on', tool === 'brush');
    $('bBucket').classList.toggle('on', tool === 'bucket');
    $('bEraser').classList.toggle('on', tool === 'eraser');
    $('bBucket').hidden = (mode !== 'color');
    var d = $('sizeDot'), px = [14, 26, 42][sizeIdx];
    d.style.width = d.style.height = px + 'px';
    d.style.background = COLORS[colorIdx] === '#FFFFFF' ? '#bbb' : COLORS[colorIdx];
    $('bSound').textContent = muted ? '🔇' : '🔊';
  }

  /* ---------- tamanho do desenho na tela (sempre 4:3) ---------- */
  function fit() {
    var r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var pad = 12, w = r.width - pad, h = r.height - pad, k = Math.min(w / 4, h / 3);
    stage.style.width = Math.floor(k * 4) + 'px';
    stage.style.height = Math.floor(k * 3) + 'px';
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 150); });

  /* ---------- desfazer ---------- */
  function snapshot() {
    undoStack.push(pctx.getImageData(0, 0, W, H));
    if (undoStack.length > UNDO_MAX) undoStack.shift();
  }
  function undo() {
    var s = undoStack.pop();
    if (s) { pctx.putImageData(s, 0, 0); snd.undo(); }
  }

  /* ---------- desenhar com o dedo ---------- */
  var drawing = false, lx = 0, ly = 0, mx = 0, my = 0;
  function pos(e) {
    var r = paint.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }
  function strokeStyle() {
    var er = tool === 'eraser';
    pctx.globalCompositeOperation = er ? 'destination-out' : 'source-over';
    pctx.strokeStyle = pctx.fillStyle = COLORS[colorIdx];
    pctx.lineWidth = SIZES[sizeIdx] * (er ? 1.6 : 1);
    pctx.lineCap = pctx.lineJoin = 'round';
  }
  stage.addEventListener('pointerdown', function (e) {
    if (!e.isPrimary || drawing) return;
    e.preventDefault();
    var p = pos(e);
    if (tool === 'bucket') {
      snapshot();
      if (bucket(p[0], p[1], COLORS[colorIdx])) snd.fill(colorIdx); else undoStack.pop();
      return;
    }
    snapshot();
    drawing = true; stage.setPointerCapture(e.pointerId);
    strokeStyle();
    lx = mx = p[0]; ly = my = p[1];
    pctx.beginPath(); pctx.arc(lx, ly, pctx.lineWidth / 2, 0, Math.PI * 2); pctx.fill();
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drawing || !e.isPrimary) return;
    e.preventDefault();
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (!evs.length) evs = [e];
    strokeStyle();
    evs.forEach(function (ev) {
      var p = pos(ev), cx = (lx + p[0]) / 2, cy = (ly + p[1]) / 2;
      pctx.beginPath(); pctx.moveTo(mx, my); pctx.quadraticCurveTo(lx, ly, cx, cy); pctx.stroke();
      mx = cx; my = cy; lx = p[0]; ly = p[1];
    });
  });
  function endStroke(e) {
    if (!drawing) return;
    drawing = false;
    pctx.beginPath(); pctx.moveTo(mx, my); pctx.lineTo(lx, ly); pctx.stroke();
    pctx.globalCompositeOperation = 'source-over';
  }
  stage.addEventListener('pointerup', endStroke);
  stage.addEventListener('pointercancel', endStroke);
  stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ---------- balde (preenchimento) ---------- */
  var THRESH = 25;
  function hexToU32(h) {
    var n = parseInt(h.slice(1), 16);
    return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; // ABGR (little-endian RGBA)
  }
  function bucket(x, y, hex) {
    if (!lineAlpha) return false;
    x = Math.max(0, Math.min(W - 1, Math.round(x))); y = Math.max(0, Math.min(H - 1, Math.round(y)));
    var la = lineAlpha, seed = y * W + x;
    if (la[seed] > THRESH) {          // tocou em cima do traço: procura vizinho livre
      seed = -1;
      for (var rad = 1; rad <= 10 && seed < 0; rad++)
        for (var dy = -rad; dy <= rad && seed < 0; dy++)
          for (var dx = -rad; dx <= rad; dx++) {
            var nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            if (la[ny * W + nx] <= THRESH) { seed = ny * W + nx; break; }
          }
      if (seed < 0) return false;
    }
    var img = pctx.getImageData(0, 0, W, H), buf = new Uint32Array(img.data.buffer), col = hexToU32(hex);
    var vis = new Uint8Array(W * H), stack = [seed];
    while (stack.length) {
      var p = stack.pop();
      if (vis[p] || la[p] > THRESH) continue;
      var row = p - (p % W), px = p - row, l = px, r = px;
      while (l > 0 && !vis[row + l - 1] && la[row + l - 1] <= THRESH) l--;
      while (r < W - 1 && !vis[row + r + 1] && la[row + r + 1] <= THRESH) r++;
      for (var i = l; i <= r; i++) { vis[row + i] = 1; buf[row + i] = col; }
      for (var d = -1; d <= 1; d += 2) {
        var nr = row + d * W; if (nr < 0 || nr >= W * H) continue;
        var inSpan = false;
        for (var j = l; j <= r; j++) {
          var blocked = vis[nr + j] || la[nr + j] > THRESH;
          if (!blocked && !inSpan) { stack.push(nr + j); inSpan = true; } else if (blocked) inSpan = false;
        }
      }
    }
    pctx.putImageData(img, 0, 0);
    return true;
  }

  /* ---------- páginas ---------- */
  function svgUrl(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  function setLines(page, done) {
    lctx.clearRect(0, 0, W, H);
    if (!page) { lineAlpha = null; done && done(); return; }
    var img = new Image();
    img.onload = function () {
      var t = document.createElement('canvas'); t.width = W; t.height = H;
      var c = t.getContext('2d', { willReadFrequently: true });
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.drawImage(img, 0, 0, W, H);
      var src = c.getImageData(0, 0, W, H).data, out = lctx.createImageData(W, H), a = new Uint8Array(W * H);
      for (var i = 0, n = W * H; i < n; i++) {
        var v = 255 - src[i * 4]; a[i] = v; out.data[i * 4 + 3] = v;   // preto com transparência
      }
      lctx.putImageData(out, 0, 0); lineAlpha = a; done && done();
    };
    img.src = svgUrl(page.svg);
  }

  function leaveEditor() { memory[pageId] = pctx.getImageData(0, 0, W, H); }
  function openEditor(m, page) {
    mode = m; pageId = page ? page.id : 'livre'; undoStack = [];
    pctx.clearRect(0, 0, W, H);
    if (memory[pageId]) pctx.putImageData(memory[pageId], 0, 0);
    tool = (m === 'color') ? 'bucket' : 'brush';
    refreshUI(); show('editor');
    setLines(page);
  }

  var grid = $('grid');
  window.PAGES.forEach(function (p) {
    var b = document.createElement('button'), im = new Image();
    b.className = 'card'; b.setAttribute('aria-label', p.nome);
    im.src = svgUrl(p.svg); im.alt = '';
    b.appendChild(im);
    b.addEventListener('click', function () { snd.tap(); openEditor('color', p); });
    grid.appendChild(b);
  });

  /* ---------- botões ---------- */
  $('goDraw').addEventListener('click', function () { snd.tap(); openEditor('draw', null); });
  $('goColor').addEventListener('click', function () { snd.tap(); show('gallery'); });
  $('galBack').addEventListener('click', function () { snd.tap(); show('home'); });
  $('bBack').addEventListener('click', function () { snd.tap(); leaveEditor(); show(mode === 'color' ? 'gallery' : 'home'); });
  $('bBrush').addEventListener('click', function () { snd.tap(); setTool('brush'); });
  $('bBucket').addEventListener('click', function () { snd.tap(); setTool('bucket'); });
  $('bEraser').addEventListener('click', function () { snd.tap(); setTool('eraser'); });
  $('bSize').addEventListener('click', function () { sizeIdx = (sizeIdx + 1) % 3; snd.tap(); refreshUI(); });
  $('bUndo').addEventListener('click', undo);
  $('bClear').addEventListener('click', function () { snapshot(); pctx.clearRect(0, 0, W, H); snd.clear(); });
  $('bSound').addEventListener('click', function () { muted = !muted; refreshUI(); snd.tap(); });

  /* ---------- salvar imagem ---------- */
  function toast() {
    var t = $('toast'); t.hidden = true; void t.offsetWidth; t.hidden = false;
    setTimeout(function () { t.hidden = true; }, 1000);
  }
  $('bSave').addEventListener('click', function () {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(paint, 0, 0); x.drawImage(lines, 0, 0);
    snd.save();
    c.toBlob(function (blob) {
      if (!blob) return;
      var file = null;
      try { file = new File([blob], 'meu-desenho.png', { type: 'image/png' }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).then(toast, function () {});
        return;
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'meu-desenho.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      toast();
    }, 'image/png');
  });

  /* ---------- instalar como app (funciona quando aberto por http/https) ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  refreshUI();
  window.__mm = { bucket: bucket };  // ajuda de teste
})();

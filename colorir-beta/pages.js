/* Páginas para colorir: desenhos em SVG feitos à mão (viewBox 400x300).
   Para criar uma nova página, copie um bloco "add(...)" e mude o desenho.
   Regra: contornos pretos grossos, formas com preenchimento branco. */
(function () {
  var P = [];

  function wrap(b) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="1200" height="900">' +
      '<rect width="400" height="300" fill="#fff" stroke="none"/>' +
      '<g fill="#fff" stroke="#000" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' + b + '</g></svg>';
  }
  function add(id, nome, body) { P.push({ id: id, nome: nome, svg: wrap(body) }); }

  // Patinho (herói do canal, com o raio no peito)
  add('patinho', 'Patinho',
    '<path d="M300 185 L345 150 L335 205 Z"/>' +
    '<path d="M165 255 L145 287 L200 287 Z"/><path d="M225 255 L205 287 L260 287 Z"/>' +
    '<ellipse cx="205" cy="195" rx="100" ry="68"/>' +
    '<path d="M165 190 Q205 140 250 195 Q210 238 165 190 Z"/>' +
    '<path d="M135 172 L118 204 L132 204 L124 228 L150 196 L136 196 Z"/>' +
    '<circle cx="165" cy="100" r="55"/>' +
    '<path d="M115 95 Q70 90 72 112 Q85 128 122 118 Z"/>' +
    '<circle cx="150" cy="82" r="8" fill="#000"/>' +
    '<path d="M162 46 Q152 18 178 28" fill="none"/>');

  // Pintinho
  add('pintinho', 'Pintinho',
    '<path d="M175 268 L175 288 M160 290 L175 288 L190 290" fill="none"/>' +
    '<path d="M225 268 L225 288 M210 290 L225 288 L240 290" fill="none"/>' +
    '<circle cx="200" cy="165" r="105"/>' +
    '<path d="M98 160 Q58 180 82 225 Q115 218 118 185 Z"/>' +
    '<path d="M302 160 Q342 180 318 225 Q285 218 282 185 Z"/>' +
    '<circle cx="165" cy="140" r="9" fill="#000"/><circle cx="235" cy="140" r="9" fill="#000"/>' +
    '<circle cx="138" cy="178" r="14"/><circle cx="262" cy="178" r="14"/>' +
    '<path d="M183 160 L217 160 L200 190 Z"/>' +
    '<path d="M200 62 Q188 32 175 42 M200 62 Q206 28 222 38" fill="none"/>');

  // Vaquinha
  add('vaca', 'Vaquinha',
    '<ellipse cx="95" cy="112" rx="42" ry="20" transform="rotate(-20 95 112)"/>' +
    '<ellipse cx="305" cy="112" rx="42" ry="20" transform="rotate(20 305 112)"/>' +
    '<path d="M150 75 Q132 30 160 36 Q168 56 172 72 Z"/><path d="M250 75 Q268 30 240 36 Q232 56 228 72 Z"/>' +
    '<ellipse cx="200" cy="150" rx="92" ry="88"/>' +
    '<path d="M138 82 Q172 66 178 98 Q165 122 135 108 Z"/>' +
    '<ellipse cx="200" cy="208" rx="58" ry="42"/>' +
    '<circle cx="180" cy="208" r="7" fill="#000"/><circle cx="220" cy="208" r="7" fill="#000"/>' +
    '<circle cx="162" cy="135" r="9" fill="#000"/><circle cx="238" cy="135" r="9" fill="#000"/>');

  // Porquinho
  add('porquinho', 'Porquinho',
    '<path d="M125 88 L105 30 L168 62 Z"/><path d="M275 88 L295 30 L232 62 Z"/>' +
    '<circle cx="200" cy="158" r="105"/>' +
    '<circle cx="120" cy="185" r="15"/><circle cx="280" cy="185" r="15"/>' +
    '<ellipse cx="200" cy="190" rx="52" ry="38"/>' +
    '<ellipse cx="183" cy="190" rx="7" ry="12" fill="#000"/><ellipse cx="217" cy="190" rx="7" ry="12" fill="#000"/>' +
    '<circle cx="152" cy="135" r="9" fill="#000"/><circle cx="248" cy="135" r="9" fill="#000"/>' +
    '<path d="M168 242 Q200 262 232 242" fill="none"/>');

  // Ovelhinha
  var wool = [[170, 130, 50], [225, 105, 52], [280, 130, 48], [300, 180, 45], [255, 215, 50], [190, 210, 50], [235, 160, 60]];
  var w1 = '', w2 = '';
  wool.forEach(function (c) {
    w1 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
    w2 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
  });
  add('ovelha', 'Ovelhinha',
    '<rect x="185" y="240" width="22" height="48" rx="8"/><rect x="265" y="240" width="22" height="48" rx="8"/>' +
    '<g stroke-width="10">' + w1 + '</g><g stroke="none">' + w2 + '</g>' +
    '<ellipse cx="68" cy="152" rx="26" ry="14" transform="rotate(30 68 152)"/>' +
    '<ellipse cx="100" cy="178" rx="38" ry="46"/>' +
    '<circle cx="100" cy="128" r="22"/>' +
    '<circle cx="86" cy="168" r="7" fill="#000"/>' +
    '<ellipse cx="78" cy="198" rx="9" ry="6" fill="#000"/>');

  // Flor
  var petals = '';
  for (var i = 0; i < 8; i++) {
    petals += '<ellipse cx="200" cy="57" rx="24" ry="42" transform="rotate(' + (i * 45) + ' 200 105)"/>';
  }
  add('flor', 'Flor',
    '<path d="M40 70 Q40 40 70 45 Q85 20 115 40 Q145 35 145 65 Q145 80 125 80 L55 80 Q40 80 40 70 Z"/>' +
    '<path d="M192 140 L192 295 L208 295 L208 140 Z"/>' +
    '<path d="M208 245 Q275 205 295 245 Q255 278 208 245 Z"/>' +
    '<path d="M192 225 Q125 185 105 225 Q145 258 192 225 Z"/>' +
    petals + '<circle cx="200" cy="105" r="32"/>');

  // Casinha
  add('casa', 'Casinha',
    '<circle cx="355" cy="40" r="24"/>' +
    '<rect x="270" y="55" width="32" height="70"/>' +
    '<rect x="90" y="140" width="220" height="150"/>' +
    '<path d="M68 145 L200 38 L332 145 Z"/>' +
    '<rect x="175" y="205" width="50" height="85" rx="6"/><circle cx="212" cy="250" r="5" fill="#000"/>' +
    '<rect x="110" y="170" width="45" height="45"/><path d="M132 170 L132 215 M110 192 L155 192" fill="none"/>' +
    '<rect x="245" y="170" width="45" height="45"/><path d="M267 170 L267 215 M245 192 L290 192" fill="none"/>' +
    '<path d="M15 292 L385 292" fill="none"/>');

  // Carrinho
  add('carro', 'Carrinho',
    '<path d="M10 268 L390 268" fill="none"/>' +
    '<path d="M40 210 L40 170 Q40 155 60 152 L105 150 L140 105 Q148 95 165 95 L255 95 Q272 95 282 108 L312 150 L345 155 Q365 160 365 180 L365 210 Q365 222 350 222 L50 222 Q40 222 40 210 Z"/>' +
    '<path d="M122 150 L148 110 L195 110 L195 150 Z"/><path d="M210 110 L255 110 L285 150 L210 150 Z"/>' +
    '<path d="M215 178 L242 178" fill="none"/>' +
    '<circle cx="350" cy="188" r="10"/>' +
    '<circle cx="115" cy="225" r="34"/><circle cx="115" cy="225" r="13"/>' +
    '<circle cx="290" cy="225" r="34"/><circle cx="290" cy="225" r="13"/>');

  // Estrela com carinha
  function star(cx, cy, R, r) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<path d="M' + pts.join(' L') + ' Z"/>';
  }
  add('estrela', 'Estrela',
    star(60, 60, 34, 15) + star(345, 70, 30, 13) + star(335, 245, 34, 15) + star(55, 235, 28, 12) +
    star(200, 155, 125, 55) +
    '<circle cx="170" cy="145" r="9" fill="#000"/><circle cx="230" cy="145" r="9" fill="#000"/>' +
    '<path d="M170 180 Q200 210 230 180" fill="none"/>');

  window.PAGES = P;
})();

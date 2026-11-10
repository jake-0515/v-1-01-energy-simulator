/* 코랩 ColabTurtle 미리보기 — 브라우저 안에서 같은 규칙으로 그려 봅니다.
   규칙: 화면 가운데에서 위쪽을 바라보며 시작 · 배경 검정 · 기본 펜 흰색, 굵기 4
   left(각도)는 시계 반대 방향 회전 · forward(거리)는 픽셀 단위 이동 */
(function () {
  const COLORS = { red:'#ff0000', purple:'#800080', blue:'#0000ff', green:'#008000', orange:'#ffa500', yellow:'#ffff00', cyan:'#00ffff', magenta:'#ff00ff', white:'#ffffff', pink:'#ffc0cb', lime:'#00ff00', violet:'#ee82ee', gold:'#ffd700', skyblue:'#87ceeb', brown:'#a52a2a', gray:'#808080', navy:'#000080', black:'#000000', indigo:'#4b0082', teal:'#008080', coral:'#ff7f50', salmon:'#fa8072', turquoise:'#40e0d0', tomato:'#ff6347' };

  /* 명령 기록기: 파이썬 코드와 같은 순서로 부르면 그릴 선분 목록이 만들어집니다 */
  function Recorder(w, h) {
    this.w = w; this.h = h; this.x = 0; this.y = 0; this.heading = 90; this.color = 'white'; this.size = 4; this.segs = [];
  }
  Recorder.prototype.pencolor = function (c) { this.color = c; return this; };
  Recorder.prototype.width = function (n) { this.size = n; return this; };
  Recorder.prototype.left = function (a) { this.heading = (this.heading + a) % 360; return this; };
  Recorder.prototype.right = function (a) { this.heading = (this.heading - a + 360) % 360; return this; };
  Recorder.prototype.forward = function (d) {
    const r = this.heading * Math.PI / 180;
    const nx = this.x + d * Math.cos(r), ny = this.y + d * Math.sin(r);
    this.segs.push({ x1:this.x, y1:this.y, x2:nx, y2:ny, c:this.color, w:this.size, hd:this.heading });
    this.x = nx; this.y = ny; return this;
  };

  function TurtleView(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.raf = null;
  }
  TurtleView.prototype.draw = function (rec, opt) {
    opt = opt || {};
    cancelAnimationFrame(this.raf);
    const cv = this.cv, ctx = this.ctx;
    cv.width = rec.w; cv.height = rec.h;
    const cx = rec.w / 2, cy = rec.h / 2;
    const segs = rec.segs;
    const per = opt.animate === false ? segs.length : Math.max(1, Math.ceil(segs.length / (opt.frames || 90)));
    let n = 0;
    const self = this;
    function bg() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, rec.w, rec.h); }
    function seg(s) {
      ctx.strokeStyle = COLORS[s.c] || s.c; ctx.lineWidth = s.w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + s.x1, cy - s.y1); ctx.lineTo(cx + s.x2, cy - s.y2); ctx.stroke();
    }
    function turtle(x, y, hd) {
      const r = hd * Math.PI / 180, L = Math.max(10, rec.w / 45);
      const px = cx + x, py = cy - y;
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + L * Math.cos(r), py - L * Math.sin(r));
      ctx.lineTo(px + L * .6 * Math.cos(r + 2.5), py - L * .6 * Math.sin(r + 2.5));
      ctx.lineTo(px + L * .6 * Math.cos(r - 2.5), py - L * .6 * Math.sin(r - 2.5));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    bg();
    function step() {
      const end = Math.min(segs.length, n + per);
      for (; n < end; n++) seg(segs[n]);
      if (n < segs.length) self.raf = requestAnimationFrame(step);
      else { if (opt.showTurtle !== false) turtle(rec.x, rec.y, rec.heading); if (opt.done) opt.done(); }
    }
    if (!segs.length) { if (opt.showTurtle !== false) turtle(0, 0, rec.heading); return; }
    step();
  };

  window.Turtle = { Recorder, TurtleView, COLORS };
})();

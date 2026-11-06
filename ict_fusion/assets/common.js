/* 정보 통신 기술과 융합 — 공통 기능
   - 자기점검(학습 전/후) 저장과 비교
   - 서술형 기록 저장
   - 분류 게임 / 선택형 문제 / 순서 게임 / 짝 맞추기 / 예측 상자
   - 코드 복사 버튼과 색 입히기
   기록은 이 브라우저(localStorage)에만 저장됩니다. */
(function () {
  const PAGE = (document.body && document.body.dataset.page) || location.pathname.split('/').pop() || 'page';
  const KEY = k => 'ictf:' + PAGE + ':' + k;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY(k)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY(k), JSON.stringify(v)); } catch (e) {} },
    getRaw(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    setRaw(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

  /* ---------- 메타인지 기록: 예측 적중, 첫 시도 정답 ---------- */
  const meta = { predTotal:0, predHit:0, firstTotal:0, firstOk:0 };
  function metaUpdate() { const r = $('metaLive'); if (r) r.innerHTML = metaText(); }
  function metaText() {
    const p = meta.predTotal ? `예측 적중 <b>${meta.predHit}/${meta.predTotal}</b>` : '아직 예측 기록 없음';
    const f = meta.firstTotal ? ` · 활동 첫 시도 정답 <b>${meta.firstOk}/${meta.firstTotal}</b>` : '';
    return p + f;
  }

  /* ---------- 학습 전 자기점검 ---------- */
  const LEVELS = ['전혀 모름', '들어봤음', '설명 가능'];
  function initKWL() {
    const sels = document.querySelectorAll('.pre-check');
    const saved = store.get('pre', {});
    sels.forEach((s, i) => {
      if (!s.options.length) s.innerHTML = '<option value="">선택</option>' + LEVELS.map(l => `<option>${l}</option>`).join('');
      if (saved[i]) s.value = saved[i];
      s.addEventListener('change', () => { const o = store.get('pre', {}); o[i] = s.value; store.set('pre', o); });
    });
  }

  /* ---------- 학습 후 자기점검 + 비교 ---------- */
  function initSelfCheck() {
    const boxes = document.querySelectorAll('.sc');
    if (!boxes.length) return;
    const saved = store.get('post', {});
    const prog = $('scProgress');
    const upd = () => {
      const n = [...boxes].filter(b => b.checked).length;
      if (prog) prog.textContent = `체크: ${n} / ${boxes.length}`;
      renderCompare();
    };
    boxes.forEach((b, i) => {
      b.checked = !!saved[i];
      b.addEventListener('change', () => { const o = store.get('post', {}); o[i] = b.checked; store.set('post', o); upd(); });
    });
    upd();
  }
  function renderCompare() {
    const box = $('kwlCompare'); if (!box) return;
    const pre = [...document.querySelectorAll('.pre-check')];
    const boxes = [...document.querySelectorAll('.sc')];
    const preCount = pre.filter(s => s.value === '설명 가능').length;
    const preAns = pre.filter(s => s.value).length;
    const postCount = boxes.filter(b => b.checked).length;
    let html = '<b>🧠 오늘의 메타인지 리포트</b><br>';
    if (preAns) html += `학습 전: ${pre.length}개 항목 중 <b>'설명 가능'</b> ${preCount}개 → 학습 후: ${boxes.length}개 중 <b>${postCount}개</b> 체크<br>`;
    else html += '학습 전 자기점검을 하지 않았어요. 다음 차시에는 먼저 체크해 보세요.<br>';
    html += metaText() + '<br>';
    if (meta.predTotal && meta.predHit / meta.predTotal < 0.5) html += '💡 예측이 자주 빗나갔어요. 빗나간 활동이 바로 <b>새로 알게 된 부분</b>이에요. 그 단계의 설명을 한 번 더 읽어 보세요.';
    else if (meta.predTotal) html += '💡 예측이 잘 맞았어요. 이제 <b>왜 그런지</b>를 친구에게 설명할 수 있는지 확인해 보세요.';
    box.innerHTML = html;
  }

  /* ---------- 서술형 저장 ---------- */
  function saveIq(id) {
    const t = $(id); if (!t) return;
    store.set('iq:' + id, t.value);
    const s = $(id + '-saved'); if (s) s.textContent = '✔ 저장됨 ' + new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' });
  }
  function initIq() {
    document.querySelectorAll('textarea[id]').forEach(t => { const v = store.get('iq:' + t.id, null); if (v !== null) t.value = v; });
    document.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => saveIq(b.dataset.save)));
  }

  /* ---------- 차시 완료 표시 ---------- */
  function markDone() {
    const d = store.getRaw('ictf:done', {}); d[PAGE] = Date.now(); store.setRaw('ictf:done', d);
    const b = $('doneBtn'); if (b) { b.textContent = '✅ 완료 표시됨 — 홈 화면에서 확인할 수 있어요'; b.disabled = true; }
  }
  function initDone() {
    const b = $('doneBtn'); if (!b) return;
    b.addEventListener('click', markDone);
    if (store.getRaw('ictf:done', {})[PAGE]) { b.textContent = '✅ 완료 표시됨'; b.disabled = true; }
  }

  /* ---------- 플립카드 ---------- */
  function initFlips() { document.querySelectorAll('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('on'))); }

  /* ---------- 분류 게임 ---------- */
  function SortGame(root, cfg) {
    if (typeof root === 'string') root = $(root);
    let items, i, score, first;
    root.innerHTML = '';
    const card = el('div', 'sort-card', '<span class="sc-emoji"></span><div class="sc-name"></div><div class="sc-hint"></div>');
    const btns = el('div', 'sort-btns');
    const fb = el('div', 'sort-fb');
    const prog = el('div', 'sort-prog');
    const end = el('div', 'sort-end hidden');
    const reset = el('div', 'center', '<button class="btn-sub">↺ 다시 하기</button>');
    cfg.cats.forEach(c => {
      const b = el('button', 'sort-btn', c.label);
      if (c.color) { b.style.borderColor = c.color; b.style.color = c.color; b.style.background = c.color + '1f'; }
      b.onclick = () => pick(c.k); btns.appendChild(b);
    });
    root.append(card, btns, fb, prog, end, reset);
    reset.querySelector('button').onclick = start;
    function start() {
      items = cfg.shuffle === false ? cfg.items.slice() : shuffle(cfg.items); i = 0; score = 0; first = true;
      card.classList.remove('hidden'); btns.classList.remove('hidden'); end.classList.add('hidden'); show();
    }
    function show() {
      const it = items[i];
      card.querySelector('.sc-emoji').textContent = it.e || '❓';
      card.querySelector('.sc-name').innerHTML = it.t;
      card.querySelector('.sc-hint').innerHTML = it.hint || '';
      fb.className = 'sort-fb'; fb.innerHTML = '';
      prog.textContent = `${i + 1} / ${items.length}  ·  맞힘 ${score}`;
      btns.querySelectorAll('button').forEach(b => b.disabled = false);
      first = true;
    }
    function pick(k) {
      const it = items[i];
      const ok = k === it.a;
      if (first) { meta.firstTotal++; if (ok) { meta.firstOk++; score++; } metaUpdate(); }
      if (ok) {
        fb.className = 'sort-fb ok'; fb.innerHTML = '⭕ 맞아요! ' + (it.exp || '');
        btns.querySelectorAll('button').forEach(b => b.disabled = true);
        setTimeout(() => { i++; if (i < items.length) show(); else finish(); }, it.exp ? 1900 : 900);
      } else {
        first = false;
        fb.className = 'sort-fb no'; fb.innerHTML = '❌ 다시 생각해 보세요. ' + (it.wrong || it.hintWrong || '힌트를 다시 읽어 보세요.');
      }
    }
    function finish() {
      card.classList.add('hidden'); btns.classList.add('hidden'); fb.innerHTML = ''; prog.textContent = '';
      end.classList.remove('hidden');
      const pct = score / items.length;
      end.innerHTML = `첫 시도에 맞힌 문제 <b>${score} / ${items.length}</b><br>` +
        (pct === 1 ? '🏆 완벽해요! 기준을 정확히 알고 있어요.' : pct >= .7 ? '👍 잘했어요. 헷갈린 카드는 왜 헷갈렸는지 떠올려 보세요.' : '📚 기준을 다시 읽고 한 번 더 도전해 보세요.') +
        (cfg.after ? '<br><span style="color:#94a3b8;font-size:.85rem">' + cfg.after + '</span>' : '');
      if (cfg.onDone) cfg.onDone(score, items.length);
    }
    start();
  }

  /* ---------- 선택형 문제 ---------- */
  function MCQ(root, list) {
    if (typeof root === 'string') root = $(root);
    root.innerHTML = '';
    let done = 0, ok = 0;
    const score = el('div', 'mq-score');
    list.forEach((q, n) => {
      const item = el('div', 'mq-item');
      item.appendChild(el('div', 'mq-q', `<span class="qnum">Q${n + 1}.</span> ${q.q}`));
      const opts = el('div', 'mq-opts'); const fb = el('div', 'mq-fb');
      const order = q.keep ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
      order.forEach(oi => {
        const b = el('button', 'mq-btn', q.opts[oi]);
        b.onclick = () => {
          const right = oi === q.a;
          if (!item.dataset.tried) { item.dataset.tried = 1; meta.firstTotal++; if (right) { meta.firstOk++; ok++; } metaUpdate(); }
          if (right) {
            b.classList.add('correct'); opts.querySelectorAll('button').forEach(x => x.disabled = true);
            fb.className = 'mq-fb ok'; fb.innerHTML = '⭕ ' + (q.exp || '정답입니다!'); done++;
            score.textContent = `첫 시도 정답 ${ok} / ${list.length}` + (done === list.length ? ' — 완료!' : '');
          } else {
            b.classList.add('wrong'); b.disabled = true;
            fb.className = 'mq-fb no'; fb.innerHTML = '❌ ' + (q.no || '다시 골라 보세요.');
          }
        };
        opts.appendChild(b);
      });
      item.append(opts, fb); root.appendChild(item);
    });
    score.textContent = `첫 시도 정답 0 / ${list.length}`;
    root.appendChild(score);
  }

  /* ---------- 예측 상자 ---------- */
  function Predict(root, cfg) {
    if (typeof root === 'string') root = $(root);
    root.classList.add('predict');
    root.innerHTML = `<div class="pq">${cfg.q}</div><div class="popts"></div><div class="pres"></div>`;
    const po = root.querySelector('.popts'), pr = root.querySelector('.pres');
    cfg.opts.forEach((o, i) => {
      const b = el('button', 'pbtn', o);
      b.onclick = () => {
        po.querySelectorAll('button').forEach(x => x.disabled = true); b.classList.add('sel');
        meta.predTotal++; const hit = cfg.a === undefined || cfg.a === null || cfg.a === i || (Array.isArray(cfg.a) && cfg.a.includes(i)); if (hit) meta.predHit++; metaUpdate();
        pr.classList.add('show');
        pr.innerHTML = (cfg.a === undefined || cfg.a === null ? '📝 예측을 기록했어요. ' : hit ? '🎯 <b>예측 적중!</b> ' : '😮 <b>예측과 달랐어요.</b> 이 부분이 오늘 새로 배우는 핵심이에요. ') + (cfg.exp || '');
        if (cfg.unlock) { const t = $(cfg.unlock); if (t) t.classList.remove('locked'); const n = $(cfg.unlock + '-lock'); if (n) n.remove(); }
        if (cfg.onPick) cfg.onPick(i, hit);
      };
      po.appendChild(b);
    });
  }

  /* ---------- 순서 게임 ---------- */
  function OrderGame(root, cfg) {
    if (typeof root === 'string') root = $(root);
    root.innerHTML = '';
    const pool = el('div', 'og-pool'), ans = el('div', 'og-answer');
    const lab1 = el('div', 'og-label', cfg.poolLabel || '① 카드를 순서대로 눌러 아래 칸으로 옮기세요. (아래 칸의 카드를 누르면 되돌아가요)');
    const lab2 = el('div', 'og-label', cfg.ansLabel || '② 내가 정한 순서');
    const fb = el('div', 'sort-fb');
    const row = el('div', 'btn-row'); row.style.justifyContent = 'center';
    const chk = el('button', 'btn', '순서 확인'); const rs = el('button', 'btn-sub', '↺ 다시');
    row.append(chk, rs);
    root.append(lab1, pool, lab2, ans, row, fb);
    let tried = false;
    function chip(it, idx) {
      const c = el('button', 'og-chip', (it.e ? it.e + ' ' : '') + it.t + (it.sub ? `<small>${it.sub}</small>` : ''));
      c.dataset.idx = idx;
      c.onclick = () => { c.classList.remove('ok', 'no'); (c.parentNode === pool ? ans : pool).appendChild(c); };
      return c;
    }
    function start() { pool.innerHTML = ''; ans.innerHTML = ''; fb.innerHTML = ''; fb.className = 'sort-fb'; tried = false; shuffle(cfg.items.map((it, i) => [it, i])).forEach(([it, i]) => pool.appendChild(chip(it, i))); }
    chk.onclick = () => {
      const kids = [...ans.children];
      if (kids.length < cfg.items.length) { fb.className = 'sort-fb no'; fb.textContent = `카드 ${cfg.items.length}장을 모두 아래 칸으로 옮겨 주세요.`; return; }
      let right = 0; kids.forEach((c, pos) => { const ok = +c.dataset.idx === pos; c.classList.toggle('ok', ok); c.classList.toggle('no', !ok); if (ok) right++; });
      const all = right === kids.length;
      if (!tried) { tried = true; meta.firstTotal++; if (all) meta.firstOk++; metaUpdate(); }
      fb.className = 'sort-fb ' + (all ? 'ok' : 'no');
      fb.innerHTML = all ? '🎉 완벽한 순서예요! ' + (cfg.exp || '') : `제자리에 있는 카드 ${right} / ${kids.length}장. 빨간 카드를 눌러 위로 보낸 뒤 다시 놓아 보세요.`;
      if (all && cfg.onDone) cfg.onDone();
    };
    rs.onclick = start; start();
  }

  /* ---------- 짝 맞추기 ---------- */
  function MatchGame(root, cfg) {
    if (typeof root === 'string') root = $(root);
    root.innerHTML = '';
    const wrap = el('div', 'match-wrap'), L = el('div', 'match-col'), R = el('div', 'match-col');
    const fb = el('div', 'sort-fb'); const rs = el('div', 'center', '<button class="btn-sub">↺ 다시 하기</button>');
    wrap.append(L, R); root.append(wrap, fb, rs);
    let sel = null, done = 0, miss = 0;
    function start() {
      L.innerHTML = ''; R.innerHTML = ''; sel = null; done = 0; miss = 0; fb.innerHTML = '';
      shuffle(cfg.pairs.map((p, i) => [p, i])).forEach(([p, i]) => { const b = el('button', 'm-item l', p.l); b.dataset.i = i; b.onclick = () => { if (b.classList.contains('done')) return; L.querySelectorAll('.m-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; }; L.appendChild(b); });
      shuffle(cfg.pairs.map((p, i) => [p, i])).forEach(([p, i]) => { const b = el('button', 'm-item', p.r); b.dataset.i = i; b.onclick = () => {
        if (b.classList.contains('done')) return;
        if (!sel) { fb.className = 'sort-fb no'; fb.textContent = '왼쪽에서 먼저 용어를 고르세요.'; return; }
        if (sel.dataset.i === b.dataset.i) { sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); sel = null; done++; fb.className = 'sort-fb ok'; fb.textContent = done === cfg.pairs.length ? `🎉 모두 맞혔어요! (틀린 시도 ${miss}번)` : '⭕ 맞아요!'; if (done === cfg.pairs.length) { meta.firstTotal++; if (miss <= 1) meta.firstOk++; metaUpdate(); } }
        else { miss++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); fb.className = 'sort-fb no'; fb.textContent = '❌ 짝이 아니에요. 설명의 핵심 낱말을 다시 읽어 보세요.'; }
      }; R.appendChild(b); });
    }
    rs.querySelector('button').onclick = start; start();
  }

  /* ---------- 코드 색 입히기 & 복사 ---------- */
  const PYK = /\b(import|as|for|in|range|if|else|elif|while|def|return|print|len|int|True|False|None|from)\b/g;
  function highlight(src) {
    return src.split('\n').map(line => {
      let code = line, cmt = '', q = null;
      for (let k = 0; k < line.length; k++) {
        const ch = line[k];
        if (q) { if (ch === q) q = null; }
        else if (ch === '"' || ch === "'") q = ch;
        else if (ch === '#') { code = line.slice(0, k); cmt = line.slice(k); break; }
      }
      let h = esc(code)
        .replace(/(&quot;[^&]*?&quot;|'[^']*')/g, '\u0001$1\u0002')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '\u0003$1\u0004');
      h = h.replace(PYK, '\u0005$1\u0006');
      h = h.replace(/\u0001([^\u0002]*)\u0002/g, (_, s) => '<span class="s">' + s.replace(/\u0003|\u0004|\u0005|\u0006/g, '') + '</span>')
        .replace(/\u0003/g, '<span class="n">').replace(/\u0004/g, '</span>')
        .replace(/\u0005/g, '<span class="k">').replace(/\u0006/g, '</span>');
      return h + (cmt ? '<span class="c">' + esc(cmt) + '</span>' : '');
    }).join('\n');
  }
  function toast(msg) {
    let t = document.querySelector('.toast'); if (!t) { t = el('div', 'toast'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1600);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); return ok;
    }
  }
  async function copyBtn(b) {
    const card = b.closest('.code-card'); const pre = card && card.querySelector('pre.py'); if (!pre) return;
    const ok = await copyText(pre.dataset.src);
    b.classList.add('done'); b.textContent = ok ? '✔ 복사됨' : '복사 실패 — 직접 선택하세요';
    toast(ok ? '복사했어요! 코랩 코드 셀에 붙여넣기(Ctrl+V) 하세요' : '복사가 막혀 있어요. 코드를 드래그해 복사하세요');
    setTimeout(() => { b.classList.remove('done'); b.textContent = '📋 복사'; }, 1800);
  }
  function setCode(pre, src) { pre.dataset.src = src; pre.innerHTML = highlight(src); }
  function initCode() {
    document.querySelectorAll('pre.py').forEach(pre => {
      const src = (pre.dataset.src !== undefined ? pre.dataset.src : pre.textContent).replace(/^\n/, '').replace(/\s+$/, '');
      setCode(pre, src);
    });
    document.querySelectorAll('.copy-btn').forEach(b => { if (b.dataset.bound) return; b.dataset.bound = '1'; b.addEventListener('click', () => copyBtn(b)); });
  }

/* 예측 → 실행 → 비교 카드 */
  function makeTry(id, cfg) {
  const root = typeof id === 'string' ? $(id) : id;
  root.innerHTML = `<div class="code-card"><div class="code-head"><span class="lbl"><b>실행 코드</b> · 상자 안의 코드만 복사</span><button class="copy-btn">📋 복사</button></div><pre class="py"></pre>
    <div class="after"><div class="out-label">실행 결과</div><pre class="out"></pre></div></div>
    <div class="pbox"><b>🔮 실행 전 예측</b> — ${cfg.q}<textarea placeholder="예상 결과를 적어 보세요"></textarea>
    <div class="btn-row"><button class="btn-sub reveal">👀 정답 결과 보기</button></div>
    <div class="after"><div class="same-row">코랩에서 실행한 결과와 내 예측을 비교해 보세요:
      <button class="chip" data-r="1">🎯 예측과 같았다</button><button class="chip" data-r="0">😮 예측과 달랐다</button><span class="note res"></span></div>
      ${cfg.note ? `<div class="note">💡 ${cfg.note}</div>` : ''}</div></div>`;
  setCode(root.querySelector('pre.py'), cfg.code);
  root.querySelector('.copy-btn').dataset.bound = '1';
  root.querySelector('.copy-btn').addEventListener('click', () => copyBtn(root.querySelector('.copy-btn')));
  root.querySelector('pre.out').textContent = cfg.out;
  const ta = root.querySelector('textarea'); const k = 'try:' + id; ta.value = store.get(k, ''); ta.oninput = () => store.set(k, ta.value);
  root.querySelector('.reveal').onclick = () => root.querySelectorAll('.after').forEach(a => a.classList.add('show'));
  root.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    if (root.dataset.rated) return; root.dataset.rated = 1; b.classList.add('on');
    meta.predTotal++; if (b.dataset.r === '1') meta.predHit++; metaUpdate(); renderCompare();
    root.querySelector('.res').textContent = b.dataset.r === '1' ? '멋져요! 코드를 정확히 읽었어요.' : '좋은 발견이에요! 어느 줄에서 예측이 빗나갔는지 찾아보세요.';
  });
}


  document.addEventListener('DOMContentLoaded', () => { initKWL(); initSelfCheck(); initIq(); initDone(); initFlips(); initCode(); metaUpdate(); renderCompare(); });

  window.ICT = { makeTry, $, esc, shuffle, el, store, meta, metaUpdate, SortGame, MCQ, Predict, OrderGame, MatchGame, saveIq, highlight, setCode, copyText, toast, renderCompare };
  window.saveIq = saveIq;
})();

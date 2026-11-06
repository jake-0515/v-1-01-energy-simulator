/* 형성평가·종합 평가 공통 엔진 (5지선다 + 확신도 + 메타인지 분석 + 오답노트)
   각 평가 페이지에서 window.QUIZ_CFG 를 먼저 정의한 뒤 이 파일을 불러옵니다. */
(function () {
  const C = window.QUIZ_CFG;
  const $ = id => document.getElementById(id);
  const root = $('quizRoot');
  const Q = C.questions, N = Q.length;
  const DOM = C.domains, DKEYS = Object.keys(DOM).map(Number);

  const scope = DKEYS.map(d => `<div><b style="color:${DOM[d].color}">${DOM[d].name}</b>${DOM[d].desc} · ${Q.filter(q => q.d === d).length}문항</div>`).join('');
  const est = C.ranges.map((r, i) => `<option value="${i}">${r[2]}</option>`).join('');
  root.innerHTML = `
  <div class="progress-wrap"><div class="progress-bar" id="pbar"></div></div>
  <div class="progress-label" id="plabel">시작 전</div>
  <div class="panel start-panel" id="startPanel">
    <h2>🎯 ${N}문제 도전!</h2>
    <p>${C.intro}<br>각 문제마다 <b style="color:#c4b5fd">답</b>과 <b style="color:#c4b5fd">확신도</b>를 함께 선택해요.</p>
    <div class="scope">${scope}</div>
    <div class="pre-est">🔮 <b>시작 전 예측</b> — ${N}문제 중 몇 개나 맞힐 것 같나요?
      <select id="preEst"><option value="">선택</option>${est}</select></div>
    <div class="hint-box"><b>🧠 왜 확신도를 고를까요?</b><br>
      "확실하다"고 했는데 틀린 문제는 <b>잘못 알고 있는 개념</b>이에요. 모르는 것보다 더 위험하죠. 확신도를 함께 고르면 결과 화면에서 <b>무엇부터 복습할지</b> 알려 줘요.<br><br>
      <b>⌨️ 키보드:</b> 숫자키 <b>1~5</b> = 보기 선택 · <b>Q/W/E</b> = 확신도 · <b>Enter</b> = 확인/다음</div>
    <button class="btn-check" id="startBtn">평가 시작 (Enter)</button>
  </div>
  <div class="panel hidden" id="quizPanel">
    <span class="q-domain" id="qDomain"></span>
    <div class="q-text" id="qText"></div>
    <div class="opts" id="qOpts"></div>
    <div class="conf-row">
      <span class="conf-label">🧠 확신도:</span>
      <button class="conf-btn" data-c="high">😎 확실해요 (Q)</button>
      <button class="conf-btn" data-c="mid">🤔 아마도? (W)</button>
      <button class="conf-btn" data-c="low">🎲 찍었어요 (E)</button>
      <span class="conf-hint">답과 확신도를 모두 선택해야 확인할 수 있어요</span>
    </div>
    <div class="action-row"><button class="btn-check" id="checkBtn" disabled>정답 확인</button><span class="key-hint">Enter ⏎</span></div>
    <div class="feedback" id="feedback"></div>
  </div>
  <div class="panel hidden" id="resultPanel">
    <div class="result-score"><div class="big" id="scoreBig"></div><div class="msg" id="scoreMsg"></div></div>
    <div class="est-box" id="estBox"></div>
    <h3 class="r-sec-title">📊 영역별 성취도</h3>
    <div class="domain-bars" id="domainBars"></div>
    <h3 class="r-sec-title">🧠 메타인지 분석 — 나는 나를 얼마나 알까?</h3>
    <div class="cal-grid" id="calGrid"></div>
    <div class="cal-note" id="calNote"></div>
    <h3 class="r-sec-title" id="wrongTitle">📖 오답노트</h3>
    <div class="wrong-list" id="wrongList"></div>
    <div class="review-reco" id="reviewReco"></div>
    <div class="reflect">
      <h4>✍️ ${C.reflectTitle || '마치며 — 나의 한 문장'}</h4>
      <p>${C.reflectPrompt}</p>
      <textarea id="reflectTxt" placeholder="${C.reflectPlaceholder || ''}"></textarea>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center"><button class="btn-sub" id="reflectSave">💾 저장</button><span id="reflectSaved" style="font-size:.78rem;color:#a78bfa"></span></div>
    </div>
    <div class="result-actions"><button class="btn-check" id="retryBtn">다시 도전하기</button><a class="btn-sub" href="index.html">🏠 홈으로</a></div>
  </div>`;

  let order = [], idx = 0, answered = false, selOpt = null, selConf = null, records = [], preEst = '', optMap = [];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function startQuiz() {
    preEst = $('preEst').value;
    order = shuffle(Q.map((_, i) => i)); idx = 0; records = [];
    $('startPanel').classList.add('hidden'); $('resultPanel').classList.add('hidden'); $('quizPanel').classList.remove('hidden');
    showQuestion();
  }
  function showQuestion() {
    const q = Q[order[idx]];
    answered = false; selOpt = null; selConf = null;
    $('pbar').style.width = (idx / N * 100) + '%';
    $('plabel').textContent = '문제 ' + (idx + 1) + ' / ' + N;
    $('qDomain').textContent = '📚 ' + DOM[q.d].name; $('qDomain').style.background = DOM[q.d].color + '26'; $('qDomain').style.color = DOM[q.d].color;
    $('qText').innerHTML = '<span class="qnum">Q' + (idx + 1) + '.</span> ' + q.q;
    const o = $('qOpts'); o.innerHTML = '';
    optMap = q.fixed ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
    optMap.forEach((oi, pos) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = '<span class="onum">' + (pos + 1) + '</span><span>' + q.opts[oi] + '</span>'; b.onclick = () => selectOpt(pos); o.appendChild(b); });
    document.querySelectorAll('.conf-btn').forEach(b => { b.classList.remove('sel'); b.disabled = false; });
    $('checkBtn').disabled = true; $('checkBtn').textContent = '정답 확인';
    $('feedback').className = 'feedback'; $('feedback').innerHTML = '';
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  function selectOpt(pos) { if (answered) return; selOpt = pos; document.querySelectorAll('#qOpts .opt').forEach((b, j) => b.classList.toggle('selected', j === pos)); upd(); }
  function selectConf(c) { if (answered) return; selConf = c; document.querySelectorAll('.conf-btn').forEach(b => b.classList.toggle('sel', b.dataset.c === c)); upd(); }
  function upd() { $('checkBtn').disabled = !(selOpt !== null && selConf !== null); }
  function checkAnswer() {
    if (answered || selOpt === null || selConf === null) return;
    answered = true;
    const q = Q[order[idx]]; const picked = optMap[selOpt]; const correct = picked === q.a;
    records.push({ d:q.d, correct, conf:selConf, qIdx:order[idx], picked });
    document.querySelectorAll('#qOpts .opt').forEach((b, j) => { b.disabled = true; if (optMap[j] === q.a) b.classList.add('correct'); else if (j === selOpt && !correct) b.classList.add('wrong'); });
    document.querySelectorAll('.conf-btn').forEach(b => b.disabled = true);
    let m;
    if (correct && selConf === 'high') m = '🧠 확신 + 정답 — 진짜 실력이에요.';
    else if (correct) m = '🧠 정답이지만 확신이 없었죠? 해설을 읽고 "왜" 맞는지 확실히 해 두세요.';
    else if (selConf === 'high') m = '🧠 <b>착각 주의!</b> 확신했는데 틀렸어요. 이런 문제가 가장 위험합니다 — 해설을 꼭 두 번 읽으세요.';
    else m = '🧠 모른다는 걸 알고 있었네요. 그것도 메타인지! 이제 해설로 채우면 됩니다.';
    const fb = $('feedback'); fb.className = 'feedback show ' + (correct ? 'ok' : 'no');
    fb.innerHTML = '<b class="head">' + (correct ? '⭕ 정답입니다!' : '❌ 아쉬워요!') + '</b>' + q.exp + '<div class="meta">' + m + '</div>';
    $('checkBtn').disabled = false; $('checkBtn').textContent = idx + 1 < N ? '다음 문제 →' : '결과 보기 🎉';
  }
  function nextStep() { if (!answered) { checkAnswer(); return; } idx++; if (idx < N) showQuestion(); else showResult(); }

  function showResult() {
    $('quizPanel').classList.add('hidden'); $('resultPanel').classList.remove('hidden');
    $('pbar').style.width = '100%'; $('plabel').textContent = '완료!';
    const total = records.length, score = records.filter(r => r.correct).length;
    $('scoreBig').textContent = score + ' / ' + total;
    const p = score / total;
    $('scoreMsg').textContent = p === 1 ? C.msgs[0] : p >= .8 ? C.msgs[1] : p >= .55 ? C.msgs[2] : C.msgs[3];
    if (preEst !== '' && C.ranges[preEst]) {
      const [lo, hi, lbl] = C.ranges[preEst];
      $('estBox').innerHTML = score >= lo && score <= hi ? `🎯 <b>예측 적중!</b> 시작 전 예측 「${lbl}」 → 실제 ${score}개. 자신의 이해 수준을 정확히 알고 있어요.`
        : score > hi ? `😮 <b>예측보다 잘했어요.</b> 예측 「${lbl}」 → 실제 ${score}개. 스스로를 과소평가했네요.`
        : `⚠️ <b>예측보다 낮았어요.</b> 예측 「${lbl}」 → 실제 ${score}개. "안다고 생각했지만 아직 아닌" 부분이 있어요. 아래 오답노트가 그 지도입니다.`;
    } else $('estBox').innerHTML = '🔮 시작 전 예측을 선택하지 않았어요. 다음엔 먼저 예측해 보세요 — 예측하고 비교하는 습관이 메타인지를 키웁니다.';
    const bars = $('domainBars'); bars.innerHTML = ''; const ds = {};
    DKEYS.forEach(d => {
      const rs = records.filter(r => r.d === d), ok = rs.filter(r => r.correct).length, pct = rs.length ? Math.round(ok / rs.length * 100) : 0; ds[d] = pct;
      const row = document.createElement('div'); row.className = 'dbar-row';
      row.innerHTML = `<span class="dbar-name">${DOM[d].name}</span><div class="dbar-track"><div class="dbar-fill" style="width:0;background:${DOM[d].color}"></div></div><span class="dbar-pct" style="color:${DOM[d].color}">${ok}/${rs.length}</span>`;
      bars.appendChild(row); setTimeout(() => row.querySelector('.dbar-fill').style.width = pct + '%', 80);
    });
    const hi = r => r.conf === 'high';
    const c = { good:records.filter(r => hi(r) && r.correct).length, danger:records.filter(r => hi(r) && !r.correct).length, lucky:records.filter(r => !hi(r) && r.correct).length, aware:records.filter(r => !hi(r) && !r.correct).length };
    $('calGrid').innerHTML =
      `<div class="cal-cell good"><h5>✅ 알고 있음</h5><span class="cnt">${c.good}문제</span><br>확신 + 정답 — 진짜 실력!</div>` +
      `<div class="cal-cell danger"><h5>⚠️ 착각 주의!</h5><span class="cnt">${c.danger}문제</span><br>확신 + 오답 — 잘못 알고 있던 개념. 가장 먼저 복습!</div>` +
      `<div class="cal-cell lucky"><h5>🍀 감으로 맞힘</h5><span class="cnt">${c.lucky}문제</span><br>불확신 + 정답 — 개념을 확실히 다지면 진짜 실력이 돼요.</div>` +
      `<div class="cal-cell aware"><h5>🧭 모름을 앎</h5><span class="cnt">${c.aware}문제</span><br>불확신 + 오답 — 모른다는 걸 정확히 알고 있어요. 복습하면 OK!</div>`;
    const acc = Math.round((c.good + c.aware) / total * 100);
    $('calNote').innerHTML = (c.danger === 0 ? '👍 <b>착각이 없어요!</b> 아는 것과 모르는 것을 정확히 구분하고 있습니다. ' : `🔍 <b>「착각 주의」 ${c.danger}문제</b>가 가장 위험해요. 확신했는데 틀린 문제부터 오답노트로 다시 확인하세요. `) +
      `<br><b>메타인지 정확도 ${acc}%</b> — (확신+정답) + (불확신+오답)이 전체에서 차지하는 비율. 높을수록 "나를 잘 아는" 학습자입니다.`;
    const wr = records.filter(r => !r.correct), wl = $('wrongList'); wl.innerHTML = '';
    if (!wr.length) { $('wrongTitle').textContent = '📖 오답노트 — 없음! 🎉'; wl.innerHTML = '<div style="color:#4ade80;font-size:.9rem">모든 문제를 맞혔습니다. 완벽해요!</div>'; }
    else {
      $('wrongTitle').textContent = `📖 오답노트 (${wr.length}문제)`;
      wr.sort((a, b) => (b.conf === 'high') - (a.conf === 'high')).forEach(r => {
        const q = Q[r.qIdx], div = document.createElement('div'); div.className = 'wrong-item';
        div.innerHTML = `<b>Q. ${q.q.replace(/<[^>]+>/g, '')}</b><br>내 답: ${q.opts[r.picked]}${r.conf === 'high' ? ' <span style="color:#f87171">(확신했음 ⚠️)</span>' : ''}<br><span class="ans">정답: ${q.opts[q.a]}</span><br>${q.exp}<br><a href="${DOM[q.d].link}" style="color:#7dd3fc;font-size:.82rem">↗ ${DOM[q.d].name} 차시로 복습</a>`;
        wl.appendChild(div);
      });
    }
    const weak = DKEYS.slice().sort((a, b) => ds[a] - ds[b])[0];
    $('reviewReco').innerHTML = ds[weak] === 100 ? '🎓 모든 영역을 완벽히 이해했어요! 축하합니다!' : `💡 <b>복습 추천:</b> 「${DOM[weak].name}」 영역이 가장 약해요 (${ds[weak]}%). <a href="${DOM[weak].link}">여기를 눌러 해당 차시로 이동</a>해 복습한 뒤 다시 도전해 보세요!`;
    try {
      const v = localStorage.getItem(C.key + '-reflect'); if (v) $('reflectTxt').value = v;
      const d = JSON.parse(localStorage.getItem('ictf:done') || '{}'); d[C.page] = Date.now(); localStorage.setItem('ictf:done', JSON.stringify(d));
      const best = JSON.parse(localStorage.getItem('ictf:quiz') || '{}'); best[C.page] = Math.max(best[C.page] || 0, score); localStorage.setItem('ictf:quiz', JSON.stringify(best));
    } catch (e) {}
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  $('reflectSave').onclick = () => { try { localStorage.setItem(C.key + '-reflect', $('reflectTxt').value); } catch (e) {} $('reflectSaved').textContent = '✔ 저장됨 ' + new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' }); };
  $('startBtn').onclick = startQuiz; $('checkBtn').onclick = nextStep; $('retryBtn').onclick = startQuiz;
  document.querySelectorAll('.conf-btn').forEach(b => b.onclick = () => selectConf(b.dataset.c));
  document.addEventListener('keydown', e => {
    if (document.activeElement && ['TEXTAREA', 'SELECT', 'INPUT'].includes(document.activeElement.tagName)) return;
    if (!$('startPanel').classList.contains('hidden')) { if (e.key === 'Enter') { e.preventDefault(); startQuiz(); } return; }
    if (!$('quizPanel').classList.contains('hidden')) {
      if (['1', '2', '3', '4', '5'].includes(e.key) && !answered) { selectOpt(parseInt(e.key) - 1); return; }
      const cm = { q:'high', w:'mid', e:'low' }; const k = e.key.toLowerCase();
      if (cm[k] && !answered) { selectConf(cm[k]); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (!$('checkBtn').disabled) nextStep(); }
    }
  });
})();

/* 5차시: 2차원 수치 표본에 대한 실제 3-NN 분류. 테스트 자료는 학습에 사용하지 않습니다. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ICT = window.ICT;
  var names = { water: '물주기', wait: '기다리기' };
  var colors = { water: '#67e8f9', wait: '#c4b5fd' };
  var BALANCED = [
    { x: 15, y: 75, label: 'water' }, { x: 22, y: 85, label: 'water' }, { x: 28, y: 65, label: 'water' },
    { x: 32, y: 90, label: 'water' }, { x: 40, y: 88, label: 'water' }, { x: 20, y: 40, label: 'water' },
    { x: 60, y: 30, label: 'wait' }, { x: 75, y: 70, label: 'wait' }, { x: 55, y: 85, label: 'wait' },
    { x: 80, y: 20, label: 'wait' }, { x: 48, y: 35, label: 'wait' }, { x: 65, y: 55, label: 'wait' }
  ];
  var BIASED = [
    { x: 15, y: 85, label: 'water' }, { x: 60, y: 30, label: 'wait' }, { x: 75, y: 70, label: 'wait' },
    { x: 55, y: 85, label: 'wait' }, { x: 80, y: 20, label: 'wait' }, { x: 48, y: 35, label: 'wait' },
    { x: 65, y: 55, label: 'wait' }, { x: 68, y: 40, label: 'wait' }, { x: 82, y: 82, label: 'wait' },
    { x: 58, y: 62, label: 'wait' }, { x: 76, y: 50, label: 'wait' }, { x: 70, y: 22, label: 'wait' }
  ];
  var TEST = [
    { x: 18, y: 72, label: 'water' }, { x: 30, y: 80, label: 'water' }, { x: 38, y: 94, label: 'water' }, { x: 25, y: 50, label: 'water' },
    { x: 58, y: 45, label: 'wait' }, { x: 82, y: 65, label: 'wait' }, { x: 50, y: 28, label: 'wait' }, { x: 70, y: 90, label: 'wait' }
  ];
  function copySamples(items) { return items.map(function (sample) { return { x: sample.x, y: sample.y, label: sample.label }; }); }
  function validSamples(value) {
    return Array.isArray(value) && value.length <= 24 && value.every(function (sample) {
      return sample && Number.isFinite(sample.x) && sample.x >= 0 && sample.x <= 100 && Number.isFinite(sample.y) && sample.y >= 0 && sample.y <= 100 && ['water', 'wait'].includes(sample.label);
    });
  }
  var saved = ICT.load('ai', {});
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  var samples = validSamples(saved.samples) ? copySamples(saved.samples) : copySamples(BALANCED);
  var model = validSamples(saved.model) && saved.model.length >= 3 && JSON.stringify(saved.model) === JSON.stringify(samples) ? copySamples(saved.model) : null;
  var prediction = null, evaluation = null;

  var PIPELINE = [
    { name: '사물 인터넷', sub: '센서가 자료 수집', detail: '센서와 통신 기능이 있는 화분이 수분과 빛의 값을 측정해 보냅니다. 측정값이 빠지거나 잘못되면 뒤의 분석에도 영향을 줍니다.' },
    { name: '데이터 모으기', sub: '많고 다양한 사례', detail: '여러 조건의 자료를 모으고 정리합니다. 빅데이터는 규모가 크고 형태가 다양하며 빠르게 생겨나는 데이터 등을 말합니다. 오늘의 작은 표본 실험 자체가 빅데이터는 아닙니다.' },
    { name: '클라우드', sub: '저장·처리 자원 이용', detail: '이 사례에서는 인터넷으로 연결된 저장 공간과 처리 자원을 사용합니다. 저장 용량과 접근 권한을 관리해야 하며, 모든 자료를 무조건 공개하는 것은 아닙니다.' },
    { name: '인공지능', sub: '패턴으로 분류·예측', detail: '학습한 자료를 바탕으로 새 사례를 분류하거나 예측합니다. 결과가 실제 목적에 맞는지 사람이 점검하고, 필요한 자료를 다시 모읍니다.' }
  ];
  function showPipeline(index) {
    Array.from($('pipelineButtons').children).forEach(function (button, i) { button.setAttribute('aria-pressed', String(index === i)); });
    $('pipelineDetail').textContent = PIPELINE[index].detail;
  }
  PIPELINE.forEach(function (item, i) {
    var button = document.createElement('button'); button.type = 'button';
    button.innerHTML = '<b>' + (i + 1) + '. ' + item.name + '</b><small>' + item.sub + '</small>';
    button.addEventListener('click', function () { showPipeline(i); }); $('pipelineButtons').appendChild(button);
  });
  showPipeline(0);

  function invalidateModel(message) {
    model = null; prediction = null; evaluation = null;
    $('trainingStatus').textContent = '표본 준비 중 · 학습 필요';
    $('trainingHint').textContent = message || '표본이 바뀌었습니다. 이 표본으로 학습하기를 다시 눌러 주세요.';
    $('predictionResult').textContent = '표본을 학습한 뒤 새 사례를 예측할 수 있습니다.';
    $('evaluationResults').hidden = true; $('evaluationHint').textContent = '표본이 바뀌어 이전 평가를 지웠습니다. 다시 학습하고 평가하세요.';
  }
  function renderSamples() {
    $('sampleRows').replaceChildren();
    samples.forEach(function (sample, index) {
      var row = document.createElement('tr'), id = document.createElement('td');
      id.textContent = 'T' + (index + 1); id.className = 'sample-' + sample.label; row.appendChild(id);
      ['x', 'y'].forEach(function (axis) {
        var td = document.createElement('td'), input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.max = '100'; input.step = '1'; input.value = String(sample[axis]);
        input.setAttribute('aria-label', '표본 ' + (index + 1) + ' ' + (axis === 'x' ? '수분' : '빛'));
        input.addEventListener('change', function () {
          var numeric = Number(input.value);
          if (input.value.trim() === '' || !Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
            input.value = String(sample[axis]); $('trainingHint').textContent = '수분과 빛은 0~100 사이의 숫자로 입력하세요.'; return;
          }
          samples[index][axis] = numeric; invalidateModel(); renderPlot();
        });
        td.appendChild(input); row.appendChild(td);
      });
      var labelCell = document.createElement('td'), select = document.createElement('select');
      select.setAttribute('aria-label', '표본 ' + (index + 1) + ' 정답표');
      Object.keys(names).forEach(function (key) { var option = document.createElement('option'); option.value = key; option.textContent = names[key]; select.appendChild(option); });
      select.value = sample.label;
      select.addEventListener('change', function () { samples[index].label = select.value; invalidateModel(); id.className = 'sample-' + select.value; renderPlot(); updateCount(); });
      labelCell.appendChild(select); row.appendChild(labelCell);
      var deleteCell = document.createElement('td'), remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'button ghost'; remove.textContent = '×'; remove.setAttribute('aria-label', '표본 ' + (index + 1) + ' 삭제');
      remove.addEventListener('click', function () { samples.splice(index, 1); invalidateModel(); renderSamples(); renderPlot(); });
      deleteCell.appendChild(remove); row.appendChild(deleteCell); $('sampleRows').appendChild(row);
    });
    updateCount();
  }
  function updateCount() {
    var water = samples.filter(function (sample) { return sample.label === 'water'; }).length;
    $('sampleCount').textContent = samples.length + '개 · 물주기 ' + water + ' / 기다리기 ' + (samples.length - water);
    $('addSample').disabled = samples.length >= 24;
  }
  function choosePreset(preset, description) {
    samples = copySamples(preset); invalidateModel(description); renderSamples(); renderPlot();
  }
  $('balancedSamples').addEventListener('click', function () { choosePreset(BALANCED, '두 종류가 6개씩 있습니다. 학습한 뒤 별도 테스트 결과를 비교해 보세요.'); });
  $('biasedSamples').addEventListener('click', function () { choosePreset(BIASED, '물주기 표본은 1개, 기다리기 표본은 11개입니다. 가까운 이웃의 다수결에 어떤 영향이 생길까요?'); });
  $('addSample').addEventListener('click', function () {
    if (samples.length >= 24) return;
    samples.push({ x: Number($('testMoisture').value), y: Number($('testLight').value), label: 'water' });
    invalidateModel('새 표본을 추가했습니다. 정답표를 확인하고 다시 학습하세요.'); renderSamples(); renderPlot();
    $('sampleRows').lastElementChild.querySelector('input').focus();
  });
  $('trainModel').addEventListener('click', function () {
    var rows = Array.from($('sampleRows').children);
    var parsed = rows.map(function (row) {
      var inputs = row.querySelectorAll('input'), select = row.querySelector('select');
      if (inputs[0].value.trim() === '' || inputs[1].value.trim() === '') return null;
      return { x: Number(inputs[0].value), y: Number(inputs[1].value), label: select.value };
    });
    if (!validSamples(parsed) || parsed.length < 3) { $('trainingHint').textContent = '유효한 표본이 최소 3개 필요합니다. 모든 수분·빛 값을 0~100으로 확인해 주세요.'; return; }
    if (!parsed.some(function (sample) { return sample.label === 'water'; }) || !parsed.some(function (sample) { return sample.label === 'wait'; })) {
      $('trainingHint').textContent = '비교할 두 종류의 정답표가 모두 필요합니다. 물주기와 기다리기 표본을 넣어 주세요.'; return;
    }
    samples = parsed; model = copySamples(samples); prediction = null; evaluation = null;
    $('trainingStatus').textContent = '학습 완료 · ' + model.length + '개 표본 기억';
    $('trainingHint').textContent = '표본을 기억했습니다. 가까운 3개의 표본을 같은 비중으로 비교하여 다수결로 판단합니다.';
    $('predictionResult').textContent = '학습 완료! 슬라이더로 조건을 정하고 새 사례 예측하기를 눌러 보세요.';
    $('evaluationResults').hidden = true; $('evaluationHint').textContent = '학습에 쓰지 않은 8개 사례로 평가할 준비가 되었습니다.';
    renderSamples(); renderPlot();
  });

  function classify(dataset, x, y) {
    var nearest = dataset.map(function (sample, index) {
      return { id: index + 1, x: sample.x, y: sample.y, label: sample.label, distance: Math.hypot(sample.x - x, sample.y - y) };
    }).sort(function (a, b) { return a.distance - b.distance || a.id - b.id; }).slice(0, 3);
    var votes = { water: 0, wait: 0 };
    nearest.forEach(function (neighbor) { votes[neighbor.label]++; });
    return { label: votes.water > votes.wait ? 'water' : 'wait', nearest: nearest, votes: votes };
  }
  function coordinates(x, y) { return [52 + x * 5.2, 310 - y * 2.84]; }
  function svgElement(tag, attrs, text) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, String(attrs[key])); });
    if (text !== undefined) el.textContent = text; return el;
  }
  function renderPlot() {
    var svg = $('aiPlot'); svg.replaceChildren();
    [0, 25, 50, 75, 100].forEach(function (value) {
      var pos = coordinates(value, value);
      svg.appendChild(svgElement('line', { x1: pos[0], y1: 26, x2: pos[0], y2: 310, stroke: '#273e53', 'stroke-width': 1 }));
      svg.appendChild(svgElement('line', { x1: 52, y1: pos[1], x2: 572, y2: pos[1], stroke: '#273e53', 'stroke-width': 1 }));
      svg.appendChild(svgElement('text', { x: pos[0], y: 330, fill: '#8facbf', 'font-size': 12, 'text-anchor': 'middle' }, value));
      svg.appendChild(svgElement('text', { x: 40, y: pos[1] + 4, fill: '#8facbf', 'font-size': 12, 'text-anchor': 'end' }, value));
    });
    svg.appendChild(svgElement('text', { x: 312, y: 351, fill: '#b9d9e8', 'font-size': 13, 'text-anchor': 'middle' }, '수분 (가상 센서 값)'));
    svg.appendChild(svgElement('text', { x: 52, y: 16, fill: '#b9d9e8', 'font-size': 13 }, '빛'));
    var testX = Number($('testMoisture').value), testY = Number($('testLight').value), testPos = coordinates(testX, testY);
    if (prediction) {
      prediction.nearest.forEach(function (neighbor) {
        var pos = coordinates(neighbor.x, neighbor.y);
        svg.appendChild(svgElement('line', { x1: testPos[0], y1: testPos[1], x2: pos[0], y2: pos[1], stroke: '#e8c56a', 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: .8 }));
      });
    }
    samples.forEach(function (sample, i) {
      var pos = coordinates(sample.x, sample.y), circle = svgElement('circle', { cx: pos[0], cy: pos[1], r: 7, fill: colors[sample.label], stroke: '#0e1c2b', 'stroke-width': 2 });
      circle.appendChild(svgElement('title', {}, 'T' + (i + 1) + ': 수분 ' + sample.x + ', 빛 ' + sample.y + ', ' + names[sample.label]));
      svg.appendChild(circle);
      svg.appendChild(svgElement('text', { x: pos[0] + 9, y: pos[1] - 8, fill: '#b8cddd', 'font-size': 11 }, 'T' + (i + 1)));
    });
    var diamond = [[testPos[0], testPos[1] - 10], [testPos[0] + 10, testPos[1]], [testPos[0], testPos[1] + 10], [testPos[0] - 10, testPos[1]]].map(function (pos) { return pos.join(','); }).join(' ');
    svg.appendChild(svgElement('polygon', { points: diamond, fill: '#fbbf24', stroke: '#fff7c2', 'stroke-width': 2 }));
    svg.appendChild(svgElement('text', { x: Math.min(testPos[0] + 14, 514), y: Math.max(testPos[1] - 13, 25), fill: '#fde68a', 'font-size': 12 }, '새 사례'));
    svg.setAttribute('aria-label', '학습 표본 ' + samples.length + '개. 새 사례는 수분 ' + testX + ', 빛 ' + testY + '. 청록색은 물주기, 보라색은 기다리기.');
  }
  function updateSliders() {
    $('testMoistureValue').textContent = $('testMoisture').value; $('testLightValue').textContent = $('testLight').value;
    prediction = null; renderPlot();
    $('predictionResult').textContent = model ? '새 조건을 정했습니다. 새 사례 예측하기를 눌러 결과를 확인하세요.' : '먼저 표본으로 학습해 주세요.';
  }
  ['testMoisture', 'testLight'].forEach(function (id) { $(id).addEventListener('input', updateSliders); });
  $('aiPlot').addEventListener('pointerdown', function (event) {
    var rect = $('aiPlot').getBoundingClientRect(), x = (event.clientX - rect.left) * 600 / rect.width, y = (event.clientY - rect.top) * 360 / rect.height;
    if (x < 52 || x > 572 || y < 26 || y > 310) return;
    $('testMoisture').value = String(Math.round((x - 52) / 5.2));
    $('testLight').value = String(Math.round((310 - y) / 2.84)); updateSliders();
  });
  $('predictSample').addEventListener('click', function () {
    if (!model) { $('predictionResult').textContent = '학습 전입니다. 왼쪽의 이 표본으로 학습하기를 먼저 눌러 주세요.'; return; }
    prediction = classify(model, Number($('testMoisture').value), Number($('testLight').value));
    var panel = $('predictionResult'); panel.replaceChildren();
    var title = document.createElement('h3'); title.textContent = '예측: ' + names[prediction.label]; panel.appendChild(title);
    var reason = document.createElement('p'); reason.textContent = '가까운 표본 3개 중 ' + prediction.votes[prediction.label] + '개가 ‘' + names[prediction.label] + '’입니다. 이 표 수는 정답일 확률을 뜻하지 않습니다.'; panel.appendChild(reason);
    var pills = document.createElement('div'); pills.className = 'neighbor-pills';
    prediction.nearest.forEach(function (neighbor) { var pill = document.createElement('span'); pill.textContent = 'T' + neighbor.id + ' · ' + names[neighbor.label] + ' · 거리 ' + neighbor.distance.toFixed(1); pills.appendChild(pill); });
    panel.appendChild(pills);
    if (prediction.nearest[0].distance > 28) { var warning = document.createElement('p'); warning.style.color = '#fde68a'; warning.textContent = '가까운 학습 표본도 새 사례에서 꽤 멉니다. 이런 조건을 더 수집하고 결과를 검토해야 합니다.'; panel.appendChild(warning); }
    renderPlot();
  });
  $('evaluateModel').addEventListener('click', function () {
    if (!model) { $('evaluationHint').textContent = '먼저 표본으로 학습해 주세요. 평가 표본은 학습에 추가하지 않습니다.'; return; }
    evaluation = TEST.map(function (sample, i) {
      var result = classify(model, sample.x, sample.y);
      return { id: i + 1, x: sample.x, y: sample.y, truth: sample.label, predicted: result.label, correct: sample.label === result.label };
    });
    var total = evaluation.filter(function (sample) { return sample.correct; }).length;
    var water = evaluation.filter(function (sample) { return sample.truth === 'water' && sample.correct; }).length;
    var wait = evaluation.filter(function (sample) { return sample.truth === 'wait' && sample.correct; }).length;
    $('evaluationStats').innerHTML = '<div class="ai-eval-stat"><small>전체 정답률</small><strong>' + (total / 8 * 100).toFixed(1) + '%</strong><span>' + total + ' / 8개 정답</span></div><div class="ai-eval-stat"><small>물주기 사례</small><strong>' + water + ' / 4</strong><span>물이 필요한 조건을 놓치지 않았나요?</span></div><div class="ai-eval-stat"><small>기다리기 사례</small><strong>' + wait + ' / 4</strong><span>한쪽 종류만 맞히고 있지 않나요?</span></div>';
    $('evaluationRows').replaceChildren();
    evaluation.forEach(function (sample) {
      var row = document.createElement('tr');
      ['E' + sample.id, sample.x + ' / ' + sample.y, names[sample.truth], names[sample.predicted], sample.correct ? '맞음' : '다시 살피기'].forEach(function (text, index) {
        var cell = document.createElement('td'); cell.textContent = text;
        if (index === 4) cell.className = sample.correct ? 'ai-pass' : 'ai-review';
        row.appendChild(cell);
      });
      $('evaluationRows').appendChild(row);
    });
    $('evaluationResults').hidden = false; $('evaluationHint').textContent = '총 ' + total + ' / 8개를 맞혔습니다. 종류별 결과까지 비교해 보세요.';
  });

  var CASES = [
    { icon: '🩺', title: '의료 · 판단 돕기', data: '검사 영상, 측정값 등 목적에 필요한 자료', use: '영상의 특징을 분석하여 의료진의 확인을 돕거나 상태의 변화를 살핍니다.', human: '의료진이 결과와 환자 상황을 함께 검토합니다. AI 결과만으로 확정하지 않습니다.', caution: '민감한 건강 정보의 보호와 충분한 검증이 필요합니다.', options: ['허락된 검사 영상의 관련 특징', '환자 가족의 SNS 비밀번호', '모든 방문자의 집 주소'], answer: 0, why: '판단 목적과 직접 관련된 자료만 적절한 절차에 따라 활용해야 합니다. 불필요한 개인정보 수집은 줄입니다.' },
    { icon: '📚', title: '교육 · 맞춤 학습 돕기', data: '익명화한 풀이 과정, 오답 유형, 학습 기록', use: '어려워하는 부분을 파악하여 학습 자료나 연습 문제를 제안합니다.', human: '교사는 제안이 학생에게 적절한지 확인하고, 학생의 다양한 경험도 고려합니다.', caution: '기록이 학생의 모든 능력을 설명하지는 않습니다. 낙인이나 편향을 경계합니다.', options: ['학생 가족의 소득과 집 주소', '학습 목적에 필요한 오답 유형', '급식실 친구들의 사적 대화'], answer: 1, why: '맞춤 연습 문제를 고르는 목적에는 오답 유형이 직접 관련됩니다. 목적과 무관한 사생활 자료는 필요하지 않습니다.' },
    { icon: '🏗️', title: '산업 · 설비와 현장 살피기', data: '기계의 온도·진동, 생산 기록, 현장 측정 자료', use: '이상 징후를 찾거나 디지털 트윈으로 실제 현장을 가상 공간에 표현하여 점검합니다.', human: '작업자가 실제 상태와 안전 조건을 확인하고 대응합니다.', caution: '센서 오류나 가상 모형의 한계를 확인해야 합니다.', options: ['작업자 개인 연락처 전체', '방문자의 사적 사진', '설비의 온도와 진동 기록'], answer: 2, why: '기계 이상을 살필 때에는 설비 상태를 나타내는 자료가 직접 필요합니다. 디지털 트윈도 실제 측정 자료와 일치하는지 점검합니다.' },
    { icon: '🎨', title: '문화·예술 · 표현의 확장', data: '이용 조건을 확인한 이미지·음원·문장 등', use: '작품 아이디어를 탐색하거나 AR·VR로 새로운 감상 경험을 설계합니다.', human: '창작자가 표현 의도와 결과를 선택하고, 출처와 이용 조건을 확인합니다.', caution: '저작권, 초상·개인정보, AI 사용 사실 등 책임 있는 활용을 고려합니다.', options: ['허락과 이용 조건이 확인된 창작 자료', '몰래 수집한 친구 얼굴 사진', '유료 작품의 무단 복제 모음'], answer: 0, why: '자료를 구할 수 있다는 것과 자유롭게 쓸 수 있다는 것은 다릅니다. 이용 조건을 확인하고 자신의 창작 의도를 더해야 합니다.' }
  ];
  function showCase(index) {
    Array.from($('caseButtons').children).forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === index)); });
    var item = CASES[index];
    $('caseDetail').innerHTML = '<h3>' + item.icon + ' ' + item.title + '</h3><dl><dt>필요한 자료</dt><dd>' + item.data + '</dd><dt>기술의 활용</dt><dd>' + item.use + '</dd><dt>사람의 역할</dt><dd>' + item.human + '</dd><dt>생각할 점</dt><dd>' + item.caution + '</dd></dl>';
    $('caseQuestion').textContent = '이 사례의 목적에 직접 필요한 자료를 고르면?';
    $('caseOptions').replaceChildren(); $('caseFeedback').textContent = '목적에 필요한 자료와 불필요한 개인정보를 구분해 보세요.';
    item.options.forEach(function (text, choice) {
      var button = document.createElement('button'); button.type = 'button'; button.className = 'button secondary'; button.textContent = text;
      button.addEventListener('click', function () {
        $('caseFeedback').textContent = (choice === item.answer ? '적절해요. ' : '다시 생각해 봅시다. ') + item.why;
        Array.from($('caseOptions').children).forEach(function (other, i) { other.setAttribute('aria-pressed', String(i === choice)); });
      });
      $('caseOptions').appendChild(button);
    });
  }
  CASES.forEach(function (item, index) {
    var button = document.createElement('button'); button.type = 'button'; button.innerHTML = '<span aria-hidden="true">' + item.icon + '</span>' + item.title.split(' · ')[0];
    button.addEventListener('click', function () { showCase(index); }); $('caseButtons').appendChild(button);
  });
  showCase(0);
  $('aiReflection').value = saved.reflection || '';
  function saveAI(showStatus) {
    var ok = ICT.save('ai', { samples: samples, model: model, reflection: $('aiReflection').value, testMoisture: Number($('testMoisture').value), testLight: Number($('testLight').value), predicted: Boolean(prediction), evaluated: Boolean(evaluation), updatedAt: new Date().toISOString() });
    if (showStatus || !ok) $('aiSaveStatus').textContent = ok ? '표본과 성찰을 이 브라우저에 저장했습니다.' : '저장하지 못했습니다. 활동 기록을 내려받아 주세요.';
  }
  $('saveAI').addEventListener('click', function () { saveAI(true); });
  window.addEventListener('ict:before-navigate', function () { saveAI(false); });
  window.addEventListener('pagehide', function () { saveAI(false); });
  $('exportAI').addEventListener('click', function () {
    var text = '5차시 · 데이터로 배우는 인공지능\n교과서 213~215쪽 기반 활동\n\n학습 표본 (' + samples.length + '개)\n' + samples.map(function (sample, i) { return 'T' + (i + 1) + ': 수분 ' + sample.x + ', 빛 ' + sample.y + ', ' + names[sample.label]; }).join('\n');
    text += '\n\n학습 상태: ' + (model ? '학습 완료' : '표본 준비 중') + '\n\n별도 테스트 결과\n';
    text += evaluation ? evaluation.map(function (item) { return 'E' + item.id + ': 정답 ' + names[item.truth] + ', 예측 ' + names[item.predicted] + ' (' + (item.correct ? '맞음' : '오답') + ')'; }).join('\n') : '아직 테스트하지 않았습니다.';
    text += '\n\n나의 성찰\n' + $('aiReflection').value + '\n\n※ 모든 표본은 학습용 가상 자료입니다. 정답률은 위 8개 테스트 표본에 대한 결과입니다.\n';
    ICT.download('5차시_인공지능학습_활동기록.txt', text, 'text/plain;charset=utf-8');
  });
  if (Number.isFinite(saved.testMoisture) && saved.testMoisture >= 0 && saved.testMoisture <= 100) $('testMoisture').value = String(saved.testMoisture);
  if (Number.isFinite(saved.testLight) && saved.testLight >= 0 && saved.testLight <= 100) $('testLight').value = String(saved.testLight);
  $('testMoistureValue').textContent = $('testMoisture').value; $('testLightValue').textContent = $('testLight').value;
  renderSamples(); renderPlot();
  if (model) {
    $('trainingStatus').textContent = '저장된 학습 복원 · ' + model.length + '개 표본';
    $('trainingHint').textContent = '저장된 표본과 학습 모형을 불러왔습니다. 새 조건으로 예측하거나 다시 평가해 보세요.';
    if (saved.predicted) $('predictSample').click();
    if (saved.evaluated) $('evaluateModel').click();
  }
}());

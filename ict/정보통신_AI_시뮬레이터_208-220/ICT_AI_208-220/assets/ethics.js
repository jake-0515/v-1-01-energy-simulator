/* 6차시: 가상 분류기의 조건별 성능과 윤리적 의사결정. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ICT = window.ICT;
  var saved = ICT.load('ethics', {});
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  var labelNames = { bottle: '물병', book: '책' };
  var BIASED = [
    { x: 16, y: 82, label: 'bottle' }, { x: 20, y: 88, label: 'bottle' }, { x: 24, y: 92, label: 'bottle' },
    { x: 26, y: 85, label: 'bottle' }, { x: 30, y: 96, label: 'bottle' }, { x: 34, y: 90, label: 'bottle' },
    { x: 66, y: 10, label: 'book' }, { x: 70, y: 18, label: 'book' }, { x: 74, y: 14, label: 'book' },
    { x: 78, y: 22, label: 'book' }, { x: 82, y: 8, label: 'book' }, { x: 86, y: 16, label: 'book' }
  ];
  var BALANCED = [
    { x: 18, y: 90, label: 'bottle' }, { x: 24, y: 90, label: 'bottle' }, { x: 30, y: 90, label: 'bottle' },
    { x: 18, y: 10, label: 'bottle' }, { x: 24, y: 10, label: 'bottle' }, { x: 30, y: 10, label: 'bottle' },
    { x: 70, y: 90, label: 'book' }, { x: 76, y: 90, label: 'book' }, { x: 82, y: 90, label: 'book' },
    { x: 70, y: 10, label: 'book' }, { x: 76, y: 10, label: 'book' }, { x: 82, y: 10, label: 'book' }
  ];
  var TEST = [
    { x: 22, y: 90, label: 'bottle' }, { x: 28, y: 90, label: 'bottle' }, { x: 22, y: 10, label: 'bottle' }, { x: 28, y: 10, label: 'bottle' },
    { x: 72, y: 90, label: 'book' }, { x: 78, y: 90, label: 'book' }, { x: 72, y: 10, label: 'book' }, { x: 78, y: 10, label: 'book' }
  ];
  var preset = saved.preset === 'balanced' ? 'balanced' : 'biased';
  var auditLog = [], latestAudit = null;
  if (typeof saved.includeBackground === 'boolean') $('includeBackground').checked = saved.includeBackground;
  function dataset() { return preset === 'balanced' ? BALANCED : BIASED; }
  function renderMatrix() {
    $('biasPreset').setAttribute('aria-pressed', String(preset === 'biased'));
    $('balancedPreset').setAttribute('aria-pressed', String(preset === 'balanced'));
    $('biasMatrix').replaceChildren();
    [{ label: 'bottle', bright: true }, { label: 'book', bright: true }, { label: 'bottle', bright: false }, { label: 'book', bright: false }].forEach(function (group) {
      var count = dataset().filter(function (sample) { return sample.label === group.label && (sample.y > 50) === group.bright; }).length;
      var card = document.createElement('div'); card.className = 'bias-cell' + (!count ? ' empty' : '');
      card.innerHTML = '<span class="bias-icon" aria-hidden="true">' + (group.label === 'bottle' ? '🧴' : '📕') + '</span><div><small>' + (group.bright ? '밝은 배경' : '어두운 배경') + '</small><strong>' + labelNames[group.label] + ' 표본 ' + count + '개</strong><small>' + (count ? '이 조합을 학습합니다.' : '이 조합을 보지 못했습니다.') + '</small></div>';
      $('biasMatrix').appendChild(card);
    });
    latestAudit = null; $('biasResults').hidden = true;
    $('biasStatus').textContent = '현재 조건: ' + (preset === 'biased' ? '치우친 조합' : '고른 조합') + ' / ' + ($('includeBackground').checked ? '모양+배경' : '모양만') + '. 시험 버튼으로 확인하세요.';
  }
  $('biasPreset').addEventListener('click', function () { preset = 'biased'; renderMatrix(); });
  $('balancedPreset').addEventListener('click', function () { preset = 'balanced'; renderMatrix(); });
  $('includeBackground').addEventListener('change', renderMatrix);
  function predict(sample, useBackground) {
    var neighbors = dataset().map(function (training, i) { return { label: training.label, index: i, distance: Math.hypot(training.x - sample.x, useBackground ? training.y - sample.y : 0) }; })
      .sort(function (a, b) { return a.distance - b.distance || a.index - b.index; }).slice(0, 3);
    return neighbors.filter(function (neighbor) { return neighbor.label === 'bottle'; }).length >= 2 ? 'bottle' : 'book';
  }
  $('runBiasTest').addEventListener('click', function () {
    var useBackground = $('includeBackground').checked;
    latestAudit = TEST.map(function (sample, i) {
      var result = predict(sample, useBackground);
      return { id: i + 1, truth: sample.label, bright: sample.y > 50, predicted: result, correct: result === sample.label };
    });
    var correct = latestAudit.filter(function (sample) { return sample.correct; }).length;
    $('biasTotal').textContent = (correct / 8 * 100).toFixed(0) + '% · ' + correct + ' / 8';
    $('biasInterpretation').textContent = correct === 8 ? '이 8개 조건에서는 모두 맞혔습니다. 다른 물체·조명·각도에서도 맞는지 별도로 시험해야 합니다.' : '같은 물체라도 배경이 바뀌면 틀리는 조건이 있습니다. 전체 숫자 아래의 조건별 결과를 살펴보세요.';
    $('biasSlices').replaceChildren();
    [{ label: 'bottle', bright: true }, { label: 'book', bright: true }, { label: 'bottle', bright: false }, { label: 'book', bright: false }].forEach(function (group) {
      var slice = latestAudit.filter(function (item) { return item.truth === group.label && item.bright === group.bright; });
      var correctSlice = slice.filter(function (item) { return item.correct; }).length;
      var card = document.createElement('div'); card.className = 'bias-slice' + (correctSlice < slice.length ? ' needs-work' : '');
      card.innerHTML = '<small>' + (group.bright ? '밝은' : '어두운') + ' 배경</small><b>' + labelNames[group.label] + '</b><strong>' + correctSlice + ' / ' + slice.length + '</strong><small>이 조건에서 맞힌 수</small>';
      $('biasSlices').appendChild(card);
    });
    $('biasResultRows').replaceChildren();
    latestAudit.forEach(function (item) {
      var row = document.createElement('tr');
      ['E' + item.id, item.bright ? '밝음' : '어두움', labelNames[item.truth], labelNames[item.predicted], item.correct ? '맞음' : '오답'].forEach(function (text, index) {
        var td = document.createElement('td'); td.textContent = text;
        if (index === 4) td.className = item.correct ? 'success' : 'needs-work';
        row.appendChild(td);
      }); $('biasResultRows').appendChild(row);
    });
    $('biasResults').hidden = false;
    $('biasStatus').textContent = '계산 완료. ' + correct + '개를 맞혔습니다. 표본이나 판단 특징을 바꾸어 비교하세요.';
    var label = (preset === 'biased' ? '치우친 조합' : '고른 조합') + ' / ' + (useBackground ? '모양+배경' : '모양만');
    auditLog = auditLog.filter(function (item) { return item.label !== label; });
    auditLog.push({ label: label, correct: correct }); auditLog = auditLog.slice(-4);
    $('biasComparison').replaceChildren();
    auditLog.forEach(function (entry) {
      var item = document.createElement('div'); item.className = 'bias-log-item';
      var text = document.createElement('span'); text.textContent = entry.label;
      var result = document.createElement('strong'); result.textContent = entry.correct + ' / 8 (' + (entry.correct / 8 * 100).toFixed(0) + '%)';
      item.append(text, result); $('biasComparison').appendChild(item);
    });
  });
  renderMatrix();

  var SCENARIOS = [
    {
      topic: '딥페이크 · 피해 줄이기',
      scene: '친구의 얼굴을 합성해 모욕하는 가짜 영상이 단체 대화방에 올라왔습니다. 가장 적절한 행동은?',
      choices: ['진짜인지 묻기 위해 다른 방에도 보내 본다.', '재전송하지 않고 친구를 지지하며, 믿을 수 있는 어른과 플랫폼의 신고 절차에 도움을 요청한다.', '재미로 만든 것이니 그대로 두고 웃어넘긴다.'],
      answer: 1,
      why: '합성 영상을 퍼뜨리면 피해가 커질 수 있습니다. 공유를 멈추고, 피해자의 의사를 존중하며 도움과 신고 절차를 연결하는 대응이 필요합니다.'
    },
    {
      topic: '개인정보 · 최소한의 자료',
      scene: '학급 행사 안내문을 만들려고 AI에 친구들의 이름·전화번호·주소를 모두 입력하려 합니다. 어떻게 바꾸면 좋을까요?',
      choices: ['안내문의 목적에 필요 없는 개인정보를 빼고, 가상 정보나 익명화한 조건으로 작성한다.', 'AI가 똑똑하므로 많은 개인정보를 넣을수록 좋다.', '친구 한 명의 허락만 받고 모두의 자료를 넣는다.'],
      answer: 0,
      why: '목적을 달성하는 데 필요한 최소한의 자료를 사용해야 합니다. 다른 사람의 자료는 적절한 동의와 이용 범위를 확인하며, 불필요한 수집·전달을 줄입니다.'
    },
    {
      topic: '편향 · 조건별 점검',
      scene: '우리 분류기는 전체 정답률은 높지만, 어두운 배경의 물체만 반복해서 틀립니다. 다음 행동으로 적절한 것은?',
      choices: ['전체 정답률이 높으므로 그 조건은 무시한다.', '오답이 나온 테스트 자료를 지운다.', '해당 조건의 학습 자료와 판단 특징을 살피고, 보완한 뒤 별도의 새 자료로 다시 시험한다.'],
      answer: 2,
      why: '한 조건의 오류가 전체 숫자에 가려질 수 있습니다. 어떤 경우에 불리한지 확인하고 자료·특징·사용 환경을 보완한 뒤, 학습에 쓰지 않은 자료로 검증합니다.'
    },
    {
      topic: '창작 · 이용 조건과 출처',
      scene: 'AI로 축제 홍보물을 만들며 인터넷의 그림과 음악을 참고하려 합니다. 어떤 태도가 적절할까요?',
      choices: ['검색되는 자료는 모두 자유롭게 복제해도 된다.', '자료의 이용 조건과 출처를 확인하고, 필요한 허락을 구하며 자신의 표현 의도를 더한다.', 'AI를 거치면 자료의 이용 조건은 전혀 고려할 필요가 없다.'],
      answer: 1,
      why: '접근할 수 있다는 것과 원하는 방식으로 이용할 수 있다는 것은 다릅니다. 자료의 이용 조건을 확인하고, 창작 과정과 AI의 역할을 정직하게 설명합니다.'
    },
    {
      topic: '정확성 · 사람의 검토',
      scene: 'AI가 발표 자료에 넣을 과학 사실을 자신 있게 말했지만 근거를 제시하지 못했습니다. 어떻게 할까요?',
      choices: ['말투가 확실하므로 그대로 발표한다.', '같은 문장을 여러 번 물어 모두 같으면 검증이 끝난 것이다.', '교과서나 믿을 수 있는 자료로 확인하고, 확인되지 않은 내용은 사실로 단정하지 않는다.'],
      answer: 2,
      why: '자신 있는 표현이 정확성을 보장하지 않습니다. AI의 오류 가능성을 고려해 신뢰할 수 있는 근거와 대조하고, 확인되지 않은 부분을 구분해야 합니다.'
    },
    {
      topic: '책임 · 예상하지 못한 피해',
      scene: '친구를 돕기 위해 만든 AI 추천 도구가 일부 친구를 반복해서 소외시킨다는 의견이 나왔습니다. 어떻게 대응할까요?',
      choices: ['좋은 의도로 만들었으니 계속 사용해도 된다.', '영향을 살피고 사용을 조정하거나 멈춘 뒤, 원인과 대안을 검토하고 개선 여부를 확인한다.', '불편함을 말한 친구만 이용하지 못하게 한다.'],
      answer: 1,
      why: '좋은 의도만으로 결과의 책임이 사라지지 않습니다. 실제 영향을 듣고 피해를 줄이는 대응, 원인 점검, 개선과 재평가가 필요합니다.'
    },
    {
      topic: '투명성 · AI의 역할 알리기',
      scene: 'AI가 제안한 문장을 고쳐 만든 작품을 발표합니다. 제작 과정을 어떻게 설명하면 좋을까요?',
      choices: ['AI가 한 역할과 내가 판단·수정한 부분을 알리고, 이용한 자료의 출처를 함께 확인한다.', '내가 모두 직접 만들었다고 말한다.', 'AI가 만든 결과이므로 내용의 오류도 책임질 필요가 없다.'],
      answer: 0,
      why: 'AI가 도운 부분과 자신의 기여를 구분하면 다른 사람이 제작 과정을 이해할 수 있습니다. 최종 결과를 선택하고 활용하는 사람도 내용을 검토해야 합니다.'
    },
    {
      topic: '사생활 · 목적에 맞는 설계',
      scene: '복도의 위험 상황을 찾는 AI를 설계하며 학생의 얼굴과 하루 이동 경로를 계속 저장하려 합니다. 먼저 살펴볼 질문은?',
      choices: ['가능한 많은 자료를 영구 보관하면 좋은가?', '모든 친구의 이동 기록을 공개하면 편한가?', '안전 목적에 이 자료가 꼭 필요한가? 식별 정보를 덜 쓰는 방법, 보관 기간, 접근 권한, 오류 대응은 무엇인가?'],
      answer: 2,
      why: '문제를 해결하는 이익과 사생활에 미치는 영향을 함께 따져야 합니다. 목적에 꼭 필요한 자료와 대안을 검토하고, 사용 범위와 사람의 감독을 설계합니다.'
    }
  ];
  var answers = Array(SCENARIOS.length).fill(null);
  if (Array.isArray(saved.answers)) {
    saved.answers.slice(0, SCENARIOS.length).forEach(function (answer, i) {
      if (answer && Number.isInteger(answer.choice) && answer.choice >= 0 && answer.choice < SCENARIOS[i].choices.length) {
        answers[i] = { choice: answer.choice, reason: typeof answer.reason === 'string' ? answer.reason : '' };
      }
    });
  }
  var scenarioIndex = answers.findIndex(function (answer) { return !answer; });
  if (scenarioIndex < 0) scenarioIndex = SCENARIOS.length;
  var selection = null;
  var fields = ['ethicsBenefits', 'ethicsRisks', 'ethicsDecision', 'ethicsDecisionReason', 'ethicsReflection'];
  fields.forEach(function (id) { if (typeof saved[id] === 'string') $(id).value = saved[id]; });
  for (var p = 0; p < 5; p++) { if (Array.isArray(saved.promises)) $('ethicsPromise' + p).checked = Boolean(saved.promises[p]); }
  function currentRecord() {
    var record = { preset: preset, includeBackground: $('includeBackground').checked, answers: answers, promises: [], updatedAt: new Date().toISOString() };
    if (scenarioIndex < SCENARIOS.length && !answers[scenarioIndex]) record.pending = { index: scenarioIndex, choice: selection, reason: $('ethicsReason').value };
    fields.forEach(function (id) { record[id] = $(id).value; });
    for (var i = 0; i < 5; i++) record.promises.push($('ethicsPromise' + i).checked);
    return record;
  }
  function persist(showStatus) {
    var ok = ICT.save('ethics', currentRecord());
    if (showStatus || !ok) $('ethicsSaveStatus').textContent = ok ? '판단과 성찰을 이 브라우저에 저장했습니다.' : '저장하지 못했습니다. 활동 기록을 내려받아 보관해 주세요.';
    return ok;
  }
  function renderScenario() {
    if (scenarioIndex >= SCENARIOS.length) { renderGameResult(); return; }
    $('ethicsScene').hidden = false; $('ethicsGameResult').hidden = true;
    var item = SCENARIOS[scenarioIndex], previous = answers[scenarioIndex];
    var pending = saved.pending && saved.pending.index === scenarioIndex ? saved.pending : null;
    selection = previous ? previous.choice : pending && Number.isInteger(pending.choice) && pending.choice >= 0 && pending.choice < item.choices.length ? pending.choice : null;
    $('ethicsScenarioTag').textContent = '상황 ' + (scenarioIndex + 1) + ' / ' + SCENARIOS.length + ' · ' + item.topic;
    $('ethicsScenarioText').textContent = item.scene;
    $('ethicsOptions').replaceChildren(); $('ethicsAnswer').hidden = true;
    $('ethicsReason').value = previous ? previous.reason : pending && typeof pending.reason === 'string' ? pending.reason : ''; $('ethicsReason').disabled = Boolean(previous);
    $('checkEthics').disabled = selection === null || Boolean(previous); $('nextEthics').hidden = !previous;
    $('nextEthics').textContent = scenarioIndex === SCENARIOS.length - 1 ? '판단 결과 보기 →' : '다음 상황 →';
    $('ethicsProgress').textContent = answers.filter(Boolean).length + ' / ' + SCENARIOS.length + '개 판단 완료';
    item.choices.forEach(function (text, index) {
      var label = document.createElement('label'); label.className = 'ethics-option';
      var radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'ethics-choice'; radio.value = String(index); radio.checked = selection === index; radio.disabled = Boolean(previous);
      var span = document.createElement('span'); span.textContent = text; label.append(radio, span);
      if (selection === index) label.classList.add('selected');
      radio.addEventListener('change', function () {
        if (answers[scenarioIndex]) return;
        selection = index; $('checkEthics').disabled = false;
        Array.from($('ethicsOptions').children).forEach(function (choice, i) { choice.classList.toggle('selected', i === index); });
      });
      $('ethicsOptions').appendChild(label);
    });
    if (previous) showAnswer();
  }
  function showAnswer() {
    var item = SCENARIOS[scenarioIndex], selected = answers[scenarioIndex].choice;
    $('ethicsAnswer').replaceChildren();
    var heading = document.createElement('b'); heading.textContent = selected === item.answer ? '책임 있는 대응을 골랐어요.' : '다른 대응을 함께 살펴봅시다.';
    var why = document.createElement('p'); why.textContent = item.why;
    var recommended = document.createElement('p'); recommended.textContent = '권장 대응: ' + item.choices[item.answer];
    $('ethicsAnswer').append(heading, why, recommended); $('ethicsAnswer').hidden = false;
    Array.from($('ethicsOptions').children).forEach(function (label, index) { label.querySelector('input').disabled = true; label.classList.toggle('is-correct', index === item.answer); });
    $('ethicsReason').disabled = true; $('checkEthics').disabled = true; $('nextEthics').hidden = false;
    $('ethicsProgress').textContent = answers.filter(Boolean).length + ' / ' + SCENARIOS.length + '개 판단 완료';
  }
  $('checkEthics').addEventListener('click', function () {
    if (selection === null || scenarioIndex >= SCENARIOS.length || answers[scenarioIndex]) return;
    answers[scenarioIndex] = { choice: selection, reason: $('ethicsReason').value };
    showAnswer(); persist(false);
  });
  $('nextEthics').addEventListener('click', function () {
    if (!answers[scenarioIndex]) return;
    scenarioIndex++; renderScenario();
    if (scenarioIndex < SCENARIOS.length) { $('ethicsScenarioText').setAttribute('tabindex', '-1'); $('ethicsScenarioText').focus(); }
  });
  function renderGameResult() {
    $('ethicsScene').hidden = true; $('ethicsGameResult').hidden = false; $('ethicsGameResult').replaceChildren();
    var correct = answers.filter(function (answer, i) { return answer && answer.choice === SCENARIOS[i].answer; }).length;
    var heading = document.createElement('h3'); heading.textContent = '상황 판단 완료 · ' + correct + ' / ' + SCENARIOS.length;
    var intro = document.createElement('p'); intro.textContent = '점수보다 중요한 것은 판단의 근거입니다. 잘못 고른 상황을 포함해, 권장 대응과 자신의 이유를 다시 살펴보세요.';
    $('ethicsGameResult').append(heading, intro);
    var summary = document.createElement('div'); summary.className = 'ethics-choice-summary';
    SCENARIOS.forEach(function (item, i) {
      var card = document.createElement('div'), title = document.createElement('b'), text = document.createElement('p');
      title.textContent = (answers[i] && answers[i].choice === item.answer ? '✓ ' : '↻ ') + item.topic; text.textContent = item.choices[item.answer];
      card.append(title, text);
      if (answers[i] && answers[i].reason) { var note = document.createElement('small'); note.textContent = '내가 쓴 이유: ' + answers[i].reason; card.appendChild(note); }
      summary.appendChild(card);
    });
    $('ethicsGameResult').appendChild(summary);
  }
  $('restartEthics').addEventListener('click', function () {
    answers = Array(SCENARIOS.length).fill(null); scenarioIndex = 0; selection = null; saved.pending = null; renderScenario(); persist(false);
    $('ethicsScenarioText').setAttribute('tabindex', '-1'); $('ethicsScenarioText').focus();
  });
  $('saveEthics').addEventListener('click', function () { persist(true); });
  window.addEventListener('ict:before-navigate', function () { persist(false); });
  window.addEventListener('pagehide', function () { persist(false); });
  fields.forEach(function (id) { $(id).addEventListener('change', function () { persist(false); }); });
  for (var promiseIndex = 0; promiseIndex < 5; promiseIndex++) $('ethicsPromise' + promiseIndex).addEventListener('change', function () { persist(false); });
  $('exportEthics').addEventListener('click', function () {
    var record = currentRecord();
    var text = '6차시 · 인공지능 윤리\n교과서 216~217쪽 기반 활동\n\n편향 실험 비교\n';
    text += auditLog.length ? auditLog.map(function (entry) { return entry.label + ': ' + entry.correct + ' / 8 정답'; }).join('\n') : '아직 실험하지 않았습니다.';
    text += '\n\n8가지 상황 판단\n';
    text += SCENARIOS.map(function (item, i) {
      var answer = answers[i];
      return (i + 1) + '. ' + item.topic + '\n내 선택: ' + (answer ? item.choices[answer.choice] : '미응답') + '\n내 이유: ' + (answer ? answer.reason : '') + '\n권장 대응: ' + item.choices[item.answer];
    }).join('\n\n');
    text += '\n\nCCTV와 AI의 순기능\n' + record.ethicsBenefits + '\n\n역기능과 예상 피해\n' + record.ethicsRisks;
    text += '\n\n나의 결정\n' + record.ethicsDecision + '\n이유: ' + record.ethicsDecisionReason;
    text += '\n\n내 AI의 약속\n' + record.ethicsReflection + '\n\n※ 편향 실험은 가상 표본과 3-NN 분류를 사용한 학습 모형입니다.\n';
    ICT.download('6차시_인공지능윤리_활동기록.txt', text, 'text/plain;charset=utf-8');
  });
  renderScenario();
}());

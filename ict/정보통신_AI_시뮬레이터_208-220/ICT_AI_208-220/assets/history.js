/* 4차시: 전송 매체 비교와 실제 모스 부호 변환. 외부 서비스 없이 동작합니다. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ICT = window.ICT;
  var ERAS = [
    { name: '몸짓·소리·그림', icon: '🗣️', tag: '생각을 표현하다', change: '몸짓과 소리, 그림으로 뜻을 전하기 시작했습니다.', problem: '함께 있지 않은 사람에게 보내거나 같은 내용을 오래 남기는 데 제약이 있었습니다.', question: '말소리가 들리지 않는 거리에서는 어떻게 뜻을 전할까요?' },
    { name: '문자·인쇄', icon: '📜', tag: '기록하고 널리 나누다', change: '문자는 지식을 기록하고 전달하게 했고, 인쇄는 같은 내용을 여러 부로 보급하는 데 도움을 주었습니다.', problem: '기록물을 옮겨야 하므로 먼 곳에 도착하기까지 시간이 걸렸습니다.', question: '같은 안내문을 많은 사람에게 보내려면 무엇이 필요할까요?' },
    { name: '전신·전화', icon: '☎️', tag: '전기 신호로 멀리 보내다', change: '전신은 부호를, 전화는 음성을 전기 신호로 전달하여 멀리 있는 사람과 빠르게 소통하게 했습니다.', problem: '이 수업의 개별 전달 모형에서는 받는 곳마다 별도로 연락해야 합니다.', question: '한 사람과 대화하는 것과 수백 명에게 알리는 것은 어떻게 다를까요?' },
    { name: '라디오·텔레비전', icon: '📺', tag: '한 번에 많은 사람에게', change: '방송을 통해 여러 사람이 소식과 음성·영상을 동시에 접할 수 있게 되었습니다.', problem: '방송을 듣는 사람이 같은 방송 경로로 즉시 답하기는 어렵습니다.', question: '방송한 내용을 시청자가 잘 이해했는지 어떻게 확인할까요?' },
    { name: '컴퓨터·인터넷', icon: '🌐', tag: '저장·처리·연결하다', change: '컴퓨터는 많은 자료를 빠르게 처리하고, 인터넷은 컴퓨터와 기기들을 연결하여 정보를 주고받게 합니다.', problem: '쉽게 연결되는 만큼 정보의 신뢰성, 보안, 접근의 차이도 함께 살펴야 합니다.', question: '정보를 받는 사람이 직접 정보를 생산하면 무엇이 달라질까요?' },
    { name: '연결의 확대·AI 활용', icon: '🛰️', tag: '전달을 넓히고 의미를 찾다', change: '광통신과 위성 통신은 연결을 넓히고, 인공지능은 수많은 자료에서 패턴을 찾아 분류·예측 등에 활용됩니다.', problem: 'AI의 판단에도 오류가 생기며, 데이터와 사용 목적을 사람이 검토해야 합니다.', question: '빠르게 전송하는 기술과 자료를 분석하는 기술은 역할이 같을까요?' }
  ];
  function renderEra(index) {
    document.querySelectorAll('.era-card').forEach(function (button, i) { button.setAttribute('aria-pressed', String(index === i)); });
    var era = ERAS[index];
    $('eraDetail').innerHTML = '<span class="era-reason">' + era.tag + '</span><h3>' + era.icon + ' ' + era.name + '</h3><p><b>가능해진 일</b> · ' + era.change + '</p><p><b>남은 과제</b> · ' + era.problem + '</p><p style="color:#bae6fd"><b>생각 질문</b> · ' + era.question + '</p>';
  }
  ERAS.forEach(function (era, i) {
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'era-card';
    button.innerHTML = '<span class="era-symbol" aria-hidden="true">' + era.icon + '</span><span><b>' + era.name + '</b><small>' + era.tag + '</small></span>';
    button.addEventListener('click', function () { renderEra(i); });
    $('eraCards').appendChild(button);
  });
  renderEra(0);

  var order = [3, 0, 5, 2, 1, 4];
  var orderChecked = false;
  function renderOrder(focusAt, direction) {
    $('eraOrder').replaceChildren();
    order.forEach(function (item, i) {
      var row = document.createElement('li');
      row.className = 'order-row';
      if (orderChecked) row.dataset.correct = String(item === i);
      var number = document.createElement('span'); number.className = 'order-index'; number.textContent = String(i + 1);
      var label = document.createElement('span'); label.className = 'order-label'; label.textContent = ERAS[item].icon + ' ' + ERAS[item].name;
      row.append(number, label);
      [-1, 1].forEach(function (delta) {
        var move = document.createElement('button');
        move.type = 'button'; move.className = 'button secondary'; move.textContent = delta === -1 ? '↑' : '↓';
        move.setAttribute('aria-label', ERAS[item].name + (delta === -1 ? ' 위로' : ' 아래로'));
        move.disabled = i + delta < 0 || i + delta >= order.length;
        move.addEventListener('click', function () {
          var target = i + delta; var former = order[target]; order[target] = order[i]; order[i] = former;
          orderChecked = false; renderOrder(target, delta);
          $('orderFeedback').textContent = '순서를 바꾸었습니다. 준비가 되면 순서 확인을 눌러 보세요.';
        });
        row.appendChild(move);
      });
      $('eraOrder').appendChild(row);
    });
    if (Number.isInteger(focusAt)) {
      var rowButtons = $('eraOrder').children[focusAt].querySelectorAll('button');
      var selected = rowButtons[direction === -1 ? 0 : 1];
      if (selected.disabled) selected = rowButtons[direction === -1 ? 1 : 0];
      selected.focus();
    }
  }
  $('checkOrder').addEventListener('click', function () {
    orderChecked = true; renderOrder();
    var correct = order.filter(function (item, i) { return item === i; }).length;
    $('orderFeedback').textContent = correct === ERAS.length ? '모두 연결했어요! 표현 → 기록·보급 → 전기 신호 → 방송 → 디지털 연결 → 분석·활용으로 가능성이 넓어졌습니다. 마지막 묶음의 기술도 다른 기술과 겹쳐 발전했다는 점을 기억하세요.' : '현재 ' + correct + ' / ' + ERAS.length + '개가 대표 흐름과 맞습니다. 위의 시간 여행 카드를 다시 살펴보고 바꾸어 보세요.';
  });
  $('shuffleOrder').addEventListener('click', function () {
    order = ERAS.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var temp = order[i]; order[i] = order[j]; order[j] = temp; }
    if (order.every(function (item, i) { return item === i; })) order.reverse();
    orderChecked = false; renderOrder(); $('orderFeedback').textContent = '다시 섞었습니다. ↑ ↓로 흐름을 복원해 보세요.';
  });
  renderOrder();

  var MEDIA = {
    letter: { name: '종이 편지', icon: '✉️', supports: ['text'], types: '문자 안내', perPerson: true, kind: '개별 전달', returnName: '답장', returnText: '받은 사람이 편지를 다시 보내야 합니다.' },
    telegraph: { name: '전신', icon: '⚡', supports: ['text'], types: '문자를 부호로', perPerson: true, kind: '개별 신호 전달', returnName: '회신 전신', returnText: '받는 곳에서 부호를 만들어 회신합니다.' },
    phone: { name: '전화', icon: '☎️', supports: ['voice'], types: '음성 안내', perPerson: true, kind: '한 명씩 통화', returnName: '즉시 대화', returnText: '통화 중 서로 질문하고 답할 수 있습니다.' },
    radio: { name: '라디오', icon: '📻', supports: ['voice'], types: '음성 안내', perPerson: false, kind: '한 번에 방송', returnName: '별도 연락', returnText: '같은 수신 경로로 답할 수 없어 전화 등 다른 방법이 필요합니다.' },
    internet: { name: '인터넷 게시', icon: '🌐', supports: ['text', 'voice', 'video'], types: '문자·음성·영상', perPerson: false, kind: '한 번 게시·함께 열람', returnName: '댓글·메시지', returnText: '서비스의 기능과 권한에 따라 답하거나 함께 편집할 수 있습니다.' }
  };
  var sendTimer = null;
  function updateMedium() {
    clearTimeout(sendTimer);
    var medium = MEDIA[$('medium').value], count = Number($('recipients').value), available = medium.supports.includes($('payload').value);
    $('mediumName').textContent = medium.name; $('mediumIcon').textContent = medium.icon; $('mediumKind').textContent = medium.kind;
    $('recipientLabel').textContent = count + '명'; $('supportStat').textContent = available ? '전달 가능' : '이 표현은 불가';
    $('supportDetail').textContent = '이 모형의 지원 표현: ' + medium.types;
    $('countStat').textContent = available ? (medium.perPerson ? count : 1) + '회' : '전달 방법 변경';
    $('countDetail').textContent = medium.perPerson ? '수신자마다 따로 보내는 모형입니다.' : '한 번 보낸 내용을 여러 명이 받는 모형입니다.';
    $('feedbackStat').textContent = medium.returnName; $('feedbackDetail').textContent = medium.returnText;
    $('recipientNode').classList.remove('is-arrived'); $('arrivalLabel').textContent = '아직 전달 전';
    $('signalProgress').style.width = '0%'; $('sendMessage').disabled = false;
    $('transportFeedback').textContent = '이 조건으로 전달해 보세요. 수신 기기·접속·수신 권한이 갖추어져 있다고 가정합니다.';
  }
  ['medium', 'payload', 'recipients'].forEach(function (id) { $(id).addEventListener('change', updateMedium); });
  $('sendMessage').addEventListener('click', function () {
    var medium = MEDIA[$('medium').value], count = Number($('recipients').value), payload = $('payload').selectedOptions[0].textContent;
    if (!medium.supports.includes($('payload').value)) {
      $('transportFeedback').textContent = medium.name + ' 모형은 ' + medium.types + '를 전달합니다. ' + payload + '를 그대로 보내려면 다른 매체를 고르거나 표현 방식을 바꾸어야 합니다.';
      return;
    }
    $('sendMessage').disabled = true; $('signalProgress').style.width = '100%'; $('arrivalLabel').textContent = '전달 과정 살펴보는 중';
    $('transportFeedback').textContent = medium.name + '로 소식을 보내고 있습니다. 이 애니메이션의 길이는 실제 통신 시간이 아닙니다.';
    sendTimer = setTimeout(function () {
      $('sendMessage').disabled = false; $('recipientNode').classList.add('is-arrived'); $('arrivalLabel').textContent = '전달 완료';
      $('transportFeedback').textContent = count + '명에게 전달했습니다. 이 모형에서는 발송 ' + (medium.perPerson ? count : 1) + '회가 필요합니다. ' + medium.returnText;
    }, 650);
  });
  updateMedium();

  var MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.' };
  var reverseMorse = Object.fromEntries(Object.entries(MORSE).map(function (entry) { return [entry[1], entry[0]]; }));
  var playbackTimers = [], audioContext = null, oscillator = null, gain = null, encodedText = 'SOS';
  function stopPlayback() {
    playbackTimers.forEach(clearTimeout); playbackTimers = []; $('morseLamp').classList.remove('lit');
    if (gain && audioContext) gain.gain.setValueAtTime(0, audioContext.currentTime);
    if (oscillator) { try { oscillator.stop(); } catch (_) {} oscillator = null; }
    if (audioContext) { audioContext.close().catch(function () {}); audioContext = null; gain = null; }
    $('playMorse').disabled = false; $('stopMorse').disabled = true;
  }
  function encode() {
    stopPlayback();
    var text = $('morseInput').value.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!text || /[^A-Z0-9 ]/.test(text)) {
      encodedText = ''; $('morseOutput').textContent = '영문 A~Z, 숫자 0~9, 공백으로 한 글자 이상 입력해 주세요.';
      $('morsePlaybackStatus').textContent = '입력 문자를 확인해 주세요.'; $('playMorse').disabled = true; return false;
    }
    encodedText = text; $('morseInput').value = text; $('morseOutput').replaceChildren();
    Array.from(text).forEach(function (character) {
      var cell = document.createElement('span');
      if (character === ' ') { cell.className = 'morse-space'; cell.textContent = '/'; }
      else {
        cell.className = 'morse-letter'; var code = document.createElement('strong'), label = document.createElement('small');
        code.textContent = MORSE[character].replace(/\./g, '·').replace(/-/g, '−'); label.textContent = character; cell.append(code, label);
      }
      $('morseOutput').appendChild(cell);
    });
    $('morsePlaybackStatus').textContent = '짧은 신호와 긴 신호의 길이를 비교해 보세요.';
    return true;
  }
  $('encodeMorse').addEventListener('click', encode);
  $('morseInput').addEventListener('input', function () { stopPlayback(); encodedText = ''; $('morsePlaybackStatus').textContent = '내용이 바뀌었습니다. 부호로 바꾸기를 눌러 주세요.'; $('playMorse').disabled = true; });
  $('morseExample').addEventListener('click', function () { $('morseInput').value = 'SOS'; encode(); });
  $('stopMorse').addEventListener('click', function () { stopPlayback(); $('morsePlaybackStatus').textContent = '전송을 멈췄습니다.'; });
  $('playMorse').addEventListener('click', function () {
    if (!encodedText) return;
    stopPlayback(); $('playMorse').disabled = true; $('stopMorse').disabled = false;
    var soundAvailable = true;
    if ($('morseSound').checked) {
      try {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) throw new Error('no-audio');
        audioContext = new AudioCtor(); oscillator = audioContext.createOscillator(); gain = audioContext.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 600; gain.gain.value = 0;
        oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start();
        audioContext.resume().catch(function () {});
      } catch (_) { soundAvailable = false; }
    }
    var unit = 145, elapsed = 0;
    Array.from(encodedText).forEach(function (character, charIndex) {
      if (character === ' ') { elapsed += 4 * unit; return; }
      Array.from(MORSE[character]).forEach(function (mark, markIndex) {
        var duration = (mark === '.' ? 1 : 3) * unit;
        playbackTimers.push(setTimeout(function () {
          $('morseLamp').classList.add('lit');
          $('morsePlaybackStatus').textContent = (charIndex + 1) + ' / ' + encodedText.length + ' · ' + character + ' · ' + (mark === '.' ? '짧은 신호' : '긴 신호') + (!soundAvailable ? ' (소리 미지원: 빛으로 표시)' : '');
          if (gain && audioContext) gain.gain.setValueAtTime(0.035, audioContext.currentTime);
        }, elapsed));
        elapsed += duration;
        playbackTimers.push(setTimeout(function () {
          $('morseLamp').classList.remove('lit');
          if (gain && audioContext) gain.gain.setValueAtTime(0, audioContext.currentTime);
        }, elapsed));
        if (markIndex < MORSE[character].length - 1) elapsed += unit;
      });
      elapsed += 3 * unit;
    });
    playbackTimers.push(setTimeout(function () { stopPlayback(); $('morsePlaybackStatus').textContent = '전송 완료 · 글자 사이의 쉼까지 함께 정보를 구분합니다.'; }, elapsed));
  });
  Object.keys(MORSE).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (letter) {
    var span = document.createElement('span'); span.textContent = letter + ' ' + MORSE[letter]; $('morseReference').appendChild(span);
  });
  $('decodeMorse').addEventListener('click', function () {
    var code = $('decodeInput').value.trim().replace(/[·•]/g, '.').replace(/[−–—]/g, '-');
    if (!code || /[^.\-\s/]/.test(code)) { $('decodeResult').textContent = '점(.), 선(-), 공백, /만 입력해 주세요.'; return; }
    var invalid = false;
    var decoded = code.split(/\s*\/\s*/).map(function (word) {
      return word.trim().split(/\s+/).map(function (sequence) { if (!reverseMorse[sequence]) { invalid = true; return '?'; } return reverseMorse[sequence]; }).join('');
    }).join(' ');
    $('decodeResult').textContent = decoded + (invalid ? ' · ?는 부호표에 없는 조합입니다.' : ' · 해독 완료');
  });
  window.addEventListener('pagehide', function () { stopPlayback(); clearTimeout(sendTimer); });
  encode();

  var saved = ICT.load('history', {});
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  $('historyReflection').value = saved.reflection || '';
  function saveHistory(showStatus) {
    var ok = ICT.save('history', { reflection: $('historyReflection').value, updatedAt: new Date().toISOString() });
    if (showStatus || !ok) $('historySaveStatus').textContent = ok ? '이 브라우저에 저장했습니다.' : '저장하지 못했습니다. 활동 기록을 내려받아 보관해 주세요.';
  }
  $('saveHistory').addEventListener('click', function () { saveHistory(true); });
  window.addEventListener('ict:before-navigate', function () { saveHistory(false); });
  window.addEventListener('pagehide', function () { saveHistory(false); });
  $('exportHistory').addEventListener('click', function () {
    var medium = MEDIA[$('medium').value];
    var text = '4차시 · 정보 통신 기술의 발달\n교과서 212~213쪽 기반 활동\n\n선택한 매체: ' + medium.name + '\n전달 표현: ' + $('payload').selectedOptions[0].textContent + '\n받는 사람: ' + $('recipients').value + '명\n\n나의 생각\n' + $('historyReflection').value + '\n\n※ 매체 비교는 명시된 조건을 사용한 학습 모형입니다.\n';
    ICT.download('4차시_정보통신의발달_활동기록.txt', text, 'text/plain;charset=utf-8');
  });
}());

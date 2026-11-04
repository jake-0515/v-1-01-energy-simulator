(() => {
  'use strict';
  const P=window.ICTProject;
  const $=id=>document.getElementById(id);
  let project=P.load();let timer;
  const problemFields={audience:'problemAudience',situation:'problemSituation',success:'problemSuccess'};
  const partFields={role:'partRole',goal:'partGoal',context:'partContext',format:'partFormat',constraints:'partConstraints',example:'partExample'};
  function read(){Object.entries(problemFields).forEach(([k,id])=>{project.problem[k]=$(id).value;});Object.entries(partFields).forEach(([k,id])=>{project.parts[k]=$(id).value;});project.promptDraft=$('assembledPrompt').value;project.promptReflection=$('promptReflection').value;}
  function save(){clearTimeout(timer);read();const ok=P.save(project);$('promptSaveStatus').textContent=ok?'이 브라우저에 저장됨 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'저장하지 못했습니다. 설계 기록을 내려받아 보관하세요.';return ok;}
  function topicUI(){document.querySelectorAll('.topic-choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===project.topic)));$('topicDescription').textContent=P.TEMPLATES[project.topic].description;}
  function fill(){Object.entries(problemFields).forEach(([k,id])=>{$(id).value=project.problem[k];});Object.entries(partFields).forEach(([k,id])=>{$(id).value=project.parts[k];});$('assembledPrompt').value=project.promptDraft;$('promptReflection').value=project.promptReflection;topicUI();render();}
  function checks(){const root=$('promptChecks');root.replaceChildren();P.PART_KEYS.forEach(k=>{const span=document.createElement('span');const filled=Boolean(project.parts[k].trim());span.className='prompt-check'+(filled?' filled':'');span.textContent=(filled?'✓ ':'○ ')+P.PART_NAMES[k];root.append(span);});}
  function comparison(){
    const t=project.topic;
    const simple={energy:['에너지 절약 방법을 알려 줘.','전기를 아껴 씁니다.\n사용하지 않는 전등을 끕니다.\n전기기기를 점검합니다.'],recycle:['분리배출 방법을 알려 줘.','재질을 확인합니다.\n내용물을 비웁니다.\n맞는 수거함에 넣습니다.'],study:['공부 계획을 세워 줘.','핵심 내용을 읽습니다.\n문제를 풀어 봅니다.\n모르는 것을 다시 확인합니다.'],custom:['내 문제를 해결해 줘.','어떤 문제인지, 누구의 문제인지 알기 어렵습니다.\n원하는 결과와 조건을 먼저 정해 보세요.']};
    $('simplePromptLabel').textContent=simple[t][0];$('simplePromptOutput').textContent=simple[t][1];
    const filled=P.PART_KEYS.filter(k=>project.parts[k].trim());
    if(!filled.length){$('structuredPromptOutput').textContent='위에서 역할·목적·배경·결과 형식·조건·예시를 작성해 보세요. 작성한 요소와 선택한 주제로 예시를 비교합니다.';$('comparisonHint').textContent='두 답안 중 어느 쪽을 실제 행동으로 옮기기 쉬운지, 판단 근거를 찾아보세요.';return;}
    const format=/표/.test(project.parts.format)?'table':/체크/.test(project.parts.format)?'checklist':'steps';
    const number=project.parts.format.match(/([2-5])\s*(?:행|가지|개|단계)/);
    const cfg={topic:t,format,count:number?Number(number[1]):3};
    const example=P.simulate(cfg,P.TEMPLATES[t].sample);
    let lead='설계에 명시한 요소: '+filled.map(k=>P.PART_NAMES[k]).join(' · ');
    if(project.problem.audience)lead+='\n사용 대상: '+project.problem.audience;
    if(project.problem.success)lead+='\n성공 기준: '+project.problem.success;
    $('structuredPromptOutput').textContent=lead+'\n\n'+P.resultText(example,format);
    $('comparisonHint').textContent='예시는 선택 주제와 결과 형식의 “표·체크리스트·2~5개” 같은 표현을 읽어 구성을 바꿉니다. 자유 문장의 의미를 이해한 결과는 아니며, 실제 AI에서는 같은 프롬프트도 다른 답을 낼 수 있습니다.';
  }
  function render(){checks();comparison();}
  function delayedSave(){read();render();$('promptSaveStatus').textContent='변경 사항 저장 중…';clearTimeout(timer);timer=setTimeout(save,350);}
  Object.values(problemFields).concat(Object.values(partFields),['assembledPrompt','promptReflection']).forEach(id=>$(id).addEventListener('input',delayedSave));
  document.querySelectorAll('.topic-choice').forEach(button=>button.addEventListener('click',()=>{read();project.topic=button.dataset.topic;topicUI();render();save();}));
  $('loadPromptExample').addEventListener('click',()=>{read();if(project.topic==='custom'){window.ICT.message('자유주제는 내가 발견한 문제와 지시문을 직접 적어 주세요.','info');$('problemSituation').focus();return;}P.applyTemplate(project,project.topic);fill();save();window.ICT.message('예시를 넣었습니다. 우리 상황에 맞게 고쳐 쓰세요.','info');});
  $('composePrompt').addEventListener('click',()=>{read();const text=P.compose(project);if(!text){window.ICT.message('문제 상황이나 지시문을 먼저 작성하세요.','warn');$('problemSituation').focus();return;}$('assembledPrompt').value=text;save();window.ICT.message('설계 요소를 하나의 프롬프트로 조합했습니다.','success');});
  $('copyDesignedPrompt').addEventListener('click',()=>{read();P.copy(project.promptDraft);});
  $('downloadPrompt').addEventListener('click',()=>{save();const text=['나의 프롬프트 설계 기록','주제: '+P.TEMPLATES[project.topic].label,'사용 대상: '+project.problem.audience,'문제 상황: '+project.problem.situation,'성공 기준: '+project.problem.success,'','[프롬프트]',project.promptDraft,'','[비교 성찰]',project.promptReflection,'','※ 수업의 비교 출력은 실제 AI를 호출하지 않은 규칙 기반 예시입니다.'].join('\n');window.ICT.download('my-prompt-design.txt',text,'text/plain;charset=utf-8');});
  $('savePromptProject').addEventListener('click',()=>{read();if(!project.problem.situation.trim()){window.ICT.message('해결하려는 문제 상황을 한 문장으로 적어 주세요.','warn');$('problemSituation').focus();return;}if(!project.promptDraft.trim()){window.ICT.message('프롬프트를 조합하거나 직접 작성하세요.','warn');$('composePrompt').focus();return;}const template=P.TEMPLATES[project.topic];if(!project.tool.title)project.tool.title=template.title;if(!project.tool.description)project.tool.description=project.problem.situation;if(!project.tool.inputLabel)project.tool.inputLabel=template.inputLabel;if(!save()){window.ICT.message('저장이 되지 않아 이동하지 않았습니다. 설계 기록을 먼저 내려받아 주세요.','warn');return;}window.ICT.markComplete(7);P.navigate('sim_builder.html');});
  window.addEventListener('ict:before-navigate',()=>{clearTimeout(timer);read();P.save(project);});
  window.addEventListener('pagehide',()=>{if(timer){clearTimeout(timer);read();P.save(project);}});
  fill();
})();

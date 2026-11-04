/* Project utilities shared by lessons 7–9. No network or model calls are made. */
(() => {
  'use strict';
  const KEY = 'tool-project';
  const TOPICS = ['energy', 'recycle', 'study', 'custom'];
  const FORMATS = ['steps', 'table', 'checklist'];
  const PART_KEYS = ['role', 'goal', 'context', 'format', 'constraints', 'example'];
  const PART_NAMES = {role:'역할', goal:'목적', context:'배경', format:'결과 형식', constraints:'조건', example:'예시 답안'};
  const RUBRIC = [
    {id:'problem', name:'문제의 실제성과 해결 가치', question:'일상생활에서 실제 발생할 수 있고, 해결할 가치가 있는 문제인가요?', hint:'누가 겪는 어떤 불편인지, 무엇을 바꾸려는지 확인해요.'},
    {id:'prompt', name:'프롬프트의 구체성', question:'작성한 프롬프트가 구체적이고 명확한가요?', hint:'역할·목적·배경·결과 형식·조건·예시 중 필요한 정보가 드러나나요?'},
    {id:'revision', name:'평가와 수정 과정', question:'성능을 올바르게 평가하고, 결과를 바탕으로 수정했나요?', hint:'같은 입력으로 수정 전후를 비교한 기록과 수정 이유를 찾아요.'},
    {id:'accuracy', name:'결과의 정확성 확인', question:'제공하는 결과가 정확한지 근거를 확인했나요?', hint:'출처나 관찰·계산으로 확인한 범위를 적어요. 확인하지 못했다면 평가를 보류해요.'},
    {id:'solution', name:'실제 문제 해결 가능성', question:'사용자가 실제 문제를 해결하는 데 도움을 받을 수 있나요?', hint:'사용자가 바로 실행할 수 있는지, 적용 후 어떻게 확인할지 살펴요.'},
    {id:'ethics', name:'윤리적으로 사용할 수 있는가', question:'개인정보·편향·권리·안전을 고려했나요?', hint:'불필요한 개인정보를 받지 않고, 근거 없는 단정과 불공정한 판단을 피하나요?'}
  ];
  const TEMPLATES = {
    energy: {
      label:'에너지 절약', description:'비용을 들이지 않고 학교나 가정에서 실천할 수 있는 행동을 제안하는 도구입니다.',
      title:'우리 반 에너지 도우미', inputLabel:'어디에서 어떤 전기가 낭비되고 있나요?', sample:'쉬는 시간에 빈 교실의 조명이 켜져 있어요.',
      problem:{audience:'우리 반 학생', situation:'사람이 없는 교실에도 조명이 켜져 있어 불필요하게 전기를 사용한다.', success:'비용 없이 바로 할 수 있는 행동과 확인 방법을 3가지 제안한다.'},
      parts:{role:'당신은 중학생을 위한 에너지 절약 도우미입니다.',goal:'사용자가 설명한 상황에서 바로 실천할 수 있는 절약 행동을 제안해 주세요.',context:'우리 반 학생들이 학교나 가정에서 실천할 방법을 찾습니다. 새 기기를 사기보다 습관을 바꾸려 합니다.',format:'행동·이유·확인 방법을 포함하여 3행 표로 작성해 주세요.',constraints:'비용이 들지 않는 방법을 우선하고, 확인하지 않은 절약량을 만들지 마세요. 관리가 필요한 기기는 담당자에게 확인하도록 안내하세요.',example:'행동: 빈 교실의 조명 끄기 / 이유: 사용하지 않는 공간의 불필요한 전기 사용 줄이기 / 확인 방법: 마지막에 나가는 사람이 불 상태 확인'}
    },
    recycle: {
      label:'학교 분리배출', description:'학교에서 헷갈리는 물건을 바르게 분리배출하기 전에 확인할 사항을 정리하는 도구입니다.',
      title:'우리 학교 분리배출 도우미', inputLabel:'어떤 물건을 어떤 상태로 버리려고 하나요?', sample:'내용물이 조금 남은 플라스틱 음료병을 버리려고 해요.',
      problem:{audience:'학교에서 분리배출을 하는 학생',situation:'재질과 내용물 상태가 달라 어떤 수거함을 이용할지 헷갈린다.',success:'준비할 행동과 학교의 배출 기준에서 확인할 점을 구분하여 안내한다.'},
      parts:{role:'당신은 학교의 분리배출 활동을 돕는 안내 도우미입니다.',goal:'사용자가 적은 물건을 배출하기 전에 할 일과 확인할 기준을 알려 주세요.',context:'사용자는 중학생입니다. 학교마다 수거함과 배출 기준이 다를 수 있습니다.',format:'준비할 행동·이유·학교에서 확인할 점을 3행 표로 작성해 주세요.',constraints:'물건이나 재질이 불분명하면 확인 질문을 먼저 하세요. 지역이나 학교의 기준을 모르면 정답을 단정하지 마세요. 위험한 물건은 담당자에게 문의하도록 안내하세요.',example:'행동: 음료병의 내용물 비우기 / 이유: 다른 재활용품이 오염되는 것을 줄이기 / 확인할 점: 학교 안내판에서 해당 재질의 수거함 확인'}
    },
    study: {
      label:'학습 계획',description:'정해진 복습 시간 안에 시작·연습·확인을 배치하도록 돕는 학습 계획 도구입니다.',
      title:'나의 짧은 복습 도우미',inputLabel:'어떤 내용을 몇 분 동안 복습하려고 하나요?',sample:'기술의 정보 통신 단원을 30분 동안 복습하려고 해요.',
      problem:{audience:'짧은 시간에 복습을 시작하려는 학생',situation:'공부할 내용은 정했지만 어떤 순서로 시작할지 결정하기 어렵다.',success:'주어진 시간 안에 개념 확인·연습·자기점검을 포함한 실행 순서를 제안한다.'},
      parts:{role:'당신은 중학생의 복습 계획을 돕는 학습 도우미입니다.',goal:'사용자가 제시한 내용과 가능한 시간에 맞춰 실행할 계획을 만들어 주세요.',context:'학습자의 성적이나 개인정보 없이, 공부할 내용과 가능한 시간만 사용합니다.',format:'활동·시간·완료 확인 방법을 포함해 3단계 계획으로 작성해 주세요.',constraints:'시간의 합이 사용자가 적은 시간을 넘지 않게 하세요. 성적 상승을 보장하지 마세요. 마지막에는 이해한 것과 모르는 것을 확인하게 해 주세요.',example:'활동: 핵심 개념을 내 말로 정리 / 시간: 10분 / 완료 확인: 책을 덮고 핵심 문장 2개 말하기'}
    },
    custom: {
      label:'나만의 자유주제',description:'직접 발견한 문제의 해결 조건을 프롬프트로 설계합니다. 자유주제는 예시 응답을 자동으로 만들지 않습니다.',
      title:'나만의 문제 해결 도구',inputLabel:'해결할 상황과 원하는 결과를 적어 주세요.',sample:'어떤 사람이 어떤 상황에서 무엇을 필요로 하는지 적어 주세요.',
      problem:{audience:'',situation:'',success:''},parts:{role:'',goal:'',context:'',format:'',constraints:'',example:''}
    }
  };
  const plain = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  const str = (value, max=2400) => typeof value === 'string' ? value.slice(0,max) : '';
  const oneOf = (value, values, fallback) => values.includes(value) ? value : fallback;
  const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  function empty() {
    const now = new Date().toISOString();
    return {schemaVersion:1,topic:'energy',problem:{audience:'',situation:'',success:''},parts:{role:'',goal:'',context:'',format:'',constraints:'',example:''},promptDraft:'',promptReflection:'',tool:{title:'',description:'',inputLabel:'',format:'steps',count:3},versions:[],tests:[],revisionReason:'',externalEvidence:'',testConclusion:'',review:{self:{},peer:{},strength:'',peerFeedback:'',revisionPlan:'',reflection:'',authorship:''},createdAt:now,updatedAt:now};
  }
  function normalize(raw) {
    const p = empty();
    if (!plain(raw)) return p;
    p.topic = oneOf(raw.topic,TOPICS,'energy');
    const problem = plain(raw.problem) ? raw.problem : {};
    ['audience','situation','success'].forEach(k => {p.problem[k]=str(problem[k],1600);});
    const parts = plain(raw.parts) ? raw.parts : {};
    PART_KEYS.forEach(k => {p.parts[k]=str(parts[k],2400);});
    p.promptDraft = str(raw.promptDraft,18000);
    p.promptReflection = str(raw.promptReflection,2000);
    const tool = plain(raw.tool) ? raw.tool : {};
    p.tool = {title:str(tool.title,100),description:str(tool.description,1200),inputLabel:str(tool.inputLabel,300),format:oneOf(tool.format,FORMATS,'steps'),count:Math.min(5,Math.max(2,Number.parseInt(tool.count,10)||3))};
    p.versions = Array.isArray(raw.versions) ? raw.versions.filter(plain).slice(-20).map(v => ({id:str(v.id,80)||uid(),name:str(v.name,80)||'저장한 버전',createdAt:str(v.createdAt,80),topic:oneOf(v.topic,TOPICS,'energy'),title:str(v.title,100),description:str(v.description,1200),inputLabel:str(v.inputLabel,300),prompt:str(v.prompt,18000),format:oneOf(v.format,FORMATS,'steps'),count:Math.min(5,Math.max(2,Number.parseInt(v.count,10)||3))})) : [];
    p.tests = Array.isArray(raw.tests) ? raw.tests.filter(plain).slice(-20).map(t => ({id:str(t.id,80)||uid(),createdAt:str(t.createdAt,80),input:str(t.input,2000),output:str(t.output,12000),versionLabel:str(t.versionLabel,100),topic:oneOf(t.topic,TOPICS,'energy'),prompt:str(t.prompt,18000),format:oneOf(t.format,FORMATS,'steps'),count:Math.min(5,Math.max(2,Number.parseInt(t.count,10)||3)),source:'simulation'})) : [];
    ['revisionReason','externalEvidence','testConclusion'].forEach(k => {p[k]=str(raw[k],4000);});
    const r = plain(raw.review) ? raw.review : {};
    ['self','peer'].forEach(role => {
      const source = plain(r[role]) ? r[role] : {};
      RUBRIC.forEach(item => {const row=plain(source[item.id])?source[item.id]:{}; p.review[role][item.id]={rating:oneOf(row.rating,['good','fair','improve'],''),evidence:str(row.evidence,1600)};});
    });
    ['strength','peerFeedback','revisionPlan','reflection','authorship'].forEach(k => {p.review[k]=str(r[k],3000);});
    p.createdAt = str(raw.createdAt,80) || p.createdAt;
    p.updatedAt = str(raw.updatedAt,80) || p.updatedAt;
    return p;
  }
  function load() { return normalize(window.ICT.load(KEY,null)); }
  function save(project) {project.updatedAt=new Date().toISOString();return window.ICT.save(KEY,normalize(project));}
  function applyTemplate(project, topic) {
    const t=TEMPLATES[topic]||TEMPLATES.custom;
    project.topic=TOPICS.includes(topic)?topic:'custom';
    project.problem={...t.problem};project.parts={...t.parts};
    project.tool={title:t.title,description:t.description,inputLabel:t.inputLabel,format:topic==='study'?'steps':'table',count:3};
    project.promptDraft=compose(project);
    return project;
  }
  function compose(project) {
    const p=normalize(project);const lines=[];
    if(p.problem.audience||p.problem.situation||p.problem.success){lines.push('[해결할 문제]');if(p.problem.audience)lines.push('사용 대상: '+p.problem.audience);if(p.problem.situation)lines.push('문제 상황: '+p.problem.situation);if(p.problem.success)lines.push('성공 기준: '+p.problem.success);}
    PART_KEYS.forEach(k => {if(p.parts[k].trim())lines.push('\n['+PART_NAMES[k]+']\n'+p.parts[k].trim());});
    if(!lines.length)return '';
    lines.push('\n[사용자 입력]\n{{사용자 입력}}');
    return lines.join('\n');
  }
  function config(project) {return {topic:project.topic,format:project.tool.format,count:project.tool.count};}
  /* Pure, finite educational model. This function is also included in exported tools. */
  function simulate(cfg, value) {
    const input=String(value||'').trim().slice(0,2000);
    const count=Math.min(5,Math.max(2,Number.parseInt(cfg.count,10)||3));
    const result={heading:'학습용 예시',input,rows:[],note:'실제 AI 응답이 아닙니다. 선택한 주제·입력 키워드·출력 설정으로 구성한 예시이며, 사실과 적용 가능성은 직접 확인해야 합니다.'};
    if(!input){result.heading='상황을 먼저 입력해 주세요.';result.note='실명이나 연락처 대신, 해결하려는 상황만 적어 주세요.';return result;}
    if(cfg.topic==='custom') {result.heading='자유주제는 프롬프트로 전달해요';result.note='이 학습 모형에는 자유주제의 답안을 만드는 규칙이 없습니다. 완성 프롬프트를 복사하여 선생님이 허용한 AI 도구에서 실행하고, 실제 결과를 따로 기록하세요.';return result;}
    if(cfg.topic==='energy') {
      if(!/전기|전력|에너지|조명|전등|불[을이가 ]|교실|학교|가정|우리 집|냉방|에어컨|난방|컴퓨터|모니터|기기|콘센트|대기전력/.test(input)){result.heading='이 모형에서 다루는 상황인지 확인해요';result.note='학교·가정의 조명, 냉난방, 전기기기 등과 관련된 상황을 적어 주세요. 이 모형은 자유로운 문장의 의미를 이해하지 않습니다.';return result;}
      let rows;
      if(/에어컨|냉방|난방/.test(input))rows=[['사용 공간과 시간부터 확인하기','사람이 없는 공간의 불필요한 사용을 찾을 수 있어요.','언제, 어디에서 사용했는지 기록해요.'],['설정 변경은 담당자와 상의하기','공간의 사용 조건을 함께 고려해야 해요.','학교의 냉난방 사용 안내를 확인해요.'],['사용 중인 공간의 문·창문 상태 점검하기','냉난방 사용 조건을 살펴볼 수 있어요.','환기가 필요한 시간은 별도로 정해요.'],['필요한 기기만 사용하고 종료 확인하기','사용이 끝났는데 켜져 있는 기기를 찾을 수 있어요.','마지막 사용자가 상태를 확인해요.'],['비슷한 조건에서 사용 기록 비교하기','기온이나 사용 시간 차이를 고려해 효과를 확인해야 해요.','관찰한 변화와 확인하지 못한 점을 구분해요.']];
      else if(/조명|전등|불[을이가 ]|교실/.test(input))rows=[['빈 공간의 조명 상태 확인하고 끄기','사용하지 않는 공간의 불필요한 전기 사용을 줄일 수 있어요.','마지막에 나가는 사람이 조명을 확인해요.'],['필요한 구역의 조명만 사용하기','활동하는 공간에 맞게 사용량을 조절할 수 있어요.','활동에 충분히 밝은지 함께 확인해요.'],['교실 나가기 전 점검 역할 정하기','기억에만 의존하지 않고 행동을 이어갈 수 있어요.','점검표에 실행 여부를 표시해요.'],['밝은 시간의 자연광 활용 가능성 살피기','공간의 밝기에 맞는 사용 방법을 찾을 수 있어요.','눈부심이나 어두운 곳이 없는지 확인해요.'],['실천 전후 사용 기록 비교하기','효과를 느낌이 아닌 기록으로 확인할 수 있어요.','같은 시간·조건에서 기록하고 절약량을 임의로 만들지 않아요.']];
      else rows=[['사용하지 않는 기기의 작동 상태 확인하기','필요하지 않은 시간의 사용을 찾을 수 있어요.','어떤 기기가 계속 켜져 있는지 기록해요.'],['관리 기준에 따라 종료하기','기기마다 종료 방법과 관리 조건이 달라요.','담당자와 사용 안내를 확인한 뒤 종료해요.'],['사용 시간을 정하고 점검하기','막연한 절약보다 실행 여부를 확인하기 쉬워요.','시작과 종료 시간을 간단히 기록해요.'],['새 기기 구입보다 사용 습관부터 점검하기','추가 비용 없이 바꿀 수 있는 행동을 찾을 수 있어요.','우리 상황에서 실천 가능한지 확인해요.'],['실천 전후의 차이 확인하기','제안의 효과는 실제 조건에서 확인해야 해요.','확인한 변화와 모르는 점을 구분해요.']];
      result.heading='에너지 절약 행동 예시';result.rows=rows.slice(0,count).map(a=>({action:a[0],reason:a[1],check:a[2]}));return result;
    }
    if(cfg.topic==='recycle') {
      if(!/쓰레기|분리|배출|병|페트|플라스틱|종이|우유|팩|캔|컵|비닐|배터리|건전지|음식|재활용|수거/.test(input)){result.heading='배출할 물건을 먼저 확인해요';result.note='어떤 물건인지, 재질과 내용물 상태를 적어 주세요. 이 모형은 입력 키워드로만 예시를 선택합니다.';return result;}
      let rows;
      if(/배터리|건전지/.test(input))rows=[['학교의 전용 수거 장소 문의하기','다른 재활용품과 구분하여 확인해야 하는 물건이에요.','담당 교사에게 배출 방법을 확인해요.'],['손상 여부를 알리고 임의로 분해하지 않기','상태에 따라 안전한 취급이 필요해요.','부풀거나 새는 물건은 직접 다루지 않고 담당자에게 알려요.'],['일반 수거함과 구분하기','잘못 섞이는 것을 줄일 수 있어요.','학교 안내에 맞는 장소로 가져가요.'],['사용한 물건의 종류 확인하기','제품 형태에 따라 안내가 다를 수 있어요.','기기 안에 있으면 담당자의 안내를 받아요.'],['배출 후 안내 다시 확인하기','다음에도 같은 실수를 줄일 수 있어요.','수거 장소를 학급에 알릴 때 확인한 정보만 써요.']];
      else rows=[['물건의 재질과 상태 확인하기','겉모양이 비슷해도 배출 기준이 다를 수 있어요.','재질 표시와 학교 배출 안내를 함께 확인해요.'],['남은 내용물 비우기','다른 재활용품이 오염되는 것을 줄일 수 있어요.','음식물이나 액체가 남아 있는지 확인해요.'],['필요한 분리·세척 방법 확인하기','재질과 오염 상태에 따라 준비가 달라질 수 있어요.','학교나 지역의 안내에 따라 준비해요.'],['맞는 수거함인지 마지막으로 확인하기','이름만 보고 잘못 넣는 것을 줄일 수 있어요.','불분명한 물건은 담당자에게 물어요.'],['헷갈린 사례를 안내판에 기록하기','다음 학생이 같은 문제를 해결하는 데 도움을 줘요.','확인한 기준과 미확인 내용을 구분해 적어요.']];
      result.heading='학교 분리배출 확인 예시';result.note='실제 AI 응답이 아닙니다. 세부 배출 기준은 지역과 학교에 따라 다를 수 있으므로 학교 안내와 담당자에게 확인하세요.';result.rows=rows.slice(0,count).map(a=>({action:a[0],reason:a[1],check:a[2]}));return result;
    }
    if(cfg.topic==='study') {
      if(!/공부|복습|학습|시험|숙제|과제|과학|수학|국어|영어|사회|역사|기술|개념|문제|분|단원/.test(input)){result.heading='복습할 내용과 시간을 적어 주세요';result.note='예: 과학 단원을 30분 동안 복습하려고 해요. 이 모형은 학습 수준을 진단하지 않습니다.';return result;}
      const match=input.match(/(\d{1,3})\s*분/);const time=match?Math.min(120,Math.max(10,Number(match[1]))):30;
      const labels=count===2?['핵심 개념 확인과 연습','책을 덮고 자기점검']:count===3?['핵심 개념 확인','예시·문제에 적용','책을 덮고 자기점검']:count===4?['배울 내용과 목표 확인','핵심 개념 정리','예시·문제에 적용','책을 덮고 자기점검']:['배울 내용과 목표 확인','핵심 개념 정리','예시·문제에 적용','헷갈린 내용 다시 보기','책을 덮고 자기점검'];
      const base=Math.floor(time/count);const extra=time%count;
      result.heading=time+'분 복습 계획 예시';
      result.rows=labels.map((name,i)=>({action:name+' · '+(base+(i<extra?1:0))+'분',reason:i===labels.length-1?'이해한 것과 더 확인할 것을 구분해요.':'사용 가능한 시간 안에서 활동을 나누어요.',check:i===labels.length-1?'모르는 점 한 가지와 다음 할 일을 적어요.':'단계가 끝나면 핵심을 내 말로 설명해요.'}));
      result.note='실제 AI 응답이 아닙니다. 입력의 숫자와 “분”을 읽어 시간을 균등하게 배분한 예시입니다. '+(match?'시간은 학습 모형의 범위인 10~120분 안에서 사용했습니다.':'시간을 적지 않아 예시로 30분을 사용했습니다.')+' 실제 학습량에 맞게 조정하세요.';return result;
    }
    result.heading='주제를 선택해 주세요';return result;
  }
  function resultText(result, format) {
    let text=result.heading+'\n';
    if(result.rows.length){
      if(format==='table')text+='\n행동 | 이유 | 확인 방법\n'+result.rows.map(r=>r.action+' | '+r.reason+' | '+r.check).join('\n');
      else if(format==='checklist')text+='\n'+result.rows.map(r=>'□ '+r.action+'\n   '+r.reason+'\n   확인: '+r.check).join('\n\n');
      else text+='\n'+result.rows.map((r,i)=>(i+1)+'. '+r.action+'\n   '+r.reason+'\n   확인: '+r.check).join('\n\n');
    }
    return text+'\n\n'+result.note;
  }
  function runPrompt(project,input) {const text=project.promptDraft.trim();return text.includes('{{사용자 입력}}')?text.split('{{사용자 입력}}').join(String(input||'').trim()):text+'\n\n[사용자 입력]\n'+String(input||'').trim();}
  function time(value){const d=new Date(value);return Number.isNaN(d.getTime())?'날짜 미기록':d.toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}
  async function copy(text) {
    if(!String(text).trim()){window.ICT.message('먼저 복사할 프롬프트를 작성하세요.','warn');return false;}
    let ok=false;
    try {if(window.ICT.copy)ok=await window.ICT.copy(text);else if(navigator.clipboard){await navigator.clipboard.writeText(text);ok=true;}}catch(_){ok=false;}
    if(ok)window.ICT.message('프롬프트를 복사했습니다.','success');
    else {window.ICT.download('my-prompt.txt',text,'text/plain;charset=utf-8');window.ICT.message('복사가 제한되어 프롬프트 TXT를 내려받았습니다.','info');}
    return ok;
  }
  function navigate(href){if(window.ICT.go)window.ICT.go(href);else window.location.href=href;}
  function validateImport(raw) {
    if(!plain(raw)||raw.schemaVersion!==1)throw new Error('이 시뮬레이터의 프로젝트 JSON(형식 버전 1)이 아닙니다.');
    if(!TOPICS.includes(raw.topic)||!plain(raw.tool)||!plain(raw.problem)||!plain(raw.parts)||typeof raw.promptDraft!=='string')throw new Error('주제·도구·프롬프트 형식을 확인할 수 없습니다.');
    if((raw.versions!==undefined&&!Array.isArray(raw.versions))||(raw.tests!==undefined&&!Array.isArray(raw.tests)))throw new Error('버전이나 테스트 기록의 형식이 올바르지 않습니다.');
    if((raw.versions||[]).some(v=>!plain(v)||typeof v.prompt!=='string')||(raw.tests||[]).some(t=>!plain(t)||typeof t.input!=='string'||typeof t.output!=='string'))throw new Error('일부 활동 기록을 읽을 수 없습니다.');
    return normalize(raw);
  }
  function exportHtml(project) {
    const p=normalize(project);
    const bundle={title:p.tool.title||'나만의 문제 해결 도구',description:p.tool.description,inputLabel:p.tool.inputLabel||'해결할 상황을 입력하세요.',prompt:p.promptDraft,topic:p.topic,format:p.tool.format,count:p.tool.count};
    const json=JSON.stringify(bundle).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    const escapedTitle=window.ICT.escape(bundle.title);
    return '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapedTitle+'</title><style>*{box-sizing:border-box}body{margin:0;background:#0c1729;color:#e5eef8;font:16px/1.75 system-ui,"Malgun Gothic",sans-serif}main{width:min(820px,100%);margin:0 auto;padding:36px 20px}h1{font-size:clamp(1.7rem,5vw,2.7rem);line-height:1.3}p{color:#b5c9db}.badge{display:inline-block;font-size:.8rem;color:#ffdc93;border:1px solid #846b44;border-radius:8px;padding:6px 10px}.box{background:#14273c;border:1px solid #365a6b;border-radius:18px;padding:24px;margin-top:22px}label{display:block;font-weight:700;margin:16px 0 8px}textarea{width:100%;background:#0c1b2d;border:1px solid #4b657d;color:#e5eef8;border-radius:10px;padding:12px;font:inherit}button{background:#75e4cc;color:#102c2b;border:0;border-radius:10px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;margin:12px 8px 0 0}button.secondary{background:#29445d;color:#e3eff9}button:focus-visible,textarea:focus-visible{outline:3px solid #b9fff0;outline-offset:3px}#result{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #3c5670;border-radius:12px;background:#0a1727;padding:18px;margin-top:18px}summary{cursor:pointer;color:#9de7de}small,.small{font-size:.85rem;color:#a5bed0}#copyStatus{min-height:24px;color:#a2e6d7}footer{font-size:.8rem;color:#90a9c0;margin-top:28px}@media print{button{display:none}body{background:#fff;color:#111}.box,#result,textarea{background:#fff;color:#111;border-color:#999}}</style></head><body><main><p class="small">MY TOOL · 정보 통신 × AI 탐구실</p><h1 id="title"></h1><p id="description"></p><span class="badge">규칙 기반 학습용 도구 · 실제 생성형 AI 연결 없음</span><section class="box"><label id="inputLabel" for="input"></label><textarea id="input" rows="4" maxlength="2000" placeholder="실명·전화번호 등 개인정보는 쓰지 마세요."></textarea><button id="run" type="button">학습용 예시 실행</button><button id="copy" class="secondary" type="button">완성 프롬프트 복사</button><div id="copyStatus" role="status"></div><div id="result" role="status">상황을 입력하고 실행하세요. 세 가지 예시 주제는 입력 키워드와 출력 설정으로 준비된 답안을 구성합니다. 자유주제는 프롬프트를 조립합니다.</div><details id="promptDetails" style="margin-top:18px"><summary>완성 프롬프트 직접 보기</summary><p class="small">실제 AI를 사용하려면 이 지시문을 선생님이 허용한 도구에 직접 붙여넣으세요. 여기에서는 외부로 전송하지 않습니다.</p><textarea id="finalPrompt" rows="10" readonly aria-label="입력을 포함한 완성 프롬프트"></textarea></details></section><footer>학생 제작물 · 교과서 218~220쪽의 문제 정의 → 프롬프트 설계 → 실행 → 수정 → 평가 활동을 위한 학습 모형입니다. 제안의 정확성과 적용 가능성은 사용자가 확인해야 합니다. 입력과 결과는 이 파일에서 외부 서버로 전송되지 않습니다.</footer></main><script>\n(()=>{\n"use strict";\nconst C='+json+';\nconst simulate='+simulate.toString()+';\nconst resultText='+resultText.toString()+';\nconst $=id=>document.getElementById(id);\n$("title").textContent=C.title;$("description").textContent=C.description;$("inputLabel").textContent=C.inputLabel;\nfunction prompt(){const v=$("input").value.trim();const p=C.prompt.includes("{{사용자 입력}}")?C.prompt.split("{{사용자 입력}}").join(v):C.prompt+"\\n\\n[사용자 입력]\\n"+v;$("finalPrompt").value=p;return p;}\n$("input").addEventListener("input",prompt);prompt();\n$("run").addEventListener("click",()=>{$("result").textContent=resultText(simulate(C,$("input").value),C.format);});\n$("copy").addEventListener("click",async()=>{const text=prompt();let ok=false;try{if(navigator.clipboard){await navigator.clipboard.writeText(text);ok=true;}}catch(e){}if(ok){$("copyStatus").textContent="완성 프롬프트를 복사했습니다.";}else{$("promptDetails").open=true;$("finalPrompt").focus();$("finalPrompt").select();$("copyStatus").textContent="복사가 제한되어 텍스트를 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요."}});\n})();\n<\/script></body></html>';
  }
  function report(project) {
    const p=normalize(project);const rating={good:'잘함',fair:'보통',improve:'개선 필요','':'평가 보류'};
    const lines=['정보 통신 × AI 탐구실 · 인공지능 툴 제작 활동 기록','작성 시각: '+new Date().toLocaleString('ko-KR'),'','도구: '+(p.tool.title||'제목 미작성'),'주제: '+TEMPLATES[p.topic].label,'설명: '+p.tool.description,'사용 대상: '+p.problem.audience,'문제 상황: '+p.problem.situation,'성공 기준: '+p.problem.success,'','[완성 프롬프트]',p.promptDraft,'','[프롬프트 비교 성찰]',p.promptReflection,'','[수정 이유]',p.revisionReason,'','[테스트 결론]',p.testConclusion,'','[실제 AI 사용·확인 기록 · 학생 작성]',p.externalEvidence||'실제 AI 실행 기록 없음',''];
    p.versions.forEach((v,i)=>{lines.push('[저장 버전 '+(i+1)+'] '+v.name+' · '+time(v.createdAt),'주제: '+TEMPLATES[v.topic].label+' / 형식: '+v.format+' / 제안 수: '+v.count,v.prompt,'');});
    p.tests.forEach((t,i)=>{lines.push('[학습용 모형 테스트 '+(i+1)+'] '+time(t.createdAt)+' · '+t.versionLabel,'입력: '+t.input,t.output,'');});
    ['self','peer'].forEach(role=>{lines.push(role==='self'?'[자기평가]':'[동료평가]');RUBRIC.forEach(r=>{const row=p.review[role][r.id]||{};lines.push(r.name+': '+(rating[row.rating]||'평가 보류'),'근거: '+(row.evidence||'미작성'));});lines.push('');});
    [['strength','좋은 점'],['peerFeedback','친구 의견'],['revisionPlan','다음 수정 계획'],['reflection','배운 점'],['authorship','제작 과정과 자료 사용 기록']].forEach(([k,label])=>lines.push('['+label+']',p.review[k]||'미작성',''));
    lines.push('※ 이 작업대의 실행 결과는 실제 생성형 AI 호출 결과가 아닌 규칙 기반 학습용 예시입니다. 실제 AI를 사용했다면 별도 확인 기록을 참고하세요.');
    return lines.join('\n');
  }
  window.ICTProject={KEY,TOPICS,FORMATS,PART_KEYS,PART_NAMES,RUBRIC,TEMPLATES,empty,normalize,load,save,applyTemplate,compose,config,simulate,resultText,runPrompt,time,copy,navigate,validateImport,exportHtml,report,uid};
  if(document.body.dataset.lesson!=='8')return;

  const $=id=>document.getElementById(id);
  let project=load();let autosaveTimer;let pendingImport=null;
  function status(ok){$('builderSaveStatus').textContent=ok?'이 브라우저에 저장됨 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'저장하지 못했습니다. JSON으로 내려받아 보관하세요.';}
  function readForm(){project.topic=$('toolTopic').value;project.tool={title:$('toolTitle').value.trim(),description:$('toolDescription').value,inputLabel:$('toolInputLabel').value,format:$('toolFormat').value,count:Number($('toolCount').value)};project.promptDraft=$('toolPrompt').value;project.revisionReason=$('revisionReason').value;project.externalEvidence=$('externalEvidence').value;project.testConclusion=$('testConclusion').value;}
  function persist(){clearTimeout(autosaveTimer);readForm();const ok=save(project);status(ok);return ok;}
  function preview(){ $('previewTitle').textContent=$('toolTitle').value.trim()||'나만의 문제 해결 도구';$('previewDescription').textContent=$('toolDescription').value||'어떤 문제를 해결하는지 설명해 주세요.';$('previewInputLabel').textContent=$('toolInputLabel').value||'해결할 상황을 입력하세요.';}
  function fillForm(){ $('toolTitle').value=project.tool.title;$('toolTopic').value=project.topic;$('toolDescription').value=project.tool.description;$('toolInputLabel').value=project.tool.inputLabel;$('toolPrompt').value=project.promptDraft;$('toolFormat').value=project.tool.format;$('toolCount').value=String(project.tool.count);$('revisionReason').value=project.revisionReason;$('externalEvidence').value=project.externalEvidence;$('testConclusion').value=project.testConclusion;preview();renderVersions();renderTests();}
  function renderVersions(){const select=$('compareVersion');const old=select.value;select.replaceChildren();if(!project.versions.length){const o=new Option('먼저 버전을 기록하세요.','');select.add(o);}else project.versions.forEach(v=>select.add(new Option(v.name+' · '+time(v.createdAt),v.id)));if(project.versions.some(v=>v.id===old))select.value=old;$('versionName').placeholder='예: 버전 '+(project.versions.length+1)+' · '+(project.versions.length?'조건 보완':'첫 설계');}
  function renderTests(){const root=$('testHistory');root.replaceChildren();if(!project.tests.length){const div=document.createElement('div');div.className='empty-state';div.textContent='아직 테스트 기록이 없습니다. 정상적인 상황, 애매한 상황, 주제와 다른 상황을 하나씩 시험해 보세요.';root.appendChild(div);return;}
    [...project.tests].reverse().forEach((t,i)=>{const card=document.createElement('article');card.className='test-card';const header=document.createElement('header');const h=document.createElement('h4');h.textContent='테스트 '+(project.tests.length-i)+' · '+t.versionLabel;const span=document.createElement('span');span.className='builder-small';span.textContent=time(t.createdAt)+' · 학습용 예시';header.append(h,span);const input=document.createElement('p');input.className='test-input';input.textContent='입력: '+t.input;const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='출력과 사용한 프롬프트 확인';const pre=document.createElement('pre');pre.textContent=t.output+'\n\n[사용한 프롬프트]\n'+t.prompt;details.append(summary,pre);card.append(header,input,details);root.append(card);});}
  function ready(){readForm();if(!project.tool.title){window.ICT.message('도구 제목을 먼저 적어 주세요.','warn');$('toolTitle').focus();return false;}if(!project.promptDraft.trim()){window.ICT.message('프롬프트를 작성하거나 7차시 설계를 불러오세요.','warn');$('toolPrompt').focus();return false;}return true;}
  function currentSnapshot(name){return{id:uid(),name,createdAt:new Date().toISOString(),topic:project.topic,title:project.tool.title,description:project.tool.description,inputLabel:project.tool.inputLabel,prompt:project.promptDraft,format:project.tool.format,count:project.tool.count};}
  function exactVersion(){return [...project.versions].reverse().find(v=>v.prompt===project.promptDraft&&v.topic===project.topic&&v.format===project.tool.format&&v.count===project.tool.count);}
  ['toolTitle','toolTopic','toolDescription','toolInputLabel','toolPrompt','toolFormat','toolCount','revisionReason','externalEvidence','testConclusion'].forEach(id=>{$(id).addEventListener('input',()=>{preview();$('builderSaveStatus').textContent='변경 사항 저장 중…';clearTimeout(autosaveTimer);autosaveTimer=setTimeout(persist,350);});});
  $('saveTool').addEventListener('click',()=>{if(persist())window.ICT.message('작업을 저장했습니다.','success');});
  $('loadDesignedPrompt').addEventListener('click',()=>{readForm();const composed=compose(project);if(!composed){window.ICT.message('7차시 설계가 없습니다. 먼저 예시를 넣거나 7차시에서 설계하세요.','warn');return;}$('toolPrompt').value=composed;persist();window.ICT.message('7차시의 설계 요소로 프롬프트를 조합했습니다.','success');});
  $('fillBuilderExample').addEventListener('click',()=>{readForm();if(project.topic==='custom'){window.ICT.message('자유주제는 직접 문제와 프롬프트를 작성해 주세요.','info');return;}applyTemplate(project,project.topic);fillForm();persist();window.ICT.message('선택한 주제의 예시로 입력 칸을 채웠습니다.','info');});
  $('copyToolPrompt').addEventListener('click',()=>{readForm();copy(project.promptDraft);});
  $('sampleTestInput').addEventListener('click',()=>{$('testInput').value=TEMPLATES[$('toolTopic').value].sample;$('testInput').focus();});
  $('runTool').addEventListener('click',()=>{if(!ready())return;const input=$('testInput').value.trim();if(!input){window.ICT.message('시험할 상황을 입력하세요.','warn');$('testInput').focus();return;}const cfg=config(project);const output=resultText(simulate(cfg,input),cfg.format);$('toolResponse').textContent=output;const v=exactVersion();project.tests.push({id:uid(),createdAt:new Date().toISOString(),input,output,versionLabel:v?v.name:'저장 전 수정안',topic:project.topic,prompt:project.promptDraft,format:cfg.format,count:cfg.count,source:'simulation'});project.tests=project.tests.slice(-20);persist();renderTests();});
  $('copyRunPrompt').addEventListener('click',()=>{if(!ready())return;const input=$('testInput').value.trim();if(!input){window.ICT.message('사용자 입력을 먼저 적어 주세요.','warn');$('testInput').focus();return;}copy(runPrompt(project,input));});
  $('snapshotTool').addEventListener('click',()=>{if(!ready())return;const name=$('versionName').value.trim()||'버전 '+(project.versions.length+1);project.versions.push(currentSnapshot(name));project.versions=project.versions.slice(-20);$('versionName').value='';persist();renderVersions();$('compareVersion').value=project.versions.at(-1).id;window.ICT.message('현재 설계를 버전으로 기록했습니다.','success');});
  $('compareTools').addEventListener('click',()=>{if(!ready())return;const previous=project.versions.find(v=>v.id===$('compareVersion').value);if(!previous){window.ICT.message('비교할 버전을 먼저 기록하세요.','warn');return;}const input=$('testInput').value.trim();if(!input){window.ICT.message('같은 조건으로 비교할 테스트 입력을 먼저 적으세요.','warn');$('testInput').focus();return;}const root=$('versionComparison');root.replaceChildren();const row=document.createElement('div');row.className='version-compare';[{name:previous.name,cfg:{topic:previous.topic,format:previous.format,count:previous.count},prompt:previous.prompt},{name:'현재 수정안',cfg:config(project),prompt:project.promptDraft}].forEach(v=>{const card=document.createElement('article');card.className='version-card';const h=document.createElement('h3');h.textContent=v.name;const pre=document.createElement('pre');pre.textContent=resultText(simulate(v.cfg,input),v.cfg.format);const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='이 버전의 프롬프트';const draft=document.createElement('pre');draft.textContent=v.prompt;details.append(summary,draft);card.append(h,pre,details);row.append(card);});root.append(row);const note=document.createElement('p');note.className='builder-small';note.textContent='동일한 입력: '+input+'\n이 모형은 주제·키워드·출력 설정을 반영합니다. 프롬프트 문장만 바꾸면 결과가 같을 수 있으며, 그 의미 차이는 실제 AI에서 별도로 검증해야 합니다.';root.append(note);});
  $('exportStudentTool').addEventListener('click',()=>{if(!ready())return;persist();window.ICT.download('my-ai-learning-tool.html',exportHtml(project),'text/html;charset=utf-8');window.ICT.message('단독 실행 HTML 도구를 내려받았습니다.','success');});
  $('exportProject').addEventListener('click',()=>{persist();window.ICT.download('ict-tool-project.json',JSON.stringify(normalize(project),null,2),'application/json;charset=utf-8');});
  $('importProject').addEventListener('change',async event=>{pendingImport=null;const area=$('importPreview');area.replaceChildren();const file=event.target.files[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('5MB 이하의 프로젝트 JSON을 선택하세요.');const raw=JSON.parse(await file.text());pendingImport=validateImport(raw);const p=document.createElement('p');p.className='builder-small';p.textContent='읽은 프로젝트: '+(pendingImport.tool.title||'제목 없음')+' · 버전 '+pendingImport.versions.length+'개 · 테스트 '+pendingImport.tests.length+'개. 현재 프로젝트를 바꾸기 전에 필요하면 JSON으로 백업하세요.';const apply=document.createElement('button');apply.type='button';apply.className='button secondary';apply.textContent='이 프로젝트로 이어받기';const cancel=document.createElement('button');cancel.type='button';cancel.className='button ghost';cancel.textContent='취소';apply.addEventListener('click',()=>{if(!pendingImport)return;clearTimeout(autosaveTimer);project=normalize(pendingImport);pendingImport=null;fillForm();const ok=save(project);status(ok);area.replaceChildren();event.target.value='';$('toolResponse').textContent='프로젝트를 불러왔습니다. 새 입력으로 시험해 보세요.';$('versionComparison').replaceChildren();window.ICT.message(ok?'프로젝트를 불러와 저장했습니다.':'불러왔지만 저장하지 못했습니다. JSON을 보관하세요.',ok?'success':'warn');});cancel.addEventListener('click',()=>{pendingImport=null;area.replaceChildren();event.target.value='';});area.append(p,apply,cancel);}catch(error){const p=document.createElement('p');p.className='builder-small';p.textContent='가져오지 않았습니다. '+(error instanceof SyntaxError?'JSON 파일의 형식을 확인해 주세요.':error.message);area.append(p);event.target.value='';}});
  $('goProjectReview').addEventListener('click',()=>{if(!ready())return;if(!persist()){window.ICT.message('저장이 되지 않아 페이지를 이동하지 않았습니다. JSON으로 먼저 백업해 주세요.','warn');return;}window.ICT.markComplete(8);navigate('sim_review.html');});
  window.addEventListener('ict:before-navigate',()=>{clearTimeout(autosaveTimer);readForm();save(project);});
  window.addEventListener('pagehide',()=>{if(autosaveTimer){clearTimeout(autosaveTimer);readForm();save(project);}});
  fillForm();
})();

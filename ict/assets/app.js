(function(){
'use strict';
var PREFIX='ict220:',cache={},toastTimer;
var lessons=[
{id:1,file:'sim_meaning.html',name:'자료에서 정보로',unit:1,pages:'208~209'},
{id:2,file:'sim_process.html',name:'투입·과정·산출·되먹임',unit:1,pages:'210'},
{id:3,file:'sim_features.html',name:'특징과 디지털 안전',unit:1,pages:'211'},
{id:4,file:'sim_history.html',name:'정보 통신 기술의 발달',unit:2,pages:'212~213'},
{id:5,file:'sim_ai.html',name:'학습하는 AI와 생활 속 활용',unit:2,pages:'213~215'},
{id:6,file:'sim_ethics.html',name:'인공지능 윤리와 선택',unit:2,pages:'216~217'},
{id:7,file:'sim_prompt.html',name:'문제 정의와 프롬프트 설계',unit:3,pages:'218~219'},
{id:8,file:'sim_builder.html',name:'나만의 인공지능 툴 제작',unit:3,pages:'219~220'},
{id:9,file:'sim_review.html',name:'공유·평가·수정·성찰',unit:3,pages:'220'}];
function clone(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x;}}
function safeObj(x){return x&&typeof x==='object'&&!Array.isArray(x);}
try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(PREFIX)===0){try{cache[k.slice(PREFIX.length)]=JSON.parse(localStorage.getItem(k));}catch(e){}}}}catch(e){}
if(location.hash.indexOf('#ictState=')===0){
 try{
  var raw=decodeURIComponent(location.hash.slice(10));
  if(raw.length<1500000){
   var packet=JSON.parse(raw);
   if(packet.version===1&&safeObj(packet.data)){
    Object.keys(packet.data).forEach(function(k){
     if(k.length<100&&k!=='__proto__'&&k!=='constructor'&&k!=='prototype'){
      cache[k]=packet.data[k];
      if(k==='legacy-notes'&&safeObj(cache[k])){Object.keys(cache[k]).forEach(function(n){if(n.indexOf('ict-')===0&&typeof cache[k][n]==='string'){try{localStorage.setItem(n,cache[k][n]);}catch(e){}}});}
      try{localStorage.setItem(PREFIX+k,JSON.stringify(cache[k]));}catch(e){}
     }
    });
   }
  }
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
 }catch(e){}
}
function load(k,fallback){return Object.prototype.hasOwnProperty.call(cache,k)?clone(cache[k]):clone(fallback);}
function save(k,v){if(typeof k!=='string'||k==='__proto__'||k==='constructor'||k==='prototype')return false;cache[k]=clone(v);try{localStorage.setItem(PREFIX+k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('ict:save',{detail:{key:k}}));return true;}catch(e){window.dispatchEvent(new CustomEvent('ict:save',{detail:{key:k,temporary:true}}));return false;}}
function escapeText(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function message(txt,kind){var el=document.getElementById('ict-toast');if(!el){el=document.createElement('div');el.id='ict-toast';el.setAttribute('role','status');document.body.appendChild(el);}el.className='ict-toast'+(kind==='error'?' error':'');el.textContent=txt;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.hidden=true;},4200);}
function download(name,text,mime){var blob=new Blob([text],{type:mime||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
async function copy(txt){try{await navigator.clipboard.writeText(txt);return true;}catch(e){var t=document.createElement('textarea');t.value=txt;t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}t.remove();return ok;}}
function flush(){window.dispatchEvent(new Event('ict:before-navigate'));}
function snapshot(){flush();var notes=load('legacy-notes',{});try{for(var j=0;j<localStorage.length;j++){var n=localStorage.key(j);if(n&&n.indexOf('ict-')===0)notes[n]=localStorage.getItem(n);}}catch(e){}cache['legacy-notes']=notes;return clone(cache);}
function link(href){if(location.protocol!=='file:')return href;try{var u=new URL(href,location.href);if(u.protocol==='file:'&&u.pathname.endsWith('.html')){u.hash='ictState='+encodeURIComponent(JSON.stringify({version:1,data:snapshot()}));return u.href;}}catch(e){}return href;}
function go(href){flush();location.href=link(href);}
function markComplete(n){var p=load('progress',{});p[String(n)]={done:true,at:new Date().toISOString()};var ok=save('progress',p);renderDots();return ok;}
function completeButton(n){var b=document.createElement('button');b.className='button secondary';b.type='button';b.textContent=load('progress',{})[String(n)]?'학습 완료 표시됨 ✓':'이 차시 학습 완료';b.onclick=function(){var ok=markComplete(n);b.textContent='학습 완료 표시됨 ✓';message(ok?'학습 완료를 기록했습니다.':'이 화면에서는 완료로 표시했습니다. 기록을 파일로 내보내 주세요.',ok?'':'error');};return b;}
window.ICT={load:load,save:save,message:message,download:download,escape:escapeText,copy:copy,go:go,markComplete:markComplete,completeButton:completeButton,lessons:lessons,snapshot:snapshot};
function renderDots(){var p=load('progress',{});document.querySelectorAll('.ict-dot').forEach(function(el){el.classList.toggle('done',!!p[el.dataset.id]);});var el=document.getElementById('ict-progress-text');if(el){var n=lessons.filter(function(l){return p[String(l.id)];}).length;el.textContent=n+' / 9차시 학습 표시';}}
function init(){
var current=Number(document.body.dataset.lesson||0),main=document.querySelector('main,.container');if(main&&!main.id)main.id='main-content';
var skip=document.createElement('a');skip.className='ict-skip';skip.href='#main-content';skip.textContent='본문으로 건너뛰기';document.body.prepend(skip);
var header=document.createElement('header');header.className='ict-topbar';var opts='<option value="index.html">학습 홈 · 전체 과정</option>';
[1,2,3].forEach(function(u){opts+='<optgroup label="0'+u+' 소단원">';lessons.filter(function(l){return l.unit===u;}).forEach(function(l){opts+='<option value="'+l.file+'"'+(l.id===current?' selected':'')+'>'+l.id+'차시 · '+l.name+'</option>';});opts+='<option value="activity_quiz.html?unit='+u+'">0'+u+' 소단원 형성평가</option></optgroup>';});
header.innerHTML='<div class="ict-bar-inner"><a class="ict-brand" href="index.html"><span class="ict-logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><strong>정보 통신 × AI</strong><small>중학교 기술 탐구실</small></span></a><select class="ict-lesson-picker" aria-label="학습 차시 이동">'+opts+'</select><div class="ict-tools"><a class="ict-tool ict-wide" href="teacher_guide.html">수업 안내</a><button class="ict-tool" id="ict-font" type="button" title="글자 크기 조절" aria-label="글자 크기 조절">가＋</button><button class="ict-tool ict-wide" id="ict-full" type="button">전체 화면</button></div></div>';
if(current){header.innerHTML+='<div class="ict-lesson-strip"><div class="ict-strip-dots" aria-hidden="true">'+lessons.map(function(l){return '<span class="ict-dot'+(l.id===current?' active':'')+'" data-id="'+l.id+'"></span>';}).join('')+'</div><span id="ict-progress-text"></span><span style="margin-left:auto">교과서 '+lessons[current-1].pages+'쪽</span></div>';}
document.body.insertBefore(header,skip.nextSibling);header.querySelector('select').onchange=function(){go(this.value);};
if(location.pathname.endsWith('activity_quiz.html'))header.querySelector('select').value='activity_quiz.html?unit='+(new URLSearchParams(location.search).get('unit')||'1');
var fontStep=Number(load('font-size',0))||0;document.documentElement.style.fontSize=[100,112,124][fontStep]+'%';document.getElementById('ict-font').onclick=function(){fontStep=(fontStep+1)%3;document.documentElement.style.fontSize=[100,112,124][fontStep]+'%';save('font-size',fontStep);message('글자 크기 '+[100,112,124][fontStep]+'%');};
document.getElementById('ict-full').onclick=async function(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){message('브라우저의 전체 화면 단축키를 사용해 주세요.');}};
if(current){var atEnd=current%3===0,next=atEnd?'activity_quiz.html?unit='+Math.ceil(current/3):lessons[current].file,end=document.createElement('section');end.className='ict-end';end.innerHTML='<div><h3>'+current+'차시 학습 정리</h3><p>'+(atEnd?'이 소단원의 마지막 차시입니다. 형성평가를 제출하면 소단원 학습이 마무리됩니다.':'오늘 배운 것을 말로 설명해 보고 다음 차시로 이어가세요.')+'</p></div><div class="actions"></div>';var actions=end.querySelector('.actions');actions.appendChild(completeButton(current));var a=document.createElement('a');a.className='button';a.href=next;a.textContent=atEnd?'0'+Math.ceil(current/3)+' 형성평가 시작 →':'다음 차시 →';a.addEventListener('click',function(){markComplete(current);});actions.appendChild(a);document.body.appendChild(end);}
var footer=document.createElement('footer');footer.className='ict-footer';footer.innerHTML='교과서 208~220쪽 기반 · 01 정보 통신 기술의 이해 / 02 정보 통신 기술과 인공지능의 활용 / 03 인공지능 툴 제작하기<br>학습 기록은 사용 중인 브라우저에 저장합니다. 기기를 바꾸기 전 프로젝트와 평가 결과를 파일로 내보내세요. <a href="teacher_guide.html">수업 안내</a>';document.body.appendChild(footer);renderDots();
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||a.hasAttribute('download')||a.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;var href=a.getAttribute('href');if(href&&href.charAt(0)!=='#'){flush();if(location.protocol==='file:'){var dest=link(href);if(dest!==href){e.preventDefault();location.href=dest;}}}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/**
 * 에너지와 수송 기술의 세계 — Google Apps Script Web App
 *
 * [배포 방법]
 * 1. script.google.com 에서 새 프로젝트 만들기
 * 2. Code.gs + 5개 HTML 파일 모두 붙여넣기
 * 3. 배포 > 웹 앱 > 실행 계정: 본인 / 액세스: 조직 내 모든 사용자
 * 4. 생성된 URL을 학생에게 공유
 */

function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'index';
  const validPages = [
    'index',
    'sim_energy_forms',
    'sim_energy_conversion',
    'sim_renewable',
    'activity_quiz'
  ];

  const safePage = validPages.includes(page) ? page : 'index';

  const tmpl = HtmlService.createTemplateFromFile(safePage);
  tmpl.baseUrl = ScriptApp.getService().getUrl();   // HTML 템플릿에서 <?= baseUrl ?> 로 사용

  return tmpl.evaluate()
    .setTitle('⚡ 에너지와 수송 기술의 세계')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

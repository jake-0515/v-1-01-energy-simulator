# ⚡ 에너지와 수송 기술의 세계

중학교 기술 수업용 에너지 시뮬레이터입니다.

## 폴더 구조

```
/                        ← 정적 웹사이트 (GitHub Pages)
├── index.html
├── sim_energy_forms.html
├── sim_energy_conversion.html
├── sim_renewable.html
├── activity_quiz.html
├── css/style.css
└── apps-script/         ← Google Apps Script 웹앱 버전
    ├── .clasp.json
    ├── appsscript.json
    ├── Code.gs
    ├── index.html
    ├── sim_energy_forms.html
    ├── sim_energy_conversion.html
    ├── sim_renewable.html
    └── activity_quiz.html
```

## 배포 방법

### GitHub Pages (정적)
- `main` 브랜치 push → 자동 배포

### Google Apps Script 웹앱
1. `apps-script/` 폴더에서 작업
2. `clasp login` (최초 1회)
3. `clasp push --force`
4. `clasp deploy --deploymentId <ID> --description "설명"`

## 다른 컴퓨터에서 사용하기

```bash
git clone https://github.com/jake-0515/v-1-01-energy-simulator.git
cd v-1-01-energy-simulator/apps-script
clasp login
clasp push --force
```

// ★더 이상 유효하지 않음 — 2026-09-01 블루 리디자인으로 대체.
//
// 이 파일은 2026-08-30 "강의 슬라이드 팔레트 → 링크명함 기준 정본 v1" 전환 시점의 기대값을
// 검증하던 테스트다. 그 뒤 2026-09-01 라운드(Phase 2 + 오너 육안 피드백 재작업 + 무지개
// 테두리 확대)에서 다음이 실제로 바뀌어 지금 이 테스트는 통과하지 못한다(node로 실행하면
// FAIL 남, 실행해서 실측 확인함):
//   · --eum-navy·--eum-surface-ink가 리터럴 hex(#1E2A45)가 아니라 var(--p-blue-deep)
//     간접참조로 바뀜(정본 eum_웹토큰_v1.css 토큰화, 커밋 0611726) — 30~32번째 줄의
//     "모든 --eum-* 토큰은 리터럴 hex여야 한다" 루프 어서션과 정면 모순.
//   · 34~35번째 줄이 "공용 이음 패밀리 푸터(.eum-family)는 이번 변경 범위 밖 — 옛 다크
//     그라데이션(#0d1b3e/#1a1050/#1e3a8a)을 유지해야 한다"고 단정하는데, 그 다크 그라데이션은
//     오너 지시로 이미 블루 그라데이션(var(--p-blue-light)→var(--p-blue-main)→var(--p-blue-deep))
//     으로 교체됐다(커밋 0611726) — 오히려 "범위 밖"이 아니라 오너가 명시적으로 포함시킨 영역이었다.
//
// package.json에 연결돼 있지 않아(이 저장소엔 npm 스크립트가 없음) 자동 실행되는 CI/파이프라인은
// 없지만, 나중에 누군가 이 파일을 신뢰하고 "옛 다크 배경이 맞다"고 오판할 위험이 있어 삭제하지
// 않고 이 경고만 남겨 보존한다(오너 지시 — 삭제 금지, 낡음만 표시). 현재 유효한 기준은
// D:\HONG\09_이음\01_부서\경영조정실\_디자인시스템\eum_웹토큰_v1.css(--p-blue-main:#2F73F2 /
// --p-blue-deep:#1F5FD9 / --p-blue-light:#6FA7FF)이다. 재작성이 필요해지면 이 정본과
// index.html의 현재 :root 값을 다시 대조해 새 테스트로 만들 것 — 아래 어서션을 신뢰해 되돌리지 말 것.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const footerMarker = '/* ===== 이음 패밀리 광고';
const appCss = html.slice(0, html.indexOf(footerMarker));
const footerCss = html.slice(html.indexOf(footerMarker));
const brightStart = appCss.indexOf('body.text-slate-100');
const brightCoreEnd = appCss.indexOf('  .persona-card', brightStart);
const brightCore = appCss.slice(brightStart, brightCoreEnd);

// 2026-08-30 기준 변경: 강의 슬라이드 팔레트 → 링크명함 기준 정본 v1(오너 승인). 근거: _보고/20260830_이음_기준토큰_정의서_v1.md
assert.match(appCss, /--eum-bg-0:\s*#EAF3FF;/, '앱 기본 배경은 강의 슬라이드의 연하늘이어야 합니다.');
assert.match(appCss, /--eum-text:\s*#3A4568;/, '앱 기본 본문은 기준 정본(v1)의 본문색이어야 합니다.');
assert.match(appCss, /--eum-heading:\s*#101A3D;/, '제목(h1급) 역할은 기준 정본(v1)의 제목색으로 고정돼야 합니다.');
// 표면색(버튼·토스트)은 본문 토큰과 분리한다 — 2026-08-30 교차검증 REVISE 대응
assert.match(appCss, /--eum-surface-ink:\s*#1E2A45;/, '버튼·토스트 표면색은 본문 토큰과 분리된 값으로 고정돼야 합니다.');
assert.match(appCss, /--eum-line:\s*#E4ECF7;/, '앱 경계선은 강의 슬라이드의 선 토큰이어야 합니다.');
assert.doesNotMatch(appCss, /--eum-bg-0:\s*#020818;/, '기존 어두운 앱 배경 토큰이 남아 있으면 안 됩니다.');
assert.match(appCss, /body\.text-slate-100\s*\{[^}]*color:var\(--eum-text\)/s, 'Tailwind body 글자색을 밝은 테마 본문색으로 재정의해야 합니다.');
assert.match(html, /은사·성향 검사<\/span>/, '상단 보조 배지가 있어야 합니다.');
assert.match(html, /은사·성향 검사<\/span>[\s\S]*?/, '상단 보조 배지를 유지해야 합니다.');
assert.doesNotMatch(html, /color:#f0bc78; background:rgba\(240,188,120,\.08\)\">은사·성향 검사/, '밝은 배경에서 읽히지 않는 기존 금색 배지를 유지하면 안 됩니다.');
assert.match(appCss, /main \.text-rose-300\s*\{color:var\(--eum-blue2\) !important/, '필수 표시 별표도 슬라이드 토큰으로 밝은 화면에서 읽혀야 합니다.');
assert.doesNotMatch(html, /style="[^"]*color:#67e8f9/, '결과 아키타입 배지에 다크용 저대비 시안 인라인 색이 남으면 안 됩니다.');
assert.doesNotMatch(html, /style="[^"]*color:#f0bc78/, '결과 권면에 다크용 저대비 금색 인라인 색이 남으면 안 됩니다.');
assert.match(html, /<footer class="contact-footer /, '앱 자체 연락 푸터는 공용 이음 패밀리 푸터와 구분되어야 합니다.');
assert.match(appCss, /\.contact-footer\s*\{color:var\(--eum-soft\) !important/, '앱 자체 연락 푸터는 본문 토큰으로 충분한 대비를 확보해야 합니다.');
for(const token of ['--eum-navy', '--eum-navytx', '--eum-blue2', '--eum-sky', '--eum-pale', '--eum-bd-blue', '--eum-white', '--eum-gold', '--eum-gold-deep']){
  assert.match(appCss, new RegExp(`${token}:#[0-9A-F]{6};`), `${token}은 강의 슬라이드의 원색 토큰이어야 합니다.`);
}
assert.doesNotMatch(brightCore, /#[0-9A-Fa-f]{3,8}|rgba\(/, '밝은 표면 핵심 블록은 직접 색상이 아니라 토큰만 참조해야 합니다.');
assert.match(footerCss, /background:linear-gradient\(150deg,#0d1b3e 0%,#1a1050 50%,#1e3a8a 100%\)/,
  '공용 이음 패밀리 푸터는 이번 변경 범위 밖입니다.');

console.log('light-theme.test.cjs: all assertions passed');

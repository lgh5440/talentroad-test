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

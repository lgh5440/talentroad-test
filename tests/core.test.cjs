const assert = require('node:assert/strict');
const path = require('node:path');
const { runMainScriptWithAssertions } = require('./helpers/talentroadScript.cjs');

const root = path.resolve(__dirname, '..');
const assertions = `
(function runCoreTests(){
  const assert = globalThis.__assert;

  assert.equal(QUESTIONS.length, 60, '표준형 문항 수는 60개여야 합니다.');
  assert.equal(toComboKey('W', 'C', 'L'), 'C+L+W', '조합 키는 고정 순서로 정렬되어야 합니다.');
  assert.equal(toComboKey('R', 'P', 'S'), 'P+R+S', '조합 키는 고정 순서로 정렬되어야 합니다.');

  const typeKeys = TYPES.map(t => t.key);
  const expectedComboKeys = [];
  for(let i = 0; i < typeKeys.length; i++){
    for(let j = i + 1; j < typeKeys.length; j++){
      for(let k = j + 1; k < typeKeys.length; k++){
        expectedComboKeys.push(toComboKey(typeKeys[i], typeKeys[j], typeKeys[k]));
      }
    }
  }
  const uniqueExpectedComboKeys = [...new Set(expectedComboKeys)].sort();
  const actualComboKeys = Object.keys(COMBO).sort();
  assert.equal(uniqueExpectedComboKeys.length, 56, '8개 은사의 3개 조합은 총 56개여야 합니다.');
  assert.deepEqual(actualComboKeys, uniqueExpectedComboKeys, 'COMBO는 가능한 56개 조합을 빠짐없이, 추가 없이 포함해야 합니다.');
  for(const key of uniqueExpectedComboKeys){
    assert.equal(typeof COMBO[key].title, 'string', key + ' title이 필요합니다.');
    assert.ok(COMBO[key].title.trim(), key + ' title은 비어 있으면 안 됩니다.');
    assert.equal(typeof COMBO[key].desc, 'string', key + ' desc가 필요합니다.');
    assert.ok(COMBO[key].desc.trim(), key + ' desc는 비어 있으면 안 됩니다.');
    assert.ok(Array.isArray(COMBO[key].examples), key + ' examples는 배열이어야 합니다.');
    assert.ok(COMBO[key].examples.length >= 1, key + ' examples는 최소 1개 이상이어야 합니다.');
  }

  state.answers = new Array(QUESTIONS.length).fill(null);
  const firstLQuestion = MAP.L[0];
  state.answers[firstLQuestion - 1] = 5;
  const lScore = calcScores().find(s => s.key === 'L');
  assert.equal(lScore.sum, 5, '일반 문항은 원점수가 그대로 더해져야 합니다.');
  assert.equal(lScore.n, 1, '응답한 문항만 개수에 포함되어야 합니다.');
  assert.equal(lScore.norm, 100, '5점 단일 응답은 100점으로 정규화되어야 합니다.');

  state.answers = new Array(QUESTIONS.length).fill(null);
  const reverseQuestion = [...REVERSE][0];
  const reverseKey = Object.keys(MAP).find(key => MAP[key].includes(reverseQuestion));
  state.answers[reverseQuestion - 1] = 5;
  const reverseScore = calcScores().find(s => s.key === reverseKey);
  assert.equal(reverseScore.sum, 1, '역문항 5점 응답은 1점으로 변환되어야 합니다.');
  assert.equal(reverseScore.norm, 0, '역문항 변환 후 1점은 0점으로 정규화되어야 합니다.');

  assert.equal(
    escapeHtml('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;',
    'HTML 태그는 escape되어야 합니다.'
  );
  assert.equal(
    allowComboHighlightHtml("<span class='combo-key-highlight'>C</span><script>bad</script>"),
    "<span class='combo-key-highlight'>C</span>&lt;script&gt;bad&lt;/script&gt;",
    '허용된 조합 하이라이트 span만 복원되어야 합니다.'
  );
})();
`;

runMainScriptWithAssertions({ rootDir: root, assert, assertions });

console.log('core.test.cjs: all assertions passed');

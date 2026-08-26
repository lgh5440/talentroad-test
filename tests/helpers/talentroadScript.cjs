const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function readMainScript(rootDir) {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const scriptStart = html.lastIndexOf('<script>');
  const scriptBodyStart = html.indexOf('>', scriptStart) + 1;
  const scriptEnd = html.indexOf('</script>', scriptBodyStart);

  if (scriptStart < 0 || scriptBodyStart < 1 || scriptEnd < 0) {
    throw new Error('index.html의 메인 스크립트를 찾지 못했습니다.');
  }

  return html.slice(scriptBodyStart, scriptEnd);
}

function createDomSandbox(assert) {
  const inertElement = {
    addEventListener(){},
    appendChild(){},
    classList: { add(){}, remove(){}, toggle(){} },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    remove(){},
    setAttribute(){},
    style: {},
    textContent: '',
    innerHTML: '',
    value: '',
    checked: false,
    disabled: false
  };

  return {
    __assert: assert,
    console,
    document: {
      addEventListener(){},
      createElement(){ return { ...inertElement }; },
      querySelector(){ return { ...inertElement }; },
      querySelectorAll(){ return []; },
      body: { appendChild(){} }
    },
    File: function File(){},
    URL: { createObjectURL(){ return 'blob:test'; }, revokeObjectURL(){} },
    location: { reload(){} },
    navigator: {},
    performance: { now(){ return 0; } },
    requestAnimationFrame(callback){ callback(); },
    setTimeout
  };
}

function runMainScriptWithAssertions({ rootDir, assert, assertions, timeout = 1000 }) {
  const script = readMainScript(rootDir);
  vm.runInNewContext(`${script}\n${assertions}`, createDomSandbox(assert), {
    filename: 'index.html',
    timeout
  });
}

module.exports = {
  createDomSandbox,
  readMainScript,
  runMainScriptWithAssertions,
};

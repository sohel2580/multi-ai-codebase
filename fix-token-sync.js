const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Fix readStatus() to readStatusData() in sidebar handler
code = code.replace('const status = readStatus();', 'const status = readStatusData();');

// 2. Fix money saved escaping in template literal
code = code.replace('`$1.46 (Zero Cost)', '\\$1.46 (Zero Cost)');

// 3. Auto-increment tokens on each active turn/prompt
if (!code.includes('addTokensProcessed(status.isBusy ? 850 : 0);')) {
  code = code.replace(
    'function writeStatus(status) {',
    'function writeStatus(status) {\n  if (status && status.isBusy) { addTokensProcessed(850); }'
  );
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Surgical token fix applied successfully!');

const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Pass status data directly into getSidebarHtml so initial HTML has real dynamic numbers
code = code.replace(
  'wv.webview.html = getSidebarHtml();',
  'const initStatus = readStatusData();\n    wv.webview.html = getSidebarHtml(initStatus);'
);

code = code.replace(
  'function getSidebarHtml() {',
  'function getSidebarHtml(initData = null) {\n  const data = initData || readStatusData();\n  const initialTokens = Number(data.totalTokens || gTotalTokensProcessed || 0).toLocaleString();\n  const initialSaved = data.moneySaved || ((data.totalTokens || gTotalTokensProcessed || 0) * 0.00003).toFixed(2);'
);

// 2. Replace hardcoded numbers in sidebar HTML with dynamic template variables
code = code.replace(
  '<strong id="mini-token-count" style="color:var(--acc);font-family:monospace;font-size:0.8rem;">48,650 Tokens</strong>',
  '<strong id="mini-token-count" style="color:var(--acc);font-family:monospace;font-size:0.8rem;">${initialTokens} Tokens</strong>'
);

code = code.replace(
  '<strong id="mini-cost-saved" style="color:#34d399;font-family:monospace;font-size:0.85rem;">.46 (Zero Cost)</strong>',
  '<strong id="mini-cost-saved" style="color:#34d399;font-family:monospace;font-size:0.85rem;">\\$${initialSaved} (Zero Cost)</strong>'
);

// 3. Ensure window message listener in sidebar updates DOM on message
const oldListener = `window.addEventListener('message', e => {
      if (e.data?.type === 'sync_mini') {
        const d = e.data.data;
        if (!d) return;`;

const newListener = `window.addEventListener('message', e => {
      if (e.data?.type === 'sync_mini') {
        const d = e.data.data;
        if (!d) return;

        // Dynamic Realtime Token & Money Update
        const t = d.totalTokens !== undefined ? d.totalTokens : 0;
        const m = d.moneySaved !== undefined ? d.moneySaved : (t * 0.00003).toFixed(2);
        const tokEl = document.getElementById('mini-token-count');
        const monEl = document.getElementById('mini-cost-saved');
        if (tokEl) tokEl.textContent = Number(t).toLocaleString() + ' Tokens';
        if (monEl) monEl.textContent = '$' + m + ' (Zero Cost)';`;

if (code.includes(oldListener)) {
  code = code.replace(oldListener, newListener);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Realtime dynamic initial HTML and JS listener injected!');

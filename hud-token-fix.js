const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Pass status data to getRoundTableHtml for dynamic initial HTML tokens
code = code.replace(
  'currentWarRoomPanel.webview.html = getRoundTableHtml(nonce);',
  'const initStatus = readStatusData();\n    currentWarRoomPanel.webview.html = getRoundTableHtml(nonce, initStatus);'
);

code = code.replace(
  'function getRoundTableHtml(nonce) {',
  'function getRoundTableHtml(nonce, initData = null) {\n  const data = initData || readStatusData();\n  const initialTokens = Number(data.totalTokens || gTotalTokensProcessed || 0).toLocaleString();\n  const initialSaved = data.moneySaved || ((data.totalTokens || gTotalTokensProcessed || 0) * 0.00003).toFixed(2);'
);

// 2. Replace hardcoded 48,650 in getRoundTableHtml topbar HTML
code = code.replace(
  '<span id="hud-token-count" style="font-family:monospace;color:#60a5fa;">48,650 Tokens</span>',
  '<span id="hud-token-count" style="font-family:monospace;color:#60a5fa;">${initialTokens} Tokens</span>'
);

code = code.replace(
  '<span id="hud-money-saved" style="font-family:monospace;color:#34d399;">$1.46 (Zero Cost)</span>',
  '<span id="hud-money-saved" style="font-family:monospace;color:#34d399;">\\$${initialSaved} (Zero Cost)</span>'
);

// 3. Inject live token and money update inside getRoundTableHtml render(d)
const oldRenderStart = "if(d._readTime)document.getElementById('clk').textContent=d._readTime;";
const newRenderStart = oldRenderStart + `
    const t = d.totalTokens !== undefined ? d.totalTokens : 0;
    const m = d.moneySaved !== undefined ? d.moneySaved : (t * 0.00003).toFixed(2);
    const hudTokEl = document.getElementById('hud-token-count');
    const hudMonEl = document.getElementById('hud-money-saved');
    if (hudTokEl && t > 0) hudTokEl.textContent = Number(t).toLocaleString() + ' Tokens';
    if (hudMonEl) hudMonEl.textContent = '$' + m + ' (Zero Cost)';`;

if (code.includes(oldRenderStart) && !code.includes('hudTokEl && t > 0')) {
  code = code.replace(oldRenderStart, newRenderStart);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Round-Table HUD Topbar live token binding applied successfully!');

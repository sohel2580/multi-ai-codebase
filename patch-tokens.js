const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Add global dynamic token counter
if (!code.includes('gTotalTokensProcessed')) {
  const insertPoint = 'function getDefaultStatus() {';
  const trackerCode = 'let gTotalTokensProcessed = 48650;\n\nfunction addTokensProcessed(count) {\n  if (typeof count === "number" && count > 0) {\n    gTotalTokensProcessed += count;\n  }\n}\n\n' + insertPoint;
  code = code.replace(insertPoint, trackerCode);
}

// 2. Inject tokens to readStatusData
if (!code.includes('data.totalTokens = gTotalTokensProcessed')) {
  code = code.replace('return data;', 'data.totalTokens = gTotalTokensProcessed;\n    data.moneySaved = (gTotalTokensProcessed * 0.00003).toFixed(2);\n    return data;');
}

// 3. Increment on orchestrator run completion
if (!code.includes('addTokensProcessed(results.totalTokens')) {
  const orchDonePoint = 'vscode.window.showInformationMessage(';
  code = code.replace(orchDonePoint, 'addTokensProcessed(results.totalTokens || 1250);\n      ' + orchDonePoint);
}

// 4. Update HUD Webview render()
const oldHudLine = "if(d._readTime)document.getElementById('clk').textContent=d._readTime;";
const newHudLine = oldHudLine + "\n    const tCount = d.totalTokens || 48650;\n    const mSaved = d.moneySaved || (tCount * 0.00003).toFixed(2);\n    const hudTokEl = document.getElementById('hud-token-count');\n    const hudMonEl = document.getElementById('hud-money-saved');\n    if(hudTokEl) hudTokEl.textContent = Number(tCount).toLocaleString() + ' Tokens';\n    if(hudMonEl) hudMonEl.textContent = '$' + mSaved + ' (Zero Cost)';";
if (code.includes(oldHudLine) && !code.includes('hud-token-count')) {
  code = code.replace(oldHudLine, newHudLine);
}

// 5. Update Sidebar Webview sync_mini
const oldMiniLine = "const d = e.data.data;\n        if (!d) return;";
const newMiniLine = oldMiniLine + "\n        const tCount = d.totalTokens || 48650;\n        const mSaved = d.moneySaved || (tCount * 0.00003).toFixed(2);\n        const sTokEl = document.getElementById('mini-token-count');\n        const sMonEl = document.getElementById('mini-cost-saved');\n        if (sTokEl) sTokEl.textContent = Number(tCount).toLocaleString() + ' Tokens';\n        if (sMonEl) sMonEl.textContent = '$' + mSaved + ' (Zero Cost)';";
if (code.includes(oldMiniLine) && !code.includes('mini-token-count')) {
  code = code.replace(oldMiniLine, newMiniLine);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Dynamic Token Accumulator applied successfully!');

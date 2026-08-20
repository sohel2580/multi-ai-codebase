const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove Free Savings from HUD topbar (lines 548-555)
const targetTopbarOld = `    <div class="topbar-right" style="display:flex;align-items:center;gap:8px;">
      <!-- 💰 Live Token & Free Savings Counter in Round-Table HUD -->
      <div class="pill" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;display:flex;align-items:center;gap:6px;">
        <span>💰 Free Savings:</span>
        <span id="hud-token-count" style="font-family:monospace;color:#60a5fa;">\${initTokens} Tokens</span>
        <span style="color:rgba(255,255,255,0.2);">|</span>
        <span id="hud-money-saved" style="font-family:monospace;color:#34d399;">\\$\${initSaved} (Zero Cost)</span>
      </div>
      <div class="pill pill-live"><div class="dot"></div>LIVE</div>
      <div class="pill pill-clock" id="clk">--:--:--</div>
    </div>`;

const targetTopbarNew = `    <div class="topbar-right" style="display:flex;align-items:center;gap:8px;">
      <div class="pill pill-live"><div class="dot"></div>LIVE</div>
      <div class="pill pill-clock" id="clk">--:--:--</div>
    </div>`;

if (code.includes(targetTopbarOld)) {
  code = code.replace(targetTopbarOld, targetTopbarNew);
  console.log('✅ Topbar pill replaced successfully');
} else {
  console.log('⚠️ Topbar pill exact match not found, applying regex');
  code = code.replace(/<!-- 💰 Live Token & Free Savings Counter in Round-Table HUD -->[\s\S]*?<\/div>\s*(?=<div class="pill pill-live">)/, '');
}

// 2. Remove Free Savings Ledger from Sidebar (lines 1214-1228)
const targetSidebarOld = `  <!-- 💰 FEATURE 2: Live Token & Savings Ledger Widget -->
  <div class="card" style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.12));border:1px solid rgba(16,185,129,0.35);">
    <div class="card-title" style="color:#34d399;display:flex;justify-content:space-between;">
      <span>💰 Free Savings Ledger</span>
      <span style="color:#60a5fa;font-weight:800;">100% Free</span>
    </div>
    <div class="row" style="border:none;padding:2px 0;">
      <span style="font-size:0.75rem;color:var(--muted);">Total Processed:</span>
      <strong id="mini-token-count" style="color:var(--acc);font-family:monospace;font-size:0.8rem;">\${initialTokens} Tokens</strong>
    </div>
    <div class="row" style="border:none;padding:2px 0;">
      <span style="font-size:0.75rem;color:var(--muted);">Money Saved:</span>
      <strong id="mini-cost-saved" style="color:#34d399;font-family:monospace;font-size:0.85rem;">\\$\${initialSaved} (Zero Cost)</strong>
    </div>
  </div>`;

if (code.includes(targetSidebarOld)) {
  code = code.replace(targetSidebarOld, '');
  console.log('✅ Sidebar card replaced successfully');
} else {
  console.log('⚠️ Sidebar card exact match not found, applying regex');
  code = code.replace(/<!-- 💰 FEATURE 2: Live Token & Savings Ledger Widget -->[\s\S]*?<\/div>\s*<\/div>/, '');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Removal finished!');

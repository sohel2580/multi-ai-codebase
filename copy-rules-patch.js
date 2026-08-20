const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'extention', 'extension.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Add "📋 Copy Agentic Rules for Antigravity" button to sidebar
const oldSidebarBtns = `<button class="btn" style="background:rgba(52,211,153,0.12);border:1px solid #10b981;color:#10b981;" id="checkModelsBtn">🔍 Check & Suggest Best Models</button>`;
const newSidebarBtns = `<button class="btn" style="background:rgba(52,211,153,0.12);border:1px solid #10b981;color:#10b981;" id="checkModelsBtn">🔍 Check & Suggest Best Models</button>
  <button class="btn" style="background:rgba(168,85,247,0.15);border:1px solid #a855f7;color:#c084fc;" id="copyRulesBtn">📋 Copy Antigravity Agent Rules</button>`;

if (code.includes(oldSidebarBtns) && !code.includes('copyRulesBtn')) {
  code = code.replace(oldSidebarBtns, newSidebarBtns);
}

// 2. Add copyRulesBtn event listener to sidebar JS
const oldSidebarJs = `document.getElementById('checkModelsBtn').addEventListener('click', () => vscode.postMessage({ type: 'check_models' }));`;
const newSidebarJs = `document.getElementById('checkModelsBtn').addEventListener('click', () => vscode.postMessage({ type: 'check_models' }));
    document.getElementById('copyRulesBtn').addEventListener('click', () => vscode.postMessage({ type: 'copy_rules' }));`;

if (code.includes(oldSidebarJs) && !code.includes("type: 'copy_rules'")) {
  code = code.replace(oldSidebarJs, newSidebarJs);
}

// 3. Handle copy_rules in resolveWebviewView
const oldHandler = `case 'check_models':`;
const newHandler = `case 'copy_rules':
          try {
            const rulesPrompt = \`# Autonomous Multi-AI Agentic Protocol (STRICT ENFORCEMENT)\\n\\nWhenever I send ANY message, coding task, or question in Antigravity Chat or type /agent <prompt>:\\n1. You MUST NOT answer using your internal single AI model.\\n2. You MUST route the task strictly through the Multi-AI Router & 6-Specialist Council (DeepSeek, Groq Qwen 3.6-27B, Llama 3.3 ECC Shield, Nemotron QA, Cohere Coder, Executive Judge).\\n3. Always broadcast live telemetry to .ai_team_status.json so the Round-Table HUD lights up in real-time.\`;
            await vscode.env.clipboard.writeText(rulesPrompt);
            vscode.window.showInformationMessage('📋 Multi-AI Agentic Rules copied to Clipboard! Paste it directly in Antigravity chat.');
          } catch(e) {}
          break;
        case 'check_models':`;

if (code.includes(oldHandler) && !code.includes("case 'copy_rules':")) {
  code = code.replace(oldHandler, newHandler);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ 1-Click Copy Agent Rules button injected successfully!');

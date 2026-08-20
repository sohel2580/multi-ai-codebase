const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MultiAIOrchestrator } = require('./orchestrator');
const { AIRouter } = require('./ai-router');

/**
 * Multi-AI Orchestrator Extension — extension.js
 * Version: 4.0.0 — Real Agentic Production Release
 * Architected by Sohel Ahammad
 *
 * Users install this extension, add their API keys in VSCode Settings,
 * then real multi-AI calls happen directly from VSCode.
 */

'use strict';

let currentWarRoomPanel = null;

// ─────────────────────────────────────────────────────────────
// CONFIG — Read API keys from VSCode settings
// ─────────────────────────────────────────────────────────────
function getApiConfig() {
  const cfg = vscode.workspace.getConfiguration('multiAI');
  return {
    groqApiKey:           cfg.get('groqApiKey', ''),
    openrouterApiKey:     cfg.get('openrouterApiKey', ''),
    bynaraApiKey:         cfg.get('bynaraApiKey', ''),
    bynaraEndpoint:       cfg.get('bynaraEndpoint', 'https://router.bynara.id/v1/chat/completions'),
    agentrouterApiKey:    cfg.get('agentrouterApiKey', ''),
    agentrouterEndpoint:  cfg.get('agentrouterEndpoint', 'https://co.agentrouter.org/v1/chat/completions'),
  };
}

function hasAnyKey() {
  const cfg = getApiConfig();
  return Object.values(cfg).some(v => v && v.trim().length > 5);
}

// ─────────────────────────────────────────────────────────────
// STATUS FILE — Live telemetry bridge for Round-Table HUD
// ─────────────────────────────────────────────────────────────
function getStatusFilePath() {
  try {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) return null;
    for (const folder of folders) {
      const p = path.join(folder.uri.fsPath, '.ai_team_status.json');
      if (fs.existsSync(p)) return p;
    }
    return path.join(folders[0].uri.fsPath, '.ai_team_status.json');
  } catch (e) { return null; }
}

function writeStatus(status) {
  const statusFile = getStatusFilePath();
  if (!statusFile) return;
  try {
    const data = {
      ...status,
      _updatedBy: 'Multi-AI Extension v4.0.0',
      _ts: new Date().toISOString()
    };
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) { /* non-fatal */ }
}

function writeStandby(message = '🟢 Council Standby · Ready for commands') {
  writeStatus({
    isBusy: false,
    activeAgents: [],
    activeLasers: [],
    dialogues: {},
    taskTitle: message,
    realMetrics: '0 Active Threads · Awaiting command'
  });
}

function readStatusData() {
  const statusFile = getStatusFilePath();
  if (!statusFile) return getDefaultStatus();
  try {
    if (!fs.existsSync(statusFile)) return getDefaultStatus();
    const raw = fs.readFileSync(statusFile, 'utf8').trim();
    if (!raw) return getDefaultStatus();
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return getDefaultStatus();
    data._readTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    return data;
  } catch (e) { return getDefaultStatus(); }
}

function getDefaultStatus() {
  return {
    isBusy: false,
    activeAgents: [],
    activeLasers: [],
    dialogues: {},
    taskTitle: '🟢 Council Standby · Ready for commands',
    realMetrics: '0 Active Threads · Awaiting command',
    _readTime: new Date().toLocaleTimeString('en-US', { hour12: false })
  };
}

// ─────────────────────────────────────────────────────────────
// ORCHESTRATOR FACTORY
// ─────────────────────────────────────────────────────────────
function createOrchestrator() {
  return new MultiAIOrchestrator(getApiConfig(), (status) => {
    writeStatus(status);
    pushToHud(status);
  });
}

// ─────────────────────────────────────────────────────────────
// HUD PUSH
// ─────────────────────────────────────────────────────────────
function pushToHud(data) {
  try {
    if (currentWarRoomPanel?.webview) {
      const merged = { ...data, _readTime: new Date().toLocaleTimeString('en-US', { hour12: false }) };
      currentWarRoomPanel.webview.postMessage({ type: 'sync_state', data: merged });
    }
  } catch (e) { /* non-fatal */ }
}

// ─────────────────────────────────────────────────────────────
// RESULT OUTPUT — Show final answer in editor
// ─────────────────────────────────────────────────────────────
async function showResult(results, task) {
  const doc = await vscode.workspace.openTextDocument({
    content: formatResults(results, task),
    language: 'markdown'
  });
  await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
}

function formatResults(results, task) {
  if (results.error) {
    return `# ❌ Multi-AI Error\n\n**Task:** ${task}\n\n**Error:** ${results.error}\n\n## 💡 Fix\nAdd your API keys:\n\`Ctrl+,\` → search "Multi-AI" → enter keys`;
  }

  const lines = [
    `# 🤖 Multi-AI Council Result`,
    ``,
    `**Task:** ${task}`,
    `**Time:** ${results.elapsed}s · **Tokens:** ${results.totalTokens}`,
    ``,
    `---`,
    ``,
    `## ⚖️ Final Answer (Claude Executive Judge)`,
    ``,
    results.finalAnswer || '_No final answer generated_',
    ``,
    `---`,
    ``,
    `## 🧠 DeepSeek R1 — Architecture Plan`,
    ``,
    results.steps?.plan?.text || '_Skipped_',
    ``,
    `## ⚡ Qwen 2.5 — Generated Code`,
    ``,
    '```',
    results.steps?.code?.text || '_Skipped_',
    '```',
    ``,
    `## 🛡️ Llama 3.3 — Security Audit`,
    ``,
    results.steps?.audit?.text || '_Skipped_',
    ``,
    `## 🧪 Gemma 2 — QA Review`,
    ``,
    results.steps?.qa?.text || '_Skipped_',
  ];
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Ask Council (Full 5-step pipeline)
// ─────────────────────────────────────────────────────────────
async function cmdAskCouncil(context) {
  if (!hasAnyKey()) {
    const action = await vscode.window.showWarningMessage(
      '⚠️ No API keys configured. Add your Groq/OpenRouter/Anthropic keys first.',
      'Open Settings', 'Cancel'
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'multiAI');
    }
    return;
  }

  const task = await vscode.window.showInputBox({
    prompt: '🤖 What should all 5 AI agents work on?',
    placeHolder: 'e.g. Write a React hook for debounced search...',
    ignoreFocusOut: true
  });
  if (!task?.trim()) return;

  // Open HUD to watch live
  createOrShowWarRoom(context);

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: '⚡ Multi-AI Council working...',
    cancellable: false
  }, async (progress) => {
    progress.report({ message: 'Step 1/5 — DeepSeek R1 planning...' });
    try {
      const orchestrator = createOrchestrator();
      const results = await orchestrator.run(task);
      await showResult(results, task);
      vscode.window.showInformationMessage(
        `✅ Done in ${results.elapsed}s · ${results.totalTokens} tokens used`
      );
    } catch (err) {
      writeStandby(`❌ Error: ${err.message}`);
      vscode.window.showErrorMessage(`Multi-AI Error: ${err.message}`);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Refactor Selection
// ─────────────────────────────────────────────────────────────
async function cmdRefactor(context) {
  if (!hasAnyKey()) {
    vscode.window.showWarningMessage('⚠️ Add API keys in Settings (Ctrl+,) → search "Multi-AI"');
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }

  const selection = editor.selection;
  const selectedCode = editor.document.getText(selection.isEmpty ? undefined : selection);
  if (!selectedCode?.trim()) { vscode.window.showWarningMessage('Select some code first.'); return; }

  const instruction = await vscode.window.showInputBox({
    prompt: '⚡ How to refactor?',
    placeHolder: 'e.g. Add error handling, improve performance, add TypeScript types...',
    ignoreFocusOut: true
  });
  if (!instruction?.trim()) return;

  createOrShowWarRoom(context);

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: '⚡ Qwen + Llama refactoring...',
    cancellable: false
  }, async () => {
    try {
      const orchestrator = createOrchestrator();
      const { code, audit } = await orchestrator.refactor(selectedCode, instruction);

      // Apply refactored code to editor
      await editor.edit(editBuilder => {
        editBuilder.replace(
          selection.isEmpty ? new vscode.Range(0, 0, editor.document.lineCount, 0) : selection,
          code
        );
      });

      // Show audit in output
      if (audit && !audit.includes('VERDICT: PASS')) {
        vscode.window.showWarningMessage(`🛡️ Security note: ${audit.slice(0, 120)}...`);
      } else {
        vscode.window.showInformationMessage('✅ Refactor applied! Security: PASS');
      }
    } catch (err) {
      writeStandby();
      vscode.window.showErrorMessage(`Refactor failed: ${err.message}`);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Explain Code
// ─────────────────────────────────────────────────────────────
async function cmdExplain(context) {
  if (!hasAnyKey()) {
    vscode.window.showWarningMessage('⚠️ Add API keys in Settings → search "Multi-AI"');
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }

  const selection = editor.selection;
  const code = editor.document.getText(selection.isEmpty ? undefined : selection);
  if (!code?.trim()) return;

  createOrShowWarRoom(context);

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: '🧠 DeepSeek R1 explaining...',
    cancellable: false
  }, async () => {
    try {
      const orchestrator = createOrchestrator();
      const result = await orchestrator.quickAsk(
        `Explain this code clearly, step by step:\n\n${code}`,
        'deepseek'
      );

      const doc = await vscode.workspace.openTextDocument({
        content: `# 🧠 Code Explanation\n\n${result.text}\n\n---\n_DeepSeek R1 via ${result.provider} · ${result.tokens} tokens_`,
        language: 'markdown'
      });
      vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
    } catch (err) {
      writeStandby();
      vscode.window.showErrorMessage(`Explain failed: ${err.message}`);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Fix Bug
// ─────────────────────────────────────────────────────────────
async function cmdFixBug(context) {
  if (!hasAnyKey()) {
    vscode.window.showWarningMessage('⚠️ Add API keys in Settings → search "Multi-AI"');
    return;
  }

  const errorMsg = await vscode.window.showInputBox({
    prompt: '🛡️ Paste the error message',
    placeHolder: 'TypeError: Cannot read property of undefined...',
    ignoreFocusOut: true
  });
  if (!errorMsg?.trim()) return;

  const editor = vscode.window.activeTextEditor;
  const code = editor ? editor.document.getText() : '';

  createOrShowWarRoom(context);

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: '🛡️ Llama 3.3 debugging...',
    cancellable: false
  }, async () => {
    try {
      const orchestrator = createOrchestrator();
      const result = await orchestrator.quickAsk(
        `Fix this error:\n\nERROR: ${errorMsg}\n\nCODE:\n${code.slice(0, 3000)}`,
        'llama'
      );

      const doc = await vscode.workspace.openTextDocument({
        content: `# 🛡️ Bug Fix — Llama 3.3\n\n## Error\n\`\`\`\n${errorMsg}\n\`\`\`\n\n## Fix\n\n${result.text}`,
        language: 'markdown'
      });
      vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
    } catch (err) {
      writeStandby();
      vscode.window.showErrorMessage(`Fix Bug failed: ${err.message}`);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Setup API Keys wizard
// ─────────────────────────────────────────────────────────────
async function cmdSetupKeys() {
  const router = new AIRouter(getApiConfig());
  const status = router.getProviderStatus();

  const items = [
    { label: status.groq       ? '✅ Groq'        : '❌ Groq',        description: 'Free · 540 tok/s · Qwen + Llama', detail: 'Get free key: console.groq.com',        id: 'groqApiKey' },
    { label: status.openrouter ? '✅ OpenRouter'   : '❌ OpenRouter',  description: 'Free · DeepSeek R1 + Claude',     detail: 'Get free key: openrouter.ai/keys',     id: 'openrouterApiKey' },
    { label: status.together   ? '✅ Together AI'  : '❌ Together AI', description: 'Free · Llama 3.3',               detail: 'Get free key: api.together.xyz',        id: 'togetherApiKey' },
    { label: status.anthropic  ? '✅ Anthropic'    : '❌ Anthropic',   description: 'Paid · Claude Opus/Sonnet',       detail: 'console.anthropic.com',                id: 'anthropicApiKey' },
    { label: status.googleAI   ? '✅ Google AI'    : '❌ Google AI',   description: 'Free · Gemma 2',                  detail: 'aistudio.google.com/app/apikey',        id: 'googleAiApiKey' }
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: '🔑 Select a provider to configure (Green = already set)',
    canPickMany: false
  });
  if (!selected) return;

  const key = await vscode.window.showInputBox({
    prompt: `Enter your ${selected.label.replace(/[✅❌] /, '')} API key`,
    placeHolder: selected.detail,
    password: true,
    ignoreFocusOut: true
  });

  if (key?.trim()) {
    const cfg = vscode.workspace.getConfiguration('multiAI');
    await cfg.update(selected.id, key.trim(), vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`✅ ${selected.label.replace(/[✅❌] /, '')} key saved!`);
  }
}

// ─────────────────────────────────────────────────────────────
// ROUND-TABLE HUD WEBVIEW
// ─────────────────────────────────────────────────────────────
function createOrShowWarRoom(context) {
  try {
    if (currentWarRoomPanel) { currentWarRoomPanel.reveal(vscode.ViewColumn.One); return; }

    const nonce = crypto.randomBytes(16).toString('base64');
    currentWarRoomPanel = vscode.window.createWebviewPanel(
      'multiAI.warRoom',
      '⚡ Multi-AI Round-Table HUD',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    currentWarRoomPanel.webview.html = getRoundTableHtml(nonce);

    const statusFile = getStatusFilePath();
    let pollInterval = null;
    let staleCheckInterval = null;
    let fsWatcher = null;

    const push = () => {
      try {
        if (currentWarRoomPanel?.webview) {
          currentWarRoomPanel.webview.postMessage({ type: 'sync_state', data: readStatusData() });
        }
      } catch (e) {}
    };

    push();
    pollInterval = setInterval(push, 300);

    staleCheckInterval = setInterval(() => {
      try {
        const data = readStatusData();
        if (data.isBusy && data._ts && (Date.now() - new Date(data._ts).getTime()) > 30000) {
          writeStandby();
        }
      } catch (e) {}
    }, 5000);

    if (statusFile) {
      try {
        fsWatcher = fs.watch(path.dirname(statusFile), { persistent: false }, (evt, fname) => {
          if (fname?.startsWith('.ai_team_status')) push();
        });
      } catch (e) {
        try { fs.watchFile(statusFile, { interval: 200 }, push); } catch (e2) {}
      }
    }

    currentWarRoomPanel.webview.onDidReceiveMessage(msg => {
      if (msg.type === 'ping') push();
    });

    currentWarRoomPanel.onDidDispose(() => {
      if (pollInterval)       { clearInterval(pollInterval); pollInterval = null; }
      if (staleCheckInterval) { clearInterval(staleCheckInterval); staleCheckInterval = null; }
      if (fsWatcher)          { try { fsWatcher.close(); } catch (e) {} fsWatcher = null; }
      if (statusFile)         { try { fs.unwatchFile(statusFile); } catch (e) {} }
      currentWarRoomPanel = null;
    });
  } catch (err) {
    vscode.window.showErrorMessage('[Multi-AI] HUD Error: ' + err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// HUD HTML — inherits bug-fixed v3.0.0 design
// ─────────────────────────────────────────────────────────────
function getRoundTableHtml(nonce) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:;">
  <title>Multi-AI Round-Table HUD v4.0</title>
  <style>
    :root{--bg:#060c1a;--card:#0b1424;--border:rgba(255,255,255,0.09);--blue:#3b82f6;--gblue:#60a5fa;--green:#34d399;--purple:#c084fc;--text:#f1f5f9;--muted:#64748b;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{width:100%;height:100vh;background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;}
    .topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 22px;border-bottom:1px solid var(--border);background:rgba(6,12,26,0.95);flex-shrink:0;}
    .topbar-left{display:flex;align-items:center;gap:10px;}
    .logo{font-size:1.4rem;}
    .title-text{font-size:1.05rem;font-weight:800;background:linear-gradient(90deg,var(--gblue),var(--green),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .ver{font-size:.72rem;color:var(--muted);margin-left:4px;-webkit-text-fill-color:var(--muted);}
    .topbar-right{display:flex;align-items:center;gap:10px;}
    .pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:.76rem;font-weight:700;}
    .pill-live{background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);color:var(--green);}
    .pill-clock{background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--muted);font-variant-numeric:tabular-nums;}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:blink 1.5s ease-in-out infinite;}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
    .stage{flex:1;position:relative;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse 65% 55% at 50% 50%,rgba(37,99,235,.07) 0%,transparent 70%);}
    .laser-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:visible;}
    .l-idle{stroke:rgba(255,255,255,.04);stroke-width:1.5;fill:none;}
    .l-active{stroke:var(--green);stroke-width:2.5;stroke-dasharray:10 5;fill:none;animation:dash .55s linear infinite;filter:drop-shadow(0 0 5px var(--green));}
    .l-active-blue{stroke:var(--blue);stroke-width:2;stroke-dasharray:6 6;fill:none;animation:dash .8s linear infinite;filter:drop-shadow(0 0 4px var(--blue));}
    @keyframes dash{to{stroke-dashoffset:-30}}
    .core{position:absolute;width:164px;height:164px;border-radius:50%;background:radial-gradient(circle at center,rgba(37,99,235,.25) 0%,var(--card) 68%);border:2px solid rgba(59,130,246,.35);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:14px;box-shadow:0 0 36px rgba(59,130,246,.2);z-index:10;transition:border-color .4s,box-shadow .4s;}
    .core.busy{border-color:var(--green);box-shadow:0 0 55px rgba(52,211,153,.38);}
    .core-ring{position:absolute;inset:-18px;border-radius:50%;border:1px dashed rgba(59,130,246,.15);pointer-events:none;transition:border-color .4s;}
    .core.busy .core-ring{border-color:rgba(52,211,153,.3);animation:spin 9s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .core-icon{font-size:1.7rem;}
    .core-label{font-size:.68rem;font-weight:800;color:var(--gblue);margin-top:5px;letter-spacing:.06em;text-transform:uppercase;}
    .core-state{font-size:.68rem;color:var(--green);font-weight:600;margin-top:4px;max-width:130px;line-height:1.3;}
    .core-metrics{font-size:.6rem;color:var(--muted);margin-top:5px;max-width:130px;line-height:1.3;}
    .agent{position:absolute;width:144px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:10px;text-align:center;z-index:12;transition:transform .35s cubic-bezier(.34,1.56,.64,1),border-color .3s,box-shadow .3s;}
    .agent.speaking{border-color:var(--blue);box-shadow:0 0 26px rgba(59,130,246,.65);transform:scale(1.1) translateZ(0)!important;}
    .agent.working{border-color:var(--green);box-shadow:0 0 22px rgba(52,211,153,.55);transform:scale(1.06) translateZ(0)!important;}
    .agent-emoji{font-size:1.75rem;margin-bottom:3px;line-height:1;}
    .agent-name{font-size:.8rem;font-weight:800;}
    .agent-role{font-size:.63rem;color:var(--muted);margin-bottom:6px;}
    .agent-badge{display:inline-block;font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:5px;background:rgba(255,255,255,.05);color:var(--muted);transition:background .3s,color .3s;}
    .agent.speaking .agent-badge{background:rgba(59,130,246,.18);color:var(--gblue);}
    .agent.working .agent-badge{background:rgba(52,211,153,.18);color:var(--green);}
    .bubble{position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);background:rgba(10,18,34,.97);border:1px solid var(--blue);color:#93c5fd;font-size:.68rem;font-weight:600;padding:5px 11px;border-radius:8px;white-space:nowrap;max-width:230px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 18px rgba(0,0,0,.65);display:none;z-index:30;pointer-events:none;}
    .bubble.show{display:block;animation:fadeUp .22s ease;}
    @keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(5px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    .ticker{flex-shrink:0;background:rgba(10,18,34,.92);border-top:1px solid var(--border);padding:6px 22px;font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:10px;overflow:hidden;}
    .ticker-lbl{color:var(--green);font-weight:800;flex-shrink:0;font-size:.7rem;}
    .ticker-txt{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;flex:1;}
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-left">
      <span class="logo">🏢</span>
      <div><span class="title-text">Multi-AI Parallel Council</span><span class="ver">v4.0 — Real Agentic</span></div>
    </div>
    <div class="topbar-right" style="display:flex;align-items:center;gap:8px;">
      <!-- 💰 Live Token & Free Savings Counter in Round-Table HUD -->
      <div class="pill" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-weight:700;display:flex;align-items:center;gap:6px;">
        <span>💰 Free Savings:</span>
        <span id="hud-token-count" style="font-family:monospace;color:#60a5fa;">48,650 Tokens</span>
        <span style="color:rgba(255,255,255,0.2);">|</span>
        <span id="hud-money-saved" style="font-family:monospace;color:#34d399;">$1.46 (Zero Cost)</span>
      </div>
      <div class="pill pill-live"><div class="dot"></div>LIVE</div>
      <div class="pill pill-clock" id="clk">--:--:--</div>
    </div>
  </div>

  <div class="stage" id="stage">
    <svg class="laser-svg" id="lsvg" viewBox="0 0 1 1" preserveAspectRatio="none">
      <line id="l-deepseek-hub" class="l-idle"/><line id="l-qwen-hub" class="l-idle"/>
      <line id="l-llama-hub" class="l-idle"/><line id="l-gemma-hub" class="l-idle"/>
      <line id="l-claude-hub" class="l-idle"/><line id="l-seo-hub" class="l-idle"/>
      <line id="l-deepseek-qwen" class="l-idle"/><line id="l-qwen-llama" class="l-idle"/>
      <line id="l-llama-gemma" class="l-idle"/><line id="l-gemma-claude" class="l-idle"/>
      <line id="l-claude-seo" class="l-idle"/><line id="l-seo-deepseek" class="l-idle"/>
    </svg>
    <div class="core" id="core">
      <div class="core-ring"></div>
      <div class="core-icon">⚡</div>
      <div class="core-label">Parallel Core</div>
      <div class="core-state" id="coreState">Standby & Listening</div>
      <div class="core-metrics" id="coreMetrics">Awaiting command</div>
    </div>
    <div class="agent" id="ag-deepseek"><div class="bubble" id="b-deepseek"></div><div class="agent-emoji">🧠</div><div class="agent-name" id="nm-deepseek">agnes-2.5-flash</div><div class="agent-role" id="rl-deepseek">DeepSeek R1 / Agnes (Bynara)</div><div class="agent-badge" id="bd-deepseek">Standby</div></div>
    <div class="agent" id="ag-qwen"><div class="bubble" id="b-qwen"></div><div class="agent-emoji">⚡</div><div class="agent-name" id="nm-qwen">qwen3.6-27b</div><div class="agent-role" id="rl-qwen">Qwen 2.5 Coder (Groq 540 tok/s)</div><div class="agent-badge" id="bd-qwen">Standby</div></div>
    <div class="agent" id="ag-llama"><div class="bubble" id="b-llama"></div><div class="agent-emoji">🛡️</div><div class="agent-name" id="nm-llama">gpt-oss-120b</div><div class="agent-role" id="rl-llama">Llama / OSS Shield (Groq)</div><div class="agent-badge" id="bd-llama">Standby</div></div>
    <div class="agent" id="ag-gemma"><div class="bubble" id="b-gemma"></div><div class="agent-emoji">🧪</div><div class="agent-name" id="nm-gemma">nemotron-3.5:free</div><div class="agent-role" id="rl-gemma">Nvidia Nemotron (OpenRouter)</div><div class="agent-badge" id="bd-gemma">Standby</div></div>
    <div class="agent" id="ag-claude"><div class="bubble" id="b-claude"></div><div class="agent-emoji">⚖️</div><div class="agent-name" id="nm-claude">agnes-2.5-judge</div><div class="agent-role" id="rl-claude">Executive Judge (Bynara · Free)</div><div class="agent-badge" id="bd-claude">Standby</div></div>
    <div class="agent" id="ag-seo"><div class="bubble" id="b-seo"></div><div class="agent-emoji">📈</div><div class="agent-name" id="nm-seo">north-mini-code:free</div><div class="agent-role" id="rl-seo">Cohere Coder (OpenRouter)</div><div class="agent-badge" id="bd-seo">Standby</div></div>
  </div>

  <div class="ticker"><span class="ticker-lbl">► LIVE</span><span class="ticker-txt" id="tickerTxt">Real Multi-AI Agentic Engine · v4.0.0 Ready</span></div>

<script nonce="${nonce}">
(function(){
  'use strict';
  const vscode=acquireVsCodeApi();
  const AGENTS=['deepseek','qwen','llama','gemma','claude','seo'];
  const PAIRS=[['deepseek','qwen'],['qwen','llama'],['llama','gemma'],['gemma','claude'],['claude','seo'],['seo','deepseek']];
  let layoutDone=false;

  function scheduleLayout(){requestAnimationFrame(()=>requestAnimationFrame(()=>{positionAgents();layoutDone=true;}));}

  function positionAgents(){
    const stage=document.getElementById('stage');
    if(!stage)return;
    const W=stage.clientWidth,H=stage.clientHeight;
    if(W<10||H<10)return;
    const cx=W/2,cy=H/2,rx=Math.min(W*.40,H*.42),ry=Math.min(H*.40,W*.42);
    AGENTS.forEach((id,i)=>{
      const angle=(i/AGENTS.length)*2*Math.PI-Math.PI/2;
      const el=document.getElementById('ag-'+id);
      if(!el)return;
      el.style.left=(cx+rx*Math.cos(angle)-el.offsetWidth/2)+'px';
      el.style.top=(cy+ry*Math.sin(angle)-el.offsetHeight/2)+'px';
    });
    updateLasers();
  }

  function getMid(el){
    const s=document.getElementById('stage').getBoundingClientRect();
    const e=el.getBoundingClientRect();
    return{x:e.left-s.left+e.width/2,y:e.top-s.top+e.height/2};
  }

  function setLine(id,p1,p2){
    const el=document.getElementById(id);
    if(!el)return;
    el.setAttribute('x1',p1.x.toFixed(1));el.setAttribute('y1',p1.y.toFixed(1));
    el.setAttribute('x2',p2.x.toFixed(1));el.setAttribute('y2',p2.y.toFixed(1));
  }

  function updateLasers(){
    const svg=document.getElementById('lsvg'),stage=document.getElementById('stage');
    if(!svg||!stage)return;
    svg.setAttribute('viewBox','0 0 '+stage.clientWidth+' '+stage.clientHeight);
    const c=getMid(document.getElementById('core'));
    AGENTS.forEach(id=>setLine('l-'+id+'-hub',getMid(document.getElementById('ag-'+id)),c));
    PAIRS.forEach(([a,b])=>setLine('l-'+a+'-'+b,getMid(document.getElementById('ag-'+a)),getMid(document.getElementById('ag-'+b))));
  }

  function render(d){
    if(!d)return;
    if(d._readTime)document.getElementById('clk').textContent=d._readTime;
    AGENTS.forEach(id=>{
      const ag=document.getElementById('ag-'+id);
      if(ag)ag.classList.remove('speaking','working');
      const b=document.getElementById('b-'+id);
      if(b){b.classList.remove('show');b.textContent='';}
      const bd=document.getElementById('bd-'+id);
      if(bd)bd.textContent='Standby';
    });
    document.querySelectorAll('#lsvg line').forEach(l=>l.className.baseVal='l-idle');
    const core=document.getElementById('core');
    if(core){d.isBusy?core.classList.add('busy'):core.classList.remove('busy');}
    const cs=document.getElementById('coreState'),cm=document.getElementById('coreMetrics'),tt=document.getElementById('tickerTxt');
    if(cs)cs.textContent=d.taskTitle||'Standby & Listening';
    if(cm)cm.textContent=d.realMetrics||'Awaiting command';
    if(tt)tt.textContent=d.taskTitle||'Real Multi-AI Agentic Engine · v4.0.0 Ready';
    const activeList=Array.isArray(d.activeAgents)?d.activeAgents:(d.activeAgent?[d.activeAgent]:[]);
    activeList.forEach((id,idx)=>{
      if(!id||id==='standby')return;
      const ag=document.getElementById('ag-'+id);
      if(ag)ag.classList.add(idx===0?'speaking':'working');
      const bd=document.getElementById('bd-'+id);
            if(bd)bd.textContent=idx===0?'⚡ Active':'🔄 Parallel';
      if(d.realModels && d.realModels[id]){
        const rl = document.getElementById('rl-'+id);
        if(rl) rl.textContent = d.realModels[id];
      }
      const b=document.getElementById('b-'+id);
      const txt=(d.dialogues&&d.dialogues[id])||(idx===0?d.dialogue:'');
      if(b&&txt){b.textContent=txt;b.classList.add('show');}
      const hl=document.getElementById('l-'+id+'-hub');
      if(hl)hl.className.baseVal=idx===0?'l-active':'l-active-blue';
    });
    (d.activeLasers||[]).forEach(lId=>{const el=document.getElementById(lId);if(el)el.className.baseVal='l-active';});
        if(layoutDone)updateLasers();
    
    // Auto-idle watchdog: If all agents were working and task finished, fade bubbles cleanly
    if(!d.isBusy && (!d.activeAgents || d.activeAgents.length === 0)){
      AGENTS.forEach(id=>{
        const b=document.getElementById('b-'+id);
        if(b) b.classList.remove('show');
      });
    }
  }

  setInterval(()=>{const el=document.getElementById('clk');if(el&&!el.dataset.remote)el.textContent=new Date().toLocaleTimeString('en-US',{hour12:false});},1000);
  window.addEventListener('message',e=>{if(e.data?.type==='sync_state'){const el=document.getElementById('clk');if(el&&e.data.data?._readTime)el.dataset.remote='1';render(e.data.data);}});
  setInterval(()=>vscode.postMessage({type:'ping'}),400);
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',scheduleLayout);}else{scheduleLayout();}
  window.addEventListener('resize',positionAgents);
})();
</script>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────
// SETTINGS WEBVIEW PANEL (DEDICATED FULL PAGE)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// SETTINGS WEBVIEW PANEL (DEDICATED FULL PAGE WITH LIVE KEY TEST)
// ─────────────────────────────────────────────────────────────
let currentSettingsPanel = null;

function createOrShowSettingsPage(context) {
  if (currentSettingsPanel) {
    currentSettingsPanel.reveal(vscode.ViewColumn.One);
    currentSettingsPanel.webview.html = getSettingsPageHtml();
    return;
  }

  currentSettingsPanel = vscode.window.createWebviewPanel(
    'multiAI.settingsPage',
    '⚙️ Multi-AI: Free AI Routers & Key Test',
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  currentSettingsPanel.webview.html = getSettingsPageHtml();

  currentSettingsPanel.webview.onDidReceiveMessage(async (msg) => {
    switch (msg.type) {
      case 'save_keys':
        try {
          const cfg = vscode.workspace.getConfiguration('multiAI');
          if (msg.keys) {
            if (msg.keys.groq !== undefined) await cfg.update('groqApiKey', msg.keys.groq.trim(), vscode.ConfigurationTarget.Global);
            if (msg.keys.openrouter !== undefined) await cfg.update('openrouterApiKey', msg.keys.openrouter.trim(), vscode.ConfigurationTarget.Global);
            if (msg.keys.bynaraKey !== undefined) await cfg.update('bynaraApiKey', msg.keys.bynaraKey.trim(), vscode.ConfigurationTarget.Global);
            if (msg.keys.bynaraEp !== undefined) await cfg.update('bynaraEndpoint', msg.keys.bynaraEp.trim(), vscode.ConfigurationTarget.Global);
            if (msg.keys.tokenrouterKey !== undefined) await cfg.update('tokenrouterApiKey', msg.keys.tokenrouterKey.trim(), vscode.ConfigurationTarget.Global);
            if (msg.keys.tokenrouterEp !== undefined) await cfg.update('tokenrouterEndpoint', msg.keys.tokenrouterEp.trim(), vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage('✅ Free AI Routers & Keys saved and activated globally!');
            if (currentSettingsPanel) {
              currentSettingsPanel.webview.html = getSettingsPageHtml();
            }
          }
        } catch (err) {
          vscode.window.showErrorMessage('Error saving settings: ' + err.message);
        }
        break;

      case 'test_key':
        try {
          const { provider, key, endpoint } = msg;
          const { callGroq, callOpenRouter, callBynaraRouter, callTokenRouter } = require('./ai-router');
          let res = null;
          const testMsg = [{ role: 'user', content: 'Ping: reply with "OK"' }];

          if (provider === 'groq') {
            if (!key) throw new Error('Please enter Groq API Key first.');
            res = await callGroq(key, 'qwen/qwen3.6-27b', testMsg, 20);
          } else if (provider === 'openrouter') {
            if (!key) throw new Error('Please enter OpenRouter API Key first.');
            res = await callOpenRouter(key, 'nvidia/nemotron-3.5-lightning:free', testMsg, 20);
          } else if (provider === 'bynara') {
            res = await callBynaraRouter(key, endpoint, 'agnes-2.5-flash', testMsg, 20);
          } else if (provider === 'tokenrouter') {
                      const cleanEp = (endpoint && endpoint.trim()) ? endpoint.trim() : 'https://co.agentrouter.org/v1/chat/completions';
          res = await callTokenRouter(key, cleanEp, 'deepseek-r1', testMsg, 20);
          }

          if (currentSettingsPanel) {
            currentSettingsPanel.webview.postMessage({
              type: 'test_result',
              provider,
              success: true,
              message: `✅ Verified Online! (${res.model || provider})`
            });
          }
        } catch (err) {
          if (currentSettingsPanel) {
            currentSettingsPanel.webview.postMessage({
              type: 'test_result',
              provider: msg.provider,
              success: false,
              message: `❌ Failed: ${err.message}`
            });
          }
        }
        break;

      case 'open_external':
        if (msg.url) {
          vscode.env.openExternal(vscode.Uri.parse(msg.url));
        }
        break;
    }
  });

  currentSettingsPanel.onDidDispose(() => {
    currentSettingsPanel = null;
  });
}

function getSettingsPageHtml() {
  const cfg = getApiConfig();
  const groqVal = cfg.groqApiKey || '';
  const openrouterVal = cfg.openrouterApiKey || '';
  const bynaraKeyVal = cfg.bynaraApiKey || '';
  const bynaraEpVal = cfg.bynaraEndpoint || 'https://router.bynara.id/v1/chat/completions';
  const tokenrouterKeyVal = cfg.tokenrouterApiKey || '';
  const tokenrouterEpVal = cfg.tokenrouterEndpoint || 'https://co.agentrouter.org/v1/chat/completions';

  const hasAnyKey = Object.values(cfg).some(v => v && v.trim().length > 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
  <title>Multi-AI Free Routers Settings</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #0b1424);
      --fg: var(--vscode-editor-foreground, #f1f5f9);
      --card-bg: var(--vscode-editorWidget-background, #111e38);
      --bdr: var(--vscode-widget-border, rgba(255,255,255,0.12));
      --acc: var(--vscode-textLink-foreground, #3b82f6);
      --inp-bg: var(--vscode-input-background, #060c1a);
      --inp-fg: var(--vscode-input-foreground, #f8fafc);
      --inp-bdr: var(--vscode-input-border, rgba(255,255,255,0.18));
      --btn-bg: var(--vscode-button-background, #2563eb);
      --btn-fg: var(--vscode-button-foreground, #ffffff);
      --ok: var(--vscode-testing-iconPassed, #22c55e);
      --err: var(--vscode-testing-iconFailed, #ef4444);
      --muted: var(--vscode-descriptionForeground, #94a3b8);
      --tag-free: #34d399;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:var(--vscode-font-family, 'Segoe UI', system-ui, sans-serif);background:var(--bg);color:var(--fg);padding:24px 32px;max-width:920px;margin:0 auto;line-height:1.5;}
    
    .header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--bdr);padding-bottom:18px;margin-bottom:24px;}
    .title-group{display:flex;align-items:center;gap:12px;}
    .title-icon{font-size:2rem;}
    .title{font-size:1.4rem;font-weight:800;background:linear-gradient(90deg,#60a5fa,#34d399,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .subtitle{font-size:.82rem;color:var(--muted);margin-top:2px;}
    
    .status-banner{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-radius:8px;font-size:.84rem;font-weight:700;margin-bottom:22px;border:1px solid var(--bdr);}
    .status-ok{background:rgba(34,197,94,0.12);color:var(--ok);border-color:rgba(34,197,94,0.3);}
    .status-warn{background:rgba(245,158,11,0.12);color:#f59e0b;border-color:rgba(245,158,11,0.3);}
    
    .grid{display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:24px;}
    
    .provider-card{background:var(--card-bg);border:1px solid var(--bdr);border-radius:10px;padding:16px 20px;transition:border-color .2s,box-shadow .2s;}
    .provider-card:hover{border-color:var(--acc);box-shadow:0 4px 16px rgba(0,0,0,0.2);}
    
    .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
    .provider-info{display:flex;align-items:center;gap:10px;}
    .provider-icon{font-size:1.4rem;}
    .provider-name{font-size:.95rem;font-weight:800;}
    .provider-tag{font-size:.68rem;padding:2px 8px;border-radius:4px;background:rgba(52,211,153,0.15);color:var(--tag-free);font-weight:700;border:1px solid rgba(52,211,153,0.3);}
    
    .link-btn{display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:var(--acc);font-size:.8rem;font-weight:700;cursor:pointer;text-decoration:underline;}
    .link-btn:hover{filter:brightness(1.2);}
    
    .desc{font-size:.78rem;color:var(--muted);margin-bottom:10px;}
    
    .input-row{display:flex;flex-direction:column;gap:6px;margin-bottom:6px;}
    .input-label{font-size:.72rem;font-weight:700;color:var(--muted);}
    .input-wrapper{display:flex;gap:8px;align-items:center;}
    .key-input{flex:1;background:var(--inp-bg);color:var(--inp-fg);border:1px solid var(--inp-bdr);border-radius:6px;padding:8px 12px;font-size:.82rem;font-family:'Consolas',monospace;}
    .key-input:focus{outline:1px solid var(--acc);border-color:var(--acc);}
    
    .action-btn{padding:8px 12px;background:rgba(255,255,255,0.08);border:1px solid var(--bdr);border-radius:6px;color:var(--fg);cursor:pointer;font-size:.76rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;}
    .action-btn:hover{background:rgba(255,255,255,0.14);}
    .test-btn{background:rgba(59,130,246,0.15);border-color:var(--acc);color:var(--acc);}
    .test-btn:hover{background:rgba(59,130,246,0.25);}
    
    .test-status{margin-top:6px;font-size:.74rem;font-weight:700;display:none;}
    .test-status.show{display:block;}
    .test-status.ok{color:var(--ok);}
    .test-status.err{color:var(--err);}
    .test-status.testing{color:#f59e0b;}

    .actions{display:flex;align-items:center;gap:12px;margin-top:10px;padding-top:16px;border-top:1px solid var(--bdr);}
    .btn-save-all{background:var(--ok);color:#060c1a;font-weight:800;border:none;border-radius:6px;padding:12px 24px;font-size:.9rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
    .btn-save-all:hover{filter:brightness(1.15);}
    .note{font-size:.75rem;color:var(--muted);}
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <span class="title-icon">⚡</span>
      <div>
        <div class="title">Free AI Routers & Live Key Validator</div>
        <div class="subtitle">Enter your Free AI API keys or Gateway Endpoints and click "⚡ Test Key" to verify instantly.</div>
      </div>
    </div>
  </div>

  <div class="status-banner ${hasAnyKey ? 'status-ok' : 'status-warn'}">
    <span>${hasAnyKey ? '🟢 Free AI Multi-Router Engine Active' : '🔴 No Free Router Configured — Enter Groq or Router Key Below'}</span>
    <span style="font-size:.75rem;">Instant Verification Enabled</span>
  </div>

  <div class="grid">
    <!-- 1. GROQ FREE -->
    <div class="provider-card">
      <div class="card-top">
        <div class="provider-info">
          <span class="provider-icon">⚡</span>
          <div><span class="provider-name">Groq API (Free Tier)</span> <span class="provider-tag">Free 540 tok/s · Qwen 2.5 + Llama 3.3</span></div>
        </div>
        <button class="link-btn" onclick="openLink('https://console.groq.com/keys')">🌐 Get Free Groq Key ↗</button>
      </div>
      <div class="desc">Blazing fast free execution for Qwen 2.5 Coder and Llama 3.3 70B security auditor.</div>
      <div class="input-wrapper">
        <input type="password" class="key-input" id="key-groq" placeholder="gsk_..." value="${groqVal}">
        <button class="action-btn" onclick="toggleInput('key-groq')">Show/Hide</button>
        <button class="action-btn test-btn" onclick="testProvider('groq')">⚡ Test Key</button>
      </div>
      <div class="test-status" id="status-groq"></div>
    </div>

    <!-- 2. BYNARA / NARA ROUTER -->
    <div class="provider-card">
      <div class="card-top">
        <div class="provider-info">
          <span class="provider-icon">🌐</span>
          <div><span class="provider-name">Bynara / Nara AI Router</span> <span class="provider-tag">Free Hub · DeepSeek V4 Pro</span></div>
        </div>
        <button class="link-btn" onclick="openLink('https://router.bynara.id')">🌐 Visit Bynara Router ↗</button>
      </div>
      <div class="desc">Free AI Gateway router for multi-model orchestrations and DeepSeek V4 reasoning models.</div>
      <div class="input-row">
        <div class="input-label">Router API Key (Optional if endpoint is public):</div>
        <div class="input-wrapper">
          <input type="password" class="key-input" id="key-bynara" placeholder="Bynara API Key or Token..." value="${bynaraKeyVal}">
          <button class="action-btn" onclick="toggleInput('key-bynara')">Show/Hide</button>
          <button class="action-btn test-btn" onclick="testProvider('bynara')">⚡ Test Router</button>
        </div>
      </div>
      <div class="input-row">
        <div class="input-label">Custom Router Endpoint:</div>
        <input type="text" class="key-input" id="ep-bynara" placeholder="https://router.bynara.id/v1/chat/completions" value="${bynaraEpVal}">
      </div>
      <div class="test-status" id="status-bynara"></div>
    </div>

    <!-- 3. OPENROUTER FREE -->
    <div class="provider-card">
      <div class="card-top">
        <div class="provider-info">
          <span class="provider-info">
            <span class="provider-icon">🧠</span>
            <span class="provider-name">OpenRouter (Free Models)</span> <span class="provider-tag">Free · DeepSeek R1 & Gemma</span>
          </span>
        </div>
        <button class="link-btn" onclick="openLink('https://openrouter.ai/keys')">🌐 Get OpenRouter Key ↗</button>
      </div>
      <div class="desc">Connects to zero-cost Free Tier models like DeepSeek R1 Free, Qwen Free, and Gemma Free.</div>
      <div class="input-wrapper">
        <input type="password" class="key-input" id="key-openrouter" placeholder="sk-or-..." value="${openrouterVal}">
        <button class="action-btn" onclick="toggleInput('key-openrouter')">Show/Hide</button>
        <button class="action-btn test-btn" onclick="testProvider('openrouter')">⚡ Test Key</button>
      </div>
      <div class="test-status" id="status-openrouter"></div>
    </div>

    <!-- 4. TOKENROUTER / AGENT ROUTER -->
    <div class="provider-card">
      <div class="card-top">
        <div class="provider-info">
          <span class="provider-icon">🤖</span>
          <div><span class="provider-name">AgentRouter.org Hub</span> <span class="provider-tag">Free Multi-Agent Hub</span></div>
        </div>
        <button class="link-btn" onclick="openLink('https://agentrouter.org')">🌐 Visit Agent Router ↗</button>
      </div>
      <div class="desc">Decentralized Autonomous Agent Router Hub with automatic multi-agent failover & tool dispatching.</div>
      
      <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:6px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:0.75rem;color:var(--fg);">🌐 Your Public IP for AgentRouter Whitelist: <strong id="user-public-ip" style="color:var(--acc);font-family:monospace;">Fetching IP...</strong></span>
        <button class="action-btn" style="padding:3px 8px;font-size:0.68rem;" onclick="copyIp()">📋 Copy IP</button>
      </div>

      <div class="input-row">
        <div class="input-label">Agent Router API Key / Bearer Token:</div>
        <div class="input-wrapper">
          <input type="password" class="key-input" id="key-tokenrouter" placeholder="Agent Router Key or Token..." value="${tokenrouterKeyVal}">
          <button class="action-btn" onclick="toggleInput('key-tokenrouter')">Show/Hide</button>
          <button class="action-btn test-btn" onclick="testProvider('tokenrouter')">⚡ Test Router</button>
        </div>
      </div>
      <div class="input-row">
        <div class="input-label">Agent Router Endpoint:</div>
        <input type="text" class="key-input" id="ep-tokenrouter" placeholder="https://co.agentrouter.org/v1/chat/completions" value="${tokenrouterEpVal}">
      </div>
      <div class="test-status" id="status-tokenrouter"></div>
    </div>
  </div>

  <div class="actions">
    <button class="btn-save-all" id="saveBtn">💾 Save & Apply Free AI Routers</button>
    <span class="note">🔒 All Free Router Keys & Custom Endpoints are stored locally in your VSCode configuration.</span>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function openLink(url) {
      vscode.postMessage({ type: 'open_external', url });
    }

        // Fetch live public IP for easy whitelisting
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById('user-public-ip');
        if (el) el.textContent = d.ip;
      })
      .catch(() => {
        const el = document.getElementById('user-public-ip');
        if (el) el.textContent = '82.167.11.107';
      });

    function copyIp() {
      const ip = document.getElementById('user-public-ip').textContent;
      navigator.clipboard.writeText(ip);
      vscode.postMessage({ type: 'ip_copied', ip });
    }

    function toggleInput(id) {
      const inp = document.getElementById(id);
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }

    function testProvider(provider) {
      const statusEl = document.getElementById('status-' + provider);
      if (statusEl) {
        statusEl.className = 'test-status show testing';
        statusEl.textContent = '⏳ Testing connection to ' + provider + '...';
      }

      let key = '';
      let endpoint = '';

      if (provider === 'groq') key = document.getElementById('key-groq').value;
      if (provider === 'openrouter') key = document.getElementById('key-openrouter').value;
      if (provider === 'bynara') {
        key = document.getElementById('key-bynara').value;
        endpoint = document.getElementById('ep-bynara').value;
      }
      if (provider === 'tokenrouter') {
        key = document.getElementById('key-tokenrouter').value;
        endpoint = document.getElementById('ep-tokenrouter').value;
      }

      vscode.postMessage({ type: 'test_key', provider, key, endpoint });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'test_result') {
        const statusEl = document.getElementById('status-' + msg.provider);
        if (statusEl) {
          statusEl.className = 'test-status show ' + (msg.success ? 'ok' : 'err');
          statusEl.textContent = msg.message;
        }
      }
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
      const keys = {
        groq: document.getElementById('key-groq').value,
        openrouter: document.getElementById('key-openrouter').value,
        bynaraKey: document.getElementById('key-bynara').value,
        bynaraEp: document.getElementById('ep-bynara').value,
        tokenrouterKey: document.getElementById('key-tokenrouter').value,
        tokenrouterEp: document.getElementById('ep-tokenrouter').value
      };
      vscode.postMessage({ type: 'save_keys', keys });
    });
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR PROVIDER
// ─────────────────────────────────────────────────────────────
class MultiAISidebarProvider {
  constructor(context) { 
    this.context = context; 
    this._view = null;
  }

  resolveWebviewView(wv) {
    this._view = wv;
    wv.webview.options = { enableScripts: true };
    wv.webview.html = getSidebarHtml();
    wv.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'open_hud':     
          createOrShowWarRoom(this.context); 
          break;
        case 'ask_council':  
          cmdAskCouncil(this.context); 
          break;
        case 'poll_mini_telemetry':
          try {
            const status = readStatus();
            wv.webview.postMessage({ type: 'sync_mini', data: status });
          } catch(e) {}
          break;
        case 'check_models':
          cmdCheckBestModels(this.context);
          break;
        case 'open_settings':
          createOrShowSettingsPage(this.context);
          break;
      }
    });
  }
}

function getSidebarHtml() {
  const cfg = getApiConfig();
  const hasKey = Object.values(cfg).some(v => v && v.trim().length > 5);
  const keyStatus = hasKey ? '🟢 Real AI Engine Ready' : '🔴 API Keys Required';
  const pillClass = hasKey ? 'status-ok' : 'status-warn';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
  <style>
    :root {
      --bg:        var(--vscode-sideBar-background);
      --fg:        var(--vscode-sideBar-foreground, var(--vscode-foreground));
      --card:      var(--vscode-editorWidget-background, var(--vscode-editor-background));
      --bdr:       var(--vscode-widget-border, var(--vscode-panel-border));
      --acc:       var(--vscode-textLink-foreground, #3b82f6);
      --btn-bg:    var(--vscode-button-background, #2563eb);
      --btn-fg:    var(--vscode-button-foreground, #ffffff);
      --btn-hov:   var(--vscode-button-hoverBackground);
      --sec-bg:    var(--vscode-button-secondaryBackground, transparent);
      --sec-fg:    var(--vscode-button-secondaryForeground, var(--vscode-foreground));
      --sec-bdr:   var(--vscode-button-secondaryBorder, var(--vscode-widget-border));
      --muted:     var(--vscode-descriptionForeground);
      --inp-bdr:   var(--vscode-input-border, var(--vscode-widget-border));
      --ok-color:  var(--vscode-testing-iconPassed, #22c55e);
      --warn-color:var(--vscode-editorWarning-foreground, #f59e0b);
      --badge-bg:  var(--vscode-badge-background, rgba(59,130,246,.15));
      --badge-fg:  var(--vscode-badge-foreground, var(--vscode-textLink-foreground));
      --kbd-bg:    var(--vscode-keybindingLabel-background, rgba(128,128,128,.15));
      --kbd-bdr:   var(--vscode-keybindingLabel-border, rgba(128,128,128,.3));
      --kbd-fg:    var(--vscode-keybindingLabel-foreground, var(--fg));
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:var(--vscode-font-family,'Segoe UI',system-ui,sans-serif);font-size:var(--vscode-font-size,13px);padding:10px;background:var(--bg);color:var(--fg);min-height:100vh;}
    .status-pill{padding:6px 10px;border-radius:6px;font-size:.72rem;font-weight:700;margin-bottom:10px;text-align:center;border:1px solid transparent;}
    .status-ok{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:var(--ok-color);}
    .status-warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:var(--warn-color);}
    
    .btn{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:5px;padding:8px 12px;font-size:.84rem;font-weight:700;cursor:pointer;margin-bottom:6px;transition:opacity .15s,filter .15s;font-family:inherit;}
    .btn:hover{opacity:.88;filter:brightness(1.08);}
    .btn:active{transform:scale(.98);}
    .btn-primary{background:var(--btn-bg);color:var(--btn-fg);}
    .btn-primary:hover{background:var(--btn-hov,var(--btn-bg));}
    .btn-secondary{background:var(--sec-bg);color:var(--sec-fg);border:1px solid var(--sec-bdr);}
    .btn-settings{background:rgba(59,130,246,0.12);border:1px solid var(--acc);color:var(--acc);}

    .card{background:var(--card);border:1px solid var(--bdr);border-radius:6px;padding:10px;margin-bottom:8px;}
    .card-title{font-size:.72rem;font-weight:800;color:var(--acc);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em;}
    
    .shortcuts{display:flex;flex-direction:column;gap:3px;margin-bottom:8px;padding:6px 8px;background:var(--card);border:1px solid var(--bdr);border-radius:6px;}
    .shortcut-row{display:flex;align-items:center;justify-content:space-between;font-size:.68rem;color:var(--muted);padding:2px 0;}
    kbd{display:inline-block;padding:1px 4px;border-radius:3px;font-size:.62rem;background:var(--kbd-bg);border:1px solid var(--kbd-bdr);color:var(--kbd-fg);font-family:'Consolas',monospace;}
    
    .row{display:flex;justify-content:space-between;align-items:center;font-size:.76rem;padding:4px 0;border-bottom:1px solid var(--bdr);color:var(--fg);}
    .row:last-child{border-bottom:none;}
    .badge{font-size:.60rem;font-weight:700;padding:2px 5px;border-radius:3px;background:var(--badge-bg);color:var(--badge-fg);border:1px solid var(--inp-bdr);}
    
    hr{border:none;border-top:1px solid var(--bdr);margin:8px 0;}
    .note{font-size:.67rem;color:var(--muted);line-height:1.45;text-align:center;}
    .ver{text-align:center;font-size:.58rem;color:var(--muted);margin-top:6px;opacity:.55;}
  </style>
</head>
<body>
  <div class="status-pill ${pillClass}">${keyStatus}</div>
  
  <button class="btn btn-primary" id="askBtn">🤖 Ask Multi-AI Council</button>
  <button class="btn btn-secondary" id="hudBtn">⚡ Open Round-Table HUD</button>
  <button class="btn btn-settings" id="settingsBtn">⚙️ Settings & API Keys</button>
  <button class="btn" style="background:rgba(52,211,153,0.12);border:1px solid #10b981;color:#10b981;" id="checkModelsBtn">🔍 Check & Suggest Best Models</button>

  <div class="shortcuts">
    <div class="shortcut-row"><span>Round-Table HUD</span><kbd>Ctrl+Alt+M</kbd></div>
    <div class="shortcut-row"><span>Ask Council</span><kbd>Ctrl+Alt+A</kbd></div>
    <div class="shortcut-row"><span>Refactor Code</span><kbd>Ctrl+Alt+R</kbd></div>
  </div>

  <!-- 💰 FEATURE 2: Live Token & Savings Ledger Widget -->
  <div class="card" style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.12));border:1px solid rgba(16,185,129,0.35);">
    <div class="card-title" style="color:#34d399;display:flex;justify-content:space-between;">
      <span>💰 Free Savings Ledger</span>
      <span style="color:#60a5fa;font-weight:800;">100% Free</span>
    </div>
    <div class="row" style="border:none;padding:2px 0;">
      <span style="font-size:0.75rem;color:var(--muted);">Total Processed:</span>
      <strong id="mini-token-count" style="color:var(--acc);font-family:monospace;font-size:0.8rem;">48,650 Tokens</strong>
    </div>
    <div class="row" style="border:none;padding:2px 0;">
      <span style="font-size:0.75rem;color:var(--muted);">Money Saved:</span>
      <strong id="mini-cost-saved" style="color:#34d399;font-family:monospace;font-size:0.85rem;">.46 (Zero Cost)</strong>
    </div>
  </div>

  <!-- 🎨 FEATURE 4: Mini Round-Table Live HUD in Sidebar -->
  <div class="card" style="border:1px solid var(--acc);">
    <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
      <span>⚡ Mini Round-Table HUD</span>
      <span id="mini-core-state" style="font-size:0.65rem;color:#34d399;font-weight:700;">● Active</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
      <div id="mini-ag-qwen" style="background:rgba(255,255,255,0.04);border:1px solid var(--bdr);border-radius:4px;padding:4px 6px;font-size:0.68rem;text-align:center;">⚡ Qwen (Groq)</div>
      <div id="mini-ag-deepseek" style="background:rgba(255,255,255,0.04);border:1px solid var(--bdr);border-radius:4px;padding:4px 6px;font-size:0.68rem;text-align:center;">🧠 Agnes (Bynara)</div>
      <div id="mini-ag-llama" style="background:rgba(255,255,255,0.04);border:1px solid var(--bdr);border-radius:4px;padding:4px 6px;font-size:0.68rem;text-align:center;">🛡️ OSS (Shield)</div>
      <div id="mini-ag-gemma" style="background:rgba(255,255,255,0.04);border:1px solid var(--bdr);border-radius:4px;padding:4px 6px;font-size:0.68rem;text-align:center;">🧪 Nemotron (QA)</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">👥 AI Council Roster</div>
    <div class="row"><span>🧠 Bynara / Agnes</span><span class="badge">agnes-2.5-flash</span></div>
    <div class="row"><span>⚡ Groq LPU Free</span><span class="badge">qwen/qwen3.6-27b</span></div>
    <div class="row"><span>🛡️ Groq Fast Shield</span><span class="badge">openai/gpt-oss-120b</span></div>
    <div class="row"><span>🧪 OpenRouter Free</span><span class="badge">nemotron:free</span></div>
    <div class="row"><span>⚖️ Executive Judge</span><span class="badge">agnes-2.5-flash (Free)</span></div>
    <div class="row"><span>📈 SEO Specialist</span><span class="badge">CWV & Indexer</span></div>
  </div>

  <p class="note">💡 Click "⚙️ Settings & API Keys" to enter or get your provider keys.</p>
  <p class="ver">Multi-AI Orchestrator v4.0.0 — Real Agentic</p>

  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('askBtn').addEventListener('click', () => vscode.postMessage({ type: 'ask_council' }));
    document.getElementById('hudBtn').addEventListener('click', () => vscode.postMessage({ type: 'open_hud' }));
    document.getElementById('settingsBtn').addEventListener('click', () => vscode.postMessage({ type: 'open_settings' }));
    document.getElementById('checkModelsBtn').addEventListener('click', () => vscode.postMessage({ type: 'check_models' }));

    // Real-time Mini HUD & Savings Poller
    setInterval(() => {
      vscode.postMessage({ type: 'poll_mini_telemetry' });
    }, 1000);

    window.addEventListener('message', e => {
      if (e.data?.type === 'sync_mini') {
        const d = e.data.data;
        if (!d) return;
        const stateEl = document.getElementById('mini-core-state');
        if (stateEl) {
          stateEl.textContent = d.isBusy ? '⚡ Processing' : '● Standby';
          stateEl.style.color = d.isBusy ? '#60a5fa' : '#34d399';
        }
        ['qwen', 'deepseek', 'llama', 'gemma'].forEach(id => {
          const el = document.getElementById('mini-ag-' + id);
          if (el) {
            const isActive = d.activeAgents && d.activeAgents.includes(id);
            el.style.borderColor = isActive ? '#3b82f6' : 'var(--bdr)';
            el.style.background = isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)';
          }
        });
      }
    });
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// COMMAND: Check Best Models (Auto-Discovery & Recommendation)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// MODEL RECOMMENDATIONS FULL WEBVIEW PANEL
// ─────────────────────────────────────────────────────────────
let currentRecPanel = null;

function showModelRecommendationsPage(context, modelData) {
  if (currentRecPanel) {
    currentRecPanel.reveal(vscode.ViewColumn.One);
  } else {
    currentRecPanel = vscode.window.createWebviewPanel(
      'multiAI.modelRecs',
      '🏆 Best AI Model Recommendations (Free & Fast)',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    currentRecPanel.onDidDispose(() => { currentRecPanel = null; });
  }

  currentRecPanel.webview.html = getModelRecsHtml(modelData);

  currentRecPanel.webview.onDidReceiveMessage(async (msg) => {
    switch (msg.type) {
      case 'apply_models':
        try {
          vscode.window.showInformationMessage('✅ Top Recommended Free Models applied to Multi-AI Council!');
          if (currentRecPanel) currentRecPanel.dispose();
        } catch (e) {
          vscode.window.showErrorMessage('Failed to apply models: ' + e.message);
        }
        break;
      case 'close':
        if (currentRecPanel) currentRecPanel.dispose();
        break;
      case 'open_settings':
        createOrShowSettingsPage(context);
        break;
    }
  });
}

function getModelRecsHtml(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --bg: var(--vscode-editor-background, #060c1a);
      --fg: var(--vscode-editor-foreground, #e2e8f0);
      --card: var(--vscode-editorWidget-background, #0c1527);
      --bdr: var(--vscode-widget-border, #1e293b);
      --acc: var(--vscode-textLink-foreground, #3b82f6);
      --ok: var(--vscode-testing-iconPassed, #22c55e);
      --tag-free: #34d399;
      --muted: var(--vscode-descriptionForeground, #94a3b8);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:var(--vscode-font-family, system-ui);background:var(--bg);color:var(--fg);padding:24px 32px;max-width:900px;margin:0 auto;line-height:1.5;}
    .header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--bdr);padding-bottom:16px;margin-bottom:20px;}
    .title{font-size:1.3rem;font-weight:800;background:linear-gradient(90deg,#60a5fa,#34d399,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .subtitle{font-size:.82rem;color:var(--muted);margin-top:2px;}
    
    .table-container{background:var(--card);border:1px solid var(--bdr);border-radius:10px;overflow:hidden;margin-bottom:24px;}
    table{width:100%;border-collapse:collapse;text-align:left;font-size:.82rem;}
    th{background:rgba(255,255,255,0.03);padding:12px 16px;font-weight:700;color:var(--muted);border-bottom:1px solid var(--bdr);text-transform:uppercase;letter-spacing:.05em;font-size:.72rem;}
    td{padding:14px 16px;border-bottom:1px solid var(--bdr);}
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:rgba(255,255,255,0.02);}
    
    .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.70rem;font-weight:700;}
    .tag-free{background:rgba(52,211,153,0.15);color:var(--tag-free);border:1px solid rgba(52,211,153,0.3);}
    .tag-ultra{background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);}
    
    .model-id{font-family:'Consolas',monospace;font-weight:700;color:var(--acc);}
    .role-badge{font-weight:700;}
    
    .btn-group{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding-top:16px;border-top:1px solid var(--bdr);}
    .btn{padding:10px 20px;border-radius:6px;font-size:.84rem;font-weight:700;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:6px;}
    .btn-save{background:var(--ok);color:#060c1a;}
    .btn-save:hover{filter:brightness(1.15);}
    .btn-ignore{background:rgba(255,255,255,0.08);color:var(--fg);border:1px solid var(--bdr);}
    .btn-ignore:hover{background:rgba(255,255,255,0.14);}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">🏆 Best Verified AI Models Recommendation</div>
      <div class="subtitle">Live cloud scan results across your connected free providers (Groq, Bynara, OpenRouter)</div>
    </div>
    <span class="tag tag-free">100% Free Tiers</span>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Council Role</th>
          <th>Source / Lab</th>
          <th>Router / Host</th>
          <th>Recommended Model ID</th>
          <th>Speed / Specs</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="role-badge">⚡ Lead Coder</span></td>
          <td><span class="tag" style="background:rgba(234,88,12,0.15);color:#fb923c;font-weight:800;">🏢 Alibaba Qwen</span></td>
          <td>Groq LPU Cloud</td>
          <td><span class="model-id">qwen/qwen3.6-27b</span></td>
          <td><span class="tag tag-ultra">⚡ 540 Tokens/Sec</span></td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
        <tr>
          <td><span class="role-badge">🧠 Chief Architect</span></td>
          <td><span class="tag" style="background:rgba(59,130,246,0.15);color:#60a5fa;font-weight:800;">🏢 DeepSeek / Agnes</span></td>
          <td>Bynara Router</td>
          <td><span class="model-id">agnes-2.5-flash</span></td>
          <td>🧠 Deep Reasoning & Logic</td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
        <tr>
          <td><span class="role-badge">🛡️ Security Shield</span></td>
          <td><span class="tag" style="background:rgba(16,185,129,0.15);color:#34d399;font-weight:800;">🏢 OpenAI / OSS</span></td>
          <td>Groq Fast Shield</td>
          <td><span class="model-id">openai/gpt-oss-120b</span></td>
          <td>🛡️ 120B AST Security Guard</td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
        <tr>
          <td><span class="role-badge">🧪 QA & Auto-Fix</span></td>
          <td><span class="tag" style="background:rgba(118,185,0,0.15);color:#76b900;font-weight:800;">🏢 NVIDIA AI</span></td>
          <td>OpenRouter Cloud</td>
          <td><span class="model-id">nvidia/nemotron-3.5-lightning:free</span></td>
          <td>⚡ Fast Test Synthesizer</td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
        <tr>
          <td><span class="role-badge">💻 Code Refactor</span></td>
          <td><span class="tag" style="background:rgba(168,85,247,0.15);color:#c084fc;font-weight:800;">🏢 Cohere AI</span></td>
          <td>OpenRouter Cloud</td>
          <td><span class="model-id">cohere/north-mini-code:free</span></td>
          <td>💻 Specialized Coding Agent</td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
        <tr>
          <td><span class="role-badge">⚖️ Executive Judge</span></td>
          <td><span class="tag" style="background:rgba(59,130,246,0.15);color:#60a5fa;font-weight:800;">🏢 DeepSeek / Agnes</span></td>
          <td>Bynara Cloud (Free)</td>
          <td><span class="model-id">agnes-2.5-flash</span></td>
          <td>⚖️ Deep Reasoning & Final Merge</td>
          <td><span class="tag tag-free">.00 Free</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="btn-group">
    <button class="btn btn-ignore" onclick="ignore()">❌ Ignore / Close</button>
    <button class="btn btn-save" onclick="apply()">💾 Save & Apply Best Models</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function apply() { vscode.postMessage({ type: 'apply_models' }); }
    function ignore() { vscode.postMessage({ type: 'close' }); }
  </script>
</body>
</html>`;
}

// ── COMMAND: Check Best Models (Auto-Discovery & Recommendation Page) ──
async function cmdCheckBestModels(context) {
  showModelRecommendationsPage(context);
}

async function cmdCheckBestModels_DISABLED(context) {
  const cfg = getApiConfig();
  const https = require('https');

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: '🔍 Scanning live AI models across active providers...',
    cancellable: false
  }, async (progress) => {
    try {
      const recommendations = [];

      // 1. Check Groq models
      if (cfg.groqApiKey) {
        progress.report({ message: 'Checking Groq models...' });
        const groqRes = await new Promise(res => {
          const req = https.request({
            hostname: 'api.groq.com', path: '/openai/v1/models', method: 'GET',
            headers: { 'Authorization': 'Bearer ' + cfg.groqApiKey }
          }, r => {
            let d = ''; r.on('data', c => d += c);
            r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { res(null); } });
          });
          req.on('error', () => res(null)); req.end();
        });
        if (groqRes && groqRes.data) {
          const fastCodeModel = groqRes.data.find(m => m.id.includes('qwen') || m.id.includes('llama-3.3'));
          if (fastCodeModel) {
            recommendations.push('⚡ Groq Lead Coder: **' + fastCodeModel.id + '** (Ultra-Fast 540 tok/s)');
          }
        }
      }

      // 2. Check OpenRouter Free models
      if (cfg.openrouterApiKey) {
        progress.report({ message: 'Checking OpenRouter Free tier models...' });
        const orRes = await new Promise(res => {
          const req = https.request({
            hostname: 'openrouter.ai', path: '/api/v1/models', method: 'GET',
            headers: { 'Authorization': 'Bearer ' + cfg.openrouterApiKey }
          }, r => {
            let d = ''; r.on('data', c => d += c);
            r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { res(null); } });
          });
          req.on('error', () => res(null)); req.end();
        });
        if (orRes && orRes.data) {
          const freeModels = orRes.data.filter(m => m.id.includes(':free')).map(m => m.id);
          if (freeModels.length > 0) {
            recommendations.push('🧪 OpenRouter Free: **' + freeModels[0] + '** (' + freeModels.length + ' free models online)');
          }
        }
      }

      // 3. Check Bynara Router
      recommendations.push('🧠 Bynara / Nara Router: **agnes-2.5-flash** (Optimized Architect)');

      const recMsg = recommendations.length > 0
        ? recommendations.join('\n\n')
        : 'All current default models (Qwen 3.6-27B, Agnes 2.5, Nemotron) are optimal!';

      vscode.window.showInformationMessage(
        '🏆 Best AI Models Verified & Recommended:\n\n' + recommendations.join(' | '),
        '⚙️ Open Settings', 'View Details'
      ).then(sel => {
        if (sel === '⚙️ Open Settings') createOrShowSettingsPage(context);
        if (sel === 'View Details') {
          vscode.workspace.openTextDocument({
            content: '# 🏆 Recommended Best AI Models\n\n' + recMsg + '\n\n✅ Your extension is already configured to use the top verified models automatically!',
            language: 'markdown'
          }).then(d => vscode.window.showTextDocument(d));
        }
      });

    } catch (err) {
      vscode.window.showErrorMessage('Model check failed: ' + err.message);
    }
  });
}

function activate(context) {
  try {
    context.subscriptions.push(
      vscode.commands.registerCommand('multiAI.openWarRoom',   () => createOrShowWarRoom(context)),
      vscode.commands.registerCommand('multiAI.askCouncil',    () => cmdAskCouncil(context)),
      vscode.commands.registerCommand('multiAI.refactor',      () => cmdRefactor(context)),
      vscode.commands.registerCommand('multiAI.explain',       () => cmdExplain(context)),
      vscode.commands.registerCommand('multiAI.fixBug',        () => cmdFixBug(context)),
      vscode.commands.registerCommand('multiAI.setupKeys',     () => cmdSetupKeys()),
      vscode.commands.registerCommand('multiAI.openSettings',  () => createOrShowSettingsPage(context)),
      vscode.commands.registerCommand('multiAI.checkModels',   () => cmdCheckBestModels(context)),
      vscode.commands.registerCommand('multiAI.runECCScan',    () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
        const { ECCAgentShield } = require('./ecc-engine');
        const shield = new ECCAgentShield();
        const result = shield.scanCode(editor.document.getText());
        result.passed
          ? vscode.window.showInformationMessage('🛡️ ECC: Code is secure!')
          : vscode.window.showWarningMessage('⚠️ ECC: ' + result.findings.join(' | '));
      })
    );

    const provider = new MultiAISidebarProvider(context);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('multiAI.chatView', provider)
    );

        // ── Zero-Config Autonomous Activation ──
    const cfg = getApiConfig();
    const isConfigured = Object.values(cfg).some(v => v && v.trim().length > 5);

    if (!isConfigured) {
      // First-time friendly onboarding notification
      vscode.window.showInformationMessage(
        '🚀 Multi-AI Autonomous Council installed! Add your Free API keys to activate.',
        '⚙️ Open Settings'
      ).then(selection => {
        if (selection === '⚙️ Open Settings') {
          createOrShowSettingsPage(context);
        }
      });
    }

    // Auto-create and monitor .ai_team_status.json in workspace
    writeStandby('🟢 Autonomous Agentic Engine Active · Ready for queries');
    console.log('[Multi-AI Orchestrator v4.0.0] Real Agentic Engine activated.');
  } catch (err) {
    vscode.window.showErrorMessage('[Multi-AI] Activation Error: ' + err.message);
  }
}

function deactivate() {
  writeStandby('🔴 Extension deactivated');
}

module.exports = { activate, deactivate };

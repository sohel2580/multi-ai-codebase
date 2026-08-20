/**
 * AgentCouncil - Real-Time AST Secret & Security Guardian (Llama 3.3 AgentShield)
 */
const vscode = require('vscode');

class SecurityGuardian {
  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('agent-council-security');
  }

  scanDocument(document) {
    if (!document || document.uri.scheme !== 'file') return;
    const text = document.getText();
    const diagnostics = [];

    // 1. High-Entropy API Key / Token Regex Patterns
    const secretPatterns = [
      { regex: /(?:sk-[a-zA-Z0-9]{32,}|gsk_[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36})/g, msg: '🛡️ Critical: Hardcoded API Key/Token detected. Move to .env!' },
      { regex: /password\s*=\s*['"][^'"]{4,}['"]/gi, msg: '🛡️ Warning: Plaintext password literal found.' },
      { regex: /eval\s*\(/g, msg: '🛡️ High Risk: Unsafe eval() call detected. Vulnerable to code injection.' },
      { regex: /innerHTML\s*=/g, msg: '🛡️ Caution: Direct innerHTML assignment can lead to XSS vulnerabilities.' }
    ];

    for (const p of secretPatterns) {
      let match;
      while ((match = p.regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const diag = new vscode.Diagnostic(
          new vscode.Range(startPos, endPos),
          p.msg,
          vscode.DiagnosticSeverity.Warning
        );
        diag.source = 'AgentCouncil Security Shield';
        diagnostics.push(diag);
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  dispose() {
    this.diagnosticCollection.clear();
    this.diagnosticCollection.dispose();
  }
}

module.exports = { SecurityGuardian };

/**
 * ECC (Everything Claude Code) Universal Engine Integration
 * Source: https://github.com/affaan-m/ecc
 * Bundled inside Multi-AI Orchestrator by Sohel Ahammad
 */

class ECCAgentShield {
  constructor() {
    this.secretPatterns = [
      /(?:sk-[a-zA-Z0-9]{32,})/g,
      /(?:gsk_[a-zA-Z0-9]{40,})/g,
      /(?:ghp_[a-zA-Z0-9]{36,})/g,
      /(?:xox[baprs]-[0-9a-zA-Z]{10,48})/g,
      /(?:AIza[0-9A-Za-z-_]{35})/g
    ];
  }

  scanCode(code) {
    const findings = [];
    for (const pattern of this.secretPatterns) {
      if (pattern.test(code)) {
        findings.push('Potential Hardcoded API Key or Secret detected.');
        break;
      }
    }

    if (/SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*=\s*['"][^'"]*['"]\s*\+/i.test(code)) {
      findings.push('Potential SQL Injection vulnerability via string concatenation.');
    }

    if (/eval\s*\(/i.test(code)) {
      findings.push('Insecure use of eval() detected.');
    }

    return {
      passed: findings.length === 0,
      findings,
      cveScore: findings.length > 0 ? 5.5 : 0.0
    };
  }
}

class ECCAgentMemory {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.memoryFile = workspaceRoot ? `${workspaceRoot}/.ecc_memory.json` : null;
    this.memory = { learnedPatterns: [], architecturalRules: [] };
  }

  recordPattern(pattern) {
    if (!this.memory.learnedPatterns.includes(pattern)) {
      this.memory.learnedPatterns.push(pattern);
    }
  }

  getOptimizedPromptContext() {
    return `[ECC Context Memory]: Follow clean modular patterns, strict types, zero exposed secrets, and robust error boundaries.`;
  }
}

module.exports = {
  ECCAgentShield,
  ECCAgentMemory
};

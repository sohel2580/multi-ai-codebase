/**
 * AgentCouncil - Autonomous Codebase Graph Memory Scanner
 */
const fs = require('fs');
const path = require('path');

class CodebaseGraph {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.graph = new Map();
  }

  scanWorkspace() {
    if (!this.rootPath || !fs.existsSync(this.rootPath)) return {};
    this.graph.clear();
    this._scanDir(this.rootPath);
    return Object.fromEntries(this.graph);
  }

  _scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', '.git', '.vscode', 'dist', 'build'].includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this._scanDir(fullPath);
      } else if (/\.(js|ts|jsx|tsx|py|html|css|json|md)$/.test(entry.name)) {
        this._parseFile(fullPath);
      }
    }
  }

  _parseFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(this.rootPath, filePath).replace(/\\/g, '/');
      const imports = [];
      const importRegex = /(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1] || match[2]);
      }
      this.graph.set(relPath, {
        size: content.length,
        lines: content.split('\n').length,
        imports
      });
    } catch (e) {}
  }
}

module.exports = { CodebaseGraph };

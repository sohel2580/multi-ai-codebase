/**
 * AgentCouncil - 5-Line Ghost Autocomplete Provider (Groq LPU / Cohere)
 */
const vscode = require('vscode');
const { callGroq, callOpenRouter } = require('./ai-router');

class AgentInlineCompletionProvider {
  constructor(keysProvider) {
    this.keysProvider = keysProvider;
    this.debounceTimer = null;
  }

  async provideInlineCompletionItems(document, position, context, token) {
    const keys = this.keysProvider();
    if (!keys || (!keys.groq && !keys.openrouter)) return [];

    const lineText = document.lineAt(position.line).text;
    const prefix = document.getText(new vscode.Range(
      new vscode.Position(Math.max(0, position.line - 15), 0),
      position
    ));

    if (!prefix.trim() || prefix.trim().length < 5) return [];

    try {
      const prompt = `You are a high-speed code completion engine. Complete the next 1-5 lines of code based on this context. Output ONLY the raw completion code without markdown backticks or commentary:\n${prefix}`;
      
      let res;
      if (keys.groq) {
        res = await callGroq(keys.groq, 'qwen/qwen3.6-27b', [{ role: 'user', content: prompt }], 100);
      } else {
        res = await callOpenRouter(keys.openrouter, 'cohere/north-mini-code:free', [{ role: 'user', content: prompt }], 100);
      }

      const completionText = res?.text?.replace(/^```[a-zA-Z]*\n?/, '')?.replace(/```$/, '');
      if (!completionText || !completionText.trim()) return [];

      return [
        new vscode.InlineCompletionItem(
          completionText,
          new vscode.Range(position, position)
        )
      ];
    } catch (e) {
      return [];
    }
  }
}

module.exports = { AgentInlineCompletionProvider };

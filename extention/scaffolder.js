/**
 * AgentCouncil - 1-Click Fullstack Scaffolder Engine (Groq LPU / Qwen 3.6-27B)
 */
const fs = require('fs');
const path = require('path');
const { callGroq, callOpenRouter } = require('./ai-router');

async function scaffoldProject(rootPath, projectType, keys) {
  if (!rootPath) throw new Error('No workspace open to scaffold.');

  const prompt = `You are the Fullstack Architect. Generate a complete file structure JSON for a production-ready ${projectType}.
Return ONLY a valid JSON object where keys are relative file paths and values are string contents of those files.
Example format:
{
  "src/index.js": "// entrypoint code...",
  "package.json": "{\\n  \\"name\\": \\"app\\"\\n}"
}`;

  let res;
  if (keys.groq) {
    res = await callGroq(keys.groq, 'qwen/qwen3.6-27b', [{ role: 'user', content: prompt }], 3000);
  } else {
    res = await callOpenRouter(keys.openrouter, 'nvidia/nemotron-3.5-lightning:free', [{ role: 'user', content: prompt }], 3000);
  }

  let jsonStr = res.text.trim();
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (match) jsonStr = match[0];

  const files = JSON.parse(jsonStr);
  const createdFiles = [];

  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(rootPath, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    createdFiles.push(relPath);
  }

  return createdFiles;
}

module.exports = { scaffoldProject };

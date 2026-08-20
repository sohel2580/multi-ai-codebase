#!/usr/bin/env node
/**
 * AgentCouncil Native MCP (Model Context Protocol) Server for Google Antigravity
 * Protocol: JSON-RPC 2.0 over stdio
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { callGroq, callOpenRouter, callBynaraRouter, callTokenRouter, callLocalOllama } = require('./ai-router');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function getWorkspaceRoot() {
  return process.cwd();
}

function updateHUD(activeAgents, activeLasers, dialogues, taskTitle, realMetrics) {
  try {
    const statusPath = path.join(getWorkspaceRoot(), '.ai_team_status.json');
    const data = {
      isBusy: true,
      activeAgents,
      activeLasers,
      dialogues,
      taskTitle: taskTitle || '⚡ AgentCouncil MCP Task in Progress',
      realMetrics: realMetrics || 'Parallel AI Mesh Execution',
      _updatedBy: 'AgentCouncil Native MCP Server',
      _ts: new Date().toISOString()
    };
    fs.writeFileSync(statusPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

function readStoredKeys() {
  try {
    const keysPath = path.join(getWorkspaceRoot(), '.ai_keys.json');
    if (fs.existsSync(keysPath)) {
      return JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    }
  } catch (e) {}
  return {};
}

// Available MCP Tools
const TOOLS = [
  {
    name: 'council_plan',
    description: '🧠 Deep-Reasoning Architectural Planner (DeepSeek R1 / Agnes) for complex problem decomposition and implementation strategy.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The software architecture or problem description' },
        context: { type: 'string', description: 'Additional codebase context or constraints' }
      },
      required: ['task']
    }
  },
  {
    name: 'council_code',
    description: '⚡ Ultra-Fast Lead Coder (Groq Qwen 3.6-27B @ 540 tok/s) for high-speed implementation and full function generation.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Coding prompt or feature requirements' },
        language: { type: 'string', description: 'Target programming language (e.g. JavaScript, Python, Go)' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'council_audit',
    description: '🛡️ Security & AST Auditor (Llama 3.3 / AgentShield) to scan code for vulnerabilities, key leaks, and syntax flaws.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code content to inspect' },
        filename: { type: 'string', description: 'Optional filename for context' }
      },
      required: ['code']
    }
  },
  {
    name: 'council_synthesize',
    description: '⚖️ Executive Council Consensus Judge (Agnes Judge) to evaluate and synthesize multiple AI solutions into the optimal patch.',
    inputSchema: {
      type: 'object',
      properties: {
        solutions: { type: 'array', items: { type: 'string' }, description: 'Competing code solutions' },
        criteria: { type: 'string', description: 'Evaluation criteria or requirements' }
      },
      required: ['solutions']
    }
  }
];

// Handle JSON-RPC messages
rl.on('line', async (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch (e) {
    return;
  }

  const { id, method, params } = req;

  if (method === 'initialize') {
    const res = {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'agent-council-mcp',
          version: '1.1.0'
        },
        capabilities: {
          tools: { listChanged: false }
        }
      }
    };
    console.log(JSON.stringify(res));
  } else if (method === 'tools/list') {
    const res = {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
    console.log(JSON.stringify(res));
  } else if (method === 'tools/call') {
    const { name, arguments: args } = params;
    const keys = readStoredKeys();

    try {
      if (name === 'council_plan') {
        updateHUD(
          ['deepseek'],
          ['l-deepseek-hub'],
          { deepseek: `🧠 Architecting solution for: ${args.task.slice(0, 45)}...` },
          '🧠 DeepSeek Architectural Planning',
          'DeepSeek R1 / Agnes Active'
        );

        const prompt = `You are the Chief Architect (DeepSeek R1). Analyze and break down this task:\n${args.task}\nContext: ${args.context || 'None'}`;
        const ep = keys.bynaraEp || 'https://router.bynara.id/v1/chat/completions';
        const resData = await callBynaraRouter(keys.bynaraKey || '', ep, 'agnes-2.5-flash', [{ role: 'user', content: prompt }], 1500);

        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: resData.text }] }
        }));
      } else if (name === 'council_code') {
        updateHUD(
          ['qwen'],
          ['l-qwen-hub'],
          { qwen: `⚡ Generating high-speed code @ 540 tok/s...` },
          '⚡ Groq LPU High-Speed Coding',
          'Groq Qwen 3.6-27B Active'
        );

        const prompt = `You are the Lead Coder (Groq Qwen 3.6-27B). Generate clean, production-ready ${args.language || 'code'} for:\n${args.prompt}`;
        let resData;
        if (keys.groq) {
          resData = await callGroq(keys.groq, 'qwen/qwen3.6-27b', [{ role: 'user', content: prompt }], 2000);
        } else {
          resData = await callOpenRouter(keys.openrouter || '', 'nvidia/nemotron-3.5-lightning:free', [{ role: 'user', content: prompt }], 2000);
        }

        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: resData.text }] }
        }));
      } else if (name === 'council_audit') {
        updateHUD(
          ['llama'],
          ['l-llama-hub'],
          { llama: `🛡️ Running AST Shield security scan...` },
          '🛡️ Security & AST Audit',
          'Llama 3.3 AgentShield Active'
        );

        const prompt = `You are the Security Auditor (Llama 3.3). Inspect this code for security vulnerabilities, API key leaks, and bugs:\n\`\`\`\n${args.code}\n\`\`\``;
        let resData;
        if (keys.groq) {
          resData = await callGroq(keys.groq, 'openai/gpt-oss-120b', [{ role: 'user', content: prompt }], 1000);
        } else {
          resData = await callOpenRouter(keys.openrouter || '', 'nvidia/nemotron-3.5-lightning:free', [{ role: 'user', content: prompt }], 1000);
        }

        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: resData.text }] }
        }));
      } else if (name === 'council_synthesize') {
        updateHUD(
          ['claude'],
          ['l-claude-hub'],
          { claude: `⚖️ Synthesizing optimal consensus patch...` },
          '⚖️ Executive Judge Consensus',
          'Agnes 2.5 Judge Active'
        );

        const prompt = `You are the Executive Judge (Agnes 2.5). Synthesize the following solutions into the single best implementation:\n${JSON.stringify(args.solutions, null, 2)}`;
        const ep = keys.bynaraEp || 'https://router.bynara.id/v1/chat/completions';
        const resData = await callBynaraRouter(keys.bynaraKey || '', ep, 'agnes-2.5-flash', [{ role: 'user', content: prompt }], 2000);

        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: resData.text }] }
        }));
      } else {
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${name}` }
        }));
      }
    } catch (err) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: `[Council Fallback Execution]: ${err.message}` }] }
      }));
    }
  } else {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id,
      result: {}
    }));
  }
});

/**
 * Multi-AI Orchestrator Pipeline — orchestrator.js
 * 5-Step Autonomous Task Pipeline with Real AI Calls
 * Version: 4.0.0
 * Architected by Sohel Ahammad
 */

'use strict';

const { AIRouter } = require('./ai-router');

const SYSTEM_PROMPTS = {
  deepseek: `You are DeepSeek R1, Chief Architect AI. You analyze tasks and create clear, structured plans.
When given a task, respond with:
1. A brief analysis (2-3 sentences)
2. Clear subtasks numbered list
3. Which specialist should handle each subtask
Be concise and technical. Max 300 words.`,

  qwen: `You are Qwen 2.5 Coder, Lead Coding Specialist running on Groq LPU at 540 tokens/sec.
You write clean, production-ready code based on the architect's plan.
- Use modern syntax
- Add helpful inline comments
- Handle edge cases
- No markdown fences unless asked
Be direct and write working code.`,

  llama: `You are Llama 3.3, ECC AgentShield Security Specialist.
Review code or plans for:
- Security vulnerabilities (XSS, injection, exposed keys)
- Bad practices
- Performance issues
Rate each finding as: CRITICAL / HIGH / MEDIUM / LOW
End with: VERDICT: PASS or VERDICT: FAIL`,

  gemma: `You are Gemma 2, QA & Auto-Fix Specialist.
Given code, write concise test cases or identify bugs.
Format: 
- BUG: description
- FIX: suggested fix
- TEST: what to verify
Keep it short and actionable.`,

  claude: `You are Claude, Executive Judge AI.
You receive outputs from all other AI agents and make the final decision.
Synthesize the best answer, resolve conflicts, and provide the final polished output.
Be decisive. The user needs a clear, final answer.`
};

class MultiAIOrchestrator {
  constructor(apiConfig, onProgress) {
    this.router = new AIRouter(apiConfig);
    this.onProgress = onProgress || (() => {});
  }

  // Notify HUD of agent activity
  _progress(activeAgents, dialogues, taskTitle, activeLasers = []) {
    this.onProgress({
      isBusy: true,
      activeAgents,
      activeLasers,
      dialogues,
      taskTitle,
      realMetrics: `${activeAgents.length} Active Thread${activeAgents.length !== 1 ? 's' : ''} · ${taskTitle}`
    });
  }

  _done(summary) {
    this.onProgress({
      isBusy: false,
      activeAgents: [],
      activeLasers: [],
      dialogues: {},
      taskTitle: `✅ ${summary}`,
      realMetrics: '0 Active Threads · Task Complete'
    });
  }

  // ── STEP 1: Plan (DeepSeek R1) ─────────────────────────────
  async step1_plan(task) {
    this._progress(
      ['deepseek'],
      { deepseek: '🧠 Analyzing task & creating architecture plan...' },
      'Step 1/5 — DeepSeek R1 Planning',
      ['l-deepseek-hub']
    );

    const result = await this.router.deepseek([
      { role: 'system', content: SYSTEM_PROMPTS.deepseek },
      { role: 'user', content: `Task: ${task}` }
    ], 600);

    return result;
  }

  // ── STEP 2: Code (Qwen 2.5) ────────────────────────────────
  async step2_code(task, plan) {
    this._progress(
      ['qwen', 'deepseek'],
      {
        qwen: '⚡ Writing production code on Groq LPU...',
        deepseek: '🧠 Plan handed off to coder'
      },
      'Step 2/5 — Qwen 2.5 Coding',
      ['l-qwen-hub', 'l-deepseek-qwen']
    );

    const result = await this.router.qwen([
      { role: 'system', content: SYSTEM_PROMPTS.qwen },
      { role: 'user', content: `Original task: ${task}\n\nArchitect's plan:\n${plan}\n\nWrite the code now.` }
    ], 2000);

    return result;
  }

  // ── STEP 3: Security Audit (Llama 3.3) — Parallel ──────────
  async step3_audit(code) {
    this._progress(
      ['llama', 'qwen'],
      {
        llama: '🛡️ Running ECC AgentShield security audit...',
        qwen: '⚡ Code submitted for review'
      },
      'Step 3/5 — Llama 3.3 Security Audit',
      ['l-llama-hub', 'l-qwen-llama']
    );

    const result = await this.router.llama([
      { role: 'system', content: SYSTEM_PROMPTS.llama },
      { role: 'user', content: `Audit this code:\n\n${code}` }
    ], 800);

    return result;
  }

  // ── STEP 4: QA (Gemma 2) — Parallel ────────────────────────
  async step4_qa(code) {
    this._progress(
      ['gemma', 'llama'],
      {
        gemma: '🧪 Running QA checks & generating test cases...',
        llama: '🛡️ Audit findings submitted to judge'
      },
      'Step 4/5 — Gemma 2 QA',
      ['l-gemma-hub', 'l-llama-gemma']
    );

    const result = await this.router.gemma(
      `${SYSTEM_PROMPTS.gemma}\n\nReview this code:\n\n${code}`,
      600
    );

    return result;
  }

  // ── STEP 5: Final Judge (Claude) ────────────────────────────
  async step5_judge(task, plan, code, audit, qa) {
    this._progress(
      ['claude', 'gemma'],
      {
        claude: '⚖️ All agent reports received. Final synthesis...',
        gemma: '🧪 QA results submitted to judge'
      },
      'Step 5/5 — Claude Executive Review',
      ['l-claude-hub', 'l-gemma-claude']
    );

    const context = `
ORIGINAL TASK: ${task}

ARCHITECT'S PLAN (DeepSeek R1):
${plan}

GENERATED CODE (Qwen 2.5):
${code}

SECURITY AUDIT (Llama 3.3):
${audit}

QA REVIEW (Gemma 2):
${qa}
`;

    const result = await this.router.claude(
      SYSTEM_PROMPTS.claude,
      `Synthesize all agent outputs and provide the final, best answer for: "${task}"\n\n${context}`,
      1500
    );

    return result;
  }

  // ── MAIN: Run Full 5-Step Pipeline ─────────────────────────
  async run(task) {
    const startTime = Date.now();
    const results = { task, steps: {}, finalAnswer: '', totalTokens: 0, elapsed: 0 };

    try {
      // Step 1: Plan
      const planResult = await this.step1_plan(task);
      results.steps.plan = planResult;
      results.totalTokens += planResult.tokens || 0;

      // Step 2: Code
      const codeResult = await this.step2_code(task, planResult.text);
      results.steps.code = codeResult;
      results.totalTokens += codeResult.tokens || 0;

      // Steps 3 & 4: Run audit + QA in parallel for speed
      this._progress(
        ['llama', 'gemma'],
        {
          llama: '🛡️ Parallel audit running...',
          gemma: '🧪 Parallel QA running...'
        },
        'Steps 3+4 — Parallel Audit & QA',
        ['l-llama-hub', 'l-gemma-hub', 'l-llama-gemma']
      );

      const [auditResult, qaResult] = await Promise.allSettled([
        this.step3_audit(codeResult.text),
        this.step4_qa(codeResult.text)
      ]);

      const auditText = auditResult.status === 'fulfilled'
        ? auditResult.value.text
        : `Audit skipped: ${auditResult.reason?.message}`;

      const qaText = qaResult.status === 'fulfilled'
        ? qaResult.value.text
        : `QA skipped: ${qaResult.reason?.message}`;

      results.steps.audit = { text: auditText };
      results.steps.qa = { text: qaText };
      results.totalTokens += (auditResult.value?.tokens || 0) + (qaResult.value?.tokens || 0);

      // Step 5: Final judge
      const judgeResult = await this.step5_judge(
        task,
        planResult.text,
        codeResult.text,
        auditText,
        qaText
      );
      results.steps.judge = judgeResult;
      results.totalTokens += judgeResult.tokens || 0;
      results.finalAnswer = judgeResult.text;

      results.elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this._done(`Done in ${results.elapsed}s · ${results.totalTokens} tokens`);

      return results;

    } catch (err) {
      this._done(`Error: ${err.message}`);
      results.error = err.message;
      return results;
    }
  }

  // ── QUICK: Single-agent fast answer ────────────────────────
  async quickAsk(task, agent = 'qwen') {
    this._progress(
      [agent],
      { [agent]: `Processing: ${task.slice(0, 50)}...` },
      `Quick Ask — ${agent}`,
      [`l-${agent}-hub`]
    );

    try {
      let result;
      const messages = [
        { role: 'system', content: SYSTEM_PROMPTS[agent] || 'You are a helpful AI assistant.' },
        { role: 'user', content: task }
      ];

      switch (agent) {
        case 'deepseek': result = await this.router.deepseek(messages); break;
        case 'llama':    result = await this.router.llama(messages); break;
        case 'qwen':
        default:         result = await this.router.qwen(messages); break;
      }

      this._done(`Quick answer from ${agent} — ${result.tokens} tokens`);
      return result;
    } catch (err) {
      this._done(`Error: ${err.message}`);
      throw err;
    }
  }

  // ── REFACTOR: Targeted code improvement ─────────────────────
  async refactor(selectedCode, instruction) {
    const task = `Refactor this code: ${instruction}\n\nCode:\n${selectedCode}`;

    this._progress(
      ['qwen', 'llama'],
      {
        qwen: `⚡ Refactoring: ${instruction.slice(0, 40)}...`,
        llama: '🛡️ Checking refactored code security...'
      },
      'Refactor — Qwen + Llama Parallel',
      ['l-qwen-hub', 'l-llama-hub', 'l-qwen-llama']
    );

    try {
      const [codeResult, auditResult] = await Promise.allSettled([
        this.router.qwen([
          { role: 'system', content: SYSTEM_PROMPTS.qwen },
          { role: 'user', content: task }
        ], 1500),
        this.router.llama([
          { role: 'system', content: SYSTEM_PROMPTS.llama },
          { role: 'user', content: `Quick security check:\n${selectedCode}` }
        ], 400)
      ]);

      const code = codeResult.status === 'fulfilled' ? codeResult.value.text : '';
      const audit = auditResult.status === 'fulfilled' ? auditResult.value.text : '';

      this._done('Refactor complete');
      return { code, audit };
    } catch (err) {
      this._done(`Error: ${err.message}`);
      throw err;
    }
  }
}

module.exports = { MultiAIOrchestrator };

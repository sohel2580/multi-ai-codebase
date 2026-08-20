/**
 * AgentCouncil - AI Company Squad Allocator
 * Maps discovered models to 6 specialized software company roles based on capability
 */

function allocateCompanySquad(allDiscoveredModels) {
  const squad = {
    architect: { role: '🧠 Chief Architect & Planner', model: 'deepseek/deepseek-r1', provider: 'openrouter', speed: 'Deep-Reasoning' },
    leadCoder: { role: '⚡ Lead Coder', model: 'qwen/qwen3.6-27b', provider: 'groq', speed: '540 tok/s' },
    security: { role: '🛡️ Security & AST Guardian', model: 'openai/gpt-oss-120b', provider: 'groq', speed: 'AST AgentShield' },
    qaTester: { role: '🧪 QA & Integration Tester', model: 'nvidia/nemotron-3.5-lightning:free', provider: 'openrouter', speed: 'Auto-Tests' },
    refactor: { role: '💻 Clean Refactor Agent', model: 'cohere/north-mini-code:free', provider: 'openrouter', speed: 'Clean Code' },
    judge: { role: '⚖️ Executive Consensus Judge', model: 'agnes-2.5-flash', provider: 'bynara', speed: 'Consensus Synthesis' }
  };

  if (!Array.isArray(allDiscoveredModels) || allDiscoveredModels.length === 0) {
    return squad;
  }

  // Smart heuristic match for available models
  for (const m of allDiscoveredModels) {
    const id = m.id.toLowerCase();
    if (id.includes('r1') || id.includes('reasoner')) {
      squad.architect.model = m.id;
    } else if (id.includes('qwen') && (id.includes('coder') || id.includes('27b') || id.includes('72b'))) {
      squad.leadCoder.model = m.id;
    } else if (id.includes('llama-3.3') || id.includes('gpt-oss') || id.includes('guard')) {
      squad.security.model = m.id;
    } else if (id.includes('nemotron') || id.includes('gemma') || id.includes('mini')) {
      squad.qaTester.model = m.id;
    } else if (id.includes('cohere') || id.includes('command-r')) {
      squad.refactor.model = m.id;
    }
  }

  return squad;
}

module.exports = { allocateCompanySquad };

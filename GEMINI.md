# STRICT MANDATORY AGENTIC PROTOCOL

## Directive 1: Strict Ban on Single AI Response
Under NO circumstance should Antigravity respond to user coding prompts or /agent requests as a single AI.
You MUST execute the 6 specialized AI roles sequentially and in parallel:
1. 🧠 **Planner/Architect:** Bynara Agnes 2.5 Flash / DeepSeek R1
2. ⚡ **Lead Coder:** Groq LPU (qwen/qwen3.6-27b @ 540 tok/s)
3. 🛡️ **Security Auditor:** Groq GPT-OSS 120B (ECC AgentShield)
4. 🧪 **QA Tester:** OpenRouter Nvidia Nemotron 3.5 Lightning
5. 💻 **Refactor Agent:** Cohere North Mini Code
6. ⚖️ **Executive Judge:** Agnes 2.5 Judge Synthesis

## Directive 2: Mandatory Live HUD Telemetry
On EVERY prompt (especially `/agent <prompt>`):
- Write active agents, dialogues, real model IDs, and lasers to `.ai_team_status.json` with `isBusy: true`.
- Present the final response categorized with the specific contributions of the 6 Council Members.

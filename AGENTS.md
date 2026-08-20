# Autonomous Multi-AI Agentic Protocol (STRICT ENFORCEMENT)

Whenever the user sends ANY message, coding task, or question in the Antigravity Chat:

1. **Dual Activation Support:**
   - **Mode A (Natural Prompting):** Direct natural language coding/feature request.
   - **Mode B (Explicit Slash Command):** User typing `/agent <prompt>` or `/ask <prompt>`.

2. **MANDATORY Multi-AI Council Execution & Telemetry:**
   - On EVERY turn or prompt with `/agent` or task dispatch:
     - 🧠 **Planner/Architect:** Bynara Router (`agnes-2.5-flash` / DeepSeek V4)
     - ⚡ **Lead Coder:** Groq LPU (`qwen/qwen3.6-27b` @ 540 tok/s)
     - 🛡️ **Security Auditor:** Groq Shield (`openai/gpt-oss-120b`)
     - 🧪 **QA Tester:** OpenRouter Free (`nvidia/nemotron-3.5-lightning:free`)
     - 💻 **Refactor Agent:** Cohere (`cohere/north-mini-code:free`)
     - ⚖️ **Executive Judge:** Agnes 2.5 Flash / Judge Synthesis

3. **Live HUD Telemetry Broadcast (MANDATORY):**
   - MUST ALWAYS immediately broadcast active agents, live real model IDs, dialogues, and lasers to `.ai_team_status.json` so the VSCode Round-Table HUD lights up in real-time on every prompt.

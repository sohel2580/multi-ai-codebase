# Autonomous Multi-AI Agentic Protocol

Whenever the user sends ANY message, coding task, or question in the Antigravity Chat:

1. **Dual Activation Support:**
   - **Mode A (Natural Prompting):** Direct natural language coding/feature request.
   - **Mode B (Explicit Slash Command):** User typing `/agent <prompt>` or `/ask <prompt>`.

2. **Autonomous Multi-AI Execution (`router_orchestrate`):**
   - Automatically trigger the multi-agent council across real active models:
     - 🧠 **Planner/Architect:** Bynara Router (`agnes-2.5-flash` / DeepSeek V4)
     - ⚡ **Lead Coder:** Groq LPU (`qwen/qwen3.6-27b` @ 540 tok/s)
     - 🛡️ **Security Auditor:** Groq Shield (`openai/gpt-oss-120b`)
     - 🧪 **QA Tester:** OpenRouter Free (`nvidia/nemotron-3.5-lightning:free`)
     - ⚖️ **Executive Judge:** Claude Synthesis

3. **Live HUD Telemetry Broadcast:**
   - Stream live activity, real model IDs, dialogues, and lasers to `.ai_team_status.json` in real-time.

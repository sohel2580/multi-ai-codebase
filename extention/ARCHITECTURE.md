# Architecture Document
# AgentCouncil — Agent Router & Gateway Flow
**Version:** 4.7.0  
**Author:** Sohel Ahammad

---

## Autonomous Agent Router Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     VSCode Extension Host                    │
│                                                              │
│  [User Task] ──▶ [MultiAIOrchestrator] ──▶ [AIRouter]        │
│                                                   │          │
│               ┌───────────────────────────────────┼──────┐   │
│               │ Free Agentic Routing Chain        │      │   │
│               ▼                                   ▼      │   │
│       ┌───────────────┐                  ┌────────────┐  │   │
│       │ Groq Free LPU │                  │ Bynara Hub │  │   │
│       │ (Qwen+Llama)  │                  │ (DeepSeek) │  │   │
│       └───────┬───────┘                  └─────┬──────┘  │   │
│               │                                │         │   │
│               ▼                                ▼         │   │
│       ┌───────────────┐                  ┌────────────┐  │   │
│       │  OpenRouter   │                  │Agent Router│  │   │
│       │  (Free Tier)  │                  │Token Hub   │  │   │
│       └───────────────┘                  └────────────┘  │   │
└──────────────────────────────────────────────────────────────┘
```

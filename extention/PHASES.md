# Development Phases
# AgentCouncil — VSCode Extension
**Version:** 4.0.0  
**Author:** Sohel Ahammad

---

## Phase 1 — Prototype ✅ COMPLETE
**Goal:** Proof of concept — can we show a Round-Table in VSCode?

| Task | Status |
|---|---|
| Webview panel with circular agent layout | ✅ Done |
| SVG laser beams between agents | ✅ Done |
| `.ai_team_status.json` telemetry bridge | ✅ Done |
| Sidebar activity bar icon | ✅ Done |
| Basic ECC AgentShield (regex scans) | ✅ Done |
| First VSIX build | ✅ Done |

**Outcome:** Visual HUD working, but simulation only.

---

## Phase 2 — Production Bug Fixes ✅ COMPLETE
**Goal:** Fix all critical bugs before real AI integration.

| Fix | Root Cause | Solution |
|---|---|---|
| FIX-1: Regex `/g` lastIndex drift | Stateful regex shared across calls | Factory method recreates pattern each call |
| FIX-2: SVG laser race condition | Coordinates calculated before DOM painted | Double `requestAnimationFrame` |
| FIX-3: Memory leak on dispose | `fs.watchFile` never stopped | Guaranteed `fsWatcher.close()` + `clearInterval` in `onDidDispose` |
| FIX-4: Status file crash | `JSON.parse` threw on corrupt file | Full error boundary, safe default fallback |
| FIX-5: Stale "busy" state | Agent marked busy but update never came | 30-second auto-reset guard timer |
| UPG-1: Multi-root workspace | First folder only checked | Iterate all `workspaceFolders` |
| UPG-2: CSP security | `unsafe-eval` in CSP | nonce-based `script-src` |

**Outcome:** Stable, crash-free HUD. `v3.0.0.vsix` shipped.

---

## Phase 3 — Real Agentic Engine ✅ COMPLETE
**Goal:** Replace simulation with real HTTP AI calls.

| Task | Status |
|---|---|
| `ai-router.js` — 5-provider HTTP caller | ✅ Done |
| `orchestrator.js` — 5-step pipeline | ✅ Done |
| VSCode Settings schema for API keys | ✅ Done |
| Smart fallback routing (primary → secondary) | ✅ Done |
| Parallel execution (Llama + Gemma simultaneously) | ✅ Done |
| All 6 commands registered | ✅ Done |
| Right-click context menu | ✅ Done |
| 3 keyboard shortcuts | ✅ Done |
| Guided API key setup wizard | ✅ Done |
| Result displayed in editor tab (Markdown) | ✅ Done |
| Theme-adaptive sidebar (dark + light) | ✅ Done |
| `ai-router.js` added to VSIX package | ✅ Done (critical bug fix) |

**Outcome:** `v1.0.0.vsix` — real agentic production release.

---

## Phase 4 — Marketplace Launch 🔜 NEXT
**Goal:** Publish to VSCode Marketplace.

| Task | Status |
|---|---|
| Write detailed README with GIF demo | ⬜ Pending |
| Record extension demo video | ⬜ Pending |
| Create vsce publisher account | ⬜ Pending |
| `vsce publish` to Marketplace | ⬜ Pending |
| Setup GitHub Actions auto-publish on tag | ⬜ Pending |
| Add Telemetry (opt-in) | ⬜ Pending |
| Marketplace listing SEO optimization | ⬜ Pending |

---

## Phase 5 — v5.0.0 Advanced Features 🔮 FUTURE
**Goal:** Power-user features.

| Feature | Description |
|---|---|
| Streaming responses | Real-time token streaming in HUD bubbles |
| Conversation history | Multi-turn context across sessions |
| Agent memory | `.ecc_memory.json` per-project learning |
| Custom agent roles | User-defined system prompts per agent |
| Model selector | User picks model per agent slot |
| Cost estimator | Show estimated token cost before running |
| Team mode | Multiple developers share one HUD |
| Webhook integration | POST results to Slack / Discord |

---

## Version History

| Version | Date | Summary |
|---|---|---|
| 1.0.0 | 2026-08-19 | Initial prototype |
| 2.0.0 | 2026-08-19 | Round-Table HUD + heartbeat sync |
| 3.0.0 | 2026-08-19 | Production bug fixes (5 critical) |
| 4.0.0 | 2026-08-20 | Real agentic engine + theme adaptive |

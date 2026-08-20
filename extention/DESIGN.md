# Design Document
# AgentCouncil — VSCode Extension
**Version:** 4.0.0  
**Author:** Sohel Ahammad

---

## 1. Design Principles

| Principle | Application |
|---|---|
| **Theme Agnostic** | All colors use `var(--vscode-*)` tokens — zero hardcoded hex values in UI |
| **Live & Breathing** | HUD must always feel alive: pulsing borders, animated lasers, real-time clock |
| **Transparent Status** | Every AI action must be visible — no black-box processing |
| **Zero Clutter** | Only the Round-Table circle — no panels below, no unnecessary chrome |
| **Instant Feedback** | Progress notifications in VSCode notification tray for all long operations |

---

## 2. Color System

### Round-Table HUD (always dark — cinematic feel)
```
Background:    #060c1a  (deep navy — space feel)
Card:          #0b1424
Border:        rgba(255,255,255,0.09)
Blue accent:   #3b82f6 / #60a5fa
Green active:  #34d399
Purple accent: #c084fc
Text primary:  #f1f5f9
Text muted:    #64748b
```

### Sidebar (theme-adaptive)
```css
/* All via VSCode CSS variables — auto dark/light */
--bg:      var(--vscode-sideBar-background)
--fg:      var(--vscode-sideBar-foreground)
--btn-bg:  var(--vscode-button-background)
--btn-fg:  var(--vscode-button-foreground)
--badge:   var(--vscode-badge-background)
--muted:   var(--vscode-descriptionForeground)
```

---

## 3. Round-Table HUD Layout

```
┌─────────────────────────────────────────────────┐
│ 🏢 AgentCouncil — Multi-AI Parallel Council  v4.0  [LIVE] 23:45│  ← Topbar
├─────────────────────────────────────────────────┤
│                                                   │
│        🧠 DeepSeek R1                            │
│              ╲                                   │
│  📈 SEO  ────── ⚡ CORE ────── ⚡ Qwen 2.5      │  ← Stage
│              ╱              ╲                    │
│  ⚖️ Claude ────────────── 🛡️ Llama              │
│                    ╲                             │
│                 🧪 Gemma 2                       │
│                                                   │
├─────────────────────────────────────────────────┤
│ ► LIVE  Step 3/5 — Llama 3.3 Security Audit...  │  ← Ticker
└─────────────────────────────────────────────────┘
```

### Agent Positioning
- 6 agents placed on an **ellipse** using trigonometry
- `rx = min(W*0.40, H*0.42)` — adapts to any window size
- Positions recalculated on `window.resize`
- SVG viewBox matches stage pixel dimensions exactly

### Laser States
```css
.l-idle   { stroke: rgba(255,255,255,.04); stroke-width: 1.5 }
.l-active { stroke: #34d399; stroke-dasharray: 10 5; animation: dash }
.l-active-blue { stroke: #3b82f6; stroke-dasharray: 6 6 }
```

---

## 4. Agent Visual States

| State | CSS Class | Border | Scale | Badge |
|---|---|---|---|---|
| Standby | (none) | `rgba(255,255,255,.09)` | 1.0x | "Standby" |
| Speaking (primary) | `.speaking` | `#3b82f6` + glow | 1.1x | "⚡ Active" |
| Working (parallel) | `.working` | `#34d399` + glow | 1.06x | "🔄 Parallel" |

### Core Hub States
| State | Border | Ring Animation | Glow |
|---|---|---|---|
| Standby | `rgba(59,130,246,.35)` | None | `0 0 36px rgba(59,130,246,.2)` |
| Busy | `#34d399` | Spinning dashed ring (9s) | `0 0 55px rgba(52,211,153,.38)` |

---

## 5. Typography

```css
/* HUD */
Title:  font-size: 1.05rem; font-weight: 800; gradient text
Labels: font-size: 0.8rem; font-weight: 800
Muted:  font-size: 0.7rem; color: #64748b
Ticker: font-size: 0.72rem

/* Sidebar */
Body font: var(--vscode-font-family)  /* inherits editor font */
Size:      var(--vscode-font-size)     /* inherits editor size */
```

---

## 6. Animation Spec

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Laser dash | 0.55s | `linear` | `l-active` class |
| Core ring spin | 9s | `linear` | `isBusy = true` |
| Agent scale up | 0.35s | `cubic-bezier(.34,1.56,.64,1)` | agent becomes active |
| Bubble fade-up | 0.22s | `ease` | dialogue text arrives |
| Dot blink | 1.5s | `ease-in-out` | always (topbar) |

---

## 7. Result Output Design

Results appear in a **new editor tab** as Markdown with sections:

```markdown
# 🤖 Multi-AI Council Result
**Task:** [user task]
**Time:** 12.3s · **Tokens:** 4,820

---
## ⚖️ Final Answer (Claude Executive Judge)
[synthesized best answer]

---
## 🧠 DeepSeek R1 — Architecture Plan
## ⚡ Qwen 2.5 — Generated Code
## 🛡️ Llama 3.3 — Security Audit
## 🧪 Gemma 2 — QA Review
```

---

## 8. Notification Design

| Event | Notification Type | Content |
|---|---|---|
| No API keys | Warning message | "⚠️ Add API keys" + "Open Settings" button |
| Pipeline running | Progress notification | "⚡ Multi-AI Council working... Step N/5" |
| Pipeline done | Info message | "✅ Done in 12s · 4,820 tokens used" |
| Error | Error message | "Multi-AI Error: [message]" |
| Refactor applied | Info or Warning | "✅ Refactor applied!" or security note |
| ECC scan result | Info or Warning | "🛡️ Code is secure!" or "⚠️ ECC: [findings]" |

# Changelog

All notable changes to "Multi-AI Orchestrator" are documented here.

## [3.0.0] - 2026-08-19 — Production Release

### Fixed
- **[FIX-1]** Regex `/g` flag `lastIndex` drift bug in `ECCAgentShield` — patterns now recreated each call
- **[FIX-2]** SVG laser coordinate race condition — double `requestAnimationFrame` ensures DOM is fully painted before calculation
- **[FIX-3]** Memory leak on panel dispose — `fs.watchFile`, `fs.watch`, and `setInterval` all guaranteed cleaned up
- **[FIX-4]** Corrupt or missing `.ai_team_status.json` no longer crashes the HUD — full error boundary with safe default
- **[FIX-5]** Stale status auto-reset — if `isBusy` remains true for >30s with no update, HUD auto-resets to Standby

### Added
- **[UPG-1]** Multi-root workspace support — status file searched across all workspace folders
- **[UPG-2]** CSP tightened — `unsafe-eval` removed, nonce-based inline script policy
- **[UPG-3]** Keyboard shortcut `Ctrl+Alt+M` (Mac: `Cmd+Alt+M`) to open Round-Table HUD
- Right-click context menu: "Run AgentShield Security Scan"
- Additional ECC scan patterns: Slack tokens, AWS access keys, `document.write`, `innerHTML` XSS
- Live clock in HUD top bar (updated every second)
- `.vscodeignore` to exclude dev files from packaged VSIX
- Marketplace metadata: `galleryBanner`, `keywords`, `repository`, `bugs`, `homepage`

### Changed
- SVG viewBox now matches stage pixel dimensions for 1:1 coordinate accuracy
- Agent nodes use elliptical layout that adapts to any window aspect ratio
- Sidebar shows keyboard shortcut hint

## [2.1.0] - 2026-08-19

### Fixed
- SVG laser positions calculated by JavaScript from real DOM positions
- Window resize triggers agent re-layout

### Changed
- Pure Round-Table only — no extra panels below
- Bottom ticker bar added

## [2.0.5] - 2026-08-19

### Added
- Unbreakable 300ms heartbeat sync engine
- Live clock telemetry in HUD

## [1.0.0] - 2026-08-19 — Initial Release

### Added
- Multi-AI Parallel Autonomous Council webview
- DeepSeek R1, Qwen 2.5, Llama 3.3, Gemma 2, Claude Opus, SEO Specialist agents
- ECC AgentShield security scanner
- `.ai_team_status.json` live telemetry bridge
- Sidebar activity bar with "Open HUD" button

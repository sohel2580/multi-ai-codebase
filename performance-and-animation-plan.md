# Performance and Animation Plan

## Audit Scope and Assumptions

This site is a lightweight PHP portfolio served from `index.php` with shared `header.php`, `footer.php`, page partials in `pages/`, static CSS in `assets/css/styles.css`, JavaScript in `assets/js/main.js`, JSON data files, and images in `images/` and `uploads/`. No package manifest, framework build pipeline, local PHP binary, Node.js, npm, Lighthouse CLI, ImageMagick, cwebp, or ffmpeg were available in the local command environment, so exact Lighthouse and browser waterfall measurements could not be collected locally. The audit therefore uses code inspection, asset-size inspection, PHP/static file checks, and available Windows/.NET image metadata as proxy evidence.

## Baseline Evidence

- CSS payload: `assets/css/styles.css` is 54,362 bytes and 2,483 measured lines.
- JavaScript payload: `assets/js/main.js` is 24,604 bytes and 724 measured lines.
- Main PHP shell: `index.php` is 7,247 bytes.
- Largest image assets: `images/profile.jpg` is 1,196,529 bytes at 1024x1024, `uploads/sohel4.webp` is 824,504 bytes, `uploads/sohel9.webp` is 561,304 bytes, and `uploads/sohel7.webp` is 458,718 bytes.
- Runtime validation blockers: `php` is not installed or not on PATH; Lighthouse, Node.js/npm, ImageMagick, cwebp, and ffmpeg were not available from `where` checks.
- The CSS file imports Google Fonts with `@import`, delaying CSS/font discovery.
- `index.php` appends `?v=<?= time() ?>` to CSS on every request, defeating browser and CDN caching.
- `index.php` sets `Cache-Control: public, max-age=60`, limiting HTML cache freshness to 60 seconds.
- `assets/js/main.js` starts several continuous or high-frequency animation loops: canvas particles, footer SVG path regeneration, cursor spotlight, hero parallax, scroll progress, page curtain, magnetic buttons, typing effects, and timers.
- Several JavaScript animations do not check `prefers-reduced-motion` before starting.
- The preloader delays page reveal by at least 400ms after load and can remain up to 2 seconds, which likely harms perceived LCP.
- Hero/profile image lacks explicit width/height/fetch priority/decoding metadata, increasing CLS and LCP risk.
- Gallery and blog images use lazy loading, but several images lack decoding and intrinsic dimension hints.
- `.htaccess` currently handles clean URLs only; it does not define static asset caching, compression, immutable cache policy, or security headers for referrer/policy.

## Highest-Impact Bottlenecks

| Priority | Bottleneck | Likely Cause | User Impact | Effort | Risk | Confidence |
|---|---|---|---|---|---|---|
| P0 | CSS cache busting on every request | `?v=<?= time() ?>` creates a unique CSS URL | Repeat visits cannot reuse CSS cache; slower render start | Low | Low | High |
| P0 | Oversized profile image | 1.2 MB 1024x1024 JPG displayed around 140px | LCP/network delay on home/contact | Medium | Low | High |
| P0 | Unconditional animation loops | Canvas/SVG/scroll/mouse loops run even when hidden or reduced motion requested | Main-thread and battery drain; jank on low-end devices | Medium | Medium | High |
| P1 | Font loading via CSS `@import` | Font request discovered after CSS download/parse | Slower text rendering and possible FOIT/FOUT | Low | Low | High |
| P1 | Missing long-lived static caching | `.htaccess` lacks expires/cache rules | Repeat page loads redownload assets | Low | Low | Medium |
| P1 | Preloader delay | JS waits before hiding overlay | Worse perceived speed and possible LCP masking | Low | Low | High |
| P2 | Missing image dimensions/decoding | Image markup lacks dimensions in key places | CLS risk and slower decode scheduling | Low | Low | High |
| P2 | Inline scripts per page | Page logic blocks parser and duplicates behavior | Harder to cache and optimize | Medium | Medium | Medium |
| P2 | Heavy hover effects/backdrop filters | Glass/gradient/filter effects across cards/nav | Possible paint/composite cost | Medium | Medium | Medium |

## Step-by-Step Implementation Plan

### 1. Measurement Setup

- Objective: Establish reproducible performance checks.
- Rationale: Baselines prevent regressions and validate improvements.
- Affected files/areas: local CLI, browser devtools, `performance-and-animation-plan.md`.
- Required skills: Chrome DevTools, Lighthouse, PHP hosting diagnostics.
- Tools/libraries/APIs: Lighthouse/PageSpeed Insights, Chrome Performance panel, Network panel, WebPageTest, `php -l`, optional `node` tooling if later installed.
- Implementation steps: record asset sizes; run PHP lint; run Lighthouse mobile/desktop against deployed URL or local PHP server; capture network waterfall, LCP element, CLS records, long tasks, unused CSS/JS, and accessibility checks.
- Validation method: store before/after scores, timings, and waterfall screenshots or exported JSON.
- Expected performance impact: none directly; enables reliable prioritization.
- Rollback considerations: documentation-only; no runtime impact.

### 2. Caching and Delivery Strategy

- Objective: Enable effective repeat-visit caching without stale-code risk.
- Rationale: Static assets should be cached long-term with deterministic versioning.
- Affected files/areas: `index.php`, `.htaccess`.
- Required skills: Apache caching headers, PHP asset versioning.
- Tools/libraries/APIs: `filemtime`, `mod_expires`, `mod_headers`, compression modules.
- Implementation steps: replace `time()` CSS versioning with `filemtime`; add JS versioning; configure `.htaccess` long-lived cache for images/CSS/JS/fonts; keep HTML cache shorter; enable gzip/deflate/brotli where supported.
- Validation method: inspect response headers in DevTools; confirm CSS URL stays stable until file changes.
- Expected performance impact: high for repeat visits; moderate for CDN/browser reuse.
- Rollback considerations: revert `.htaccess` header block and asset URL versioning.

### 3. Font Optimization

- Objective: Improve font discovery and reduce render blocking.
- Rationale: CSS `@import` delays Google Font loading.
- Affected files/areas: `index.php`, `assets/css/styles.css`.
- Required skills: web font loading, fallback stacks.
- Tools/libraries/APIs: `preconnect`, Google Fonts CSS2 with `display=swap`.
- Implementation steps: remove CSS `@import`; add preconnects to Google font origins; add stylesheet link before app CSS or preload strategy; preserve Inter fallback stack.
- Validation method: Network panel shows font CSS discovered from HTML, not from CSS import; Lighthouse font-display audit passes.
- Expected performance impact: moderate render-start improvement.
- Rollback considerations: restore the CSS `@import`.

### 4. Image and Media Optimization

- Objective: Reduce LCP and gallery transfer size while preserving visual quality.
- Rationale: Large source images are displayed at small dimensions.
- Affected files/areas: `images/profile.jpg`, optional derived `images/profile-320.jpg`, `images/logo.png`, `pages/home.php`, `pages/contact.php`, `pages/gallery.php`, `pages/blog.php`, `pages/post.php`.
- Required skills: responsive images, image codecs, intrinsic sizing.
- Tools/libraries/APIs: ImageMagick/cwebp/Squoosh if available; Windows System.Drawing fallback; HTML `srcset`, `sizes`, `loading`, `decoding`, `fetchpriority`, `width`, `height`.
- Implementation steps: generate smaller profile and logo derivatives if tooling permits; use the smaller profile image for avatar contexts; add width/height, `decoding="async"`, `fetchpriority="high"` for likely LCP image; lazy-load below-fold images; keep lightbox full-size behavior.
- Validation method: compare image byte sizes; confirm no broken images; inspect LCP resource.
- Expected performance impact: high on first load if profile image shrinks from 1.2MB to a small derivative.
- Rollback considerations: switch markup back to original images; keep generated files unused or remove after verifying.

### 5. JavaScript Execution Improvements

- Objective: Reduce main-thread work and animation overhead.
- Rationale: Several animation classes run continuously and duplicate scroll/mouse work.
- Affected files/areas: `assets/js/main.js`, page inline scripts.
- Required skills: vanilla JS performance, `requestAnimationFrame`, IntersectionObserver, reduced motion.
- Tools/libraries/APIs: `matchMedia('(prefers-reduced-motion: reduce)')`, Page Visibility API, passive listeners, `requestAnimationFrame` throttling.
- Implementation steps: add a shared motion preference helper; skip particle, footer wave, cursor spotlight, magnetic buttons, parallax, typing, and page curtain for reduced motion; pause animation loops when document is hidden; throttle scroll style writes with RAF; reduce particle count on mobile; avoid forced layout where possible.
- Validation method: Chrome Performance panel shows fewer scripting/rendering tasks; reduced-motion OS setting disables nonessential motion.
- Expected performance impact: high for low-end/mobile smoothness; moderate CPU/battery improvement.
- Rollback considerations: revert JS helper and constructor guards.

### 6. CSS Efficiency and Rendering

- Objective: Preserve visual design while lowering paint/composite cost.
- Rationale: Filters, gradients, and repeated animations can be expensive.
- Affected files/areas: `assets/css/styles.css`.
- Required skills: CSS performance, accessibility, animation design.
- Tools/libraries/APIs: CSS custom properties, `content-visibility`, `contain-intrinsic-size`, `prefers-reduced-motion`.
- Implementation steps: add `content-visibility:auto` to below-fold sections/cards where safe; define focus-visible states; add reduced-motion block disabling nonessential animations/transitions; limit `will-change` usage; keep transform/opacity animations.
- Validation method: DevTools Rendering/Paint profiler; accessibility keyboard check; visual regression spot check.
- Expected performance impact: moderate rendering improvement on long pages.
- Rollback considerations: remove the performance CSS block.

### 7. Code Splitting and Lazy Loading

- Objective: Avoid executing page-specific code on every page where practical.
- Rationale: Current global JS initializes many classes but safely no-ops when DOM elements are absent.
- Affected files/areas: `assets/js/main.js`, page inline scripts.
- Required skills: progressive enhancement, script loading.
- Tools/libraries/APIs: `defer`, dynamic import if introduced later, DOM guards.
- Implementation steps: mark global script `defer`; keep no-op guards; avoid new dependencies; optionally move page inline scripts into deferred modules in a later phase.
- Validation method: no console errors; interactions work on all pages.
- Expected performance impact: low to moderate now; larger if future splitting is added.
- Rollback considerations: restore plain script include.

### 8. Animation Architecture

- Objective: Add polished, professional, accessible motion without harming performance.
- Rationale: Motion should guide attention, not block content or drain CPU.
- Affected files/areas: `assets/css/styles.css`, `assets/js/main.js`, page markup.
- Required skills: motion design, CSS transitions, accessibility.
- Tools/libraries/APIs: CSS `transform`, `opacity`, `prefers-reduced-motion`, IntersectionObserver.
- Implementation steps: use reveal transitions on sections, cards, and lists; retain subtle hover affordances; avoid layout properties; remove or reduce continuously-running decorative animations where not essential; ensure reduced-motion users get instant state changes.
- Validation method: manual reduced-motion check; keyboard navigation; low-end device simulation.
- Expected performance impact: improved perceived quality with controlled CPU cost.
- Rollback considerations: remove animation CSS and JS guards.

### 9. Accessibility Safeguards

- Objective: Ensure performance changes do not reduce accessibility.
- Rationale: Animations and lazy loading can harm keyboard, screen reader, or vestibular users.
- Affected files/areas: nav, buttons, gallery, contact links, CSS focus states.
- Required skills: WCAG basics, semantic HTML.
- Tools/libraries/APIs: keyboard testing, Lighthouse accessibility, `aria-expanded`, `aria-controls`, `aria-hidden` where applicable.
- Implementation steps: add mobile nav ARIA state; ensure buttons have labels; avoid hiding content behind preloader; add focus-visible outlines; honor reduced motion.
- Validation method: keyboard-only navigation; Lighthouse accessibility once available.
- Expected performance impact: indirect; improves user experience and prevents motion issues.
- Rollback considerations: revert accessibility attribute additions only if they conflict.

### 10. Performance Budgets

- Objective: Keep future changes from regressing speed.
- Rationale: Small sites can become slow through accumulated animations/assets.
- Affected files/areas: documentation and future CI.
- Required skills: performance governance.
- Tools/libraries/APIs: Lighthouse CI or PageSpeed Insights later.
- Implementation steps: set budget targets: CSS under 65KB uncompressed, JS under 35KB uncompressed, home initial image transfer under 200KB, no nonessential always-on animation loops for reduced motion, Lighthouse mobile performance target 85+ after hosting validation.
- Validation method: compare build/static asset sizes and Lighthouse reports.
- Expected performance impact: prevents regressions.
- Rollback considerations: adjust budgets if product requirements change.

### 11. Final QA and Post-Implementation Verification

- Objective: Confirm functionality, visual intent, and measurable speed proxies after implementation.
- Rationale: Optimizations must be safe and reversible.
- Affected files/areas: all changed files.
- Required skills: browser QA, PHP checks, accessibility review.
- Tools/libraries/APIs: browser, DevTools, CLI file checks, PHP lint when available.
- Implementation steps: run available commands; verify pages home/skills/gallery/blog/post/contact/admin still load; inspect console; test theme toggle, nav, gallery, contact links, lightbox, reduced motion.
- Validation method: documented command outcomes and manual checklist.
- Expected performance impact: validates improvements.
- Rollback considerations: use file-level revert for affected changes; no destructive git operations.

## Planned Safe Implementation Set

1. Replace timestamp cache busting with deterministic `filemtime` asset versions and defer JavaScript.
2. Add font preconnect and HTML font stylesheet loading; remove CSS `@import`.
3. Add static asset caching and compression rules to `.htaccess`.
4. Add image dimensions, decoding hints, priority hints, and better lazy loading/fetchpriority behavior.
5. Generate a smaller profile image derivative with available Windows tooling if possible.
6. Add global reduced-motion CSS and JS gates.
7. Pause decorative `requestAnimationFrame` loops when the document is hidden.
8. Throttle scroll progress/nav/parallax updates with RAF where practical.
9. Add accessible nav state attributes and focus-visible styling.
10. Update this document with completion details and measured/proxy evidence.

## Completion Section

### Implemented Changes

- Replaced per-request CSS cache busting with deterministic `filemtime` versions in `index.php`, and added the same deterministic versioning to `assets/js/main.js`.
- Changed the global JavaScript include to `defer` in `index.php` so parsing can continue before non-critical behavior initializes.
- Removed the Google Fonts CSS `@import` dependency from `assets/css/styles.css`; added HTML font loading and preconnect hints in `index.php` for earlier discovery.
- Added Apache static asset caching, compression, and referrer policy rules to `.htaccess` with immutable one-year caching for versioned static assets.
- Generated `images/profile-320.jpg` as a 320x320 optimized avatar derivative for home/contact contexts.
- Updated `pages/home.php` and `pages/contact.php` to use the smaller profile derivative when available while retaining fallback to the original configured profile image.
- Added intrinsic image dimensions plus `decoding`, `loading`, and `fetchpriority` hints across home, contact, gallery, blog, and post image markup.
- Added focus-visible styling, safer global image sizing, `content-visibility:auto` for page sections, and a comprehensive `prefers-reduced-motion` CSS block in `assets/css/styles.css`.
- Added a shared motion capability object in `assets/js/main.js` and guarded decorative/high-cost effects behind reduced-motion and fine-pointer checks.
- Reduced particle count from 45 to 32 on desktop and 18 on smaller screens, and paused particle, cursor spotlight, and footer wave RAF loops when the tab is hidden.
- Added RAF throttling for scroll progress and hero parallax updates.
- Reduced the preloader delay from 400ms after load / 2s fallback to 120ms after load / 1.2s fallback, and made it instant for reduced-motion users.
- Added `aria-controls` and `aria-expanded` to the mobile navigation toggle in `header.php`, with JavaScript updates when the menu opens/closes.
- Updated home statistics, speech bubble typing, skill ring counts, and timeline animations to respect `prefers-reduced-motion`.

### Files and Areas Changed

- `performance-and-animation-plan.md`: audit, prioritized plan, completion evidence, rollback notes, and follow-up recommendations.
- `.htaccess`: caching, compression, and referrer policy delivery rules.
- `index.php`: deterministic asset versions, font preconnect/stylesheet loading, deferred JavaScript.
- `header.php`: mobile nav ARIA state.
- `assets/css/styles.css`: removed font import, added focus styling, content visibility, reduced-motion safeguards, image defaults.
- `assets/js/main.js`: motion preference gating, RAF throttling, animation loop pausing, preloader timing, nav ARIA updates.
- `pages/home.php`: optimized profile source, image hints, reduced-motion safeguards for counters/typing.
- `pages/contact.php`: optimized avatar source and social/contact image hints.
- `pages/gallery.php`: thumbnail/lightbox image decoding and sizing hints.
- `pages/blog.php`: blog card image decoding and sizing hints.
- `pages/post.php`: post hero image alt text, priority, decoding, and dimensions.
- `pages/skills.php`: reduced-motion safeguards for skill/timeline animations.
- `images/profile-320.jpg`: new optimized profile derivative.

### Before and After Proxy Results

- Original profile image: `images/profile.jpg` was 1,196,529 bytes at 1024x1024.
- Optimized avatar derivative: `images/profile-320.jpg` is 11,031 bytes at 320x320.
- Profile/avatar transfer savings where the derivative is used: 1,185,498 bytes, approximately 99.08% smaller.
- CSS size after changes: `assets/css/styles.css` is 55,126 bytes; the small increase is from accessibility/reduced-motion/performance CSS while removing the blocking font import.
- JS size after changes: `assets/js/main.js` is 26,294 bytes; the small increase adds motion guards and pause/throttle logic to reduce runtime work.
- Deterministic CSS/JS versioning now permits long-lived browser/CDN caching; previous `time()` versioning forced a fresh CSS URL every request.
- Static caching now covers CSS, JS, images, SVG, and WOFF/WOFF2 assets through `.htaccess` when the Apache modules are enabled.

### Validation Commands Run

- `php -v && for %F in (*.php pages\*.php) do @php -l "%F"`: failed because `php` is not installed or not on PATH in the local environment.
- `where lighthouse && where node && where npm`: failed because the local environment does not expose Lighthouse/Node/npm tooling.
- `where magick && where cwebp && where ffmpeg`: failed because image/video optimization CLIs are not installed or not on PATH.
- PowerShell/System.Drawing image inspection: succeeded for `images/` assets and confirmed `images/profile.jpg` is 1024x1024 and `images/profile-320.jpg` is 320x320.
- PowerShell asset size checks: succeeded and documented file sizes before/after available changes.
- Exact conflict marker scan across changed files: succeeded with 0 exact conflict marker lines in changed CSS, JS, PHP, and `.htaccess` files.
- Regex evidence scans confirmed deterministic versioning, deferred JS, image decoding/priority hints, reduced-motion hooks, content visibility, and animation loop guards.
- `git diff --stat`: unavailable because this folder is not a Git repository.

### Known Limitations

- Exact Lighthouse/Core Web Vitals scores were not captured locally because no local PHP runtime, Node/npm, Lighthouse CLI, or browser automation tooling was available.
- Runtime PHP linting could not be completed locally because the `php` command is unavailable.
- Broader image optimization of gallery `uploads/*.webp` was not performed because no WebP encoder or image optimization CLI was available; existing images were preserved to avoid quality/destructive risk.
- Apache caching/compression rules depend on hosting modules such as `mod_expires`, `mod_headers`, `mod_deflate`, or `mod_brotli` being enabled.

### Rollback Notes

- Revert `index.php` asset loading changes to restore previous `time()` cache busting and non-deferred JavaScript behavior.
- Remove or ignore `images/profile-320.jpg` and switch `pages/home.php` / `pages/contact.php` back to the configured profile image if visual quality is not acceptable.
- Remove the new `.htaccess` caching/compression blocks if the host rejects module directives.
- Remove the reduced-motion and content-visibility blocks from `assets/css/styles.css` if an older browser/host-specific issue appears.
- Revert the motion guards in `assets/js/main.js` if any decorative animation is intentionally required for all users.

### Prioritized Follow-Up Recommendations

1. Run Lighthouse mobile/desktop against the deployed site after uploading these changes, capturing Performance, Accessibility, Best Practices, SEO, LCP, CLS, INP/TBT, and waterfall evidence.
2. Install or use an image optimizer to create responsive derivatives for `uploads/sohel4.webp`, `uploads/sohel7.webp`, `uploads/sohel8.webp`, and `uploads/sohel9.webp`, which are still the largest gallery assets.
3. Add a proper local PHP runtime or CI check so `php -l` can validate every PHP file before deployment.
4. Consider moving page-specific inline scripts from `pages/home.php`, `pages/skills.php`, and `pages/gallery.php` into deferred static JS for better caching and maintainability.
5. Verify `.htaccess` headers on the live server with DevTools or `curl -I` to ensure immutable caching and compression are active.

# MapLibre sanitizer security update, 14 November 2026

MapLibre 5.24.1 is affected by GHSA-jrc7-96c5-q579. Updated to exact 6.18.0 with Vite-bundled module worker. The style JSON, camera, place content and controls are unchanged.

- Fresh npm ci: passes; npm audit: zero vulnerabilities.
- Lockfile regenerated within existing dependency ranges to clear transitive advisories. npm 10 peer traversal crashed, so the project records legacy-peer-deps=true for reproducible installs. No forced major dev-tool update.
- Lint: zero errors, seven existing warnings.
- Unit: 16/16.
- Playwright: 13/13, including new rendered-feature guards at 320/390/1280. A canvas alone is not accepted as a loaded map.
- All six temple stories, list, close/Escape/focus, scroll and directions checked at 320/390/1280 in normal/reduced motion against the built site.
- Production baseline and updated 320/390 map pixels inspected: same warm paper palette, landmarks and framing.
- CI runner pinned to Ubuntu 24.04 and only its Chromium browser installed to avoid the legacy broad-browser install failure.

Existing axe audit only logs findings, it does not assert an accessibility pass. It reports label-content-name mismatch on some temple buttons. This security pass does not claim to fix that existing issue. Physical iPhone/Safari not tested.

Hosted verification and GitHub CI must pass before merge; this note records local verification only until those checks are complete.

# Verify Kanchipuram
Kanchipuram temple city experience (vite).
## Launch
Static; serve repo root over HTTP.
## Doctor
`python3 .cursor/skills/verify-kanchipuram/verify.py`
## Drive
Runs `npx vitest run` (22 vitest tests) then the playwright e2e specs on the chromium project (e2e journey). Dev server port overridable via PW_PORT/PW_BASE_URL; skill uses 5173.
## Evidence
`.cursor/skills/verify-kanchipuram/evidence.json`
## Cleanup
Playwright manages its webServer.
## Known boundaries
firefox/webkit projects are configured but need their browsers installed; only chromium is exercised here.

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

(async () => {
    console.log('Starting Tactical Audit...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    const accessibilityViolations = [];
    const networkFailures = [];

    // Capture Console Errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log(`[CONSOLE ERROR] ${msg.text()}`);
        }
    });

    // Capture Network Failures
    page.on('requestfailed', request => {
        networkFailures.push(`${request.url()} - ${request.failure().errorText}`);
        console.log(`[NETWORK FAIL] ${request.url()}`);
    });

    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        console.log('Page loaded.');

        // 1. Accessibility Scan
        console.log('Scanning for accessibility violations...');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        if (accessibilityScanResults.violations.length > 0) {
            accessibilityScanResults.violations.forEach(violation => {
                accessibilityViolations.push({
                    id: violation.id,
                    impact: violation.impact,
                    description: violation.description,
                    nodes: violation.nodes.map(n => n.html)
                });
                console.log(`[A11Y] ${violation.id} (${violation.impact}): ${violation.description}`);
            });
        }

        // 2. Check for PWA Assets
        console.log('Checking PWA assets...');
        const manifestResponse = await page.request.get('http://localhost:5173/manifest.json');
        if (manifestResponse.status() !== 200) {
            errors.push('CRITICAL: manifest.json is missing or unreachable (404).');
            console.log('[PWA] manifest.json missing.');
        }

        const swResponse = await page.request.get('http://localhost:5173/sw.js');
        if (swResponse.status() !== 200) {
            errors.push('CRITICAL: sw.js is missing or unreachable (404).');
            console.log('[PWA] sw.js missing.');
        }

        // 3. Mixed Content Check (Static Analysis via DOM/Network)
        const mixedContent = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a, img, link, script'));
            return links
                .map(el => el.href || el.src)
                .filter(url => url && url.startsWith('http:') && !url.includes('localhost') && !url.includes('127.0.0.1'));
        });
        if (mixedContent.length > 0) {
            errors.push(`SECURITY: Mixed content detected: ${mixedContent.join(', ')}`);
            console.log('[SECURITY] Mixed content detected.');
        }

        // 4. Visual Evidence
        await page.screenshot({ path: 'audit_screenshot.png' });

    } catch (e) {
        console.error('Audit failed to execute:', e);
        errors.push(`Audit Execution Error: ${e.message}`);
    } finally {
        await browser.close();
    }

    const report = {
        timestamp: new Date().toISOString(),
        consoleErrors: errors,
        accessibility: accessibilityViolations,
        network: networkFailures
    };

    fs.writeFileSync('tactical_report.json', JSON.stringify(report, null, 2));
    console.log('Audit complete. Report saved to tactical_report.json');
})();

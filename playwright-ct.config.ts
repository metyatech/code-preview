import { defineConfig, devices } from '@playwright/experimental-ct-react';

import { resolvePlaywrightCtPort } from './scripts/playwrightCtPort.mjs';

const ctPort = await resolvePlaywrightCtPort({
    preferredPort: 3100,
    host: '127.0.0.1'
});

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './src',
    /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toMatchTheme. */
    snapshotDir: './__snapshots__',
    /* Maximum time one test can run for. */
    timeout: 10 * 1000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /*
     * Firefox component tests are unstable on Windows when many workers
     * try to bootstrap pages at once. Keep local Windows runs serialized
     * so `npm run verify` stays deterministic.
     */
    workers: process.env.CI ? 1 : process.platform === 'win32' ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        /*
         * Fixed ports collide with local daemons on this PC (for example Docker on 3100).
         * Resolve a free localhost port deterministically, while keeping an env override.
         */
        baseURL: `http://127.0.0.1:${ctPort}`,
        ctPort
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ]
});

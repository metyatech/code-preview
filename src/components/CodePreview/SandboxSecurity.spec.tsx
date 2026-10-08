import { test, expect } from '@playwright/experimental-ct-react';
import { CodePreviewFixture } from './fixtures/CodePreviewFixture';

test.describe('CodePreview iframe sandbox', () => {
    test('keeps preview execution and messaging while isolating the parent page', async ({ mount, page }) => {
        await page.evaluate(() => {
            window.localStorage.setItem('sandbox-parent-secret', 'parent-storage');
            document.cookie = 'sandbox-parent-cookie=parent-cookie; path=/';
        });

        const component = await mount(
            <CodePreviewFixture
                consoleVisible={true}
                minHeight="100px"
                html={`<button id="action">Run</button><p id="result">Waiting</p><div style="height: 520px"></div>`}
                css="#action { color: rgb(255, 0, 0); }"
                js={`
const result = document.getElementById('result');
const access = {};
try { window.parent.document.body.dataset.sandboxEscaped = 'true'; access.document = true; } catch { access.document = false; }
try { window.parent.localStorage.getItem('sandbox-parent-secret'); access.localStorage = true; } catch { access.localStorage = false; }
try { window.parent.document.cookie.includes('sandbox-parent-cookie'); access.cookie = true; } catch { access.cookie = false; }
const frameElement = window.frameElement;
access.frameElement = frameElement !== null;
access.sandboxRemoved = frameElement ? (frameElement.removeAttribute('sandbox'), !frameElement.hasAttribute('sandbox')) : false;
document.body.dataset.parentAccess = JSON.stringify(access);
document.body.dataset.navigationAttempted = 'true';
try { window.top.location.href = '/sandbox-navigation-attempt'; } catch {}
document.getElementById('action').addEventListener('click', () => { result.textContent = 'Event handled'; });
console.log('sandbox log');
console.error('sandbox error');
`}
            />
        );

        const iframe = component.locator('iframe');
        await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
        const frame = iframe.contentFrame();
        await expect(frame.locator('#result')).toHaveText('Waiting');
        await expect(frame.locator('body')).toHaveAttribute(
            'data-parent-access',
            JSON.stringify({
                document: false,
                localStorage: false,
                cookie: false,
                frameElement: false,
                sandboxRemoved: false
            })
        );
        await expect(frame.locator('body')).toHaveAttribute('data-navigation-attempted', 'true');
        await expect(frame.locator('#action')).toHaveCSS('color', 'rgb(255, 0, 0)');
        await expect(component.getByText('sandbox log')).toBeVisible();
        await expect(component.getByText('sandbox error')).toBeVisible();

        await frame.locator('#action').click();
        await expect(frame.locator('#result')).toHaveText('Event handled');

        await expect
            .poll(async () => iframe.evaluate((element) => (element as HTMLIFrameElement).offsetHeight))
            .toBeGreaterThan(400);

        await page.evaluate(() => {
            const foreignFrame = document.createElement('iframe');
            foreignFrame.style.display = 'none';
            foreignFrame.setAttribute('sandbox', 'allow-scripts');
            foreignFrame.srcdoc = `<script>
                parent.postMessage({ type: 'codePreviewConsoleLog', messages: ['foreign log'] }, '*');
                parent.postMessage({ type: 'codePreviewHeightChange', height: 700, iframeId: 'foreign' }, '*');
            </script>`;
            document.body.appendChild(foreignFrame);
        });

        await expect(component.getByText('foreign log')).not.toBeVisible();
        await expect
            .poll(async () => iframe.evaluate((element) => (element as HTMLIFrameElement).offsetHeight))
            .toBeLessThan(700);
        await expect(page.locator('body')).not.toHaveAttribute('data-sandbox-escaped', 'true');

        await page.setViewportSize({ width: 375, height: 800 });
        const mobileBounds = await iframe.boundingBox();
        if (!mobileBounds) throw new Error('preview iframe is not visible at mobile width');
        expect(mobileBounds.x).toBeGreaterThanOrEqual(0);
        expect(mobileBounds.x + mobileBounds.width).toBeLessThanOrEqual(375);
    });

    test('blocks a preview attempt to navigate the parent page', async ({ mount, page }) => {
        const originalUrl = page.url();
        const component = await mount(
            <CodePreviewFixture
                html="<p>Navigation probe</p>"
                js="try { window.top.location.href = '/sandbox-navigation-attempt'; } catch (error) { console.log('navigation blocked'); }"
            />
        );

        await expect(component.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');
        await expect.poll(() => page.url()).toBe(originalUrl);
    });
});

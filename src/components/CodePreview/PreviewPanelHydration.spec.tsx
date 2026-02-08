import { test, expect } from "@playwright/experimental-ct-react";
import { HydrationReloadFixture } from "./fixtures/HydrationReloadFixture";

test.describe("PreviewPanel Hydration", () => {
  test("SSR→Hydration相当の初期状態でsrcdocが再読み込みされること", async ({ mount, page }) => {
    const component = await mount(<HydrationReloadFixture />);
    const iframe = component.locator("iframe");
    await expect(iframe).toBeVisible();

    await expect
      .poll(async () => {
        return await iframe.evaluate((el) => {
          return (el as HTMLIFrameElement).dataset.codePreviewHydrationReloaded ?? "0";
        });
      })
      .toBe("1");

    await expect
      .poll(async () => {
        return await page.evaluate(() => window.__codePreviewHydrationTest?.loadCount ?? 0);
      })
      .toBeGreaterThanOrEqual(2);

    const countBefore = await page.evaluate(
      () => window.__codePreviewHydrationTest?.loadCount ?? 0,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const countAfter = await page.evaluate(() => window.__codePreviewHydrationTest?.loadCount ?? 0);
    expect(countAfter).toBe(countBefore);
  });
});

import { expect, test } from "@playwright/test";

async function loadExampleAndWait(page: any) {
  await page.goto("/");
  await page.getByRole("button", { name: /load example/i }).click();
  await page.waitForFunction(
    () => document.querySelectorAll("g.module, rect.super-module").length > 0,
    null,
    { timeout: 10000 }
  );
  // Let the close-dialog animation settle.
  await page.waitForTimeout(400);
}

test("body has no leftover pointer-events: none after the Load dialog closes", async ({
  page,
}) => {
  await loadExampleAndWait(page);
  const bodyPe = await page.evaluate(
    () => window.getComputedStyle(document.body).pointerEvents
  );
  expect(bodyPe).toBe("auto");
});

test("the diagram svg accepts pointer events", async ({ page }) => {
  await loadExampleAndWait(page);
  const svgPe = await page.evaluate(() => {
    const svg = document.querySelector("svg#alluvialSvg");
    return svg ? window.getComputedStyle(svg).pointerEvents : null;
  });
  expect(svgPe).toBe("auto");
});

test("clicking the sidebar Help button opens the Help dialog", async ({
  page,
}) => {
  await loadExampleAndWait(page);
  await page.getByRole("button", { name: /^help$/i }).click();
  // The Help dialog body contains "About" as a heading.
  await expect(page.getByRole("heading", { name: /^About$/i })).toBeVisible();
});

test("sidebar exposes a scrollable container", async ({ page }) => {
  await loadExampleAndWait(page);
  const scrollable = await page.evaluate(() => {
    // Find inner divs with overflowY auto/scroll inside the right-side drawer
    // (the motion.div fixed at right:0 wrapping the sidebar).
    const candidates = Array.from(document.querySelectorAll("div")).filter(
      (el) => {
        const cs = window.getComputedStyle(el);
        const overflowsY =
          cs.overflowY === "auto" || cs.overflowY === "scroll";
        return overflowsY && cs.pointerEvents === "auto";
      }
    );
    return candidates.length > 0;
  });
  expect(scrollable).toBe(true);
});

test("clicking a module in the diagram selects it", async ({ page }) => {
  await loadExampleAndWait(page);
  const moduleHandle = await page.locator("g.module").first();
  await moduleHandle.click({ force: true });
  // Selecting a module updates the store. We assert via the Sidebar Module
  // section showing the network name (set when selectedModule != null).
  await expect(page.getByText(/Module id/i).first()).toBeVisible();
});

import { expect, test } from "@playwright/test";

async function openExample(page: any) {
  await page.goto("/");
  await page.getByRole("button", { name: /load example/i }).click();
  await page.waitForFunction(
    () => document.querySelectorAll("g.module").length > 0,
    null,
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
}

test("module label fontSize matches the store fontSize (not 16px default)", async ({
  page,
}) => {
  await openExample(page);
  const fontSizes = await page.evaluate(() => {
    const texts = Array.from(
      document.querySelectorAll(
        "svg#alluvialSvg g.module g.label text[text-anchor='end'], svg#alluvialSvg g.module g.label text[text-anchor='start']"
      )
    );
    return texts.map((t) => window.getComputedStyle(t).fontSize);
  });
  expect(fontSizes.length).toBeGreaterThan(0);
  // Store default is 8px. Anything <= 12px is acceptable.
  for (const fs of fontSizes) {
    expect(parseFloat(fs)).toBeLessThanOrEqual(12);
  }
});

test("network name fontSize matches networkFontSize (10px)", async ({
  page,
}) => {
  await openExample(page);
  const fontSize = await page.evaluate(() => {
    const t = document.querySelector(
      "svg#alluvialSvg g.network > g.label text.name"
    );
    return t ? window.getComputedStyle(t).fontSize : null;
  });
  expect(parseFloat(fontSize!)).toBeLessThanOrEqual(12);
});

test("dark mode toggle changes html class to 'dark'", async ({ page }) => {
  await openExample(page);
  await page.locator('button[aria-label="color mode"]').last().click();
  await page.waitForTimeout(200);
  const cls = await page.evaluate(() => document.documentElement.className);
  expect(cls).toContain("dark");
});

test("sidebar Help button has a visible border in dark mode", async ({
  page,
}) => {
  await openExample(page);
  await page.locator('button[aria-label="color mode"]').last().click();
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^\s*Help\s*$/.test(b.textContent || "")
    );
    if (!btn) return null;
    const cs = window.getComputedStyle(btn);
    // Walk up until we find a parent with an opaque bg (the sidebar).
    let parent: Element | null = btn.parentElement;
    let parentBg = "";
    while (parent) {
      const pbg = window.getComputedStyle(parent).backgroundColor;
      if (pbg && pbg !== "rgba(0, 0, 0, 0)" && pbg !== "transparent") {
        parentBg = pbg;
        break;
      }
      parent = parent.parentElement;
    }
    return {
      borderColor: cs.borderColor,
      borderWidth: cs.borderWidth,
      parentBg,
    };
  });
  expect(info).not.toBeNull();
  expect(info!.borderWidth).toMatch(/^[1-9]/);
  // Border must differ from the sidebar background or it's invisible.
  expect(info!.borderColor.toLowerCase()).not.toBe(
    info!.parentBg.toLowerCase()
  );
});

test("sidebar buttons use neutral (non-blue) text/border in light mode", async ({
  page,
}) => {
  await openExample(page);
  const colors = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^\s*Help\s*$/.test(b.textContent || "")
    );
    if (!btn) return null;
    const cs = window.getComputedStyle(btn);
    return { color: cs.color, borderColor: cs.borderColor };
  });
  expect(colors).not.toBeNull();
  // A blue palette would produce a color with B clearly larger than R.
  // A neutral gray/black has R ≈ G ≈ B.
  const parse = (s: string) =>
    s.match(/(\d+),\s*(\d+),\s*(\d+)/)!.slice(1, 4).map(Number);
  const [rText, gText, bText] = parse(colors!.color);
  const [rBorder, gBorder, bBorder] = parse(colors!.borderColor);
  // Reject obvious blue tints (B - R > 30).
  expect(bText - rText).toBeLessThanOrEqual(20);
  expect(bBorder - rBorder).toBeLessThanOrEqual(20);
  // And the channels must be close to each other for "neutral".
  expect(Math.abs(rText - gText)).toBeLessThanOrEqual(20);
  expect(Math.abs(rBorder - gBorder)).toBeLessThanOrEqual(20);
});

test("Slider range is blue, thumb is small (~10px), track is thin (~3px)", async ({
  page,
}) => {
  await openExample(page);
  const info = await page.evaluate(() => {
    const slider = document.querySelector("[data-scope='slider']");
    const range = slider?.querySelector("[data-part='range']");
    // In Chakra v3 / Ark UI the slider thumb element has data-part="trigger".
    const thumb = slider?.querySelector("[data-part='trigger']");
    const track = slider?.querySelector("[data-part='track']");
    return {
      rangeColor: range
        ? window.getComputedStyle(range).backgroundColor
        : null,
      thumbSize: thumb
        ? {
            w: parseFloat(window.getComputedStyle(thumb).width),
            h: parseFloat(window.getComputedStyle(thumb).height),
          }
        : null,
      trackHeight: track
        ? parseFloat(window.getComputedStyle(track).height)
        : null,
    };
  });
  expect(info.rangeColor).not.toBeNull();
  const [r, , b] = info.rangeColor!
    .match(/(\d+),\s*(\d+),\s*(\d+)/)!
    .slice(1, 4)
    .map(Number);
  expect(b).toBeGreaterThan(r);
  // Thumb between 8 and 14 px.
  expect(info.thumbSize!.w).toBeGreaterThanOrEqual(8);
  expect(info.thumbSize!.w).toBeLessThanOrEqual(14);
  // Track height under 6px.
  expect(info.trackHeight).toBeLessThanOrEqual(6);
});

test("sidebar Help button is compact (height ~32px from size='xs')", async ({
  page,
}) => {
  await openExample(page);
  const h = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^\s*Help\s*$/.test(b.textContent || "")
    );
    return btn ? window.getComputedStyle(btn).height : null;
  });
  expect(parseFloat(h!)).toBeLessThanOrEqual(34);
});

test("blackAlpha/whiteAlpha CSS variables resolve under Chakra v3 (kebab-case)", async ({
  page,
}) => {
  await page.goto("/");
  const vars = await page.evaluate(() => {
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const cs = window.getComputedStyle(probe);
    const result = {
      black: cs.getPropertyValue("--chakra-colors-black-alpha-400"),
      white: cs.getPropertyValue("--chakra-colors-white-alpha-400"),
    };
    probe.remove();
    return result;
  });
  // Each variable must resolve to a non-empty CSS color.
  expect(vars.black.trim()).not.toBe("");
  expect(vars.white.trim()).not.toBe("");
  expect(vars.black).toMatch(/rgba?\(/);
  expect(vars.white).toMatch(/rgba?\(/);
});

test("re-opening the Load modal after Load Example shows items and no stuck spinner", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /load example/i }).click();
  await page.waitForFunction(
    () => document.querySelectorAll("g.module").length > 0,
    null,
    { timeout: 10000 }
  );
  await page.waitForTimeout(400);

  // Re-open via the sidebar.
  await page.getByRole("button", { name: /load or arrange/i }).click();
  await page.waitForSelector(".dropzone", { state: "visible" });

  // Skeleton must be gone and items visible (4 networks).
  const state = await page.evaluate(() => {
    const items = document.querySelectorAll(".dropzone .child");
    const loadBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => /load example/i.test(b.textContent || "")
    );
    const hasSpinner = !!loadBtn?.querySelector(
      '[data-part="loader"], [data-scope="spinner"]'
    );
    return { itemCount: items.length, hasSpinner };
  });
  expect(state.itemCount).toBeGreaterThan(0);
  expect(state.hasSpinner).toBe(false);
});

test("blue palette uses the v2 #3182CE family (not v3 Tailwind #3b82f6)", async ({
  page,
}) => {
  await page.goto("/");
  const value = await page.evaluate(() => {
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const v = window
      .getComputedStyle(probe)
      .getPropertyValue("--chakra-colors-blue-500")
      .trim()
      .toLowerCase();
    probe.remove();
    return v;
  });
  expect(value).toBe("#3182ce");
});

test("sidebar button labels render at ~14px (v2 sm font size)", async ({
  page,
}) => {
  await openExample(page);
  const fontSize = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^\s*Help\s*$/.test(b.textContent || "")
    );
    return btn ? parseFloat(window.getComputedStyle(btn).fontSize) : null;
  });
  expect(fontSize).not.toBeNull();
  expect(fontSize!).toBeGreaterThanOrEqual(13);
  expect(fontSize!).toBeLessThanOrEqual(16);
});

test("Create Diagram button does NOT spin when loading the example", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /load example/i }).click();
  // While loading, the Load Example button itself should show a spinner.
  // The Create Diagram button must remain in its non-loading state.
  // We can sample multiple times before the modal closes.
  let createDiagramSpunDuringExample = false;
  const start = Date.now();
  while (Date.now() - start < 1500) {
    const result = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const create = btns.find((b) =>
        /create diagram/i.test(b.textContent || "")
      );
      if (!create) return { gone: true };
      const hasSpinner = !!create.querySelector(
        '[data-part="loader"], [data-scope="spinner"], svg[aria-label="loading"]'
      );
      return { gone: false, hasSpinner };
    });
    if (result.gone) break;
    if (result.hasSpinner) {
      createDiagramSpunDuringExample = true;
      break;
    }
    await page.waitForTimeout(50);
  }
  expect(createDiagramSpunDuringExample).toBe(false);
});

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom can't parse Chakra v3's @layer / color-mix CSS. The DOM still renders
// fine; the errors are noisy stderr that mark test files as failed in vitest.
// Filter just those specific messages so real errors still surface.
const realConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args[0];
  if (
    msg instanceof Error &&
    msg.message.includes("Could not parse CSS stylesheet")
  ) {
    return;
  }
  realConsoleError(...args);
};

// jsdom doesn't implement matchMedia (used by next-themes + framer-motion).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom doesn't implement ResizeObserver (used by Chakra UI v3 portals/positioner).
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

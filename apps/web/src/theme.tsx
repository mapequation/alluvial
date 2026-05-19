import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Restore the Chakra v2 "blue" palette (anchored on #3182CE). Chakra v3's
// default blue is Tailwind-style (#3b82f6 at 500), which reads slightly
// cooler and less saturated than the mapequation brand blue.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        blue: {
          50: { value: "#ebf8ff" },
          100: { value: "#bee3f8" },
          200: { value: "#90cdf4" },
          300: { value: "#63b3ed" },
          400: { value: "#4299e1" },
          500: { value: "#3182ce" },
          600: { value: "#2b6cb0" },
          700: { value: "#2c5282" },
          800: { value: "#2a4365" },
          900: { value: "#1a365d" },
          950: { value: "#142a4a" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

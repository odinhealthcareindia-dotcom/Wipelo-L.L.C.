import { defineConfig } from "@playwright/test";

// Logic tests that need no browser or server.
export default defineConfig({ testDir: "./tests/unit", fullyParallel: true, timeout: 30_000, reporter: "line" });

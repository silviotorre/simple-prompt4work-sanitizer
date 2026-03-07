import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAppConfigs } from "../src/config-loader.js";

describe("loadAppConfigs", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("normalizza il nuovo schema rules mantenendo solo le regole abilitate", async () => {
    global.fetch.mockImplementation(async (path) => {
      const payloads = {
        "./data/default.json": {
          meta: { version: 1 },
          rules: [
            { id: "r1", pattern: "\\bfoo\\b", replaceWith: "bar", enabled: true },
            { id: "r2", pattern: "\\bbaz\\b", replaceWith: "qux", enabled: false }
          ]
        },
        "./data/custom.json": {
          meta: { version: 1 },
          rules: [{ id: "r3", pattern: "\\bclient\\b", replaceWith: "client: [omesso]" }]
        },
        "./data/redflags.json": {
          meta: { version: 1 },
          rules: [
            { id: "email", pattern: "a+", replaceWith: "***", enabled: true },
            { id: "disabled", pattern: "b+", replaceWith: "***", enabled: false }
          ]
        }
      };

      return {
        ok: true,
        text: async () => JSON.stringify(payloads[path])
      };
    });

    const configs = await loadAppConfigs();

    expect(configs.defaultReplacements).toEqual({
      "\\bfoo\\b": "bar"
    });
    expect(configs.customReplacements).toEqual({
      "\\bclient\\b": "client: [omesso]"
    });
    expect(configs.redFlags).toEqual({
      email: {
        pattern: "a+",
        replaceWith: "***",
        enabled: true
      },
      disabled: {
        pattern: "b+",
        replaceWith: "***",
        enabled: false
      }
    });
    expect(configs.errors).toEqual([]);
  });

  it("resta compatibile con il formato legacy a mappa", async () => {
    global.fetch.mockImplementation(async (path) => {
      const payloads = {
        "./data/default.json": {
          "\\bfoo\\b": "bar"
        },
        "./data/custom.json": {
          "\\bbaz\\b": "qux"
        },
        "./data/redflags.json": {
          email: {
            pattern: "a+",
            replaceWith: "***",
            enabled: true
          }
        }
      };

      return {
        ok: true,
        text: async () => JSON.stringify(payloads[path])
      };
    });

    const configs = await loadAppConfigs();

    expect(configs.defaultReplacements).toEqual({
      "\\bfoo\\b": "bar"
    });
    expect(configs.customReplacements).toEqual({
      "\\bbaz\\b": "qux"
    });
    expect(configs.redFlags).toEqual({
      email: {
        pattern: "a+",
        replaceWith: "***",
        enabled: true
      }
    });
    expect(configs.errors).toEqual([]);
  });
});

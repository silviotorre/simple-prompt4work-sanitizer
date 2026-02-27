import { describe, expect, it } from "vitest";
import { sanitizePrompt } from "../src/sanitizer.js";

const configs = {
  defaultReplacements: {
    "\\bidiota\\b": "persona",
    "\\bstupido\\b": "non appropriato",
    "\\bcliente\\b": "cliente-default"
  },
  customReplacements: {
    "\\bcliente\\b": "cliente-custom"
  },
  redFlags: {
    email: {
      pattern: "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",
      replaceWith: "********",
      enabled: true
    },
    broken: {
      pattern: "(",
      replaceWith: "",
      enabled: true
    }
  }
};

describe("sanitizePrompt", () => {
  it("applica sostituzioni dizionario case-insensitive", () => {
    const result = sanitizePrompt("Sei STUPIDO e idiota", { enableMarkdownTransform: false }, configs);
    expect(result.outputMarkdown).toBe("Sei non appropriato e persona");
  });

  it("supporta rimozioni complete con stringa vuota", () => {
    const localConfigs = {
      ...configs,
      defaultReplacements: {
        "da_rimuovere": ""
      },
      customReplacements: {}
    };

    const result = sanitizePrompt("ciao da_rimuovere mondo", { enableMarkdownTransform: false }, localConfigs);
    expect(result.outputMarkdown).toBe("ciao mondo");
  });

  it("applica priorita custom su default", () => {
    const result = sanitizePrompt("Cliente principale", { enableMarkdownTransform: false }, configs);
    expect(result.outputMarkdown).toBe("cliente-custom principale");
  });

  it("applica redflags dopo dizionario", () => {
    const result = sanitizePrompt("Contatto: nome@example.com", { enableMarkdownTransform: false }, configs);
    expect(result.outputMarkdown).toContain("********");
  });

  it("gestisce regex redflags invalide senza crash", () => {
    const result = sanitizePrompt("test", { enableMarkdownTransform: false }, configs);
    expect(result.diagnostics.errors.length).toBeGreaterThan(0);
    expect(result.outputMarkdown).toBe("test");
  });

  it("ritorna output vuoto con input nullo", () => {
    const result = sanitizePrompt(null, {}, configs);
    expect(result.outputMarkdown).toBe("");
    expect(result.diagnostics.errors).toHaveLength(0);
  });
});


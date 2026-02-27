import { describe, expect, it } from "vitest";
import { transformToMarkdown } from "../src/markdown.js";

describe("transformToMarkdown", () => {
  it("usa la prima riga non vuota come H1", () => {
    const input = "\nTitolo principale\nContenuto";
    const output = transformToMarkdown(input);
    expect(output.startsWith("# Titolo principale")).toBe(true);
  });

  it("gestisce blocchi separati da doppio newline come H2", () => {
    const input = "Titolo\n\nSezione A\nriga 2";
    const output = transformToMarkdown(input);
    expect(output).toContain("## Sezione A");
    expect(output).toContain("riga 2");
  });

  it("gestisce blocchi separati da triplo newline come H3", () => {
    const input = "Titolo\n\n\nSezione Profonda\nDettaglio";
    const output = transformToMarkdown(input);
    expect(output).toContain("### Sezione Profonda");
  });

  it("mantiene il testo plain quando non ci sono blocchi multipli", () => {
    const input = "Titolo\nlinea uno\nlinea due";
    const output = transformToMarkdown(input);
    expect(output).toBe("# Titolo\n\nlinea uno\nlinea due");
  });

  it("ritorna stringa vuota per input vuoto", () => {
    expect(transformToMarkdown("   ")).toBe("");
  });
});


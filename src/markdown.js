function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, "\n");
}

function firstNonEmptyLineIndex(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() !== "") {
      return i;
    }
  }
  return -1;
}

export function transformToMarkdown(input) {
  const safeInput = typeof input === "string" ? input : "";
  const normalized = normalizeNewlines(safeInput);
  if (!normalized.trim()) {
    return "";
  }

  try {
    const lines = normalized.split("\n");
    const titleIndex = firstNonEmptyLineIndex(lines);
    if (titleIndex < 0) {
      return normalized.trim();
    }

    const title = lines[titleIndex].trim();
    const remaining = lines.slice(titleIndex + 1).join("\n");
    const output = [`# ${title}`];

    if (!remaining.trim()) {
      return output.join("\n");
    }

    const fragments = remaining.split(/(\n{2,})/);
    let previousSeparator = "";

    for (let i = 0; i < fragments.length; i += 1) {
      const part = fragments[i];
      if (i % 2 === 1) {
        previousSeparator = part;
        continue;
      }

      if (!part || !part.trim()) {
        continue;
      }

      const blockText = part.replace(/^\n+/, "").replace(/\n+$/, "");
      if (!blockText) {
        continue;
      }

      if (!previousSeparator) {
        output.push(blockText);
        continue;
      }

      const headingLevel = previousSeparator.length >= 3 ? "###" : "##";
      const blockLines = blockText.split("\n");
      const headingTitle = blockLines[0].trim();
      const blockBody = blockLines.slice(1).join("\n").trim();

      output.push(`${headingLevel} ${headingTitle}`);
      if (blockBody) {
        output.push(blockBody);
      }
    }

    return output.join("\n\n").trim();
  } catch {
    return normalized;
  }
}


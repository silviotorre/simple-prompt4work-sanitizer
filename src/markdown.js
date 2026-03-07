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

function splitIntoBlocks(lines) {
  const blocks = [];
  let currentLines = [];
  let blankLinesBefore = 0;
  let currentBlankLinesBefore = 0;

  for (const line of lines) {
    if (line.trim() === "") {
      if (currentLines.length) {
        blocks.push({
          lines: currentLines,
          blankLinesBefore: currentBlankLinesBefore
        });
        currentLines = [];
      }

      blankLinesBefore += 1;
      continue;
    }

    if (!currentLines.length) {
      currentBlankLinesBefore = blankLinesBefore;
      blankLinesBefore = 0;
    }

    currentLines.push(line);
  }

  if (currentLines.length) {
    blocks.push({
      lines: currentLines,
      blankLinesBefore: currentBlankLinesBefore
    });
  }

  return blocks;
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
    const output = [`# ${title}`];

    const blocks = splitIntoBlocks(lines.slice(titleIndex + 1));
    if (!blocks.length) {
      return output.join("\n");
    }

    for (const block of blocks) {
      const blockText = block.lines.join("\n").trim();
      if (!blockText) {
        continue;
      }

      if (block.blankLinesBefore === 0) {
        output.push(blockText);
        continue;
      }

      const headingLevel = block.blankLinesBefore >= 2 ? "###" : "##";
      const headingTitle = block.lines[0].trim();
      const blockBody = block.lines.slice(1).join("\n").trim();

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

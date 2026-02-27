import { transformToMarkdown } from "./markdown.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeInput(value) {
  return (typeof value === "string" ? value : "").replace(/\r\n?/g, "\n");
}

function compilePattern(pattern) {
  try {
    return new RegExp(pattern, "gi");
  } catch {
    return new RegExp(escapeRegExp(pattern), "gi");
  }
}

function cleanupWhitespace(text) {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trimEnd();
}

function applyDictionaryReplacements(text, config, diagnostics) {
  let output = text;
  for (const [pattern, replacement] of Object.entries(config)) {
    const matcher = compilePattern(pattern);
    const before = output;
    output = output.replace(matcher, replacement);
    if (before !== output) {
      diagnostics.appliedRules.push(`dictionary:${pattern}`);
    }
  }
  return output;
}

function applyRedFlags(text, redFlagsConfig, diagnostics) {
  let output = text;
  for (const [ruleName, rule] of Object.entries(redFlagsConfig)) {
    if (!rule.enabled) {
      continue;
    }

    let matcher;
    try {
      matcher = new RegExp(rule.pattern, "gi");
    } catch (error) {
      diagnostics.errors.push(`[redflags] Regola "${ruleName}" ignorata: regex non valida (${error.message}).`);
      continue;
    }

    const before = output;
    output = output.replace(matcher, rule.replaceWith ?? "");
    if (before !== output) {
      diagnostics.appliedRules.push(`redflag:${ruleName}`);
    }
  }
  return output;
}

export function sanitizePrompt(input, options = {}, configs = {}) {
  const {
    enableDictionary = true,
    enableRedFlags = true,
    enableMarkdownTransform = true
  } = options;

  const diagnostics = {
    appliedRules: [],
    errors: []
  };

  const defaultReplacements = configs.defaultReplacements ?? {};
  const customReplacements = configs.customReplacements ?? {};
  const redFlags = configs.redFlags ?? {};

  let output = normalizeInput(input);
  if (!output) {
    return {
      outputMarkdown: "",
      diagnostics
    };
  }

  if (enableDictionary) {
    const mergedReplacements = { ...defaultReplacements, ...customReplacements };
    output = applyDictionaryReplacements(output, mergedReplacements, diagnostics);
    output = cleanupWhitespace(output);
  }

  if (enableRedFlags) {
    output = applyRedFlags(output, redFlags, diagnostics);
    output = cleanupWhitespace(output);
  }

  if (enableMarkdownTransform) {
    output = transformToMarkdown(output);
  }

  return {
    outputMarkdown: output,
    diagnostics
  };
}


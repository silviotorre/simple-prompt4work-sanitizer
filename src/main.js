import { loadAppConfigs } from "./config-loader.js";
import { sanitizePrompt } from "./sanitizer.js";

const elements = {
  input: document.getElementById("input-text"),
  output: document.getElementById("output-text"),
  preview: document.getElementById("preview"),
  diagnostics: document.getElementById("diagnostics"),
  status: document.getElementById("status-text"),
  toggleDictionary: document.getElementById("toggle-dictionary"),
  toggleRedFlags: document.getElementById("toggle-redflags"),
  toggleMarkdown: document.getElementById("toggle-markdown")
};

const state = {
  options: {
    enableDictionary: true,
    enableRedFlags: true,
    enableMarkdownTransform: true
  },
  configs: {
    defaultReplacements: {},
    customReplacements: {},
    redFlags: {},
    errors: []
  }
};

function debounce(fn, waitMs = 150) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), waitMs);
  };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markdownToHtml(markdown) {
  if (!markdown.trim()) {
    return "<p>Nessun contenuto da mostrare.</p>";
  }

  return markdown
    .split("\n")
    .map((line) => {
      const safeLine = escapeHtml(line);
      if (safeLine.startsWith("### ")) {
        return `<h3>${safeLine.slice(4)}</h3>`;
      }
      if (safeLine.startsWith("## ")) {
        return `<h2>${safeLine.slice(3)}</h2>`;
      }
      if (safeLine.startsWith("# ")) {
        return `<h1>${safeLine.slice(2)}</h1>`;
      }
      if (safeLine.trim() === "") {
        return "<br />";
      }
      return `<p>${safeLine}</p>`;
    })
    .join("");
}

function renderDiagnostics(runDiagnostics) {
  const merged = [...state.configs.errors, ...runDiagnostics.errors];
  const rules = runDiagnostics.appliedRules;
  const items = [];

  if (rules.length) {
    items.push(...rules.map((rule) => ({ text: `Regola applicata: ${rule}`, type: "info" })));
  } else {
    items.push({ text: "Nessuna regola applicata sull'input corrente.", type: "info" });
  }

  if (merged.length) {
    items.push(...merged.map((error) => ({ text: error, type: "error" })));
  }

  elements.diagnostics.innerHTML = items
    .map(({ text, type }) => `<li class="${type === "error" ? "error" : ""}">${escapeHtml(text)}</li>`)
    .join("");
}

function render() {
  const inputValue = elements.input.value;
  const result = sanitizePrompt(inputValue, state.options, state.configs);
  elements.output.value = result.outputMarkdown;
  elements.preview.innerHTML = markdownToHtml(result.outputMarkdown);
  renderDiagnostics(result.diagnostics);
}

const debouncedRender = debounce(render, 180);

function wireEvents() {
  elements.input.addEventListener("input", debouncedRender);
  elements.toggleDictionary.addEventListener("change", () => {
    state.options.enableDictionary = elements.toggleDictionary.checked;
    render();
  });
  elements.toggleRedFlags.addEventListener("change", () => {
    state.options.enableRedFlags = elements.toggleRedFlags.checked;
    render();
  });
  elements.toggleMarkdown.addEventListener("change", () => {
    state.options.enableMarkdownTransform = elements.toggleMarkdown.checked;
    render();
  });
}

async function init() {
  wireEvents();
  state.configs = await loadAppConfigs();
  if (state.configs.errors.length) {
    elements.status.textContent = "Configurazioni caricate con warning. Controlla Diagnostica.";
  } else {
    elements.status.textContent = "Configurazioni caricate correttamente.";
  }
  render();
}

init();


# Prompt4Work Sanitizer

A lightweight browser-based tool for **sanitizing work prompts before they are shared with external systems**.

The application applies configurable replacement rules and red-flag detection locally in the browser, then produces sanitized Markdown together with diagnostics showing which controls were applied.

## Why it exists

Work prompts can accidentally contain internal names, credentials, connection strings, email addresses, phone numbers, or other context that should not leave the working environment.

This project provides a small, inspectable preprocessing step for that problem. It is a **sanitization aid, not a data-loss-prevention product**: users remain responsible for reviewing the output before sharing it.

## Capabilities

- Live sanitization without page reloads.
- JSON-based configuration for default, custom, and red-flag rules.
- Literal and regular-expression matching.
- Custom rules override default replacements.
- Red-flag detection for patterns such as email addresses, passwords, phone numbers, and connection strings.
- Markdown output with safe HTML preview.
- Runtime toggles for dictionary rules, red flags, and Markdown transformation.
- Diagnostics for applied rules, warnings, and errors.
- Unit tests for the sanitization core with Vitest.
- GitHub Actions workflow for test and GitHub Pages deployment.

## Architecture

```text
Input prompt
  -> configuration loader
  -> dictionary replacements
  -> red-flag rules
  -> Markdown transformation
  -> sanitized output + diagnostics
```

Main components:

- `index.html` — application UI.
- `styles.css` — responsive layout and presentation.
- `src/main.js` — UI wiring, state, debounce, and live rendering.
- `src/config-loader.js` — configuration loading and validation.
- `src/sanitizer.js` — sanitization pipeline.
- `src/markdown.js` — Markdown transformation.
- `data/*.json` — sanitization configuration.
- `tests/*.test.js` — core unit tests.
- `.github/workflows/deploy.yml` — CI and GitHub Pages deployment.

## Configuration

### Replacement rules

`data/default.json` and `data/custom.json` use a simple key/value mapping:

```json
{
  "pattern_or_text": "replacement",
  "text_to_remove": ""
}
```

If a key is a valid regular expression it is evaluated as a case-insensitive global regex. Otherwise it is treated as case-insensitive literal text. An empty replacement removes the match.

### Red-flag rules

`data/redflags.json` uses named rule objects:

```json
{
  "rule_name": {
    "pattern": "regex",
    "replaceWith": "********",
    "enabled": true
  }
}
```

`replaceWith` and `enabled` are optional.

## Core API

```text
sanitizePrompt(input, options, configs)
  -> { outputMarkdown, diagnostics }
```

The diagnostic result exposes applied rules and configuration/parser errors so the sanitization step remains observable rather than opaque.

## Local development

```bash
npm install
npm test
npx serve .
```

Then open the local URL returned by the static server. Serving the files over HTTP avoids browser restrictions that can affect JSON loading from `file://`.

## Test coverage

Current tests cover:

- case-insensitive dictionary replacement;
- removal via empty replacement;
- custom-over-default precedence;
- red-flag regex handling;
- invalid regex warnings;
- Markdown heading transformation;
- empty/null input behavior.

## Project status

**Reference utility / working prototype.**

The project is intentionally small and dependency-light. Its value is the explicit sanitization pipeline, configurable policy, diagnostics, and local-first processing model rather than feature breadth.

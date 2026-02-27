function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function fetchJson(path, label, errors) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      errors.push(`[${label}] HTTP ${response.status} durante il caricamento di ${path}`);
      return {};
    }

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    errors.push(`[${label}] Impossibile caricare/parsing ${path}: ${error.message}`);
    return {};
  }
}

function validateReplacementConfig(rawConfig, label, errors) {
  if (!isPlainObject(rawConfig)) {
    errors.push(`[${label}] Config non valida: atteso oggetto JSON.`);
    return {};
  }

  const validConfig = {};
  for (const [pattern, replacement] of Object.entries(rawConfig)) {
    if (typeof replacement !== "string") {
      errors.push(`[${label}] Valore ignorato per "${pattern}": attesa stringa.`);
      continue;
    }
    validConfig[pattern] = replacement;
  }

  return validConfig;
}

function validateRedFlagsConfig(rawConfig, label, errors) {
  if (!isPlainObject(rawConfig)) {
    errors.push(`[${label}] Config non valida: atteso oggetto JSON.`);
    return {};
  }

  const validConfig = {};
  for (const [ruleName, ruleConfig] of Object.entries(rawConfig)) {
    if (!isPlainObject(ruleConfig)) {
      errors.push(`[${label}] Regola "${ruleName}" ignorata: atteso oggetto.`);
      continue;
    }

    if (typeof ruleConfig.pattern !== "string") {
      errors.push(`[${label}] Regola "${ruleName}" ignorata: "pattern" mancante o non stringa.`);
      continue;
    }

    const replaceWith = typeof ruleConfig.replaceWith === "string" ? ruleConfig.replaceWith : "";
    const enabled = typeof ruleConfig.enabled === "boolean" ? ruleConfig.enabled : true;
    validConfig[ruleName] = {
      pattern: ruleConfig.pattern,
      replaceWith,
      enabled
    };
  }

  return validConfig;
}

export async function loadAppConfigs() {
  const errors = [];
  const [defaultRaw, customRaw, redFlagsRaw] = await Promise.all([
    fetchJson("./data/default.json", "default", errors),
    fetchJson("./data/custom.json", "custom", errors),
    fetchJson("./data/redflags.json", "redflags", errors)
  ]);

  return {
    defaultReplacements: validateReplacementConfig(defaultRaw, "default", errors),
    customReplacements: validateReplacementConfig(customRaw, "custom", errors),
    redFlags: validateRedFlagsConfig(redFlagsRaw, "redflags", errors),
    errors
  };
}


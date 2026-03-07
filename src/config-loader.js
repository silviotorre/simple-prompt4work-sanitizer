function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLegacyReplacementMap(rawConfig) {
  return isPlainObject(rawConfig) && !Array.isArray(rawConfig.rules);
}

function isExtendedRuleSet(rawConfig) {
  return isPlainObject(rawConfig) && Array.isArray(rawConfig.rules);
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
  if (isLegacyReplacementMap(rawConfig)) {
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

  if (!isExtendedRuleSet(rawConfig)) {
    errors.push(`[${label}] Config non valida: atteso oggetto JSON.`);
    return {};
  }

  const validConfig = {};
  for (const rule of rawConfig.rules) {
    if (!isPlainObject(rule)) {
      errors.push(`[${label}] Regola ignorata: atteso oggetto.`);
      continue;
    }

    const pattern = typeof rule.pattern === "string" ? rule.pattern : "";
    const replacement = typeof rule.replaceWith === "string" ? rule.replaceWith : "";
    const enabled = typeof rule.enabled === "boolean" ? rule.enabled : true;

    if (!pattern) {
      errors.push(`[${label}] Regola ignorata: "pattern" mancante o non stringa.`);
      continue;
    }

    if (!enabled) {
      continue;
    }

    validConfig[pattern] = replacement;
  }

  return validConfig;
}

function validateRedFlagsConfig(rawConfig, label, errors) {
  if (isLegacyReplacementMap(rawConfig)) {
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

  if (!isExtendedRuleSet(rawConfig)) {
    errors.push(`[${label}] Config non valida: atteso oggetto JSON.`);
    return {};
  }

  const validConfig = {};
  for (const rule of rawConfig.rules) {
    if (!isPlainObject(rule)) {
      errors.push(`[${label}] Regola ignorata: atteso oggetto.`);
      continue;
    }

    const ruleName = typeof rule.id === "string" && rule.id.trim() ? rule.id.trim() : "";
    if (!ruleName) {
      errors.push(`[${label}] Regola ignorata: "id" mancante o non stringa.`);
      continue;
    }

    if (typeof rule.pattern !== "string") {
      errors.push(`[${label}] Regola "${ruleName}" ignorata: "pattern" mancante o non stringa.`);
      continue;
    }

    const replaceWith = typeof rule.replaceWith === "string" ? rule.replaceWith : "";
    const enabled = typeof rule.enabled === "boolean" ? rule.enabled : true;
    validConfig[ruleName] = {
      pattern: rule.pattern,
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

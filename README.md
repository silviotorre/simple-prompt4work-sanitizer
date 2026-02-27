# simple-prompt4work-sanitizer

Single-page web app per sanitizzare prompt di lavoro in tempo reale, con regole configurabili via JSON (stringhe e regex), output markdown e diagnostica delle regole applicate.

## Caratteristiche MVP

- Sanitizzazione live (senza reload pagina)
- Configurazione via JSON:
  - `data/default.json`
  - `data/custom.json`
  - `data/redflags.json`
- Priorita regole: `custom` sovrascrive `default`
- Supporto red flags con regex (email, password, telefono, connection string, ecc.)
- Output markdown + preview HTML sicura
- Toggle runtime:
  - dizionario (`default + custom`)
  - red flags
  - trasformazione markdown
- Diagnostica applicata in UI (regole usate + warning/errori)
- Test unitari del core con Vitest
- Workflow GitHub Actions per test + deploy su GitHub Pages

## Architettura

- `index.html`: UI principale
- `styles.css`: tema e layout responsive
- `src/main.js`: wiring UI, stato, debounce, render live
- `src/config-loader.js`: caricamento/validazione JSON
- `src/sanitizer.js`: pipeline core sanitizzazione
- `src/markdown.js`: conversione testo -> markdown
- `data/*.json`: configurazioni sanitizzazione
- `tests/*.test.js`: unit test core
- `.github/workflows/deploy.yml`: CI/CD Pages

## Setup locale

1. Clona il repository.
2. Installa dipendenze:
   ```bash
   npm install
   ```
3. Esegui i test:
   ```bash
   npm test
   ```
4. Avvia un server statico locale (consigliato, per consentire il fetch dei JSON):
   ```bash
   npx serve .
   ```
5. Apri l'URL locale mostrato dal server.

Nota: aprire `index.html` direttamente da `file://` puo bloccare il caricamento dei JSON in alcuni browser.

## Formato configurazioni JSON

### 1) Replacement config (`default.json` / `custom.json`)

```json
{
  "pattern_o_testo": "sostituzione",
  "parola_da_rimuovere": ""
}
```

- Se la chiave e una regex valida, viene usata come regex (`gi`).
- Se non e una regex valida, viene trattata come testo letterale case-insensitive.
- Valore `""` => rimozione.

### 2) Red flags config (`redflags.json`)

```json
{
  "nome_regola": {
    "pattern": "regex",
    "replaceWith": "********",
    "enabled": true
  }
}
```

- `replaceWith` opzionale (default: `""`)
- `enabled` opzionale (default: `true`)

## Regole markdown (MVP)

- Prima riga non vuota -> `# Titolo`
- Blocco separato da doppio newline -> `##`
- Blocco separato da triplo newline -> `###`
- Singolo newline interno blocco -> testo normale
- Fallback sicuro: in caso di errore parser, nessuna perdita di contenuto

## API core

`sanitizePrompt(input, options, configs) => { outputMarkdown, diagnostics }`

- `options`:
  - `enableDictionary` (default `true`)
  - `enableRedFlags` (default `true`)
  - `enableMarkdownTransform` (default `true`)
- `diagnostics`:
  - `appliedRules: string[]`
  - `errors: string[]`

## Test coperti

- sostituzioni dizionario case-insensitive
- rimozione con stringa vuota
- priorita custom > default
- red flags regex
- regex invalida ignorata con warning
- trasformazione markdown H1/H2/H3
- input vuoto/null

## Deploy

Il workflow `.github/workflows/deploy.yml` esegue:

1. `npm install`
2. `npm test`
3. deploy su GitHub Pages (branch `main`)

Per abilitare Pages:

- Repository Settings -> Pages -> Source: GitHub Actions

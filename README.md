# Question Items – Frontend (QBank)

This repository contains maintainable, parseable question items for senior frontend engineering interviews and quizzes.

- **Spec version:** v7 (see [`docs/README.md`](docs/README.md) for the full Parsing Spec)
- **Language policy:** Author in any language; the parser will **normalize everything to English** in the exported JSON (per v7).
- **IDs:** `<prefix>-NNN` (zero-padded). You control the `prefix` and starting index per batch.
- **Versioning:** Each question object uses `version: 7`. Bump only when the schema changes.
- **Types:** `single` or `multi`. True/False is `single` with locked order.
- **Order:** Keep original option order in source. The app may shuffle later (except T/F).

---

## Getting started (app)

> If your app stack differs, adjust accordingly.

### Using npm
```bash
npm install
npm run dev   # start local dev server
# optional
npm test      # run tests
npm run build # production build
```

### Using pnpm
```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

### Using yarn
```bash
yarn install
yarn dev
yarn test
yarn build
```

---

## How to contribute items

1) **Write the stem and options** (checkbox syntax like `- [ ]` / `- [x]` is fine in drafts).
2) **Mark the correct option(s)** in your draft.
3) **Add concise feedback** blocks (optional but recommended):  
   - “Why [letter] is correct:” → becomes **`explanation`**.  
   - “Why the others are wrong:” → becomes **`explanationIncorrect`** (aggregated list).  
4) **Submit as a batch** with a **prefix** and **start index** (e.g., `basic` starting at 001).

> The parser cleans: removes checkbox syntax and letter prefixes (`A)`, `B)`), keeps instruction suffixes, and translates to English.

---

## JSON output shape (summary)

Each question becomes a JSON object with:

- `id`, `version`, `type`, `prompt`, `options[]`, `correct[]`
- `explanation` *(string | string[])* – why the correct option(s) is/are right
- `explanationIncorrect` *(string | string[])* – why incorrect options are wrong (aggregated)
- Optional: `source`, `sourceNote`, `lockOptionOrder`

See the **full spec and examples** in [`docs/README.md`](docs/README.md).

---

## Repository layout

```
docs/README.md     # Full Parsing Spec v7 (authoritative)
items/             # JSON batches (one file per batch)
scripts/           # Helpers/validation (optional)
```

---

## Validation (optional)

If you add a validator, ensure it checks:
- `id` format and sequential numbering within a batch prefix
- `version === 7`
- options are `A`, `B`, `C`, … and texts are non-empty
- `correct[]` references existing option IDs
- `explanation` / `explanationIncorrect` are string or string[]

---

## Changelog

- **v7** – `explanationIncorrect` changed to aggregated `string | string[]` (no per-ID map). `explanation` kept symmetric. Minor clarifications to language normalization.
- **v6** – Introduced `explanationIncorrect` (per-ID object) and added `sourceNote`; recommended keyword prefixing; clarified T/F behavior.
- **v5** – Added full-English normalization, removal of letter prefixes in options, mapping of “Varför …” blocks to explanations, and keyword-prefixed multi-point explanations.
- **v4** – Baseline schema: `id`, `version`, `type`, `prompt`, `options`, `correct`, `explanation`, optional `source`, and `lockOptionOrder` for T/F.

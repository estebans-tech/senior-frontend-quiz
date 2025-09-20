# Parsing Spec v7

## Object shape (per question)

- `id` (string): `<prefix>-NNN`  
  3-digit, zero-padded; sequential within the prefix.
- `version` (number): **7**.
- `type` (string): `"single"` or `"multi"`.
- `prompt` (string): Full question text **translated to English**.  
  Keep instructional suffixes (e.g., “(choose the best answer)”). Strip leading markers like `->` / `—>`.
- `options` (array): Answer choices in **original order**. Each item:
  ```json
  { "id": "A", "text": "..." }
  ```
  - `text` is **translated to English**.
  - Remove any leading `A)`, `B)` (including following spaces) from the source text.
- `correct` (string[]): The option IDs that are correct (array even for single-answer questions).
- `explanation` (string | string[], English): Why the correct option(s) is/are right.  
  - Use an **array** when there are multiple points.  
  - For multi-point items, **prefix** each point with a keyword from the referenced option where natural (e.g., `JSON.parse(): Parses JSON…`).
- `explanationIncorrect` (string | string[], English): Why the **incorrect** options are wrong (aggregated list, not per-ID).  
  - Use an **array** when there are multiple points.  
  - When helpful, prefix each point with a keyword from the incorrect option (e.g., function name).
- `source` (string, optional): Verbatim citation if a “Source:” line was provided.
- `sourceNote` (string, optional): Brief **English** paraphrase/clarification of the source.
- `lockOptionOrder` (boolean, optional):  
  - **true** for True/False items.  
  - Omit otherwise unless you explicitly want to lock order.

## Type rules

- If the stem contains “Choose the best answer” → `type: "single"`.
- If the stem contains “Choose the best two/three…” or “Select all that apply” → `type: "multi"`.
- True/False questions → `type: "single"` + `lockOptionOrder: true`, and options must be exactly:
  ```json
  [{ "id": "A", "text": "True" }, { "id": "B", "text": "False" }]
  ```

## Cleaning & normalization

- **Translate everything to English** (prompt, options, explanations).
- Remove checkbox syntax from the source (`- [ ]`, `- [x]`); keep raw option text.
- Keep the original option order (T/F also locked).
- Keep instructional suffixes in the prompt.
- Remove “Your Answer” lines or stray labels.
- Remove leading `—>`/`->` markers in prompts (keep the content).
- If the prompt refers to “option A/B/etc.”, normalize such references to the **option text** (since letter markers are stripped from the option strings).

## De-duplication

- **Within a batch:** If `prompt` is identical **and** the **set of options** is identical (order may differ), keep only one item. In your turn, state what was dropped/kept.
- **Across batches:** Perform dedupe only when explicitly requested (IDs from prior files are not retroactively changed).

## IDs & numbering

- IDs are `<prefix>-NNN` (e.g., `basic-001`).  
- Start index is whatever you specify (“start from 001”, “continue after 017”, etc.).  
- Each batch uses a single shared prefix.

## Special options

- “All of the above” / “None of the above”: treat as normal options.  
  In `explanation`/`explanationIncorrect`, you may use the full phrase as the keyword prefix (e.g., `All of the above:`).  
  If logical conflicts arise (e.g., multiple correct + “All of the above”), align `correct` with intended truth and explain the conflict explicitly.

---

## Examples

### Example 1 (single-answer)

```json
{
  "id": "basic-001",
  "version": 7,
  "type": "single",
  "prompt": "Which HTTP header is used to prevent clickjacking?",
  "options": [
    { "id": "A", "text": "Content-Type" },
    { "id": "B", "text": "Cache-Control" },
    { "id": "C", "text": "Strict-Transport-Security" },
    { "id": "D", "text": "X-Frame-Options" }
  ],
  "correct": ["D"],
  "explanation": [
    "X-Frame-Options: Protects against clickjacking by blocking embedding in iframes.",
    "Best practice: Prefer Content-Security-Policy 'frame-ancestors' for finer control and flexibility."
  ],
  "explanationIncorrect": [
    "Content-Type: Declares the media type; does not mitigate clickjacking.",
    "Cache-Control: Controls caching; unrelated to framing/embedding.",
    "Strict-Transport-Security: Enforces HTTPS; does not control iframe embedding."
  ]
}
```

### Example 2 (single-answer, aggregated incorrect reasons)

```json
{
  "id": "basic-002",
  "version": 7,
  "type": "single",
  "prompt": "Which method converts a JSON string into a JavaScript object?",
  "options": [
    { "id": "A", "text": "JSON.stringify()" },
    { "id": "B", "text": "Object.assign()" },
    { "id": "C", "text": "eval()" },
    { "id": "D", "text": "JSON.parse()" }
  ],
  "correct": ["D"],
  "explanation": [
    "JSON.parse(): Parses JSON strings into JavaScript values/objects.",
    "Safety: JSON.parse() validates JSON; eval() executes arbitrary code."
  ],
  "explanationIncorrect": [
    "JSON.stringify(): Converts a value/object into a JSON string; it does not parse JSON.",
    "Object.assign(): Copies properties between objects; unrelated to parsing JSON.",
    "eval(): Executes arbitrary code; unsafe and unnecessary for JSON parsing."
  ]
}
```

---

## Notes & conventions

- **Keyword prefixing** in `explanation`/`explanationIncorrect` (e.g., `JSON.parse(): …`) is **recommended** to improve clarity, but optional when no natural keyword exists (e.g., True/False).
- Keep citations in `source` **verbatim** for searchability; use `sourceNote` to add a short English clarification if needed.

--- 

*If you later need per-option incorrect rationales for targeted UI feedback, consider adding an additional (optional) field like `explanationIncorrectById` alongside this v7 spec.*

# Privacy

## Public Judge Mode

- Every candidate, job, evidence excerpt, screenshot, test resume, and prepared analysis is synthetic.
- `LOCAL_PRIVATE_MODE=false` rejects resume upload requests before reading multipart data.
- No account, production database, employer integration, or application submission exists.
- Prepared outputs are not labeled live or fresh.

## Local Private Mode

- PDF, DOCX, and UTF-8 TXT files are limited to 10 MB and parsed in memory.
- MIME type and extension must agree. Malformed, binary, executable, macro-enabled, embedded-object, and path-like input is rejected.
- DOCX external relationships are stripped before Mammoth extracts text.
- A PDF must contain selectable text. OCR is not performed.
- Raw bytes and complete raw text are not persisted, logged, included in reports, or included in Score Receipts.
- The byte buffer is overwritten on every successful or failed extraction path.
- Only the user-confirmed structured profile is stored in browser-local storage; **Clear Local Profile** removes it from active state and replaces storage with an empty default state.
- Protected-attribute lines and prompt-like instructions are excluded from matching evidence. JobPilot does not infer age, gender, ethnicity, disability, health, religion, family status, or photograph traits.
- Confirmed structured evidence is sent only to the configured loopback Ollama URL. Runtime validation rejects non-loopback endpoints.
- No resume content is sent to OpenAI or another cloud model.

## Optional GPT-5.6 heavy reasoning

The optional heavy route may receive only validated requirements, selected minimal evidence excerpts and IDs, deterministic receipt data, and practical constraints. It may not receive the complete raw resume in Build Week mode and may never calculate or mutate the final score.

## Local browser state

Profile, preferences, analyses, and tracker records remain browser-local. Moving a role to Applied is planning state only. JobPilot never submits an application.

Secret scans cover source, build output, reports, fixtures, screenshots, staged files, and media metadata. Server secrets have no `NEXT_PUBLIC_` prefix and public status responses never return secret values, file paths, or credentials.

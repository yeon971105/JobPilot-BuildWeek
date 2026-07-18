# Private Resume Mode

Private Resume Mode is the local-only product path for profile-specific analysis. It is separate from the synthetic, no-login public judge experience.

## Setup

1. Install Node.js 20+ and npm dependencies.
2. Install Ollama and make `gemma4:12b` available locally.
3. Set:

   ```dotenv
   LOCAL_PRIVATE_MODE=true
   OLLAMA_ENABLED=true
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=gemma4:12b
   ```

4. Run `npm run build && npm run start` or `npm run dev`.
5. Open `/profile/resume`.

No OpenAI key is required.

## Supported files

| Format | MIME type | Behavior |
| --- | --- | --- |
| PDF | `application/pdf` | Requires a valid PDF signature and selectable text. OCR is unavailable. |
| DOCX | Open XML Word MIME | Rejects macros, scripts, executables, ActiveX, and embedded objects; strips external relationships. |
| TXT | `text/plain` | Requires fatal-valid UTF-8 and rejects null-byte binary content. |

Every file must be 10 MB or smaller, have a safe basename, and have matching extension and MIME type. Parsing happens in memory. Raw bytes are overwritten when parsing exits.

## Onboarding flow

1. Select a local resume or the built-in synthetic test resume.
2. Parse locally.
3. Review roles, projects, skills, education, certifications, dates, evidence excerpts, and warnings.
4. Edit, add, or remove incorrect items.
5. Confirm the structured profile.
6. Set work modes, locations, remote eligibility, travel tolerance, relocation, and the optional authorization note.
7. Open a role. JobPilot runs local Gemma matching asynchronously and then deterministic AI Fit V2.2.

Changing the profile or preferences clears prior private analyses. **Clear Local Profile** replaces browser storage with an empty demo state.

## Privacy boundary

- Resume parsing makes zero network requests.
- Local semantic matching is restricted to loopback HTTP on `127.0.0.1`, `localhost`, or `::1`.
- The model receives confirmed structured evidence, not an unreviewed raw file.
- Protected-attribute lines and prompt-like commands do not become scoring evidence.
- Raw text is absent from logs, reports, and Score Receipts.
- Public Judge Mode returns HTTP 403 before reading an upload body.
- JobPilot never submits an application.

## Local Gemma contract

The request uses `gemma4:12b`, temperature zero, a fixed seed, a strict output schema, and an explicit instruction that resume excerpts are untrusted inert data. Returned requirement IDs and evidence IDs must exist in the supplied contract. Unknown IDs, incomplete output, non-JSON output, a disabled local mode, or an unavailable model fails closed.

Gemma handles semantic matching. Deterministic code calculates every point. Work preferences affect Apply Priority and blockers, not technical Fit Score.

## Limitations

- No OCR for image-only PDFs.
- No legacy DOC or RTF support.
- No cloud backup or multi-device sync.
- No protected-attribute inference.
- No hiring probability or outcome calibration.
- No application submission.

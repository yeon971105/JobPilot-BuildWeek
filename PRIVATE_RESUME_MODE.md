# Private Resume Mode

Private Resume Mode is the local-only path for profile-specific analysis. The public judge path uses synthetic data and rejects upload bodies before parsing.

## Setup

```dotenv
LOCAL_PRIVATE_MODE=true
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:12b
```

Run the app and open `/profile/resume`. No OpenAI key is required.

## Supported files and bounds

| Format | Rule |
| --- | --- |
| PDF | Valid PDF signature, selectable text, no OCR |
| DOCX | Valid Open XML; macros, scripts, executables, ActiveX, embedded objects, and external relationships rejected or stripped |
| TXT | Fatal-valid UTF-8; binary/null-byte input rejected |

Files are limited to 10 MB. Extension, MIME type, signature, safe basename, archive structure, and extractability must agree.

## Flow

1. Select a file or the built-in synthetic test resume.
2. Parse in memory.
3. Review and edit roles, projects, skills, education, certifications, dates, evidence excerpts, and warnings.
4. Confirm the structured profile.
5. Configure home city and coordinates, preferred radius, remote preference, work modes, locations, travel, relocation, and optional authorization note.
6. Open a role. One bounded loopback `gemma4:12b` request returns semantic matches; deterministic code produces the score and receipt.

Changing the profile or preferences invalidates private analyses. **Clear Local Profile** replaces local state with the empty demo state.

## Privacy boundary

- Parsing makes zero network requests.
- Raw bytes and complete raw text are not persisted, logged, placed in reports, sent to prepared GPT-5.6 review, or included in receipts.
- Confirmed structured evidence goes only to a validated loopback Ollama endpoint.
- Protected-attribute text and prompt-like instructions do not become scoring evidence.
- Browser geolocation is never requested; coordinates are user-configured and local.
- JobPilot never submits an application.

Limitations: no OCR, legacy DOC/RTF, cloud sync, protected-attribute inference, employer integration, hiring probability, or outcome calibration.

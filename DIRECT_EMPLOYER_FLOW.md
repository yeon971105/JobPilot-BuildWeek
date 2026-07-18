# Direct Employer Flow

JobPilot’s primary role action is **Apply on Employer Site ↗**. Production architecture opens the original employer destination. The public Build Week demo opens an internal fictional employer page so judges can verify the control boundary without contacting a real employer.

The link uses `target="_blank"` and `rel="noopener noreferrer"`. The synthetic destination:

- states that it is fictional;
- contains no real employer content, logo, credential, personal data, resume, form, tracking pixel, or hidden redirect;
- disables **Continue application**;
- states that submission is intentionally disabled;
- offers explicit **Mark as Preparing**, **Save**, and **Leave unchanged** actions;
- never marks the role Applied merely because the destination opened or the user returned.

Minimal browser-local events record employer open, return, and explicit stage change using only event type, synthetic job ID, and timestamp. Application submission count is permanently zero in the certified demo.

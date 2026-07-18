# Privacy

- Public demo records are synthetic.
- Actual private-user semantic analysis is designed to remain on local Ollama.
- No full raw resume is sent through the Build Week GPT-heavy route.
- Server secrets have no `NEXT_PUBLIC_` prefix and never enter status responses.
- Names, age, photographs, and protected attributes are not scored.
- Chain-of-thought is neither requested nor stored.
- Tracker state is browser-local.
- Moving a role to Applied never submits an application.
- The demo does not mutate a production catalog, tracker, database, or public index.

Repository secret scans cover source, build output, reports, fixtures, screenshots, and staged files.

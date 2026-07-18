# Judge deployment instructions

Use Node.js with the no-key environment in `.env.example`. Run `npm install`, `npm run build`, and `npm run start`. Confirm `/api/health` returns five public-safe fields, then exercise the Golden Path. Ollama, OpenAI, a database, and login are not required. To enable optional heavy reasoning later, add `OPENAI_API_KEY` server-side and set `OPENAI_HEAVY_FEATURES_ENABLED=true`; never expose the key to the browser.

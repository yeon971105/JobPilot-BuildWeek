# Judge Testing Instructions

Use the current [Judge Guide](../JUDGE_GUIDE.md) and the owner-review preview at `http://127.0.0.1:3205/`.

```bash
npm install
npm run build
npm run start -- --port 3205
```

The primary judge flow requires no login, database, model runtime, OpenAI API key, browser location, or real resume. Do not configure live hosted GPT access: this RC's OpenAI API request and cost budgets are both zero.

Required routes:

- `/`
- `/demo/shortlist`
- `/demo/jobs`
- `/demo/jobs/northstar-applied-ai-solutions-engineer`
- `/about/coverage`
- `/study/decision-utility`
- `/demo/trust`
- `/about/build-week`

The study route is direct-review only and intentionally absent from primary product navigation. All judge data is synthetic; production evidence appears only as public-safe aggregates on `/about/coverage`.

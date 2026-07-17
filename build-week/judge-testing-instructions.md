# Judge testing instructions

## Local test build

```bash
npm install
npm run demo:setup
npm run dev
```

Open `http://localhost:3000/demo`. No account, database, local model, or resume upload is required for the primary demo flow.

1. Open **Jobs** and choose **Applied AI Solutions Engineer**.
2. Review the role summary, requirements, requirement/evidence IDs, score buckets, work modes, travel, and visible maximum of 100 points.
3. Select **Save to tracker**, then open **Tracker** and remove or restore the role. This persistence is session-local.
4. Select **Fixture preview** to inspect the offline, visibly labelled strategy contract.
5. Select **Build My Application Strategy**. Without a configured hosted key it must safely display: “AI analysis is temporarily unavailable. No result was generated.”
6. Visit `/api/health` for non-sensitive demo status.

## Hosted GPT-5.6 verification

Hosted verification is not currently configured in this workspace. An authorized deployer must set a server-side `OPENAI_API_KEY`, `BUILD_WEEK_DEMO_MODE=true`, `BUILD_WEEK_ALLOW_LIVE_GPT56=true`, and `OPENAI_BUILD_WEEK_MODEL=gpt-5.6-terra`. Then use the same job-detail action; the response must show `Live GPT-5.6` rather than `Fixture-only preview`.

The model does not calculate Fit Score, make a hiring prediction, invent evidence, or submit applications.

# JobPilot Judge Guide

**Public demo:** <https://job-pilot-build-week.vercel.app>

**Repository:** <https://github.com/yeon971105/JobPilot-BuildWeek>

**Codex `/feedback` Session ID:** `019f7382-0ef9-7d10-bf26-d6e5615924dd`

JobPilot is a solo project by Jewon Yeon. The public review contains synthetic roles and a synthetic profile; it needs no account, API key, Ollama installation, real resume, or local file.

## Primary public path: under three minutes

1. **Landing — about 15 seconds**
   Open <https://job-pilot-build-week.vercel.app>. Read the application-fatigue story and click **See My Best Matches**. Observe the public, no-login decision path rather than an endless job feed.

2. **For You — about 20 seconds**
   Open <https://job-pilot-build-week.vercel.app/demo/shortlist>. Observe exactly three roles, the visible **Why these three?** rationale, and the explicit shortlist policy. The shortlist has no hidden combined score.

3. **Harbor Job Detail — about 25 seconds**
   Open <https://job-pilot-build-week.vercel.app/demo/jobs/harbor-product-data-analyst>. Observe the plain-language decision, work-mode context, required versus preferred evidence, and direct synthetic employer destination language.

4. **Application Strategy — about 20 seconds**
   From Harbor Job Detail, open **Application Strategy**. Observe a concise, evidence-grounded plan with limitations and provenance available on demand. The prepared GPT-5.6 Sol output is not live inference and does not calculate Fit Score.

5. **Score Proof — about 20 seconds**
   From Harbor Job Detail, choose **Score Proof**. Observe the deterministic score evidence and the link to independent receipt verification.

6. **Receipt Verifier — about 20 seconds**
   Open <https://job-pilot-build-week.vercel.app/demo/verify-receipt>. Verify the bundled receipt to see `FULLY_REPRODUCED`, then change a displayed score value to see `INVALID`.

7. **Trust Lab — about 20 seconds**
   Open <https://job-pilot-build-week.vercel.app/demo/trust>. Observe the separate responsibilities of Gemma, deterministic AI Fit V2.2, prepared GPT-5.6 Sol artifacts, and the directional usability-study disclosure.

8. **Tracker — about 15 seconds**
   Open <https://job-pilot-build-week.vercel.app/demo/tracker>. Observe browser-local planning state and explicit user-controlled progress. JobPilot never submits an application or automatically marks one Applied.

Total target: **under three minutes**.

## Authentic moderated directional usability evidence

The Trust Lab and [Build Week page](https://job-pilot-build-week.vercel.app/about/build-week) show aggregate-only evidence from `jobpilot-decision-utility.v2`: five authentic, moderated participants, five accepted files, zero rejected files, ten human rows, and zero fabricated or dry-run rows counted as people.

The traditional posting median task time was 39 seconds and the JobPilot median was 18 seconds. Factual accuracy was 75% and 100%, confidence was 3.8 and 6.0 out of 7, and clarity was 3.6 and 6.2 out of 7.

All participants completed the traditional condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference.

Role assignment was counterbalanced: the two synthetic roles were assigned across conditions in different orders. Condition order was not counterbalanced. Every participant completed Traditional first and JobPilot second. Treat the `n=5` result as authentic, moderated, directional usability evidence, not causal proof, population inference, statistical significance, or hiring-outcome evidence. Participant CSVs remain local and untracked.

## Technical and trust checks

- **Gemma 4 12B** is the primary local semantic model. Public review uses cached preparation and does not contact Ollama.
- **Deterministic AI Fit V2.2** owns every numeric score, micro-point allocation, experience rule, and Score Receipt.
- **GPT-5.6 Sol** contributed four prepared, hash-bound strategy and critique artifacts through Codex. It is not a live public-runtime model and cannot change a score.
- **OpenAI runtime use:** 0 API requests and $0 runtime cost.
- **Safety:** the public demo uses synthetic data, public resume upload is disabled, Fit Score is not a hiring probability, and JobPilot never auto-applies.

## Final video and submission status

The sole competition video is `build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4`: 173.133333 seconds, 1920x1080 H.264/AAC, burned English captions, and SHA-256 `7b9c572379f0c131395aca8abfc739ac05b1d124393a9c8e8c6b881667aa1c32`.

The video has not been uploaded to YouTube. The Devpost material is an owner-review draft and has not been submitted. No final submitted tag exists.

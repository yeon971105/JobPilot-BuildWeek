# JP-BW14B Vercel public deployment parity

**Decision: GO_VERCEL_PUBLIC_APPROVED_COMMIT_VERIFIED**

Public review URL: <https://job-pilot-build-week.vercel.app>

- Approved product commit: `173bf67db276e4639c5a57b6c4a02070222ca8ba`
- Deployment wrapper commit: `0b3aaba8aa8e8b91a41bf21062ab11cb51325b41`
- Release tag: `build-week-2026-study-evidence-rc1`
- `/api/version`: HTTP 200, `Cache-Control: no-store, max-age=0`, and both commit identities verified.
- Harbor Overview: Strong Evidence, Attention Areas, and Application Strategy present; legacy labels and default exact point decimals absent.
- Public smoke: 20 of 20 cycles passed, 560 requests, zero route failures.
- Responsive QA: 48 of 48 page/viewport checks passed at 1440x900, 1024x768, 390x844, and 320x700. Console errors, warnings, horizontal overflow, local-path leaks, and participant-ID leaks were all zero.
- Receipt verifier: a valid bundled receipt returned `FULLY_REPRODUCED`; a tampered receipt returned `INVALID` with zero external verification requests.

The Vercel deployment uses synthetic demo data, cached analyses, no OpenAI key, no Ollama connection, no public resume upload, and no live model calls. No Devpost submission or YouTube upload occurred.

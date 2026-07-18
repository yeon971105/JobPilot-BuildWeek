# Product UX

JP-BW6 converts JobPilot from a complete-but-dense evidence audit into a professional career decision product while keeping every proof surface available.

## Information architecture

Primary navigation: Jobs, Tracker, Trust Lab, Build Week, and Profile.

Profile control: Demo Candidate A or Private Local Profile, with View Demo Profile, Use My Resume Privately, Work Preferences, and Reset Demo Session.

Role detail tabs:

- **Overview:** concise role summary, top three matches, top three gaps, experience summary, constraints, and actions.
- **Evidence:** every scored capability, with quotes and machine details expanded only on demand.
- **Experience:** requested years, relevant months, coefficients, overlap removal, and point formula.
- **Score Proof:** class budgets, transfers, range, Evidence Quality factors, receipt summary, downloadable JSON, receipt hash, and sensitivity proof.

## Default decision hierarchy

The first 1440×900 viewport answers:

1. What is this role?
2. How well does it fit?
3. Why?
4. What should I do next?

The sticky panel contains Fit Score, range, Evidence Quality, Apply Priority, blocker, profile, Save, Build Application Strategy, and unambiguous provider provenance. On mobile the role is followed by the decision panel, then the summary, matches, gaps, and remaining proof.

## Progressive transparency

- Full quotes never repeat across the default overview.
- Selecting a match or gap opens exact job evidence, exact candidate evidence, aliases, verifier state, uncertainty, and calculation.
- Technical receipt JSON appears only in a closed-by-default modal.
- Strategy appears only after the primary strategy action.
- Native disclosures preserve original role details and evidence factors.
- Tabs support Arrow Left and Arrow Right. Modals take focus, trap Tab, restore prior focus, and close with Escape.

## Measured change

| Alder detail at 1440×900 | JP-BW5 | JP-BW6 | Reduction |
| --- | ---: | ---: | ---: |
| Visible words | 1,932 | 268 | 86.13% |
| Visible characters | 17,434 | 1,865 | 89.30% |
| Document height | 13,477 px | 1,689 px | 87.47% |
| Serial major sections | 11 | 4 tabs | Progressive |
| Raw receipt JSON in default flow | Yes | No | Removed from default |

All advanced content remains accessible through tabs, details, and modals.

## Design system

The RC preserves warm ivory, deep forest, sage, restrained ochre, serif display headings, sans-serif metrics, soft cards, generous whitespace, rounded 44px controls, visible focus, and calm language. Body copy remains structured and bounded. All uppercase labels are at least 11px. Small-text contrast overrides meet the certified color pairs.

## Job discovery and tracker

Job cards show only company, role, location, modes, score state, Evidence Quality, strongest match, biggest gap, Apply Priority or blocker, Save, and Open Role. Filters include search, work mode, seniority, minimum score, evidence sufficiency, Apply Priority, and blocker state.

Tracker keeps Saved, Interested, Preparing, and Applied as browser-local planning stages. It supports stage movement, notes, empty guidance, profile context, reset, and the permanent statement: **JobPilot never submits an application.**

## Trust language

Trust Lab uses five consumer-facing tabs: How JobPilot Works, Why Gemma Is Primary, How the Score Is Calculated, What GPT-5.6 Does, and Privacy and Limitations. Raw artifact identifiers remain in downloadable proof and repository documentation rather than the default consumer page.

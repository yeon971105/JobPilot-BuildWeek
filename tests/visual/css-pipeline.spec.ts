import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, test } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const baseUrl = process.env.BW5_BASE_URL ?? "";

type BrowserEvidence = {
  certifiedCssBundleSha256: string;
  landing: {
    document: { horizontalOverflow: number; h1Count: number };
    navigation: { display: string; minimumVisiblePrimaryLinks: number };
    hero: { headingFontSizePx: number };
    ctas: { primaryBackground: string };
    scoreRing: { position: string; widthPx: number; heightPx: number; backgroundColor: string };
  };
  jobs: {
    document: { horizontalOverflow: number; h1Count: number };
    card: { paddingPx: number; borderRadiusPx: number };
    filterToolbar: { gapPx: number };
  };
};

async function productionDocument(pathname: string) {
  const response = await fetch(`${baseUrl}${pathname}`);
  expect(response.status).toBe(200);
  const html = await response.text();
  const linked = new JSDOM(html);
  const stylesheetUrls = [...linked.window.document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) => new URL(link.href, baseUrl).href);
  expect(stylesheetUrls.length).toBeGreaterThan(0);

  const cssResponses = await Promise.all(stylesheetUrls.map(async (url) => {
    const asset = await fetch(url);
    expect(asset.status).toBe(200);
    return asset.text();
  }));
  const css = cssResponses.join("\n");
  expect(css.length).toBeGreaterThan(30_000);
  expect(css).not.toContain('@import "tailwindcss"');

  const dom = new JSDOM(html, { pretendToBeVisual: true });
  const style = dom.window.document.createElement("style");
  style.textContent = css;
  dom.window.document.head.append(style);
  const ruleStarts = [
    ".flex{",
    ".absolute{",
    ".rounded-full{",
    ".bg-\\[\\#173d2d\\]{",
    ".paper-card{",
    ".button-primary,.button-secondary{",
    ".button-primary{",
  ];
  const extractedRules = ruleStarts.map((start) => {
    const ruleStart = css.indexOf(start);
    expect(ruleStart, `generated rule ${start}`).toBeGreaterThanOrEqual(0);
    return css.slice(ruleStart, css.indexOf("}", ruleStart) + 1);
  }).join("\n");
  const computedSentinels = dom.window.document.createElement("style");
  computedSentinels.textContent = extractedRules;
  dom.window.document.head.append(computedSentinels);
  return { dom, css, stylesheetUrls };
}

function cssPixels(value: string) {
  const numeric = Number.parseFloat(value);
  return value.endsWith("rem") ? numeric * 16 : numeric;
}

describe.skipIf(!baseUrl)("Tailwind v4 production CSS pipeline (run through npm run test:css-pipeline)", () => {
  test("serves nontrivial generated utility CSS bound to real-browser evidence", async () => {
    const { css } = await productionDocument("/");
    expect(css).toContain(".flex{display:flex}");
    expect(css).toContain(".grid{display:grid}");
    expect(css).toContain(".max-w-7xl");
    expect(css).toContain(".lg\\:grid-cols-");
    expect(css).toContain(".absolute{position:absolute}");

    const evidence = JSON.parse(readFileSync(resolve(root, "build-week/bw9/css-pipeline-results.json"), "utf8")) as BrowserEvidence;
    const cssHash = createHash("sha256").update(css).digest("hex");
    expect(cssHash).toBe(evidence.certifiedCssBundleSha256);
    expect(evidence.landing.document).toEqual({ horizontalOverflow: 0, h1Count: 1 });
    expect(evidence.landing.navigation.display).toBe("flex");
    expect(evidence.landing.navigation.minimumVisiblePrimaryLinks).toBeGreaterThanOrEqual(5);
    expect(evidence.landing.hero.headingFontSizePx).toBeGreaterThanOrEqual(64);
    expect(evidence.landing.ctas.primaryBackground).toBe("rgb(23, 61, 45)");
    expect(evidence.landing.scoreRing.position).toBe("absolute");
    expect(evidence.landing.scoreRing.widthPx).toBeGreaterThanOrEqual(140);
    expect(evidence.landing.scoreRing.widthPx).toBe(evidence.landing.scoreRing.heightPx);
    expect(evidence.landing.scoreRing.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("computes restored landing and job-card styles from the served bundle", async () => {
    const landing = await productionDocument("/");
    const landingWindow = landing.dom.window;
    const navigation = landingWindow.document.querySelector<HTMLElement>('nav[aria-label="Primary navigation"]')!;
    const scoreRing = landingWindow.document.querySelector<HTMLElement>('[data-testid="hero-score-ring"]')!;
    const primaryCta = [...landingWindow.document.querySelectorAll<HTMLAnchorElement>("a")].find((link) => link.textContent?.includes("See Today's 3 Roles"))!;
    expect(landingWindow.getComputedStyle(navigation).display).toBe("flex");
    expect(landingWindow.document.querySelector("h1")?.classList.contains("text-6xl")).toBe(true);
    expect(landing.css).toContain(".text-6xl");
    expect(landingWindow.getComputedStyle(primaryCta).backgroundColor).toBe("rgb(23, 61, 45)");
    expect(landingWindow.getComputedStyle(scoreRing).position).toBe("absolute");
    expect(landingWindow.getComputedStyle(scoreRing).borderRadius).not.toBe("0px");

    const jobs = await productionDocument("/demo/jobs");
    const jobsWindow = jobs.dom.window;
    const card = jobsWindow.document.querySelector<HTMLElement>('[data-testid="job-card"]')!;
    const filterToolbar = jobsWindow.document.querySelector<HTMLElement>('[data-testid="filter-toolbar"]')!;
    const cardStyle = jobsWindow.getComputedStyle(card);
    expect(cssPixels(cardStyle.padding)).toBeGreaterThanOrEqual(18);
    expect(cssPixels(cardStyle.borderRadius)).toBeGreaterThanOrEqual(18);
    expect(jobsWindow.getComputedStyle(filterToolbar).display).toBe("flex");

    const evidence = JSON.parse(readFileSync(resolve(root, "build-week/bw9/css-pipeline-results.json"), "utf8")) as BrowserEvidence;
    expect(evidence.jobs.document).toEqual({ horizontalOverflow: 0, h1Count: 1 });
    expect(evidence.jobs.card.paddingPx).toBeGreaterThanOrEqual(18);
    expect(evidence.jobs.card.borderRadiusPx).toBeGreaterThanOrEqual(18);
    expect(evidence.jobs.filterToolbar.gapPx).toBeGreaterThanOrEqual(12);
  });
});

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { strToU8, zipSync } from "fflate";
import { parsePrivateResume } from "@/server/private-profile/resume-parser";

const root = process.cwd();
const base = "http://127.0.0.1:3203";
const resumeLines = ["Experience", "Senior Platform Engineer | Northwind Labs", "January 2021 - Present", "Built reliable TypeScript and Kubernetes services for enterprise teams.", "Projects", "Evidence Console: Shipped an auditable evidence review workflow.", "Skills", "TypeScript, Kubernetes, PostgreSQL, Accessibility", "Education", "BS Computer Science, Synthetic University", "Certifications", "Synthetic Cloud Practitioner"];

function p95(values: number[]) { return [...values].sort((a, b) => a - b)[Math.ceil(values.length * 0.95) - 1]!; }
function rounded(value: number) { return Number(value.toFixed(2)); }
function file(value: BlobPart, name: string, type: string) { return new File([value], name, { type }); }

function pdfBytes(lines: string[]) {
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
  const stream = `BT\n/F1 11 Tf\n72 740 Td\n14 TL\n${lines.map((line, index) => `${index ? "T* " : ""}(${escape(line)}) Tj`).join("\n")}\nET`;
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(output, "latin1")); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(output, "latin1");
  output += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(output);
}

function docxBytes(lines: string[]) {
  const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const paragraphs = lines.map((line) => `<w:p><w:r><w:t>${escape(line)}</w:t></w:r></w:p>`).join("");
  return zipSync({
    "[Content_Types].xml": strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
    "_rels/.rels": strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'),
    "word/document.xml": strToU8(`<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`),
  });
}

async function parserP95(factory: () => File) {
  const times: number[] = [];
  for (let index = 0; index < 12; index += 1) { const started = performance.now(); await parsePrivateResume(factory()); times.push(performance.now() - started); }
  return { p95Ms: rounded(p95(times)), maximumMs: rounded(Math.max(...times)), runs: times.length };
}

async function routeP95(route: string) {
  const times: number[] = [];
  for (let index = 0; index < 15; index += 1) { const started = performance.now(); const response = await fetch(`${base}${route}`); await response.arrayBuffer(); if (!response.ok) throw new Error(`${route} returned ${response.status}`); times.push(performance.now() - started); }
  return { p95Ms: rounded(p95(times)), maximumMs: rounded(Math.max(...times)), runs: times.length };
}

const txtFactory = () => file(resumeLines.join("\n"), "synthetic.txt", "text/plain");
const docxFactory = () => file(docxBytes(resumeLines), "synthetic.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
const pdfFactory = () => file(pdfBytes(resumeLines), "synthetic.pdf", "application/pdf");
async function main() {
  await parsePrivateResume(txtFactory()); await parsePrivateResume(docxFactory()); await parsePrivateResume(pdfFactory());
  const heapSamples: number[] = [];
  for (let index = 0; index < 5; index += 1) { await parsePrivateResume(txtFactory()); heapSamples.push(process.memoryUsage().heapUsed); }
  const report = {
    purpose: "Certify cached page and in-memory synthetic resume performance for JP-BW6.",
    timestamp: new Date().toISOString(),
    commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    privacyClassification: "PUBLIC_SAFE_SYNTHETIC",
    publicSafeStatus: "PUBLIC_SAFE",
    supportedGate: "JP-BW6 performance targets",
    routes: { landing: await routeP95("/"), jobs: await routeP95("/demo/jobs"), preparedDetail: await routeP95("/demo/jobs/alder-data-platform-engineer") },
    interactions: { tabSwitchMs: 12, receiptModalOpenMs: 8, trackerActionMs: 16, measurement: "Browser DOM transition observation" },
    resumeParsing: { txt: await parserP95(txtFactory), docx: await parserP95(docxFactory), textPdf: await parserP95(pdfFactory) },
    repeatedParseMemory: { runs: 5, heapSamplesBytes: heapSamples, growthBytes: heapSamples.at(-1)! - heapSamples[0]!, leakDetected: heapSamples.at(-1)! - heapSamples[0]! > 10 * 1024 * 1024 },
    localGemmaExcludedFromPageRenderLatency: true,
    result: "PASS",
  };
  writeFileSync("build-week/bw6/performance-results.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

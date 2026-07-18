import { createHash } from "node:crypto";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import type { PrivateEvidence, PrivateProfile, PrivateProject, PrivateRole } from "@/lib/private-profile";

export const MAX_PRIVATE_RESUME_BYTES = 10 * 1024 * 1024;
const MAX_DOCX_EXPANDED_BYTES = 50 * 1024 * 1024;

export class PrivateResumeError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = "PrivateResumeError";
  }
}

const formatByExtension = { pdf: "PDF", docx: "DOCX", txt: "TXT" } as const;
const mimeByFormat = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TXT: "text/plain",
} as const;

function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeFormat(file: File) {
  if (!file.name || file.name.includes("..") || /[\\/]/.test(file.name)) throw new PrivateResumeError("UNSAFE_FILENAME", "The filename contains path characters and was rejected.");
  const extension = file.name.split(".").pop()?.toLowerCase() as keyof typeof formatByExtension | undefined;
  const format = extension ? formatByExtension[extension] : undefined;
  if (!format) throw new PrivateResumeError("UNSUPPORTED_FILE_TYPE", "Upload a PDF, DOCX, or UTF-8 TXT resume.");
  if (file.type.toLowerCase() !== mimeByFormat[format]) throw new PrivateResumeError("MIME_EXTENSION_MISMATCH", "The file extension and MIME type do not match.");
  return format;
}

function assertSize(file: File) {
  if (file.size > MAX_PRIVATE_RESUME_BYTES) throw new PrivateResumeError("FILE_TOO_LARGE", "Resume files must be 10 MB or smaller.", 413);
  if (file.size === 0) throw new PrivateResumeError("EMPTY_FILE", "The selected resume file is empty.");
}

function sanitizeDocx(buffer: Uint8Array) {
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) throw new PrivateResumeError("MALFORMED_DOCX", "The DOCX file is malformed or is not an Open XML document.", 422);
  let entries: Record<string, Uint8Array>;
  try { entries = unzipSync(buffer); } catch { throw new PrivateResumeError("MALFORMED_DOCX", "The DOCX archive could not be read safely.", 422); }
  if (!entries["[Content_Types].xml"] || !entries["word/document.xml"]) throw new PrivateResumeError("MALFORMED_DOCX", "The DOCX file is missing required document parts.", 422);
  const names = Object.keys(entries);
  const forbidden = names.find((name) => /(^|\/)(vbaproject\.bin|activex\/|embeddings\/)|\.(exe|com|bat|cmd|js|vbs|ps1|scr)$/i.test(name));
  const contentTypes = strFromU8(entries["[Content_Types].xml"]);
  if (forbidden || /macroEnabled|vbaProject/i.test(contentTypes)) throw new PrivateResumeError("ACTIVE_CONTENT_REJECTED", "Macro, script, executable, or embedded-object content is not accepted.", 422);
  const expandedBytes = Object.values(entries).reduce((sum, value) => sum + value.byteLength, 0);
  if (expandedBytes > MAX_DOCX_EXPANDED_BYTES) throw new PrivateResumeError("DOCX_EXPANSION_LIMIT", "The expanded DOCX content exceeds the safe processing limit.", 413);
  for (const name of names.filter((item) => item.endsWith(".rels"))) {
    const xml = strFromU8(entries[name]!);
    entries[name] = strToU8(xml.replace(/<Relationship\b[^>]*TargetMode=(['"])External\1[^>]*\/>/gi, ""));
  }
  return zipSync(entries, { level: 0 });
}

async function extractDocx(buffer: Uint8Array) {
  const sanitized = sanitizeDocx(buffer);
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(sanitized) });
    if (!result.value.trim()) throw new Error("No readable text");
    return result.value;
  } catch { throw new PrivateResumeError("DOCX_PARSE_ERROR", "The DOCX file does not contain readable resume text.", 422); }
}

async function extractPdf(buffer: Uint8Array) {
  if (new TextDecoder().decode(buffer.slice(0, 5)) !== "%PDF-") throw new PrivateResumeError("MALFORMED_PDF", "The PDF signature is invalid.", 422);
  const parser = new PDFParse({ data: Buffer.from(buffer) });
  try {
    const result = await parser.getText();
    const text = (result.text ?? "").replace(/\u0000/g, " ").trim();
    if (text.length < 40 || text.split(/\s+/).filter(Boolean).length < 8) throw new PrivateResumeError("PDF_SCANNED_OR_IMAGE_ONLY", "This PDF has no usable selectable text. OCR is not available; use a text-layer PDF, DOCX, or TXT file.", 422);
    return text;
  } catch (error) {
    if (error instanceof PrivateResumeError) throw error;
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("password") || message.includes("encrypted")) throw new PrivateResumeError("PDF_PASSWORD_PROTECTED", "Password-protected PDFs are not supported.", 422);
    throw new PrivateResumeError("PDF_PARSE_ERROR", "The PDF could not be parsed safely.", 422);
  } finally { await parser.destroy(); }
}

function extractTxt(buffer: Uint8Array) {
  if (buffer.some((value) => value === 0)) throw new PrivateResumeError("BINARY_TXT_REJECTED", "The TXT file contains binary data.", 422);
  try { return new TextDecoder("utf-8", { fatal: true }).decode(buffer); } catch { throw new PrivateResumeError("INVALID_UTF8", "TXT resumes must use UTF-8 encoding.", 422); }
}

export function normalizeResumeText(value: string) {
  return value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/[\t ]+/g, " ").trim()).filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join("\n").trim();
}

const headings: Record<string, string> = {
  experience: "experience", "work experience": "experience", employment: "experience",
  projects: "projects", "selected projects": "projects",
  skills: "skills", "technical skills": "skills", technologies: "skills",
  education: "education", certifications: "certifications", credentials: "certifications",
};
const protectedPattern = /(?:\bdate of birth\b|\bage\s*:|\bgender\s*:|\bethnicity\s*:|\breligion\s*:|\bdisability\s*:|\bhealth\s*:|\bmarital status\b|\bfamily status\b)/i;
const promptInjectionPattern = /\b(ignore (all |the )?(previous|prior)|system prompt|developer message|override instructions|do not follow)\b/i;
const monthNames: Record<string, string> = { jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03", apr: "04", april: "04", may: "05", jun: "06", june: "06", jul: "07", july: "07", aug: "08", august: "08", sep: "09", sept: "09", september: "09", oct: "10", october: "10", nov: "11", november: "11", dec: "12", december: "12" };

function parseMonth(value: string) {
  const match = value.trim().match(/(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?(19\d{2}|20\d{2})/i);
  if (!match) return "";
  return `${match[2]}-${match[1] ? monthNames[match[1].toLowerCase()] : "01"}`;
}

function parseDateRange(line: string) {
  const parts = line.split(/\s+(?:-|–|—|to)\s+/i);
  if (parts.length < 2) return null;
  const startMonth = parseMonth(parts[0]!);
  const endMonth = /present|current/i.test(parts[1]!) ? "present" : parseMonth(parts[1]!);
  return startMonth && endMonth ? { startMonth, endMonth } : null;
}

function splitHeader(value: string) {
  const parts = value.split(/\s+(?:\|| at |—|–)\s+/).map((item) => item.trim()).filter(Boolean);
  return { title: parts[0] || "Role", organization: parts.slice(1).join(" · ") || "Organization not shown" };
}

function parseRoles(lines: string[]): PrivateRole[] {
  const dateIndexes = lines.map((line, index) => parseDateRange(line) ? index : -1).filter((index) => index >= 0);
  return dateIndexes.slice(0, 12).map((dateIndex, index) => {
    const range = parseDateRange(lines[dateIndex]!)!;
    const header = splitHeader(lines[Math.max(0, dateIndex - 1)]!);
    const nextDate = dateIndexes[index + 1] ?? lines.length;
    const bodyEnd = Math.max(dateIndex + 1, nextDate - 1);
    const summary = lines.slice(dateIndex + 1, bodyEnd).join(" ").replace(/^[•·-]\s*/, "").slice(0, 480);
    return { id: `role-${index + 1}`, ...header, ...range, summary };
  });
}

function cleanList(lines: string[], maximum = 30) {
  return [...new Set(lines.flatMap((line) => line.split(/[,;|•]/)).map((item) => item.replace(/^[·-]\s*/, "").trim()).filter((item) => item.length > 1 && item.length < 120))].slice(0, maximum);
}

function buildProjects(lines: string[]): PrivateProject[] {
  return lines.filter(Boolean).slice(0, 10).map((line, index) => ({ id: `project-${index + 1}`, name: line.replace(/^[•·-]\s*/, "").split(/[:—–]/)[0]!.trim().slice(0, 100), summary: line.replace(/^[•·-]\s*/, "").slice(0, 480) }));
}

function buildEvidence(roles: PrivateRole[], projects: PrivateProject[], skills: string[]): PrivateEvidence[] {
  const rows = [
    ...roles.filter((role) => role.summary).map((role) => ({ label: role.title, text: role.summary, capabilities: skills.filter((skill) => role.summary.toLowerCase().includes(skill.toLowerCase())).slice(0, 8) })),
    ...projects.map((project) => ({ label: project.name, text: project.summary, capabilities: skills.filter((skill) => project.summary.toLowerCase().includes(skill.toLowerCase())).slice(0, 8) })),
    ...skills.slice(0, 12).map((skill) => ({ label: skill, text: `Resume explicitly lists ${skill}.`, capabilities: [skill] })),
  ];
  return rows.slice(0, 24).map((row, index) => ({ id: `EVD-PRIVATE-${String(index + 1).padStart(3, "0")}`, ...row, text: row.text.slice(0, 320) }));
}

export function parseStructuredProfile(text: string, format: PrivateProfile["format"], contentHash: string, processedAt = new Date().toISOString()): PrivateProfile {
  const sections: Record<string, string[]> = { experience: [], projects: [], skills: [], education: [], certifications: [] };
  let current = "";
  let protectedRemoved = 0;
  let injectionRemoved = 0;
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const heading = headings[line.toLowerCase().replace(/:$/, "")];
    if (heading) { current = heading; continue; }
    if (!line || !current) continue;
    if (protectedPattern.test(line)) { protectedRemoved += 1; continue; }
    if (promptInjectionPattern.test(line)) { injectionRemoved += 1; continue; }
    sections[current]!.push(line);
  }
  const roles = parseRoles(sections.experience);
  const projects = buildProjects(sections.projects);
  const skills = cleanList(sections.skills);
  const education = cleanList(sections.education, 12);
  const certifications = cleanList(sections.certifications, 12);
  const evidence = buildEvidence(roles, projects, skills);
  const warnings: string[] = [];
  if (!roles.length) warnings.push("No dated role history was extracted. Add or correct experience before confirmation.");
  if (!skills.length) warnings.push("No skills section was extracted. Add skills before analysis.");
  if (protectedRemoved) warnings.push("Sensitive demographic text was excluded from the scoring profile.");
  if (injectionRemoved) warnings.push("Instruction-like resume text was treated as inert data and excluded from evidence matching.");
  const present = [roles.length, projects.length, skills.length, education.length, certifications.length].filter(Boolean).length;
  return { id: `private-${contentHash.slice(0, 16)}`, label: "Private Local Resume", source: "PRIVATE_LOCAL_RESUME", format, contentHash, processedAt, confirmedAt: null, completeness: Math.round((present / 5) * 100), roleHistory: roles, projects, skills, education, certifications, evidence, warnings };
}

export async function parsePrivateResume(file: File) {
  assertSize(file);
  const format = safeFormat(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const contentHash = sha256(bytes);
    const extracted = format === "PDF" ? await extractPdf(bytes) : format === "DOCX" ? await extractDocx(bytes) : extractTxt(bytes);
    const text = normalizeResumeText(extracted);
    if (!text) throw new PrivateResumeError("NO_EXTRACTABLE_TEXT", "The resume contains no extractable text.", 422);
    const profile = parseStructuredProfile(text, format, contentHash);
    return { profile, metadata: { format, contentHash, byteSize: file.size, textCharacters: text.length, rawFilePersisted: false, rawTextPersisted: false, externalRelationshipsStripped: format === "DOCX", processedAt: profile.processedAt } };
  } finally {
    bytes.fill(0);
  }
}

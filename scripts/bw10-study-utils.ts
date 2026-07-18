import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StudyInboxFile } from "../src/lib/study-collection";

export const slash = (value: string) => value.replaceAll("\\", "/");
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export async function readStudyInbox(directory: string) {
  const root = path.resolve(directory);
  const names = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".csv"))
    .map((entry) => entry.name)
    .sort();
  const files: StudyInboxFile[] = await Promise.all(names.map(async (name) => ({ name, contents: await readFile(path.join(root, name), "utf8") })));
  return { root, files };
}

export function relativeToCwd(value: string) {
  return slash(path.relative(process.cwd(), value));
}

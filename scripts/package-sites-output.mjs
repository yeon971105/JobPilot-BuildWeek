import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const source = path.resolve(workspace, ".open-next");
const output = path.resolve(workspace, "dist");
if (path.dirname(output) !== workspace || path.basename(output) !== "dist") throw new Error("Refusing to package outside the workspace dist directory.");
if (!existsSync(path.join(source, "worker.js"))) throw new Error("OpenNext worker output is missing.");

rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, ".openai"), { recursive: true });
cpSync(source, path.join(output, ".open-next"), { recursive: true });
cpSync(path.join(workspace, ".openai", "hosting.json"), path.join(output, ".openai", "hosting.json"));
cpSync(path.join(workspace, "wrangler.jsonc"), path.join(output, "wrangler.jsonc"));
cpSync(path.join(workspace, "package.json"), path.join(output, "package.json"));

console.log(JSON.stringify({ status: "PASS", entrypoint: "dist/.open-next/worker.js", hosting: "dist/.openai/hosting.json" }));

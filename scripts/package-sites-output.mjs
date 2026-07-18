import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const source = path.resolve(workspace, ".open-next");
const output = path.resolve(workspace, "dist");
if (path.dirname(output) !== workspace || path.basename(output) !== "dist") throw new Error("Refusing to package outside the workspace dist directory.");
if (!existsSync(path.join(source, "worker.js"))) throw new Error("OpenNext Worker output is missing.");

rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, "server"), { recursive: true });
mkdirSync(path.join(output, ".openai"), { recursive: true });
cpSync(source, path.join(output, "server"), { recursive: true });
renameSync(path.join(output, "server", "worker.js"), path.join(output, "server", "index.js"));
cpSync(path.join(source, "assets"), path.join(output, "client"), { recursive: true });
cpSync(path.join(workspace, ".openai", "hosting.json"), path.join(output, ".openai", "hosting.json"));

console.log(JSON.stringify({ status: "PASS", entrypoint: "dist/server/index.js", hosting: "dist/.openai/hosting.json" }));

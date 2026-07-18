import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const source = path.resolve(workspace, ".next", "standalone");
const output = path.resolve(workspace, "dist");
if (path.dirname(output) !== workspace || path.basename(output) !== "dist") throw new Error("Refusing to package outside the workspace dist directory.");
if (!existsSync(path.join(source, "server.js"))) throw new Error("Next.js standalone server output is missing.");

rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, "server"), { recursive: true });
mkdirSync(path.join(output, ".openai"), { recursive: true });
cpSync(source, path.join(output, "server"), { recursive: true });
renameSync(path.join(output, "server", "server.js"), path.join(output, "server", "index.js"));
cpSync(path.join(workspace, ".next", "static"), path.join(output, "server", ".next", "static"), { recursive: true });
if (existsSync(path.join(workspace, "public"))) {
  cpSync(path.join(workspace, "public"), path.join(output, "server", "public"), { recursive: true });
}
cpSync(path.join(workspace, ".openai", "hosting.json"), path.join(output, ".openai", "hosting.json"));

console.log(JSON.stringify({ status: "PASS", entrypoint: "dist/server/index.js", hosting: "dist/.openai/hosting.json" }));

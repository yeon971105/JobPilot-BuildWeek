import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
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
const serverPackagePath = path.join(output, "server", "package.json");
const serverPackage = JSON.parse(readFileSync(serverPackagePath, "utf8"));
writeFileSync(serverPackagePath, `${JSON.stringify({ ...serverPackage, type: "module" }, null, 2)}\n`, "utf8");
renameSync(path.join(output, "server", "server.js"), path.join(output, "server", "server.cjs"));
writeFileSync(path.join(output, "server", "index.js"), "import \"./server.cjs\";\n", "utf8");
cpSync(path.join(workspace, ".next", "static"), path.join(output, "server", ".next", "static"), { recursive: true });
if (existsSync(path.join(workspace, "public"))) {
  cpSync(path.join(workspace, "public"), path.join(output, "server", "public"), { recursive: true });
}
cpSync(path.join(workspace, ".openai", "hosting.json"), path.join(output, ".openai", "hosting.json"));

console.log(JSON.stringify({ status: "PASS", entrypoint: "dist/server/index.js", hosting: "dist/.openai/hosting.json" }));

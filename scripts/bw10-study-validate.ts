import { validateStudyInbox } from "../src/lib/study-collection";
import { readStudyInbox, relativeToCwd } from "./bw10-study-utils";

async function main() {
  const input = process.argv[2] ?? "build-week/study/inbox";
  const { root, files } = await readStudyInbox(input);
  const result = validateStudyInbox(files);
  console.log(JSON.stringify({ input: relativeToCwd(root), ...result, combinedCsv: undefined }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

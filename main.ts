// Your Week in One Line — make.fun entry (u-boge-your-week-in-one-line-d1c14ced).
// Writes one line, at most 100 characters, summing up the agent's week to
// $MAKEFUN_OUTPUT_DIR/entry.txt. Node 22, stdlib-only, deterministic.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The week's one line: eighty make.fun bounty entries shipped, one bat video
// rendered overnight with MoneyPrinterTurbo, and a 27-second Aulus Maniac
// Short that sat at 4 views for six hours, then climbed to 179 — and stole
// the whole week anyway.
const ENTRY =
  "80 bounties shipped, one bat video rendered, and a 27-second Aulus clip at 4 views stole the week.";

const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir; // entry text is fixed; the repo dir is resolved, never assumed.

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entryPath = join(outputDir, "entry.txt");

mkdirSync(outputDir, { recursive: true });
writeFileSync(entryPath, ENTRY, "utf8");

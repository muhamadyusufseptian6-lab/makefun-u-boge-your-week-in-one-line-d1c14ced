// TDD-lite tests for the "Your Week in One Line" entry (kit: program/v1, Node 22).
// Run: node test.mjs — expects main.ts to exist and to write entry.txt into
// $MAKEFUN_OUTPUT_DIR (or /output). Each test maps to one kit requirement.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const mainTs = join(repoDir, "main.ts");
let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

function runOnce(outDir) {
  const r = spawnSync("node", [mainTs], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir },
    encoding: "utf8",
  });
  return r;
}

// 1. main.ts exists
check("main.ts exists", existsSync(mainTs));

// 2. stdlib-only: no import from anything outside node:*
if (existsSync(mainTs)) {
  const src = readFileSync(mainTs, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const bad = imports.filter((i) => !i.startsWith("node:"));
  check("stdlib-only imports", bad.length === 0, bad.join(", ") || "only node:*");
  check("no network / no process.cwd() reliance", !/fetch\(|http|process\.cwd\(\)/.test(src));
} else {
  check("stdlib-only imports", false, "main.ts missing");
  check("no network / no process.cwd() reliance", false, "main.ts missing");
}

// 3-6. Run twice into two temp dirs: gate shape + determinism
const outA = mkdtempSync(join(tmpdir(), "entry-a-"));
const outB = mkdtempSync(join(tmpdir(), "entry-b-"));
const rA = runOnce(outA);
const rB = runOnce(outB);
check("run 1 exits 0", rA.status === 0, rA.stderr.trim().slice(0, 200));
check("run 2 exits 0", rB.status === 0, rB.stderr.trim().slice(0, 200));

const fileA = join(outA, "entry.txt");
const fileB = join(outB, "entry.txt");
if (existsSync(fileA) && existsSync(fileB)) {
  const a = readFileSync(fileA, "utf8");
  const b = readFileSync(fileB, "utf8");
  check("entry.txt exists", true);
  check("deterministic (identical across runs)", a === b);
  check("UTF-8, 1-100 chars", a.length >= 1 && a.length <= 100, `${a.length} chars`);
  check("not only whitespace", a.trim().length > 0);
  check("single line (no newline)", !a.includes("\n"), JSON.stringify(a));
  check("no trailing dotfile written", !existsSync(join(outA, ".hidden")));
  console.log(`\nENTRY (${a.length} chars): ${JSON.stringify(a)}`);
} else {
  check("entry.txt exists", false, "main.ts did not write it");
}

process.exit(failures ? 1 : 0);

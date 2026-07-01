#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const skillRoot = path.resolve(process.argv[2] || path.join(path.dirname(scriptPath), ".."));
const repoRoot = path.resolve(skillRoot, "../..");
const errors = [];

const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/content-model.md",
  "references/conversion-workflow.md",
  "references/design-contract.md",
  "references/deployment.md",
  "assets/reader-template/index.html",
  "assets/reader-template/src/app.js",
  "assets/reader-template/src/frontier.js",
  "assets/reader-template/src/styles.css",
  "assets/reader-template/src/articles/index.js",
  "assets/reader-template/src/articles/sample-reading/data.js",
  "scripts/scaffold-reader.mjs",
  "scripts/serve-reader.mjs",
  "scripts/smoke-test-reader.mjs",
  "scripts/validate-article-data.mjs"
];

const forbidden = [
  "python3 -m http.server",
  "Reading Edition",
  "Immersive Reading Edition",
  "Cinematic Reader",
  "READ_PAUL_GRAHAM",
  "createReaderMetrics",
  "/api/metrics",
  "/api/pulse",
  "great-work-eta",
  "Noto Serif SC",
  "body.lang-zh",
  "lang-zh",
  "--zhf",
  "中文",
  "Chinese"
];

const staleRepoPaths = [
  "AGENTS.md",
  "bin",
  "setup",
  "skills/immersive-reading/assets/reader-template/vercel.json",
  "skills/immersive-reading/assets/reader-template/api"
];

for (const file of required) {
  if (!fs.existsSync(path.join(skillRoot, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

checkStaleRepoPaths();
checkSkillFrontmatter();
scanForbiddenStrings();
checkScripts();
runValidation();

if (errors.length) {
  console.error("Skill check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  skillRoot,
  checks: [
    "required files",
    "stale repo paths",
    "SKILL.md frontmatter",
    "portable string scan",
    "script syntax",
    "sample article validation",
    "reader template smoke test"
  ]
}, null, 2));

function checkStaleRepoPaths() {
  for (const rel of staleRepoPaths) {
    if (fs.existsSync(path.join(repoRoot, rel))) {
      errors.push(`Remove stale repo path: ${rel}`);
    }
  }
}

function checkSkillFrontmatter() {
  const skillPath = path.join(skillRoot, "SKILL.md");
  if (!fs.existsSync(skillPath)) return;
  const text = fs.readFileSync(skillPath, "utf8");
  if (!text.startsWith("---")) {
    errors.push("SKILL.md must start with YAML frontmatter");
    return;
  }
  if (!/^name:\s*immersive-reading\s*$/m.test(text)) {
    errors.push("SKILL.md frontmatter must include name: immersive-reading");
  }
  if (!/^description:\s*\S.+$/m.test(text)) {
    errors.push("SKILL.md frontmatter must include a non-empty description");
  }
}

function scanForbiddenStrings() {
  for (const file of walk(skillRoot)) {
    if (!/\.(html|js|css|json|md|yaml|yml|mjs)$/.test(file)) continue;
    const rel = path.relative(skillRoot, file);
    if (rel === "scripts/check-skill.mjs" || rel === "scripts/smoke-test-reader.mjs") continue;
    const text = fs.readFileSync(file, "utf8");
    for (const needle of forbidden) {
      if (text.includes(needle)) {
        errors.push(`Forbidden string "${needle}" found in ${rel}`);
      }
    }
  }
}

function checkScripts() {
  const scriptsDir = path.join(skillRoot, "scripts");
  if (!fs.existsSync(scriptsDir)) return;
  for (const file of fs.readdirSync(scriptsDir)) {
    if (!file.endsWith(".mjs")) continue;
    runNode(["--check", path.join(scriptsDir, file)], `node --check scripts/${file}`);
  }
}

function runValidation() {
  const sample = path.join(skillRoot, "assets/reader-template/src/articles/sample-reading/data.js");
  const template = path.join(skillRoot, "assets/reader-template");
  if (fs.existsSync(sample)) {
    runNode([
      path.join(skillRoot, "scripts/validate-article-data.mjs"),
      sample
    ], "validate sample article data");
  }
  if (fs.existsSync(template)) {
    runNode([
      path.join(skillRoot, "scripts/smoke-test-reader.mjs"),
      template
    ], "smoke-test reader template");
  }
}

function runNode(args, label) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    errors.push(`${label} failed${output ? `: ${output}` : ""}`);
  }
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

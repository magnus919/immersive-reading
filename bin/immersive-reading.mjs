#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillSrc = join(rootDir, "skills", "immersive-reading");
const args = process.argv.slice(2);

const usage = `Immersive Reading installer

Usage:
  immersive-reading install claude [--force]
  immersive-reading install codex [--force]
  immersive-reading install agent [--force]
  immersive-reading install cursor [project-directory] [--force]
  immersive-reading install local [skills-directory] [--force]
  immersive-reading install path <skills-directory> [--force]

Examples:
  npx --yes github:ryannli/immersive-reading install claude
  npx --yes github:ryannli/immersive-reading install codex
  npx --yes github:ryannli/immersive-reading install cursor .
`;

function homeDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) throw new Error("Could not find HOME or USERPROFILE.");
  return home;
}

function hasFlag(flag) {
  return args.includes(flag);
}

function ensureFreshTarget(target, force) {
  if (!existsSync(target)) return;
  if (!force) {
    throw new Error(`Target already exists: ${target}\nUse --force to reinstall.`);
  }
  rmSync(target, { recursive: true, force: true });
}

function copySkill(targetRoot, force) {
  if (!existsSync(skillSrc)) {
    throw new Error(`Skill source not found: ${skillSrc}`);
  }

  const target = join(targetRoot, "immersive-reading");
  ensureFreshTarget(target, force);
  mkdirSync(targetRoot, { recursive: true });
  cpSync(skillSrc, target, { recursive: true });
  return target;
}

function installSkill(mode, force) {
  const home = homeDir();
  const targetRootByMode = {
    claude: join(process.env.CLAUDE_HOME || join(home, ".claude"), "skills"),
    codex: join(process.env.CODEX_HOME || join(home, ".codex"), "skills"),
    agent: join(process.env.AGENTS_HOME || join(home, ".agents"), "skills"),
  };

  const targetRoot = targetRootByMode[mode];
  if (!targetRoot) throw new Error(`Unknown install mode: ${mode}`);

  const target = copySkill(targetRoot, force);
  console.log(`Installed Immersive Reading skill to:\n  ${target}`);
  console.log("\nTry it in a new agent session:");
  console.log("  Use $immersive-reading to turn ./article.md into a Reading Edition.");
}

function installCursor(projectDirArg, force) {
  const projectDir = resolve(projectDirArg || ".");
  const cursorRoot = join(projectDir, ".cursor");
  const skillTarget = join(cursorRoot, "skills", "immersive-reading");
  const ruleTarget = join(cursorRoot, "rules", "immersive-reading.md");

  ensureFreshTarget(skillTarget, force);
  if (existsSync(ruleTarget) && !force) {
    throw new Error(`Target already exists: ${ruleTarget}\nUse --force to reinstall.`);
  }

  mkdirSync(join(cursorRoot, "skills"), { recursive: true });
  mkdirSync(join(cursorRoot, "rules"), { recursive: true });
  cpSync(skillSrc, skillTarget, { recursive: true });
  writeFileSync(
    ruleTarget,
    [
      "# Immersive Reading",
      "",
      "When the user asks to convert long-form material into an interactive reading website, read and follow `.cursor/skills/immersive-reading/SKILL.md`.",
      "",
      "Use the bundled template, references, and scripts from `.cursor/skills/immersive-reading/` instead of recreating the reader from scratch.",
      "",
    ].join("\n"),
  );

  console.log(`Installed Immersive Reading for Cursor in:\n  ${projectDir}`);
  console.log(`\nRule:\n  ${ruleTarget}`);
  console.log(`Skill resources:\n  ${skillTarget}`);
}

function installPath(targetRootArg, force) {
  if (!targetRootArg) throw new Error("Missing skills directory for path install.");
  const target = copySkill(resolve(targetRootArg), force);
  console.log(`Installed Immersive Reading skill to:\n  ${target}`);
}

try {
  if (args.length === 0 || args[0] === "-h" || args[0] === "--help" || args[0] === "help") {
    console.log(usage);
    process.exit(0);
  }

  const command = args[0];
  const mode = args[1];
  const force = hasFlag("--force");

  if (command !== "install") {
    throw new Error(`Unknown command: ${command}`);
  }

  if (mode === "claude" || mode === "codex" || mode === "agent") {
    installSkill(mode, force);
  } else if (mode === "cursor") {
    installCursor(args.find((arg, index) => index > 1 && !arg.startsWith("--")), force);
  } else if (mode === "local") {
    const target = args.find((arg, index) => index > 1 && !arg.startsWith("--")) || ".agents/skills";
    installPath(target, force);
  } else if (mode === "path") {
    installPath(args.find((arg, index) => index > 1 && !arg.startsWith("--")), force);
  } else {
    throw new Error(`Unknown install target: ${mode || "(missing)"}`);
  }
} catch (error) {
  console.error(error.message);
  console.error("");
  console.error(usage);
  process.exit(1);
}

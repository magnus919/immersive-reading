# Immersive Reading

Turn any serious long-form source into a beautiful, interactive Reading Edition.

Most learning material gets flattened into a summary. Immersive Reading does the
opposite: it helps a coding agent preserve the shape of the original source,
then wraps it in a polished reader with chapters, section transitions, quotes,
search, highlights, notes, optional bilingual text, light/dark mode, and clear
source attribution.

This repository packages an Agent Skill plus a reusable static reader template.
It is designed for OpenAI Codex, Claude Code-compatible skill clients, and other
coding agents that understand the `SKILL.md` skill format.

## Why It Exists

A great reading edition should do three jobs:

1. Give the source a memorable structure without pretending the AI wrote it.
2. Make the first successful build feel obvious, even for a new user.
3. Keep copyright and attribution decisions explicit before any full-text copy.

Immersive Reading packages those decisions into a repeatable workflow. Give the
agent a source, rights context, language preference, and output folder; the skill
guides it through content conversion, scaffolding, validation, preview, and
optional deployment.

## See It Work

Ask your agent:

```text
Use $immersive-reading to convert ./article.md into a Reading Edition.
I wrote the source material, so full-text reproduction is allowed.
Add Chinese bilingual mode.
Output it to ./my-reading-edition.
```

The agent should:

- ask only for missing essentials
- create chapters and sections when the source does not already have them
- choose short anchor quotes for each section
- generate a valid `article-data.js`
- scaffold the reader template
- run schema and browser smoke checks
- preserve attribution and source-linking

If reproduction rights are unclear, the skill should build an excerpt-and-study
guide edition instead of mirroring the full source.

## Quick Start

Clone the repo, then install the skill into your preferred agent:

```bash
git clone https://github.com/ryannli/immersive-reading.git
cd immersive-reading
sh setup codex
```

Start a new Codex thread and ask:

```text
Use $immersive-reading to turn this long article into an immersive reading edition.
```

For a repo-local skill directory or another Agent Skills-compatible client:

```bash
sh setup local
```

This installs to `./.agents/skills/immersive-reading` in your current project.
If your client uses a different skills directory, pass it explicitly:

```bash
sh setup path /path/to/your/skills-directory
```

## First Local Demo

You can generate a sample reader without providing new content:

```bash
node skills/immersive-reading/scripts/scaffold-reader.mjs \
  --article-data skills/immersive-reading/assets/reader-template/src/articles/sample-reading/data.js \
  --out /tmp/immersive-reading-demo \
  --force
```

Then preview it:

```bash
cd /tmp/immersive-reading-demo
python3 -m http.server 8791
```

Open `http://127.0.0.1:8791`.

## What You Get

- A finished static reader, not just generated copy
- Chapter and section-based reading flow
- Search
- Highlights
- Notes and copyable notes
- Optional bilingual line-by-line reading mode
- Light and dark mode
- Mobile notice for limited annotation functionality
- Source attribution and original-link affordances
- 3D particle background and scroll-driven transitions
- Validation scripts for generated article data and the reader template

The bundled template intentionally excludes production analytics, dashboards,
Upstash/Redis, private domains, project-specific secrets, and Paul
Graham-specific content.

## Repository Layout

```text
setup
skills/
  immersive-reading/
    SKILL.md
    agents/openai.yaml
    assets/reader-template/
    references/
    scripts/
```

## Content Rights

The skill asks whether the user has rights to reproduce the full source text.
If rights are unclear, it should generate a summary, excerpt, or study-guide
edition instead of copying the full work.

Always verify attribution before publishing.

## Development

Validate the skill:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/immersive-reading
```

Validate sample article data:

```bash
node skills/immersive-reading/scripts/validate-article-data.mjs \
  skills/immersive-reading/assets/reader-template/src/articles/sample-reading/data.js
```

Smoke test the template:

```bash
node skills/immersive-reading/scripts/smoke-test-reader.mjs \
  skills/immersive-reading/assets/reader-template
```

Scaffold a reader:

```bash
node skills/immersive-reading/scripts/scaffold-reader.mjs \
  --article-data skills/immersive-reading/assets/reader-template/src/articles/sample-reading/data.js \
  --out /tmp/sample-reading-edition \
  --force
```

## License

MIT. Generated source editions remain subject to the rights of their original
source material.

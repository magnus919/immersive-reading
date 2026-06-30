# Immersive Reading Skill

Turn long-form learning material into a polished interactive reading edition.

This repository packages an Agent Skill plus a reusable static reader template. It is designed for coding agents that support the Agent Skills `SKILL.md` format, including OpenAI Codex and Claude Code-compatible skill clients.

## What It Builds

Given a source article, essay, blog post, transcript, note, or paper, the skill helps an agent generate a static site with:

- chapter and section-based reading flow
- source attribution and original link
- search
- highlights
- notes and copyable notes
- optional bilingual line-by-line reading mode
- light and dark mode
- mobile notice for limited annotation functionality
- immersive 3D particle background and scroll-driven transitions

The bundled template intentionally excludes production analytics, dashboards, Upstash/Redis, project-specific domains, and Paul Graham-specific content.

## Repository Layout

```text
skills/
  immersive-reading/
    SKILL.md
    agents/openai.yaml
    assets/reader-template/
    scripts/
    references/
```

## Install For OpenAI Codex

Copy or symlink the skill folder into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/immersive-reading ~/.codex/skills/immersive-reading
```

Then start a new Codex thread and ask:

```text
Use $immersive-reading to convert this article into an immersive reading edition.
```

## Install For Claude Code And Other Agent Skills Clients

This repository uses the standard Agent Skills folder shape: a skill directory containing `SKILL.md`, optional `agents/`, `scripts/`, `references/`, and `assets/`.

For Claude Code or another skills-compatible coding agent, install or point the client at:

```text
skills/immersive-reading
```

If your client has a configured skills directory, copy `skills/immersive-reading` there. If it supports repo-local skills, open this repository and invoke `$immersive-reading`.

## Example Use

```text
Use $immersive-reading to build a reading edition from this Markdown file.
I wrote the source material, so full-text reproduction is allowed.
Do not add bilingual mode.
Output it to ./my-reading-edition.
```

```text
Use $immersive-reading to convert this blog post into a study-guide edition.
I do not own the copyright, so use summaries and short excerpts only.
Add English + Chinese bilingual study mode.
```

## Content Rights

The skill asks whether the user has rights to reproduce the full source text. If rights are unclear, it should generate a summary/excerpt study guide instead of mirroring the full work.

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

MIT. Generated source editions remain subject to the rights of their original source material.

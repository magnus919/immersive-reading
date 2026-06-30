# Immersive Reading

A Claude Code / Codex skill for turning long-form material into cinematic
reading websites.

Example: Paul Graham's epic essay,
[How to Do Great Work](https://paulgraham.com/greatwork.html).

<table>
  <tr>
    <td width="50%">
      <strong>Before</strong><br>
      <sub>Plain essay page</sub><br>
      <video src="docs/media/how-to-do-great-work-before.mp4" controls muted loop playsinline width="100%"></video>
    </td>
    <td width="50%">
      <strong>After</strong><br>
      <sub>Cinematic Reading Edition</sub><br>
      <video src="docs/media/how-to-do-great-work-after.mp4" controls muted loop playsinline width="100%"></video>
    </td>
  </tr>
</table>

## What It Builds

One source file becomes a local Reading Edition with:

- chapter and section structure
- cinematic openings and scroll transitions
- search, highlights, notes, and copyable notes
- optional bilingual line-by-line reading mode
- light and dark mode
- a static site you can run locally or deploy to Vercel

## Quick Start

### Claude Code

Install from the public repo as a Claude Code plugin. Run these as two separate
Claude Code messages:

```text
/plugin marketplace add ryannli/immersive-reading
```

Then:

```text
/plugin install immersive-reading@immersive-reading
```

Use it in Claude Code with:

```text
/immersive-reading:immersive-reading
```

### Codex

Codex uses this repo as a skill, not a plugin. Install it with:

```text
$skill-installer https://github.com/ryannli/immersive-reading/tree/main/skills/immersive-reading
```

Or use the npx installer:

```bash
npx --yes github:ryannli/immersive-reading install codex
```

### Local Agents

The `npx` commands run a small installer that copies `skills/immersive-reading`
into the target skills folder. They do not install app dependencies.

For Claude Code without the plugin flow:

```bash
npx --yes github:ryannli/immersive-reading install claude
```

For a generic `SKILL.md`-compatible agent:

```bash
npx --yes github:ryannli/immersive-reading install agent
```

### Cursor

Install the skill resources and a project rule into the current project:

```bash
npx --yes github:ryannli/immersive-reading install cursor .
```

### Antigravity CLI

```bash
agy plugin install https://github.com/ryannli/immersive-reading.git
```

### Local Clone

```bash
git clone https://github.com/ryannli/immersive-reading.git
cd immersive-reading
sh setup codex
```

## First Prompt

Open a new Claude Code or Codex session and ask:

```text
Use $immersive-reading to turn ./article.md into a Reading Edition at ./reading-edition.
Add Chinese bilingual mode.
```

For an English-only edition:

```text
Use $immersive-reading to turn ./essay.md into a Reading Edition at ./essay-reader.
No bilingual mode.
```

## License

MIT.

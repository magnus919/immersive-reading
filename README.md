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

## Install

Clone the repo:

```bash
git clone https://github.com/ryannli/immersive-reading.git
cd immersive-reading
```

Install for Claude Code:

```bash
sh setup claude
```

Install for Codex:

```bash
sh setup codex
```

Install for a generic `SKILL.md`-compatible agent:

```bash
sh setup agent
```

Or copy the skill folder yourself:

```bash
mkdir -p ~/.claude/skills ~/.codex/skills ~/.agents/skills
cp -R skills/immersive-reading ~/.claude/skills/immersive-reading
cp -R skills/immersive-reading ~/.codex/skills/immersive-reading
cp -R skills/immersive-reading ~/.agents/skills/immersive-reading
```

## First Run

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

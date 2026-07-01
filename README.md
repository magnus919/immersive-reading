<div align="center">

# Immersive Reading

<strong>Turn dense long-form ideas into bespoke learning spaces that are delightful to explore.</strong>

Bring a link, essay, transcript, note, or paper. Get back a polished learning
space with chapters, source attribution, search, highlights, notes, and optional
bilingual support.

<br>

[![Start](https://img.shields.io/badge/Quick_Start-Install_now-111111?style=for-the-badge&labelColor=9A5A25)](#quick-start)
[![Skill](https://img.shields.io/badge/Reusable_Skill-immersive--reading-111111?style=for-the-badge&labelColor=5B6675)](skills/immersive-reading/SKILL.md)

</div>

<br>

## What It Builds

<table>
  <tr>
    <td width="33%" valign="top">
      <sub><strong>01 · BRING</strong></sub><br><br>
      <strong>Source material</strong><br>
      <sub>Essays, posts, transcripts, notes, papers, URLs, or local files.</sub><br><br>
      <kbd>raw text</kbd> <kbd>link</kbd> <kbd>file</kbd>
    </td>
    <td width="33%" valign="top">
      <sub><strong>02 · SHAPE</strong></sub><br><br>
      <strong>Agent-built structure</strong><br>
      <sub>Chapters, section beats, anchor quotes, source media, and optional study language.</sub><br><br>
      <kbd>chapters</kbd> <kbd>quotes</kbd> <kbd>media</kbd>
    </td>
    <td width="33%" valign="top">
      <sub><strong>03 · OPEN</strong></sub><br><br>
      <strong>Interactive learning space</strong><br>
      <sub>A static reader with search, highlights, notes, attribution, and theme support.</sub><br><br>
      <kbd>search</kbd> <kbd>highlights</kbd> <kbd>notes</kbd>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td width="33%" valign="top">
      <sub>READING FLOW</sub><br><br>
      <strong>Turn dense text into a path.</strong><br>
      <sub>Chapter openings, section beats, anchor quotes, and scroll-driven transitions.</sub>
    </td>
    <td width="33%" valign="top">
      <sub>STUDY SURFACE</sub><br><br>
      <strong>Make the source usable.</strong><br>
      <sub>Search, highlights, notes, copyable notes, optional bilingual support, and light/dark mode.</sub>
    </td>
    <td width="33%" valign="top">
      <sub>REUSABLE SCAFFOLD</sub><br><br>
      <strong>Ship the same quality again.</strong><br>
      <sub>Validated article data, source media, and static output ready for local use or Vercel.</sub>
    </td>
  </tr>
</table>

<br>

## Quick Start

This is a standard [Agent Skills](https://agentskills.io) skill. Install it with any SKILL.md-compatible agent:

### Via git clone

```bash
git clone https://github.com/magnus919/immersive-reading.git
```

The skill lives at `skills/immersive-reading/` in the clone. Load it using your agent's standard skill-loading mechanism.

### Via Skills CLI

```bash
npx skills add magnus919/immersive-reading
```

Choose your agent when the installer asks. Then start a new session and use:

```text
Use immersive-reading on this article:
https://example.com/long-form-essay
```

For bilingual reading:

```text
Use immersive-reading on this link and add Spanish bilingual mode:
https://example.com/long-form-essay
```

You can also paste text or point to a local file. The agent chooses where to
create the site and tells you when it is ready.

## Usage Notes

- Preserve the bundled reader template. Do not redesign the UI from scratch unless necessary — the template already encodes polished interaction details.
- The skill separates judgment (structure, quotes, summaries, translation) from deterministic work (scaffolding, validation, smoke tests).
- Use the bundled scripts for scaffolding (`scaffold-reader.mjs`), validation (`validate-article-data.mjs`), and preview (`serve-reader.mjs`). See `skills/immersive-reading/SKILL.md` for the full workflow.

## License

MIT.

## Original Work

This project is a fork of [ryannli/immersive-reading](https://github.com/ryannli/immersive-reading) by **Ran Li**. The original work provides the reader template, content model, and scripts that this project builds upon. See the [upstream repository](https://github.com/ryannli/immersive-reading) for the original project.

# AI-Assisted Development Guidelines

This repository contains an Agent Skill. Keep the skill useful for other agents, not only for humans.

## Principles

1. Keep `skills/immersive-learning/SKILL.md` concise. Put detailed workflow, schema, copyright, design, and deployment information in `references/`.
2. Keep reusable code in `scripts/` and reusable output files in `assets/`.
3. Do not add production analytics, Upstash, Redis, private domains, or project-specific credentials to the reader template.
4. Do not include copyrighted source text in examples unless it is public domain, licensed, or written for this repository.
5. Validate after changes:
   - skill structure with `quick_validate.py`
   - article data with `scripts/validate-article-data.mjs`
   - reader template with `scripts/smoke-test-reader.mjs`
6. Preserve the existing reader experience unless a change is explicitly about the template:
   - search
   - highlights
   - notes
   - optional bilingual display
   - light/dark mode
   - source attribution
   - 3D particle transitions

## Editing

Change only what the task requires. Avoid speculative abstractions. If a deterministic script can do a transformation or validation, prefer the script over model-only reasoning.

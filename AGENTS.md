# Valley Life

Valley Life is an open-ended farm life simulation game inspired by Stardew Valley, built with three.js so it runs in the browser.

## Project identity

- **Name:** Valley Life
- **Genre:** Farm life simulation (top-down perspective)
- **Tech stack:** three.js + vanilla JavaScript, browser-based (no build step required, but a module bundler is optional)
- **Inspiration:** Stardew Valley (ConcernedApe) — mechanics studied from public reference material, code written from scratch

## Rules for all contributors

1. **Do everything yourself.** Never ask the user for confirmation, choices, or missing information before proceeding. If a decision is needed, make a reasonable one and document it in SPEC.md.
2. **Announce each step in one line before you do it.** State the action concisely, then execute it.
3. **Write your own code. Never copy code.** All game logic/implementations must be original work written by the agent/contractor — every line of code is written independently. You may **reuse** dialogue strings, story lines, events, quests, and achievements from the game assets (the Stardew Valley APK content referenced in `content.md`) as design reference, but all code that uses them must be written from scratch.
4. **Rename.** Do not use character, place name from the original game, rename it yourself. All Valley Life characters, places, and creatures must have original names (see `content.md` for the renamed cast).
5. **Run in the browser.** The game must run in a web browser using three.js. No native dependencies or engine installs are required.
6. **One test per feature.** Every feature listed in SPEC.md must have exactly one corresponding test that verifies that feature.
7. **3-part build plan.** SPEC.md must contain a build plan with exactly three parts.
8. **Commit all work to Git.** Every document and code file must be committed to the Git repository.

## Document conventions

- `SPEC.md` — the source of truth. Contains every feature, one test per feature, and the 3-part build plan. This file is authoritative; AGENTS.md and features.md are derived from it.
- `features.md` — a human-readable feature list derived from SPEC.md.
- `content.md` — game content reference: storyline, dialogue, NPCs, characters, items, crops, animals, buildings, mine, bundles, farm types, skills, marriage, achievements, events, quests. Use this when implementing content; consult it for renamed cast and reusable dialogue/story/event/quest/achievement reference from game assets.
- `AGENTS.md` — these operating rules. Update only when the working rules change.

## How to extend the game

1. Add the feature to `SPEC.md` with its single test.
2. Add a matching entry to `features.md`.
3. Consult `content.md` for any related dialogue, story, event, quest, or achievement reference (renamed for Valley Life).
4. Implement the feature with original code.
5. Run the test.
6. Commit to Git.

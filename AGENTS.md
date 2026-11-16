<!-- TRELLIS:START -->
# mini-trellis

This project uses mini-trellis as a memory layer. Working knowledge lives under `.trellis/`:

- `.trellis/spec/` — durable contracts (short markdown; read `index.md` first)
- `.trellis/research/` — topic inbox (`<topic>.md`; `README.md` is not a topic)
- `.trellis/workspace/` — per-developer journals

Record a session with `/mini-trellis:remember` (Claude/OpenCode), `/mini-trellis-remember` (Pi/OMP/Kiro), `$mini-trellis-remember` (Codex/ZCode), or the `mini-trellis-remember` skill (Cursor and DeepSeek Harness). When earlier decisions or relevant project rules are needed, use `mini-trellis mem recall "<topic or path>"`; expand evidence with `mini-trellis mem read "<ref>"`. No search is required for unrelated work. Promote lasting boundaries into spec with `mini-trellis-update-spec`.

Record only confirmed decisions, reusable research findings, or the session/compact handoff. Skip ordinary turns and unconfirmed guesses. New installs write notes without an automatic git commit; use `mini-trellis doctor` to check host wiring and `mini-trellis refresh --dry-run` before refreshing assets.

Keep confirmed rules short and faithful. Unconfirmed scope, exceptions, and implementation choices stay open or are labeled as inference, not added to the contract.

For a confirmed update, follow this short order: read the existing topic; edit that file; read it back and check the new rule, limits, and negations; run `python3 ./.trellis/scripts/add_session.py --title "..." --summary "..." --topic <actual-topic-path>`; read the journal and check its topic link. Journal-only success is not topic success; report partial writes accurately. New notes follow the requested or discussion language; updates preserve the document language.

When recall excerpts already answer the question with source and qualifiers, cite them and stop. Expand only missing context; do not repeat a lookup or fall back to dialogue-only `search` merely to reconfirm sufficient evidence.

ZCode, Kiro and OMP conversation histories are not parsed; use project knowledge or supply Markdown/text exports. For an explicit request to organize selected past sessions or supplied Markdown/text exports into project knowledge, use `mini-trellis-session-insight`; update existing documents and preserve sources.

mini-trellis does not create or drive tasks.

Managed by mini-trellis. Edits outside this block are preserved.
<!-- TRELLIS:END -->

# Learning Docs Web

This repository holds browser learning sites. One topic lives in one directory under `src/<slug>/`. The human index is `README.md` (Chinese) and `README.en.md` (English).

## Designated directories

| Path | Topic |
|---|---|
| `src/rl` | Reinforcement learning. House-style reference: [bahayonghang/rl-learning](https://github.com/bahayonghang/rl-learning) `rl-learning-web/`. Kiln and safety-gate contracts stay in that repo's `AGENTS.md` until this directory adopts a specific contract. |
| `src/power-trading` | Power trading and electricity markets. |
| `src/llm` | Large language models. |

A row is a location. Treat the site as unpublished until its own files exist. A new topic is a new `src/<slug>/`. Add the same row to `README.md` and `README.en.md` in the change that creates it. Keep a published slug stable.

## When editing a site

Read that site's README and the root `README.md` first. Follow the house style recorded there: paired Chinese and English editions, primary citations, demos that compute the numbers they show, and an explicit statement of what a simplified model leaves out.

Put the site's source, toolchain, and docs inside `src/<slug>/`. The repository root keeps the index, agent docs, and shared conventions.

## Guardrails

- Leave the managed block between `<!-- TRELLIS:START -->` and `<!-- TRELLIS:END -->` unchanged.
- Leave `ref/` unchanged. It is local reference material and is gitignored.
- Write a count or result only when the current site or a cited source computes or states it.
- Keep chapter IDs, route IDs, and locale pairs stable once a site has published them.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `bahayonghang/learning-docs-web`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five default roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` and `docs/adr/` when those files exist. See `docs/agents/domain.md`.

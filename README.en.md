# Learning Docs Web

[中文 README](README.md)

This repository holds browser sites for learning. Reinforcement learning, power trading, large language models, and later topics each get one stable directory under `src/`. The repository root is the index and the shared conventions. A topic's pages, toolchain, and notes live in its own directory.

The house style follows RL Atlas in [bahayonghang/rl-learning](https://github.com/bahayonghang/rl-learning) (`rl-learning-web/`): paired Chinese and English editions, a problem before a definition, figures that come from the calculation on the page, citations to primary sources, and an explicit limit on what a simplified model shows. Cement-kiln contracts, the five-layer safety gate, and experiment baselines stay in that repository's `AGENTS.md`.

## Designated directories

| Path | Topic | Status |
|---|---|---|
| [`src/rl`](src/rl/README.md) | Reinforcement learning | Designated. No site files yet. RL Atlas remains in [rl-learning](https://github.com/bahayonghang/rl-learning) at `rl-learning-web/`. |
| [`src/power-trading`](src/power-trading/README.md) | Power trading | Designated. No site files yet. |
| [`src/llm`](src/llm/README.md) | Large language models | Designated. No site files yet. |

A row records a location. Until a directory contains its curriculum, experiments, or pages, treat that site as unpublished.

A new topic is a new `src/<slug>/`. Add the same row to this file and to [README.md](README.md) in the change that creates it. Keep a slug stable once it has been published.

## What lives in a site

```
src/<slug>/
├── README.md          # Chinese: subject, how to run, content limits
├── README.en.md       # English pair
├── docs/              # Design, review, and export notes for this site
└── ...                # Source, toolchain, tests, and static assets
```

The root does not hold one topic's page source, and it does not start a shared dev server. Each site documents its own run command in its README. The root has no `package.json` and no deployed site.

## Standard for a new site

This is the bar for writing a site. It is not an inventory of pages that already exist here. RL Atlas is the worked example.

- Finish the Chinese and English body text, exercise feedback, and interface copy before offering a language switch. Chapter, experiment, and route IDs match across both languages.
- Numbers shown in an interaction come from that calculation. Seeded randomness names the seed.
- State what a simplified model leaves out. A teaching curve, an illustrative node, or an example parameter is not a measurement or a field result.
- Prefer textbooks, original papers, and official docs as sources. Keep searchable titles, authors, and links. Translate the explanation; keep the bibliographic identity checkable.
- A site builds from its own local toolchain. If it needs an API key, an account, or a remote service, say so in that site's README.
- Static hosting uses relative assets and routes that work on a subpath. Publish steps in a README describe the method. They do not mean a public site is already enabled.

When you change a site that already exists, keep its published chapter IDs, route IDs, and locale pairs. A change to meaning, numbers, or exercises lands in both languages.

## For maintainers and agents

- Agents start with [AGENTS.md](AGENTS.md). Designated directories, write scope, and domain limits live there.
- Issues are GitHub Issues: <https://github.com/bahayonghang/learning-docs-web/issues>. The workflow is in [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).
- Triage labels are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).
- Terms and architecture decisions use one context at the repository root: `GLOSSARY.md` and `docs/adr/`. Create those when a term or decision is actually settled. See [docs/agents/domain.md](docs/agents/domain.md).
- `ref/` is local reference material. It is listed in `.gitignore` and is not site content to edit.

## How this repo relates to rl-learning

| Repository | Responsibility |
|---|---|
| [bahayonghang/rl-learning](https://github.com/bahayonghang/rl-learning) | Process-industry reinforcement-learning research, and the finished RL Atlas site in `rl-learning-web/`. |
| `src/rl/` here | Designated home for a reinforcement-learning learning site. Adopt a kiln contract only when this directory takes that contract on purpose. |
| `src/power-trading/` and `src/llm/` here | Learning sites for power trading and language models. They do not inherit kiln state, action, or safety-gate parameters. |

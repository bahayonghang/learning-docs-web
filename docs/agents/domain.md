# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **single-context**. Topic sites under `src/<slug>/` are learning sites, not separate glossary contexts.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or
- **`GLOSSARY-MAP.md`** at the repo root if it exists: it points at one `GLOSSARY.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

Also read the root `README.md` when the task creates or edits a learning site. It records the designated `src/<slug>/` directories and the house style.

## File structure

Single-context layout for this repo:

```
/
├── GLOSSARY.md
├── docs/adr/
│   └── 0001-example-decision.md
└── src/
    ├── rl/                 ← reinforcement-learning site
    ├── power-trading/      ← power-trading site
    └── llm/                ← large-language-model site
```

`GLOSSARY.md` and `docs/adr/` appear when a term or decision is actually resolved. A site directory may contain only its own README until that site is written.

Multi-context (only if `GLOSSARY-MAP.md` exists at the root):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── rl/
    │   ├── GLOSSARY.md
    │   └── docs/adr/
    └── power-trading/
        ├── GLOSSARY.md
        └── docs/adr/
```

Do not add per-site glossaries unless a later decision creates `GLOSSARY-MAP.md`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (short title), but worth reopening because…_

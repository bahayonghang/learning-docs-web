# RL Atlas migration record / 迁移记录

- Source: [bahayonghang/rl-learning/rl-learning-web](https://github.com/bahayonghang/rl-learning/tree/main/rl-learning-web)
- Source snapshot: `rl-learning` tree `22e97450c5d1e206845ff9145a4dffbf743de910` (branch `main`).
- Destination: `learning-docs-web/src/rl/`.
- Scope: all 213 tracked site files, including both language editions, course exports, figures, interactive modules, documentation and tests.
- Migration edits: `README.md`, `README.en.md`, `index.html`, `src/main.ts` (run paths, source links and relative entry).
- Verification: every source path was present in the staged destination tree; the remaining 209 files, including all 71 JPEG/WebP images, had identical Git blob SHAs. This verifies the transfer but is not a substitute for running the build and tests.

## Local verification / 本地验证

From the repository root / 从仓库根目录运行：

```bash
cd src/rl
npm ci
npm test
npm run export:book
npm run build
npm run dev
```

Node.js 22.12+ is required. The site is self-contained, with Vite `base: './'`, relative image paths, and hash-based routes, so it can be deployed under a subpath. Publish the contents of `src/rl/dist/` at the desired URL prefix rather than pointing a static host at the TypeScript source.

The kiln workbench is a deterministic educational simulation with staged safety gates and delayed feedback. It does **not** perform live dispatch to industrial systems; its sample values must not be presented as measured operating results. The research contract and original background remain documented in the source repository.

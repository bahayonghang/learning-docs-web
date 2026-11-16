# Verification record / 验证记录

## Local verification / 本地核验

- `npm ci`: locked installation succeeded with Node.js 22.12 or newer.
- `npm run check`: both 24-lesson editions exported; **22/22 numerical and content tests passed**; strict TypeScript checking and the Vite production build passed.
- `npm run test:e2e -- --list`: **26 desktop/mobile project cases** discovered.
- All **16 final images** inspected for labels, visual intent, and language. Chinese decision-loop order was corrected with a targeted imagegen edit and inspected again.
- Independent content/calculation review verified unit conversions, gradients, forecast-time data availability, discrete quantiles/CVaR, clearing shortages and ties, network capacity, settlement signs, and storage inventory.
- Corrections from that review: the all-day day-ahead baseline only uses already available history; an exhausted cheap generator is distinguished from transmission congestion; discrete quantile intervals are described as nominal coverage; a 99-to-101 MW example is labeled a 2 MW change.

本地已通过锁文件安装、双语导出、22项数值/内容测试、严格类型检查和生产构建。独立复核处理了预测信息时序、离散分位数覆盖、拥塞与发电容量区别，以及出清/结算/储能的单位与符号。

## Browser environment / 浏览器环境

Local Chromium could not start because the execution environment rejected its process-singleton socket (`socket() failed: Operation not permitted`, followed by SIGABRT). Downloading the Playwright shell returned an invalid empty ZIP. These attempts are **not** counted as a successful browser test, and no DOM simulation is presented as visual verification.

The repository workflow runs the production site in a real Chromium browser on an Ubuntu GitHub runner. Its test suite covers 24 lessons × 2 languages × 2 sizes (96 lesson views) and 12 labs × 2 languages × 2 sizes (48 lab views), plus controls, numerical examples, animation lifecycle, image downloads, book downloads, search, categories, focus, preferences, and routing. Screenshots are saved to `test-results/screenshots` and retained as a workflow artifact.

## Recorded browser result / 真实浏览器结果

**2026-11-16 UTC — 26/26 cases passed in 40.7 seconds** on the GitHub Ubuntu runner, using Node.js 22 and real Chromium. The same job also passed locked installation, both book exports, all 22 numerical/content tests, strict TypeScript checking, and the production build.

- [Successful workflow run 43803811174](https://github.com/bahayonghang/learning-docs-web/actions/runs/43803811174)
- Application/test commit: [`1cb7dcc3fb52f189f4d6904571a3ae23f6c49eff`](https://github.com/bahayonghang/learning-docs-web/commit/1cb7dcc3fb52f189f4d6904571a3ae23f6c49eff)
- Verified coverage: **96 lesson views** (24 lessons × 2 languages × 2 sizes), **48 lab views** (12 labs × 2 languages × 2 sizes), numeric control changes, animation play/pause/reset/teardown, reduced motion, image/book downloads, search/filtering, drawer focus, preferences, and unknown-route recovery.
- Eight representative screenshots were downloaded from that run and visually reviewed. [Permanent screenshot index](screenshots/README.md). They are actual browser captures, converted from PNG to WebP at the original dimensions for repository size.
- The workflow also retained the independently built static site as the `power-trading-atlas-site` artifact.

首次CI发现手机课程正文被表格的固有宽度撑开，造成整页横向溢出。已将阅读区明确约束为可用列宽，同时保留长公式和表格各自的局部滚动，没有裁切正文或放宽验收阈值。修复后的中英文24课全部通过手机宽度检查，8张实际页面截图已逐张检查；首页图标也已补齐。

The first CI run caught a genuine mobile reader overflow. An auto-width Grid item with auto inline margins inherited the table's minimum content width. Setting the reader to `width: 100%; min-width: 0` confines it to its grid track; existing formula/table scrollers remain available. The second run passed every original assertion. No test threshold was relaxed and no page-wide clipping was added.

The saved screenshots and this record document the verified application/test commit above; subsequent documentation-only commits add those records without changing application behavior.

## Reproduce / 复现

```bash
cd src/power-trading
npm ci
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

The browser preview uses port **4175**, desktop **1440 × 1000**, and mobile **390 × 844**. Default tests use reduced motion; one explicit case enables normal motion to verify play, pause, and teardown. Every case fails on uncaught browser exceptions, console errors, failed local assets, or asserted page overflow.

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

真实浏览器验收由仓库CI执行。首次结果尚待运行；完成后本记录会补充对应工作流链接和实际通过情况。

## Reproduce / 复现

```bash
cd src/power-trading
npm ci
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

The browser preview uses port **4175**, desktop **1440 × 1000**, and mobile **390 × 844**. Default tests use reduced motion; one explicit case enables normal motion to verify play, pause, and teardown. Every case fails on uncaught browser exceptions, console errors, failed local assets, or asserted page overflow.

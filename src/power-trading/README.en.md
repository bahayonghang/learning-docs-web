# Power Trading Atlas

[中文 README](README.md)

A complete Chinese/English course connecting mathematics and neural networks to electricity systems, markets, forecasting, procurement, settlement, and industrial applications. Warm light/dark themes, generated concept illustrations, and local visual experiments carry one industrial electricity story through the material.

## Run locally

Use **Node.js 22.12 or newer**. This site has its own toolchain; the repository root has no shared development server.

```bash
cd src/power-trading
npm ci
npm run dev
```

Open the local URL printed by Vite. If [just](https://just.systems/) is installed, `just dev` prepares dependencies when needed and starts the server, including on Windows.

```bash
npm run check       # Export, numerical/content tests, typecheck, production build
npm run preview     # Preview the existing dist directory
```

The experiments require no API key, account, live model, or trading connection. Installing dependencies needs npm access. Running the site does not submit trades.

## Six connected stages

| Stage | Lessons | Questions |
|---|---|---|
| Mathematics | 01–04 | Power and energy, vectors, probability, expectation, derivatives, gradients |
| Neural networks | 05–08 | Linear baselines, neurons, multilayer networks, backpropagation, sequences |
| Electricity and markets | 09–12 | Balance, participants, market products, clearing, transmission constraints |
| Forecasting and validation | 13–16 | Demand and renewables, prices, chronological backtesting, quantiles and scenarios |
| Trading decisions | 17–20 | Procurement coverage, settlement, storage/VPPs, stochastic optimization/CVaR/RL |
| Industrial applications | 21–24 | Chinese and Anhui rules, business workflow, a complete daily case, evaluation |

There are **24 bilingual lessons, 96 substantive sections, 24 worked examples, and 24 self-checks with feedback for every answer**. Each lesson includes objectives, prerequisites, an adjacent illustration with reading notes, misconceptions, limits, and primary sources.

Readers familiar with neural networks can enter at lesson 09. Readers connecting theory to business can start at lesson 17 while following prerequisite links. Reading times are estimates. There is no learning-progress tracker.

## Twelve working experiments

| Route | Experiment |
|---|---|
| `#/lab/energy` | MW × hours, energy, and cost with an area visualization |
| `#/lab/expectation` | Scenario weights, expected contributions, and dispersion |
| `#/lab/neuron` | Standardized inputs, signed weights, bias, ReLU, and a prediction |
| `#/lab/gradient` | Genuine gradient updates, fitted lines, loss curves, step/play controls |
| `#/lab/merit-order` | Progressive dispatch, tied offers, negative offers, and shortfalls |
| `#/lab/congestion` | Two-zone transfer constraints, dispatch, and marginal costs |
| `#/lab/forecast` | Synthetic weather, a fixed daily baseline, and a feature model |
| `#/lab/backtest` | Rolling origins and a clearly identified future-information leak |
| `#/lab/quantiles` | Pinball loss, candidate predictions, and empirical quantiles |
| `#/lab/settlement` | Day-ahead amounts and signed real-time deviations |
| `#/lab/hedge` | Fixed-price coverage, scenario costs, expectation, and upper-tail CVaR |
| `#/lab/storage` | Inventory, charging/discharging, losses, power clipping, and cash flow |

`src/labs/math.ts` separates calculation from presentation. Experiments have presets, reset, explicit units, and limitations. Training, clearing, backtesting, and storage have manual animation and stepping. Timers stop on navigation or page hiding; reduced-motion mode uses single steps.

## Reading and visual features

- Eight concept families, **16 generated WebP illustrations**. Chinese labels appear in Chinese mode and English labels in English mode, including gallery, enlargement, and downloads.
- Searchable/filterable experiment and image collections, plus global `Ctrl/Cmd + K` search across prose, experiments, and terms.
- Sidebar expansion and scroll preservation, active-lesson highlighting, responsive mobile navigation, and keyboard focus management.
- Light, dark, system appearance, and larger text. Only language, theme, and text-size preferences are stored.
- **23 primary references and 36 bilingual glossary entries**, with version status and checking dates for sources.
- Individual lesson downloads and complete book exports. Illustrations communicate concepts; code and prose define exact numbers, formulas, and charts.

See [illustrations](docs/illustrations.md) and the exact [prompt manifest](docs/image-prompts.json).

## Sources and teaching boundaries

Market sources were checked on **2026-11-15**. See [market-sources.md](docs/market-sources.md) for official links, dates, replacement relationships, and model contracts.

- The 2025 medium/long-term market rules took effect on 2026-03-01, replacing the 2020 rules and 2024 green-power chapter.
- The 2023 spot trial text states an expiry of 2026-10-15. It is labeled historical mechanism reference; the 2026 revision is labeled a consultation draft, not an effective rule.
- Anhui entered formal spot-market operation on 2026-09-09. The announcement establishes operating status, not a complete settlement specification.
- Merit-order clearing assumes one zone, fixed demand, and no network constraints. The two-zone experiment is a transport model, not full power flow or SCUC/SCED.
- Two-settlement calculations represent the energy component, not an entire electricity bill. Quantity inputs are MWh; convert MW using duration first.
- Storage has directional efficiency, power and energy constraints, mutual exclusivity, and a terminal-inventory check. Synthetic cash flow is not a field profit claim.
- Forecasting uses deterministic synthetic data. Real day-ahead forecasting must respect information release times and historical weather-forecast vintages.

## Engineering and verification

Vite, TypeScript, KaTeX, Marked, DOMPurify, and Lucide provide an independent static build. The site reuses the established reading interactions and design language without a large UI framework or remote service. Shared stable IDs connect editions, lessons, and experiments. Hash routing and relative assets support subdirectory hosting.

```bash
npm test
npm run typecheck
npm run export:book
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Browser verification uses port 4175 and desktop/mobile projects. The repository workflow `.github/workflows/power-trading-atlas.yml` checks relevant pull requests and main-branch changes and retains reports, screenshots, and the build. Actual results are recorded in [verification.md](docs/verification.md).

## Export and static hosting

`npm run export:book` exports both complete books to `public/downloads/` from the same canonical course data, including all prose, examples, feedback, limits, and citations. Images are referenced in the neighboring `images` directory. Downloading Markdown alone does not download images; preserve the site directory structure for offline illustrated reading.

Build with `npm run build`, then publish `dist/` to a static host. Do not open source files directly or deploy the source directory as the output. These are publishing instructions, not a claim that a public site is deployed.

See [design.md](docs/design.md) for implementation responsibilities.

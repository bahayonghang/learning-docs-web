# Learning Docs Web

[English README](README.en.md)

这个仓库存放可在浏览器里学习的站点。强化学习、电力交易、大语言模型等主题各占 `src/` 下一个稳定目录。仓库根目录是索引和约定；某个主题的网页、工具链和说明都放进对应目录。

站点写法参照本仓库 [src/rl](src/rl/README.md) 中已迁入的 RL Atlas（原始项目为 [bahayonghang/rl-learning](https://github.com/bahayonghang/rl-learning) 的 `rl-learning-web/`）：中英双语、先讲清问题再给定义、演示数字来自当页计算、出处指向原始资料，并写明简化模型没有覆盖的部分。该仓库里的水泥烧成契约、五层安全门和实验基线仍以它自己的 `AGENTS.md` 为准。

## 指定目录

| 目录 | 主题 | 现状 |
|---|---|---|
| [`src/rl`](src/rl/README.md) | 强化学习 | **已迁入 RL Atlas**：双语教程、数学计算器、算法实验、水泥烧成工作台、图解与测试；在本目录独立构建。 |
| [`src/power-trading`](src/power-trading/README.md) | 电力交易 | 目录已指定。站点尚未放入。 |
| [`src/llm`](src/llm/README.md) | 大语言模型 | **已创建 LLM Atlas**：从数学与神经网络到 Transformer、训练、推理与应用的双语图文课程、计算实验和原创配图；在本目录独立构建。 |

表中的一行只表示位置。目录里还没有课程、实验或页面时，就把它当作尚未发布的站点。

新增主题时，创建 `src/<slug>/`，并在同一次改动里给本文件和 [README.en.md](README.en.md) 各加一行。slug 一旦对外使用就保持不变。

## 一个站点放什么

```
src/<slug>/
├── README.md          # 中文说明：主题、如何运行、内容边界
├── README.en.md       # 英文说明，与中文成对
├── docs/              # 该站点自己的设计、核验和导出说明
└── ...                # 源码、工具链、测试、静态资源
```

根目录不放某一个主题的页面源码，也不提供全仓库共用的开发服务器。每个站点在自己的 README 里写启动命令。目前根目录没有 `package.json`，也没有已部署的网站。

## 写站点时沿用的标准

这些是新站点的写作标准，不是对现有页面的功能清单。RL Atlas 是已经按这个标准做成的例子。

- 中文和英文都写完对应正文、练习反馈和界面文案后，再提供语言切换。章节、实验、路由使用的 ID 在两种语言里保持同一套。
- 交互里显示的数字由当前计算得出。需要随机时使用可设置的种子，并写明种子。
- 简化模型写明省略了什么。教学曲线、示意节点和例子参数不写成测量结果或现场业绩。
- 出处优先使用教材、原始论文和官方文档。保留可检索的题名、作者和链接；解释可以翻译，文献身份保持可核对。
- 站点只依赖自己的本地构建。需要 API Key、账号或远程服务时，在该站点 README 里单独写明。
- 静态发布使用相对资源和可在子路径工作的路由。README 里的发布步骤只描述做法，不表示仓库已经开通线上站点。

修改已有站点时，保持已经发布的章节 ID、路由 ID 和语言对。意义、数字或练习有变化时，两种语言一起改。

## 给维护者和代理

- 代理每次开工先读 [AGENTS.md](AGENTS.md)。指定目录、可写范围和领域边界以那里为准。
- 议题放在 GitHub Issues：<https://github.com/bahayonghang/learning-docs-web/issues>。操作约定见 [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)。
- 分拣标签使用 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。见 [docs/agents/triage-labels.md](docs/agents/triage-labels.md)。
- 术语和架构决策使用仓库根目录的单一上下文：`GLOSSARY.md` 与 `docs/adr/`。这两个位置在第一次真正写定术语或决策时再建。见 [docs/agents/domain.md](docs/agents/domain.md)。
- `ref/` 是本机参考材料，已在 `.gitignore` 中忽略，不作为站点内容修改。

## 与 rl-learning 的分工

| 仓库 | 职责 |
|---|---|
| [bahayonghang/rl-learning](https://github.com/bahayonghang/rl-learning) | 流程工业强化学习研究、原版 RL Atlas 的历史来源及原项目的工业契约。 |
| 本仓库 [`src/rl/`](src/rl/README.md) | RL Atlas 的双语学习站点、交互、静态资源、测试与独立构建入口；工业场景仍遵循模拟推演与安全边界。 |
| 本仓库 `src/power-trading/`、`src/llm/` | 电力交易和语言模型的学习站点。不继承烧成系统的状态、动作或安全门参数。 |

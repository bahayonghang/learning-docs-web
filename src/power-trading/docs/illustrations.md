# Generated illustrations / 生成配图

The course uses the built-in **imagegen** tool for eight paired concept illustrations. Each concept has a Chinese-label and English-label edition. The exact prompts and final repository paths are recorded in [image-prompts.json](image-prompts.json).

课程使用内置 **imagegen** 生成功能制作8组中英成对概念插图。中文与英文分别生成图内文字；实际提示词及最终路径在同目录JSON中保留。

| File stem / 文件前缀 | Meaning / 主题 |
|---|---|
| `foundations` | Units, vectors, probability, gradients / 单位、向量、概率、梯度 |
| `neural-forecast` | Inputs, learned parameters, forecasts, feedback / 输入、学习、预测、反馈 |
| `power-system` | Generation, grid, consumption, storage / 发电、电网、用电、储能 |
| `market-clearing` | Offers, demand, allocation, network limits / 报价、需求、出清、网络限制 |
| `forecasting` | History, available external information, uncertainty / 历史、外部信息、不确定性 |
| `settlement` | Plans, measurements, differences, energy costs / 计划、计量、差额、费用 |
| `flexibility` | Storage and adjustable industrial demand / 储能与工业负荷灵活性 |
| `decision-loop` | Data, forecasting, decisions, submission, review / 数据、预测、决策、申报、复盘 |

Final assets are `public/images/<stem>-zh.webp` and `public/images/<stem>-en.webp`, each 1536 × 1024. The original generated artwork is encoded to WebP for the website. This is format compression, without redrawing the illustration. Chinese decision-loop artwork was regenerated with a targeted edit to correct the order of submission and review; the revision prompt is retained.

最终资产路径为 `public/images/<主题>-zh.webp` 与 `public/images/<主题>-en.webp`，尺寸均为1536×1024。生成原图编码为WebP供页面加载。中文决策闭环图经imagegen定向编辑，把申报和复盘调整为正确次序；修改提示词也保留在清单中。

## Use and verification / 使用与核验

- The gallery, reader, image dialog, and image download use the same locale mapping.
- Images are embedded beside the explanation and followed by three reading notes.
- Captions identify them as conceptual illustrations. Numerical plots, flow balances, loss curves, and inventory trajectories are calculated in code instead.
- Do not use decorative object placement or arrows as legal process documentation or as a substitute for the precise model stated in prose.
- Both label sets, intended concepts, and final dimensions are inspected. Automated checks ensure every referenced image exists, decodes as WebP, and loads in both browser editions.

画廊、正文、弹窗与下载共用语言映射；图片紧邻讲解，之后有读图说明。插图用于建立直觉，不能作为精确数据、法定程序或模型结构的证据。精确数学与动态图来自正文和计算代码。全部中英标签、主题表达与尺寸经过检查，自动验证检查资产存在、格式及浏览器加载。

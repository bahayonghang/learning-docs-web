# Market sources and educational boundaries / 市场来源与教学边界

Checked on **2026-11-15**. The source registry is `src/content/catalog.ts`; the reader-facing pages display its bilingual notes and version labels. This record distinguishes confirmed source contents from the course’s independently constructed examples. It does not claim an exhaustive inventory of currently applicable provincial rules.

核对日期为 **2026-11-15**。来源注册表位于 `src/content/catalog.ts`，页面使用其中的中英文说明与版本标签。本文区分已核实来源和独立编写的教学模型，不声称已经穷尽各省当前全部适用规则。

## Version decisions / 版本决策

| Source ID | Official document / 官方文件 | Date and handling / 日期与处理 |
|---|---|---|
| `cn-basic-2024` | [电力市场运行基本规则](https://zfxxgk.ndrc.gov.cn/wap/iteminfo.jsp?id=20379) | Issued 2024-04-25, effective 2024-07-01. General framework. / 全国市场框架来源。 |
| `cn-midlong-2025` | [电力中长期市场基本规则](https://www.ndrc.gov.cn/xxgk/zcfb/ghxwj/202512/t20251226_1402666.html) | Issued 2025-12-17; effective 2026-03-01 for five years. Replaces the 2020 basic rules and 2024 green-power chapter. / 不把已被替代的旧规则列为现行主引用。 |
| `cn-spot-2023` | [电力现货市场基本规则（试行）](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20272) | The text states validity through 2026-10-15. Historical mechanism reference; no extension was established in this check. / 仅作机制与历史参考，未确认延期，不无条件声称当前有效。 |
| `cn-spot-draft-2026` | [新版现货基本规则征求意见公告](https://yyglxxbsgw.ndrc.gov.cn/htmls/article/article.html?articleId=2c97d16c-9ff00a63-01a1-524711ba-002f) | Announced 2026-10-19, consultation closes 2026-11-18. Draft status at the checking date. / 不作为已经生效的规则。 |
| `cn-ancillary-2025` | [电力辅助服务市场基本规则](https://www.ndrc.gov.cn/xxgk/zcfb/ghxwj/202504/t20250429_1397483.html) | Issued 2025-04-03. Local products and implementation still need checking. / 避免把历史调峰补偿无条件叠加到现货连续运行地区。 |
| `cn-green-cert-2025` | [可再生能源绿色电力证书管理实施细则（试行）](https://henb.nea.gov.cn/xxgk/zcfg/202602/t20260203_295284.html) | Issued 2025-11-28, effective on issuance for three years. Official full-text republication. / 使用完整官方转载核对核发与核销边界。 |
| `cn-renewable-price-2025` | [新能源上网电价市场化改革通知](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20482) | Issued 2025-01-27. Distinguish market energy prices from the separate settlement mechanism and local implementation. / 市场价、机制价与绿证收益不可混为一项。 |
| `metering-settlement` | [电力市场计量结算基本规则](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20533) | Issued 2025-07-18; effective 2025-10-01 for five years. / 单位、计量、清分和电费收付的基础来源。 |
| `anhui-rules-2026` | [安徽电力中长期市场实施细则](https://hdj.nea.gov.cn/dtyw/tzgg/202603/P020260331593555268345.pdf) | Issued 2026-03-20, published 2026-03-31. Official entry point; the course does not reproduce every local provision. / 不能据此宣称已复现安徽全部现货结算参数。 |
| `anhui-start-2026` | [安徽电力现货市场转入正式运行](https://hdj.nea.gov.cn/dtyw/jgdt/202609/t20260909_308441.html) | Official confirmation of formal operation on 2026-09-09. / 不再将安徽整体状态写成尚未正式运行；状态公告不代替结算细则。 |

The 2025 longer-term rule’s [full PDF](https://www.ndrc.gov.cn/xxgk/zcfb/ghxwj/202512/P020251226622166557290.pdf), Article 98, provides the effective date and explicit replacement relationship. The consultation announcement is also listed in the [NDRC official consultation directory](https://www.ndrc.gov.cn/hdjl/yjzq/). A proposal does not imply that local market operations have stopped, and the expiration written in an older document does not by itself establish the absence of every later extension. Subsequent formal publications require a new check.

中长期规则正文第九十八条载明生效时间和替代关系。现货修订公告也可从国家发展改革委意见征求目录进入。规则征求意见不能推导地方市场停止运行；旧文件载明期限届满，也不等于已经证明不存在任何后续延期文件。新增正式文件需要重新核对。

## Teaching model contracts / 教学模型约定

- **Units / 单位**: MW is power, MWh is energy, hours are explicit, and currency/MWh times MWh gives currency. A 15-minute interval is 0.25 h. Values are synthetic unless a source explicitly identifies observations.
- **Clearing / 出清**: the merit-order lab is a single-interval, single-region model with fixed demand, linear offers, and a stated uniform-price convention. Offers are not automatically accounting costs; offer-based objective value is not total settlement revenue or net profit. Shortfall must remain visible.
- **Congestion / 阻塞**: the two-region experiment is a lossless transport model. It does not contain phase angles, reactance, loop-flow constraints, reactive power, or contingency analysis. Do not label it DCOPF, SCUC/SCED, or a reproduction of real nodal pricing.
- **Settlement / 结算**: `C = Q_DA × p_DA + (Q_actual − Q_DA) × p_RT` is an explicitly defined buyer-cost teaching model. A contract difference term requires an explicit reference price. The full bill may contain other applicable items. A negative deviation term is not negative consumption and a deviation is not automatically a penalty.
- **Storage / 储能**: with grid-side powers, stored energy changes by `eta_charge × P_charge × dt − P_discharge × dt / eta_discharge`. Power, energy bounds, mutual exclusivity, and terminal energy matter. Equal initial/final state or a stated terminal value prevents free initial energy from being counted as arbitrage skill.
- **Green attributes / 绿色属性**: one Chinese certificate corresponds to 1 MWh, subject to issuance conditions. It is not one tonne of carbon credit. Independent-storage discharge does not create a new certificate entitlement.
- **Forecasting / 预测**: train-only fitting of preprocessing and forecast-time availability are required. Realized future weather and revised data cannot silently replace the information available when deciding. Time ordering alone does not prevent all leakage.
- **Business results / 业务结果**: synthetic gains are calculated outcomes under assumptions, not measured performance, promised returns, or validated production strategies. Hindsight comparisons are diagnostic and must be labeled.

## Independent example arithmetic / 独立算例核算

| Chapter | Inputs / 输入 | Expected result / 预期结果 |
|---|---|---|
| 09 | 100 MW for 0.25 h at 400 yuan/MWh | 25 MWh; 10,000 yuan energy component |
| 10 | 60 MWh at 380 plus 40 MWh at 500 | 42,800 yuan; average 428 yuan/MWh |
| 11 | A 40 MW @100, B 50 MW @300, C 30 MW @600; demand 85 MW; 1 h | Dispatch 40/45/0; marginal convention 300; offer objective 17,500; uniform energy payment 25,500 yuan |
| 12 | A cap150/demand40/offer200; B cap100/demand80/offer600; transfer cap50; 1 h | Dispatch A90/B30; objective 36,000. Transfer cap51 gives A91/B29 and 35,600 yuan. |
| 21 | Extra 2 MWh at real-time 700, other quantities fixed | Additional real-time component 1,400 yuan in the declared model only |
| 22 | Sell 100 MWh @450; cover 60 @380; buy remaining 40 @500 or @800 | Pre-other-cost difference 2,200 or −9,800 yuan |
| 23 | Four 6 h blocks; DA MW 10/11/12/9; actual MW 10/12/14/8; DA prices 200/350/500/250; RT 180/400/700/200 | DA 84,600; deviations 9,600; total 94,200 yuan; actual energy264 MWh; average356.82; power MAE1 MW |
| 24 | Two 1 h blocks; underforecasts A1/0, B0/2; price spreads500/10 | MAE A0.5/B1 MW; spread cost relative to hindsight A500/B20 yuan |

## Other primary learning references / 其他一手学习来源

The registry includes the author sites for *Mathematics for Machine Learning*, *Deep Learning*, *Dive into Deep Learning*, and *Forecasting: Principles and Practice*; the original Koenker–Bassett quantile-regression and Rockafellar–Uryasev CVaR papers, including the general-distribution extension; the publisher’s page for Sutton–Barto’s *Reinforcement Learning*; SAM’s official battery-model documentation; PJM’s explanation of locational marginal pricing; EIA’s unit reference; and scikit-learn’s official leakage and time-split documentation. These support mathematical and methodological concepts. Their inclusion does not import another jurisdiction’s rules into China.

注册表另收录数学与深度学习教材作者网站、预测教材、分位数回归与 CVaR（含一般分布扩展）原始论文、Sutton–Barto 强化学习教材出版社页面、SAM 官方电池模型文档、PJM 价格教学、EIA 单位解释及 scikit-learn 官方验证文档。它们支撑概念和方法，不把境外市场制度转写为中国业务规则。

## Updating this record / 更新办法

When a market source changes, update its title, URL, scope, status, and checking date together. Then inspect chapters referring to its ID, corresponding English passages, worked examples, labs, and exports. Preserve historical labels where needed for historical examples. Avoid automatically converting every draft into an effective rule or every trial document into an obsolete one merely because of its title.

规则变化时，同步更新来源身份、链接、适用范围、状态和核对日期，并检查引用章节、英文对应段落、算例、实验及导出版本。历史案例需要的历史标签应保留；不因标题有“征求意见”以外的字样就判断其已经实施，也不因名称含“试行”便断言已经失效。

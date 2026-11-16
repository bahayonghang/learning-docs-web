import type { Chapter } from '../types';
import { l, s, option } from './helpers';

export const decisionChapters: Chapter[] = [
  {
    id: '17', moduleId: 'decisions', title: l('售电采购：锁价比例与风险敞口', 'Retail procurement: fixed-price coverage and exposure'),
    subtitle: l('把负荷与价格预测转成采购组合，先看清谁承担剩余风险。', 'Turn load and price forecasts into a procurement mix and identify who bears the remaining risk.'),
    minutes: 26, prerequisites: ['03', '10', '16'],
    objectives: l(['用同一份能量账区分固定价覆盖与剩余现货采购。', '解释锁价比例怎样改变价格敞口和机会成本。', '识别电量、时段形状与结算参考价不匹配的风险。'], ['Use one energy ledger to separate fixed-price coverage and residual spot procurement.', 'Explain how coverage changes price exposure and opportunity cost.', 'Identify mismatches in quantity, delivery shape, and settlement reference price.']),
    tags: l(['采购组合', '锁价与套期保值', '售电风险'], ['Procurement mix', 'Hedging', 'Retail risk']),
    figure: 'settlement',
    figureCaption: l('先约定覆盖多少电量，再把实际需求与已有头寸对账。', 'Decide how much energy to cover, then reconcile actual demand with the existing position.'),
    figureNotes: l(['合同记录与实际计量承担不同职责，不能把同一份电量算成两次采购。', '固定价覆盖减少部分价格暴露，但实际用量和时段分布仍可能变化。', '图中的账本是概念提示，具体金额按本课的统一结算假设计入。'], ['Contract records and metered consumption have different roles; do not purchase the same energy twice in the ledger.', 'Fixed-price coverage reduces some price exposure while actual quantity and timing can still change.', 'The ledgers are conceptual; the example specifies the exact settlement assumptions.']),
    sections: [
      s('position', '从实际用电需求建立头寸表', 'Build a position ledger from energy demand', String.raw`先把一个交付时段或一个已统一口径的交付区间内的实际需求记为 $D$ MWh。提前约定固定价格 $K$ 元/MWh，覆盖 $Q$ MWh，剩余部分按现货价格 $p$ 计价。在同一交付地点、时间和参考价格下，教学能量成本是：

$$C=QK+(D-Q)p.$$

这个式子把总需求拆成两部分。$Q$ 是在价格和需求完全揭晓前决定的头寸；$D$ 是后来实现的用量。如果实际需求低于 $Q$，残余量会为负，式子相当于允许按同一价格结清多余头寸；真实市场是否允许、怎样结清，必须另查合同和规则。`, String.raw`For one delivery interval, or an aggregation with consistently defined delivery terms, let actual demand be $D$ MWh. Fix price $K$ yuan/MWh for $Q$ MWh in advance and price the remainder at spot price $p$. With aligned location, timing, and reference price, teaching energy cost is:

$$C=QK+(D-Q)p.$$

This partitions total demand into two components. Position $Q$ is chosen before price and demand are fully revealed; $D$ is subsequently realized. If actual demand falls below $Q$, the residual is negative. The formula then assumes that excess coverage can be settled at the same spot price; actual eligibility and settlement require the contract and applicable rules.`),
      s('hedge', '锁价减少暴露，也放弃部分低价机会', 'Coverage reduces exposure and some low-price upside', String.raw`在 $D,Q,K$ 固定时，成本对现货价格的敏感度为 $\partial C/\partial p=D-Q$。覆盖越多，未覆盖电量越少，现货涨价的影响通常越小；若现货下跌，固定价部分也不能自动享受更低价格。因此锁价是一种风险分配，不是每个未来情景都会赚钱的预测技巧。

若只让 $p$ 随机，$\operatorname{Var}(C)=(D-Q)^2\operatorname{Var}(p)$。实际需求也随机时，这个简式就不够了，要保留需求与价格的联合情景。选择覆盖率应同时比较预期成本、坏情景、现金需求与合同边界，不应把某个教学滑块位置当作企业通用最优值。`, String.raw`Holding $D,Q,K$ fixed, cost sensitivity to spot price is $\partial C/\partial p=D-Q$. Greater coverage leaves less energy exposed to a price rise. If spot prices fall, however, the fixed-price portion does not automatically receive that lower price. Hedging allocates risk; it is not a forecasting trick that wins in every future scenario.

If only $p$ is random, $\operatorname{Var}(C)=(D-Q)^2\operatorname{Var}(p)$. Random demand requires a joint load-price model instead. Select coverage by comparing expected cost, adverse scenarios, cash requirements, and contract conditions, rather than treating a teaching slider position as a universal optimum.`),
      s('contract-ledger', '固定价电量与差价合约的两种记账方式', 'Two accounting views of fixed-price coverage', String.raw`同一个教学成本还可写成 $C=Dp+Q(K-p)$：全部实际电量先按现货计价，再由合同差价调整覆盖部分。它与 $QK+(D-Q)p$ 代数等价，但不是两笔公式叠加。若先记 $QK$，又额外加上全量 $Dp$，会把覆盖电量重复计费。

等价需要参考价格、交付时段与数量口径一致。若合同参考的是另一节点、月均价或另一组时段，差价项应使用实际合同定义的参考价，剩余基差风险不会被“锁价”二字消除。中长期交易也不总等同于一种金融差价合约；本课用两种账法解释模型，不替代具体合同的法律和结算安排。`, String.raw`The same teaching cost is $C=Dp+Q(K-p)$: price all actual energy at spot and adjust the covered quantity through the contract difference. This is algebraically equivalent to $QK+(D-Q)p$, not an additional amount to add to it. Recording $QK$ and then adding all of $Dp$ would charge covered energy twice.

Equivalence requires matching reference prices, delivery intervals, and quantity conventions. A contract referencing another location, a monthly index, or different intervals needs its actual reference price in the adjustment; basis risk remains. Medium- and long-term trading is not always a financial contract for difference. These accounting views explain a model rather than replacing contractual or legal arrangements.`),
      s('retail', '从采购成本走到售电业务结果', 'Connect procurement cost to retail outcomes', String.raw`售电公司的教学毛利可以写成“零售收入减采购成本”，但收入也要按零售合同确定：固定价、市场联动或其他条款会把不同风险分给售电方与用户。实际业务还要扣除相关费用、信用成本和违约损失。预测误差只是其中一个来源，不能把采购省下的钱直接全部叫净利润。

工业客户的月总电量预测准确，也可能晚高峰不足、低谷过剩。管理组合时至少分时记录需求预测、已签合同曲线、未覆盖量和可调能力，再用同一组情景评估。已经占用的信用额度、客户集中度和可用资金，也会限制看似便宜的采购方案。`, String.raw`A teaching retailer margin is retail revenue minus procurement cost, but revenue itself depends on the retail contract: fixed-price, market-linked, and other terms distribute risks differently between retailer and customer. Relevant charges, credit costs, and defaults also affect results. Forecast error is one contributor, and procurement savings are not automatically net profit.

An accurate monthly industrial-energy forecast can still conceal evening shortages and off-peak surpluses. Track interval demand forecasts, existing contract profiles, uncovered quantities, and flexibility before evaluating a common scenario set. Available credit, customer concentration, and cash can constrain an apparently cheap procurement plan.`),
    ], lab: 'hedge',
    workedExample: { title: l('覆盖 60 MWh，比较三种现货价格', 'Cover 60 MWh and compare three spot prices'), body: l(String.raw`独立教学算例：实际需求 $D=100$ MWh，固定价电量 $Q=60$ MWh，合同价 $K=400$ 元/MWh。先付固定价部分 $60\times400=24{,}000$ 元，剩余 40 MWh 按现货计价。

| 现货价 元/MWh | 60% 覆盖成本 元 | 全部现货成本 元 |
|---|---:|---:|
| 200 | 32,000 | 20,000 |
| 400 | 40,000 | 40,000 |
| 800 | 56,000 | 80,000 |

800 元/MWh 时，$C=24{,}000+40\times800=56{,}000$ 元；用差价写法也是 $100\times800+60(400-800)=56{,}000$ 元。200 元/MWh 时，覆盖方案反而比全部现货贵 12,000 元。比较的是同一能量采购项，不包含其他费用。`, String.raw`Independent teaching example: actual demand $D=100$ MWh, fixed-price quantity $Q=60$ MWh, and contract price $K=400$ yuan/MWh. The fixed portion costs $60\times400=24{,}000$ yuan; the remaining 40 MWh is bought at spot.

| Spot price yuan/MWh | Cost with 60% coverage, yuan | All-spot cost, yuan |
|---|---:|---:|
| 200 | 32,000 | 20,000 |
| 400 | 40,000 | 40,000 |
| 800 | 56,000 | 80,000 |

At 800 yuan/MWh, $C=24{,}000+40\times800=56{,}000$ yuan. The difference-payment form gives the same result: $100\times800+60(400-800)=56{,}000$. At 200 yuan/MWh, coverage costs 12,000 yuan more than all-spot procurement. Only the same energy component is compared; other charges are excluded.`) },
    misconception: l('“固定价合同付款之外，还应把全部用电再按现货付一次。”应选择一种一致账法：固定部分加剩余现货，或者全量现货加合同差价；两者不能重复叠加。', '“Pay the fixed-price contract and then pay spot for all consumption again.” Use one consistent ledger: fixed plus residual spot, or all spot plus the contract difference, without double counting.'),
    boundary: l('算例假定同一参考价与交付口径，不是安徽真实售电结算方案。未计输配电、基金附加、系统运行费、信用安排和税费；实际中长期与零售合同需按适用规则逐项映射。', 'The example assumes aligned delivery terms and reference prices, not an actual Anhui retail settlement. Network and system charges, surcharges, credit arrangements, and taxes are omitted; map real contracts to their applicable rules.'),
    quiz: { question: l('D=100 MWh、Q=60 MWh、K=400、p=800 元/MWh，哪种计算没有重复计费？', 'With D=100 MWh, Q=60 MWh, K=400 and p=800 yuan/MWh, which calculation avoids double counting?'), options: [
      option('60×400＋100×800', '60×400 + 100×800', '覆盖的 60 MWh 又按现货算了一遍，重复计费。', 'The covered 60 MWh is charged again at spot.'),
      option('60×400＋40×800＝56,000 元', '60×400 + 40×800 = 56,000 yuan', '固定价部分与未覆盖部分加起来恰好是实际需求 100 MWh。', 'The covered and uncovered portions sum to the 100 MWh actual demand.', true),
      option('100×400＝40,000 元', '100×400 = 40,000 yuan', '只有 60 MWh 被固定价覆盖，剩余 40 MWh 不能自行使用合同价。', 'Only 60 MWh is fixed; the remaining 40 MWh cannot simply be priced at the contract rate.'),
    ] }, sourceIds: ['cn-midlong-2025', 'cn-basic-2024', 'cvar'],
  },
  {
    id: '18', moduleId: 'decisions', title: l('日前与实时：把一笔用电结算清楚', 'Day-ahead and real-time: reconcile one energy position'),
    subtitle: l('先把 MW 变成 MWh，再区分已成交电量、实际电量和偏差。', 'Convert MW to MWh, then separate cleared energy, actual energy, and deviations.'),
    minutes: 27, prerequisites: ['01', '11', '17'],
    objectives: l(['手算一个统一假设下的日前加实时偏差结算。', '区分偏差金额、价格差影响与规则中的额外考核费用。', '为结算复盘保留时段、计量与价格版本。'], ['Calculate a teaching day-ahead plus real-time deviation settlement.', 'Separate deviation cash flow, spread effects, and additional rule-based charges.', 'Preserve interval, metering, and price versions for reconciliation.']),
    tags: l(['日前与实时', '双结算', '计量与复盘'], ['Day-ahead and real-time', 'Two settlements', 'Metering and reconciliation']),
    figure: 'settlement',
    figureCaption: l('日前账记录提前成交的电量，实时账只调整实际与日前的差额。', 'The day-ahead ledger records the scheduled quantity; the real-time ledger adjusts its difference from actual energy.'),
    figureNotes: l(['两份账对应同一个交付时段，不是把全量用电购买两次。', '计量值揭晓后才能确定偏差正负，不能在预测时假装已经知道。', '图解只展示对账逻辑，结算粒度与费用项目需按具体市场规则确定。'], ['Both ledgers refer to the same delivery interval, not two purchases of all consumption.', 'The deviation sign is known only after actual energy is observed.', 'The illustration explains reconciliation; interval granularity and charges depend on the market rules.']),
    sections: [
      s('timeline', '交易发生在不同时间，交付仍是同一个时段', 'Different transaction times, the same delivery interval', String.raw`日前阶段根据当时信息形成计划和成交头寸；运行日实际负荷、发电和电网状态实现，实时机制处理差异。不要把日前电量理解成另外一次物理用电：两阶段针对的是同一交付时段的计划与实际。

本课从购电方视角定义正号为支出，所有 $Q$ 都是 MWh。先假定同一地点与时段、统一的日前价格 $p_{\mathrm{DA}}$ 和实时价格 $p_{\mathrm{RT}}$，忽略其他费用。这个约定让金额可以核对，不能直接代表任何省份每种市场主体的完整结算流程。`, String.raw`The day-ahead stage forms schedules and positions using information then available. During operation, actual load, generation, and network conditions emerge, and real-time mechanisms handle differences. Day-ahead energy is not an additional physical consumption event: the two stages concern planned and actual quantities for the same delivery interval.

Take the buyer’s perspective, with positive amounts representing expenditure and every $Q$ measured in MWh. Assume aligned location and interval, a day-ahead price $p_{\mathrm{DA}}$, a real-time price $p_{\mathrm{RT}}$, and no other charges. These conventions make arithmetic checkable, not a complete provincial settlement procedure for every participant type.`),
      s('identity', '日前电量加上实时偏差', 'Day-ahead energy plus the real-time deviation', String.raw`在上述教学假设下：

$$C=Q_{\mathrm{DA}}p_{\mathrm{DA}}+(Q_{\mathrm{actual}}-Q_{\mathrm{DA}})p_{\mathrm{RT}}.$$

若实际用量高于日前头寸，差额为正，补购部分按实时价计；低于日前头寸时，差额为负，在这个对称模型中形成抵扣。它也可写成 $C=Q_{\mathrm{actual}}p_{\mathrm{RT}}+Q_{\mathrm{DA}}(p_{\mathrm{DA}}-p_{\mathrm{RT}})$，两种写法金额一致。

发电方收入可以在同样对称假设下写成类似结构，但真实市场可能有主体差异、补偿和考核。若另有中长期合同，必须先确定合同参考价和结算方式，再加入正确的调整项，不能叠加重复的全量购电成本。`, String.raw`Under those teaching assumptions:

$$C=Q_{\mathrm{DA}}p_{\mathrm{DA}}+(Q_{\mathrm{actual}}-Q_{\mathrm{DA}})p_{\mathrm{RT}}.$$

If actual consumption exceeds the day-ahead position, the positive difference is bought at real-time price. A negative difference produces a credit in this symmetric model. Equivalently, $C=Q_{\mathrm{actual}}p_{\mathrm{RT}}+Q_{\mathrm{DA}}(p_{\mathrm{DA}}-p_{\mathrm{RT}})$.

Generator revenue can have an analogous form under the same symmetric assumptions, while actual arrangements may include participant-specific compensation and assessments. Additional medium- or long-term contracts require their actual reference prices and settlement methods; do not add another duplicate full-energy cost.`),
      s('spread', '偏差金额不等于额外罚款', 'Deviation cash flow is not automatically a penalty', String.raw`把“全部实际电量都按日前价计算”作为比较基准，教学差额是：

$$C-Q_{\mathrm{actual}}p_{\mathrm{DA}}=(Q_{\mathrm{actual}}-Q_{\mathrm{DA}})(p_{\mathrm{RT}}-p_{\mathrm{DA}}).$$

它同时依赖偏差方向和价差方向。低估需求遇上实时高价会增加成本；同样的低估遇上更低实时价，在本模型中反而降低相对成本。因此偏差结算不是天然等于某个固定百分比罚款。若适用规则另设偏差考核、不平衡费用或补偿，应该作为独立项目记录并引用该规则。`, String.raw`Using all actual energy valued at the day-ahead price as a comparison baseline, the teaching difference is:

$$C-Q_{\mathrm{actual}}p_{\mathrm{DA}}=(Q_{\mathrm{actual}}-Q_{\mathrm{DA}})(p_{\mathrm{RT}}-p_{\mathrm{DA}}).$$

Both the deviation sign and price-spread sign matter. Underforecast demand with a higher real-time price raises cost; the same underforecast with a lower real-time price lowers relative cost in this model. Deviation settlement is therefore not inherently a fixed-percentage fine. Additional assessments, imbalance charges, or compensation should appear as separately identified rule-based items.`),
      s('reconciliation', '让每一笔金额都能追溯回输入', 'Trace each amount back to its inputs', String.raw`一张可复盘的明细表至少包含：交付日期和时段、时长、日前成交平均功率或电量、最终计量电量、价格节点和价格版本、偏差量、各金额分项。MW 字段必须先乘小时数，MWh 字段则不能再次乘时长。不同粒度的数据要按照规则对齐，不能把月均价与 15 分钟电量随意相乘。

截至本课程核对日期 2026-11-15，所列 2023 年现货试行规则只作历史制度资料，其标示有效期已于 2026-10-15 届满；2026 年征求意见材料不等于已经生效的规则。实际应用应核对所在地区现行细则、合同与计量结算要求，第 21 课提供版本核查路线。`, String.raw`A reproducible ledger records delivery date and interval, duration, day-ahead cleared power or energy, finalized metered energy, price location and version, deviation, and each cash-flow component. Convert MW by multiplying by hours; do not multiply MWh by duration again. Align data at different granularities according to the applicable convention rather than arbitrarily pairing monthly averages with 15-minute energy.

As of the course check date, 2026-11-15, the listed 2023 trial spot rules are historical institutional material: their stated validity ended on 2026-10-15. A 2026 consultation draft is not an enacted rule. Actual use requires the applicable local rules, contract, and metering-settlement requirements; lesson 21 explains the version-checking process.`),
    ], lab: 'settlement',
    workedExample: { title: l('100 MW 日前、110 MW 实际，为什么支出 12,000 元？', '100 MW day-ahead and 110 MW actual: why does cost equal 12,000 yuan?'), body: l(String.raw`独立教学算例：时长 15 分钟，即 0.25 小时。日前成交平均功率 100 MW，实际平均用电 110 MW，日前价 400 元/MWh，实时价 800 元/MWh。

1. 日前电量：$100\times0.25=25$ MWh。
2. 实际电量：$110\times0.25=27.5$ MWh；偏差为 2.5 MWh。
3. 日前金额：$25\times400=10{,}000$ 元。
4. 实时偏差金额：$2.5\times800=2000$ 元。
5. 合计 $C=12{,}000$ 元。

如果全部实际电量按日前价计，基准是 $27.5\times400=11{,}000$ 元。价差带来的额外成本为 $2.5(800-400)=1000$ 元，而不是把整个 2000 元实时金额都称为“罚款”。

下方结算实验的数量输入使用 MWh：请先完成 MW×时长的转换，再输入日前 25 MWh、实际 27.5 MWh，不要直接填入 100 和 110。`, String.raw`Independent teaching example: the interval lasts 15 minutes, or 0.25 hours. Cleared day-ahead average power is 100 MW, actual average consumption is 110 MW, and prices are 400 yuan/MWh day-ahead and 800 yuan/MWh real-time.

1. Day-ahead energy: $100\times0.25=25$ MWh.
2. Actual energy: $110\times0.25=27.5$ MWh; deviation is 2.5 MWh.
3. Day-ahead amount: $25\times400=10{,}000$ yuan.
4. Real-time deviation amount: $2.5\times800=2000$ yuan.
5. Total $C=12{,}000$ yuan.

Valuing all actual energy at day-ahead price gives a baseline of $27.5\times400=11{,}000$ yuan. The spread adds $2.5(800-400)=1000$ yuan. The entire 2000-yuan real-time amount should not be labeled a “fine.”

The settlement lab takes quantities in MWh. Convert MW × duration first, then enter 25 MWh day-ahead and 27.5 MWh actual; do not enter the original 100 and 110 MW values.`) },
    misconception: l('“日前成交量按日前价付钱后，实际总量还要全部按实时价再付一次。”实时项在本模型中只结算偏差；若采用全量实时账法，必须同时加入日前价差调整。', '“After paying day-ahead, pay real-time price for the full actual quantity again.” The real-time component here settles only the deviation; an all-real-time accounting view also needs the day-ahead spread adjustment.'),
    boundary: l('这是购电支出为正的双结算教学恒等式，不是安徽实际账单生成器。未包含节点差异、中长期参考价差、偏差考核、补偿、分摊和税费；15 分钟只是示例粒度。', 'This is a two-settlement teaching identity with positive buyer expenditure, not an Anhui billing engine. Location differences, contract-reference adjustments, assessments, compensation, allocations, and taxes are omitted; 15 minutes is an example granularity.'),
    quiz: { question: l('上述算例中，相对“全部实际电量按日前价计”的额外成本是多少？', 'In the example, what is the extra cost relative to all actual energy valued at the day-ahead price?'), options: [
      option('2000 元，因为这就是实时偏差金额', '2000 yuan, because that is the deviation cash flow', '2000 元还包含偏差电量按日前价也应支付的 1000 元，不能全部当成价差影响。', 'That includes 1000 yuan which the extra energy would also cost at day-ahead price.'),
      option('1000 元，等于 2.5×(800−400)', '1000 yuan, equal to 2.5×(800−400)', '偏差电量乘日前与实时价差，恰好等于12,000−11,000。', 'Deviation energy times the spread equals 12,000−11,000.', true),
      option('8000 元，因为 10 MW×800', '8000 yuan, because 10 MW×800', '这既遗漏 0.25 小时，也没有使用需要比较的价格差。', 'This omits the 0.25-hour duration and uses the price instead of the relevant spread.'),
    ] }, sourceIds: ['cn-spot-2023', 'cn-spot-draft-2026', 'metering-settlement', 'cn-midlong-2025'],
  },
  {
    id: '19', moduleId: 'decisions', title: l('储能、需求响应与虚拟电厂', 'Storage, demand response, and virtual power plants'),
    subtitle: l('灵活性能够改变用电时刻，但每一次调节都有能量和设备边界。', 'Flexibility can change timing, but every adjustment has energy and equipment limits.'),
    minutes: 29, prerequisites: ['09', '12', '18'],
    objectives: l(['用网侧功率、充放电效率和时长更新储能电量。', '计算一个完整循环的净能量毛收益并计入衰减。', '区分移峰、削减与聚合，检查服务承诺是否重复占用能力。'], ['Update stored energy using grid-side power, efficiency, and duration.', 'Calculate a complete cycle’s energy margin including a degradation charge.', 'Distinguish shifting, curtailment, and aggregation while checking double commitments.']),
    tags: l(['储能', '需求响应', '虚拟电厂'], ['Storage', 'Demand response', 'Virtual power plants']),
    figure: 'flexibility',
    figureCaption: l('把电池、可调负荷与分布式资源组织起来，仍需逐项守住物理约束。', 'Coordinate batteries, flexible load, and distributed resources while respecting each physical constraint.'),
    figureNotes: l(['电池可以跨时段搬运能量，但转换损耗会使卖出的电量少于买入电量。', '工厂用电可以有部分可调空间，生产约束决定哪些时段允许调节。', '聚合只是统一协调与参与接口，不会消除线路、容量或设备限制。'], ['A battery transfers energy between intervals, but conversion losses reduce the energy returned.', 'Some industrial demand may be flexible; production constraints determine what can move.', 'Aggregation provides coordination and participation interfaces without removing network or equipment limits.']),
    sections: [
      s('battery-state', '先把储能电量状态写对', 'Start with a correct stored-energy state', String.raw`令 $E_t$ 为电池内部可用电量 MWh，$P_t^c,P_t^d\ge0$ 分别为网侧充电与放电功率 MW，$\eta_c,\eta_d$ 为充、放电效率，时长 $\Delta t$ 用小时。状态更新为：

$$E_{t+1}=E_t+\eta_cP_t^c\Delta t-\frac{P_t^d\Delta t}{\eta_d}.$$

充电时只有部分网侧能量存入电池；放电向外送出 1 MWh，需要消耗更多内部能量。不能在两边都乘同一个效率。还需约束电量上下限、功率上限，并在本教学模型中要求充放电互斥，避免同一时段同时充放制造不合理账面收益。`, String.raw`Let $E_t$ be usable internal battery energy in MWh; $P_t^c,P_t^d\ge0$ are grid-side charging and discharging power in MW. Let charging and discharging efficiencies be $\eta_c,\eta_d$, with duration $\Delta t$ in hours. Then:

$$E_{t+1}=E_t+\eta_cP_t^c\Delta t-\frac{P_t^d\Delta t}{\eta_d}.$$

Only part of the grid-side charging energy enters storage. Delivering 1 MWh to the grid consumes more internal energy. Do not multiply by efficiency on both sides. Enforce energy and power bounds and, in this teaching model, mutually exclusive charging and discharging so simultaneous operation cannot create artificial accounting gains.`),
      s('economics', '价差足够大，才可能覆盖效率和衰减', 'A price spread must cover losses and degradation', String.raw`如果从网侧充入 1 MWh，完整循环能返回 $\eta_c\eta_d$ MWh。忽略其他费用时，收益是“卖电收入减买电成本”，再扣除与采用口径一致的衰减成本。买价 200、卖价 210 元/MWh 并不自动有利可图，损耗就可能超过价差。

比较策略必须统一初始电量与末端电量条件。若一个策略把原来库存全部卖掉，另一个策略保留库存，直接比较现金流会奖励前者消耗原有资产。可以要求期末回到相同电量，或显式计入期末库存价值；库存不能被当作免费获得的能源。`, String.raw`Charging 1 MWh at the grid returns $\eta_c\eta_d$ MWh over a complete cycle. Before other charges, the margin is sale revenue minus purchase cost, then a degradation charge under a clearly stated convention. Buying at 200 and selling at 210 yuan/MWh is not automatically attractive: conversion losses can outweigh the spread.

Compare strategies using consistent initial and terminal energy. A strategy liquidating the initial inventory should not be compared directly with one retaining it using cash flow alone. Require the same terminal energy or explicitly value terminal inventory; stored energy is not a free asset.`),
      s('demand-response', '移峰与削减承担不同生产代价', 'Shifting and curtailment have different production costs', String.raw`移峰把任务从一个时段移到另一个时段，常需要在允许窗口内保持总产量或总能量；削减则可能减少产量、降低舒适度或消耗工艺缓冲。两者不能都假设“电少用了，但业务完全不受影响”。某些负荷还有最小连续运行时间、爬坡、温度或库存约束，调节后可能出现反弹负荷。

需求响应的可核验贡献还依赖基线、计量与执行规则。基线是对未响应情况下用电的估计，不是用户随意填高的数字。把价格响应、指令响应与实际履约分开记录，才能区分模型建议、已承诺能力和真正交付的服务。`, String.raw`Load shifting moves a task between intervals, often preserving production or energy within an allowed window. Curtailment may reduce production or comfort, or use a process buffer. Neither should automatically assume lower electricity use with no business consequences. Minimum run times, ramps, temperatures, inventories, and rebound demand can constrain flexibility.

Verifiable demand response also depends on baseline, metering, and delivery rules. A baseline estimates counterfactual consumption without response; it is not an arbitrarily inflated number. Record price response, instructed response, and actual delivery separately to distinguish model recommendations, committed capacity, and delivered service.`),
      s('aggregation', '虚拟电厂聚合能力，也聚合责任', 'Aggregation combines capability and obligations', String.raw`虚拟电厂把分布式电源、储能或可调负荷组织成可协调的资源组合。聚合层要知道每个资源的位置、可用功率、持续时长、能量状态和通信条件，并把总体承诺分解成设备可执行的计划。资源数量增加，不代表所有能力可以简单无条件相加。

同一份能力不能重复承诺。例如电池已把全部可放电功率用于能量市场，就不能又把同样功率完整承诺为需要额外响应的备用，除非规则和物理余量确实允许。辅助服务、能量交易与需求响应的联合收益应经过共同约束和结算规则检验。`, String.raw`A virtual power plant coordinates distributed generation, storage, or flexible demand as a resource portfolio. Its aggregation layer needs each asset’s location, available power, sustainable duration, energy state, and communication conditions, then decomposes portfolio commitments into executable schedules. More resources do not mean every capacity figure can be added without conditions.

The same capability cannot be promised twice. A battery already using its full discharge power for energy cannot also promise that entire power as additional upward reserve unless physical headroom and rules actually permit it. Combined energy, ancillary-service, and demand-response revenues must share a consistent constraint and settlement model.`),
    ], lab: 'storage',
    workedExample: { title: l('1 MWh 充电，完整循环能赚多少能量毛收益？', 'What energy margin comes from charging 1 MWh for a complete cycle?'), body: l(String.raw`独立教学循环从空电池开始、回到空电池结束，假定容量和功率允许操作。网侧买入 1 MWh，买价 200 元/MWh；$\eta_c=\eta_d=0.95$，卖价 600 元/MWh。

存入电量为 0.95 MWh，网侧可售 $0.95\times0.95=0.9025$ MWh，往返效率为 90.25%。卖电收入 $0.9025\times600=541.5$ 元，扣除买电成本 200 元，能量毛收益为 341.5 元。

若采用每放出 1 MWh 收取 30 元衰减成本的教学近似，衰减费用为 $0.9025\times30=27.075$ 元，扣除后为 **314.425 元**。这不是项目净利润：未计投资、固定运维、税费与其他收费，也没有把初始库存当成免费电量。`, String.raw`Start and finish an independent teaching cycle with an empty battery, assuming sufficient power and capacity. Buy 1 MWh from the grid at 200 yuan/MWh; let $\eta_c=\eta_d=0.95$ and the sale price be 600 yuan/MWh.

Stored energy is 0.95 MWh, and grid-side energy sold is $0.95\times0.95=0.9025$ MWh. Round-trip efficiency is 90.25%. Revenue is $0.9025\times600=541.5$ yuan; subtracting the 200-yuan purchase gives an energy margin of 341.5 yuan.

With a teaching degradation charge of 30 yuan per MWh discharged, degradation costs $0.9025\times30=27.075$ yuan, leaving **314.425 yuan**. This is not project net profit: capital cost, fixed operation costs, taxes, and other charges are omitted, and no initial inventory is treated as free energy.`) },
    misconception: l('“买入 1 MWh，之后一定可以卖出 1 MWh。”充放电转换损耗降低可返回电量；还要考虑容量、功率、终端库存与衰减。', '“Buying 1 MWh guarantees that 1 MWh can later be sold.” Charging and discharging losses reduce returned energy, while capacity, power, terminal inventory, and degradation also matter.'),
    boundary: l('使用常数效率与线性衰减费用的教学储能模型，不表示实际电池寿命或项目盈利。需求响应与虚拟电厂参与资格、计量、基线和收入取决于所在地区规则；未模拟完整配电网及工艺动态。', 'The battery uses constant efficiencies and a linear degradation charge, not a validated lifetime or profitability model. Participation, metering, baselines, and revenues depend on local rules; full distribution-network and process dynamics are omitted.'),
    quiz: { question: l('网侧充入 1 MWh，充放电效率均为 95%，完整循环最多返回多少网侧电量？', 'With 1 MWh charged at the grid and 95% efficiency in each direction, how much grid-side energy returns over a full cycle?'), options: [
      option('1 MWh', '1 MWh', '这忽略了充电和放电的两次转换损耗；应把1 MWh乘以两侧效率的乘积。', 'That ignores both charging and discharging losses. Multiply 1 MWh by the product of the two efficiencies.'),
      option('0.95 MWh', '0.95 MWh', '0.95 MWh 是充电后内部电量，放电仍有一次效率损失。', 'That is internal energy after charging; discharging introduces another loss.'),
      option('0.9025 MWh', '0.9025 MWh', '1×0.95×0.95=0.9025 MWh，对应90.25%的往返效率。', '1×0.95×0.95=0.9025 MWh, corresponding to 90.25% round-trip efficiency.', true),
    ] }, sourceIds: ['nrel-storage', 'cn-basic-2024', 'cn-ancillary-2025', 'metering-settlement'],
  },
  {
    id: '20', moduleId: 'decisions', title: l('随机优化、CVaR与强化学习各做什么', 'Roles of stochastic optimization, CVaR, and reinforcement learning'),
    subtitle: l('先定义信息、目标和约束，再判断需要求解器还是学习策略。', 'Define information, objectives, and constraints before choosing a solver or learned policy.'),
    minutes: 32, prerequisites: ['03', '16', '17', '19'],
    objectives: l(['把场景概率、决策时点和可行约束组织成随机优化问题。', '按概率质量正确计算离散损失分布的上尾 CVaR。', '说明 RL 的状态、动作、奖励和可信评估要求。'], ['Form a stochastic optimization problem from scenarios, decision times, and constraints.', 'Compute upper-tail CVaR correctly for a discrete loss distribution.', 'Explain RL states, actions, rewards, and credible evaluation requirements.']),
    tags: l(['随机优化', 'CVaR', '强化学习与约束'], ['Stochastic optimization', 'CVaR', 'Reinforcement learning and constraints']),
    figure: 'decision-loop',
    figureCaption: l('预测提供未来情景，决策选择可行动作，执行结果再回到评估。', 'Forecasts provide future scenarios, decisions select feasible actions, and outcomes return to evaluation.'),
    figureNotes: l(['信息进入模型时必须保留发布时间，不能提前知道后来实现的情景。', '决策层同时处理成本、风险与物理边界，算法只是完成这一步的工具。', '反馈用于检验模型与策略，不表示未经验证的策略可以直接在线试错。'], ['Information entering the model retains its availability time; the realized future cannot be known in advance.', 'The decision layer handles costs, risk, and physical limits; an algorithm is a tool for that job.', 'Feedback evaluates models and policies, not permission for unvalidated live exploration.']),
    sections: [
      s('stochastic-program', '同一个事前决策面对多种未来', 'One advance decision faces several possible futures', String.raw`令 $x$ 表示先决定的合同电量或计划，情景 $s$ 有概率 $p_s$、后续成本 $C_s(x)$。风险中性模型最小化 $\sum_sp_sC_s(x)$，并要求 $x$ 位于可行集合：电量、功率、现金和合同条件都能形成约束。若允许观测新信息后再调整，可以加入后续决策，但它只能依赖当时已经揭晓的信息。

这里的关键是**非预见性**：在相同信息下不能因为后来发生的情景不同，就给同一个过去时点安排不同动作。若每个情景都提前选最便宜的完美动作，算出的是理想化全知结果，不能当成可部署策略的收益。相同场景集与一致的库存边界也是公平比较的前提。`, String.raw`Let $x$ be an advance contract quantity or schedule. Scenario $s$ has probability $p_s$ and cost $C_s(x)$. A risk-neutral model minimizes $\sum_sp_sC_s(x)$ subject to a feasible set covering energy, power, cash, and contract conditions. Recourse can adjust decisions after new information arrives, but only using information revealed by that time.

The key is **nonanticipativity**: identical information cannot justify different past actions merely because future scenarios differ. Choosing each scenario’s cheapest action with advance knowledge gives an idealized perfect-foresight result, not deployable policy performance. Common scenario sets and consistent inventory boundaries are also necessary for fair comparisons.`),
      s('cvar', 'CVaR看损失上尾，并保留恰好足量的概率', 'CVaR examines the upper loss tail with exactly the required probability mass', String.raw`先固定符号：$L$ 表示损失或采购成本，数值越大越差。采用下分位数定义 $\operatorname{VaR}_\alpha=\inf\{z:P(L\le z)\ge\alpha\}$。CVaR 对应最坏 $1-\alpha$ 概率质量的平均损失；离散分布中，阈值处的一个情景可能只需取其中一部分概率质量。

一个适用于离散情景的计算形式是：

$$\operatorname{CVaR}_\alpha(L)=\min_z\left[z+\frac{1}{1-\alpha}\sum_sp_s\max(L_s-z,0)\right].$$

因此不能总用“所有 $L\ge\operatorname{VaR}$ 的样本平均”代替。概率不同的情景要加权；置信水平越高，样本尾部越稀少，估计也更依赖极端情景覆盖。`, String.raw`Fix the sign convention: $L$ is loss or procurement cost, so larger values are worse. Use the lower quantile $\operatorname{VaR}_\alpha=\inf\{z:P(L\le z)\ge\alpha\}$. CVaR averages the worst $1-\alpha$ probability mass. In a discrete distribution, only part of the probability mass at a threshold may be needed.

A scenario-compatible form is:

$$\operatorname{CVaR}_\alpha(L)=\min_z\left[z+\frac{1}{1-\alpha}\sum_sp_s\max(L_s-z,0)\right].$$

Thus averaging all samples satisfying $L\ge\operatorname{VaR}$ is not generally correct. Unequal probabilities require weighting. Higher confidence levels leave fewer tail observations and make results more dependent on adequate extreme-scenario coverage.`),
      s('objective', '风险偏好不是额外发生的一笔账单', 'Risk preference is an objective choice, not another cash charge', String.raw`例如可以最小化 $(1-\lambda)\mathbb E[C]+\lambda\operatorname{CVaR}_\alpha(C)$，其中 $0\le\lambda\le1$。这是一种在平均与坏情景之间取舍的**评价目标**，并不表示企业实际付款时还要再加一笔 CVaR 费用。也可以最小化预期成本，并对 CVaR 设置上限，具体选择应对应业务风险要求。

目标之外仍需要硬约束。若成本与约束为线性，场景 CVaR 常能用辅助变量组织成线性规划；含充放电互斥或开停机时可能需要整数变量。应先建立可解释的规则、线性/混合整数优化或滚动优化基线，再判断更复杂算法带来了什么增益。`, String.raw`One objective is $(1-\lambda)\mathbb E[C]+\lambda\operatorname{CVaR}_\alpha(C)$ with $0\le\lambda\le1$. It is an **evaluation objective** trading average outcomes against adverse ones, not an additional CVaR cash charge on the bill. Another design minimizes expected cost subject to a CVaR cap. The choice should reflect business risk requirements.

Hard constraints remain necessary. With linear costs and constraints, auxiliary variables can express scenario CVaR in a linear program. Charging/discharging exclusivity or commitment decisions may introduce integer variables. Establish interpretable rules, linear or mixed-integer optimization, or a rolling-optimization baseline before judging what a more complex method adds.`),
      s('rl', '强化学习适合研究连续决策，但环境必须可信', 'RL can study sequential decisions, but the environment must be credible', String.raw`把问题写成 MDP 时，状态可包括当前电量、未完成生产任务、已持有合同、可用市场信息与已发布预测；动作可为可执行的充放电或采购调整；奖励可以是负的净成本，并正确计入衰减与期末库存。状态转移同时包含物理更新和不确定外部过程。若价格视为外生，必须明确价格接受者假设。

RL 通过交互数据学习状态到动作的策略，但不能省去模型核验。先检查仿真器、历史回放和离线评估，再与统一条件下的优化基线比较；训练数据范围外的策略效果尤其不确定。容量、功率、生产等硬限制应由可行动作集或独立约束执行机制落实，不能只靠一个有限惩罚项期待永不违规。现场电力交易与设备运行不适合直接用未验证策略试错。`, String.raw`An MDP state might contain current stored energy, unfinished production tasks, existing contracts, available market information, and already-issued forecasts. Actions might be feasible charging/discharging or procurement changes. Rewards can be negative net cost with degradation and terminal inventory properly accounted for. Transitions combine physical updates with uncertain external processes. Treating prices as exogenous requires an explicit price-taker assumption.

RL learns a state-to-action policy from interaction data without removing the need for validation. Check the simulator, historical replay, and offline evaluation, then compare against optimization baselines under common conditions. Effects outside the training-data support are particularly uncertain. Hard power, capacity, and production limits require feasible action sets or an independent constraint-enforcement mechanism; a finite penalty alone does not guarantee compliance. Unvalidated policies should not explore directly in live trading or equipment operation.`),
    ], lab: 'hedge',
    workedExample: { title: l('离散尾部的概率切分：VaR 不等于 CVaR', 'Splitting discrete tail mass: VaR differs from CVaR'), body: l(String.raw`独立教学损失分布：$L=[10,20,100]$ 千元，对应概率 $[0.80,0.15,0.05]$。期望为 $0.80\times10+0.15\times20+0.05\times100=16$ 千元。

采用下分位定义，$P(L\le20)=0.95$，因此 $\operatorname{VaR}_{0.95}=20$ 千元。最坏 5% 的概率质量全部落在损失 100 千元的情景，所以 $\operatorname{CVaR}_{0.95}=100$ 千元。

改用 90% 置信水平，需要最坏 10% 的概率质量：取全部 5% 的 100 千元情景，再从 20 千元情景的 15% 概率中取 5%。因此 $\operatorname{CVaR}_{0.90}=(0.05\times100+0.05\times20)/0.10=60$ 千元。把所有不低于 VaR 的情景按其条件概率平均会得到 40 千元，遗漏了“只取恰好 10% 上尾”的要求。`, String.raw`Independent teaching loss distribution: $L=[10,20,100]$ thousand yuan with probabilities $[0.80,0.15,0.05]$. Expected loss is $0.80\times10+0.15\times20+0.05\times100=16$ thousand yuan.

Under the lower-quantile definition, $P(L\le20)=0.95$, giving $\operatorname{VaR}_{0.95}=20$ thousand yuan. The worst 5% consists entirely of the 100-thousand-yuan outcome, so $\operatorname{CVaR}_{0.95}=100$ thousand yuan.

At 90% confidence, take the worst 10% of probability mass: all 5% at 100 plus 5% from the 15% mass at 20. Thus $\operatorname{CVaR}_{0.90}=(0.05\times100+0.05\times20)/0.10=60$ thousand yuan. The probability-weighted average of all outcomes at or above VaR is 40 thousand yuan; it fails to select exactly the worst 10%.`) },
    misconception: l('“训练一个 RL 智能体，就不需要写结算公式和设备约束。”错误环境会让策略学会利用仿真漏洞；结算、状态转移和可行动作边界仍须先定义正确。', '“Training an RL agent removes the need for settlement equations and equipment constraints.” A flawed environment rewards exploiting simulation errors; settlement, transitions, and feasible actions must still be defined correctly.'),
    boundary: l('CVaR例子是有限情景下的精确教学计算，不代表市场风险估计。采购实验用于比较情景成本与敞口，没有训练或部署 RL；概率失准、市场冲击、信用风险和未建模工况仍需独立研究。', 'The CVaR example is exact for a finite teaching distribution, not a market-risk estimate. The procurement lab compares scenario costs and exposure without training or deploying RL. Miscalibrated probabilities, market impact, credit risk, and unmodeled conditions require separate study.'),
    quiz: { question: l('损失[10,20,100]千元、概率[0.80,0.15,0.05]，95% CVaR是多少？', 'For losses [10,20,100] thousand yuan with probabilities [0.80,0.15,0.05], what is 95% CVaR?'), options: [
      option('16 千元', '16 thousand yuan', '16 是全部分布的期望，不是最坏5%尾部的平均。', 'Sixteen is the expectation over the entire distribution, not the average of its worst 5%.'),
      option('20 千元', '20 thousand yuan', '20 是采用下分位定义得到的95% VaR，不是尾部平均。', 'Twenty is 95% VaR under the lower-quantile definition, not the tail average.'),
      option('100 千元', '100 thousand yuan', '最坏5%概率恰好全部落在损失100千元的情景。', 'Exactly the worst 5% lies in the 100-thousand-yuan outcome.', true),
    ] }, sourceIds: ['cvar', 'cvar-general', 'sutton-barto', 'cn-basic-2024', 'fpp3'],
  },
];

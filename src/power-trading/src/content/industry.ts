import type { Chapter } from '../types';
import { l, option, s } from './helpers';

export const industryChapters: Chapter[] = [
  {
    id: '21', moduleId: 'industry', title: l('中国规则地图与安徽入口', 'China’s rule map and the Anhui entry point'),
    subtitle: l('学会查对版本、适用地区和生效日期，避免把旧规则变成新结论。', 'Check versions, regions, and effective dates before applying a rule.'), minutes: 28, prerequisites: ['10', '12', '18'],
    objectives: l(['区分全国基础规则、地方细则和具体合同。', '辨认已生效、历史参考及征求意见材料。', '用官方入口核对安徽业务需要的规则版本。'], ['Distinguish national foundations, local implementation, and contracts.', 'Identify effective rules, historical references, and consultation drafts.', 'Use official sources to check versions relevant to Anhui.']),
    tags: l(['中国电力市场', '安徽', '规则版本', '官方来源'], ['Chinese markets', 'Anhui', 'Rule versions', 'Official sources']), figure: 'decision-loop',
    figureCaption: l('从信息进入决策到结算复盘，规则版本和适用范围贯穿每一环。', 'Rule versions and scope accompany the entire process from information intake to decisions and settlement review.'),
    figureNotes: l(['在数据进入模型之前，先记录适用市场、主体和规则日期。', '预测进入决策时，需要叠加当地准入、申报和执行条件。', '复盘不只比较数字，也要检查该日采用的规则与合同版本。'], ['Before modeling, record the market, participant type, and rule date.', 'A forecast becomes a decision only after applicable entry, bidding, and operating conditions are included.', 'Review numerical outcomes together with the rule and contract versions used for that delivery day.']),
    sections: [
      s('layers', '一张地图，连接四类文件', 'Connect four kinds of documents', String.raw`阅读规则先定位层次：全国基础规则解释市场框架；全国某类交易规则细化中长期、辅助服务等产品；省级或区域实施细则说明当地组织方式；年度方案、交易公告与具体合同再落实执行安排。它们需要结合阅读，不能只凭一份介绍文章推导实际费用。

本课程把规则来源与教学公式分开：前者告诉你某个结论在哪里适用，后者帮助你理解变量之间的关系。一个正确的双结算算式，仍可能不是某类主体在某省的完整账单。查阅时保留文件全名、文号、发布与生效日期、适用主体和替代关系。`, String.raw`Start with document layers: national foundations describe the market framework; national product rules cover arrangements such as longer-term or ancillary-service markets; provincial or regional provisions specify local implementation; annual schemes, transaction notices, and contracts define execution. Read these together rather than deriving an actual bill from an introductory article.

This course separates rule sources from teaching formulas. Sources establish where a claim applies; formulas reveal relationships among variables. A mathematically correct two-settlement expression may still be incomplete for a participant in a particular province. Record the full title, document number, publication and effective dates, scope, and replacement relationships.`),
      s('versions', '截至 2026-11-15，哪些版本特别容易混淆', 'Version distinctions checked on 2026-11-15', String.raw`《电力市场运行基本规则》（2024 年第 20 号令）构成课程的市场框架来源。中长期部分采用发改能源规〔2025〕1656 号：该规则自 2026-03-01 施行，并明确替代 2020 年中长期基本规则及 2024 年绿色电力交易专章。绿电不是因为旧专章被替代就消失，而是要在新规则体系下阅读。

现货部分尤其需要版本标签：2023 年试行规则正文载明有效期截至 2026-10-15；2026-10-19 官方公布新版征求意见，意见截止日为 2026-11-18。本次核对不能把前者无条件称为现行，也不能把后者当作已经生效。课程保留 2023 文件用于解释机制，同时要求实际业务查验后续正式文件及地方有效细则；未确认的延期或替代关系不自行补写。`, String.raw`The 2024 No. 20 Electricity Market Operating Rules supply the course’s general framework. Longer-term trading uses document 1656 of 2025, effective 2026-03-01, which explicitly replaces the 2020 basic rules and the 2024 green-power chapter. Replacing that chapter does not abolish green trading; it changes the governing document set.

Spot references particularly need version labels. The 2023 trial document states an end date of 2026-10-15. An official revised consultation opened on 2026-10-19 and closes on 2026-11-18. This check does not establish the old document as unconditionally current or the draft as effective. The course uses the 2023 text to explain mechanisms; business use requires subsequent formal documents and applicable local provisions. Unverified extensions or replacements are not inferred.`),
      s('anhui', '安徽案例：先核对运行状态，再寻找适用细则', 'Anhui: verify operating status, then applicable implementation', String.raw`华东能源监管局 2026-09-09 公告确认安徽现货市场转入正式运行。公告介绍了煤电、用户、储能等参与安排，因此不能再把安徽整体描述为尚未进入正式运行。它是状态与制度背景来源，不是可直接编程的完整结算规范。

安徽中长期部分可从 2026-03-20 制发的《安徽电力中长期市场实施细则》进入，再核对适用年度方案、交易和结算细则。公告称“1+5”规则体系，不等于这门课已经逐条复现全部文件。本课程没有核定安徽当前完整现货结算参数，因此不把实验中的价差、时段、限价或偏差处理标为安徽实盘设置。`, String.raw`The East China energy regulator’s notice of 2026-09-09 confirms that Anhui’s spot market entered formal operation. It describes participation by coal generation, users, storage, and other resources. Anhui should therefore not be described as still awaiting formal operation. The notice establishes status and context, not a complete machine-readable settlement specification.

For longer-term trading, start with Anhui’s implementation provisions issued on 2026-03-20, then check the relevant annual scheme, trading arrangements, and settlement provisions. The announced “1+5” rule structure does not mean this course reproduces every document. Complete current Anhui spot-settlement parameters have not been established here, so lab intervals, limits, price differences, and deviation treatment are not presented as live Anhui settings.`),
      s('reading', '用一个具体问题训练规则阅读', 'Read rules around a concrete question', String.raw`例如：“这家工厂明天多用 2 MWh，如何结算？”先识别它是直接参与批发还是通过售电公司零售购电，再查合同所覆盖的时段、偏差条款和参考价格，然后核对当地现货及结算规则。最后确认计量点、计量周期、实际电量与结算科目。缺任一关键字段时，应把它标为待确认输入。

规则资料库同时保存适用起止日期与获取日期：今天下载的文件可能早已被替代，旧文件也可能仍适用于历史账单复算。页面参考资料附有版本状态和核对日期，目的是让读者能继续追到原文，而不是把一次检索日期当作永久有效保证。`, String.raw`Consider: “How is this factory settled if it consumes 2 MWh more tomorrow?” First identify whether it participates in wholesale trading or buys through a retailer. Check the contract’s delivery profile, deviation provisions, and reference price, then applicable local spot and settlement rules. Finally identify the metering point, interval, actual energy, and settlement items. Missing essential fields remain unresolved inputs.

Store applicability dates separately from retrieval dates. A file downloaded today may already be superseded; an older file may still govern a historical bill. The reference page records status and checking dates to support traceability, not to turn one search date into a permanent validity guarantee.`),
    ],
    workedExample: { title: l('同样多用 2 MWh，先问哪一条规则', 'An extra 2 MWh: identify the rule before the amount'), body: l(String.raw`在明确采用本课教学双结算、实时价为 700 元/MWh 且其他量固定时，多用 2 MWh 的新增实时项是 $2\times700=1400$ 元。这个结果只回答已定义模型的问题。若用户由零售套餐结算，还必须核对套餐的计价与偏差条款；若问完整电费，还需计入适用的其他科目。拿到“安徽、2 MWh、700 元/MWh”三个字段，仍不足以自动确认其实际账单。`, String.raw`Under the explicitly defined teaching two-settlement model, with a real-time price of 700 yuan/MWh and other quantities fixed, 2 MWh of additional consumption adds $2\times700=1400$ yuan to the real-time component. This answers only that model. A retail customer also requires its tariff and deviation terms; a complete bill requires other applicable items. The three fields “Anhui, 2 MWh, 700 yuan/MWh” do not establish an actual payable bill.`) },
    misconception: l('“官方来源就永远有效，最新发布日期就是最新生效规则。”还需核对生效、失效、替代、适用主体与文件性质。', '“An official source stays valid forever and the newest publication is the newest effective rule.” Effective dates, expiry, replacement, scope, and document type still matter.'),
    boundary: l('规则核对日期为 2026-11-15；本课提供可追溯学习入口，不提供已穷尽的安徽现行法规清单，也不替代具体交易与结算依据。', 'Rules were checked on 2026-11-15. This chapter offers traceable learning sources rather than an exhaustive inventory of effective Anhui requirements or a replacement for transaction and settlement documents.'),
    quiz: { question: l('2026-11-15 查到新版现货规则征求意见稿，应该怎样使用？', 'On 2026-11-15, how should a newly found spot-rule consultation draft be used?'), options: [option('立即替换业务系统全部有效规则', 'Immediately replace all effective production rules', '征求意见不等于已经生效，需要确认最终正式文本与实施时间。', 'Consultation is not implementation; a final document and effective date are needed.'), option('注明征求意见状态，用于跟踪变化并继续核对有效依据', 'Label it as a draft, track proposed changes, and verify effective sources', '文件性质与适用状态都保留下来，才能避免把提案当成义务。', 'Retaining document type and status prevents a proposal from becoming an assumed obligation.', true), option('因为是草案就断言现货交易已经停止', 'Conclude that spot trading has stopped because it is a draft', '规则修订动态不能直接推导地方市场的运行状态。', 'A rule revision does not establish that a regional market has stopped operating.')] }, sourceIds: ['cn-basic-2024', 'cn-midlong-2025', 'cn-spot-2023', 'cn-spot-draft-2026', 'anhui-rules-2026', 'anhui-start-2026', 'metering-settlement'],
  },
  {
    id: '22', moduleId: 'industry', title: l('工业用户与售电公司的业务全流程', 'The industrial customer and retailer workflow'),
    subtitle: l('把预测、合同、生产约束和结算连成一条可检查的工作流。', 'Connect forecasts, contracts, production constraints, and settlement into an inspectable workflow.'), minutes: 28, prerequisites: ['13', '17', '18', '19', '21'],
    objectives: l(['从客户计量和生产计划构造业务输入。', '区分降低预测误差、降低采购成本和改善客户服务。', '给工业柔性负荷建立可执行约束与复盘记录。'], ['Build business inputs from metering and production plans.', 'Distinguish forecast accuracy, procurement cost, and customer service.', 'Represent industrial flexibility with executable constraints and review records.']),
    tags: l(['工业用户', '售电', '柔性负荷', '业务闭环'], ['Industrial customers', 'Retailing', 'Flexible demand', 'Operations']), figure: 'flexibility',
    figureCaption: l('工厂、储能和分布式资源可以协调，但每一种资源都有自己的生产和设备边界。', 'Factories, storage, and distributed resources can coordinate, but each retains its own operating boundaries.'),
    figureNotes: l(['工厂的可调部分只占总负荷的一部分，不是每条生产线都能随价格启停。', '储能平移能量并承担效率损失；柔性负荷可能平移任务或改变产量。', '协同方案先满足产量、质量和设备约束，再比较电能量成本。'], ['Only part of factory demand may be flexible; not every production line can start and stop with prices.', 'Storage shifts energy with losses, while flexible demand may shift tasks or change production.', 'A coordinated plan first respects output, quality, and equipment constraints before comparing energy cost.']),
    sections: [
      s('inputs', '第一步：把客户变成一组可信输入', 'Step 1: turn customer operations into reliable inputs', String.raw`售电业务的输入不只是“这个月大约用多少电”。至少还要知道计量点与时间戳、历史分时用电、节假日安排、生产班次、检修与扩产计划，以及合同覆盖情况。账面电量与模型负荷曲线应在相同边界和单位下核对。

工业现场的异常停机、换料、设备维护会改变曲线。只根据天气预测工厂负荷，容易漏掉这些信息。把“预计发生、已确认发生、实际测量”分开保存，并记录获得时间，才能在事后还原交易员当时究竟知道什么。生产计划经客户授权进入模型，预测输出再经过业务可行性检查。`, String.raw`Retailing requires more than an approximate monthly energy total. Inputs include metering points and timestamps, historical interval consumption, holidays, shifts, maintenance and expansion plans, and contract coverage. Reconcile billing quantities and modeled load profiles within the same boundary and units.

Industrial outages, material changes, and equipment maintenance affect demand. Weather-only forecasting can miss these drivers. Store expected, confirmed, and measured events separately with their availability times so a later review can reconstruct what was known when the decision was made. Authorized production information enters the forecast, whose output then receives a business feasibility check.`),
      s('procure', '第二步：把需求分布变成采购和风险选择', 'Step 2: convert demand uncertainty into procurement choices', String.raw`在预测之外，还要选择合同覆盖量、时段曲线、可接受的价格暴露和剩余调整方式。可以同时比较低价、基准、高价以及需求偏差情景。评价不是只看平均采购价，而是看满足同一客户需求时的总成本、尾部损失和资金占用。

售电公司与用户的利益也需要通过合同清楚连接：用户希望费用与服务可预期，售电公司需要覆盖采购及运营成本并管理履约风险。固定零售价会把部分批发价格波动留给售电公司；浮动套餐则可能把部分波动传递给用户。如何分担取决于合法有效的套餐与当地规则，本课程不指定应选择哪种商业合同。`, String.raw`Beyond forecasting, choose contract volume, delivery profiles, acceptable price exposure, and adjustment arrangements. Compare low, central, and high prices alongside demand deviations. Evaluate total cost for the same served demand, tail losses, and financing needs rather than only average purchase price.

Retailer and customer interests require explicit contractual alignment. Customers seek predictable cost and service; retailers must cover procurement and operations while managing performance obligations. A fixed retail price can leave wholesale volatility with the retailer, whereas a floating arrangement can pass some exposure to customers. Allocation depends on valid contracts and applicable rules; the course does not prescribe a commercial tariff.`),
      s('flexibility', '第三步：给“挪一点负荷”补上生产约束', 'Step 3: add production constraints to load shifting', String.raw`把磨机、冷库或充电任务移到低价时段，必须说明可移动的任务、开始和完成时间、最小连续运行时长、设备功率、库存与产量约束。若改变工艺导致质量风险、额外启停损耗或下游等待，电费节省可能不足以补偿业务代价。

先用保能量的平移模型建立直觉：把 $\Delta E$ 从价格 $p_h$ 的时段移到 $p_l$ 的时段，忽略其他变化时节省 $\Delta E(p_h-p_l)$。真实优化再加入启停、效率、库存和交付约束。工厂设定值优化与电力采购可以相互提供信息，但不能把电价模型的输出直接当作未经检查的工艺控制指令。`, String.raw`Moving a mill, cold-store task, or charging job to cheaper hours requires a defined movable task, release and completion times, minimum run duration, power limits, inventory, and output constraints. Quality risk, restart losses, or downstream waiting may outweigh energy savings.

Start with energy-preserving shifting: moving $\Delta E$ from price $p_h$ to $p_l$ saves $\Delta E(p_h-p_l)$ when nothing else changes. Add starts, efficiency, inventory, and delivery constraints for operational optimization. Process setpoint optimization and energy procurement can exchange information, but a price-model output is not an unchecked process-control instruction.`),
      s('reconcile', '第四步：执行、核账、解释差异', 'Step 4: execute, reconcile, and explain deviations', String.raw`交付后，先对齐计量与交易时段，再计算适用的电能量和其他结算项目。把差异归因于用电量、价格、合同覆盖、执行偏差与规则变化，而不是把所有损失统称为“模型预测不好”。一个模型可能预测更准，却因合同或执行安排不当没有改善成本。

保留预测版本、输入快照、建议方案、人工确认、实际执行和结算结果，才能复算一次决策。向客户解释时用“哪一个时段、多少电量、哪个单价、哪条合同”展开。这个记录链也让下一轮模型更新有明确目标，而不是仅追求更复杂的网络结构。`, String.raw`After delivery, align metering and trading intervals before calculating applicable energy and other settlement items. Attribute differences to consumption, price, contract coverage, execution, and rule changes rather than labeling every loss a forecasting failure. Better predictions may fail to reduce cost when contracting or execution is poorly aligned.

Retain forecast versions, input snapshots, proposed schedules, human confirmations, actual execution, and settlement to reproduce a decision. Explain customer outcomes by interval, quantity, price, and contract provision. This record gives the next model update a concrete purpose instead of simply seeking a more complex architecture.`),
    ], lab: 'hedge',
    workedExample: { title: l('固定零售价下，批发风险由谁承担', 'Who bears wholesale risk under a fixed retail price?'), body: l(String.raw`教学交割块需求固定 100 MWh，零售价假设为 450 元/MWh，因此电能量收入 45000 元。若 60 MWh 以 380 元/MWh 覆盖、其余 40 MWh 现货价 500，采购成本 42800 元，未扣其他成本的差额为 2200 元。现货涨到 800 时，成本变为 $60\times380+40\times800=54800$ 元，差额变为 −9800 元。同样的售电量不保证同样利润；此例没有输配电、税费、信用损失或运营费用。`, String.raw`A teaching delivery block has fixed demand of 100 MWh and a hypothetical retail energy price of 450 yuan/MWh, yielding 45,000 yuan revenue. Covering 60 MWh at 380 and buying 40 MWh at spot price 500 costs 42,800 yuan, leaving 2,200 before other costs. At spot price 800, procurement becomes $60\times380+40\times800=54800$ yuan and the difference becomes −9,800. Equal sales volume does not guarantee equal profit. Transmission charges, taxes, credit losses, and operating expenses are omitted.`) },
    misconception: l('“只要电价预测更准，就一定能给工厂省钱。”节省还依赖可调整资源、合同、时段覆盖、生产约束和实际执行。', '“A better price forecast necessarily saves the factory money.” Savings also depend on controllable resources, contracts, timing, production constraints, and execution.'),
    boundary: l('工业资源与合同均为虚构教学场景；没有连接工厂控制系统、售电平台或客户计量接口，也不提供真实申报与合同建议。', 'Resources and contracts are fictional teaching scenarios. The course connects to no plant control system, retail platform, or customer meter and makes no actual bids or contract recommendations.'),
    quiz: { question: l('一个任务可无额外损失地把 5 MWh 从 700 元/MWh 移到 300 元/MWh，简化节省是多少？', 'A feasible task shifts 5 MWh from 700 to 300 yuan/MWh without other losses. What is the simplified saving?'), options: [option('2,000 元', '2,000 yuan', '5×(700−300)=2000；前提是生产约束允许且无额外成本。', '5×(700−300)=2000, assuming production feasibility and no extra cost.', true), option('3,500 元', '3,500 yuan', '这是原时段费用，移动后仍要支付 5×300 元。', 'That is the original cost; the shifted task still costs 5×300 yuan.'), option('5 MWh', '5 MWh', '任务移动了电量，本例并未减少电量；问题询问的是费用差。', 'Energy was shifted rather than reduced; the question asks for the cost difference.')] }, sourceIds: ['cn-midlong-2025', 'metering-settlement', 'fpp3', 'cn-ancillary-2025'],
  },
  {
    id: '23', moduleId: 'industry', title: l('综合项目：一天的交易决策', 'Capstone: one day of trading decisions'),
    subtitle: l('用同一组模拟数据，把预测、决策、执行与结算串起来。', 'Connect forecasts, decisions, execution, and settlement on one synthetic dataset.'), minutes: 36, prerequisites: ['13', '15', '16', '17', '18', '19', '20', '21', '22'],
    objectives: l(['为一个教学购电方定义清晰的数据和规则边界。', '计算分时日前安排、实时偏差和总电能量支出。', '用预测与成本两套指标解释决策结果。'], ['Define data and rule boundaries for a teaching electricity buyer.', 'Calculate interval day-ahead positions, real-time deviations, and total energy cost.', 'Explain results using both forecast and cost metrics.']),
    tags: l(['综合项目', '双结算', '模拟数据', '结果复算'], ['Capstone', 'Two-settlement', 'Synthetic data', 'Reproducibility']), figure: 'decision-loop',
    figureCaption: l('同一个交付日贯穿数据、预测、行动和结算，形成能复算的学习闭环。', 'One delivery day connects data, forecasts, actions, and settlement into a reproducible learning loop.'),
    figureNotes: l(['信息输入和实际结果分开：作出日前决定时，看不到之后的真实需求与实时价格。', '行动是带约束的数量选择，预测只是它的一个输入。', '复盘回到原始假设与算式，而不是只看最后一个收益数字。'], ['Separate information available before bidding from realized demand and real-time prices.', 'The action is a constrained quantity choice; the forecast is only one input.', 'Review the original assumptions and equations rather than only a final profit number.']),
    sections: [
      s('brief', '项目任务书：先把题目写完整', 'Project brief: define the problem completely', String.raw`你负责一个虚构工业用户的一天电能量采购。为了能手算，把一天划为 4 个等长 6 小时时段，这不是任何省份真实结算时段的声明。使用日前全电量加实时偏差的教学费用，不计合同差价、输配电和其他收费；本轮也不加入储能，以便隔离预测与结算的关系。

输入包括在日前已知的负荷预测、决策时可用的价格信息和时段长度。实际负荷及实时价格只在交付后揭示。首先比较“日前按负荷预测安排”的基线，再考虑前面课程中的合同、分位数或情景方法；每次只改一个因素，才能知道结果为何变化。`, String.raw`You manage one day of energy procurement for a fictional industrial consumer. Divide the day into four equal six-hour blocks so calculations remain inspectable; these are not claimed to be a province’s actual settlement intervals. Use the teaching day-ahead-plus-real-time-deviation formula, excluding contract differences, transmission, and other charges. Omit storage in this first pass to isolate forecasting and settlement.

Inputs include the demand forecast available before bidding, price information available when deciding, and interval duration. Actual demand and real-time prices are revealed only after delivery. Begin with a baseline that schedules forecast demand, then consider contract, quantile, or scenario approaches from earlier chapters. Change one factor at a time to understand causation.`),
      s('dataset', '四个时段，一张可复算的数据表', 'Four intervals and an auditable data table', String.raw`所有数据均为人工构造。功率是各时段平均值，电量统一乘以 6 h；价格单位为元/MWh。

| 时段 | 日前计划 MW | 实际负荷 MW | 日前价 | 实时价 |
|---|---:|---:|---:|---:|
| 00–06 | 10 | 10 | 200 | 180 |
| 06–12 | 11 | 12 | 350 | 400 |
| 12–18 | 12 | 14 | 500 | 700 |
| 18–24 | 9 | 8 | 250 | 200 |

日前量依次是 60、66、72、54 MWh，实际量为 60、72、84、48 MWh。总量分别为 252 与 264 MWh，但不要只用“总偏差 12 MWh”乘一个平均实时价：每个偏差发生的时段与价格都不同。`, String.raw`All values are manually constructed. Power is interval-average MW, energy is power times 6 h, and prices are yuan/MWh.

| Interval | Day-ahead MW | Actual MW | Day-ahead price | Real-time price |
|---|---:|---:|---:|---:|
| 00–06 | 10 | 10 | 200 | 180 |
| 06–12 | 11 | 12 | 350 | 400 |
| 12–18 | 12 | 14 | 500 | 700 |
| 18–24 | 9 | 8 | 250 | 200 |

Day-ahead energies are 60, 66, 72, and 54 MWh; actual energies are 60, 72, 84, and 48 MWh. Totals are 252 and 264 MWh. Do not multiply the net 12 MWh deviation by an arbitrary average real-time price: deviations occur at different times and prices.`),
      s('settle', '先分时清算，再汇总一天', 'Settle each interval before aggregating the day', String.raw`使用第 18 课的约定，购电方支出为正：

$$C=\sum_t\left[Q_t^{DA}p_t^{DA}+(Q_t^{act}-Q_t^{DA})p_t^{RT}\right].$$

日前项为 12000、23100、36000、13500 元，共 84600 元；实时偏差项为 0、2400、8400、−1200 元，共 9600 元。总电能量支出 94200 元，按实际量计算的平均值为 $94200/264\approx356.82$ 元/MWh。最后时段的负数是模型里的费用冲减，不是“负用电”。

下面的结算实验直接以 MWh 输入，适合独立调整电量和价格，观察偏差项如何变化。完整四时段账单按上表逐段复算后相加；不要把实验的一段结果误称为整天，也不要把六小时总电量误作 MW。`, String.raw`Following Chapter 18, positive values are buyer expenditures:

$$C=\sum_t\left[Q_t^{DA}p_t^{DA}+(Q_t^{act}-Q_t^{DA})p_t^{RT}\right].$$

Day-ahead components are 12,000, 23,100, 36,000, and 13,500 yuan, totaling 84,600. Real-time deviation components are 0, 2,400, 8,400, and −1,200, totaling 9,600. Total energy expenditure is 94,200 yuan, averaging $94200/264\approx356.82$ yuan/MWh of actual consumption. The negative final deviation component is a credit within this model, not negative consumption.

The settlement lab below takes energy directly in MWh and lets you independently vary quantities and prices to observe the deviation component. Reproduce the full day by calculating and adding the four table rows. A single lab interval is not a whole-day result, and six-hour energy must not be entered as MW.`),
      s('review', '把误差指标与业务结果放在一起解释', 'Explain error metrics and business results together', String.raw`四个时段的功率绝对误差为 0、1、2、1 MW，因此 MAE 为 1 MW。这个数字对每个等长时段一视同仁，但成本对时段价差敏感：第三时段的低估处在实时比日前更贵的情景，因此更值得关注。

用“事后知道实际需求并以其作为日前量”的诊断参考，日前费用会是 91200 元，相比本方案少 3000 元。它只是事后分解工具，不是可实现的交易策略；真实决策时不知道实际需求，也不能保证以同一价格成交。扩展项目时再加入情景概率、合同覆盖、库存和储能终端状态，每次保留一套不变的比较基线。`, String.raw`Absolute power errors are 0, 1, 2, and 1 MW, giving MAE of 1 MW. This weights each equal-duration interval equally, whereas cost is sensitive to price differences. Underforecasting the third block matters more in this scenario because its real-time price exceeds its day-ahead price.

A hindsight diagnostic using actual demand as the day-ahead quantity would have day-ahead expenditure of 91,200 yuan, 3,000 less than the chosen schedule. This is an attribution device, not an executable strategy: actual demand is unknown when deciding and identical execution prices are not guaranteed. Add scenario probabilities, contract coverage, inventory, and terminal battery states in extensions while preserving an unchanged comparison baseline.`),
    ], lab: 'settlement',
    workedExample: { title: l('第三时段的 12 MWh 偏差', 'The third interval’s 12 MWh deviation'), body: l(String.raw`12–18 时段的日前量为 $12\times6=72$ MWh，实际量为 $14\times6=84$ MWh。电能量支出为 $72\times500+(84-72)\times700=44400$ 元。若只把 84 MWh 乘日前价会得到 42000 元，漏掉的 2400 元正是 $12\times(700-500)$。若把 84 MWh 全按实时价计算则为 58800 元，又错误地丢掉了日前已经安排的头寸。`, String.raw`For 12–18, day-ahead energy is $12\times6=72$ MWh and actual energy is $14\times6=84$ MWh. Energy expenditure is $72\times500+(84-72)\times700=44400$ yuan. Multiplying all 84 MWh by the day-ahead price gives 42,000 and misses $12\times(700-500)=2400$ yuan. Multiplying all energy by the real-time price instead gives 58,800 and incorrectly discards the day-ahead position.`) },
    misconception: l('“只要一天总量预测准，就不需要分时预测。”相同总量在不同时间发生，会产生不同的价格暴露和约束。', '“An accurate daily energy total removes the need for interval forecasts.” Equal totals delivered at different times create different price exposure and constraints.'),
    boundary: l('四个六小时时段与所有价格均为教学数据；没有实际市场申报、真实训练结果或安徽结算复现。事后完美信息只作诊断，不作为可交易收益。', 'The four six-hour intervals and all prices are synthetic. There are no actual bids, real training results, or reproductions of Anhui settlement. Perfect hindsight is diagnostic and is not claimed as tradable performance.'),
    quiz: { question: l('为什么最后时段的实时偏差项是 −1200 元？', 'Why is the final real-time deviation component −1,200 yuan?'), options: [option('工厂实际发出了 6 MWh 电', 'The factory actually generated 6 MWh', '实际用电仍为 48 MWh；负号来自实际量少于日前安排。', 'Actual consumption is still 48 MWh; the sign reflects consumption below the day-ahead position.'), option('实际比日前少用 6 MWh，按 200 元/MWh 冲减', 'Consumption is 6 MWh below the day-ahead position, credited at 200', '(48−54)×200=−1200，是这个教学结算模型的偏差项。', '(48−54)×200=−1200 is the deviation component in this teaching model.', true), option('所有偏差都必须按罚款记录', 'Every deviation must be recorded as a penalty', '偏差结算与额外考核不是同一个概念；不能把所有差额都当作罚款。', 'Deviation settlement and additional penalties are different; not every difference is a fine.')] }, sourceIds: ['cn-spot-2023', 'metering-settlement', 'fpp3', 'sklearn-timeseries'],
  },
  {
    id: '24', moduleId: 'industry', title: l('验证、上线边界与进阶路径', 'Validation, deployment boundaries, and the next steps'),
    subtitle: l('把一个能解释的教学原型，变成可评估、可维护的研究起点。', 'Turn an explainable teaching prototype into an evaluable, maintainable research starting point.'), minutes: 29, prerequisites: ['15', '20', '23'],
    objectives: l(['建立预测、决策和执行三层评价。', '识别回测中的未来信息与模拟收益偏差。', '规划从离线实验到影子运行的分阶段验证。'], ['Evaluate forecasting, decisions, and execution separately.', 'Recognize future-information leakage and simulated-profit bias.', 'Plan staged validation from offline study to shadow operation.']),
    tags: l(['验证', '数据泄露', '上线边界', '进阶路径'], ['Validation', 'Data leakage', 'Deployment boundaries', 'Further study']), figure: 'decision-loop',
    figureCaption: l('闭环中的每一段都能独立失败，因此评估需要逐段定位。', 'Every part of the loop can fail independently, so evaluation must locate the failure.'),
    figureNotes: l(['先检查输入是否在决策时可获得，再看模型表现。', '决策结果要与同约束、同信息下的基线比较。', '执行与结算反馈用于诊断，不应悄悄进入历史训练特征。'], ['Check information availability before assessing model performance.', 'Compare decisions against baselines with the same constraints and information.', 'Execution and settlement feedback support diagnosis; they must not silently enter historical features.']),
    sections: [
      s('evaluate', '三层评价：预测对不对、决策值不值、行动做不做得到', 'Three questions: accuracy, value, and feasibility', String.raw`预测层检查 MAE、RMSE、分位数损失和区间覆盖，按季节、时段与异常事件分组；不要只报一个全年均值。决策层在同一需求、规则与可用信息下比较采购成本、尾部损失和约束违例，明确费用口径。执行层检查建议是否及时到达、是否可执行，以及实际计量是否与计划匹配。

一项改进可能只作用于其中一层。区间更可靠不保证平均成本下降，但可能帮助控制尾部风险；模型更快也不保证报价合法或执行成功。报告要把假设、比较对象、样本区间和失败案例放在结果旁边，使结论可以复查。`, String.raw`Forecast evaluation covers MAE, RMSE, quantile loss, and interval coverage, split by season, interval, and unusual events rather than only one annual average. Decision evaluation compares procurement cost, tail losses, and violations under identical demand, rules, and available information, with clearly defined cost components. Execution evaluation checks timeliness, feasibility, and measured delivery against plans.

An improvement may affect only one layer. Better-calibrated intervals may support tail-risk control without lowering average cost; faster inference does not ensure valid bids or successful execution. Report assumptions, comparators, sample periods, and failures beside results so conclusions remain auditable.`),
      s('leakage', '回测最危险的错误：提前看到了答案', 'The critical backtest failure: seeing the answer early', String.raw`按日期切分只是第一步。特征还需要“在当时已经发布”的时间戳：未来实际天气、事后修订负荷和交付后的结算价，即使行号落在训练窗口，也不能被当作提前预测时可获得的输入。归一化、补缺和特征选择只能在相应训练段拟合。

反复查看测试集、选择表现最好的策略再称其为独立验证，也会带来乐观偏差。用训练期估计参数、验证期决定模型与策略、保留测试期作最终检查，并采用符合预测跨度的滚动回测。重叠预测标签是否需要间隔，应根据标签可用时间与任务定义判断，不能只记住某个固定 gap。`, String.raw`A chronological split is only the first step. Features also need publication timestamps: future realized weather, revised historical load, and post-delivery settlement prices are not valid forecast-time inputs merely because their row indices appear in a training window. Scaling, imputation, and feature selection must be fitted within the corresponding training segment.

Repeatedly inspecting a test set and selecting the best strategy before claiming independent validation also creates optimism. Estimate parameters in training, choose models and policies in validation, and reserve a test period for final assessment. Use rolling evaluation appropriate to the forecast horizon; any gap for overlapping targets depends on label availability and the task rather than a memorized constant.`),
      s('stages', '从离线到影子运行，逐步增加真实约束', 'Add operational constraints through staged evaluation', String.raw`第一阶段是可复现的离线实验：固定数据版本、单位、时间划分和规则，验证每个费用项与约束。第二阶段是影子运行：接收当时可用的输入并生成建议，但不自动提交实际交易，比较后来发生的结果。第三阶段才是在明确权限和人工审核条件下考虑受限业务使用，并保留撤回与回退途径。

持续监测输入缺失、时间错位、价格异常、模型漂移与规则变更。变化出现时，系统应该能退回已经定义的基线或人工处理，而不是在未知状态下继续输出貌似精确的收益。这里的进阶路线是工程研究建议，不能代替市场主体自身的业务准入与交易管理要求。`, String.raw`Begin with reproducible offline studies: fix data versions, units, temporal splits, and rules, then verify every cost term and constraint. Next, run in shadow mode using information available at the time, generate recommendations without automatically submitting transactions, and compare realized outcomes. Only then consider limited operational use under explicit authority and review arrangements, with defined withdrawal and fallback procedures.

Monitor missing inputs, timestamp errors, unusual prices, model drift, and rule changes. When assumptions fail, fall back to a defined baseline or human handling rather than continuing to emit apparently precise profit estimates. This is a research-engineering pathway, not a substitute for market-entry and business-management requirements.`),
      s('path', '下一步学什么，由当前问题决定', 'Choose the next topic from the current problem', String.raw`如果误差主要来自时间结构，继续学习时间序列、概率预测和不同跨度的评估；如果预测不错但方案不可行，学习线性/混合整数优化、储能与生产建模；如果区域价格差解释不足，再学习潮流、DCOPF、机组组合与安全约束出清。

需要研究连续决策时，再考虑随机优化、模型预测控制或强化学习，并先建立可靠环境与基线。复杂算法不会自动修复错误规则和有泄露的数据。用一个小项目持续升级：从第 23 课的四时段算例开始，增加一个明确功能，解释新增假设，再展示它如何改变验证结果。`, String.raw`If errors arise mainly from temporal structure, study time series, probabilistic forecasts, and horizon-specific evaluation. If forecasts are useful but schedules infeasible, study linear and mixed-integer optimization plus storage and production modeling. If regional price differences remain unexplained, move to power flow, DCOPF, unit commitment, and security-constrained clearing.

For sequential decisions, consider stochastic optimization, model predictive control, or reinforcement learning after establishing a credible environment and baselines. Algorithmic complexity does not repair wrong rules or leaky data. Keep upgrading one small project: start with Chapter 23’s four intervals, add a clearly defined feature, state its new assumptions, and show how it changes evaluation.`),
    ], lab: 'backtest',
    workedExample: { title: l('MAE 更小，不一定少花钱', 'Lower MAE need not mean lower procurement cost'), body: l(String.raw`两个独立的一小时时段采用同一教学双结算。策略 A 的低估误差分别为 1、0 MW；策略 B 为 0、2 MW，因此 MAE 分别是 0.5、1 MW。若实时减日前价分别为 500、10 元/MWh，相对“按实际需求安排日前量”的事后诊断参考，A 的价差成本为 $1\times500=500$ 元，B 为 $2\times10=20$ 元。A 的 MAE 更小却更贵。这个刻意构造的例子只说明两种目标不等价，不能据此证明 B 在未来总是更好。`, String.raw`Consider two independent one-hour intervals under the same teaching settlement. Strategy A underforecasts by 1 and 0 MW; B by 0 and 2 MW, giving MAE of 0.5 and 1 MW. If real-time minus day-ahead prices are 500 and 10 yuan/MWh, their spread costs relative to a hindsight actual-demand day-ahead schedule are $1\times500=500$ yuan and $2\times10=20$ yuan. A is more accurate by MAE but more expensive. This constructed example establishes that the objectives differ, not that B is always better in future data.`) },
    misconception: l('“回测收益高就能直接自动交易。”先检查信息是否可获得、基线是否公平、规则是否适用、约束是否完整和执行是否可行。', '“High backtest profit is sufficient for automatic trading.” Check information availability, fair baselines, applicable rules, complete constraints, and executable actions first.'),
    boundary: l('本网站是本地教学系统：模型、价格、市场和工业案例用于学习；页面实验不构成真实市场接入、收益承诺或已验证生产策略。', 'This website is a local educational system. Its models, prices, market mechanisms, and industrial examples support learning; the labs are not market access, promised returns, or validated production strategies.'),
    quiz: { question: l('预测明天负荷时，把“明天实际温度”放进历史回测特征，会怎样？', 'What happens if tomorrow’s realized temperature enters a historical backtest for forecasting tomorrow’s load?'), options: [option('只要按日期切分就没有问题', 'It is safe as long as dates are split chronologically', '时间切分不能让当时尚未获得的信息变成可用信息。', 'A chronological split cannot make unavailable information available.'), option('模型层数越多，越能消除这个问题', 'A deeper network removes the problem', '这是信息边界错误，不是网络容量不足。', 'This is an information-boundary error, not insufficient model capacity.'), option('形成未来信息泄露，应使用当时可获得的天气预报', 'It leaks future information; use the forecast available at the decision time', '正确输入取决于发布时点；还要保留当时的预报版本。', 'Valid inputs depend on publication time; retain the historical forecast version too.', true)] }, sourceIds: ['sklearn-leakage', 'sklearn-timeseries', 'fpp3', 'cvar', 'cn-basic-2024'],
  },
];

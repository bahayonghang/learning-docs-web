import type { Chapter } from '../types';
import { l, option, s } from './helpers';

export const marketChapters: Chapter[] = [
  {
    id: '09', moduleId: 'markets', title: l('电力平衡、参与者与交易对象', 'Power balance, participants, and products'),
    subtitle: l('先跟着一度电认识系统，再跟着一笔合同认识市场。', 'Follow electricity through the system, then follow a contract through the market.'), minutes: 24, prerequisites: ['01', '02'],
    objectives: l(['区分功率、电量、容量和灵活性。', '说清发电、用电、交易、调度与电网各自的作用。', '把每个时段的供需平衡写成带单位的等式。'], ['Distinguish power, energy, capacity, and flexibility.', 'Explain the roles of generation, consumption, trading, dispatch, and the grid.', 'Write a balance equation with consistent units for each interval.']),
    tags: l(['电力基础', '功率与电量', '市场主体', '供需平衡'], ['Power systems', 'Power and energy', 'Participants', 'Balance']), figure: 'power-system',
    figureCaption: l('发电侧、电网、用户与储能共享一个物理系统，交易关系建立在这个系统之上。', 'Generators, the grid, consumers, and storage share a physical system on which commercial relationships are built.'),
    figureNotes: l(['先找发电与用电设施，思考每个时刻谁在提供或消耗功率。', '储能的作用随充电和放电切换：充电增加需求，放电提供电力。', '图中连线表达关系；真实潮流和合同关系需要分别建模，不能按图追踪某一笔合同的电子。'], ['Locate generation and consumption and ask who supplies or consumes power at each instant.', 'Storage changes roles: charging adds demand and discharging supplies power.', 'Connections show relationships; physical flows and contracts require separate models, so individual contracted electrons cannot be traced through this illustration.']),
    sections: [
      s('units', '从功率走到电量，再走到费用', 'From power to energy to cost', String.raw`“工厂用了 10 MW 电”还不是完整的电量描述：MW 是速度，需要补上持续时间。若一个时段内平均功率为 $P$、长度为 $\Delta t$ 小时，电量就是 $E=P\Delta t$ MWh。负荷曲线下各小块面积相加，才是一整天的用电量；不同长度时段不能直接把功率数值相加当成电量。

容量描述设备可以提供的功率或储存的能量。一个标为“10 MW / 20 MWh”的电池同时给出了功率与能量两个上限。灵活性则关注能多快改变、能持续多久，以及付出什么代价。采购电能量、购买备用能力与安排电池充放电，解决的是不同问题。`, String.raw`“The factory used 10 MW” does not yet specify an energy quantity: MW is a rate and requires a duration. For interval-average power $P$ and duration $\Delta t$ hours, energy is $E=P\Delta t$ MWh. Summing areas under a load curve gives daily energy; powers from unequal intervals cannot simply be added as energy.

Capacity can describe available power or stored energy. A “10 MW / 20 MWh” battery has separate power and energy limits. Flexibility concerns how quickly output can change, for how long, and at what cost. Buying energy, procuring reserve capability, and scheduling a battery address different needs.`),
      s('balance', '交易计划最终要落到物理平衡', 'Commercial schedules must respect physical balance', String.raw`从一个区域的简化边界看，每个时段都要满足：

$$P_{\mathrm{generation}}+P_{\mathrm{import}}+P_{\mathrm{discharge}}=P_{\mathrm{load}}+P_{\mathrm{export}}+P_{\mathrm{charge}}+P_{\mathrm{loss}}.$$

这不是说交易员需要每秒亲自平衡系统。市场形成计划与价格，调度根据运行条件组织执行，并安排备用等调节资源。天气、故障和用户行为会使实际结果偏离预测，因此日前计划不是对未来物理状态的保证。

本课先把损耗设为零，学会核对供需。以后加入网络和储能时，应把相应项加回模型。不能为了让等式成立，悄悄删除未满足的需求；缺额必须单独显示。`, String.raw`For a simplified regional boundary, each interval must satisfy:

$$P_{\mathrm{generation}}+P_{\mathrm{import}}+P_{\mathrm{discharge}}=P_{\mathrm{load}}+P_{\mathrm{export}}+P_{\mathrm{charge}}+P_{\mathrm{loss}}.$$

This does not mean a trader personally balances the grid every second. Markets establish schedules and prices; dispatch coordinates execution under operating conditions and arranges balancing resources such as reserves. Weather, outages, and consumer behavior make actual outcomes differ from forecasts, so a day-ahead schedule is not a guarantee of tomorrow’s physical state.

Begin with zero losses and check supply against demand. Add network and storage terms when those features enter the model. Never silently remove unmet demand to force balance: explicitly report a shortfall.`),
      s('roles', '五种角色，不是五个互不相关的系统', 'Five roles within one connected system', String.raw`发电企业提供电能量及其具备条件的服务；电力用户提出用电需求；售电公司汇集客户需求、采购并管理合同和价格风险。虚拟电厂、聚合商或储能等新型主体，是否能提供某项产品，要看资源能力和当地准入规则。

电力交易机构组织交易并提供相关服务，电力调度机构组织系统运行；电网企业提供输配电等服务并依规开展计量和电费收付。角色可能在业务流程中密切配合，但“撮合一笔交易”和“决定实时安全运行方式”不是同一项工作。

市场允许谁参与、谁报价、谁只申报数量，须查适用规则。不要把国外市场的组织名称和权限直接套到中国，也不要把一个省的申报模式扩展成全国固定模式。`, String.raw`Generators supply energy and eligible services; consumers require electricity; retailers aggregate customer demand, procure supply, and manage contracts and price exposure. Whether a virtual power plant, aggregator, or storage operator may offer a product depends on its resources and applicable entry rules.

Trading institutions organize transactions and related services, dispatch institutions coordinate system operations, and grid companies provide transmission and distribution plus regulated metering and billing functions. These roles cooperate, but arranging a transaction and determining a secure real-time operating state are different tasks.

Check applicable rules for participation and bidding rights. Do not transfer another country’s institutional responsibilities directly into China, or present one province’s bidding arrangements as a nationwide constant.`),
      s('three-flows', '区分电力流、合同流与资金流', 'Separate physical, contractual, and financial flows', String.raw`工厂与某风电场签订购电合同，意味着形成约定的商业权利义务；它通常不意味着电网为两者开辟一条专用电子通道。电力流取决于电网结构和运行状态，合同记载时段、数量、价格及责任，结算依据实际计量和市场规则形成资金流。

读一份交易数据时，先问“这一列属于哪条流”：MW 可能是功率计划，MWh 可能是交割电量，元/MWh 是单价，元才是费用。相同的 100 出现在不同列，含义完全不同。后续预测模型的标签、优化模型的变量与结算公式，都要沿用这套单位和边界。`, String.raw`A factory’s purchase contract with a wind farm establishes commercial rights and obligations; it generally does not create a dedicated path for identifiable electrons. Physical flows depend on network structure and operating conditions. Contracts record intervals, quantities, prices, and responsibilities; settlement translates metered outcomes and rules into money.

For each data column, ask which flow it describes: MW may represent a power schedule, MWh an energy quantity, currency/MWh a price, and currency a payment. The same number, 100, means very different things in these columns. Forecast targets, optimization variables, and settlement formulas must preserve these units and boundaries.`),
    ], lab: 'energy',
    workedExample: { title: l('15 分钟内，发电、储能和用户如何对上账', 'Balance generation, storage, and consumption over 15 minutes'), body: l(String.raw`教学区域发电 90 MW、进口 20 MW，工厂负荷 100 MW、电池充电 10 MW，忽略损耗：$90+20=100+10$。15 分钟为 0.25 h，所以工厂用电 25 MWh、电池从电网吸收 2.5 MWh。若只计算工厂的电能量费用，单价为 400 元/MWh，则为 $25\times400=10000$ 元；电池充电电量不能再混入工厂这笔费用。`, String.raw`A teaching region generates 90 MW and imports 20 MW while a factory consumes 100 MW and a battery charges at 10 MW. Ignoring losses, $90+20=100+10$. Over 0.25 h, the factory uses 25 MWh and the battery draws 2.5 MWh from the grid. At 400 yuan/MWh, the factory’s energy component is $25\times400=10000$ yuan. Do not also include the battery’s separately defined charging energy in that factory bill.`) },
    misconception: l('“签了某电厂的合同，就能沿电线识别买来的那批电。”合同、物理潮流和费用记录是相互关联但不同的对象。', '“A contract with a plant identifies its particular electricity along the wires.” Contracts, physical flows, and financial records are related but distinct objects.'),
    boundary: l('平衡式是区域、时段平均的教学表达；未模拟频率、电压、无功、网损或事故过程，也不替代调度安全校核。', 'The balance is an interval-average regional teaching model. It omits frequency, voltage, reactive power, losses, and contingencies and does not replace operational security checks.'),
    quiz: { question: l('一个负荷连续 15 分钟保持 80 MW，其电量是多少？', 'A load remains at 80 MW for 15 minutes. How much energy does it use?'), options: [option('80 MWh', '80 MWh', '80 MWh 对应持续一小时；这里时段只有 0.25 h。', '80 MWh would correspond to one hour; this interval is 0.25 h.'), option('20 MWh', '20 MWh', '电量 = 80 MW × 0.25 h = 20 MWh。', 'Energy = 80 MW × 0.25 h = 20 MWh.', true), option('320 MWh', '320 MWh', '应乘持续时间，而不是除以 0.25 h。', 'Multiply by duration rather than dividing by 0.25 h.')] }, sourceIds: ['eia-units', 'cn-basic-2024', 'metering-settlement'],
  },
  {
    id: '10', moduleId: 'markets', title: l('中长期、现货、辅助服务与绿电绿证', 'Contracts, spot markets, ancillary services, and green attributes'),
    subtitle: l('同一个电力系统，为什么需要多种交易安排？', 'Why does one power system need several types of transactions?'), minutes: 27, prerequisites: ['09'],
    objectives: l(['按时间尺度和交易对象区分市场。', '说明中长期合同与现货结算如何共同管理价格暴露。', '区分电能量、调节服务和绿证环境属性。'], ['Distinguish markets by timing and product.', 'Explain how contracts and spot settlement shape price exposure.', 'Separate energy, balancing services, and green environmental attributes.']),
    tags: l(['中长期', '现货', '辅助服务', '绿证'], ['Contracts', 'Spot markets', 'Ancillary services', 'Green certificates']), figure: 'power-system',
    figureCaption: l('相同的电源、电网与用户，可以围绕不同时间尺度和不同产品建立交易关系。', 'The same generators, grid, and consumers can trade different products over different time horizons.'),
    figureNotes: l(['先看物理资源，再问它能提供电能量、备用能力还是调节服务。', '储能与可调负荷的价值来自可执行的调节能力，不能只看名称。', '新能源的电能量与绿色属性分开解释；图中颜色不代表经过核证的环境声明。'], ['Start with physical resources, then ask whether they provide energy, reserve capability, or balancing services.', 'The value of storage and flexible demand depends on executable flexibility, not their labels.', 'Separate renewable energy from its environmental attributes; illustration colors are not certified environmental claims.']),
    sections: [
      s('horizons', '先安排长期敞口，再处理临近交付的变化', 'Manage longer-horizon exposure and near-delivery changes', String.raw`中长期交易为未来交割安排数量、价格、时段曲线和责任，可以覆盖数年、年度、月度和月内。它让买卖双方更早管理不确定性，但“年度合同”不等于全年每小时都用同样功率，更不等于预测和偏差管理从此消失。

现货围绕更接近交付的时间组织。日前使用当时掌握的信息安排下一天，日内和实时可以进一步反映条件变化。具体有哪些环节、是否有财务结算以及如何与中长期衔接，取决于适用市场规则。可以先把它理解为逐步修正信息的过程，再学习当地的执行细节。`, String.raw`Longer-term transactions specify quantities, prices, delivery profiles, and responsibilities for future delivery, potentially across multiple years, a year, a month, or within a month. They help manage uncertainty earlier. An annual contract does not imply constant hourly power throughout the year or remove the need for forecasting and deviation management.

Spot arrangements operate nearer delivery. Day-ahead scheduling uses information available at that time, while intraday and real-time arrangements can reflect subsequent changes. The available stages, their financial settlement, and their links to contracts depend on market rules. First understand progressive information updates, then examine the applicable implementation.`),
      s('contracts', '合同不是给每个时段贴一个固定电价', 'A contract does not automatically fix every interval’s total price', String.raw`假设用电量固定为 $Q$，其中 $q_c$ 按合同价 $K$ 购入，其余按现货价 $p$ 购入，简化费用为 $C=q_cK+(Q-q_c)p$。这个式子用于认识“覆盖量”和“未覆盖量”：合同覆盖越大，剩余现货价格暴露通常越小，但合同也可能比之后的现货贵。

若实际用电量不确定，合同过量或不足都需要依规处理；还要看覆盖的是哪个时段、哪个结算参考点。总量对上但小时曲线不对，仍会有风险。第 17、18 课把这种直觉展开为采购情景和日前/实时结算，不能把本节的一行公式当作全国统一账单。`, String.raw`Suppose demand is fixed at $Q$, with $q_c$ purchased at contract price $K$ and the remainder at spot price $p$. The teaching cost is $C=q_cK+(Q-q_c)p$. It distinguishes covered and uncovered energy: more coverage usually reduces remaining spot-price exposure, but the contract can be more expensive than the eventual spot market.

When actual demand is uncertain, excess and insufficient coverage require settlement under applicable rules. Delivery intervals and reference locations matter too. Matching total volume while mismatching hourly profiles still leaves risk. Chapters 17 and 18 develop procurement scenarios and day-ahead/real-time settlement; this one-line model is not a national billing formula.`),
      s('services', '辅助服务购买的是系统需要的调节', 'Ancillary services procure needed system flexibility', String.raw`电能量交易回答“在这个时段提供或消费多少电”。辅助服务还关心“出现变化时，谁能及时响应”：调频关注相应的频率调节能力，备用为可能发生的供需变化预留能力。不同品种的资格、响应要求、计价和考核并不相同。

同一块电池不能把全部功率同时承诺给互不兼容的任务。联合安排需要考虑机会成本、能量状态和履约约束。中国 2025 年辅助服务基本规则还要求，现货连续运行地区由现货价格发挥相应调峰作用，不再运行调峰及类似功能市场；不能把历史上的各类补偿无限叠加为当前收益。`, String.raw`Energy trading answers how much electricity is delivered or consumed during an interval. Ancillary services also ask who can respond when conditions change: frequency regulation supports frequency control, while reserve holds capability for possible supply-demand changes. Eligibility, response requirements, pricing, and performance assessment differ by product.

A battery cannot simultaneously promise all its power to incompatible obligations. Joint scheduling must account for opportunity cost, energy state, and delivery constraints. China’s 2025 ancillary-service rules also address the transition of peak-shaving functions to continuous spot markets; historical compensation mechanisms should not simply be stacked into a current revenue estimate.`),
      s('green', '绿电与绿证：分清电能量和环境属性', 'Green electricity and certificates: separate energy and attributes', String.raw`绿电交易涉及符合条件的可再生能源电能量及相应绿色属性，绿证则是该属性的凭证。中国绿证的基本单位是 1 个对应 1000 kWh，也就是 1 MWh。绿证可以帮助核验可再生能源消费，但不是“每张抵扣一吨碳”的通用碳信用。

读合同要分别识别电能量价格、绿证数量和价格、交割与核销安排。已声明的同一环境属性不能反复当作不同主体的新贡献。依据 2025 年绿证管理实施细则，独立储能放电不核发绿证；从 2026 年起，声明绿色消费的核销还须遵守生产年份与消费年份匹配等要求。课程的数量换算不替代具体项目的核发资格审查。`, String.raw`Green-power transactions involve eligible renewable energy and corresponding environmental attributes; certificates document those attributes. In China, one green electricity certificate corresponds to 1,000 kWh, or 1 MWh. Certificates support renewable-consumption claims; they are not generic carbon credits worth one tonne of carbon each.

Identify energy prices, certificate quantities and prices, delivery, and retirement separately in a contract. The same claimed attribute cannot repeatedly become a new contribution for different parties. Under the 2025 certificate-management provisions, independent-storage discharge receives no newly issued certificates; from 2026, retirement for green-consumption claims includes production-year and consumption-year matching requirements. Unit conversion does not establish a project’s eligibility.`),
    ],
    workedExample: { title: l('100 MWh 的覆盖量，不等于 100 MWh 的完整账单', 'Coverage of 100 MWh is not a complete 100 MWh bill'), body: l(String.raw`假设某交割块需求 100 MWh，60 MWh 合同价 380 元/MWh，40 MWh 现货价 500 元/MWh。简化电能量成本为 $60\times380+40\times500=42800$ 元，平均 428 元/MWh。若其中 30 MWh 符合相应绿电及绿证条件，数量上对应 30 个绿证；若另行约定绿证单价 5 元/个，则该部分价格为 150 元。后一个假设不意味着所有合同都把绿证额外收费，也不包含输配电等项目。`, String.raw`A delivery block requires 100 MWh: 60 MWh at a contract price of 380 yuan/MWh and 40 MWh at a spot price of 500. The teaching energy cost is $60\times380+40\times500=42800$ yuan, averaging 428 yuan/MWh. If 30 MWh meets the relevant green-power and certificate conditions, that quantity corresponds to 30 certificates. A separately specified illustrative certificate price of 5 yuan each implies 150 yuan. This does not mean every contract charges certificates separately, and transmission and other charges remain excluded.`) },
    misconception: l('“中长期买了电，现货、辅助服务和绿证都是重复收费。”它们描述不同时间安排或不同产品，是否及如何结算要读规则和合同。', '“Contracts, spot energy, ancillary services, and certificates all charge for the same thing.” They describe different timing arrangements or products whose settlement depends on rules and contracts.'),
    boundary: l('本课展示产品分类和简化覆盖关系，不推荐合同配置；现货 2023 试行规则仅作机制参考，版本状态及安徽入口见第 21 课。', 'This chapter explains products and simplified coverage rather than recommending a contract portfolio. The 2023 trial spot rules are a mechanism reference; Chapter 21 records version status and Anhui entry points.'),
    quiz: { question: l('在满足相关核发条件的前提下，25 MWh 可再生能源电量对应多少个中国绿证？', 'Subject to applicable issuance conditions, how many Chinese certificates correspond to 25 MWh of renewable energy?'), options: [option('25 个', '25', '每个对应 1 MWh；数量换算仍需与项目资格及实际核发区分。', 'One represents 1 MWh; this conversion remains distinct from eligibility and actual issuance.', true), option('25,000 个', '25,000', '25,000 是换算后的 kWh 数量，不是绿证数量。', '25,000 is the quantity in kWh, not the certificate count.'), option('25 吨碳信用', '25 tonnes of carbon credits', '绿证证明电量环境属性，不是固定吨数的碳信用。', 'These certificates document energy attributes, not a fixed tonnage of carbon credits.')] }, sourceIds: ['cn-midlong-2025', 'cn-ancillary-2025', 'cn-green-cert-2025', 'cn-renewable-price-2025'],
  },
  {
    id: '11', moduleId: 'markets', title: l('从报价到边际出清', 'From offers to marginal clearing'),
    subtitle: l('亲手把供给排成阶梯，观察需求如何改变调用量和价格。', 'Build a supply staircase and see how demand changes dispatch and price.'), minutes: 28, prerequisites: ['04', '09', '10'],
    objectives: l(['从报价与容量形成供给阶梯。', '计算简化出清量、边际价格和电能量收入。', '解释供给不足、阶梯边界与真实市场约束。'], ['Build a supply staircase from offers and capacities.', 'Calculate simplified dispatch, marginal price, and energy revenue.', 'Explain shortages, staircase boundaries, and omitted market constraints.']),
    tags: l(['报价', '边际价格', '出清', '供给阶梯'], ['Offers', 'Marginal price', 'Clearing', 'Merit order']), figure: 'market-clearing',
    figureCaption: l('报价阶梯帮助理解边际供给；真正的坐标、调用量与价格由下面实验精确计算。', 'A supply staircase suggests marginal supply; the lab below calculates exact axes, dispatch, and prices.'),
    figureNotes: l(['从低价供给到高价供给依次观察，思考累计容量能否覆盖需求。', '最末被调用资源只需要补足剩余需求，不一定全容量运行。', '区域间连接提示下一课的限制：网络阻塞会让单一供给阶梯不再足够。'], ['Read offers from low to high and ask whether cumulative capacity covers demand.', 'The final dispatched resource only needs to meet remaining demand and need not run at full capacity.', 'Interregional links point to the next chapter: congestion makes one aggregate staircase insufficient.']),
    sections: [
      s('offers', '一条报价，至少要有量、价和时段', 'An offer needs quantity, price, and an interval', String.raw`先考虑一个小时、一个区域、固定需求、没有网络限制的模型。每台机组提交可用容量 $\bar g_i$（MW）和报价 $c_i$（元/MWh）。“报价低”表示愿意以较低价格提供该块电能量，并不自动说明其全部会计成本低；启停、固定成本、履约义务等未必出现在这一条价格中。

将报价从低到高排序，横轴累计 MW，纵轴元/MWh，得到供给阶梯。每一阶的宽度对应可供功率，高度对应报价。需求是需要覆盖的功率位置，不是额外的一台发电机。实验中修改容量会改变阶梯宽度，修改报价会改变高度和排序。`, String.raw`Consider one hour, one region, fixed demand, and no network limits. Each generator offers available capacity $\bar g_i$ in MW and price $c_i$ in yuan/MWh. A lower offer means willingness to provide that block at a lower price; it does not automatically imply lower total accounting cost. Start-up, fixed costs, and obligations may not appear in this single price.

Sort offers from low to high. Cumulative MW form the horizontal axis and yuan/MWh the vertical axis. Each step’s width is available power and its height is its offer. Demand is the power requirement to cover, not another generator. Changing capacity alters width; changing an offer alters height and potentially ordering.`),
      s('dispatch', '出清先找满足需求的可行组合', 'Clearing first finds a feasible supply combination', String.raw`在本模型中，最小化报价对应的供给支出可以写为：

$$\min_{g_i}\sum_i c_i g_i\Delta t\quad\text{使}\quad\sum_i g_i=D,\quad0\le g_i\le\bar g_i.$$

因为需求固定、价格线性且没有跨时段约束，按报价从低到高调用就能找到解。剩余需求小于下一台容量时，只调用所需部分。如果需求超过所有可用容量之和，原问题没有可行解。此时应显示未供电缺额；若引入失负荷成本，必须把它作为额外假设解释，而不是把它伪装成某台机组报价。

负报价在教学模型中仍可以排序；它并不会让供给无限增长，因为容量与需求约束仍然存在。真实市场是否允许负报价和允许范围，需查当地规则。`, String.raw`In this model, minimizing offer-based supply expenditure is:

$$\min_{g_i}\sum_i c_i g_i\Delta t\quad\text{subject to}\quad\sum_i g_i=D,\quad0\le g_i\le\bar g_i.$$

With fixed demand, linear offers, and no intertemporal constraints, dispatching from cheapest to most expensive solves the problem. If remaining demand is below the next capacity, dispatch only the required amount. Demand exceeding total available capacity makes the original problem infeasible. Report unserved demand; a value of lost load is an additional assumption, not a disguised generator offer.

Negative offers can still be sorted in the teaching model. They do not create unlimited generation because capacity and demand constraints remain. Whether negative offers are permitted, and their allowed range, requires applicable rules.`),
      s('price', '边际价格问的是“再多一点需求要付多少”', 'Marginal price asks what one more unit of demand costs', String.raw`当边际机组还有可用容量时，稍微增加需求会继续调用它，于是最优目标对需求的增量反映它的报价。本实验用最后一块正调用供给的报价作为展示价格。这是明示的教学约定：恰好卡在阶梯拐点、需求为零或供给不足时，需要另外说明边界，不能机械地套用“最后一台”。

在统一边际支付假设下，入选机组的电能量收入为 $R_i=\lambda g_i\Delta t$。这个收入不等于利润。还要扣实际变动成本，并可能计入启停、固定成本及其他结算项目。优化目标中的报价加权总额，也不等于所有机组按统一价格获得的收入总额。`, String.raw`If the marginal generator has spare capacity, a small demand increase uses more of it, so the change in the optimum reflects its offer. The lab displays the offer of the final block with positive dispatch. This is an explicit teaching convention: exact step boundaries, zero demand, and shortages require separate handling rather than mechanically applying “the last generator.”

Under uniform marginal payment, a dispatched generator receives $R_i=\lambda g_i\Delta t$ for energy. Revenue is not profit: actual variable costs and possibly start-up, fixed, and other settlement items remain. The offer-weighted optimization objective also differs from the total revenue paid at a uniform price.`),
      s('limits', '把实验学到的直觉带到真实市场', 'Transfer the intuition with its limits intact', String.raw`真实机组可能有最小稳定出力、启动时间、爬坡限制和最小开停机时间；电网有线路约束，系统还要留备用。这些条件会让“低价先用”的简单排序不足以生成完整可执行计划。它仍然是理解稀缺性和边际价值的起点。

打开出清实验，先只改变需求，再固定需求改变低价容量。每次先预测哪一块会被调用，再检查数值。把供给压低到不足时，检查界面是否报告缺额。最后记录：这次变化究竟改变了物理调用、统一支付价格，还是两者都改变？`, String.raw`Real units may have minimum stable output, start-up times, ramp limits, and minimum up/down times. Networks have line constraints and systems need reserves. These conditions can make simple low-price-first sorting insufficient for an executable schedule, while it remains a useful introduction to scarcity and marginal value.

In the clearing lab, vary demand first, then hold demand fixed and change cheap capacity. Predict the dispatched block before checking the results. Reduce supply below demand and inspect the reported shortfall. Finally record whether each change affected dispatch, the uniform payment price, or both.`),
    ], lab: 'merit-order',
    workedExample: { title: l('三段报价满足 85 MW 需求', 'Three offers meet 85 MW of demand'), body: l(String.raw`一小时内，A 报价 100 元/MWh、容量 40 MW；B 为 300 元/MWh、50 MW；C 为 600 元/MWh、30 MW。需求 85 MW 时，调用为 A=40、B=45、C=0 MW，展示边际价 300 元/MWh。按报价计算的目标值为 $40\times100+45\times300=17500$ 元，统一价格下总电能量支付为 $85\times300=25500$ 元。两者相差 8000 元，不能直接称为全系统净利润。需求增至 95 MW 时，需要 C 提供 5 MW，展示价格升到 600 元/MWh。`, String.raw`For one hour, A offers 40 MW at 100 yuan/MWh, B offers 50 MW at 300, and C offers 30 MW at 600. Demand of 85 MW dispatches A=40, B=45, and C=0 MW, with displayed marginal price 300 yuan/MWh. The offer-weighted objective is $40\times100+45\times300=17500$ yuan, while uniform-price energy payments total $85\times300=25500$ yuan. Their 8,000-yuan difference is not automatically system net profit. At demand of 95 MW, C supplies 5 MW and the displayed price rises to 600 yuan/MWh.`) },
    misconception: l('“边际价格等于平均成本，而且低价机组只能拿自己的报价。”平均值、边际价值和支付规则是不同概念，必须先说明采用的规则。', '“The marginal price equals average cost and cheaper units always receive their own offers.” Averages, marginal values, and payment rules are different concepts requiring explicit definitions.'),
    boundary: l('单时段、单区域、固定需求、线性报价与统一边际支付的教学模型；没有网络、启停、爬坡、备用或市场力分析，不是任何地区的完整出清引擎。', 'A single-interval, single-region model with fixed demand, linear offers, and uniform marginal payment. It omits networks, commitment, ramping, reserves, and market-power analysis and is not a full regional clearing engine.'),
    quiz: { question: l('算例需求为 85 MW 时，B 应提供多少功率？', 'In the example, how much power should B provide for demand of 85 MW?'), options: [option('50 MW', '50 MW', 'A 提供 40 MW 后只剩 45 MW 需求，B 无需满发。', 'After A supplies 40 MW, only 45 MW remain; B need not run at capacity.'), option('45 MW', '45 MW', '按顺序先用 A 的 40 MW，再由 B 补足 85−40=45 MW。', 'Dispatch A’s 40 MW first, then B supplies 85−40=45 MW.', true), option('0 MW', '0 MW', '只靠 A 的 40 MW 无法满足 85 MW 需求。', 'A’s 40 MW alone cannot meet 85 MW of demand.')] }, sourceIds: ['cn-basic-2024', 'cn-midlong-2025', 'cn-spot-2023', 'pjm-lmp'],
  },
  {
    id: '12', moduleId: 'markets', title: l('输电约束与分区、节点价格', 'Transmission constraints and locational prices'),
    subtitle: l('为什么两地都在用电，增加一兆瓦的代价却不同？', 'Why can one additional megawatt cost different amounts in different places?'), minutes: 30, prerequisites: ['04', '09', '11'],
    objectives: l(['用两区域平衡解释线路容量约束。', '计算受限传输下的调用量和局部边际成本。', '区分运输模型、DC 最优潮流与完整交流电网。'], ['Explain line capacity through two regional balances.', 'Calculate dispatch and local marginal costs with constrained transfer.', 'Distinguish a transport model, DC optimal power flow, and an AC network.']),
    tags: l(['阻塞', '节点价格', '分区', '约束优化'], ['Congestion', 'Locational pricing', 'Zones', 'Constrained optimization']), figure: 'market-clearing',
    figureCaption: l('两个区域之间的连接能传多少电，会改变各自需要调用的资源与边际价值。', 'Transfer capability between two regions changes the resources each needs and their marginal values.'),
    figureNotes: l(['先分别查看两侧供给和需求，不能只比较全系统总量。', '把连接理解为受容量约束的通道；图示宽度不是实际线路额定容量。', '价格差来自带约束的边际变化；精确数值请看下方可调参数实验。'], ['Check supply and demand on each side rather than only system totals.', 'Treat the connection as a constrained transfer path; its drawn width is not a line rating.', 'Price differences arise from constrained marginal changes; exact values belong to the adjustable lab below.']),
    sections: [
      s('transport', '从一条平衡式拆成两条', 'Split one balance into two', String.raw`设区域 A、B 的负荷为 $D_A,D_B$，发电为 $g_A,g_B$，从 A 流向 B 的传输量为 $f$。无损的两区域模型满足 $g_A-D_A=f$、$g_B+f=D_B$，并限制 $-F\le f\le F$。把两式相加仍是全系统供需平衡，但各自的约束保留了“电送不过去”的可能。

如果 A 的供给便宜但通道满了，B 新增需求就可能需要当地更贵的资源。此时全系统还有低价容量，也不意味着每个位置都能无限获得低价电。网络约束使地点成为价格的一部分。`, String.raw`Let demands be $D_A,D_B$, generation be $g_A,g_B$, and transfer from A to B be $f$. A lossless two-region model satisfies $g_A-D_A=f$ and $g_B+f=D_B$, with $-F\le f\le F$. Adding the balances still gives system-wide balance, but the separate constraints retain the possibility that electricity cannot be transferred where needed.

If A has cheaper supply but the link is full, additional demand in B may require costlier local generation. Cheap capacity elsewhere therefore does not imply unlimited cheap power at every location. Network constraints make location part of value.`),
      s('marginal', '局部加一点需求，观察最优费用变化', 'Add a little local demand and inspect the optimum', String.raw`用 $C^*(D_A,D_B)$ 表示满足两地需求的最小报价支出。区域 A 的边际价值可通过有限差分理解：

$$\lambda_A\approx\frac{C^*(D_A+\epsilon,D_B)-C^*(D_A,D_B)}{\epsilon\Delta t}.$$

分母中的 $\Delta t$ 将新增 MW 转为 MWh，因此结果是元/MWh。B 同理。当线路没有卡住且其他约束允许时，两地新增需求可能由同一低价资源满足；线路卡住后，响应资源不同，边际值便可能分开。

有限差分跨越阶梯拐点时会得到区间平均变化，而非某一侧的瞬时导数；供给不足时也不能制造一个看似正常的价格。实验的分区边际值帮助理解概念，不等于完整节点电价计算。`, String.raw`Write the minimum offer-based expenditure as $C^*(D_A,D_B)$. A’s marginal value can be understood through a finite difference:

$$\lambda_A\approx\frac{C^*(D_A+\epsilon,D_B)-C^*(D_A,D_B)}{\epsilon\Delta t}.$$

The duration converts additional MW to MWh, leaving yuan/MWh. The same applies to B. Without a binding link or other restricting constraint, one cheap resource may serve an increment in either region. Once transmission binds, different resources can respond and marginal values can diverge.

A finite difference crossing a breakpoint yields an average change across that range rather than a one-sided instantaneous derivative. Infeasibility must not produce an apparently normal price. The lab’s regional marginal values illustrate a concept rather than calculate full nodal prices.`),
      s('model-levels', '运输模型不是 DC 最优潮流', 'A transport model is not DC optimal power flow', String.raw`本实验只约束两个区域间的净传输和容量，属于运输模型。它没有线路电抗、相角或网状电网的潮流分配。DC 最优潮流在相应线性近似下还会把线路有功潮流与节点相角差、电抗联系起来，并满足网络方程；通常忽略电阻损耗和无功、电压幅值等因素。

完整交流模型进一步涉及有功、无功、电压及非线性网络关系。现实节点边际价格还可能包含能量、阻塞与边际损耗等成分，采用的网络与定价方法由市场决定。两节点示例能说明约束的价值，但不能宣称已经复现省级电网的 SCUC/SCED 或交流安全校核。`, String.raw`The lab constrains net transfer and capacity between two regions: it is a transport model. It contains no line reactances, phase angles, or meshed-network flow allocation. Under its linearizing assumptions, DC optimal power flow additionally links active line flows to angle differences and reactances and enforces network equations; it typically neglects resistive losses, reactive power, and voltage-magnitude effects.

An AC model adds active and reactive power, voltages, and nonlinear network relationships. Actual locational marginal prices can contain energy, congestion, and marginal-loss components, depending on market design. A two-node example shows constraint value but does not reproduce provincial SCUC/SCED or AC security analysis.`),
      s('basis', '价格地点不同，会留下基差风险', 'Different pricing locations leave basis risk', String.raw`如果合同按参考点结算，而工厂按另一个节点或统一结算点结算，即使数量完全匹配，位置价格差仍可能改变结果。这类不能被原合同完全覆盖的差异，是理解基差风险的一个入口；具体还可能涉及时间和产品差异。

在实验中逐步增加通道容量，记录两地调用、总费用和边际值的变化。先判断“再增加一点容量是否有用”，再计算节省。线路扩容的系统运行价值不是项目净收益：投资成本、检修、可靠性和跨期条件还没有进入这个实验。`, String.raw`If a contract settles at a reference point while a factory settles at another node or a common settlement point, location-price differences can remain even when energy quantities match. This illustrates basis risk: the contract does not perfectly cover the relevant exposure. Timing and product differences can create related mismatches.

Increase transfer capacity in the lab and record dispatch, total expenditure, and marginal values. Predict whether another increment of capacity is useful before calculating savings. Operational savings are not the net return of a transmission investment: capital cost, maintenance, reliability, and intertemporal conditions are absent.`),
    ], lab: 'congestion',
    workedExample: { title: l('便宜的电送不过去时', 'When cheap electricity cannot reach the load'), body: l(String.raw`一小时示例：A 的容量 150 MW、报价 200 元/MWh、负荷 40 MW；B 的容量 100 MW、报价 600 元/MWh、负荷 80 MW；A→B 通道最多 50 MW。最优调用为 A=90 MW、B=30 MW，总报价支出 $90\times200+30\times600=36000$ 元。此时 A 新增 1 MW 需求花 200 元，B 新增 1 MW 花 600 元。通道从 50 增到 51 MW 时，A=91、B=29 MW，费用变为 35600 元，节省 400 元。若可无损输送足够电力，A 提供全部 120 MW 时费用为 24000 元。`, String.raw`For one hour, A has 150 MW at 200 yuan/MWh and demand of 40 MW; B has 100 MW at 600 and demand of 80 MW. Transfer A→B is limited to 50 MW. Optimal generation is A=90 MW and B=30 MW, with offer-based expenditure $90\times200+30\times600=36000$ yuan. An extra 1 MW of demand in A costs 200 yuan, while one in B costs 600. Raising the link from 50 to 51 MW gives A=91 and B=29 MW, costing 35,600 yuan and saving 400. With sufficient lossless transfer, A could supply all 120 MW for 24,000 yuan.`) },
    misconception: l('“只要全国发电总量够，哪里用电都应该一个价格。”位置、可输送能力及其他约束会改变局部新增需求的代价。', '“Enough total generation means all locations should have the same price.” Location, transfer capability, and other constraints change the cost of local demand increments.'),
    boundary: l('实验为无损两区域运输模型，不含相角、电抗、环流、无功、事故约束和边际网损；不把它称作 DCOPF 或真实节点电价系统。', 'The lab is a lossless two-region transport model without angles, reactances, loop flows, reactive power, contingencies, or marginal losses. It is not presented as DCOPF or a real nodal-pricing system.'),
    quiz: { question: l('在算例通道已满的状态下，B 增加 1 MW 负荷，最便宜的可行响应是什么？', 'With the example’s link already full, what is the cheapest feasible response to 1 MW more load in B?'), options: [option('A 多发 1 MW 并越过通道上限', 'Generate 1 MW more in A and exceed the link limit', '这违反了容量约束，不是可行方案。', 'That violates the transfer limit and is infeasible.'), option('B 本地多发 1 MW', 'Generate 1 MW more locally in B', 'B 尚有容量；本例一小时新增支出为 600 元。', 'B has spare capacity; the one-hour increment costs 600 yuan.', true), option('只提高价格，不增加供给', 'Raise the price without adding supply', '固定需求模型仍需满足物理平衡，价格变化不能代替电量。', 'Fixed demand still requires physical balance; a price change cannot replace energy.')] }, sourceIds: ['pjm-lmp', 'cn-spot-2023', 'cn-basic-2024'],
  },
];

import type { Chapter } from '../types';
import { l, s, option } from './helpers';

export const foundationsChapters: Chapter[] = [
  {
    id: '01', moduleId: 'math', title: l('从功率、电量到一张电费账单', 'From power and energy to an electricity bill'),
    subtitle: l('先分清 MW 与 MWh，再把分时负荷变成可计算的成本。', 'Separate MW from MWh, then turn an interval load profile into a calculable cost.'),
    minutes: 20, prerequisites: [],
    objectives: l(['区分瞬时功率、平均功率、电量与价格的单位。', '用时段长度把负荷曲线转换为电量和能量采购成本。', '解释为什么平均电价需要按电量加权。'], ['Distinguish instantaneous power, average power, energy, and price units.', 'Convert interval loads into energy and energy procurement costs.', 'Explain why a realized average price must be energy-weighted.']),
    tags: l(['功率与电量', '量纲', '分时成本'], ['Power and energy', 'Units', 'Interval costs']),
    figure: 'foundations',
    figureCaption: l('从工厂的用电强度出发，把每个时段的电量与价格配成一对。', 'Start from a factory’s rate of electricity use and pair each interval’s energy with its price.'),
    figureNotes: l(['把负荷理解为用电的快慢，把电量理解为一段时间里的累计用量。', '数学积木提示我们先给数字标上单位，再进行加权与求和。', '插图帮助组织概念；实际面积、电量和成本请以下面的计算为准。'], ['Read load as the rate of electricity use and energy as the accumulated use over time.', 'The mathematical building blocks suggest attaching units before weighting or summing numbers.', 'The illustration organizes concepts; use the calculations below for exact areas, energy, and cost.']),
    sections: [
      s('power-energy', '水流的快慢与水桶的总量', 'A flow rate and the amount collected', String.raw`把用电想成往水桶里放水：功率描述“此刻流得多快”，电量描述“这段时间一共用了多少”。功率常用 kW、MW，电量常用 kWh、MWh；$1\,\mathrm{MW}=1000\,\mathrm{kW}$，$1\,\mathrm{MWh}=1000\,\mathrm{kWh}$。“1 度电”是 1 kWh，不是 1 kW。

若一个时段内的**平均功率**为 $P_t$ MW，时长为 $\Delta t$ 小时，那么 $E_t=P_t\Delta t$ MWh。8 MW 连续运行 15 分钟，电量是 $8\times0.25=2$ MWh。只看到某一个采样瞬间的 8 MW，还不能断定整个时段都维持这个功率；计量口径和采样方式需要核实。`, String.raw`Imagine electricity use as water flowing into a bucket. Power describes the rate of flow; energy describes the amount collected over an interval. Common units are kW or MW for power and kWh or MWh for energy. $1\,\mathrm{MW}=1000\,\mathrm{kW}$ and $1\,\mathrm{MWh}=1000\,\mathrm{kWh}$. A household “unit” of electricity is a kWh, not a kW.

If an interval’s **average power** is $P_t$ MW and its duration is $\Delta t$ hours, its energy is $E_t=P_t\Delta t$ MWh. Operating at 8 MW for 15 minutes consumes $8\times0.25=2$ MWh. A single instantaneous reading of 8 MW does not prove that the entire interval averaged 8 MW; check the measurement convention.`),
      s('cost', '让单位替你检查公式', 'Let units check your formula', String.raw`如果该时段的能量价格 $\pi_t$ 为元/MWh，能量采购成本就是 $C_t=E_t\pi_t$，单位相消后得到元。一整天的教学采购成本为：

$$C=\sum_t P_t\Delta t\,\pi_t.$$

例如 2 MWh、480 元/MWh，成本为 960 元；480 元/MWh 等于 0.48 元/kWh。把 MW 直接乘元/MWh，结果是元/小时，缺少时长就还不是账单金额。建立表格或模型时，把时段起止、平均功率、电量、价格、金额分别作为字段，可以及早发现 1000 倍或 4 倍的换算错误。`, String.raw`With an energy price $\pi_t$ in yuan/MWh, interval procurement cost is $C_t=E_t\pi_t$ in yuan. A day’s simplified energy procurement cost is:

$$C=\sum_t P_t\Delta t\,\pi_t.$$

For 2 MWh at 480 yuan/MWh, the cost is 960 yuan. A price of 480 yuan/MWh equals 0.48 yuan/kWh. Multiplying MW directly by yuan/MWh gives yuan/hour, not a bill amount: duration is missing. Keep interval boundaries, average power, energy, price, and money in separate dataset columns so factors of 1000 or four are easier to catch.`),
      s('weighted-price', '相同总电量，为什么账单不同', 'Why equal energy can produce different costs', String.raw`分时价格变化时，“什么时候用”与“用了多少”同样重要。把 1 MWh 从 700 元/MWh 的时段移到 300 元/MWh 的时段，能量成本减少 400 元。这个算式只说明价格差的作用，是否能移需要看生产、设备和合同约束，后面会逐步加入。

实际采购均价应写成 $\bar\pi=\sum_tE_t\pi_t/\sum_tE_t$。它是按电量加权的价格，不是把各时段价格直接平均。只有各时段电量相等时，两者才一致；零总电量时均价没有定义，也不应显示为零。`, String.raw`When prices vary with time, when electricity is used matters alongside how much is used. Moving 1 MWh from a 700-yuan/MWh interval to a 300-yuan/MWh interval reduces energy cost by 400 yuan. The arithmetic isolates the price difference; production, equipment, and contract constraints determine whether a shift is feasible.

A realized procurement average is $\bar\pi=\sum_tE_t\pi_t/\sum_tE_t$. This weights each price by the associated energy rather than averaging prices directly. The two averages coincide when interval energy is equal. With zero total energy, the weighted average is undefined and should not be displayed as zero.`),
      s('scope', '先建能量账，再补完整账单', 'Build the energy ledger before the full bill', String.raw`本课程先把一个工厂当作电力购买方：负荷预测给出未来需要多少电量，价格预测描述可能的采购价格，决策再决定合同覆盖、日前申报或可调负荷。三个环节都依赖同一份时段索引。日期、时区、缺失值和时段长度不一致，会让看似正确的乘法配错行。

这里的 $C$ 仅为教学能量采购项。真实终端账单还可能包含输配电、系统运行费用、政府性基金及附加、需量或容量费用等，是否适用取决于当地规则与合同。15 分钟也是本课的算例设定，不表示所有市场都采用这一结算粒度。`, String.raw`Begin with a factory buying electricity. A load forecast estimates future energy needs; a price forecast describes possible procurement prices; a decision then selects contract coverage, day-ahead schedules, or flexible load. All three depend on an aligned interval index. Mismatched dates, time zones, missing records, or durations can pair the wrong values even when multiplication is correct.

Here $C$ covers only a teaching energy-procurement component. A real customer bill may also contain network charges, system-operation costs, government funds and surcharges, or demand and capacity charges, according to the applicable rules and contract. Fifteen minutes is an example interval, not a universal settlement requirement.`),
    ],
    lab: 'energy',
    workedExample: { title: l('四个时段，手算一小时的采购成本', 'Four intervals: calculate one hour of procurement'), body: l(String.raw`四个连续 15 分钟时段的平均功率为 $[8,12,10,6]$ MW，价格为 $[300,500,700,400]$ 元/MWh。

| 时段 | 平均功率 MW | 电量 MWh | 价格 元/MWh | 成本 元 |
|---|---:|---:|---:|---:|
| 1 | 8 | 2 | 300 | 600 |
| 2 | 12 | 3 | 500 | 1500 |
| 3 | 10 | 2.5 | 700 | 1750 |
| 4 | 6 | 1.5 | 400 | 600 |

总电量是 9 MWh，总成本是 4450 元，电量加权均价为 $4450/9\approx494.44$ 元/MWh。直接平均价格得到 475 元/MWh，会低估这组用电曲线的实际采购均价。`, String.raw`Four consecutive 15-minute intervals have average powers $[8,12,10,6]$ MW and prices $[300,500,700,400]$ yuan/MWh.

| Interval | Average power MW | Energy MWh | Price yuan/MWh | Cost yuan |
|---|---:|---:|---:|---:|
| 1 | 8 | 2 | 300 | 600 |
| 2 | 12 | 3 | 500 | 1500 |
| 3 | 10 | 2.5 | 700 | 1750 |
| 4 | 6 | 1.5 | 400 | 600 |

Total energy is 9 MWh and total cost is 4450 yuan. The energy-weighted average is $4450/9\approx494.44$ yuan/MWh. The unweighted price average, 475 yuan/MWh, understates the procurement average for this particular profile.`) },
    misconception: l('“一台 10 MW 的设备，每个时段就一定用了 10 MWh。”MW 是功率，必须结合实际平均运行功率与时段长度；额定功率也不等于实际运行功率。', '“A 10 MW device always consumes 10 MWh per interval.” MW is power. Energy depends on actual average power and duration; rated power is not necessarily actual operating power.'),
    boundary: l('所有负荷、价格和金额都是教学假设。这里只计算能量采购项，未复刻任何地区完整电费、结算或税费规则，也未证明移峰方案满足生产约束。', 'All loads, prices, and amounts are teaching assumptions. We calculate an energy-procurement component, not a jurisdiction’s full tariff, settlement, or tax rules, and do not establish the feasibility of shifting production.'),
    quiz: { question: l('平均功率 12 MW 持续 15 分钟，按 500 元/MWh 计价，能量成本是多少？', 'At 12 MW average for 15 minutes and 500 yuan/MWh, what is the energy cost?'), options: [
      option('6000 元', '6000 yuan', '这是把 15 分钟误当成 1 小时。先算 12×0.25=3 MWh。', 'This treats 15 minutes as one hour. First calculate 12×0.25=3 MWh.'),
      option('1500 元', '1500 yuan', '电量为 3 MWh，成本为 3×500=1500 元。', 'Energy is 3 MWh and cost is 3×500=1500 yuan.', true),
      option('1.5 元', '1.5 yuan', '这里的价格单位已经是元/MWh，不需要再除以 1000。', 'The price is already in yuan/MWh; do not divide by 1000 again.'),
    ] }, sourceIds: ['eia-units', 'mml'],
  },
  {
    id: '02', moduleId: 'math', title: l('把负荷信息装进向量和矩阵', 'Represent load information with vectors and matrices'),
    subtitle: l('温度、历史负荷和生产计划，怎样成为模型的一行输入？', 'How do temperature, past load, and a production plan become one model input?'),
    minutes: 22, prerequisites: ['01'],
    objectives: l(['区分样本、特征、向量与矩阵的形状。', '手算点积和一个线性负荷预测。', '说明标准化与特征可获得时刻的作用。'], ['Distinguish samples, features, vectors, and matrix shapes.', 'Calculate a dot product and one linear load forecast.', 'Explain feature scaling and information availability.']),
    tags: l(['向量与矩阵', '标准化', '特征工程'], ['Vectors and matrices', 'Scaling', 'Feature engineering']),
    figure: 'foundations',
    figureCaption: l('把不同来源的信息组织成有固定含义的数字格子，数学才能连接预测与成本。', 'Organize information into consistently defined numeric entries before connecting forecasts to costs.'),
    figureNotes: l(['一个有序数字列表可以对应一个时段的多个特征。', '成组的数字格子可以对应多个时段，而不只是装饰性表格。', '图中的积木不规定数据维度；本课明确采用“样本为行、特征为列”。'], ['An ordered list can hold several features for one interval.', 'A collection of numeric cells can represent multiple intervals.', 'The illustration does not specify dimensions; this lesson uses samples as rows and features as columns.']),
    sections: [
      s('shape', '先给每个轴起名字', 'Name each axis before calculating', String.raw`用 $x=[T,L,d]$ 表示一个时段的气温、历史负荷和工作日标记，这是一个含 3 个特征的向量。收集 96 个时段，就得到 $X\in\mathbb{R}^{96\times3}$：每一行是样本，每一列具有固定含义。96 是这里的数据规模示例，不是模型必须使用的长度。

神经网络通常还会多出批次、时间等轴。比如 $B\times T\times d$ 分别代表批量样本数、窗口长度和特征数。看到“维度”时，要判断它指轴的数量还是某条轴的长度。把形状写在变量旁边，比只盯着公式里的乘号更容易定位错误。`, String.raw`Let $x=[T,L,d]$ contain temperature, past load, and a working-day indicator for one interval. It is a vector of three features. Collecting 96 intervals gives $X\in\mathbb{R}^{96\times3}$: every row is a sample and every column has a consistent meaning. Ninety-six is an example dataset size, not a required model length.

Neural networks may add batch and time axes. In $B\times T\times d$, these represent the number of samples in a batch, window length, and feature count. “Dimension” can mean the number of axes or an axis length. Write shapes alongside variables before interpreting multiplication signs.`),
      s('weighted-sum', '点积是一种可学习的加权汇总', 'A dot product is a learnable weighted summary', String.raw`点积为 $x\cdot w=\sum_jx_jw_j$，含义是每项特征乘以自己的权重，再相加。加上偏置得到 $\hat P=x\cdot w+b$。帽子表示预测值，$b$ 是基准水平，$w$ 表示模型如何利用各项特征。

对于 $X\in\mathbb{R}^{n\times d}$ 和列向量 $w\in\mathbb{R}^{d\times1}$，预测 $Xw+b$ 的形状是 $n\times1$，偏置按行加到每个样本。矩阵乘法包含对内部维度的求和；逐元素乘法只将对应格子相乘，两者不能混用。权重描述模型关系，并不自动具有因果解释。`, String.raw`The dot product $x\cdot w=\sum_jx_jw_j$ multiplies each feature by its weight and sums the contributions. Adding a bias gives $\hat P=x\cdot w+b$. A hat marks a prediction; $b$ is a baseline and $w$ describes how the model uses its features.

For $X\in\mathbb{R}^{n\times d}$ and a column vector $w\in\mathbb{R}^{d\times1}$, $Xw+b$ has shape $n\times1$, with the bias added to each sample. Matrix multiplication sums over the inner dimension; elementwise multiplication only multiplies matching cells. Learned weights describe a model relationship, not automatically a causal effect.`),
      s('scale', '不同单位先变成可比较的尺度', 'Put different features on workable scales', String.raw`温度可能是几十，功率可能是几百，月份是 1 到 12。数值大不代表更重要，但会影响优化时各方向的尺度。常见标准化为 $\tilde x_j=(x_j-\mu_j)/\sigma_j$。这里 $\mu_j$ 和 $\sigma_j$ 只能由训练时允许使用的数据估计，再原样应用于验证、测试与未来输入；常量列要单独处理，避免除以零。

标准化后的数值通常无量纲。若直接预测 MW，则权重和偏置也必须与这个输出口径一致。二元工作日标记可以保持 0/1；并非每一列都必须同样处理。电价若可能为零或负，不能未经检查就套用普通对数变换。`, String.raw`Temperature may be measured in tens, power in hundreds, and calendar month from 1 to 12. A larger numerical range does not imply greater importance, but it affects optimization scales. A common transformation is $\tilde x_j=(x_j-\mu_j)/\sigma_j$. Estimate $\mu_j$ and $\sigma_j$ only from data available for training, then reuse them for validation, testing, and future inputs. Handle constant columns separately to avoid division by zero.

Standardized inputs are usually dimensionless. If the output is in MW, weights and bias must be interpreted consistently. A binary working-day indicator can remain 0/1; not every feature needs identical processing. Prices that can be zero or negative also require care before applying ordinary logarithms.`),
      s('availability', '输入正确，还要在当时拿得到', 'Correct inputs must also have been available', String.raw`假设今天上午预测明天的负荷。明天的日历信息已知，已经发布的天气预报可用，明天实际测得的温度却还不知道。把未来实测温度放进历史回测，会让模型得到部署时不存在的信息，即数据泄漏。使用天气预报时还应保留其发布时间，避免取到更晚修订的版本。

实践中可以给每个特征加三列说明：定义和单位、对应的目标时段、最早可获得时刻。模型训练前先对齐这三件事，往往比盲目加深网络更有价值。第 15 课会把这个检查扩展成完整回测流程。`, String.raw`Suppose you forecast tomorrow’s load this morning. Tomorrow’s calendar is known and an already-issued weather forecast is available, but tomorrow’s measured temperature is not. Using that future observation in a historical backtest gives the model information unavailable in deployment: data leakage. Keep weather forecast issue times so later revisions are not substituted accidentally.

Document each feature’s definition and unit, target interval, and earliest availability time. Aligning these three properties before training can matter more than adding network depth. Lesson 15 extends the check into a complete backtesting process.`),
    ], lab: 'neuron',
    workedExample: { title: l('从原始特征得到 11 MW 的教学预测', 'From raw features to an 11 MW teaching prediction'), body: l(String.raw`设温度为 25°C、历史负荷为 9 MW、工作日标记为 1。仅为演算，给定训练阶段统计量：温度均值 20°C、标准差 5°C；负荷均值 10 MW、标准差 2 MW。于是 $x=[(25-20)/5,(9-10)/2,1]=[1,-0.5,1]$。

取教学权重 $w=[2,4,1]$ MW、偏置 $b=10$ MW，则 $\hat P=1\times2+(-0.5)\times4+1\times1+10=11$ MW。若预测区间为 15 分钟，预测电量为 $11\times0.25=2.75$ MWh。这些权重是手设示例，不是已训练模型。`, String.raw`Let temperature be 25°C, past load 9 MW, and the working-day indicator 1. For arithmetic, assume training statistics of 20°C mean and 5°C standard deviation for temperature, and 10 MW mean and 2 MW standard deviation for load. Then $x=[(25-20)/5,(9-10)/2,1]=[1,-0.5,1]$.

With teaching weights $w=[2,4,1]$ MW and bias $b=10$ MW, $\hat P=1\times2+(-0.5)\times4+1\times1+10=11$ MW. For a 15-minute interval, forecast energy is $11\times0.25=2.75$ MWh. These hand-set weights are not a trained model.`) },
    misconception: l('“先把全部数据标准化，再切分训练和测试更公平。”这样会把未来分布信息泄漏给训练过程；预处理参数也要遵守时间边界。', '“Standardizing all data before splitting makes evaluation fairer.” It leaks future distribution information into training; preprocessing parameters must respect the time boundary too.'),
    boundary: l('本课只用线性映射说明形状与特征可用性。配套神经元实验展示加权和及激活，不自动从真实负荷数据训练，也不能证明某个特征具有因果作用。', 'The linear map teaches shapes and feature availability. The neuron lab illustrates weighted sums and activation without fitting real load data or establishing feature causality.'),
    quiz: { question: l('X 是 96×3，w 是 3×1，Xw 的形状是什么？', 'If X is 96×3 and w is 3×1, what is the shape of Xw?'), options: [
      option('96×1', '96×1', '对 3 个特征求和，每个时段产生一个预测值。', 'The three features are summed over, producing one prediction per interval.', true),
      option('3×3', '3×3', '匹配的内部维度参与求和，不成为输出的两个轴。', 'The matching inner dimensions are summed over rather than becoming output axes.'),
      option('96×3×1', '96×3×1', '矩阵乘法沿共同的3维求和，不会拼接所有轴；结果仍为96×1。', 'The shared dimension of 3 is summed over; the axes are not concatenated. The result remains 96×1.'),
    ] }, sourceIds: ['mml', 'd2l', 'fpp3'],
  },
  {
    id: '03', moduleId: 'math', title: l('概率、期望与不能忽略的尾部', 'Probability, expectation, and the tail that matters'),
    subtitle: l('为什么平均成本较低的方案，仍可能带来一次很大的亏损？', 'Why can a lower average-cost plan still produce a large loss?'),
    minutes: 24, prerequisites: ['01', '02'],
    objectives: l(['把不确定负荷与价格写成带概率的情景。', '计算期望、方差和相关情景的采购成本。', '区分平均结果、波动和尾部损失。'], ['Represent uncertain load and price with probabilistic scenarios.', 'Calculate expectations, variance, and costs under joint scenarios.', 'Separate average outcomes, dispersion, and tail losses.']),
    tags: l(['概率', '期望与方差', '相关性与尾部'], ['Probability', 'Expectation and variance', 'Dependence and tails']),
    figure: 'foundations',
    figureCaption: l('同一个决策会遇到多种未来；概率给每种未来一个权重。', 'A single decision can meet several futures; probability assigns each future a weight.'),
    figureNotes: l(['把不同情景看成温度、负荷、价格共同变化的可能未来。', '每种可能性需要概率权重，不能根据插图中对象的数量估计真实概率。', '平均值用于汇总，但不能替代对极端情景的单独检查。'], ['Read scenarios as possible joint changes in weather, load, and price.', 'Each scenario needs a probability weight; illustration counts do not estimate real probabilities.', 'An average summarizes outcomes but does not replace inspection of extreme scenarios.']),
    sections: [
      s('scenarios', '先定义随机量，再分配概率', 'Define the uncertain quantity before its probabilities', String.raw`设明天某时段的采购成本为随机变量 $C$。在一个离散教学模型中，可能出现三个成本 $C_s$，各自概率为 $p_s$，要求 $p_s\ge0$ 且 $\sum_sp_s=1$。概率表示我们对未来的建模判断，不是把几个历史样本随意等权就能得到的客观保证。

情景最好保留联合关系。例如高温同时推高用电需求与现货价格，这应写成一个“高负荷、高价格”的联合情景。若分别随机打乱负荷和价格，可能制造出现实中不合理的组合，进而低估采购风险。`, String.raw`Let tomorrow’s interval procurement cost be a random variable $C$. In a discrete teaching model, it takes three possible values $C_s$ with probabilities $p_s$, where $p_s\ge0$ and $\sum_sp_s=1$. Probabilities express a modeling judgment about the future, not an objective guarantee obtained by arbitrarily giving a few historical observations equal weight.

Scenarios should preserve joint relationships. Hot weather may raise both demand and spot prices, suggesting a joint high-load, high-price scenario. Independently shuffling load and price can create implausible combinations and understate procurement risk.`),
      s('expectation', '期望是加权平均，不是最常发生的值', 'Expectation is a weighted average, not the most likely value', String.raw`期望为 $\mathbb E[C]=\sum_sp_sC_s$。它适合比较同一口径下的长期平均表现，但明天不一定出现这个数，甚至它可能不是任何一个情景值。两个方案具有相同期望，也可能有完全不同的风险分布。

对于随机电量 $E$ 和随机电价 $\pi$，成本期望是 $\mathbb E[E\pi]$，通常不能替换成 $\mathbb E[E]\mathbb E[\pi]$。二者差值就是协方差：$\mathbb E[E\pi]=\mathbb E[E]\mathbb E[\pi]+\operatorname{Cov}(E,\pi)$。需求越高价格也越高时，忽略这种关联容易低估成本。`, String.raw`Expectation is $\mathbb E[C]=\sum_sp_sC_s$. It compares long-run average outcomes on a consistent basis, but tomorrow need not equal that value; the expectation may not be any individual scenario. Two plans with the same expectation can have very different risk distributions.

For uncertain energy $E$ and price $\pi$, expected cost is $\mathbb E[E\pi]$, generally not $\mathbb E[E]\mathbb E[\pi]$. Their difference is covariance: $\mathbb E[E\pi]=\mathbb E[E]\mathbb E[\pi]+\operatorname{Cov}(E,\pi)$. When greater demand coincides with higher prices, ignoring dependence can understate cost.`),
      s('dispersion', '方差量波动，尾部指标量坏结果', 'Variance measures spread; tail measures examine bad outcomes', String.raw`方差 $\operatorname{Var}(C)=\sum_sp_s(C_s-\mu)^2$ 描述相对均值 $\mu$ 的平方偏离；标准差是方差的平方根，与成本同为“元”。方差会同时惩罚高于和低于均值的偏离，所以它并不只描述亏损。

在采购问题里，高成本尾部往往更值得关注。分位数给出分布的位置，CVaR 则聚焦某个高置信水平以外的平均损失。离散分布存在概率质量跨越阈值的问题，不能总是机械地“挑超过分位数的样本平均”。第 16、20 课会给出明确的计算口径。`, String.raw`Variance, $\operatorname{Var}(C)=\sum_sp_s(C_s-\mu)^2$, measures squared deviations from mean $\mu$. Its square root is the standard deviation, which uses the same yuan units as cost. Variance penalizes deviations both above and below the mean, so it is not exclusively a measure of losses.

For procurement, the high-cost tail often deserves special attention. Quantiles locate positions in a distribution; CVaR focuses on average losses in a specified upper tail. Discrete distributions require care when probability mass straddles a threshold: averaging only samples strictly above a quantile is not always correct. Lessons 16 and 20 specify the calculation conventions.`),
      s('decision', '把不确定性传到决策里', 'Carry uncertainty into the decision', String.raw`一个完整流程是：定义可用信息，建立负荷与价格联合情景，对每个候选决策计算各情景的成本，再比较平均值、尾部与约束是否满足。先用同一组情景比较方案，才能知道差别来自决策而不是随机抽样变了。

风险偏好不是让模型自动猜出的事实。例如企业可能要求保留现金缓冲，或者不接受某类生产中断；这些约束需要从业务确定。教学时可以先用三个情景手算，实际研究还要检查情景覆盖、概率校准与极端事件是否遗漏。`, String.raw`A complete workflow defines available information, constructs joint load-price scenarios, calculates each candidate decision’s cost in every scenario, and compares averages, tails, and constraint compliance. Comparing candidates on the same scenarios prevents random resampling from obscuring the effect of the decision itself.

Risk tolerance is not a fact that a model discovers automatically. A business may require a cash buffer or disallow certain production interruptions; such conditions come from the operation. Three scenarios are useful for hand calculation, while actual research must examine scenario coverage, probability calibration, and omitted extremes.`),
    ], lab: 'expectation',
    workedExample: { title: l('一个均值不等于任何情景的例子', 'An expectation that is not an individual scenario'), body: l(String.raw`假设低、常态、高成本分别为 3000、5000、12000 元，概率分别为 0.5、0.4、0.1。期望为 $0.5\times3000+0.4\times5000+0.1\times12000=4700$ 元。

方差为 $0.5(3000-4700)^2+0.4(5000-4700)^2+0.1(12000-4700)^2=6{,}810{,}000$ 元²，标准差约 2610 元。10% 的高成本情景仍然需要单独审视。

另设两个等概率的联合情景 $(E,\pi)=(8,300)$ 与 $(12,700)$，单位分别是 MWh 和元/MWh。真实期望成本为 $0.5\times8\times300+0.5\times12\times700=5400$ 元；均值相乘只有 $10\times500=5000$ 元，相差 400 元。`, String.raw`Suppose low, typical, and high costs are 3000, 5000, and 12000 yuan with probabilities 0.5, 0.4, and 0.1. Expected cost is $0.5\times3000+0.4\times5000+0.1\times12000=4700$ yuan.

Variance is $0.5(3000-4700)^2+0.4(5000-4700)^2+0.1(12000-4700)^2=6{,}810{,}000$ yuan², with standard deviation approximately 2610 yuan. The 10% high-cost scenario still deserves separate attention.

Now consider two equally likely joint scenarios $(E,\pi)=(8,300)$ and $(12,700)$ in MWh and yuan/MWh. Expected cost is $0.5\times8\times300+0.5\times12\times700=5400$ yuan. Multiplying the means gives only $10\times500=5000$ yuan, a 400-yuan difference.`) },
    misconception: l('“把期望成本降下来，就一定降低了所有风险。”期望改善可以与尾部恶化同时发生，应同时检查损失分布和业务约束。', '“Reducing expected cost necessarily reduces every risk.” A better mean can coexist with a worse tail; inspect the distribution and operating constraints together.'),
    boundary: l('情景与概率均为假设，不是对市场波动的估计。方差、分位数和 CVaR 也不能覆盖流动性、规则变更、信用与模型失效等全部风险。', 'Scenarios and probabilities are assumptions, not estimated market distributions. Variance, quantiles, and CVaR do not cover every liquidity, rule-change, credit, or model-failure risk.'),
    quiz: { question: l('高负荷与高价格经常同时出现时，用“平均电量×平均价格”估计成本可能怎样？', 'When high load often coincides with high prices, what can happen if cost is estimated as mean energy × mean price?'), options: [
      option('必定精确，因为期望可以随意拆开相乘', 'It must be exact because expectations always multiply', '乘积的期望一般不能拆开，必须考虑电量与价格的相关性。', 'Expectations of products do not generally factor; dependence matters.'),
      option('可能低估，因为遗漏了正协方差', 'It can understate cost by omitting positive covariance', '在这个条件下 E[Eπ]=E[E]E[π]+Cov(E,π)，协方差为正。', 'Under this condition E[Eπ]=E[E]E[π]+Cov(E,π), with positive covariance.', true),
      option('一定高估，因为用了两个平均值', 'It must overstate cost because two averages are used', '平均值的数量不决定偏差方向，相关性才是这里的关键。', 'The number of averages does not determine the direction; dependence is the issue.'),
    ] }, sourceIds: ['mml', 'fpp3'],
  },
  {
    id: '04', moduleId: 'math', title: l('导数、梯度与一次可以手算的学习', 'Derivatives, gradients, and one hand-calculated learning step'),
    subtitle: l('把“预测偏了多少”变成参数应该怎样调整。', 'Turn a prediction error into a direction for adjusting parameters.'),
    minutes: 24, prerequisites: ['01', '02', '03'],
    objectives: l(['用局部斜率解释导数、偏导数和梯度。', '按明确定义的损失函数计算一次参数更新。', '区分预测模型训练与带约束的交易优化。'], ['Interpret derivatives, partial derivatives, and gradients as local slopes.', 'Calculate a parameter update for an explicitly defined loss.', 'Separate predictive-model training from constrained trading optimization.']),
    tags: l(['导数与梯度', '损失函数', '学习率'], ['Derivatives and gradients', 'Loss function', 'Learning rate']),
    figure: 'foundations',
    figureCaption: l('把误差看成高低起伏的地形，梯度告诉你当前位置的变化趋势。', 'Read error as a landscape: a gradient describes the local direction of change.'),
    figureNotes: l(['较低的位置类比较小的训练损失，不代表交易收益一定更高。', '一次移动只利用局部斜率，步长仍需由学习率决定。', '示意地形不包含真实市场约束；精确更新由公式和实验计算。'], ['A lower position suggests smaller training loss, not necessarily higher trading profit.', 'One move uses a local slope, while the learning rate still determines step size.', 'The conceptual terrain contains no actual market constraints; formulas and the lab calculate exact updates.']),
    sections: [
      s('derivative', '导数回答“轻轻改一下会怎样”', 'A derivative asks what a small change would do', String.raw`把预测误差压缩成一个数叫作损失。先看一维例子：$L(w)=\tfrac12(w-3)^2$。当 $w$ 小于 3，稍微增大它会降低损失；大于 3 时则相反。导数 $L'(w)=w-3$ 把这种局部趋势变成有符号的数。

多参数时，对其中一个参数求导、暂时固定其他参数，得到偏导数。把所有偏导按参数顺序排列就是梯度 $\nabla_\theta L$。它说明附近怎样改变参数会影响损失，不是一个已经求出的最优参数列表。损失的定义和缩放改变，梯度大小也会改变。`, String.raw`A loss compresses prediction error into a scalar. Begin with $L(w)=\tfrac12(w-3)^2$. Below 3, increasing $w$ slightly decreases loss; above 3, the opposite holds. The derivative $L'(w)=w-3$ gives this local tendency a signed numerical value.

With several parameters, differentiate with respect to one while holding the others fixed to obtain a partial derivative. Collect these derivatives into the gradient $\nabla_\theta L$. It describes how nearby parameter changes affect loss; it is not a list of optimal parameter values. Changing the definition or scale of loss changes the gradient scale too.`),
      s('gradient-update', '负梯度给方向，学习率给步长', 'The negative gradient gives direction; the rate gives step size', String.raw`梯度下降使用 $\theta_{k+1}=\theta_k-\eta\nabla_\theta L(\theta_k)$，其中 $\eta>0$ 是学习率。减去负梯度会增大参数；“下降”的对象是目标损失，而不是每一个权重都变小。

对 $L(w)=\tfrac12(w-3)^2$，误差满足 $w_{k+1}-3=(1-\eta)(w_k-3)$。因此本例在 $0<\eta<2$ 时收敛；$\eta=2$ 会在低点两侧等幅摆动，$\eta>2$ 通常发散。这一范围由本例曲率决定，不能直接作为真实网络的学习率建议。`, String.raw`Gradient descent uses $\theta_{k+1}=\theta_k-\eta\nabla_\theta L(\theta_k)$ with learning rate $\eta>0$. Subtracting a negative gradient increases a parameter. “Descent” refers to the objective, not to every weight becoming smaller.

For $L(w)=\tfrac12(w-3)^2$, error evolves as $w_{k+1}-3=(1-\eta)(w_k-3)$. This example converges for $0<\eta<2$, oscillates without shrinking at $\eta=2$, and usually diverges above 2. That range follows from this quadratic’s curvature and is not a learning-rate recommendation for real networks.`),
      s('prediction-loss', '从一个负荷预测得到梯度', 'Obtain a gradient from a load prediction', String.raw`令预测为 $\hat y=wx+b$，训练目标为 $y$，损失 $L=\tfrac12(\hat y-y)^2$。链式法则把两段变化接起来：$\partial L/\partial w=(\hat y-y)x$，$\partial L/\partial b=\hat y-y$。输入值越大，同样的输出误差会对权重产生更大的梯度，这也解释了特征缩放的作用。

本课求导的 $x,y,w,b$ 均按教学尺度处理；真实实现常对输入和目标分别标准化，再将预测反变换回 MW。一个批量的训练损失是多个样本损失的平均，梯度也要采用相同的归一化口径。第 7 课会把这条链延伸到隐藏层。`, String.raw`Let $\hat y=wx+b$, target $y$, and loss $L=\tfrac12(\hat y-y)^2$. The chain rule connects two stages of change: $\partial L/\partial w=(\hat y-y)x$ and $\partial L/\partial b=\hat y-y$. A larger input produces a larger weight gradient for the same output error, helping explain why feature scaling matters.

Here $x,y,w,b$ use a teaching scale. Real implementations may standardize inputs and targets separately, then transform predictions back into MW. A batch loss averages sample losses; its gradient must use the same normalization. Lesson 7 extends this chain through a hidden layer.`),
      s('optimization-scope', '学预测参数，与选交易动作是两回事', 'Learning parameters and choosing trades are distinct problems', String.raw`训练负荷模型时，变量是权重，目标是减少预测误差。做采购决策时，变量可能是合同电量、报价或储能充放电，目标可能是采购成本与风险，且必须满足能量平衡、容量和生产约束。预测误差更小并不自动保证交易结果更好，因为两者的目标、约束和错误代价不同。

连续且可导的问题可以使用梯度方法；含整数开停机、分段报价、离散交易档位的模型可能需要其他优化方法。不要把“沿梯度走”误当成解决所有电力交易问题的通用按钮。先明确定义变量、单位、目标和约束，再选择算法。`, String.raw`When training a load model, variables are weights and the objective is prediction error. In procurement, variables may be contract quantities, offers, or battery schedules; the objective may combine cost and risk under energy-balance, capacity, and production constraints. Lower forecast error does not automatically imply better trading outcomes because objectives, constraints, and error costs differ.

Gradient methods suit some continuous differentiable problems. Integer commitment, piecewise bids, and discrete trading blocks may require other optimization methods. “Follow the gradient” is not a universal power-trading solution. Define variables, units, objectives, and constraints before choosing an algorithm.`),
    ], lab: 'gradient',
    workedExample: { title: l('同时更新斜率和偏置', 'Update a slope and bias simultaneously'), body: l(String.raw`用无量纲教学数据 $x=2,y=5$，初始 $w=1,b=0$。预测 $\hat y=2$，误差为 $-3$，损失 $L=\tfrac12(-3)^2=4.5$。两个梯度分别是 $\partial L/\partial w=-3\times2=-6$、$\partial L/\partial b=-3$。

取学习率 $\eta=0.1$，使用**更新前的同一组梯度**得到 $w'=1.6,b'=0.3$。重新前向计算 $\hat y'=1.6\times2+0.3=3.5$，新损失 $\tfrac12(3.5-5)^2=1.125$。这只说明一个样本上的一次更新，并未证明对未来负荷有泛化能力。`, String.raw`Use dimensionless teaching data $x=2,y=5$ with initial $w=1,b=0$. Prediction is $\hat y=2$, error is $-3$, and loss is $L=\tfrac12(-3)^2=4.5$. Gradients are $\partial L/\partial w=-3\times2=-6$ and $\partial L/\partial b=-3$.

At $\eta=0.1$, use the **same pre-update gradients** to obtain $w'=1.6,b'=0.3$. A new forward pass gives $\hat y'=1.6\times2+0.3=3.5$ and loss $\tfrac12(3.5-5)^2=1.125$. This is one update on one sample, not evidence of generalization to future load.`) },
    misconception: l('“损失下降就意味着交易一定赚钱。”训练损失度量预测误差；交易收益还取决于决策规则、价格实现、约束和费用，两者需要分别评估。', '“A lower training loss guarantees a profitable trade.” Training loss measures prediction error; trading outcomes also depend on decision rules, realized prices, constraints, and charges.'),
    boundary: l('推导使用光滑、确定性的简化损失，配套实验用于看清更新方向；它不是市场优化求解器，也不提供非凸网络全局收敛保证。', 'The derivation uses smooth deterministic teaching losses, and the lab reveals update directions. It is not a market optimization solver and gives no global-convergence guarantee for nonconvex networks.'),
    quiz: { question: l('当前参数为 1，梯度为 −6，学习率为 0.1，下一步参数是多少？', 'A parameter is 1, its gradient is −6, and the rate is 0.1. What is its next value?'), options: [
      option('0.4', '0.4', '更新是减去梯度，减去负数会增大参数。', 'The update subtracts the gradient; subtracting a negative increases the parameter.'),
      option('1.6', '1.6', '1−0.1×(−6)=1.6，方向由梯度符号决定。', '1−0.1×(−6)=1.6; the gradient sign determines the direction.', true),
      option('6', '6', '梯度是局部变化率，不能直接当作新的参数值。', 'A gradient is a local rate of change, not the new parameter value.'),
    ] }, sourceIds: ['mml', 'dlbook', 'd2l'],
  },
];

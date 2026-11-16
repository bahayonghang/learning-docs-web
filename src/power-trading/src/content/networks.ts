import type { Chapter } from '../types';
import { l, s, option } from './helpers';

export const networkChapters: Chapter[] = [
  {
    id: '05', moduleId: 'networks', title: l('先做一个能被超越的线性基线', 'Build a linear baseline worth improving'),
    subtitle: l('从“昨天同一时刻”到回归，让复杂模型有一个公平的比较对象。', 'From the same time yesterday to regression: give complex models a fair reference.'),
    minutes: 24, prerequisites: ['01', '02', '04'],
    objectives: l(['区分预测目标、输入特征与可训练参数。', '解释最小二乘如何从数据确定一条预测关系。', '用按时间留出的结果比较简单基线与复杂模型。'], ['Separate targets, input features, and trainable parameters.', 'Explain how least squares fits a predictive relationship.', 'Compare simple and complex models using chronological holdouts.']),
    tags: l(['线性回归', '基线模型', '误差分析'], ['Linear regression', 'Baselines', 'Error analysis']),
    figure: 'neural-forecast',
    figureCaption: l('先把已知信息送进一个简单预测器，再用实际观测检查误差。', 'Pass available information through a simple predictor, then check its errors against observations.'),
    figureNotes: l(['天气、日历与历史用电都可以提供预测线索，但应在预测时已经可获得。', '模型部分先用线性加权来理解，不需要立即跳到深层网络。', '预测与实际的比较产生学习信号；图中不展示真实模型的精度结果。'], ['Weather, calendars, and past load can provide predictive information if available at forecast time.', 'Begin with linear weighting inside the model before moving to deeper networks.', 'Comparing predictions with observations creates a learning signal; the illustration is not a measured accuracy result.']),
    sections: [
      s('baseline', '为什么先预测“和昨天差不多”', 'Why start with “similar to yesterday”?', String.raw`复杂模型应该先回答一个朴素问题：它是否比简单办法更有用？负荷的季节性基线可以取上一个同类时段，例如昨天或上周同一时刻的负荷。普通持续性基线取最后一个可见观测值。它们不需要深层网络，却能揭示数据里有多强的重复规律。

基线必须遵守预测时点。预测明天全天时，“明天前一时刻的实际负荷”还不可用，不能偷偷作为输入。工厂临时停产、节假日和极端天气会让简单重复失效；这些失败也提供了新特征和更复杂模型应该解决的问题。`, String.raw`A complex model should first answer a simple question: is it more useful than an uncomplicated alternative? A seasonal load baseline can use the previous comparable interval, such as the same time yesterday or last week. A persistence baseline uses the latest available observation. Neither requires a deep network, and both reveal how much predictable repetition the data contains.

Baselines must respect forecast time. When predicting all of tomorrow, tomorrow’s immediately preceding realized load is not yet available. Shutdowns, holidays, and extreme weather can defeat simple repetition; those failures identify problems that additional features or more complex models should solve.`),
      s('least-squares', '让数据选择权重，而不是手调到好看', 'Let data choose weights rather than tuning by appearance', String.raw`线性模型为 $\hat y_i=x_i\cdot w+b$。给定 $n$ 个训练样本，可以最小化半均方误差：

$$L(w,b)=\frac{1}{2n}\sum_{i=1}^n(\hat y_i-y_i)^2.$$

平方让正负误差不会相互抵消，并让大误差承担更大的惩罚。$1/2$ 只是方便求导的约定，必须与梯度和学习率口径一致。优化得到的是“在这些特征、数据和损失下的拟合关系”，不是某个永远成立的物理定律。解析方法或梯度方法都可以求解合适的线性回归问题。`, String.raw`A linear model predicts $\hat y_i=x_i\cdot w+b$. Given $n$ training examples, one objective is half the mean squared error:

$$L(w,b)=\frac{1}{2n}\sum_{i=1}^n(\hat y_i-y_i)^2.$$

Squaring prevents positive and negative errors from canceling and penalizes larger errors more strongly. The factor $1/2$ is a differentiation convention and must match the gradient and learning-rate interpretation. The fitted relationship depends on the features, data, and loss; it is not an eternal physical law. Suitable linear regression problems can be solved by analytical or gradient-based methods.`),
      s('features-regularization', '线性模型也能表达经过设计的关系', 'A linear model can use deliberately designed features', String.raw`“线性”通常指对待估参数线性，不表示原始温度只能直线影响负荷。可以事先构造制冷度数、温度平方、小时指示或生产计划等特征，再做线性回归。例如 $\max(T-26,0)$ 可描述超过某阈值后的额外制冷需求；26°C 在这里是教学设定，不是通用工程阈值。

特征越多越要关注共线性与过拟合。岭回归在损失里加入 $\lambda\lVert w\rVert_2^2$，用系数大小约束拟合自由度；通常不惩罚截距。缩放方式、特征组合与 $\lambda$ 都只能利用训练和验证数据选择。正则化帮助控制模型，但不能修复未来信息泄漏。`, String.raw`“Linear” usually means linear in the estimated parameters, not necessarily a straight-line relationship with raw temperature. You can construct cooling-degree features, squared temperature, hour indicators, or production-plan features before regression. For example, $\max(T-26,0)$ can represent additional cooling demand above a threshold; 26°C is a teaching choice, not a universal engineering limit.

More features bring concerns about collinearity and overfitting. Ridge regression adds $\lambda\lVert w\rVert_2^2$ to control coefficient size; the intercept is usually exempt. Scaling, feature combinations, and $\lambda$ must be selected using training and validation data. Regularization cannot repair future-information leakage.`),
      s('residuals', '看误差在什么时候发生', 'Examine when errors occur', String.raw`定义残差 $e_t=y_t-\hat y_t$，正值表示低估。除了汇总 MAE 或 RMSE，还要按小时、工作日、温度区间、预测步长检查误差。一个模型可能白天很好、晚高峰系统性低估；平均误差接近零也可能只是正负相消。

比较模型时应使用相同的预测起点、数据可用范围和评估时段。先报告预测质量，再把预测交给同一套决策逻辑检查业务后果。若只给复杂模型额外天气信息，却让基线缺少这些信息，性能差异就不能全部归功于网络结构。`, String.raw`Define residual $e_t=y_t-\hat y_t$, so a positive residual means underprediction. Beyond MAE or RMSE, inspect errors by hour, working-day status, temperature band, and forecast horizon. A model can work well during the day yet systematically underestimate the evening peak. Near-zero mean error can hide canceling positive and negative errors.

Compare models at the same forecast origins, with the same available information and evaluation periods. Assess forecast quality first, then feed forecasts into the same decision logic to examine business consequences. If only the complex model receives extra weather information, its advantage cannot be attributed entirely to network architecture.`),
    ], lab: 'gradient',
    workedExample: { title: l('三条教学数据确定一个线性关系', 'Three teaching observations define a linear relation'), body: l(String.raw`设标准化温度特征 $x=(T-20)/5$，三个教学样本为 $(x,y)=(0,8),(1,10),(2,12)$，$y$ 单位为 MW。关系 $\hat y=2x+8$ 恰好拟合这三个样本；训练半均方误差为零。

预测温度 27.5°C 时，$x=1.5$，得到 $\hat y=11$ MW。若后来观测为 11.5 MW，绝对误差为 0.5 MW。假设同期季节性基线为 10.5 MW，它的绝对误差为 1 MW。这里只比较了一个合成样本，不能据此宣称线性模型普遍优于季节性基线，也不能从零训练误差推出零未来误差。`, String.raw`Let the scaled temperature feature be $x=(T-20)/5$. Three teaching samples are $(x,y)=(0,8),(1,10),(2,12)$, with $y$ in MW. The relation $\hat y=2x+8$ fits all three exactly and has zero training half-MSE.

At a forecast temperature of 27.5°C, $x=1.5$ and $\hat y=11$ MW. If actual load later equals 11.5 MW, absolute error is 0.5 MW. A hypothetical seasonal baseline of 10.5 MW has error 1 MW on the same observation. One synthetic example establishes neither universal superiority nor zero future error from a zero training error.`) },
    misconception: l('“训练误差为零，说明预测问题已经解决。”零误差可能只来自非常简单的样本或过拟合，未来评估仍必须独立进行。', '“Zero training error solves forecasting.” It can reflect simple examples or overfitting; future performance still requires independent evaluation.'),
    boundary: l('直线与温度阈值均为教学构造，不是经过校准的工厂负荷规律。配套梯度实验用于理解拟合过程，不进行真实多特征回归或模型优劣排名。', 'The line and temperature threshold are teaching constructions, not calibrated factory-load relationships. The gradient lab explains fitting rather than performing real multifeature regression or ranking deployed models.'),
    quiz: { question: l('怎样判断新网络比线性基线更有效？', 'How can you judge whether a new network improves on a linear baseline?'), options: [
      option('比较同一时间留出集、同一信息范围下的表现', 'Compare the same chronological holdout and available information', '保持任务和信息范围一致，差异才更能反映模型本身，并应检查误差的业务后果。', 'Consistent tasks and information make the comparison meaningful; inspect business consequences as well.', true),
      option('只看谁的训练误差更低', 'Compare training errors alone', '更强的拟合能力也可能只是记住训练样本。', 'Greater fitting capacity may simply memorize training examples.'),
      option('谁参数更多，谁一定更好', 'The model with more parameters must be better', '模型容量不是未来预测效果的保证。', 'Model capacity does not guarantee future predictive performance.'),
    ] }, sourceIds: ['mml', 'd2l', 'fpp3'],
  },
  {
    id: '06', moduleId: 'networks', title: l('从一个神经元到非线性负荷模型', 'From one neuron to a nonlinear load model'),
    subtitle: l('加权、偏置、激活，再把简单计算组合成一张网络。', 'Weight, offset, activate, and compose simple calculations into a network.'),
    minutes: 25, prerequisites: ['02', '04', '05'],
    objectives: l(['分清输入、参数、中间特征与最终输出。', '手算一个 ReLU 神经元及其负荷输出。', '根据预测任务选择输出含义，而不是把任何数都叫概率。'], ['Separate inputs, parameters, hidden features, and final outputs.', 'Calculate a ReLU neuron and its load output.', 'Interpret outputs through the task rather than calling every number a probability.']),
    tags: l(['神经元', 'ReLU与多层网络', '非线性'], ['Neurons', 'ReLU and multilayer networks', 'Nonlinearity']),
    figure: 'neural-forecast',
    figureCaption: l('网络把可用特征逐层变换，最终给出一个与任务单位一致的预测。', 'A network transforms available features through layers into a prediction with task-specific units.'),
    figureNotes: l(['输入侧的不同信息可以对应天气、生产计划与历史负荷。', '中间节点类比可学习特征，节点数量不是本课网络的精确规模。', '输出侧的负荷或价格只是预测，实际值仍要等待观测与评估。'], ['Inputs can represent weather, production plans, and past load.', 'Intermediate nodes suggest learnable features; their count is not the exact model size.', 'Load or price outputs are predictions; observations and evaluation remain necessary.']),
    sections: [
      s('neuron', '一个神经元的四个角色', 'Four roles inside a neuron', String.raw`人工神经元先计算 $z=\sum_jw_jx_j+b$，再输出 $h=\phi(z)$。$x_j$ 是当前样本输入，$w_j$ 与 $b$ 是训练得到的参数，$\phi$ 是激活函数，$h$ 是中间特征。输入每次变化，参数通常在推理阶段保持固定；训练阶段才按损失更新参数。

把温度和生产强度送进一个神经元，可以形成“高温且高生产强度”的组合特征。这个说法只是帮助理解：普通隐藏节点未必具有可命名、稳定的业务含义。网络学到的统计关系，也不等于我们已经掌握了调节工况的因果机制。`, String.raw`An artificial neuron computes $z=\sum_jw_jx_j+b$ and then $h=\phi(z)$. Inputs $x_j$ belong to the current example; weights $w_j$ and bias $b$ are learned parameters; $\phi$ is an activation function; $h$ is a hidden feature. Inputs change on every prediction, while parameters usually remain fixed during inference and change during training.

Combining temperature and production intensity can create a feature related to their joint behavior. This is an intuition, not a promise that every hidden unit has a stable business label. A learned statistical relationship also does not establish the causal effect of changing operating conditions.`),
      s('nonlinearity', '为何需要激活函数', 'Why an activation is needed', String.raw`若两层都只是线性变换加偏置，它们仍可合并：$(xW_1+b_1)W_2+b_2=x(W_1W_2)+b_1W_2+b_2$。增加层数本身没有摆脱仿射关系。插入非线性之后，网络才能组合出更复杂的分段或曲面关系。

ReLU 定义为 $\phi(z)=\max(0,z)$：正输入直接通过，负输入输出零。sigmoid 则把输入压缩到 0 与 1 之间。ReLU 不会让权重自动为正，也不会保证每个单元都一直有效；某些单元若长期落在负区间，梯度可能为零。`, String.raw`Two affine layers can still be combined: $(xW_1+b_1)W_2+b_2=x(W_1W_2)+b_1W_2+b_2$. Depth alone has not escaped an affine relationship. Intervening nonlinearities allow compositions of more complicated piecewise or curved relationships.

ReLU is $\phi(z)=\max(0,z)$: positive inputs pass through and negative inputs become zero. Sigmoid instead maps values between zero and one. ReLU does not force weights to be positive or guarantee that every unit remains useful; units persistently in the negative region may receive zero gradients.`),
      s('layers', '把许多神经元合成矩阵', 'Combine neurons into matrices', String.raw`采用行向量约定，一个含 $d$ 个输入、$h$ 个隐藏单元、单个输出的网络可以写为 $H=\operatorname{ReLU}(XW_1+b_1)$，$\hat y=HW_2+b_2$。若 $X$ 为 $n\times d$，则 $W_1$ 为 $d\times h$，$H$ 为 $n\times h$，$W_2$ 为 $h\times1$。

输入层没有把数据变成生物神经元；它只是规定数字如何进入计算。隐藏层学到中间表示，输出层把这些表示映射到目标。增加容量可能帮助拟合复杂关系，也增加数据、正则化与验证要求，不能替代对时序和预测时点的正确处理。`, String.raw`Using row vectors, a network with $d$ inputs, $h$ hidden units, and one output is $H=\operatorname{ReLU}(XW_1+b_1)$ followed by $\hat y=HW_2+b_2$. If $X$ is $n\times d$, then $W_1$ is $d\times h$, $H$ is $n\times h$, and $W_2$ is $h\times1$.

The input layer specifies how numbers enter a computation; it does not turn measurements into biological neurons. Hidden layers learn representations, and the output layer maps them to the target. Greater capacity may fit complex relationships, but brings data, regularization, and validation requirements. It cannot substitute for correct time alignment and forecast origins.`),
      s('output', '输出层必须服从目标的含义', 'The output layer must match the target', String.raw`预测负荷时，可以使用线性输出再检查物理可行性，或根据建模设计采用合适的非负变换。预测现货价格时，某些市场和时段允许负价格，不能为了“看起来合理”而一律用 ReLU 截掉负数。目标做过标准化时，先反变换才能恢复 MW 或元/MWh。

只有在合适的二分类目标、训练与评估下，sigmoid 输出才可解释为某事件的预测概率；0.8 的隐藏激活不是“80% 把握”。输出概率还需检查校准。多个分位数或多个未来时段也可以各占一个输出位置，它们的维度和业务含义要在训练前写清楚。`, String.raw`For load forecasting, one design uses a linear output with physical plausibility checks; another uses a suitable nonnegative transformation. Some spot markets and intervals admit negative prices, so a price predictor should not universally clip them with ReLU. If the target was standardized, invert the transformation to recover MW or yuan/MWh.

A sigmoid can represent an event probability under an appropriate binary target, training objective, and evaluation setup. A hidden activation of 0.8 is not “80% confidence,” and probabilistic outputs still require calibration checks. Different quantiles or forecast horizons can occupy separate output positions, whose dimensions and meanings should be specified before training.`),
    ], lab: 'neuron',
    workedExample: { title: l('一层隐藏特征，得到 8.6 MW', 'One hidden feature produces 8.6 MW'), body: l(String.raw`输入两个无量纲特征 $x=[0.5,1]$，取 $w=[1.2,0.8]$，偏置 $b=-0.5$。加权和为 $z=0.5\times1.2+1\times0.8-0.5=0.9$，ReLU 隐藏值 $h=0.9$。

设输出层为 $\hat P=5+4h$ MW，得到 $\hat P=8.6$ MW。若第一个特征改为 $-1$，则 $z=-0.9$，$h=0$，预测变为 5 MW。这里的 5 是手设的输出基准，不是最低用电量的物理证明。`, String.raw`Use dimensionless inputs $x=[0.5,1]$, weights $w=[1.2,0.8]$, and bias $b=-0.5$. The weighted sum is $z=0.5\times1.2+1\times0.8-0.5=0.9$, so the ReLU hidden value is $h=0.9$.

Let the output layer be $\hat P=5+4h$ MW, giving $\hat P=8.6$ MW. Changing the first input to $-1$ gives $z=-0.9$, $h=0$, and a 5 MW prediction. That 5 is a hand-set model baseline, not proof of a physical minimum load.`) },
    misconception: l('“用 sigmoid 得到 0.8，就说明负荷预测有 80% 正确率。”激活数值的范围不决定其统计含义；必须看目标、损失、校准与评估。', '“A sigmoid value of 0.8 means the load forecast is 80% accurate.” An activation’s range does not determine statistical meaning; inspect the target, loss, calibration, and evaluation.'),
    boundary: l('实验使用滑块调整的小型计算单元，不训练深层网络；隐藏特征解释是帮助理解的类比，未验证实际工业用电规律或交易收益。', 'The lab uses a small slider-controlled computation rather than training a deep network. Hidden-feature interpretations are illustrative, not validated industrial load relationships or trading results.'),
    quiz: { question: l('为了预测可能出现负值的现货价格，输出层必须如何考虑？', 'What should you consider when predicting spot prices that may be negative?'), options: [
      option('任何预测都必须用 ReLU 截断到非负', 'Every prediction must use ReLU to stay nonnegative', '这会排除目标中允许的负价格，造成模型表达错误。', 'That would exclude valid negative targets and misspecify the model.'),
      option('根据市场允许的目标范围设计输出，而不是任意截断', 'Design the output for the allowed target range rather than clipping arbitrarily', '输出变换应与目标口径一致；是否允许负价要核对具体规则。', 'The output transformation should match the target; check the applicable rules for negative prices.', true),
      option('所有输出都改成 0 到 1 的概率', 'Convert every output into a probability from 0 to 1', '价格回归与事件概率预测是不同任务。', 'Price regression and event-probability prediction are different tasks.'),
    ] }, sourceIds: ['dlbook', 'd2l'],
  },
  {
    id: '07', moduleId: 'networks', title: l('反向传播：把误差信号送回参数', 'Backpropagation: send the error signal to the parameters'),
    subtitle: l('前向得到预测，反向得到梯度，优化器才执行更新。', 'The forward pass produces predictions, the backward pass gradients, and the optimizer updates.'),
    minutes: 28, prerequisites: ['04', '05', '06'],
    objectives: l(['按计算图跟踪一次前向和反向传播。', '用链式法则手算两层网络的参数梯度。', '区分训练改进、验证选择与最终测试。'], ['Trace a forward and backward pass through a computational graph.', 'Calculate parameter gradients in a two-layer network.', 'Distinguish training improvement, validation selection, and final testing.']),
    tags: l(['反向传播', '链式法则', '训练与泛化'], ['Backpropagation', 'Chain rule', 'Training and generalization']),
    figure: 'neural-forecast',
    figureCaption: l('预测与实际之间的差异形成损失，训练沿计算依赖把梯度传回各层。', 'Prediction errors define a loss, and training propagates gradients through computational dependencies.'),
    figureNotes: l(['先顺着输入到输出理解前向计算，再把实际观测用于计算损失。', '学习反馈表示调整参数所需的导数，不是把真实答案倒着塞回网络。', '图中的反馈路径仅表达直觉，具体梯度和更新由本课算例展开。'], ['Follow the inputs to the output for the forward computation, then compare with an observation.', 'Learning feedback represents derivatives used to adjust parameters, not the target being run backward.', 'Feedback paths provide intuition; the worked example supplies the exact derivatives and updates.']),
    sections: [
      s('graph', '先保存每一步算了什么', 'Keep track of each intermediate computation', String.raw`考虑一个两层标量网络：$z_1=w_1x+b_1$，$h=\operatorname{ReLU}(z_1)$，$\hat y=w_2h+b_2$，$L=\tfrac12(\hat y-y)^2$。按顺序计算这些变量就是前向传播。计算图记录哪些结果依赖哪些输入，因此也给反向求导提供路径。

反向传播会用到前向中间值。例如 $\partial\hat y/\partial w_2=h$，而 ReLU 的局部导数取决于 $z_1$ 是正还是负。训练所需内存因此不只包含权重，还包括用于求导的中间状态。推理若不需要梯度，可以省去一部分训练状态。`, String.raw`Consider a scalar two-layer network: $z_1=w_1x+b_1$, $h=\operatorname{ReLU}(z_1)$, $\hat y=w_2h+b_2$, and $L=\tfrac12(\hat y-y)^2$. Evaluating these variables in order is forward propagation. A computational graph records dependencies and therefore supplies paths for differentiation.

The backward pass uses intermediate forward values. For example, $\partial\hat y/\partial w_2=h$, while ReLU’s local derivative depends on the sign of $z_1$. Training memory thus includes intermediate states as well as weights. Inference without gradients can omit some training-specific state.`),
      s('chain-rule', '把每一段局部影响乘起来', 'Multiply local influences along a path', String.raw`第一层权重影响隐藏特征，隐藏特征影响预测，预测影响损失。链式法则把这条路径连接成：

$$\frac{\partial L}{\partial w_1}=\frac{\partial L}{\partial\hat y}\frac{\partial\hat y}{\partial h}\frac{\partial h}{\partial z_1}\frac{\partial z_1}{\partial w_1}.$$

当 $z_1>0$，四项分别是 $(\hat y-y)$、$w_2$、1 和 $x$。若一项变量通过多条路径影响损失，需要把各路径贡献相加。反向传播复用公共中间梯度，提高计算效率；它不是为每个参数重新跑一遍完全独立的数值试探。`, String.raw`The first weight affects a hidden feature, which affects the prediction, which affects loss. The chain rule joins the path:

$$\frac{\partial L}{\partial w_1}=\frac{\partial L}{\partial\hat y}\frac{\partial\hat y}{\partial h}\frac{\partial h}{\partial z_1}\frac{\partial z_1}{\partial w_1}.$$

When $z_1>0$, these factors are $(\hat y-y)$, $w_2$, 1, and $x$. If a variable influences loss through several paths, add their contributions. Backpropagation reuses shared intermediate derivatives rather than independently perturbing every parameter and rerunning the entire model.`),
      s('training-loop', '一次训练迭代的职责分工', 'Responsibilities within a training iteration', String.raw`一个基础迭代按顺序完成：读取训练样本 → 前向预测 → 计算损失 → 清理或管理旧梯度 → 反向求导 → 优化器更新。反向传播只计算梯度，SGD、Adam 等优化器才决定怎样改参数。若有意累积多个小批量的梯度，应清楚何时清零、何时更新，以及损失怎样归一化。

大梯度可能来自异常数据、尺度不当或训练不稳定。检查输入与目标对齐，比首先尝试更复杂优化器更重要。自动微分能正确求出**所写计算图**的导数，但无法替你发现“把次日价格错当成当前特征”这样的任务定义错误。`, String.raw`A basic iteration reads training examples, predicts forward, computes loss, clears or manages old gradients, differentiates backward, and updates through an optimizer. Backpropagation computes gradients; SGD, Adam, or another optimizer determines parameter changes. If gradients intentionally accumulate across minibatches, specify when they are cleared, when updates occur, and how losses are normalized.

Large gradients may reflect anomalous data, poor scaling, or instability. Check input-target alignment before reaching for a more complicated optimizer. Automatic differentiation can correctly differentiate the graph you wrote; it cannot detect a task error such as using tomorrow’s realized price as today’s feature.`),
      s('generalization', '训练学参数，验证选方案，测试看未来', 'Train parameters, validate choices, test future performance', String.raw`训练集参与梯度计算；验证集用于选择模型、学习率、正则化和检查点；测试集在方案冻结后评估。验证集虽不直接更新权重，反复据此做选择仍可能过度适应它。时间序列需要保留时间顺序，并防止滚动窗口的目标跨过划分边界。

例如训练损失在第 10、20、30 轮为 0.50、0.30、0.20，而同一验证集损失为 0.55、0.40、0.48。若预先约定按最低验证损失选择，应取第 20 轮。早停是选择规则，不是“模型已经理解市场”的证明；最终还应检查未见时段与极端工况。`, String.raw`Training data contributes to gradients. Validation data selects model design, rate, regularization, and checkpoints. Test data evaluates the frozen design. Repeated validation-based selection can over-adapt to validation data even without direct gradient updates. Time series require chronological boundaries, including checks that rolling-window targets do not cross split boundaries.

Suppose training losses at epochs 10, 20, and 30 are 0.50, 0.30, and 0.20, while validation losses are 0.55, 0.40, and 0.48. A predeclared minimum-validation-loss rule selects epoch 20. Early stopping is a selection procedure, not proof that the model understands the market; unseen periods and extreme conditions still require evaluation.`),
    ], lab: 'gradient',
    workedExample: { title: l('同时更新四个参数，并重新计算损失', 'Update four parameters together and recompute loss'), body: l(String.raw`使用无量纲教学值 $x=2,y=4,w_1=0.5,b_1=0,w_2=3,b_2=0$。前向：$z_1=1,h=1,\hat y=3,L=0.5$。

反向：输出误差为 $-1$，因此 $\partial L/\partial w_2=-1$、$\partial L/\partial b_2=-1$；第一层 $\partial L/\partial w_1=(-1)\times3\times1\times2=-6$、$\partial L/\partial b_1=-3$。

学习率 0.01 时，使用同一旧参数点的梯度同时更新：$w_1'=0.56,b_1'=0.03,w_2'=3.01,b_2'=0.01$。新隐藏值 $h'=0.56\times2+0.03=1.15$，新预测 $3.01\times1.15+0.01=3.4715$，新损失约 0.139656。不能先更新第二层，再拿新权重计算这一步第一层的旧梯度。`, String.raw`Use dimensionless teaching values $x=2,y=4,w_1=0.5,b_1=0,w_2=3,b_2=0$. Forward: $z_1=1,h=1,\hat y=3,L=0.5$.

Backward: output error is $-1$, giving $\partial L/\partial w_2=-1$ and $\partial L/\partial b_2=-1$. For the first layer, $\partial L/\partial w_1=(-1)\times3\times1\times2=-6$ and $\partial L/\partial b_1=-3$.

At rate 0.01, update all parameters using gradients from the same old point: $w_1'=0.56,b_1'=0.03,w_2'=3.01,b_2'=0.01$. The new hidden value is $h'=0.56\times2+0.03=1.15$, prediction is $3.01\times1.15+0.01=3.4715$, and loss is approximately 0.139656. Do not update the second layer and then use its new weight to calculate the first layer’s old-step gradient.`) },
    misconception: l('“调用反向传播后参数就已经变了。”反向传播计算导数，参数更新是另一个操作；梯度累积时尤其需要区分。', '“Calling backpropagation already changes the weights.” Derivative computation and parameter updates are separate operations, especially with gradient accumulation.'),
    boundary: l('例子省略批量矩阵计算、正则化、优化器内部状态和 ReLU 零点约定。配套实验用于理解梯度步骤，不模拟真实训练集与验证集的泛化曲线。', 'The example omits batch matrix operations, regularization, optimizer state, and the convention for ReLU at zero. The companion lab explains gradient steps rather than simulating real generalization curves.'),
    quiz: { question: l('训练损失一直下降，但验证损失先降后升，按预设验证规则应怎样选模型？', 'Training loss falls throughout, while validation loss first falls and then rises. How should a predeclared validation rule select the model?'), options: [
      option('选择训练损失最低的最后一轮', 'Choose the final epoch with the lowest training loss', '训练拟合更好不保证未见数据表现更好。', 'Better training fit does not guarantee better unseen-data performance.'),
      option('反复查看测试集，直到找到最好的一轮', 'Repeatedly inspect the test set to find the best epoch', '这会把测试集变成选择模型的开发数据。', 'That turns the test set into development data used for selection.'),
      option('按验证损失选检查点，再在独立测试集评估', 'Select by validation loss, then assess on an independent test set', '验证承担选择职责，独立测试保留最终检验作用。', 'Validation performs selection while an independent test retains its assessment role.', true),
    ] }, sourceIds: ['dlbook', 'd2l', 'fpp3'],
  },
  {
    id: '08', moduleId: 'networks', title: l('时间窗、序列网络与预测区间', 'Time windows, sequence networks, and forecast intervals'),
    subtitle: l('把过去组织成输入，把尚未发生的未来组织成目标。', 'Organize the observed past into inputs and the unobserved future into targets.'),
    minutes: 28, prerequisites: ['02', '03', '05', '06', '07'],
    objectives: l(['明确预测起点、历史窗口与预测步长。', '说明 MLP、卷积、循环网络与注意力处理序列的不同方式。', '区分点预测、分位数区间和联合情景。'], ['Define a forecast origin, history window, and horizon.', 'Explain how MLPs, convolutions, recurrent networks, and attention handle sequences.', 'Separate point forecasts, quantile intervals, and joint scenarios.']),
    tags: l(['时间序列', '多步预测', '不确定性'], ['Time series', 'Multistep forecasts', 'Uncertainty']),
    figure: 'neural-forecast',
    figureCaption: l('历史测量和已知未来条件一起进入模型，输出是尚未观测的未来。', 'Historical observations and known future conditions enter a model that predicts an unobserved future.'),
    figureNotes: l(['把历史记录和预测起点分清：起点之后的真实结果不能混进输入。', '天气预报与日历是可能的未来条件，但两者的可用性和误差不同。', '预测带表达不确定性的概念；具体覆盖率必须通过独立数据检验。'], ['Separate historical records from the forecast origin; later actual outcomes cannot enter the input.', 'Weather forecasts and calendars can supply future conditions with different availability and error properties.', 'A forecast band illustrates uncertainty; actual coverage must be checked independently.']),
    sections: [
      s('window', '每个样本都有一个“现在”', 'Every example has its own “now”', String.raw`在预测起点 $t$，模型看到长度为 $L$ 的历史窗口 $x_{t-L+1:t}$，预测未来 $H$ 个时段 $y_{t+1:t+H}$。如果每时段有 $d$ 个特征，一批输入可以记为 $B\times L\times d$，输出为 $B\times H$。输入轴与输出轴含义不同，不能因为都表示时间就直接对齐相乘。

未来日历通常提前已知；未来天气只能使用在 $t$ 之前发布的预报版本；未来实际负荷仍是目标。训练样本可以来自很多过去起点，但每个样本都要恢复其当时可用的信息。任何填补、平滑或归一化都必须考虑这一时间边界。`, String.raw`At forecast origin $t$, a model sees a history window $x_{t-L+1:t}$ of length $L$ and predicts $H$ future intervals $y_{t+1:t+H}$. With $d$ features per interval, a batch can have shape $B\times L\times d$ and outputs $B\times H$. Input and output time axes have different meanings and cannot be aligned merely because both represent time.

Future calendar information is usually known, future weather must use forecasts issued no later than $t$, and future actual load remains a target. Training can draw from many past origins, but must reconstruct each origin’s available information. Imputation, smoothing, and scaling must respect that boundary too.`),
      s('architectures', '不同网络怎样利用历史', 'How different networks use history', String.raw`MLP 可以把固定窗口展平成一串特征，结构简单但输入长度通常固定。时间卷积使用局部共享滤波器提取模式；因果卷积在每个位置只访问该位置及之前的信息。RNN 按时间更新隐藏状态，LSTM/GRU 用门控调节信息保留；注意力根据当前任务对多个历史位置进行加权组合。

这些结构各有计算和建模取舍，没有一个名称能保证在所有负荷数据上最好。已完整观测的历史窗口内部使用双向编码不必然泄漏；真正的判断是：有没有读到**预测起点之后尚不可得的信息**。模型能接受不同窗口长度，也不意味着无需长度管理、掩码或足够的训练覆盖。`, String.raw`An MLP can flatten a fixed window into features: simple, but usually tied to a chosen length. Temporal convolutions share local filters; causal convolutions only read the current and earlier positions. RNNs update a hidden state over time, with LSTM or GRU gates controlling information retention. Attention combines information from several historical positions using learned weights.

Each architecture has modeling and computational tradeoffs; its name guarantees no universal forecasting advantage. Bidirectional encoding inside a fully observed historical window is not automatically leakage. The real question is whether it reads information unavailable after the forecast origin. Supporting variable window lengths still requires length management, masks where needed, and adequate training coverage.`),
      s('multistep', '直接预测与递归预测会遇到不同错误', 'Direct and recursive forecasts accumulate error differently', String.raw`递归方式先预测一步，再把预测值作为下一步的输入继续向前。它复用一个预测器，但训练时使用真实历史、推理时使用自己的预测，分布可能变化，误差也可能累积。直接多步方式一次输出 $H$ 个目标，或为每个步长建模型，避免把前一步预测强行回填，但需要学习不同步长的规律。

评估时要逐步长报告误差，而不是只给一个混在一起的均值。近一小时预测准确，不说明明天全天也准确。滚动重预测能纳入新信息，但回测也必须在相应时点才释放这些观测，不能提前使用。`, String.raw`A recursive strategy forecasts one step, feeds that prediction into the next input, and continues. It reuses a predictor, but may face a difference between observed histories during training and self-generated histories during inference, allowing errors to accumulate. Direct multistep prediction outputs $H$ targets together or uses horizon-specific models, avoiding mandatory feedback of the preceding prediction while learning horizon-specific relationships.

Report errors by horizon rather than only one pooled average. Accurate forecasts for the next hour do not establish accuracy for all of tomorrow. Rolling reforecasting can use new information, but a backtest must release observations only when they would actually have become available.`),
      s('uncertainty', '一个数不够时，给出分布信息', 'When one number is insufficient, describe the distribution', String.raw`点预测给出一个中心值，例如条件均值或中位数。分位数预测可以给出 $q_{0.1},q_{0.5},q_{0.9}$；在相应条件分布下，10%与90%分位数构成名义80%区间；连续分布且分位数准确时对应80%的概率质量，离散分布的覆盖可能更高。这是模型声称的覆盖，必须检查实际样本覆盖率、区间宽度和不同工况的表现。

逐时分位数带不是一条联合概率情景路径。“每个时段分别有 80% 覆盖”不等于“整天全部时段同时有 80% 覆盖”。储能、累计电量和组合风险需要跨时段相关性，通常还要构造联合情景。第 13—16 课会把这些概念连接到负荷、电价和回测。`, String.raw`A point forecast gives one central value, such as a conditional mean or median. Quantile forecasts can supply $q_{0.1},q_{0.5},q_{0.9}$; the 10th and 90th quantiles define a nominal 80% interval. Accurate quantiles of a continuous conditional distribution cover 80%; a discrete distribution can have greater coverage. That is model-implied coverage: evaluate realized coverage, width, and performance under different operating conditions.

Separate interval quantile bands are not joint scenario paths. An 80% interval at every time does not imply an 80% chance that the whole day lies inside every band simultaneously. Storage, cumulative energy, and portfolio risk depend on temporal dependence and often require joint scenarios. Lessons 13–16 connect these ideas to load, prices, and backtesting.`),
    ], lab: 'forecast',
    workedExample: { title: l('四步输入、两步输出，检查功率与电量', 'Four inputs, two outputs: check power and energy'), body: l(String.raw`设在起点 $t$ 已看到四个 15 分钟平均负荷 $[8,9,10,11]$ MW。模型预测未来两步为 $[12,10]$ MW，因此未来半小时预测电量为 $(12+10)\times0.25=5.5$ MWh。

后来实际值为 $[13,9]$ MW，两个绝对误差均为 1 MW，所以 MAE 为 1 MW；实际总电量同样是 5.5 MWh。**总电量准确并不代表每个时段准确**：若两步价格不同，时段误差仍会影响采购成本。

若第一步给出 10%—90% 分位数为 $[10,14]$ MW，它只描述第一步边际预测区间。不能据此给整条两步路径贴上“80% 一定命中”的标签。`, String.raw`At origin $t$, suppose four observed 15-minute average loads are $[8,9,10,11]$ MW. A model predicts the next two intervals as $[12,10]$ MW, giving half-hour energy $(12+10)\times0.25=5.5$ MWh.

Actual loads later become $[13,9]$ MW. Both absolute errors are 1 MW, so MAE is 1 MW, while actual total energy is also 5.5 MWh. **Accurate total energy does not imply accurate interval forecasts**: different interval prices can make those errors affect procurement cost.

A first-step 10%–90% quantile interval of $[10,14]$ MW describes that step’s marginal prediction interval. It does not establish an 80% simultaneous coverage probability for the whole two-step path.`) },
    misconception: l('“把每小时的 10% 与 90% 分位数连起来，就得到有 80% 概率覆盖整天的路径。”边际覆盖与联合覆盖不同，需要检查跨时段相关性。', '“Connecting hourly 10th and 90th quantiles gives an 80% whole-day path interval.” Marginal and simultaneous coverage differ; temporal dependence matters.'),
    boundary: l('本课比较网络思路与数据组织方式，配套预测实验为本地教学模型，没有训练或基准测试 LSTM、Transformer 等大型网络，也没有为真实市场提供概率担保。', 'This lesson compares architectures and data organization. The local forecasting lab does not train or benchmark large LSTM or Transformer networks and provides no real-market probability guarantee.'),
    quiz: { question: l('今天上午预测明天的负荷，下面哪个输入会泄漏未来信息？', 'When forecasting tomorrow’s load this morning, which input leaks future information?'), options: [
      option('已经公布的明天节假日安排', 'Tomorrow’s already-published holiday calendar', '它在预测时已知，可以使用，但仍需保持正确日期对齐。', 'It is known at forecast time and can be used with correct date alignment.'),
      option('今天上午已发布的明天天气预报', 'Tomorrow’s weather forecast issued this morning', '当时已发布的预报可用；要保留版本，不能换成后来更新的预报。', 'The already-issued forecast is available; retain its version rather than substituting later updates.'),
      option('明天结束后统计得到的实际平均气温', 'Tomorrow’s actual mean temperature calculated after the day ends', '预测时还不可得，用它回测会夸大可部署效果。', 'It is unavailable at the forecast origin and makes a backtest overstate deployable performance.', true),
    ] }, sourceIds: ['dlbook', 'd2l', 'fpp3'],
  },
];

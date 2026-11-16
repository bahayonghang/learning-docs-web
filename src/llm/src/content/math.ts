import type { Chapter } from '../types';
import { l, s, option } from './helpers';

export const mathChapters: Chapter[] = [
  {
    id: '01', moduleId: 'math', title: l('用向量和矩阵描述信息', 'Describe information with vectors and matrices'), subtitle: l('先看形状，再看计算：从三个传感器到一句话。', 'Shapes before arithmetic: from three sensors to a sentence.'), minutes: 18, prerequisites: [],
    objectives: l(['区分标量、向量、矩阵与张量。', '手算点积与一次矩阵乘法。', '说明序列长度与特征维度的区别。'], ['Distinguish scalars, vectors, matrices, and tensors.', 'Calculate a dot product and one matrix product.', 'Separate sequence length from feature dimension.']),
    tags: l(['线性代数', '形状', '变长输入'], ['Linear algebra', 'Shapes', 'Variable-length input']), figure: 'mathematics',
    figureCaption: l("箭头、彩球与山坡分别引出向量、概率与梯度；本课先从左上角的向量直觉开始。", "Arrows, colored balls, and terrain introduce vectors, probability, and gradients; begin with the vector intuition at upper left."),
    figureNotes: l(["左上角箭头用方向和长度提示向量可以表达多个数的关系。", "网格与彩色卡片提醒我们把数字有序组织；准确矩阵形状见下方算例。", "右侧彩球与下方山坡对应后两课，先把它们看作学习路线提示。"], ["Upper-left arrows use direction and length to suggest relationships among vector entries.", "The grid and colored cards suggest organized numbers; exact matrix shapes appear in the example below.", "The balls and terrain preview the next two lessons rather than adding new calculations here."]),
    sections: [
      s('objects', '先把信息放进有形状的容器', 'Give information a shape', String.raw`单个温度 $25$ 是标量；把温度、压力、流量放在一起得到向量 $x=[25,2,8]$。多个时刻的向量叠成矩阵。增加“设备”“批次”等轴，便得到更一般的张量。这里的“维度”有时指轴的数量，有时指特征数，阅读时要看上下文。

实际建模前，各特征常需适当缩放，否则量纲和数值范围可能使某些特征主导计算。本课的数字只是便于手算的教学值，不代表可直接使用的工业模型。对语言模型而言，输入向量通常来自学习到的 embedding，并不是人为列出的温度和压力。`, String.raw`A single temperature, $25$, is a scalar. Temperature, pressure, and flow together form a vector, $x=[25,2,8]$. Stacking vectors from different times gives a matrix. Adding axes such as equipment or batch gives a more general tensor. “Dimension” can mean the number of axes or the number of features, so read it in context.

Features often need appropriate scaling before modeling: units and numerical ranges can otherwise dominate a calculation. Our values are chosen for arithmetic, not as a deployable industrial model. In a language model, input vectors usually come from learned embeddings rather than a manually specified list of measurements.`),
      s('multiply', '一次乘法，就是一次特征混合', 'Multiplication mixes features', String.raw`点积把对应位置相乘后相加：$x\cdot w=\sum_i x_iw_i$。它可以表示加权得分，也能参与计算向量之间的相似程度。矩阵乘法把许多这样的点积一起完成：左边一行与右边一列相遇，得到输出中的一个数。

采用本课程的行向量约定，$X\in\mathbb{R}^{T\times d}$、$W\in\mathbb{R}^{d\times h}$，则 $XW\in\mathbb{R}^{T\times h}$。内部的 $d$ 必须一致。逐元素乘法只是对应格子相乘，并不执行这种“求和混合”；代码里两者也通常使用不同运算符。`, String.raw`A dot product multiplies matching entries and adds them: $x\cdot w=\sum_i x_iw_i$. It can represent a weighted score and contributes to measures of vector similarity. Matrix multiplication performs many dot products together: one row on the left meets one column on the right to produce an output entry.

Using this course’s row-vector convention, $X\in\mathbb{R}^{T\times d}$ and $W\in\mathbb{R}^{d\times h}$ give $XW\in\mathbb{R}^{T\times h}$. The inner dimensions $d$ must match. Elementwise multiplication only multiplies matching cells; it does not perform this sum-and-mix operation and usually has a different operator in code.`),
      s('sequence', '为什么同一网络能处理不同长度', 'Why the same network can accept different lengths', String.raw`把一句话的 $T$ 个 token 各表示成 $d$ 维向量，就得到 $T\times d$ 的矩阵。上面的 $W$ 处理每一行的特征，不需要为第 5 个或第 20 个 token 新建一套权重。因此 $T$ 可以变化，而参数形状保持不变。批量处理长度不同的句子时，可以补齐并使用掩码。

这只解释“形状为什么允许变化”，并不说明长度没有上限。位置机制、训练范围、内存与实现共同限制可用上下文。学习任务：把后面文档助手的一段运行规程想成 $T$ 行，写出分词前后分别是什么对象，以及哪些轴会随文本变长。`, String.raw`Represent each of a sentence’s $T$ tokens with a vector of width $d$, giving a $T\times d$ matrix. The same $W$ processes every row’s features; the fifth and twentieth tokens do not require new weights. Thus $T$ can change while parameter shapes stay fixed. Batches of unequal-length sentences can use padding and masks.

This explains why the shapes permit variation, not why length would be unlimited. Position mechanisms, training range, memory, and implementation constrain usable context. Learning task: imagine a paragraph from the later document assistant as $T$ rows. Identify the objects before and after tokenization and which axes grow with text length.`),
    ], lab: 'vectors',
    workedExample: { title: l('手算一个两维投影', 'Calculate a two-dimensional projection'), body: l(String.raw`令 $x=[1,2]$，$W=\begin{bmatrix}2&-1\\1&3\end{bmatrix}$。第一列得到 $1\times2+2\times1=4$，第二列得到 $1\times(-1)+2\times3=5$，因此 $xW=[4,5]$。若把第二个输入从 2 改成 3，输出变为 $[5,8]$：同一项输入可以同时影响多个输出。`, String.raw`Let $x=[1,2]$ and $W=\begin{bmatrix}2&-1\\1&3\end{bmatrix}$. The first column gives $1\times2+2\times1=4$; the second gives $1\times(-1)+2\times3=5$. Thus $xW=[4,5]$. Changing the second input from 2 to 3 produces $[5,8]$: one input can affect several output features.`) },
    misconception: l('“句子变长，模型参数就要增加。”参数在位置之间共享；变多的主要是中间表示与计算。', '“A longer sentence needs more model parameters.” Parameters are shared across positions; intermediate representations and computation grow.'),
    boundary: l('二维与三维数字只是形状示例；本课没有运行实际词向量模型，也不估计真实模型的全部计算成本。', 'The small numerical examples teach shapes; they neither run an actual embedding model nor estimate all costs of a real model.'),
    quiz: { question: l('X 的形状为 7×4，W 为 4×3。XW 的形状是什么？', 'X has shape 7×4 and W has shape 4×3. What is the shape of XW?'), options: [option('7×3', '7×3', '内侧的 4 被求和，保留 7 行与 3 列。', 'The inner dimension 4 is summed over, leaving 7 rows and 3 columns.', true), option('4×4', '4×4', '匹配的内部维度用于求和，不是输出形状。', 'The matching inner dimensions are summed over, not retained as the output shape.'), option('7×4×3', '7×4×3', '矩阵乘法需要对内部维度求和，不是把所有轴直接拼接。', 'Matrix multiplication sums over the inner dimension rather than simply concatenating all axes.')] }, sourceIds: ['d2l-linear', 'attention'],
  },
  {
    id: '02', moduleId: 'math', title: l('从分数到概率，再到损失', 'From scores to probabilities and loss'), subtitle: l('用三个候选词，理解 softmax 和交叉熵。', 'Understand softmax and cross-entropy with three candidate tokens.'), minutes: 20, prerequisites: ['01'],
    objectives: l(['解释条件概率与 logits 的区别。', '计算 softmax 与正确类别的负对数概率。', '区分概率自信和事实正确。'], ['Explain conditional probability and logits.', 'Calculate softmax and negative log-probability for a correct class.', 'Distinguish confidence from factual correctness.']),
    tags: l(['概率', 'Softmax', '交叉熵'], ['Probability', 'Softmax', 'Cross-entropy']), figure: 'mathematics',
    figureCaption: l("碗里的彩球提供“多个可能结果”的直觉；真正的模型概率由下方 softmax 算式计算。", "The bowl of colored balls suggests several possible outcomes; actual model probabilities are calculated by softmax below."),
    figureNotes: l(["右上角不同颜色的球可以类比不同候选类别。", "画中的球数不是模型概率，不能从插图数球来读取实验分布。", "把“抽到哪个候选”的直觉带入下方算例，再区分分数、概率与损失。"], ["The differently colored balls at upper right can stand for candidate categories.", "Ball counts are not model probabilities; do not count the illustration to infer the lab distribution.", "Carry the intuition of selecting a candidate into the example, then separate scores, probabilities, and loss."]),
    sections: [
      s('probability', '“在这个前缀之后”有多可能', 'How likely after this prefix?', String.raw`条件概率 $p(\text{token}\mid\text{prefix})$ 表示给定前缀后，一个候选 token 的概率。换了前缀，分布也会变。“设备需要”之后与“天气非常”之后的候选自然不同。一个完整分布必须非负，且候选概率之和为 1。

网络最后一层先输出 logits，即没有归一化的实数分数。它们可以为负，也不必加起来等于 1。分数大表示相对更受模型偏好，但分数 2 不能直接解释成 200% 概率。`, String.raw`The conditional probability $p(\text{token}\mid\text{prefix})$ describes a candidate token given a prefix. Change the prefix and the distribution changes: candidates after “the equipment needs” differ from those after “the weather is.” A full distribution must be nonnegative and sum to one.

The network’s final layer first produces logits: unnormalized real-valued scores. They may be negative and need not sum to one. A higher logit means greater relative preference, but a score of 2 is not a probability of 200%.`),
      s('softmax', 'Softmax 让候选共同竞争', 'Softmax makes candidates compete', String.raw`softmax 先指数化，再除以总和：

$$p_i=\frac{\exp(z_i)}{\sum_j\exp(z_j)}.$$

一个候选的概率依赖所有候选。提高另一个候选的分数，即使当前分数不变，当前概率也会下降。实现时先减去最大分数，计算 $\exp(z_i-\max_jz_j)$，结果相同却更不易数值溢出。这里使用自然对数与自然指数。`, String.raw`Softmax exponentiates scores and divides by their total:

$$p_i=\frac{\exp(z_i)}{\sum_j\exp(z_j)}.$$

Each probability depends on every candidate. Raising another candidate’s score can lower the current probability even when its own score is unchanged. Implementations subtract the maximum score first, using $\exp(z_i-\max_jz_j)$, to obtain the same answer with less risk of numerical overflow. We use natural logarithms and exponentials.`),
      s('loss', '把“猜错多少”变成可优化的数', 'Turn prediction error into an optimizable number', String.raw`当正确答案是类别 $y$ 时，交叉熵为 $L=-\ln p_y$。把更多概率给正确答案会降低损失；如果模型非常自信地给错答案，正确答案概率极小，损失就很大。它比“对或错”更细腻，因此适合求导和训练。

概率是模型的预测，不是事实审定。自信地生成一个维修周期仍可能没有文档支持。学习任务：为“设备检查应先 ___”设三个候选，手动改变分数，观察正确候选排名未变时损失是否还会变化。`, String.raw`For the correct class $y$, cross-entropy is $L=-\ln p_y$. Assigning more probability to that answer reduces loss. A confidently wrong prediction gives the true answer very little probability and a large loss. This provides a finer signal than a binary correct/incorrect label and supports differentiation.

A probability is a model prediction, not a fact-checking verdict. A confidently generated maintenance interval can still lack documentary support. Learning task: define three candidates for “Before inspection, first ___.” Change their scores and observe whether loss changes even when the correct candidate stays in first place.`),
    ], lab: 'softmax',
    workedExample: { title: l('三个分数的完整计算', 'A complete three-score calculation'), body: l(String.raw`分数 $[2,1,0]$ 的指数为约 $[7.389,2.718,1]$，总和为 $11.107$，概率约为 $[0.665241,0.244728,0.090031]$。若正确答案是第一项，损失 $-\ln(0.665241)\approx0.407606$；若是第三项，损失约为 $2.407606$。预测分布没变，目标不同，训练信号也不同。`, String.raw`Scores $[2,1,0]$ have exponentials approximately $[7.389,2.718,1]$, summing to $11.107$. Probabilities are approximately $[0.665241,0.244728,0.090031]$. If the first entry is correct, loss is $-\ln(0.665241)\approx0.407606$; if the third is correct, it is $2.407606$. The same predicted distribution produces different training signals for different targets.`) },
    misconception: l('“softmax 后最大值是 0.9，就说明回答有 90% 的事实正确率。”它是当前模型给 token 的条件概率，并非经校准的事实正确率。', '“A maximum softmax value of 0.9 means the answer is 90% factually correct.” It is a conditional token probability, not a calibrated factual-correctness score.'),
    boundary: l('实验只使用少量人工候选与单个目标；真实词表更大，序列训练还需汇总多个有效位置的损失，这里没有加载语言模型。', 'The lab uses a few hand-set candidates and one target; real vocabularies are larger and sequence training aggregates valid-position losses. No language model is loaded here.'),
    quiz: { question: l('真实目标的概率从 0.2 提高到 0.8，交叉熵会怎样？', 'What happens to cross-entropy when the true target’s probability rises from 0.2 to 0.8?'), options: [option('增大，因为模型更自信', 'It increases because confidence rises', '损失关注给真实目标的概率；正确方向上的自信会降低损失。', 'Confidence assigned to the true target lowers the loss.'), option('从约 1.609 降到 0.223', 'It falls from about 1.609 to 0.223', '分别计算 −ln(0.2) 和 −ln(0.8) 即可。', 'Compute −ln(0.2) and −ln(0.8), respectively.', true), option('不变，只看是否排名第一', 'It stays fixed because only rank matters', '交叉熵使用概率大小，而不仅是 argmax。', 'Cross-entropy uses probability magnitude, not only the argmax.')] }, sourceIds: ['d2l-probability', 'd2l-softmax'],
  },
  {
    id: '03', moduleId: 'math', title: l('沿着梯度，一点点学会', 'Learn one gradient step at a time'), subtitle: l('把导数理解为局部斜率，把训练理解为反复纠偏。', 'Read derivatives as local slopes and training as repeated adjustment.'), minutes: 18, prerequisites: ['01', '02'],
    objectives: l(['用斜率解释导数与梯度。', '手算一次梯度下降。', '观察学习率过小或过大的后果。'], ['Interpret derivatives and gradients as slopes.', 'Calculate one gradient-descent update.', 'Observe the effects of learning rates that are too small or too large.']),
    tags: l(['导数', '优化', '学习率'], ['Derivatives', 'Optimization', 'Learning rate']), figure: 'mathematics',
    figureCaption: l("下方山坡把损失比作地形，滚动方向提示局部下降；准确轨迹由实验计算。", "The terrain below compares loss to a landscape; the rolling direction suggests local descent, while the lab calculates exact trajectories."),
    figureNotes: l(["山谷低处类比较小损失，不代表模型已经掌握所有问题。", "球旁的箭头提示局部调整方向，不是一条保证最优的真实训练轨迹。", "上方的向量与概率图提示：梯度也要回到具体参数与损失定义。"], ["The valley suggests lower loss, not mastery of every question.", "Arrows beside the ball suggest local adjustment, not a measured or guaranteed-optimal training trajectory.", "The vector and probability panels remind us to define actual parameters and loss before computing a gradient."]),
    sections: [
      s('slope', '先理解一个参数的斜率', 'Start with the slope of one parameter', String.raw`设模型只有一个可调参数 $w$，损失是 $L(w)=(w-3)^2$。在 $w<3$ 时向右走会降低损失，在 $w>3$ 时向左走会降低损失。导数 $L'(w)=2(w-3)$ 把这种局部趋势变成数值：符号指方向，绝对值描述局部变化速率。

有许多参数时，把每个偏导数排在一起得到梯度 $\nabla_\theta L$。它描述在当前点怎样小幅改变各参数会影响损失。梯度不是未来最优点的位置，也不会自动告诉我们一次该走多远。`, String.raw`Suppose a model has one adjustable parameter $w$ and loss $L(w)=(w-3)^2$. When $w<3$, moving right reduces loss; when $w>3$, moving left reduces it. The derivative $L'(w)=2(w-3)$ quantifies this local trend: its sign gives direction and its magnitude describes the local rate of change.

With many parameters, collect their partial derivatives into the gradient $\nabla_\theta L$. It describes how small parameter changes affect loss at the current point. It is not the location of a future optimum and does not automatically determine how far to move.`),
      s('update', '求梯度之后，还要有更新规则', 'A gradient still needs an update rule', String.raw`最简单的梯度下降采用：

$$\theta_{\text{new}}=\theta_{\text{old}}-\eta\nabla_\theta L.$$

负号表示朝局部下降方向移动，$\eta$ 是学习率。反向传播负责求梯度；SGD、Adam 等优化器负责利用梯度更新参数。这两件事紧密配合，但不是同一个概念。大型模型通常使用小批量数据估计训练梯度，因此每步方向还带有数据采样带来的波动。`, String.raw`The simplest gradient-descent rule is:

$$\theta_{\text{new}}=\theta_{\text{old}}-\eta\nabla_\theta L.$$

The minus sign moves toward local decrease, and $\eta$ is the learning rate. Backpropagation computes gradients; optimizers such as SGD or Adam use them to update parameters. These tasks cooperate but are distinct. Large models usually estimate gradients from minibatches, adding variation from data sampling to the step direction.`),
      s('learning-rate', '为什么大步不一定更快', 'Why larger steps need not be faster', String.raw`步子太小，很多次更新后仍离低点很远；步子太大，可能越过低点，反复振荡，甚至越来越远。对于这个特定二次函数，误差满足 $w_{t+1}-3=(1-2\eta)(w_t-3)$。这能直接解释为什么 $0<\eta<1$ 时收敛，而 $\eta>1$ 时通常发散。

真实神经网络的损失地形远比单个抛物线复杂，不能把这个学习率范围照搬过去。学习任务：先预测学习率 0.1、0.8、1.1 的轨迹，再操作实验；写下“局部信息”与“全局保证”的区别。`, String.raw`Steps that are too small can leave you far from the minimum after many updates. Steps that are too large may overshoot, oscillate, or move farther away. For this particular quadratic, the error follows $w_{t+1}-3=(1-2\eta)(w_t-3)$. This explains convergence for $0<\eta<1$ and typical divergence for $\eta>1$.

A real network’s loss landscape is much more complex than one parabola, so this learning-rate range cannot be transferred directly. Learning task: predict trajectories for rates 0.1, 0.8, and 1.1 before using the experiment. Explain the difference between local information and a global guarantee.`),
    ], lab: 'gradient',
    workedExample: { title: l('从 w=0 开始更新一次', 'One update starting at w=0'), body: l(String.raw`初始 $w=0$，损失 $L=9$，梯度 $2(0-3)=-6$。取 $\eta=0.1$，得到 $w_{\text{new}}=0-0.1\times(-6)=0.6$，新损失 $(0.6-3)^2=5.76$。注意梯度为负，所以减去梯度会增加参数；这与“总是把参数减小”不同。`, String.raw`Initially $w=0$, loss is $9$, and the gradient is $2(0-3)=-6$. With $\eta=0.1$, the update gives $w_{\text{new}}=0-0.1\times(-6)=0.6$, and the new loss is $(0.6-3)^2=5.76$. Because the gradient is negative, subtracting it increases the parameter; descent does not mean always decreasing parameter values.`) },
    misconception: l('“梯度下降会让每个权重越来越小。”它减少目标损失，权重本身可以增加也可以减少。', '“Gradient descent makes every weight smaller.” It seeks lower objective loss; individual weights may increase or decrease.'),
    boundary: l('动画展示确定性的一维二次函数，不包含随机小批量、动量、Adam、学习率调度或非凸优化保证。', 'The animation uses a deterministic one-dimensional quadratic, omitting stochastic minibatches, momentum, Adam, schedules, and nonconvex guarantees.'),
    quiz: { question: l('当前梯度为 −4，学习率为 0.1，参数如何变化？', 'With gradient −4 and learning rate 0.1, how does the parameter change?'), options: [option('减少 0.4', 'Decrease by 0.4', '更新式有减号，减去负数会增加参数。', 'The update subtracts the gradient; subtracting a negative increases the parameter.'), option('保持不变', 'Remain unchanged', '非零梯度和非零学习率会产生更新。', 'A nonzero gradient and learning rate produce an update.'), option('增加 0.4', 'Increase by 0.4', '变化量为 −0.1×(−4)=+0.4。', 'The change is −0.1×(−4)=+0.4.', true)] }, sourceIds: ['d2l-backprop', 'pytorch-autograd'],
  },
];

import type { Locale } from '../types';
import { activate, crossEntropy, dot, entropy, gradientStep, softmax } from './math';
import { actions, bars, createLab, esc, fmt, metric, note, player, range, select, svg, vector } from './shared';

export function mountVectors(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro: t('把两组数字看成平面中的箭头。点积把每个维度的贡献相加；矩阵乘法一次做多组点积。', 'See two lists of numbers as arrows in a plane. A dot product adds their component-wise contributions; matrix multiplication performs several dot products.'),
    challenge: t('让两个箭头互相垂直，点积会怎样？再把一个箭头反向，观察贡献的正负。', 'What happens to the dot product when the arrows are perpendicular? Reverse one arrow and watch the signed contributions.'),
    controls: range('x1', 'x₁', -3, 3, .1, 2) + range('x2', 'x₂', -3, 3, .1, 1) + range('w1', 'w₁', -3, 3, .1, 1) + range('w2', 'w₂', -3, 3, .1, 2),
    boundary: t('这是二维向量的精确计算。箭头方向和长度只是一种表示；真实词向量通常具有更多维度，每个维度不一定对应可命名的概念。', 'These are exact calculations in two dimensions. Direction and length are one representation; real token embeddings usually have many more dimensions without a simple named concept for each coordinate.'),
  });
  const draw = () => {
    const x = [ctx.number('x1'), ctx.number('x2')], w = [ctx.number('w1'), ctx.number('w2')];
    const contributions = x.map((value, i) => value * w[i]), product = dot(x, w);
    const norm = Math.sqrt(dot(x, x) * dot(w, w));
    const point = (v: number[]) => [240 + v[0] * 34, 125 - v[1] * 34];
    const [xx, xy] = point(x), [wx, wy] = point(w);
    const chart = svg(t('向量 x 和 w 的二维位置', 'Two-dimensional vectors x and w'), `<defs><marker id="vector-x-tip" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="var(--accent)"/></marker></defs><path class="lab-grid" d="M40 125H480 M240 15V240"/><text x="480" y="145">x₁ / w₁</text><text x="247" y="20">x₂ / w₂</text><text x="226" y="142">0</text><g class="lab-vector-primary"><line x1="240" y1="125" x2="${xx}" y2="${xy}" marker-end="url(#vector-x-tip)"/><circle cx="${xx}" cy="${xy}" r="5"/><text x="${xx + 10}" y="${xy - 10}">x ${esc(vector(x))}</text></g><g class="lab-vector-secondary"><line x1="240" y1="125" x2="${wx}" y2="${wy}"/><circle cx="${wx}" cy="${wy}" r="5"/><text x="${wx + 10}" y="${wy + 20}">w ${esc(vector(w))}</text></g>`);
    ctx.output.innerHTML = `<div class="lab-viz">${chart}</div><div class="lab-metrics">${metric(t('点积 x · w', 'Dot product x · w'), fmt(product))}${metric(t('方向相似度 cos θ', 'Direction similarity cos θ'), norm ? fmt(product / norm) : t('零向量，无定义', 'Undefined: zero vector'))}</div><div class="lab-equation">${esc(vector(x))} · ${esc(vector(w))}<br>= (${fmt(x[0])} × ${fmt(w[0])}) + (${fmt(x[1])} × ${fmt(w[1])})<br>= ${fmt(contributions[0])} + (${fmt(contributions[1])}) = <b>${fmt(product)}</b></div>${note(t('再多一行，就是矩阵乘法', 'Add one row: a matrix multiplication'), t(`取 W 的两行为 [${fmt(w[0])}, ${fmt(w[1])}] 和 [${fmt(-w[1])}, ${fmt(w[0])}]，则 Wx = ${vector([product, dot(x, [-w[1], w[0]])])}。输出的每个数字都来自对应行的一次点积。`, `With W rows [${fmt(w[0])}, ${fmt(w[1])}] and [${fmt(-w[1])}, ${fmt(w[0])}], Wx = ${vector([product, dot(x, [-w[1], w[0]])])}. Each output is one dot product with a row.`))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

export function mountNeuron(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro: t('固定输入 x = [1, 2]，修改权重和偏置，亲眼看到“加权求和 → 激活”的变化。', 'Keep x = [1, 2] fixed, then adjust weights and bias to see the weighted sum flow through an activation.'),
    challenge: t('先让 ReLU 的输出变为零，再切换成 sigmoid：它们会以同样的方式响应负输入吗？', 'Make the ReLU output zero, then switch to sigmoid. Do they respond to negative inputs in the same way?'),
    controls: range('w1', 'w₁', -2, 2, .1, .5) + range('w2', 'w₂', -2, 2, .1, .5) + range('bias', t('偏置 b', 'Bias b'), -3, 3, .1, -1) + select('activation', t('激活函数', 'Activation'), [{ value: 'relu', label: 'ReLU' }, { value: 'sigmoid', label: 'Sigmoid' }, { value: 'linear', label: t('线性（不加激活）', 'Linear (no activation)') }]),
    boundary: t('本实验没有训练，仅计算一个神经元的前向传播。它省略网络层、损失函数和参数更新；sigmoid 的输出范围为 (0,1)，但这本身不保证它是校准后的概率。', 'This is one neuron’s forward pass with no training. It leaves out additional layers, a loss and parameter updates. A sigmoid output lies in (0,1), but that alone does not make it a calibrated probability.'),
  });
  const draw = () => {
    const w1 = ctx.number('w1'), w2 = ctx.number('w2'), bias = ctx.number('bias');
    const activation = ctx.value('activation') as 'relu' | 'sigmoid' | 'linear';
    const z = w1 + 2 * w2 + bias, output = activate(z, activation);
    const path = Array.from({ length: 101 }, (_, i) => {
      const x = -10 + i * .2, y = activate(x, activation);
      return `${i ? 'L' : 'M'}${40 + i * 4.4},${205 - (y + (activation === 'linear' ? 10 : 0)) / (activation === 'sigmoid' ? 1 : activation === 'linear' ? 20 : 10) * 170}`;
    }).join(' ');
    const cy = 205 - (output + (activation === 'linear' ? 10 : 0)) / (activation === 'sigmoid' ? 1 : activation === 'linear' ? 20 : 10) * 170;
    ctx.output.innerHTML = `<div class="lab-flow"><div><small>x₁ = 1</small><b>× ${fmt(w1)}</b></div><span>+</span><div><small>x₂ = 2</small><b>× ${fmt(w2)}</b></div><span>+</span><div><small>b</small><b>${fmt(bias)}</b></div><span>→</span><div class="emphasis"><small>z</small><b>${fmt(z)}</b></div></div><div class="lab-viz">${svg(t('激活曲线与当前神经元位置', 'Activation curve and current neuron position'), `<path class="lab-grid" d="M40 205H480 M260 20V220"/><path class="lab-curve" d="${path}"/><circle class="lab-dot" cx="${40 + (z + 10) / 20 * 440}" cy="${cy}" r="7"/><text x="42" y="238">z = −10</text><text x="445" y="238">z = 10</text><text x="45" y="22">${esc(activation)}(z)</text>`)}</div><div class="lab-metrics">${metric(t('加权和 z', 'Weighted sum z'), fmt(z))}${metric(t('激活后 a', 'Activation a'), fmt(output))}</div>${note(t('沿信号方向读一遍', 'Read along the signal path'), t(`z = ${fmt(w1)} × 1 + ${fmt(w2)} × 2 + (${fmt(bias)}) = ${fmt(z)}，a = ${activation}(z) = ${fmt(output)}。没有非线性激活时，多层线性映射仍可合并为一个线性映射。`, `z = ${fmt(w1)} × 1 + ${fmt(w2)} × 2 + (${fmt(bias)}) = ${fmt(z)}; a = ${activation}(z) = ${fmt(output)}. Without nonlinear activations, stacked linear maps still collapse into one linear map.`))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

export function mountGradient(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro: t('用一个参数 w 拟合目标 2。每一步都根据真实导数更新参数，点在损失曲线上移动。', 'Fit the target 2 with one parameter w. Each step uses the actual derivative and moves the point along the loss curve.'),
    challenge: t('学习率设为 0.4 时会走向哪里？改成 2.2，再观察几步。更大的一步一定更快吗？', 'Where will a learning rate of 0.4 take you? Try 2.2 and watch a few steps. Is a bigger step always faster?'),
    controls: range('rate', t('学习率 η', 'Learning rate η'), .05, 2.4, .05, .4) + range('start', t('初始参数 w₀', 'Initial weight w₀'), -4, 6, .1, -3) + actions(t),
    boundary: t('损失为 L(w)=½(w−2)²，是一个确定性的一维凸函数；这里 0<η<2 才会逐步收敛。真实深层网络的损失并非一条抛物线，也没有这样的通用学习率阈值。', 'L(w)=½(w−2)² is a deterministic one-dimensional convex loss; here 0<η<2 gives convergence. Deep-network losses are not a single parabola and do not share this universal learning-rate threshold.'),
  });
  let history = [ctx.number('start')];
  let last: ReturnType<typeof gradientStep> | undefined;
  const draw = () => {
    const w = history.at(-1)!; const current = gradientStep(w, 2, ctx.number('rate'));
    const scaleX = (x: number) => 40 + (x + 4) / 10 * 440;
    const scaleY = (loss: number) => 218 - Math.min(20, loss) / 20 * 185;
    const curve = Array.from({ length: 101 }, (_, i) => {
      const x = -4 + i * .1;
      return `${i ? 'L' : 'M'}${scaleX(x)},${scaleY(.5 * (x - 2) ** 2)}`;
    }).join(' ');
    const points = history.filter(x => x >= -4 && x <= 6).map((x, i) => `<circle class="lab-trail" opacity="${.2 + .7 * (i + 1) / history.length}" cx="${scaleX(x)}" cy="${scaleY(.5 * (x - 2) ** 2)}" r="4"/>`).join('');
    ctx.output.innerHTML = `<div class="lab-viz">${svg(t('参数沿抛物线损失移动', 'A parameter moves on a parabolic loss'), `<path class="lab-grid" d="M40 218H480"/><path class="lab-curve" d="${curve}"/>${points}${w >= -4 && w <= 6 ? `<circle class="lab-dot" cx="${scaleX(w)}" cy="${scaleY(current.loss)}" r="7"/>` : `<text x="80" y="50">${t('参数已超出横轴范围；数值仍在下方显示', 'Weight is outside the plot; values remain below')}</text>`}<text x="40" y="245">w = −4</text><text x="292" y="245">w* = 2</text><text x="446" y="245">w = 6</text><text x="45" y="22">L(w) = ½(w − 2)²</text>`)}</div><div class="lab-metrics">${metric(t('更新步数', 'Updates'), String(history.length - 1))}${metric('w', fmt(w, 5))}${metric(t('当前损失', 'Current loss'), fmt(current.loss, 6))}</div><div class="lab-equation">∂L/∂w = w − 2 = ${fmt(current.gradient, 5)}<br>w′ = w − η · ∂L/∂w = <b>${fmt(current.next, 5)}</b></div>${note(t('刚才发生了什么？', 'What just happened?'), last ? t(`上一轮损失 ${fmt(last.loss, 6)} → 当前损失 ${fmt(current.loss, 6)}。${current.loss > last.loss ? '步子过大，损失上升了。' : '负梯度指向局部下降方向。'}`, `Previous loss ${fmt(last.loss, 6)} → current loss ${fmt(current.loss, 6)}. ${current.loss > last.loss ? 'The step overshot and increased the loss.' : 'The negative gradient points toward local descent.'}`) : t('点击“走一步”查看第一次更新。修改初始参数或学习率会重新开始。', 'Choose Step to inspect the first update. Changing the initial weight or learning rate restarts the run.'))}<p class="lab-status" role="status">${history.length >= 61 ? t('已运行 60 步，重置可重新观察。', '60 updates reached. Reset to observe again.') : Math.abs(w) > 1e5 ? t('参数正在发散，已停止播放；请减小学习率。', 'The parameter is diverging; playback stopped. Reduce the learning rate.') : ''}</p>`;
  };
  const step = () => {
    const w = history.at(-1)!;
    if (history.length >= 61 || Math.abs(w) > 1e5) return false;
    last = gradientStep(w, 2, ctx.number('rate')); history.push(last.next); draw();
    return history.length < 61 && Math.abs(last.next) <= 1e5;
  };
  const playback = player(ctx, step);
  const reset = () => { playback.stop(); history = [ctx.number('start')]; last = undefined; draw(); };
  ctx.onInput(reset);
  ctx.onAction(action => { if (action === 'step') { playback.stop(); step(); } if (action === 'play') playback.toggle(); if (action === 'reset') reset(); });
  draw(); return ctx.cleanup;
}

export function mountSoftmax(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const labels = [t('温度', 'temperature'), t('压力', 'pressure'), t('流量', 'flow')];
  const ctx = createLab(host, locale, {
    intro: t('给三个候选词打分，用 softmax 归一化为概率，再计算正确答案的交叉熵。', 'Score three candidate tokens, normalize with softmax, then calculate cross-entropy for the correct answer.'),
    challenge: t('降低温度 T 会让分布更均匀还是更集中？如果正确答案恰好是低分项，损失会怎样？', 'Does lowering T make the distribution flatter or more concentrated? What happens to loss when the correct answer is a low-scoring token?'),
    controls: labels.map((label, i) => range('logit' + i, `${label} · z${i + 1}`, -4, 4, .1, 2 - i)).join('') + range('temperature', t('温度 T', 'Temperature T'), .1, 3, .1, 1) + select('target', t('正确答案', 'Correct target'), labels.map((label, i) => ({ label, value: String(i) }))),
    boundary: t('这是三个候选项的精确 softmax 计算，使用自然对数，损失单位是 nat。它没有训练语言模型；此处温度用来展示概率变化，标准交叉熵训练通常不使用解码时的采样温度。', 'This is exact softmax over three candidates, using natural logarithms and loss in nats. No language model is trained. Temperature illustrates distribution changes here; ordinary cross-entropy training generally does not use the decoding-time sampling temperature.'),
  });
  const draw = () => {
    const logits = [0, 1, 2].map(i => ctx.number('logit' + i));
    const p = softmax(logits, ctx.number('temperature')); const target = ctx.number('target');
    ctx.output.innerHTML = `<div class="lab-viz"><h4>${t('下一 token 的概率分布', 'Next-token probability distribution')}</h4>${bars(labels, p, { percent: true, selected: target, max: 1 })}<p class="lab-chart-caption">${t('高亮行是当前设置的正确答案。', 'The highlighted row is the selected correct target.')}</p></div><div class="lab-metrics">${metric(t('目标概率 p(y)', 'Target probability p(y)'), fmt(p[target], 5))}${metric(t('交叉熵 −ln p(y)', 'Cross-entropy −ln p(y)'), fmt(crossEntropy(p, target), 5) + ' nat')}${metric(t('分布熵 H(p)', 'Distribution entropy H(p)'), fmt(entropy(p), 5) + ' nat')}</div><div class="lab-equation">pᵢ = exp(zᵢ / T) / Σⱼ exp(zⱼ / T)<br>Σp = ${fmt(p.reduce((a, b) => a + b, 0), 8)}</div>${note(t('读懂损失', 'Read the loss'), t(`正确词“${labels[target]}”得到的概率为 ${fmt(p[target] * 100, 2)}%。损失只读取这一次样本中正确词的概率；模型对错误词越自信，这个损失就可能越大。`, `The correct token “${labels[target]}” receives ${fmt(p[target] * 100, 2)}%. This sample’s loss reads the probability assigned to its true token. Greater confidence in a wrong token can increase that loss.`))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

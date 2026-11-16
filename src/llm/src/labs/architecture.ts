import type { Locale } from '../types';
import { scaledAttention, seededRandom, sample, softmax, topP, toyBpeStages } from './math';
import { actions, bars, createLab, esc, fmt, metric, note, player, range, select, svg, textInput, vector } from './shared';

export function mountTokenizer(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro: t('从字符开始，按一张固定的玩具合并表，把相邻片段逐次合并。空格也会保留下来。', 'Start with characters and repeatedly merge adjacent pieces using a fixed toy merge table. Spaces are preserved too.'),
    challenge: t('“lower”和“lowest”为什么可以共享“low”？输入“你好世界”，再逐步查看每次合并。', 'How can “lower” and “lowest” share “low”? Try “你好世界” and inspect each merge.'),
    controls: textInput('text', t('待分词文本', 'Text to tokenize'), 'lower lowest 你好世界', 90) + actions(t),
    boundary: t('这是字符级、固定合并表的 BPE 机制演示，不是任何真实模型的 tokenizer，也不是在本页学习合并表。真实分词器还可能有 byte-level 编码、预分词、规范化和特殊 token；这里不预测 API 的 token 账单。', 'This is a character-level demonstration of BPE with a fixed merge table. It is not any model’s tokenizer, and does not learn merges on this page. Real tokenizers may add byte encoding, pre-tokenization, normalization and special tokens. This does not estimate API token billing.'),
  });
  let stages = toyBpeStages(ctx.value('text')), stepIndex = 0;
  const draw = () => {
    const current = stages[stepIndex];
    const rawLength = Array.from(ctx.value('text')).length;
    ctx.output.innerHTML = `<div class="lab-viz"><div class="lab-viz-heading"><h4>${t('合并后的片段', 'Current token pieces')}</h4><span>${t('第', 'Step')} ${stepIndex} / ${stages.length - 1}</span></div><div class="lab-token-stream">${current.tokens.length ? current.tokens.map((token, i) => `<span class="lab-token token-${i % 5}"><b>${esc(token.replace(/ /g, '␠').replace(/\n/g, '↵'))}</b><small>${i}</small></span>`).join('') : `<p>${t('输入一些文字开始观察。', 'Enter text to start exploring.')}</p>`}</div><p class="lab-chart-caption">${t('␠ 表示原文中的空格；下面的小数字是片段位置，不是词表 ID。', '␠ represents a space. The small numbers are piece positions, not vocabulary IDs.')}</p></div><div class="lab-metrics">${metric(t('起始字符数', 'Initial characters'), String(rawLength))}${metric(t('当前片段数', 'Current pieces'), String(current.tokens.length))}${metric(t('已执行规则数', 'Rules applied'), String(stepIndex))}</div>${note(t('这一步合并了什么？', 'What merged at this step?'), current.rule ? `${current.rule[0]} + ${current.rule[1]} → ${current.rule.join('')}` : t('尚未合并，每个 Unicode 码点各是一片。点击“走一步”，仅显示在当前文本中生效的规则。', 'No merges yet: one Unicode code point per piece. Choose Step; only rules that apply to the current text appear.'))}<div class="lab-equation">${t('重建原文', 'Reconstructed text')}: ${esc(current.tokens.join(''))}</div><p class="lab-status" role="status">${stepIndex === stages.length - 1 ? t('当前合并表已没有可应用的后续规则。', 'No later rule in this merge table applies.') : ''}</p>`;
  };
  const step = () => { if (stepIndex >= stages.length - 1) return false; stepIndex++; draw(); return stepIndex < stages.length - 1; };
  const playback = player(ctx, step, 1000);
  const reset = () => { playback.stop(); stages = toyBpeStages(ctx.value('text')); stepIndex = 0; draw(); };
  ctx.onInput(reset);
  ctx.onAction(action => { if (action === 'step') { playback.stop(); step(); } if (action === 'play') playback.toggle(); if (action === 'reset') reset(); });
  draw(); return ctx.cleanup;
}

export function mountAttention(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const tokens = locale === 'zh' ? ['我', '观察', '温度'] : ['I', 'observe', 'temperature'];
  const keys = [[1, 0], [0, 1], [1, 1]], values = [[1, 0], [0, 2], [1, 1]];
  const ctx = createLab(host, locale, {
    intro: t('把 Query 看成当前问题，Key 用来匹配，Value 提供被混合的信息。这里逐项算出 QKᵀ/√d、遮罩、softmax 和加权和。', 'A Query asks a question, Keys provide matches and Values carry information to combine. Compute QKᵀ/√d, masking, softmax and the weighted sum step by step.'),
    challenge: t('选第二个位置并开启因果遮罩：不论怎样改 Q，第三个词的权重为什么始终为零？', 'Select the second position and enable the causal mask. Why does the third token keep zero weight even as you change Q?'),
    controls: select('position', t('正在查询的位置', 'Query position'), tokens.map((token, i) => ({ value: String(i), label: `${i + 1} · ${token}` })), '2') + range('q1', 'Query · q₁', -3, 3, .1, 1) + range('q2', 'Query · q₂', -3, 3, .1, 0) + select('mask', t('可见范围', 'Visibility'), [{ value: 'causal', label: t('因果遮罩：只看自己与过去', 'Causal: self and past only') }, { value: 'all', label: t('不加遮罩（对照）', 'No mask (comparison)') }]),
    boundary: t('固定的二维 Q、K、V 是手工教学数值，不是训练得到的词向量。真实 Transformer 通过可学习矩阵得到 Q/K/V，还使用多头、残差连接等。本图中除选中行外，其余行固定取 Q=K。', 'These two-dimensional Q/K/V values are chosen for teaching, not learned embeddings. A Transformer learns Q/K/V projections and adds multi-head attention, residuals and more. Unselected heatmap rows use fixed Q=K.'),
  });
  const draw = () => {
    const position = ctx.number('position'), q = [ctx.number('q1'), ctx.number('q2')];
    const causal = ctx.value('mask') === 'causal';
    const allowed = keys.map((_, i) => !causal || i <= position);
    const result = scaledAttention(q, keys, values, allowed);
    const rows = keys.map((key, i) => scaledAttention(i === position ? q : key, keys, values, keys.map((_, j) => !causal || j <= i)).weights);
    const links = svg(t('当前 Query 的注意力分配', 'Attention from the selected Query'), `<rect class="lab-node emphasis" x="25" y="87" width="140" height="74" rx="12"/><text x="95" y="114" text-anchor="middle">Q · ${esc(tokens[position])}</text><text x="95" y="140" text-anchor="middle">${esc(vector(q))}</text>${tokens.map((token, i) => `<path class="${allowed[i] ? 'lab-attention-link' : 'lab-masked-link'}" d="M165 124 C235 124 250 ${44 + i * 82} 325 ${44 + i * 82}" style="stroke-width:${1 + result.weights[i] * 10}"/><rect class="lab-node" x="325" y="${20 + i * 82}" width="175" height="51" rx="9"/><text x="412" y="${42 + i * 82}" text-anchor="middle">${esc(token)} · ${fmt(result.weights[i] * 100, 1)}%</text><text x="412" y="${61 + i * 82}" text-anchor="middle" class="lab-svg-small">K${i + 1} = ${esc(vector(keys[i]))}</text>`).join('')}`);
    ctx.output.innerHTML = `<div class="lab-viz">${links}</div><div class="lab-table-wrap"><table class="lab-heatmap"><caption>${t('每一行独立归一化；粗框行使用滑块中的 Query。', 'Every row normalizes independently; the outlined row uses your Query.')}</caption><thead><tr><th>Q ↓ / K →</th>${tokens.map(token => `<th>${esc(token)}</th>`).join('')}</tr></thead><tbody>${rows.map((row, i) => `<tr class="${i === position ? 'selected' : ''}"><th>${esc(tokens[i])}</th>${row.map((weight, j) => `<td style="--weight:${Math.round(weight * 85)}%" class="${causal && j > i ? 'masked' : ''}">${fmt(weight, 3)}${causal && j > i ? `<small>${t('遮罩', 'masked')}</small>` : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="lab-metrics">${metric(t('缩放后的分数', 'Scaled scores'), vector(result.scores))}${metric(t('加权后的 Value', 'Weighted Value'), vector(result.output))}</div><div class="lab-equation">${t('输出', 'Output')} = ${result.weights.map((weight, i) => `${fmt(weight)} × ${vector(values[i])}`).join(' + ')}<br>= <b>${esc(vector(result.output))}</b></div>${note(t('遮罩发生在 softmax 之前', 'Mask before softmax'), causal ? t('不可见位置的分数被设为 −∞，指数为 0，因此不会分走任何概率。把分数乘以 0 无法达到这个效果，因为 exp(0)=1。', 'Invisible positions receive −∞ before softmax, so their exponentials and probabilities are zero. Multiplying a score by zero cannot do this: exp(0)=1.') : t('当前对照允许看见未来词。若把它直接用于下一词训练，会泄漏答案，因此 decoder 的自注意力需要因果遮罩。', 'This comparison permits looking ahead. Using it directly for next-token training would leak target information, so decoder self-attention uses a causal mask.'))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

/** A tiny hand-authored bigram table, intentionally not presented as a trained language model. */
const TOY_LOGITS = [
  [-3, 3, 1, -.5, -2, -4],
  [-2, -.5, 1, 2.5, -1, -3],
  [-2, -.5, 0, 1.8, 2.5, -2],
  [-2, -1, -.5, 0, 2.6, .4],
  [-3, -1, -1, -1, -.5, 3.5],
  [-5, -5, -5, -5, -5, 5],
];

export function mountGeneration(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const tokens = locale === 'zh' ? ['温度', '正在', '缓慢', '上升', '。', '[结束]'] : ['temperature', 'is', 'slowly', 'rising', '.', '[EOS]'];
  const ctx = createLab(host, locale, {
    intro: t('观察“已有 token → 下一词分布 → 采样 → 拼回上下文”的循环。小词表和转移分数均人工设定，让每一步都可以核对。', 'Watch the loop: current tokens → next-token distribution → sample → append to the context. A small vocabulary and hand-authored transition scores make every step inspectable.'),
    challenge: t('保持随机种子不变，分别用 T=0 和 T=1 播放。再降低 top-p，哪些候选会被排除？', 'Keep the seed fixed and compare T=0 with T=1. Then lower top-p: which candidates are excluded?'),
    controls: range('temperature', t('温度 T（0 为贪心）', 'Temperature T (0 = greedy)'), 0, 2, .1, .8) + range('topP', 'top-p', .1, 1, .05, .9) + range('seed', t('随机种子', 'Random seed'), 1, 100, 1, 42) + actions(t),
    boundary: t('这是人工 bigram 转移表，只根据最后一个 token 得分，并不包含 Transformer、真实训练或长上下文理解。它演示自回归与解码流程，不代表真实语言质量。每次修改参数都会用所选种子重新开始，最多生成 12 个 token。', 'This is a hand-authored bigram transition table conditioned only on the last token, without a Transformer, training or long-context understanding. It demonstrates autoregressive decoding, not language quality. Changing a parameter restarts with the chosen seed; generation stops after at most 12 new tokens.'),
  });
  let sequence = [0], random = seededRandom(ctx.number('seed'));
  let chosen: { token: number; p: number; candidates: number } | undefined;
  const distribution = () => topP(softmax(TOY_LOGITS[sequence.at(-1)!], ctx.number('temperature')), ctx.number('topP'));
  const done = () => sequence.at(-1) === 5 || sequence.length >= 13;
  const draw = () => {
    const p = distribution();
    ctx.output.innerHTML = `<div class="lab-viz"><div class="lab-viz-heading"><h4>${t('当前上下文', 'Current context')}</h4><span>${t('种子', 'Seed')} ${ctx.number('seed')}</span></div><div class="lab-token-stream">${sequence.map((id, i) => `<span class="lab-token ${i === sequence.length - 1 ? 'token-current' : ''}"><b>${esc(tokens[id])}</b><small>${i === 0 ? t('提示', 'prompt') : String(i)}</small></span>`).join('')}</div><h4>${done() ? t('生成已停止', 'Generation stopped') : t('下一步：采样前的候选概率', 'Next step: probabilities before sampling')}</h4>${!done() ? bars(tokens, p, { percent: true, max: 1 }) : `<p class="lab-status" role="status">${sequence.at(-1) === 5 ? t('采样到了结束符。', 'The end-of-sequence token was sampled.') : t('已达到 12 个新 token 的教学长度限制。', 'The teaching limit of 12 new tokens was reached.')}</p>`}</div><div class="lab-metrics">${metric(t('当前上下文长度', 'Context length'), String(sequence.length))}${metric(t('已生成 token', 'Generated tokens'), String(sequence.length - 1))}${metric(t('剩余候选数', 'Candidates remaining'), done() ? '—' : String(p.filter(x => x > 0).length))}</div>${note(t('刚才的选择', 'Last selection'), chosen ? t(`从 ${chosen.candidates} 个非零概率候选中选中“${tokens[chosen.token]}”，该词的采样概率为 ${fmt(chosen.p * 100, 2)}%。它随后成为下一轮输入的一部分。`, `Selected “${tokens[chosen.token]}” among ${chosen.candidates} nonzero-probability candidates, with sampling probability ${fmt(chosen.p * 100, 2)}%. It then became part of the next input.`) : t('开始时只有提示词“温度”。点击“走一步”，观察输出怎样追加为新的输入。', 'Initially the prompt contains only “temperature”. Choose Step to see the output appended to the next input.'))}${note(t('这与一次训练有什么不同？', 'How is training different?'), t('训练时已知完整目标序列，可以用因果遮罩同时计算各位置的下一词损失。生成时下一个 token 尚未知，因此逐个选择并追加；真实模型通常用 KV cache 复用过去计算。', 'During training, the target sequence is known, so a causal mask allows next-token losses for all positions to be computed in parallel. At generation time each next token is unknown and must be chosen before appending it; real models usually reuse earlier computation with a KV cache.'))}`;
  };
  const step = () => {
    if (done()) return false;
    const p = distribution(), token = sample(p, random);
    chosen = { token, p: p[token], candidates: p.filter(x => x > 0).length };
    sequence.push(token); draw(); return !done();
  };
  const playback = player(ctx, step, 1050);
  const reset = () => { playback.stop(); sequence = [0]; random = seededRandom(ctx.number('seed')); chosen = undefined; draw(); };
  ctx.onInput(reset);
  ctx.onAction(action => { if (action === 'step') { playback.stop(); step(); } if (action === 'play') playback.toggle(); if (action === 'reset') reset(); });
  draw(); return ctx.cleanup;
}

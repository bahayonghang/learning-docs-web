import type { Locale } from '../types';
import { kvCacheBytes, loraParameters, retrieve } from './math';
import { bars, createLab, esc, fmt, metric, note, range, select, svg, textInput } from './shared';

export function mountKvCache(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const ctx = createLab(host, locale, {
    intro: t('缓存过去 token 的 Key 和 Value，下一步只为新 token 追加记录。这里直接从张量维度计算缓存字节数。', 'Cache Keys and Values for past tokens, then append the new token’s entries at each step. Calculate cache memory directly from tensor dimensions.'),
    challenge: t('把上下文长度翻倍，显存怎样变化？保持 32 个 Query 头，把 KV 头从 32 改成 8，会减少几倍缓存？', 'Double the context length: how does memory change? Keep 32 Query heads but change KV heads from 32 to 8. By what factor does cache memory fall?'),
    controls: range('layers', t('层数 L', 'Layers L'), 8, 80, 8, 32) + range('batch', t('并行序列数 B', 'Parallel sequences B'), 1, 8, 1, 1) + range('tokens', t('每个序列的 token 数 S', 'Tokens per sequence S'), 256, 32768, 256, 4096) + select('heads', t('KV 头数（Query 固定为 32 头）', 'KV heads (32 Query heads fixed)'), [{ value: '32', label: '32 · MHA' }, { value: '16', label: '16 · GQA' }, { value: '8', label: '8 · GQA' }, { value: '4', label: '4 · GQA' }, { value: '1', label: '1 · MQA' }], '8') + select('headDim', t('每个头的维度 D', 'Head dimension D'), [{ value: '64', label: '64' }, { value: '128', label: '128' }], '128') + select('bytes', t('每个缓存元素的字节数', 'Bytes per cache element'), [{ value: '2', label: t('2 · FP16 / BF16', '2 · FP16 / BF16') }, { value: '4', label: '4 · FP32' }, { value: '1', label: t('1 · 8-bit（理想化）', '1 · 8-bit (idealized)') }]),
    boundary: t('只计算等长、稠密、未滑窗的 K/V 缓存原始数据：2×L×B×S×Hkv×D×元素字节数。省略模型权重、激活、运行时工作区、分页碎片、量化元数据和不同序列长度；因此它不是整机显存估算，也不保证吞吐量。', 'This counts raw dense K/V payload for equal-length sequences without a sliding window: 2×L×B×S×Hkv×D×bytes per element. It excludes model weights, activations, runtime workspace, paging overhead, quantization metadata and unequal lengths. It is not a full-device memory or throughput estimate.'),
  });
  const draw = () => {
    const config = { layers: ctx.number('layers'), batch: ctx.number('batch'), tokens: ctx.number('tokens'), kvHeads: ctx.number('heads'), headDim: ctx.number('headDim'), bytes: ctx.number('bytes') };
    const count = kvCacheBytes(config), mha = kvCacheBytes({ ...config, kvHeads: 32 });
    const diagram = svg(t('过去 K/V 被保留，新 token 追加记录', 'Past K/V is retained while a new token is appended'), `<text x="30" y="29">${t('历史 token 的缓存', 'Cached past tokens')}</text><text x="365" y="29">${t('新 token', 'New token')}</text>${[0, 1].map((row) => `<text x="20" y="${85 + row * 80}">${row ? 'V' : 'K'}</text>${Array.from({ length: 6 }, (_, i) => `<rect class="lab-cache-block" x="${49 + i * 45}" y="${51 + row * 80}" width="36" height="51" rx="6"/>`).join('')}<path class="lab-grid" d="M329 ${77 + row * 80}H357"/><rect class="lab-cache-new" x="367" y="${51 + row * 80}" width="76" height="51" rx="6"/><text x="405" y="${82 + row * 80}" text-anchor="middle">+1</text>`).join('')}<text x="47" y="225">${t('每层、每个序列都需要一组 K 和 V。格子仅示意存储区域。', 'Each layer and sequence stores K and V. Cells are schematic regions.')}</text>`);
    ctx.output.innerHTML = `<div class="lab-viz">${diagram}</div><div class="lab-metrics">${metric(t('当前 KV 缓存', 'Current KV cache'), fmt(count / 2 ** 30, 4) + ' GiB')}${metric(t('同配置 MHA 缓存', 'Equivalent MHA cache'), fmt(mha / 2 ** 30, 4) + ' GiB')}${metric(t('相对 MHA 的缓存比例', 'Fraction of MHA cache'), fmt(count / mha * 100, 1) + '%')}</div><div class="lab-equation">2 × ${config.layers} × ${config.batch} × ${config.tokens} × ${config.kvHeads} × ${config.headDim} × ${config.bytes}<br>= <b>${fmt(count, 0)} bytes</b><br>1 GiB = 2³⁰ bytes</div>${bars([t('当前 KV 头数', 'Current KV heads'), 'MHA · 32 KV'], [count, mha], { max: mha })}${note(t('缓存节省了什么？', 'What does caching save?'), t('自回归生成时复用旧 token 的 K/V 投影和过去层的结果；新 token 的 Query 仍需与可见的历史 Keys 交互。缓存不会消除模型权重，也不会让下一词变得独立于上下文。', 'Autoregressive decoding reuses old token K/V projections and earlier layer computations. The new Query still interacts with visible past Keys. Caching does not remove model weights or make the next token independent of context.'))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

export function mountLora(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const dimensions = [512, 1024, 2048, 4096, 8192].map(value => ({ value: String(value), label: String(value) }));
  const ctx = createLab(host, locale, {
    intro: t('保留原始权重 W，把可学习的增量写成两个小矩阵的乘积 ΔW = BA。改变秩 r，比较真正要训练的参数量。', 'Keep the original W and express a trainable update as two smaller matrices: ΔW = BA. Change rank r to compare trainable parameter counts.'),
    challenge: t('一个 4096×4096 矩阵有多少参数？如果 r=8，A 和 B 一共有多少？原始 W 会消失吗？', 'How many parameters are in a 4096×4096 matrix? With r=8, how many are in A and B together? Does W disappear?'),
    controls: select('input', t('输入维度 dᵢₙ', 'Input dimension dᵢₙ'), dimensions, '4096') + select('output', t('输出维度 dₒᵤₜ', 'Output dimension dₒᵤₜ'), dimensions, '4096') + range('rank', t('秩 r', 'Rank r'), 1, 64, 1, 8),
    boundary: t('计算只覆盖一个线性层，忽略偏置；W 的形状约定为 d_out×d_in，A 为 r×d_in，B 为 d_out×r。训练参数减少比例不等于完整模型显存减少比例。LoRA 仍需要基础权重；真实实现还可能有 α/r 缩放、dropout 和多个目标层。', 'This counts one linear layer and excludes biases. W is d_out×d_in, A is r×d_in and B is d_out×r. The trainable-parameter fraction is not a full-model memory fraction. LoRA retains the base weights; implementations may add α/r scaling, dropout and several target layers.'),
  });
  const draw = () => {
    const input = ctx.number('input'), output = ctx.number('output'), rank = ctx.number('rank');
    const count = loraParameters(input, output, rank);
    const diagram = svg(t('原始矩阵加上低秩更新', 'The original matrix plus a low-rank update'), `<rect class="lab-matrix-base" x="30" y="45" width="150" height="150" rx="10"/><text x="105" y="115" text-anchor="middle">W</text><text x="105" y="140" text-anchor="middle" class="lab-svg-small">${t('冻结', 'frozen')}</text><text x="105" y="222" text-anchor="middle">${output} × ${input}</text><text x="208" y="127" text-anchor="middle" class="lab-svg-operator">+</text><rect class="lab-matrix-adapter" x="243" y="45" width="35" height="150" rx="5"/><text x="260" y="123" text-anchor="middle">B</text><text x="260" y="222" text-anchor="middle">${output} × ${rank}</text><text x="309" y="127" text-anchor="middle" class="lab-svg-operator">×</text><rect class="lab-matrix-adapter" x="345" y="102" width="150" height="35" rx="5"/><text x="420" y="125" text-anchor="middle">A</text><text x="420" y="222" text-anchor="middle">${rank} × ${input}</text>`);
    ctx.output.innerHTML = `<div class="lab-viz">${diagram}<p class="lab-chart-caption">${t('矩阵形状仅作结构示意，不按元素个数绘制。', 'Matrix shapes illustrate structure; areas are not proportional to element counts.')}</p></div><div class="lab-metrics">${metric(t('完整矩阵参数', 'Dense matrix parameters'), fmt(count.dense, 0))}${metric(t('LoRA 可训练参数', 'Trainable LoRA parameters'), fmt(count.adapter, 0))}${metric(t('可训练参数占比', 'Trainable fraction'), fmt(count.fraction * 100, 4) + '%')}</div><div class="lab-equation">|W| = ${output} × ${input} = ${fmt(count.dense, 0)}<br>|A| + |B| = r(dᵢₙ + dₒᵤₜ)<br>= ${rank} × (${input} + ${output}) = <b>${fmt(count.adapter, 0)}</b></div>${bars([t('完整矩阵', 'Dense matrix'), 'A + B'], [count.dense, count.adapter], { max: count.dense })}${note(t('少训练，不等于少保留', 'Fewer trainable weights, not fewer retained base weights'), t('前向计算仍依赖 W；A、B 学习的是增量。提高 r 会扩大可表达的更新空间，也会线性增加适配器参数量。模型效果需要在独立任务集上评估，不能仅由 r 推断。', 'The forward pass still depends on W; A and B learn an update. Increasing r expands the update space and increases adapter parameters linearly. Task quality must be evaluated on held-out examples and cannot be inferred from rank alone.'))}`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

export function mountRetrieval(host: HTMLElement, locale: Locale) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const documents = locale === 'zh' ? [
    { id: 'D1', title: '压力传感器校准记录', text: '压力传感器的校准记录应包含日期、参考仪器、校准误差和维护人员。查询记录时先核对设备编号。' },
    { id: 'D2', title: '温度趋势数据说明', text: '温度趋势表同时记录采集时间、单位和数据质量标记。缺失值应显式标记，不能用零值冒充测量。' },
    { id: 'D3', title: '设备手册版本管理', text: '设备手册每个版本都有发布日期和适用设备列表。引用手册时保留版本与章节，旧版本可能已失效。' },
    { id: 'D4', title: '维护工单查询', text: '维护工单包含设备编号、故障描述、检查记录和审核状态。工单中的建议不自动成为生产执行指令。' },
    { id: 'D5', title: '压力历史数据', text: '压力历史数据包含采集时间、传感器编号和测量单位。检索压力异常时需要查看同期工况与数据质量。' },
  ] : [
    { id: 'D1', title: 'Pressure sensor calibration records', text: 'Pressure sensor calibration records include date, reference instrument, calibration error and technician. Check the equipment identifier before using a record.' },
    { id: 'D2', title: 'Temperature trend data', text: 'Temperature trend data records timestamps, units and data-quality flags. Missing values are marked explicitly; zero is not a replacement measurement.' },
    { id: 'D3', title: 'Equipment manual versions', text: 'Every equipment manual version has a publication date and a list of applicable equipment. Cite its version and section; older versions may be obsolete.' },
    { id: 'D4', title: 'Maintenance work orders', text: 'Maintenance work orders include equipment identifiers, fault descriptions, inspection records and approval status. A suggestion is not an automatic production command.' },
    { id: 'D5', title: 'Historical pressure data', text: 'Historical pressure data records timestamps, sensor identifiers and units. When retrieving pressure anomalies, inspect operating conditions and data quality.' },
  ];
  const ctx = createLab(host, locale, {
    intro: t('用一组虚构的设备文档搭建最小检索链：输入问题，按词面匹配打分，取 top-k，再把证据装进提示上下文。', 'Build a minimal retrieval chain over fictional equipment documents: enter a question, score lexical overlap, select top-k, then assemble evidence into a prompt context.'),
    challenge: t('搜索“压力校准”，再搜索资料中没有的内容。没有证据时，系统应该编一个答案吗？', 'Search “pressure calibration”, then ask about something absent from the documents. Should a system invent an answer when there is no evidence?'),
    controls: textInput('query', t('检索问题', 'Retrieval query'), t('压力传感器校准', 'pressure sensor calibration')) + range('topK', t('最多取几段 top-k', 'Maximum passages top-k'), 1, 5, 1, 2) + `<p class="lab-control-help">${t('这些短文为教学编写，不是现场操作规程。', 'These passages are teaching examples, not operating procedures.')}</p>`,
    boundary: t('本实验使用词面覆盖率：命中的不同查询词数÷查询词数，中文使用单字与相邻双字特征，英文使用小写单词。它不是向量语义检索、BM25 或真实 LLM；只展示证据组装，不生成答案。真实 RAG 还需要权限过滤、切块、重排、来源核验及拒答策略。', 'This uses lexical query coverage: distinct matched query terms divided by query terms. Chinese uses single characters and adjacent pairs; English uses lowercase words. It is not semantic vector search, BM25 or an LLM. It assembles evidence and does not generate answers. Real RAG also needs access filtering, chunking, reranking, source validation and abstention.'),
  });
  const draw = () => {
    const query = ctx.value('query'), topK = ctx.number('topK'), result = retrieve(query, documents, topK);
    const context = result.map(doc => `[${doc.id}] ${doc.title}\n${doc.text}`).join('\n\n');
    ctx.output.innerHTML = `<div class="lab-viz"><div class="lab-viz-heading"><h4>${t('检索到的证据', 'Retrieved evidence')}</h4><span>${result.length} / ${topK}</span></div>${result.length ? `<div class="lab-retrieval-results">${result.map((doc, i) => `<article class="lab-evidence"><div><b>${i + 1}. [${esc(doc.id)}] ${esc(doc.title)}</b><span>${fmt(doc.score * 100, 1)}%</span></div><p>${esc(doc.text)}</p><small>${t('匹配特征', 'Matched features')}: ${doc.matched.map(esc).join(' · ')}</small></article>`).join('')}</div>` : `<div class="lab-no-evidence" role="status"><b>${t('没有匹配证据', 'No matching evidence')}</b><p>${t('换一个查询词，或补充可追溯的资料。当前应报告信息不足。', 'Try another query or add traceable documents. The current result should report insufficient information.')}</p></div>`}</div><details class="lab-context" open><summary>${t('查看交给模型的证据上下文', 'Inspect the evidence context for a model')}</summary><pre>${esc(t('仅根据下列资料回答；资料不足时说明不足。', 'Answer using only the following evidence; report insufficient evidence when needed.'))}\n\n${esc(context || t('（没有检索结果）', '(No retrieval result)'))}\n\n${esc(t('问题：', 'Question: ') + query)}</pre></details>${note(t('分数不是答案正确率', 'This score is not answer accuracy'), t('覆盖率只表示词面特征匹配程度。高分文档仍可能过期、无关或自相矛盾；真正回答前需要核验来源和适用范围。这里没有向任何模型发送请求。', 'Coverage measures lexical overlap only. A high-scoring passage can still be stale, irrelevant or contradictory. Verify provenance and applicability before answering. No request is sent to a model here.'))}<details class="lab-corpus"><summary>${t('查看全部 5 篇教学文档', 'Inspect all 5 teaching documents')}</summary>${documents.map(doc => `<article><b>[${esc(doc.id)}] ${esc(doc.title)}</b><p>${esc(doc.text)}</p></article>`).join('')}</details>`;
  };
  ctx.onInput(draw); draw(); return ctx.cleanup;
}

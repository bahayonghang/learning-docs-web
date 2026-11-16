import type { LabDefinition } from '../types';

export const labs: LabDefinition[] = [
  { id: 'vectors', title: { zh: '向量如何变成一个答案', en: 'From vectors to an answer' }, description: { zh: '拖动向量分量，观察方向、点积与矩阵乘法。', en: 'Change vector coordinates and inspect directions, dot products and matrix multiplication.' }, category: 'foundations', chapterIds: ['01'], icon: 'MoveUpRight' },
  { id: 'softmax', title: { zh: '把分数变成概率', en: 'Turn scores into probabilities' }, description: { zh: '调整 logits 与温度，现场计算 softmax、熵和交叉熵。', en: 'Adjust logits and temperature to compute softmax, entropy and cross-entropy.' }, category: 'foundations', chapterIds: ['02'], icon: 'ChartNoAxesColumnIncreasing' },
  { id: 'gradient', title: { zh: '沿着梯度走下山', en: 'Walk downhill with gradients' }, description: { zh: '逐步或自动播放真实参数更新，观察收敛和过冲。', en: 'Step through or play actual parameter updates to observe convergence and overshooting.' }, category: 'foundations', chapterIds: ['03', '05'], icon: 'TrendingDown' },
  { id: 'neuron', title: { zh: '点亮一个神经元', en: 'Activate a neuron' }, description: { zh: '修改权重、偏置与激活函数，追踪信号如何流过。', en: 'Change weights, bias and activation to follow a forward signal.' }, category: 'foundations', chapterIds: ['04'], icon: 'Network' },
  { id: 'tokenizer', title: { zh: '亲手拆开一个词', en: 'Take a word apart' }, description: { zh: '用固定玩具 BPE 规则合并字符，保留空格并还原原文。', en: 'Merge characters with fixed toy BPE rules, preserving spaces and reconstructing the text.' }, category: 'architecture', chapterIds: ['07'], icon: 'TextCursorInput' },
  { id: 'attention', title: { zh: '看见注意力的分配', en: 'See where attention goes' }, description: { zh: '调整 Query，观察因果遮罩、权重热力图与 Value 加权和。', en: 'Adjust a Query to inspect causal masks, attention heatmaps and weighted Values.' }, category: 'architecture', chapterIds: ['10'], icon: 'Focus' },
  { id: 'generation', title: { zh: '一个 token 接一个 token', en: 'One token at a time' }, description: { zh: '用可重复的随机种子探索温度、top-p 与自回归生成。', en: 'Explore temperature, top-p and autoregressive decoding with a reproducible seed.' }, category: 'architecture', chapterIds: ['14'], icon: 'Play' },
  { id: 'kv-cache', title: { zh: '上下文占了多少显存', en: 'How much memory is the context?' }, description: { zh: '从维度计算 KV 缓存，比较 MHA、GQA 与 MQA。', en: 'Calculate KV memory from dimensions and compare MHA, GQA and MQA.' }, category: 'practice', chapterIds: ['15'], icon: 'MemoryStick' },
  { id: 'lora', title: { zh: '小矩阵怎样改变大模型', en: 'Small matrices, large-model updates' }, description: { zh: '改变 LoRA 的秩，核对低秩分解和可训练参数量。', en: 'Change LoRA rank and verify the low-rank factorization and trainable parameter count.' }, category: 'practice', chapterIds: ['16'], icon: 'Layers' },
  { id: 'retrieval', title: { zh: '为回答找到依据', en: 'Find evidence for an answer' }, description: { zh: '在本地教学文档中检索、排序，组装可追溯的证据。', en: 'Retrieve and rank local teaching documents, then assemble traceable evidence.' }, category: 'practice', chapterIds: ['17'], icon: 'FileSearch' },
];


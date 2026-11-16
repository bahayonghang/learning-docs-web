import type { FigureId, Locale, Localized } from './types';
export interface Figure {
  id: FigureId;
  title: Localized;
  description: Localized;
  category: 'foundations' | 'architecture' | 'practice';
}
export const figures: Figure[] = [
  { id: 'mathematics', title: { zh: '把数学变成可以看见的积木', en: 'Mathematics you can build with' }, description: { zh: '从向量与矩阵，到概率分配与沿梯度学习。', en: 'Vectors, matrices, probability, and learning along a gradient.' }, category: 'foundations' },
  { id: 'neural-network', title: { zh: '一个会调整自己的信号工坊', en: 'A workshop that learns to adjust' }, description: { zh: '输入、特征、预测与反馈，组成神经网络的学习循环。', en: 'Inputs, features, predictions, and feedback form a learning loop.' }, category: 'foundations' },
  { id: 'tokens-embeddings', title: { zh: '文字怎样走进向量世界', en: 'How text enters a vector world' }, description: { zh: '分词给文字编号，嵌入为每个编号提供可学习的表示。', en: 'Tokenization assigns IDs; embeddings provide learnable representations.' }, category: 'architecture' },
  { id: 'attention', title: { zh: '在上下文中寻找有用信息', en: 'Finding useful information in context' }, description: { zh: '理解查询、匹配和信息汇总的角色。', en: 'Understand the roles of querying, matching, and gathering information.' }, category: 'architecture' },
  { id: 'transformer', title: { zh: '逐层加工上下文的 Transformer', en: 'Refining context through a Transformer' }, description: { zh: '注意力混合位置上的信息，前馈网络加工特征。', en: 'Attention mixes information across positions; feed-forward layers transform features.' }, category: 'architecture' },
  { id: 'generation', title: { zh: '一步一步生成，保留已有计算', en: 'Generate step by step, reuse computation' }, description: { zh: '自回归生成与 KV 缓存的直觉，区别于模型权重和长期记忆。', en: 'An intuition for autoregressive generation and KV caching, distinct from weights or long-term memory.' }, category: 'practice' },
  { id: 'adaptation', title: { zh: '把基础模型变成有用的系统', en: 'From a base model to a useful system' }, description: { zh: '检索证据、参数适配与偏好学习，各自解决不同问题。', en: 'Retrieved evidence, parameter adaptation, and preference learning solve different problems.' }, category: 'practice' },
];
export const figurePath = (id: FigureId, locale: Locale): string => `${import.meta.env.BASE_URL}images/${id}-${locale}.webp`;

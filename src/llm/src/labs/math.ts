/** Small, deterministic teaching kernels. None of these functions calls a model. */
export function dot(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || !a.length) throw new Error('Matching nonempty vectors required');
  if (![...a, ...b].every(Number.isFinite)) throw new Error('Finite vector entries required');
  return a.reduce((sum, value, i) => sum + value * b[i], 0);
}

export function softmax(logits: readonly number[], temperature = 1): number[] {
  if (!logits.length || !Number.isFinite(temperature) || temperature < 0) throw new Error('Invalid softmax input');
  if (!logits.every(x => Number.isFinite(x) || x === -Infinity)) throw new Error('Invalid logit');
  const max = Math.max(...logits);
  if (!Number.isFinite(max)) throw new Error('At least one unmasked logit required');
  if (temperature === 0) {
    const best = logits.indexOf(max);
    return logits.map((_, i) => Number(i === best));
  }
  const exponentials = logits.map(x => Math.exp((x - max) / temperature));
  const total = exponentials.reduce((a, b) => a + b, 0);
  return exponentials.map(x => x / total);
}

export function crossEntropy(probabilities: readonly number[], target: number): number {
  if (!Number.isInteger(target) || target < 0 || target >= probabilities.length) throw new Error('Invalid target');
  const p = probabilities[target];
  if (p < 0 || p > 1 || !Number.isFinite(p)) throw new Error('Invalid probability');
  return -Math.log(p);
}

export function entropy(probabilities: readonly number[]): number {
  return probabilities.reduce((sum, p) => sum - (p > 0 ? p * Math.log(p) : 0), 0);
}

export function activate(z: number, activation: 'relu' | 'sigmoid' | 'linear'): number {
  if (activation === 'relu') return Math.max(0, z);
  if (activation === 'sigmoid') return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
  return z;
}

export function gradientStep(weight: number, target: number, rate: number) {
  const gradient = weight - target;
  return { gradient, loss: 0.5 * gradient ** 2, next: weight - rate * gradient };
}

export interface AttentionResult { scores: number[]; weights: number[]; output: number[] }
export function scaledAttention(
  query: readonly number[], keys: readonly (readonly number[])[],
  values: readonly (readonly number[])[], allowed = keys.map(() => true),
): AttentionResult {
  if (!keys.length || keys.length !== values.length || allowed.length !== keys.length) throw new Error('Invalid attention dimensions');
  const valueWidth = values[0].length;
  if (!valueWidth || !values.every(v => v.length === valueWidth && v.every(Number.isFinite))) throw new Error('Invalid values');
  const scores = keys.map((key, i) => allowed[i] ? dot(query, key) / Math.sqrt(query.length) : -Infinity);
  const weights = softmax(scores);
  const output = Array.from({ length: valueWidth }, (_, j) => weights.reduce((sum, weight, i) => sum + weight * values[i][j], 0));
  return { scores, weights, output };
}

export function topP(probabilities: readonly number[], threshold: number): number[] {
  if (threshold <= 0 || threshold > 1 || !Number.isFinite(threshold)) throw new Error('Threshold must be in (0, 1]');
  if (!probabilities.length || !probabilities.every(p => Number.isFinite(p) && p >= 0)) throw new Error('Invalid probability distribution');
  const total = probabilities.reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-8) throw new Error('Probabilities must sum to one');
  const ranked = probabilities.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p || a.i - b.i);
  const kept = new Set<number>();
  let mass = 0;
  for (const { p, i } of ranked) {
    kept.add(i);
    mass += p;
    if (mass >= threshold) break;
  }
  return probabilities.map((p, i) => kept.has(i) ? p / mass : 0);
}

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function sample(probabilities: readonly number[], random: () => number): number {
  if (!probabilities.length || !probabilities.every(p => Number.isFinite(p) && p >= 0)
    || Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) > 1e-8) throw new Error('Invalid probability distribution');
  const u = random();
  if (!Number.isFinite(u) || u < 0 || u >= 1) throw new Error('Random value must be in [0, 1)');
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (u < cumulative) return i;
  }
  return probabilities.findLastIndex(p => p > 0);
}

export const TOY_MERGES: readonly (readonly [string, string])[] = [
  ['l', 'o'], ['lo', 'w'], ['e', 'r'], ['low', 'er'], ['e', 's'], ['es', 't'], ['low', 'est'],
  ['你', '好'], ['世', '界'], ['语', '言'], ['模', '型'], ['语言', '模型'],
];

export interface BpeStage { tokens: string[]; rule: readonly [string, string] | null }
export function toyBpeStages(input: string): BpeStage[] {
  let tokens = Array.from(input);
  const stages: BpeStage[] = [{ tokens: [...tokens], rule: null }];
  for (const [left, right] of TOY_MERGES) {
    const next: string[] = [];
    let changed = false;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === left && tokens[i + 1] === right) {
        next.push(left + right); i++; changed = true;
      } else next.push(tokens[i]);
    }
    if (changed) stages.push({ tokens: next, rule: [left, right] });
    tokens = next;
  }
  return stages;
}

export interface KvConfig { layers: number; batch: number; tokens: number; kvHeads: number; headDim: number; bytes: number }
export function kvCacheBytes(config: KvConfig): number {
  if (!Object.values(config).every(x => Number.isInteger(x) && x > 0)) throw new Error('Positive integer KV dimensions required');
  return 2 * config.layers * config.batch * config.tokens * config.kvHeads * config.headDim * config.bytes;
}

export function loraParameters(input: number, output: number, rank: number) {
  if (![input, output, rank].every(x => Number.isInteger(x) && x > 0) || rank > Math.min(input, output)) throw new Error('Invalid LoRA dimensions');
  const dense = input * output, adapter = rank * (input + output);
  return { dense, adapter, fraction: adapter / dense };
}

export interface RetrievalDocument { id: string; title: string; text: string }
/** Deliberately lexical. CJK unigrams/bigrams + Latin words are shared query/document features. */
export function lexicalTerms(text: string): string[] {
  const normalized = text.toLocaleLowerCase();
  const words = normalized.match(/[a-z0-9]+/g) ?? [];
  const runs = normalized.match(/[\p{Script=Han}]+/gu) ?? [];
  return [...words, ...runs.flatMap(run => {
    const chars = Array.from(run);
    return [...chars, ...chars.slice(0, -1).map((c, i) => c + chars[i + 1])];
  })];
}

export function retrieve(query: string, documents: readonly RetrievalDocument[], limit: number) {
  const queryTerms = [...new Set(lexicalTerms(query))];
  return documents.map(doc => {
    const terms = new Set(lexicalTerms(doc.title + ' ' + doc.text));
    const matched = queryTerms.filter(term => terms.has(term));
    return { ...doc, matched, score: queryTerms.length ? matched.length / queryTerms.length : 0 };
  }).filter(doc => doc.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, Math.max(0, Math.floor(limit)));
}

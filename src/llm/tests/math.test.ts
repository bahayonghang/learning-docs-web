import test from 'node:test';
import assert from 'node:assert/strict';
import { activate, crossEntropy, dot, gradientStep, kvCacheBytes, loraParameters, retrieve, sample, scaledAttention, seededRandom, softmax, topP, toyBpeStages } from '../src/labs/math';

const close = (actual: number, expected: number, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('dot product includes negative contributions and rejects shape mismatch', () => {
  assert.equal(dot([2, -1], [3, 4]), 2);
  assert.throws(() => dot([1], [1, 2]));
});

test('stable softmax, cross-entropy and additive-shift invariance', () => {
  const p = softmax([2, 1, 0]);
  close(p[0], .665240956); close(p[1], .244728471); close(p[2], .090030573);
  close(crossEntropy(p, 0), .407605964);
  softmax([10002, 10001, 10000]).forEach((v, i) => close(v, p[i]));
  close(softmax([2, 1, 0], .5)[0], .866813332);
  close(softmax([2, 1, 0], 2)[0], .506480391);
});

test('zero temperature is greedy with documented first-index tie break', () => {
  assert.deepEqual(softmax([1, 2, 2], 0), [0, 1, 0]);
  assert.throws(() => softmax([-Infinity, -Infinity]));
  assert.throws(() => softmax([]));
  assert.throws(() => softmax([1, 2], -1));
  assert.deepEqual(topP(softmax([1, 2, 2], 0), .1), [0, 1, 0]);
});

test('gradient descent decreases loss below stability limit and can diverge above it', () => {
  const good = gradientStep(-3, 2, .4);
  assert.equal(good.next, -1); assert.equal(good.gradient, -5);
  assert.ok(gradientStep(good.next, 2, .4).loss < good.loss);
  const bad = gradientStep(-3, 2, 2.2);
  assert.ok(gradientStep(bad.next, 2, 2.2).loss > bad.loss);
});

test('activations expose saturation and the ReLU zero region', () => {
  assert.equal(activate(-2, 'relu'), 0); assert.equal(activate(2, 'relu'), 2);
  close(activate(0, 'sigmoid'), .5); assert.equal(activate(-1000, 'sigmoid'), 0);
});

test('attention weights and output follow QK scaling and V aggregation', () => {
  const result = scaledAttention([1, 0], [[1, 0], [0, 1], [1, 1]], [[1, 0], [0, 2], [1, 1]]);
  close(result.weights[0], .401112093); close(result.weights[1], .197775814);
  close(result.output[0], .802224186); close(result.output[1], .796663721);
});

test('causal mask blocks future positions exactly without score-zero leakage', () => {
  const result = scaledAttention([1, 0], [[1, 0], [0, 1], [99, 99]], [[1, 0], [0, 2], [99, 99]], [true, true, false]);
  assert.equal(result.scores[2], -Infinity); assert.equal(result.weights[2], 0);
  close(result.weights.reduce((a, b) => a + b, 0), 1);
  assert.ok(result.output[0] <= 1); assert.ok(result.output[1] <= 2);
  assert.throws(() => scaledAttention([1, 0], [[1]], [[1]]));
  assert.throws(() => scaledAttention([1, 0], [[1, 0]], [[1]], [false]));
});

test('top-p retains the threshold-crossing token and renormalizes', () => {
  const p = topP([.5, .3, .2], .7);
  close(p[0], .625); close(p[1], .375); assert.equal(p[2], 0);
  assert.deepEqual(topP([.5, .3, .2], .5), [1, 0, 0]);
  assert.deepEqual(topP([.5, .3, .2], 1), [.5, .3, .2]);
});

test('seeded generation replays identically and never samples zero-probability entries', () => {
  const a = seededRandom(42), b = seededRandom(42);
  const first = Array.from({ length: 40 }, () => sample([.2, 0, .8], a));
  const second = Array.from({ length: 40 }, () => sample([.2, 0, .8], b));
  assert.deepEqual(first, second); assert.ok(!first.includes(1));
  assert.throws(() => sample([0, 0], () => .5));
  assert.throws(() => sample([.2, .8], () => 1));
});

test('toy BPE preserves whitespace and text at every merge', () => {
  const input = 'lower lowest 你好世界';
  const stages = toyBpeStages(input);
  stages.forEach(stage => assert.equal(stage.tokens.join(''), input));
  assert.deepEqual(stages.at(-1)!.tokens, ['lower', ' ', 'lowest', ' ', '你好', '世界']);
  assert.deepEqual(toyBpeStages(''), [{ tokens: [], rule: null }]);
});

test('GQA KV memory accounts for both K/V, all layers, batch and bytes', () => {
  const base = { layers: 32, batch: 1, tokens: 4096, kvHeads: 8, headDim: 128, bytes: 2 };
  assert.equal(kvCacheBytes(base), 536870912);
  assert.equal(kvCacheBytes({ ...base, batch: 4 }), 4 * kvCacheBytes(base));
  assert.equal(kvCacheBytes({ ...base, kvHeads: 32 }), 4 * kvCacheBytes(base));
});

test('LoRA trainable count is r(d_in+d_out), excluding frozen base', () => {
  const count = loraParameters(4096, 4096, 8);
  assert.equal(count.dense, 16777216); assert.equal(count.adapter, 65536);
  close(count.fraction * 100, .390625);
});

test('lexical retrieval uses query coverage, returns no fabricated result, handles CJK', () => {
  const docs = [
    { id: 'A', title: 'Pressure', text: 'pressure sensor calibration' },
    { id: 'B', title: 'Temperature', text: 'temperature alarm' },
    { id: 'C', title: '压力传感器', text: '压力传感器需要校准' },
  ];
  assert.equal(retrieve('pressure calibration', docs, 2)[0].id, 'A');
  assert.equal(retrieve('压力校准', docs, 1)[0].id, 'C');
  assert.deepEqual(retrieve('unicorn', docs, 2), []);
  assert.deepEqual(retrieve('', docs, 2), []);
});

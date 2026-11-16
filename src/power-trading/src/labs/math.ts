/** Deterministic teaching models. Units are MW, MWh, h, and CNY/MWh unless named otherwise. */
const finite = (n: number, label: string) => { if (!Number.isFinite(n)) throw new RangeError(`${label} must be finite`); return n; };
const nonnegative = (n: number, label: string) => { finite(n, label); if (n < 0) throw new RangeError(`${label} must be nonnegative`); return n; };
const fraction = (n: number, label: string) => { finite(n, label); if (n < 0 || n > 1) throw new RangeError(`${label} must lie in [0,1]`); return n; };
export function energyCost(power: number, hours: number, price: number) {
  const energy = nonnegative(power, 'power') * nonnegative(hours, 'hours');
  return { energy, cost: energy * finite(price, 'price') };
}
export function scenarioStats(values: readonly number[], weights: readonly number[]) {
  if (!values.length || values.length !== weights.length) throw new RangeError('Nonempty, equal-length scenarios required');
  values.forEach(v => finite(v, 'scenario')); weights.forEach(w => nonnegative(w, 'weight'));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new RangeError('At least one scenario weight must be positive');
  const probabilities = weights.map(w => w / total);
  const mean = values.reduce((s, v, i) => s + v * probabilities[i], 0);
  const variance = values.reduce((s, v, i) => s + probabilities[i] * (v - mean) ** 2, 0);
  return { probabilities, mean, variance, sd: Math.sqrt(variance) };
}
export function neuron(temperature: number, lagLoad: number, w1: number, w2: number, bias: number) {
  [temperature, lagLoad, w1, w2, bias].forEach(x => finite(x, 'neuron input'));
  const x = [(temperature - 20) / 10, (lagLoad - 50) / 20];
  const z = w1 * x[0] + w2 * x[1] + bias;
  const activation = Math.max(0, z);
  return { x, z, activation, prediction: 50 + 20 * activation };
}
export const trainX = [-1, -0.5, 0, 0.5, 1, 1.5];
export const trainY = [0.1, 0.3, 0.6, 0.65, 1, 1.2];
export function mse(x: readonly number[], y: readonly number[], w: number, b: number) {
  if (!x.length || x.length !== y.length) throw new RangeError('Equal-length nonempty data required');
  return x.reduce((s, value, i) => s + (w * value + b - y[i]) ** 2, 0) / x.length;
}
export function gradientStep(w: number, b: number, rate: number, x: readonly number[] = trainX, y: readonly number[] = trainY) {
  nonnegative(rate, 'learning rate');
  if (!x.length || x.length !== y.length) throw new RangeError('Equal-length nonempty data required');
  const dw = 2 * x.reduce((s, value, i) => s + (w * value + b - y[i]) * value, 0) / x.length;
  const db = 2 * x.reduce((s, value, i) => s + (w * value + b - y[i]), 0) / x.length;
  const nextW = w - rate * dw, nextB = b - rate * db;
  return { w: nextW, b: nextB, dw, db, loss: mse(x, y, nextW, nextB) };
}
export interface Offer { id: string; capacity: number; price: number }
export function clearMarket(offers: readonly Offer[], demand: number) {
  nonnegative(demand, 'demand');
  const rows = offers.map(o => ({ ...o, accepted: 0 })).sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
  rows.forEach(o => { nonnegative(o.capacity, 'capacity'); finite(o.price, 'offer price'); });
  let remaining = demand;
  for (let i = 0; i < rows.length && remaining > 1e-10;) {
    let end = i + 1;
    while (end < rows.length && rows[end].price === rows[i].price) end++;
    const group = rows.slice(i, end), available = group.reduce((s, o) => s + o.capacity, 0);
    const taken = Math.min(remaining, available);
    group.forEach(o => { o.accepted = available > 0 ? taken * o.capacity / available : 0; });
    remaining = Math.max(0, remaining - taken); i = end;
  }
  const served = rows.reduce((s, o) => s + o.accepted, 0);
  const price = demand === 0 || remaining > 1e-8 ? null : rows.filter(o => o.accepted > 1e-10).at(-1)?.price ?? null;
  return { rows, demand, served, shortage: Math.max(0, demand - served), price, offeredCostPerHour: rows.reduce((s, o) => s + o.accepted * o.price, 0) };
}
/** Two-zone transport model: A has 180 MW at 200; B has 180 MW at 600; A demand=40. */
export function twoZoneDispatch(lineCapacity: number, demandB: number) {
  nonnegative(lineCapacity, 'line capacity'); nonnegative(demandB, 'B demand');
  if (demandB > 180) throw new RangeError('This teaching case assumes B demand <= 180 MW');
  const flow = Math.min(lineCapacity, demandB, 140), genA = 40 + flow, genB = demandB - flow;
  const kink = genB < 1e-8 && (Math.abs(flow - lineCapacity) < 1e-8 || Math.abs(flow - 140) < 1e-8);
  const marginalB = genB > 1e-8 || kink ? 600 : 200;
  return { flow, genA, genB, demandA: 40, demandB, totalCost: 200 * genA + 600 * genB, marginalA: genA >= 180 - 1e-8 ? 600 : 200, marginalB, kink, congested: lineCapacity < demandB && lineCapacity < 140 };
}
export const mae = (actual: readonly number[], predicted: readonly number[]) => {
  if (!actual.length || actual.length !== predicted.length) throw new RangeError('Equal-length nonempty data required');
  return actual.reduce((s, v, i) => s + Math.abs(v - predicted[i]), 0) / actual.length;
};
export function forecastDay(baseTemperature: number, sensitivity: number, bias: number) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const temperature = hours.map(h => baseTemperature + 6 * Math.sin((h - 8) * Math.PI / 12));
  const actual = hours.map((h, i) => 70 + 1.4 * Math.max(temperature[i] - 18, 0) + 8 * Math.sin((h - 8) * Math.PI / 12) + 5 * Math.sin((h - 17) * Math.PI / 6));
  const baseline = hours.map(h => 70 + 1.4 * Math.max(22 + 6 * Math.sin((h - 8) * Math.PI / 12) - 18, 0) + 8 * Math.sin((h - 8) * Math.PI / 12));
  const predicted = hours.map((h, i) => 70 + bias + sensitivity * Math.max(temperature[i] - 18, 0) + 8 * Math.sin((h - 8) * Math.PI / 12));
  return { hours, temperature, actual, predicted, baseline, modelMae: mae(actual, predicted), baselineMae: mae(actual, baseline) };
}
export function fitLine(x: readonly number[], y: readonly number[]) {
  if (x.length < 2 || x.length !== y.length) throw new RangeError('At least two paired observations required');
  const xm = x.reduce((a, b) => a + b, 0) / x.length, ym = y.reduce((a, b) => a + b, 0) / y.length;
  const den = x.reduce((s, v) => s + (v - xm) ** 2, 0);
  const w = den === 0 ? 0 : x.reduce((s, v, i) => s + (v - xm) * (y[i] - ym), 0) / den;
  return { w, b: ym - w * xm };
}
export function backtestSeries(shift: number) {
  return Array.from({ length: 48 }, (_, t) => 35 + 0.65 * t + 3 * Math.sin(t * Math.PI / 6) + (t >= 30 ? shift : 0));
}
/** Rolling origin: predict y[t] using only 0..t-1; leaky mode explicitly uses all 48 targets. */
export function rollingBacktest(shift: number, leaky = false) {
  const actual = backtestSeries(shift), times = actual.map((_, i) => i);
  const predictions: number[] = [], trainErrors: number[] = [];
  for (let t = 24; t < actual.length; t++) {
    const end = leaky ? actual.length : t;
    const x = times.slice(0, end), y = actual.slice(0, end), fit = fitLine(x, y);
    predictions.push(fit.w * t + fit.b);
    trainErrors.push(mae(y, x.map(v => fit.w * v + fit.b)));
  }
  return { actual, predictions, trainErrors, testMae: mae(actual.slice(24), predictions) };
}
export function pinballLoss(values: readonly number[], prediction: number, quantile: number) {
  fraction(quantile, 'quantile'); finite(prediction, 'prediction');
  if (!values.length) throw new RangeError('Nonempty sample required');
  return values.reduce((s, y) => { finite(y, 'sample'); const e = y - prediction; return s + (e >= 0 ? quantile * e : (quantile - 1) * e); }, 0) / values.length;
}
export function empiricalQuantile(values: readonly number[], quantile: number) {
  fraction(quantile, 'quantile');
  if (!values.length) throw new RangeError('Nonempty sample required');
  const sorted = [...values].sort((a, b) => a - b); sorted.forEach(v => finite(v, 'sample'));
  return sorted[Math.max(0, Math.ceil(quantile * sorted.length) - 1)];
}
export function settle(dayAhead: number, actual: number, dayPrice: number, realPrice: number) {
  nonnegative(dayAhead, 'day-ahead energy'); nonnegative(actual, 'actual energy'); finite(dayPrice, 'DA price'); finite(realPrice, 'RT price');
  const deviation = actual - dayAhead, dayAmount = dayAhead * dayPrice, realAmount = deviation * realPrice;
  return { deviation, dayAmount, realAmount, total: dayAmount + realAmount, allAtRealtime: actual * realPrice };
}
export function upperCvar(values: readonly number[], weights: readonly number[], alpha: number) {
  if (alpha < 0 || alpha >= 1 || !Number.isFinite(alpha)) throw new RangeError('alpha must lie in [0,1)');
  const { probabilities } = scenarioStats(values, weights);
  const pairs = values.map((value, i) => ({ value, probability: probabilities[i] })).sort((a, b) => b.value - a.value);
  let remaining = 1 - alpha, sum = 0;
  for (const p of pairs) { const taken = Math.min(remaining, p.probability); sum += taken * p.value; remaining -= taken; if (remaining < 1e-12) break; }
  return sum / (1 - alpha);
}
export function hedgeCosts(load: number, fractionLocked: number, contractPrice: number, prices: readonly number[] = [220, 420, 950], probabilities: readonly number[] = [0.25, 0.5, 0.25], alpha = 0.8) {
  nonnegative(load, 'load'); fraction(fractionLocked, 'hedge fraction'); finite(contractPrice, 'contract price');
  const locked = load * fractionLocked;
  const costs = prices.map(price => locked * contractPrice + (load - locked) * finite(price, 'spot price'));
  const stats = scenarioStats(costs, probabilities);
  return { costs, locked, spot: load - locked, ...stats, cvar: upperCvar(costs, probabilities, alpha) };
}
export interface BatteryConfig { capacity: number; maxPower: number; hours: number; chargeEfficiency: number; dischargeEfficiency: number }
export function batteryStep(energy: number, requestedPower: number, price: number, config: BatteryConfig) {
  const { capacity, maxPower, hours, chargeEfficiency: ec, dischargeEfficiency: ed } = config;
  nonnegative(capacity, 'capacity'); nonnegative(maxPower, 'max power'); nonnegative(hours, 'hours'); finite(requestedPower, 'power'); finite(price, 'price');
  if (energy < 0 || energy > capacity || !Number.isFinite(energy)) throw new RangeError('Energy must lie inside capacity');
  if (!Number.isFinite(ec) || !Number.isFinite(ed) || ec <= 0 || ec > 1 || ed <= 0 || ed > 1) throw new RangeError('Efficiencies must lie in (0,1]');
  const charging = requestedPower >= 0;
  const power = hours === 0 ? 0 : charging ? Math.min(requestedPower, maxPower, (capacity - energy) / (ec * hours)) : -Math.min(-requestedPower, maxPower, energy * ed / hours);
  const gridEnergy = power * hours;
  const delta = charging ? gridEnergy * ec : gridEnergy / ed;
  const nextEnergy = Math.max(0, Math.min(capacity, energy + delta));
  const loss = charging ? gridEnergy - delta : -delta + gridEnergy;
  return { energy: nextEnergy, power, gridEnergy, loss, cashflow: -gridEnergy * price, clipped: Math.abs(power - requestedPower) > 1e-9 };
}
export function storageCycle(config: BatteryConfig, power: number, dischargeFraction = 1, peakPrice = 900) {
  fraction(dischargeFraction, 'discharge fraction'); nonnegative(power, 'requested charge power');
  const prices = [240, 220, 300, 650, peakPrice, 480];
  const requests = [power, power, 0, -power * dischargeFraction, -power * dischargeFraction, 0];
  let energy = 0;
  const steps = prices.map((price, i) => { const result = batteryStep(energy, requests[i], price, config); energy = result.energy; return { ...result, price, request: requests[i], period: i + 1 }; });
  return { steps, terminalEnergy: energy, initialEnergy: 0, cashflow: steps.reduce((s, x) => s + x.cashflow, 0), losses: steps.reduce((s, x) => s + x.loss, 0), bought: steps.reduce((s, x) => s + Math.max(x.gridEnergy, 0), 0), sold: steps.reduce((s, x) => s + Math.max(-x.gridEnergy, 0), 0) };
}

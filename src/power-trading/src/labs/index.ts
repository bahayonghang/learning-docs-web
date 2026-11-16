import './labs.css';
import type { LabId, Locale } from '../types';
import { energyLab, expectationLab, neuronLab, gradientLab } from './foundations';
import { meritOrderLab, congestionLab, settlementLab } from './markets';
import { forecastLab, backtestLab, quantilesLab, hedgeLab, storageLab } from './practice';
export { labs } from './definitions';
const mounts: Record<LabId, (host: HTMLElement, locale: Locale) => () => void> = {
  energy: energyLab, expectation: expectationLab, neuron: neuronLab, gradient: gradientLab,
  'merit-order': meritOrderLab, congestion: congestionLab, forecast: forecastLab, backtest: backtestLab,
  quantiles: quantilesLab, settlement: settlementLab, hedge: hedgeLab, storage: storageLab,
};
export function mountLab(host: HTMLElement, id: LabId, locale: Locale): () => void {
  const mount = mounts[id];
  if (!mount) throw new RangeError(`Unknown lab: ${id}`);
  return mount(host, locale);
}

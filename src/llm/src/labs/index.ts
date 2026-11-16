import type { LabId, Locale } from '../types';
import { mountGradient, mountNeuron, mountSoftmax, mountVectors } from './foundations';
import { mountAttention, mountGeneration, mountTokenizer } from './architecture';
import { mountKvCache, mountLora, mountRetrieval } from './practice';
import './labs.css';

export { labs } from './definitions';

const mounts: Record<LabId, (host: HTMLElement, locale: Locale) => () => void> = {
  vectors: mountVectors, neuron: mountNeuron, gradient: mountGradient, softmax: mountSoftmax,
  tokenizer: mountTokenizer, attention: mountAttention, generation: mountGeneration,
  'kv-cache': mountKvCache, lora: mountLora, retrieval: mountRetrieval,
};

/** Returns a disposer. Call it before replacing the host or navigating to another view. */
export function mountLab(host: HTMLElement, id: LabId, locale: Locale): () => void {
  return mounts[id](host, locale);
}

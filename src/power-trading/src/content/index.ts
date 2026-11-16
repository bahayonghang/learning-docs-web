import { foundationsChapters } from './foundations';
import { networkChapters } from './networks';
import { marketChapters } from './markets';
import { forecastingChapters } from './forecasting';
import { decisionChapters } from './decisions';
import { industryChapters } from './industry';

export { modules, sources, glossary } from './catalog';
export const chapters = [...foundationsChapters, ...networkChapters, ...marketChapters, ...forecastingChapters, ...decisionChapters, ...industryChapters];

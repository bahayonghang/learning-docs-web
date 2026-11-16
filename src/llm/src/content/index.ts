import type { Chapter } from '../types';
import { mathChapters } from './math';
import { networkChapters } from './networks';
import { languageChapters } from './language';
import { transformerChapters } from './transformer';
import { trainingChapters } from './training';
import { practiceChapters } from './practice';

export { modules, sources, glossary } from './catalog';
export const chapters: Chapter[] = [
  ...mathChapters,
  ...networkChapters,
  ...languageChapters,
  ...transformerChapters,
  ...trainingChapters,
  ...practiceChapters,
];

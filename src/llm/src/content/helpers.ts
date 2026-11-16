import type { Chapter, LessonSection, Localized } from '../types';

export const l = <T,>(zh: T, en: T): Localized<T> => ({ zh, en });
export const s = (id: string, zhTitle: string, enTitle: string, zh: string, en: string): LessonSection => ({ id, title: l(zhTitle, enTitle), body: l(zh, en) });
export const option = (zh: string, en: string, zhExplanation: string, enExplanation: string, correct = false): Chapter['quiz']['options'][number] => ({ text: l(zh, en), explanation: l(zhExplanation, enExplanation), correct });

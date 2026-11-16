export type Locale = 'zh' | 'en';
export type Localized<T = string> = { zh: T; en: T };
export type LabId = 'energy' | 'expectation' | 'neuron' | 'gradient' | 'merit-order' | 'congestion' | 'forecast' | 'backtest' | 'quantiles' | 'settlement' | 'hedge' | 'storage';
export type FigureId = 'foundations' | 'neural-forecast' | 'power-system' | 'market-clearing' | 'forecasting' | 'settlement' | 'flexibility' | 'decision-loop';

export interface CourseModule {
  id: string;
  number: number;
  title: Localized;
  description: Localized;
  outcome: Localized;
  icon: string;
  color: string;
}

export interface LessonSection {
  id: string;
  title: Localized;
  body: Localized;
}

export interface Chapter {
  id: string;
  moduleId: string;
  title: Localized;
  subtitle: Localized;
  minutes: number;
  prerequisites: string[];
  objectives: Localized<string[]>;
  tags: Localized<string[]>;
  figure: FigureId;
  figureCaption: Localized;
  figureNotes: Localized<string[]>;
  sections: LessonSection[];
  lab?: LabId;
  workedExample: { title: Localized; body: Localized };
  misconception: Localized;
  boundary: Localized;
  quiz: {
    question: Localized;
    options: { text: Localized; explanation: Localized; correct: boolean }[];
  };
  sourceIds: string[];
}

export interface Source {
  id: string;
  title: string;
  authors: string;
  year: string;
  url: string;
  kind: 'textbook' | 'paper' | 'documentation';
  note: Localized;
  status?: Localized;
  checkedOn?: string;
}

export interface GlossaryEntry {
  id: string;
  term: Localized;
  definition: Localized;
  chapterId: string;
}

export interface LabDefinition {
  id: LabId;
  title: Localized;
  description: Localized;
  category: 'foundations' | 'markets' | 'practice';
  chapterIds: string[];
  icon: string;
}

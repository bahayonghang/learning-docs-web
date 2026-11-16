export type Locale = 'zh' | 'en';
export type Localized<T = string> = { zh: T; en: T };
export type LabId = 'vectors' | 'neuron' | 'gradient' | 'softmax' | 'tokenizer' | 'attention' | 'generation' | 'kv-cache' | 'lora' | 'retrieval';
export type FigureId = 'mathematics' | 'neural-network' | 'tokens-embeddings' | 'attention' | 'transformer' | 'generation' | 'adaptation';

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
  category: 'foundations' | 'architecture' | 'practice';
  chapterIds: string[];
  icon: string;
}

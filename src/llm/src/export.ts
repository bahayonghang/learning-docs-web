import { sources } from './content';
import type { Chapter, Locale } from './types';

export function chapterMarkdown(c: Chapter, language: Locale): string {
  const sourceList = c.sourceIds.map(id => sources.find(s => s.id === id)).filter(Boolean);
  return `# ${c.id} ${c.title[language]}\n\n${c.subtitle[language]}\n\n## ${language === 'zh' ? '学习目标' : 'Objectives'}\n\n${c.objectives[language].map(x => `- ${x}`).join('\n')}\n\n${c.sections.map((s, i) => `## ${s.title[language]}\n\n${s.body[language]}${i === 0 ? `\n\n### ${c.figureCaption[language]}\n\n${c.figureNotes[language].map(x => `- ${x}`).join('\n')}` : ''}`).join('\n\n')}\n\n## ${c.workedExample.title[language]}\n\n${c.workedExample.body[language]}\n\n## ${language === 'zh' ? '常见误区' : 'Common misconception'}\n\n${c.misconception[language]}\n\n## ${language === 'zh' ? '适用边界' : 'Scope and limits'}\n\n${c.boundary[language]}\n\n## ${c.quiz.question[language]}\n\n${c.quiz.options.map((o, i) => `${i + 1}. ${o.text[language]}\n   ${o.correct ? '✓' : '×'} ${o.explanation[language]}`).join('\n\n')}\n\n## ${language === 'zh' ? '原始资料' : 'Primary sources'}\n\n${sourceList.map(s => `- [${s!.title}](${s!.url}) — ${s!.authors}, ${s!.year}`).join('\n')}\n`;
}


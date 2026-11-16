import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chapters, modules, glossary, sources } from '../src/content';
import { chapterMarkdown } from '../src/export';
import type { Locale } from '../src/types';

const destination = fileURLToPath(new URL('../public/downloads/', import.meta.url));
await mkdir(destination, { recursive: true });
for (const locale of ['zh', 'en'] as Locale[]) {
  const chinese = locale === 'zh';
  const preface = chinese
    ? '# Power Trading Atlas · 从数学与神经网络理解电力交易\n\n从数学与神经网络出发，循序渐进理解电力系统、市场出清、负荷与电价预测、采购、结算、储能和工业应用。规则核对日期为2026-11-15，各份文件的版本状态见原始资料；算例不等于安徽实际账单。本文由课程规范数据导出，包含全部正文、数字例子、自检反馈与原始资料。交互实验请在网页中运行。阅读时间为学习估计，不是完成要求。\n\n配图是概念插图；精确公式、数值、单位与模型边界以正文和计算实验为准。图片位于本文件上一级的 images 目录；单独下载 Markdown 不会同时下载图片，请保留站点目录结构。\n'
    : '# Power Trading Atlas · Understand power trading from first principles\n\nStart with mathematics and neural networks, then explore electricity systems, market clearing, forecasting, procurement, settlement, storage, and industrial applications. Rules were checked on 2026-11-15; consult each source for its status. Teaching examples are not actual Anhui bills. Exported from the canonical course data, this book includes all text, worked examples, self-check feedback, and primary sources. Run the interactive experiments in the website. Reading times are estimates, not deadlines.\n\nIllustrations communicate concepts. Text and calculated experiments define exact formulas, numbers, units, and model boundaries. Images live in the sibling images directory; downloading Markdown alone does not download images, so preserve the site directory structure.\n';
  const contents = `\n## ${chinese ? '课程目录' : 'Contents'}\n\n` + modules.map(m => `### ${m.number}. ${m.title[locale]}\n\n${m.description[locale]}\n\n${chapters.filter(c => c.moduleId === m.id).map(c => `- ${c.id} ${c.title[locale]}`).join('\n')}`).join('\n\n');
  const body = chapters.map(c => {
    let text = chapterMarkdown(c, locale);
    const caption = `### ${c.figureCaption[locale]}`;
    text = text.replace(caption, `${caption}\n\n![${c.figureCaption[locale]}](../images/${c.figure}-${locale}.webp)`);
    return text;
  }).join('\n\n---\n\n');
  const terms = `\n\n---\n\n# ${chinese ? '概念与符号' : 'Glossary'}\n\n` + glossary.map(g => `## ${g.term[locale]}\n\n${g.definition[locale]}\n\n${chinese ? '对应第' : 'See lesson'} ${g.chapterId} ${chinese ? '课。' : '.'}`).join('\n\n');
  const bibliography = `\n\n# ${chinese ? '完整原始资料目录' : 'Primary bibliography'}\n\n` + sources.map(s => `- [${s.title}](${s.url}) — ${s.authors}, ${s.year}. ${s.note[locale]}`).join('\n');
  const path = resolve(destination, `power-trading-atlas-${locale}.md`);
  await writeFile(path, preface + contents + '\n\n---\n\n' + body + terms + bibliography + '\n');
  console.log(`Exported ${chapters.length} lessons (${locale}): ${path}`);
}

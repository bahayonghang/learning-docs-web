import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { chapters, modules, sources, glossary } from '../src/content';
import { labs } from '../src/labs/definitions';
import { chapterMarkdown } from '../src/export';
import type { Locale } from '../src/types';

const locales: Locale[] = ['zh', 'en'];
const ids = chapters.map(c => c.id);
const sourceIds = new Set(sources.map(s => s.id));

test('the prerequisite graph is complete, acyclic and ordered from foundations', () => {
  assert.equal(modules.length, 6);
  assert.deepEqual(ids, Array.from({ length: 18 }, (_, i) => String(i + 1).padStart(2, '0')));
  assert.equal(new Set(modules.map(m => m.id)).size, modules.length);
  for (const c of chapters) {
    assert.ok(modules.some(m => m.id === c.moduleId), `${c.id} has a module`);
    for (const prior of c.prerequisites) assert.ok(ids.indexOf(prior) >= 0 && ids.indexOf(prior) < ids.indexOf(c.id), `${c.id} prerequisite ${prior}`);
  }
  for (const m of modules) assert.equal(chapters.filter(c => c.moduleId === m.id).length, 3);
});

test('both locales have full explanations, worked examples and actionable quiz feedback', () => {
  for (const c of chapters) {
    assert.ok(c.sections.length >= 3);
    assert.equal(new Set(c.sections.map(s => s.id)).size, c.sections.length);
    assert.equal(c.quiz.options.filter(o => o.correct).length, 1);
    assert.ok(c.quiz.options.length >= 3);
    for (const locale of locales) {
      assert.ok(c.title[locale].length > 3);
      assert.ok(c.objectives[locale].length >= 3);
      assert.ok(c.figureNotes[locale].length >= 3);
      assert.ok(c.workedExample.body[locale].length > 90);
      assert.ok(c.boundary[locale].length > 40);
      assert.ok(c.misconception[locale].length > 30);
      for (const section of c.sections) assert.ok(section.body[locale].length > 160, `${c.id}/${section.id}/${locale} is substantial`);
      for (const option of c.quiz.options) assert.ok(option.explanation[locale].length > 15, `${c.id}/${locale} has feedback`);
      assert.doesNotMatch(c.sections.map(s => s.body[locale]).join('\n'), /TODO|待补充|Lorem ipsum/i);
    }
  }
});

test('every source, glossary link and lab connection resolves', () => {
  assert.equal(sourceIds.size, sources.length);
  for (const source of sources) {
    assert.ok(new URL(source.url).protocol === 'https:');
    assert.ok(source.title && source.authors && source.year);
  }
  for (const c of chapters) {
    assert.ok(c.sourceIds.length >= 1);
    for (const source of c.sourceIds) assert.ok(sourceIds.has(source), `${c.id} references ${source}`);
    if (c.lab) assert.ok(labs.some(l => l.id === c.lab), `${c.id} lab exists`);
  }
  assert.equal(new Set(glossary.map(g => g.id)).size, glossary.length);
  for (const g of glossary) { assert.ok(ids.includes(g.chapterId)); for (const locale of locales) assert.ok(g.definition[locale].length > 20); }
  assert.equal(new Set(labs.map(l => l.id)).size, labs.length);
  for (const lab of labs) for (const id of lab.chapterIds) assert.ok(ids.includes(id));
});

test('every referenced concept image has an actual Chinese and English raster asset', () => {
  for (const figure of new Set(chapters.map(c => c.figure))) {
    for (const locale of locales) {
      const path = fileURLToPath(new URL(`../public/images/${figure}-${locale}.webp`, import.meta.url));
      assert.ok(existsSync(path), `${figure}-${locale} exists`);
      const bytes = readFileSync(path);
      assert.ok(bytes.length > 10000, `${figure}-${locale} is a substantive image`);
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    }
  }
});

test('all authored math renders with KaTeX in both languages', () => {
  let count = 0;
  for (const c of chapters) for (const locale of locales) {
    const allText = [...c.sections.map(s => s.body[locale]), c.workedExample.body[locale], c.misconception[locale], c.boundary[locale], ...c.quiz.options.map(o => o.explanation[locale])].join('\n').replace(/```[\s\S]*?```|`[^`\n]+`/g, '');
    for (const match of allText.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)) {
      assert.doesNotThrow(() => katex.renderToString((match[1] ?? match[2]).trim(), { displayMode: !!match[1], throwOnError: true, trust: false, strict: 'ignore' }), `${c.id}/${locale}: ${match[0]}`);
      count++;
    }
  }
  assert.ok(count > 80, `expected substantial mathematical coverage, got ${count}`);
});

test('chapter export preserves all body text, feedback and primary-source identities', () => {
  for (const c of chapters) for (const locale of locales) {
    const markdown = chapterMarkdown(c, locale);
    for (const section of c.sections) assert.ok(markdown.includes(section.body[locale]));
    for (const option of c.quiz.options) assert.ok(markdown.includes(option.explanation[locale]));
    for (const id of c.sourceIds) assert.ok(markdown.includes(sources.find(s => s.id === id)!.url));
    assert.ok(markdown.includes(c.boundary[locale]));
  }
});

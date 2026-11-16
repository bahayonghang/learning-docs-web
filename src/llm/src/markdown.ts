import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import type { Locale } from './types';
import { esc } from './ui';

/** Adapted from the sibling RL Atlas renderer: protect code and TeX before Markdown. */
export function renderMarkdown(host: HTMLElement, markdown: string, locale: Locale): void {
  const formulas: { expression: string; display: boolean }[] = [];
  const prepared = markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/g).map((part, i) => {
    if (i % 2) return part;
    return part.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, block: string | undefined, inline: string | undefined) => {
      const index = formulas.push({ expression: block ?? inline ?? '', display: block !== undefined }) - 1;
      return block !== undefined ? `\n\n<div data-formula="${index}"></div>\n\n` : `<span data-formula="${index}"></span>`;
    });
  }).join('');
  host.innerHTML = DOMPurify.sanitize(marked.parse(prepared, { async: false, gfm: true }), { ADD_ATTR: ['data-formula'] });
  host.querySelectorAll<HTMLElement>('[data-formula]').forEach(node => {
    const formula = formulas[Number(node.dataset.formula)];
    if (formula) katex.render(formula.expression.trim(), node, { displayMode: formula.display, throwOnError: false, trust: false, strict: 'ignore', output: 'htmlAndMathml' });
  });
  host.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    if (/^https?:\/\//i.test(a.getAttribute('href') ?? '')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });
  host.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div'); wrapper.className = 'table-scroll';
    table.before(wrapper); wrapper.append(table);
  });
  host.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code'); if (!code) return;
    const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
    toolbar.innerHTML = `<span>${esc(code.className.replace('language-', '') || 'code')}</span><button type="button">${locale === 'zh' ? '复制代码' : 'Copy code'}</button>`;
    toolbar.querySelector('button')!.addEventListener('click', async event => {
      const button = event.currentTarget as HTMLButtonElement;
      try { await navigator.clipboard.writeText(code.textContent ?? ''); button.textContent = locale === 'zh' ? '已复制' : 'Copied'; }
      catch { button.textContent = locale === 'zh' ? '请选中后复制' : 'Select text to copy'; }
    });
    pre.before(toolbar);
  });
}

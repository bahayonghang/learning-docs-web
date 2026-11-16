import type { Locale } from '../types';

export type Translate = (zh: string, en: string) => string;
export const esc = (value: unknown) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const fmt = (n: number, digits = 3) => Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 }) : n === -Infinity ? '−∞' : n === Infinity ? '∞' : '—';
export const vector = (values: readonly number[]) => `[${values.map(v => fmt(v)).join(', ')}]`;
export const metric = (label: string, value: string, detail = '') => `<div class="lab-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
export const range = (id: string, label: string, min: number, max: number, step: number, value: number, unit = '') => `<label class="lab-control"><span><span>${esc(label)}</span><span><output data-value="${id}">${value}</output>${esc(unit)}</span></span><input name="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" /></label>`;
export const select = (id: string, label: string, options: { value: string; label: string }[], current?: string) => `<label class="lab-control"><span>${esc(label)}</span><select name="${id}">${options.map(option => `<option value="${esc(option.value)}" ${option.value === current ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}</select></label>`;
export const textInput = (id: string, label: string, value: string, maxLength = 140) => `<label class="lab-control"><span>${esc(label)}</span><input name="${id}" type="text" value="${esc(value)}" maxlength="${maxLength}" autocomplete="off" /></label>`;
export const actions = (t: Translate) => `<div class="lab-actions"><button type="button" data-action="step">${t('走一步', 'Step')}</button><button type="button" data-action="play" aria-pressed="false">${t('自动播放', 'Play')}</button><button type="button" data-action="reset">${t('重置', 'Reset')}</button></div>`;
export const note = (title: string, body: string) => `<div class="lab-explanation"><b>${esc(title)}</b><p>${esc(body)}</p></div>`;

export interface LabContext {
  host: HTMLElement;
  output: HTMLElement;
  signal: AbortSignal;
  t: Translate;
  value: (name: string) => string;
  number: (name: string) => number;
  onInput: (handler: (name: string) => void) => void;
  onAction: (handler: (action: string, element: HTMLElement) => void) => void;
  disposers: (() => void)[];
  cleanup: () => void;
}

export function createLab(host: HTMLElement, locale: Locale, options: {
  intro: string; challenge: string; controls: string; boundary: string;
}): LabContext {
  const t: Translate = (zh, en) => locale === 'zh' ? zh : en;
  host.innerHTML = `<div class="llm-lab"><p class="lab-intro">${esc(options.intro)}</p><div class="lab-challenge"><span>${t('先预测，再动手', 'PREDICT, THEN EXPLORE')}</span><p>${esc(options.challenge)}</p></div><div class="lab-layout"><div class="lab-controls"><h3>${t('调整参数', 'Adjust the inputs')}</h3>${options.controls}</div><div class="lab-output" aria-label="${t('实时计算与可视化', 'Live calculations and visualization')}"></div></div><details class="lab-boundary"><summary>${t('这个实验能说明什么，省略了什么？', 'What does this experiment show and leave out?')}</summary><p>${esc(options.boundary)}</p></details></div>`;
  const abort = new AbortController();
  const disposers: (() => void)[] = [];
  const value = (name: string) => host.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!.value;
  const ctx: LabContext = {
    host, output: host.querySelector('.lab-output')!, signal: abort.signal, t, value,
    number: name => Number(value(name)), disposers,
    onInput: handler => host.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      if (!target.name) return;
      const out = host.querySelector<HTMLOutputElement>(`[data-value="${target.name}"]`);
      if (out) out.value = target.value;
      handler(target.name);
    }, { signal: abort.signal }),
    onAction: handler => host.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
      if (button && host.contains(button)) handler(button.dataset.action!, button);
    }, { signal: abort.signal }),
    cleanup: () => { disposers.forEach(dispose => dispose()); abort.abort(); },
  };
  return ctx;
}

export function player(ctx: LabContext, step: () => boolean, delay = 850) {
  let timer: ReturnType<typeof setInterval> | undefined;
  const button = ctx.host.querySelector<HTMLButtonElement>('[data-action="play"]');
  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    if (button) { button.textContent = ctx.t('自动播放', 'Play'); button.setAttribute('aria-pressed', 'false'); }
  };
  const toggle = () => {
    if (timer !== undefined) { stop(); return; }
    if (!step()) return;
    if (button) { button.textContent = ctx.t('暂停', 'Pause'); button.setAttribute('aria-pressed', 'true'); }
    timer = setInterval(() => { if (!step()) stop(); }, delay);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { signal: ctx.signal });
  ctx.disposers.push(stop);
  return { toggle, stop };
}

export function bars(labels: string[], values: number[], options: { percent?: boolean; selected?: number; max?: number } = {}) {
  const max = options.max ?? Math.max(...values, 1e-12);
  return `<div class="lab-bars">${values.map((value, i) => `<div class="lab-bar-row ${options.selected === i ? 'selected' : ''}"><span>${esc(labels[i])}</span><div class="lab-bar-track"><span style="width:${Math.max(0, Math.min(100, value / max * 100))}%"></span></div><b>${options.percent ? fmt(value * 100, 1) + '%' : fmt(value)}</b></div>`).join('')}</div>`;
}

export function svg(title: string, content: string, width = 520, height = 260) {
  return `<svg class="lab-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${content}</svg>`;
}

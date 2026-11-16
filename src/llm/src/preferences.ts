import type { Locale } from './types';
export type Theme = 'system' | 'light' | 'dark';
export interface Preferences { locale: Locale; theme: Theme; largeText: boolean }
const key = 'llm-atlas-preferences-v1';
export function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '{}');
    return {
      locale: value?.locale === 'en' ? 'en' : 'zh',
      theme: value?.theme === 'light' || value?.theme === 'dark' ? value.theme : 'system',
      largeText: value?.largeText === true,
    };
  } catch { return { locale: 'zh', theme: 'system', largeText: false }; }
}
export function savePreferences(value: Preferences): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preferences are optional. */ }
}
export function applyPreferences(value: Preferences): void {
  document.documentElement.lang = value.locale === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.theme = value.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value.theme;
  document.documentElement.dataset.text = value.largeText ? 'large' : 'normal';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#20201e' : '#f7f5f0');
}

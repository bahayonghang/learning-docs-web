import { createIcons, Zap, ChartNoAxesCombined, Factory, ALargeSmall, ArrowLeft, ArrowRight, ArrowUpRight, BookMarked, BookOpen, ChartNoAxesColumnIncreasing, ChevronDown, ChevronRight, ChevronsUpDown, Clock3, CodeXml, Compass, Download, Expand, FileSearch, FileText, Flag, FlaskConical, Focus, House, Images, Info, Languages, Layers, LibraryBig, Lightbulb, MemoryStick, Menu, Moon, MousePointer2, MoveUpRight, Network, PencilRuler, Play, Route, ScanLine, Search, SearchX, Shapes, Sigma, SlidersHorizontal, Sparkles, Sprout, Sun, SunMoon, TextCursorInput, TextSearch, TrendingDown, Workflow, Wrench, X } from 'lucide';

const icons = { Zap, ChartNoAxesCombined, Factory, ALargeSmall, ArrowLeft, ArrowRight, ArrowUpRight, BookMarked, BookOpen, ChartNoAxesColumnIncreasing, ChevronDown, ChevronRight, ChevronsUpDown, Clock3, CodeXml, Compass, Download, Expand, FileSearch, FileText, Flag, FlaskConical, Focus, House, Images, Info, Languages, Layers, LibraryBig, Lightbulb, MemoryStick, Menu, Moon, MousePointer2, MoveUpRight, Network, PencilRuler, Play, Route, ScanLine, Search, SearchX, Shapes, Sigma, SlidersHorizontal, Sparkles, Sprout, Sun, SunMoon, TextCursorInput, TextSearch, TrendingDown, Workflow, Wrench, X };
import type { Locale, Localized } from './types';

export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
export function icon(name: string, className = ''): string {
  return `<i data-lucide="${esc(name)}" class="${esc(className)}" aria-hidden="true"></i>`;
}
export function refreshIcons(): void { createIcons({ icons, attrs: { 'stroke-width': 1.6, 'aria-hidden': 'true' } }); }
export const local = <T>(value: Localized<T>, locale: Locale): T => value[locale];
export function plain(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, ' ').replace(/[$#*`_>\[\]]/g, '').replace(/\s+/g, ' ').trim();
}
export function download(filename: string, content: string, type = 'text/markdown;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

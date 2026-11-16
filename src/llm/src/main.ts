import './style.css';
import 'katex/dist/katex.min.css';
import { chapters, modules, sources, glossary } from './content';
import { labs, mountLab } from './labs';
import { figures, figurePath } from './figures';
import { applyPreferences, readPreferences, savePreferences, type Theme } from './preferences';
import { renderMarkdown } from './markdown';
import { chapterMarkdown } from './export';
import { esc, icon, refreshIcons, plain, download } from './ui';
import type { Chapter, FigureId, LabId, Locale } from './types';

const preferences = readPreferences();
let locale = preferences.locale;
const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
let cleanupPage: () => void = () => {};
let searchOpener: HTMLElement | null = null;
let figureOpener: HTMLElement | null = null;
const app = document.querySelector<HTMLDivElement>('#app')!;
const chapterUrl = (id: string) => `#/chapter/${id}`;
const currentPath = () => location.hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, '');
const categoryName = (id: string) => ({ all: t('全部', 'All'), foundations: t('数学与网络', 'Foundations'), architecture: t('模型架构', 'Architecture'), practice: t('训练与应用', 'Training & practice') }[id] ?? id);
const buttonLink = (href: string, label: string, primary = false, glyph = 'ArrowUpRight') => `<a class="button ${primary ? 'primary' : 'secondary'}" href="${esc(href)}">${esc(label)}${icon(glyph)}</a>`;
const badge = (text: string) => `<span class="badge">${esc(text)}</span>`;

function shell(): void {
  const sidebar = document.querySelector<HTMLElement>('.sidebar-scroll');
  const oldScroll = sidebar?.scrollTop ?? 0;
  const expanded = [...document.querySelectorAll<HTMLDetailsElement>('.nav-module[open]')].map(x => x.dataset.module);
  app.innerHTML = `
    <a class="skip-link" href="#page">${t('跳到主要内容', 'Skip to content')}</a>
    <aside class="sidebar" id="sidebar" aria-label="${t('学习导航', 'Learning navigation')}">
      <a class="brand" href="#/" aria-label="LLM Atlas"><span class="brand-mark">${icon('Network')}</span><span>LLM Atlas<small>${t('大语言模型 · 交互式学习', 'An interactive learning atlas')}</small></span></a>
      <div class="sidebar-scroll">
        <div class="nav-label">${t('你的学习地图', 'YOUR LEARNING MAP')}</div>
        <nav class="main-nav">
          <a data-nav="" href="#/">${icon('House')}<span>${t('学习总览', 'Overview')}</span></a>
          <a data-nav="course" href="#/course">${icon('BookOpen')}<span>${t('循序渐进学 LLM', 'The course')}</span><small>${chapters.length}</small></a>
          <a data-nav="labs" href="#/labs">${icon('FlaskConical')}<span>${t('交互实验室', 'Interactive labs')}</span><small>${labs.length}</small></a>
          <a data-nav="figures" href="#/figures">${icon('Images')}<span>${t('图解知识库', 'Visual library')}</span></a>
          <a data-nav="resources" href="#/resources">${icon('LibraryBig')}<span>${t('原始资料与术语', 'Sources & glossary')}</span></a>
        </nav>
        <div class="nav-label course-nav-label">${t('从这里，一步步往前', 'ONE IDEA AT A TIME')}</div>
        <nav class="chapter-nav" aria-label="${t('章节目录', 'Chapter navigation')}">
          ${modules.map(m => `<details class="nav-module" data-module="${m.id}" ${expanded.includes(m.id) ? 'open' : ''}><summary><span class="module-number">${String(m.number).padStart(2, '0')}</span><span>${esc(m.title[locale])}</span>${icon('ChevronDown')}</summary><div>${chapters.filter(c => c.moduleId === m.id).map(c => `<a data-chapter="${c.id}" href="${chapterUrl(c.id)}"><span>${c.id}</span>${esc(c.title[locale])}</a>`).join('')}</div></details>`).join('')}
        </nav>
      </div>
      <div class="sidebar-footer"><a href="https://github.com/bahayonghang/learning-docs-web/tree/main/src/llm" target="_blank" rel="noopener noreferrer">${icon('CodeXml')}<span>${t('源码与使用说明', 'Source & documentation')}</span>${icon('ArrowUpRight')}</a><p>${t('先理解，再动手验证。', 'Understand. Experiment. Connect.')}</p></div>
    </aside>
    <button class="sidebar-scrim" aria-label="${t('关闭导航', 'Close navigation')}" data-close-menu></button>
    <div class="workspace">
      <header class="topbar"><div class="topbar-leading"><button class="icon-button mobile-menu" id="menu-toggle" aria-controls="sidebar" aria-expanded="false" aria-label="${t('打开导航', 'Open navigation')}">${icon('Menu')}</button><div class="breadcrumb"><span>LLM Atlas</span>${icon('ChevronRight')}<span id="breadcrumb-current">${t('学习总览', 'Overview')}</span></div></div><div class="topbar-actions"><button class="search-trigger" data-open-search aria-label="${t('搜索知识', 'Search the atlas')}">${icon('Search')}<span>${t('搜索知识', 'Search the atlas')}</span><kbd>⌘ / Ctrl K</kbd></button><label class="locale-control"><span class="sr-only">${t('语言', 'Language')}</span>${icon('Languages')}<select id="locale-select" aria-label="${t('切换语言', 'Change language')}"><option value="zh" ${locale === 'zh' ? 'selected' : ''}>中文</option><option value="en" ${locale === 'en' ? 'selected' : ''}>EN</option></select></label><button id="theme-toggle" class="icon-button" aria-label="${t('切换外观', 'Change appearance')}">${icon('SunMoon')}</button></div></header>
      <main class="page" id="page" tabindex="-1"></main>
      <footer class="site-footer"><span>LLM Atlas <span class="footer-dot">·</span> ${t('从基础，到理解', 'From foundations to understanding')}</span><span>${t('本地计算 · 原始资料 · 双语图解', 'Local experiments · Primary sources · Bilingual figures')}</span></footer>
    </div>
    <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title"><div class="dialog-top"><div><small>${t('连接知识', 'CONNECT IDEAS')}</small><h2 id="search-title">${t('你想理解什么？', 'What would you like to understand?')}</h2></div><button class="icon-button" data-close-search aria-label="${t('关闭搜索', 'Close search')}">${icon('X')}</button></div><label class="search-field">${icon('Search')}<span class="sr-only">${t('搜索章节、实验和术语', 'Search chapters, labs, and terms')}</span><input id="global-search" type="search" autocomplete="off" placeholder="${t('试试：梯度、注意力、KV cache…', 'Try gradients, attention, KV cache…')}" /></label><div class="search-results" id="search-results"></div><div class="dialog-foot">${t('Enter 打开第一项 · Tab 选择 · Esc 关闭', 'Enter opens the first result · Tab selects · Esc closes')}</div></dialog>
    <dialog class="figure-dialog" id="figure-dialog" aria-labelledby="figure-title"><div class="dialog-top"><h2 id="figure-title"></h2><button class="icon-button" data-close-figure aria-label="${t('关闭图解', 'Close figure')}">${icon('X')}</button></div><div id="figure-dialog-body"></div></dialog>`;
  document.querySelector<HTMLElement>('.sidebar-scroll')!.scrollTop = oldScroll;
  document.querySelector('.skip-link')!.addEventListener('click', event => {
    event.preventDefault(); document.querySelector<HTMLElement>('#page')!.focus();
  });
  document.querySelector('#menu-toggle')!.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelector('[data-close-menu]')!.addEventListener('click', () => setMenu(false));
  document.querySelector('[data-open-search]')!.addEventListener('click', openSearch);
  document.querySelector('[data-close-search]')!.addEventListener('click', closeSearch);
  document.querySelector('[data-close-figure]')!.addEventListener('click', closeFigure);
  document.querySelector<HTMLSelectElement>('#locale-select')!.addEventListener('change', event => {
    preferences.locale = (event.target as HTMLSelectElement).value as Locale;
    locale = preferences.locale; savePreferences(preferences); applyPreferences(preferences); shell(); renderRoute(false);
  });
  document.querySelector('#theme-toggle')!.addEventListener('click', () => {
    const themes: Theme[] = ['system', 'light', 'dark']; preferences.theme = themes[(themes.indexOf(preferences.theme) + 1) % themes.length];
    savePreferences(preferences); applyPreferences(preferences); updateThemeButton();
  });
  const input = document.querySelector<HTMLInputElement>('#global-search')!;
  input.addEventListener('input', () => drawSearch(input.value));
  input.addEventListener('keydown', event => { if (event.key === 'Enter') { const link = document.querySelector<HTMLAnchorElement>('#search-results a'); if (link) { link.click(); closeSearch(); } } });
  document.querySelector('#search-results')!.addEventListener('click', event => { if ((event.target as HTMLElement).closest('a')) closeSearch(); });
  document.querySelector<HTMLDialogElement>('#search-dialog')!.addEventListener('click', event => { if (event.target === event.currentTarget) closeSearch(); });
  document.querySelector<HTMLDialogElement>('#figure-dialog')!.addEventListener('click', event => { if (event.target === event.currentTarget) closeFigure(); });
  updateThemeButton(); refreshIcons();
}

function updateThemeButton(): void {
  const name = { system: t('跟随系统', 'System'), light: t('浅色', 'Light'), dark: t('深色', 'Dark') }[preferences.theme];
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
  button.title = t(`外观：${name}，点击切换`, `Appearance: ${name}. Click to cycle.`); button.setAttribute('aria-label', button.title);
  button.innerHTML = icon(preferences.theme === 'system' ? 'SunMoon' : preferences.theme === 'light' ? 'Sun' : 'Moon'); refreshIcons();
}

function setMenu(open: boolean): void {
  const mobile = matchMedia('(max-width: 800px)').matches;
  document.body.classList.toggle('menu-open', open);
  document.querySelector('#menu-toggle')?.setAttribute('aria-expanded', String(open));
  const sidebar = document.querySelector<HTMLElement>('#sidebar');
  if (sidebar) sidebar.inert = mobile && !open;
  const workspace = document.querySelector<HTMLElement>('.workspace');
  if (workspace) workspace.inert = mobile && open;
  if (open) document.querySelector<HTMLAnchorElement>('.main-nav a')?.focus();
}

function title(eyebrow: string, heading: string, description: string): string {
  return `<header class="page-heading"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(heading)}</h1><p>${esc(description)}</p></header>`;
}

function lessonRow(c: Chapter): string {
  return `<a class="lesson-row" href="${chapterUrl(c.id)}"><span class="lesson-index">${c.id}</span><span><strong>${esc(c.title[locale])}</strong><small>${esc(c.subtitle[locale])}</small></span><span class="lesson-duration">${c.minutes} ${t('分钟', 'min')}</span>${icon('ArrowUpRight')}</a>`;
}

function home(host: HTMLElement): void {
  host.innerHTML = `
    <section class="hero">
      <div class="hero-copy"><div class="eyebrow"><span class="little-line"></span>${t('从一个神经元，到大语言模型', 'FROM A SINGLE NEURON TO LANGUAGE MODELS')}</div><h1>${t('让大模型，<br />不再是黑箱。', 'Make language models<br />make sense.')}</h1><p>${t('从数学与神经网络出发，一步步理解文字怎样变成向量、模型怎样学习，以及一句回答如何被生成。', 'Start with mathematics and neural networks. Discover how text becomes vectors, how models learn, and how an answer takes shape.')}</p><div class="hero-actions">${buttonLink(chapterUrl('01'), t('开始第一课', 'Start the first lesson'), true, 'ArrowRight')}${buttonLink('#/course', t('浏览学习路线', 'Explore the curriculum'), false, 'Route')}</div><div class="hero-note">${icon('MousePointer2')}<span>${t('边读、边看、边动手。无需 API 或编程环境。', 'Read, see, and experiment. No API or coding setup needed.')}</span></div></div>
      <div class="hero-visual"><div class="image-paper"><img src="${figurePath('neural-network', locale)}" alt="${esc(figures.find(f => f.id === 'neural-network')!.description[locale])}" width="1536" height="1024" fetchpriority="high" /><span class="figure-label">${t('01 / 学习如何发生', '01 / HOW LEARNING HAPPENS')}</span></div><div class="visual-caption"><span class="signal-dot"></span><span>${t('每一个复杂模型，都从简单的运算开始。', 'Every complex model begins with simple operations.')}</span></div></div>
    </section>
    <div class="atlas-stats"><div><strong>${String(modules.length).padStart(2, '0')}</strong><span>${t('循序渐进的阶段', 'connected stages')}</span></div><div><strong>${chapters.length}</strong><span>${t('完整双语课程', 'bilingual lessons')}</span></div><div><strong>${labs.length}</strong><span>${t('可计算交互实验', 'working experiments')}</span></div><div><strong>${String(figures.length).padStart(2, '0')}</strong><span>${t('中英成对概念图', 'paired visual guides')}</span></div></div>
    <section class="section-block"><div class="section-heading"><div><div class="eyebrow">${t('一条连贯的学习路径', 'A CONNECTED LEARNING PATH')}</div><h2>${t('把零散的知识，串成一张地图。', 'Connect the pieces, one idea at a time.')}</h2></div><a class="text-link" href="#/course">${t('查看全部课程', 'All lessons')}${icon('ArrowRight')}</a></div><div class="module-grid">${modules.map(m => `<a class="module-card" href="${chapterUrl(chapters.find(c => c.moduleId === m.id)!.id)}"><div class="module-card-top"><span class="module-icon">${icon(m.icon)}</span><span class="card-index">${String(m.number).padStart(2, '0')}</span></div><h3>${esc(m.title[locale])}</h3><p>${esc(m.description[locale])}</p><div class="module-card-foot"><span>${chapters.filter(c => c.moduleId === m.id).length} ${t('节课程', 'lessons')}</span>${icon('ArrowUpRight')}</div></a>`).join('')}</div></section>
    <section class="lab-feature"><div><div class="eyebrow">${t('不只是读懂，更要亲眼看到', 'MAKE AN IDEA TANGIBLE')}</div><h2>${t('注意力，究竟在“注意”什么？', 'What does attention actually do?')}</h2><p>${t('修改查询向量，观察匹配分数、概率权重和最终输出一起变化。让 Q、K、V 从三个字母，变成你能解释的运算。', 'Change a query vector. Watch matching scores, weights, and outputs change together. Turn Q, K, and V into a calculation you can explain.')}</p>${buttonLink('#/lab/attention', t('进入注意力实验', 'Explore attention'), true, 'FlaskConical')}</div><a class="feature-image" href="#/lab/attention"><img src="${figurePath('attention', locale)}" alt="${esc(figures.find(f => f.id === 'attention')!.description[locale])}" width="1536" height="1024" loading="lazy" /></a></section>
    <section class="section-block"><div class="section-heading"><div><div class="eyebrow">${t('选择适合你的入口', 'CHOOSE YOUR STARTING POINT')}</div><h2>${t('从你已经知道的地方出发。', 'Build on what you already know.')}</h2></div></div><div class="entry-grid"><a href="${chapterUrl('01')}">${icon('Sprout')}<h3>${t('数学还不熟悉', 'New to the mathematics')}</h3><p>${t('从向量、概率和梯度出发。每一步都有小数字例子。', 'Begin with vectors, probability, and gradients, one small example at a time.')}</p><span>${t('从第 01 课开始', 'Start at lesson 01')}${icon('ArrowRight')}</span></a><a href="${chapterUrl('07')}">${icon('Shapes')}<h3>${t('已经学过神经网络', 'Comfortable with neural nets')}</h3><p>${t('先确认矩阵乘法、交叉熵与反向传播，再进入文字表示。', 'Review matrix multiplication, cross-entropy, and backpropagation, then explore text representations.')}</p><span>${t('从第 07 课开始', 'Start at lesson 07')}${icon('ArrowRight')}</span></a><a href="${chapterUrl('16')}">${icon('Wrench')}<h3>${t('想把原理连到应用', 'Ready to connect to practice')}</h3><p>${t('在理解 Transformer 与生成之后，比较 LoRA、RAG 和评估。', 'After Transformer and generation, compare LoRA, RAG, and evaluation.')}</p><span>${t('从第 16 课开始', 'Start at lesson 16')}${icon('ArrowRight')}</span></a></div></section>
    <div class="editorial-note">${icon('BookMarked')}<div><h3>${t('认真对待每一个“为什么”。', 'Make room for every “why”.')}</h3><p>${t('公式有来处，实验有计算，简化有边界。原始论文、教材与官方文档都在章节末尾，方便继续深入。阅读时间是学习建议，不是完成要求。', 'Formulas have sources, experiments compute their results, and simplifications name their limits. Each lesson links to primary material. Reading times are estimates, never deadlines.')}</p></div></div>`;
}

function course(host: HTMLElement): void {
  host.innerHTML = `${title(t('学习路线 / 六个阶段', 'THE CURRICULUM / SIX STAGES'), t('从基础走到大语言模型。', 'From foundations to language models.'), t('按照先修顺序往前走，也可以搜索一个问题，回到它需要的基础。', 'Follow the prerequisites, or search for a question and work back to its foundations.'))}<div class="catalog-toolbar"><label class="search-field">${icon('Search')}<input type="search" id="course-search" aria-label="${t('搜索课程', 'Search lessons')}" placeholder="${t('搜索章节、概念或关键词…', 'Search lessons, concepts, or keywords…')}" /></label><button class="button secondary" id="expand-course">${t('展开全部', 'Expand all')}${icon('ChevronsUpDown')}</button></div><div id="course-list"></div>`;
  const input = host.querySelector<HTMLInputElement>('#course-search')!;
  const draw = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const list = host.querySelector('#course-list')!;
    const matched = chapters.filter(c => !query || [c.title[locale], c.subtitle[locale], ...c.tags[locale], ...c.sections.map(s => s.body[locale])].join(' ').toLocaleLowerCase().includes(query));
    list.innerHTML = query ? `<div class="result-count" role="status">${matched.length} ${t('节相关课程', 'matching lessons')}</div><div class="lesson-list">${matched.map(lessonRow).join('') || empty()}</div>` : modules.map(m => `<details class="curriculum-module" ${m.number === 1 ? 'open' : ''}><summary><span class="curriculum-number">${String(m.number).padStart(2, '0')}</span><span><small>${t('阶段', 'STAGE')} ${m.number} · ${chapters.filter(c => c.moduleId === m.id).length} ${t('课', 'lessons')}</small><h2>${esc(m.title[locale])}</h2><p>${esc(m.description[locale])}</p></span>${icon('ChevronDown')}</summary><div class="module-lessons">${chapters.filter(c => c.moduleId === m.id).map(lessonRow).join('')}<div class="outcome">${icon('Flag')}<span>${t('阶段目标：', 'Your outcome: ')}${esc(m.outcome[locale])}</span></div></div></details>`).join(''); refreshIcons();
  };
  input.addEventListener('input', draw);
  host.querySelector('#expand-course')!.addEventListener('click', event => {
    const details = [...host.querySelectorAll<HTMLDetailsElement>('.curriculum-module')]; const open = details.some(d => !d.open);
    details.forEach(d => d.open = open); (event.currentTarget as HTMLElement).innerHTML = esc(open ? t('收起全部', 'Collapse all') : t('展开全部', 'Expand all')) + icon('ChevronsUpDown'); refreshIcons();
  }); draw();
}

function empty(): string { return `<div class="empty-state">${icon('SearchX')}<h3>${t('还没有找到对应内容', 'No matching content')}</h3><p>${t('试试更短的关键词，或选择其他分类。', 'Try a shorter query or a different category.')}</p></div>`; }


function chapter(host: HTMLElement, id: string): void {
  const c = chapters.find(c => c.id === id); if (!c) { notFound(host); return; }
  const index = chapters.indexOf(c), previous = chapters[index - 1], next = chapters[index + 1];
  const module = modules.find(m => m.id === c.moduleId)!;
  const relatedLab = labs.find(l => l.id === c.lab);
  host.innerHTML = `<div class="reader-toolbar"><a class="text-link" href="#/course">${icon('ArrowLeft')}${t('全部课程', 'All lessons')}</a><div><button class="icon-button" id="text-size" aria-pressed="${preferences.largeText}" aria-label="${t('切换大字号', 'Toggle larger text')}" title="${t('切换大字号', 'Toggle larger text')}">${icon('ALargeSmall')}</button><button class="icon-button" id="download-chapter" aria-label="${t('下载本章文字', 'Download lesson text')}" title="${t('下载本章文字', 'Download lesson text')}">${icon('Download')}</button></div></div><div class="reader-layout"><article class="reader"><header class="lesson-header"><div class="eyebrow">${t('阶段', 'STAGE')} ${module.number} / ${esc(module.title[locale])}</div><div class="lesson-heading-line"><span>${c.id}</span><h1>${esc(c.title[locale])}</h1></div><p>${esc(c.subtitle[locale])}</p><div class="lesson-meta"><span>${icon('Clock3')}${t('约', 'About')} ${c.minutes} ${t('分钟阅读', 'min reading')}</span>${c.tags[locale].slice(0, 3).map(badge).join('')}</div></header><section class="objectives" id="objectives"><div class="small-heading">${icon('Compass')}<h2>${t('这一课，你会理解', 'What you will understand')}</h2></div><ul>${c.objectives[locale].map(x => `<li>${esc(x)}</li>`).join('')}</ul>${c.prerequisites.length ? `<div class="prerequisites">${t('先修课程', 'Before this lesson')} ${c.prerequisites.map(p => `<a href="${chapterUrl(p)}">${p} · ${esc(chapters.find(x => x.id === p)?.title[locale] ?? p)}</a>`).join(' ')}</div>` : `<p class="prerequisites">${t('不需要先修课程，从这里开始即可。', 'No prerequisites. You can start right here.')}</p>`}</section>
      ${c.sections.map((section, i) => `<section class="lesson-section" id="section-${section.id}"><div class="section-marker">${String(i + 1).padStart(2, '0')} / ${t('理解', 'UNDERSTAND')}</div><h2>${esc(section.title[locale])}</h2><div class="prose" data-section="${i}"></div>${i === 0 ? `<figure class="lesson-figure"><button class="figure-zoom" data-figure="${c.figure}" aria-label="${t('放大图解', 'Enlarge illustration')}：${esc(c.figureCaption[locale])}"><img src="${figurePath(c.figure, locale)}" alt="${esc(c.figureCaption[locale])}" width="1536" height="1024" loading="lazy" /><span>${icon('Expand')}${t('放大阅读', 'Enlarge')}</span></button><figcaption><strong>${esc(c.figureCaption[locale])}</strong><span>${t('概念插图 · 精确计算见下方例题与实验', 'Concept illustration · exact calculations in the example and lab')}</span></figcaption><ol class="figure-notes">${c.figureNotes[locale].map(n => `<li>${esc(n)}</li>`).join('')}</ol></figure>` : ''}</section>`).join('')}
      <section class="worked-example" id="worked-example"><div class="small-heading">${icon('PencilRuler')}<span class="eyebrow">${t('把数字代进去', 'WORK IT THROUGH')}</span></div><h2>${esc(c.workedExample.title[locale])}</h2><div class="prose" id="worked-body"></div></section>
      ${relatedLab ? `<section class="chapter-experiment" id="chapter-experiment"><div class="section-heading"><div><div class="eyebrow">${t('现在，亲手试一试', 'NOW TRY IT YOURSELF')}</div><h2>${esc(relatedLab.title[locale])}</h2></div><a class="text-link" href="#/lab/${c.lab}">${t('独立打开', 'Open full lab')}${icon('ArrowUpRight')}</a></div><p>${esc(relatedLab.description[locale])}</p><details class="inline-lab"><summary>${icon('SlidersHorizontal')}${t('展开本章交互实验', 'Open this lesson’s interactive experiment')}${icon('ChevronDown')}</summary><div id="inline-lab-host"></div></details></section>` : ''}
      <section class="callout misconception" id="misconception">${icon('Lightbulb')}<div><h2>${t('一个容易混淆的地方', 'A common point of confusion')}</h2><div class="prose" id="misconception-body"></div></div></section><section class="callout boundary" id="boundary">${icon('ScanLine')}<div><h2>${t('这个解释的边界', 'What this explanation leaves out')}</h2><div class="prose" id="boundary-body"></div></div></section>
      <section class="quiz" id="quiz"><div class="eyebrow">${t('停下来，检查一下理解', 'PAUSE & CHECK YOUR UNDERSTANDING')}</div><h2>${esc(c.quiz.question[locale])}</h2><p>${t('选择后查看每个选项为什么成立或不成立。可以反复尝试。', 'Choose an answer to see why it works or does not. You can try again.')}</p><div class="quiz-options">${c.quiz.options.map((o, i) => `<button class="quiz-option" data-option="${i}" aria-pressed="false"><span>${String.fromCharCode(65 + i)}</span><span>${esc(o.text[locale])}</span></button>`).join('')}</div><div id="quiz-feedback" class="quiz-feedback" role="status" aria-live="polite" hidden></div></section>
      <section class="lesson-sources" id="lesson-sources"><div class="section-marker">${t('继续向原始资料深入', 'CONTINUE TO THE PRIMARY SOURCES')}</div><h2>${t('本章的知识从哪里来', 'Where these ideas come from')}</h2>${c.sourceIds.map(sourceId => sources.find(s => s.id === sourceId)).filter(Boolean).map(s => `<a href="${esc(s!.url)}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(s!.title)}</strong><small>${esc(s!.authors)} · ${esc(s!.year)}</small><p>${esc(s!.note[locale])}</p></span>${icon('ArrowUpRight')}</a>`).join('')}</section><nav class="lesson-pagination" aria-label="${t('前后课程', 'Adjacent lessons')}">${previous ? `<a href="${chapterUrl(previous.id)}">${icon('ArrowLeft')}<span><small>${t('上一课', 'Previous')}</small>${esc(previous.title[locale])}</span></a>` : '<span></span>'}${next ? `<a href="${chapterUrl(next.id)}"><span><small>${t('下一课', 'Next')}</small>${esc(next.title[locale])}</span>${icon('ArrowRight')}</a>` : `<a href="#/labs"><span><small>${t('继续探索', 'Keep exploring')}</small>${t('回到交互实验室', 'Return to the labs')}</span>${icon('ArrowRight')}</a>`}</nav></article>
      <aside class="reader-outline"><div><div class="eyebrow">${t('本课导览', 'IN THIS LESSON')}</div><nav>${[['objectives', t('学习目标', 'Objectives')], ...c.sections.map(s => [`section-${s.id}`, s.title[locale]]), ['worked-example', t('数字例子', 'Worked example')], ...(relatedLab ? [['chapter-experiment', t('动手实验', 'Try it yourself')]] : []), ['quiz', t('检查理解', 'Check understanding')], ['lesson-sources', t('原始资料', 'Sources')]].map(([target, label]) => `<button data-scroll="${target}">${esc(label)}</button>`).join('')}</nav><div class="outline-tip">${icon('Sparkles')}<p>${t('先预测结果，再改一个参数，最后用自己的话解释变化。', 'Predict first. Change one parameter. Explain the difference in your own words.')}</p></div></div></aside></div>`;
  c.sections.forEach((s, i) => renderMarkdown(host.querySelector(`[data-section="${i}"]`)!, s.body[locale], locale));
  renderMarkdown(host.querySelector('#worked-body')!, c.workedExample.body[locale], locale);
  renderMarkdown(host.querySelector('#misconception-body')!, c.misconception[locale], locale);
  renderMarkdown(host.querySelector('#boundary-body')!, c.boundary[locale], locale);
  host.querySelector('#text-size')!.addEventListener('click', event => { preferences.largeText = !preferences.largeText; savePreferences(preferences); applyPreferences(preferences); (event.currentTarget as HTMLElement).setAttribute('aria-pressed', String(preferences.largeText)); });
  host.querySelector('#download-chapter')!.addEventListener('click', () => download(`llm-atlas-${c.id}-${locale}.md`, chapterMarkdown(c, locale)));
  host.querySelectorAll<HTMLButtonElement>('[data-scroll]').forEach(button => button.addEventListener('click', () => {
    const section = document.getElementById(button.dataset.scroll!); section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    section?.setAttribute('tabindex', '-1'); section?.focus({ preventScroll: true });
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-option]').forEach(button => button.addEventListener('click', () => {
    const option = c.quiz.options[Number(button.dataset.option)];
    host.querySelectorAll<HTMLButtonElement>('[data-option]').forEach(b => { b.classList.remove('correct', 'incorrect'); b.setAttribute('aria-pressed', String(b === button)); });
    button.classList.add(option.correct ? 'correct' : 'incorrect');
    const feedback = host.querySelector<HTMLElement>('#quiz-feedback')!; feedback.hidden = false; feedback.className = `quiz-feedback ${option.correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `<strong>${option.correct ? t('理解得对。', 'That’s right.') : t('再想一步。', 'Think one step further.')}</strong><div class="prose"></div>`;
    renderMarkdown(feedback.querySelector('.prose')!, option.explanation[locale], locale);
  }));
  let stopLab: (() => void) | undefined;
  const detail = host.querySelector<HTMLDetailsElement>('.inline-lab');
  detail?.addEventListener('toggle', () => {
    if (detail.open && !stopLab && c.lab) { stopLab = mountLab(host.querySelector('#inline-lab-host')!, c.lab, locale); refreshIcons(); }
    else if (!detail.open && stopLab) { stopLab(); stopLab = undefined; host.querySelector('#inline-lab-host')!.innerHTML = ''; }
  });
  const observer = new IntersectionObserver(entries => {
    const visible = entries.find(e => e.isIntersecting); if (!visible) return;
    host.querySelectorAll<HTMLButtonElement>('[data-scroll]').forEach(button => button.classList.toggle('active', button.dataset.scroll === visible.target.id));
  }, { rootMargin: '-95px 0px -60% 0px', threshold: 0 });
  host.querySelectorAll('[id].lesson-section, #objectives, #worked-example, #chapter-experiment, #quiz, #lesson-sources').forEach(el => observer.observe(el));
  cleanupPage = () => { stopLab?.(); observer.disconnect(); };
}

function catalogueFilters(): string {
  return `<div class="catalog-toolbar"><label class="search-field">${icon('Search')}<input type="search" id="catalog-search" aria-label="${t('搜索当前列表', 'Search this collection')}" placeholder="${t('搜索名称或知识点…', 'Search by name or concept…')}" /></label><div class="filter-pills" role="group" aria-label="${t('分类筛选', 'Filter by category')}">${['all', 'foundations', 'architecture', 'practice'].map((id, i) => `<button data-category="${id}" aria-pressed="${i === 0}">${categoryName(id)}</button>`).join('')}</div></div>`;
}

function wireFilters(host: HTMLElement, draw: (query: string, category: string) => void): void {
  let category = 'all'; const input = host.querySelector<HTMLInputElement>('#catalog-search')!;
  const update = () => { draw(input.value.trim().toLocaleLowerCase(), category); refreshIcons(); };
  input.addEventListener('input', update);
  host.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category!; host.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); update();
  })); update();
}

function labCatalogue(host: HTMLElement): void {
  host.innerHTML = `${title(t('交互实验室', 'THE INTERACTIVE LAB'), t('把“好像懂了”，变成“我能解释”。', 'Turn an intuition into an explanation.'), t('从一个向量开始，到注意力、生成与知识检索。每个结果都由当前参数计算，先猜，再改，再验证。', 'From a vector to attention, generation, and retrieval. Every result is calculated from the current inputs. Predict, change, and verify.'))}${catalogueFilters()}<div id="catalog-count" class="result-count" role="status"></div><div id="lab-list" class="lab-grid"></div><div class="catalog-note">${icon('Info')}<p>${t('这里是教学模型：分词、生成和检索实验都有明确简化。不会调用真实大模型，也不会把教学输出当作实际模型表现。', 'These are teaching models with explicit simplifications. Tokenization, generation, and retrieval do not call a real LLM or claim to benchmark one.')}</p></div>`;
  wireFilters(host, (query, category) => {
    const matched = labs.filter(l => (category === 'all' || l.category === category) && `${l.id} ${l.title[locale]} ${l.description[locale]}`.toLocaleLowerCase().includes(query));
    host.querySelector('#catalog-count')!.textContent = `${matched.length} ${t('个实验', 'experiments')}`;
    host.querySelector('#lab-list')!.innerHTML = matched.map((l) => `<a class="lab-card" href="#/lab/${l.id}"><div class="lab-card-top"><span>${icon(l.icon)}</span><small>${categoryName(l.category)}</small></div><h2>${esc(l.title[locale])}</h2><p>${esc(l.description[locale])}</p><div><span>${t('修改参数 · 观察变化', 'Change inputs · Observe results')}</span>${icon('ArrowUpRight')}</div></a>`).join('') || empty();
  });
}

function labPage(host: HTMLElement, id: string): void {
  const lab = labs.find(l => l.id === id); if (!lab) { notFound(host); return; }
  host.innerHTML = `<div class="reader-toolbar"><a class="text-link" href="#/labs">${icon('ArrowLeft')}${t('所有实验', 'All experiments')}</a><span class="badge">${categoryName(lab.category)}</span></div>${title(t('先预测，再验证', 'PREDICT, THEN VERIFY'), lab.title[locale], lab.description[locale])}<div id="lab-host"></div><section class="lab-reading"><div class="eyebrow">${t('把实验连回原理', 'CONNECT THE EXPERIMENT TO THE THEORY')}</div><h2>${t('读一读这些相关课程', 'Read the related lessons')}</h2><div class="lesson-list">${lab.chapterIds.map(chapterId => chapters.find(c => c.id === chapterId)).filter(Boolean).map(c => lessonRow(c!)).join('')}</div></section>`;
  cleanupPage = mountLab(host.querySelector('#lab-host')!, id as LabId, locale);
}

function figureCatalogue(host: HTMLElement): void {
  host.innerHTML = `${title(t('图解知识库', 'THE VISUAL LIBRARY'), t('一幅图，找到一个理解的入口。', 'A visual doorway into each idea.'), t('先看整体，再回到对应章节理解细节。图内文字随语言切换，点击可以放大或下载。', 'See the big picture, then visit a lesson for the details. Labels follow your language. Enlarge or download any illustration.'))}${catalogueFilters()}<div id="catalog-count" class="result-count" role="status"></div><div id="figure-list" class="figure-grid"></div>`;
  wireFilters(host, (query, category) => {
    const matched = figures.filter(f => (category === 'all' || f.category === category) && `${f.title[locale]} ${f.description[locale]}`.toLocaleLowerCase().includes(query));
    host.querySelector('#catalog-count')!.textContent = `${matched.length} ${t('组图解', 'visual guides')}`;
    host.querySelector('#figure-list')!.innerHTML = matched.map(f => `<article class="figure-card"><button data-figure="${f.id}" class="figure-thumbnail" aria-label="${t('查看', 'View')} ${esc(f.title[locale])}"><img src="${figurePath(f.id, locale)}" alt="${esc(f.description[locale])}" width="1536" height="1024" loading="lazy" /><span>${icon('Expand')}</span></button><div class="figure-card-copy"><small>${categoryName(f.category)}</small><h2>${esc(f.title[locale])}</h2><p>${esc(f.description[locale])}</p><div class="figure-related">${chapters.filter(c => c.figure === f.id).map(c => `<a href="${chapterUrl(c.id)}">${t('第', 'Lesson')} ${c.id} ${t('课', '')}${icon('ArrowUpRight')}</a>`).join('')}</div></div></article>`).join('') || empty();
  });
}

function resourcesPage(host: HTMLElement): void {
  host.innerHTML = `${title(t('原始资料与术语', 'SOURCES & GLOSSARY'), t('每个概念，都有可以追溯的来处。', 'Follow every idea back to its source.'), t('从教材建立基础，从原始论文理解设计，从官方文档核对实现。术语提供对应课程入口。', 'Build foundations with textbooks, understand designs through papers, and check implementations in official documentation. Each term links back to a lesson.'))}<div class="resource-download"><span>${t('也可以离线阅读全部课程与例题。', 'Read all lessons and worked examples offline.')}</span><a class="button secondary" href="${import.meta.env.BASE_URL}downloads/llm-atlas-${locale}.md" download>${icon('Download')}${t('下载完整教材（Markdown）', 'Download the complete book (Markdown)')}</a></div><div class="resource-tabs" role="group" aria-label="${t('资料类别', 'Resource category')}"><button data-resource-tab="sources" aria-pressed="true">${t('教材与论文', 'Sources')} <span>${sources.length}</span></button><button data-resource-tab="glossary" aria-pressed="false">${t('概念与符号', 'Glossary')} <span>${glossary.length}</span></button></div><div class="catalog-toolbar"><label class="search-field">${icon('Search')}<input id="resource-search" type="search" aria-label="${t('搜索资料或术语', 'Search sources or terms')}" placeholder="${t('搜索题名、作者或概念…', 'Search titles, authors, or concepts…')}" /></label><select id="source-kind" aria-label="${t('来源类型', 'Source type')}"><option value="all">${t('全部来源', 'All source types')}</option><option value="textbook">${t('教材', 'Textbook')}</option><option value="paper">${t('原始论文', 'Research paper')}</option><option value="documentation">${t('官方文档', 'Official documentation')}</option></select></div><div class="result-count" id="resource-count" role="status"></div><div id="resource-list"></div>`;
  let tab = 'sources'; const input = host.querySelector<HTMLInputElement>('#resource-search')!; const kind = host.querySelector<HTMLSelectElement>('#source-kind')!;
  const draw = () => {
    const query = input.value.trim().toLocaleLowerCase(); const list = host.querySelector('#resource-list')!;
    kind.hidden = tab !== 'sources';
    if (tab === 'sources') {
      const matched = sources.filter(s => (kind.value === 'all' || kind.value === s.kind) && `${s.title} ${s.authors} ${s.note[locale]}`.toLocaleLowerCase().includes(query));
      host.querySelector('#resource-count')!.textContent = `${matched.length} ${t('项原始资料', 'primary sources')}`;
      list.innerHTML = `<div class="sources-list">${matched.map(s => `<article class="source-card"><div class="source-type">${icon(s.kind === 'paper' ? 'FileText' : s.kind === 'textbook' ? 'BookOpen' : 'CodeXml')}<span>${{ paper: t('原始论文', 'Research paper'), textbook: t('教材', 'Textbook'), documentation: t('官方文档', 'Official documentation') }[s.kind]}</span></div><div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><h2>${esc(s.title)}</h2>${icon('ArrowUpRight')}</a><small>${esc(s.authors)} · ${esc(s.year)}</small><p>${esc(s.note[locale])}</p><div class="source-lessons">${chapters.filter(c => c.sourceIds.includes(s.id)).map(c => `<a href="${chapterUrl(c.id)}">${t('第', 'Lesson')} ${c.id} ${t('课', '')}</a>`).join('')}</div></div></article>`).join('') || empty()}</div>`;
    } else {
      const matched = glossary.filter(g => `${g.term.zh} ${g.term.en} ${g.definition[locale]}`.toLocaleLowerCase().includes(query));
      host.querySelector('#resource-count')!.textContent = `${matched.length} ${t('个概念', 'terms')}`;
      list.innerHTML = `<div class="glossary-grid">${matched.map(g => `<article class="glossary-card"><h2>${esc(g.term[locale])}</h2><small>${esc(g.term[locale === 'zh' ? 'en' : 'zh'])}</small><p>${esc(g.definition[locale])}</p><a class="text-link" href="${chapterUrl(g.chapterId)}">${t('回到第', 'See lesson')} ${g.chapterId} ${t('课', '')}${icon('ArrowRight')}</a></article>`).join('') || empty()}</div>`;
    } refreshIcons();
  };
  host.querySelectorAll<HTMLButtonElement>('[data-resource-tab]').forEach(button => button.addEventListener('click', () => { tab = button.dataset.resourceTab!; host.querySelectorAll('[data-resource-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); draw(); }));
  input.addEventListener('input', draw); kind.addEventListener('change', draw); draw();
}

function notFound(host: HTMLElement): void {
  host.innerHTML = `<section class="not-found"><div class="eyebrow">404 / ${t('地图之外', 'OFF THE MAP')}</div><h1>${t('这一页还没有被定义。', 'This page is not on the map.')}</h1><p>${t('可以回到课程目录，继续找到你想理解的问题。', 'Return to the curriculum to find your next question.')}</p>${buttonLink('#/course', t('回到课程目录', 'Back to the course'), true, 'ArrowRight')}</section>`;
}

function renderRoute(moveFocus = true): void {
  cleanupPage(); cleanupPage = () => {};
  const path = currentPath(), [section, id] = path.split('/');
  const host = document.querySelector<HTMLElement>('#page')!;
  const names: Record<string, string> = { '': t('学习总览', 'Overview'), course: t('循序渐进学 LLM', 'The course'), labs: t('交互实验室', 'Interactive labs'), figures: t('图解知识库', 'Visual library'), resources: t('原始资料与术语', 'Sources & glossary') };
  let heading = names[section] ?? t('页面未找到', 'Page not found');
  if (section === 'chapter') heading = chapters.find(c => c.id === id)?.title[locale] ?? heading;
  if (section === 'lab') heading = labs.find(l => l.id === id)?.title[locale] ?? heading;
  document.querySelector('#breadcrumb-current')!.textContent = heading;
  document.title = `${heading} · LLM Atlas`;
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach(a => { const active = a.dataset.nav === (section === 'chapter' ? 'course' : section === 'lab' ? 'labs' : section); a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelectorAll<HTMLAnchorElement>('[data-chapter]').forEach(a => { const active = section === 'chapter' && a.dataset.chapter === id; a.classList.toggle('active', active); if (active) { a.setAttribute('aria-current', 'page'); a.closest<HTMLDetailsElement>('details')!.open = true; } else a.removeAttribute('aria-current'); });
  host.classList.toggle('reader-page', section === 'chapter');
  if (!section) home(host);
  else if (section === 'course') course(host);
  else if (section === 'chapter') chapter(host, id);
  else if (section === 'labs') labCatalogue(host);
  else if (section === 'lab') labPage(host, id);
  else if (section === 'figures') figureCatalogue(host);
  else if (section === 'resources') resourcesPage(host);
  else notFound(host);
  refreshIcons(); setMenu(false);
  if (moveFocus) { window.scrollTo({ top: 0, behavior: 'instant' }); host.focus({ preventScroll: true }); }
}

function openSearch(): void {
  setMenu(false);
  searchOpener = document.activeElement as HTMLElement;
  const dialog = document.querySelector<HTMLDialogElement>('#search-dialog')!; if (dialog.open) return;
  dialog.showModal(); const input = document.querySelector<HTMLInputElement>('#global-search')!; input.value = ''; drawSearch(''); input.focus();
}
function closeSearch(): void { document.querySelector<HTMLDialogElement>('#search-dialog')!.close(); searchOpener?.focus({ preventScroll: true }); }
function drawSearch(query: string): void {
  const q = query.trim().toLocaleLowerCase();
  const candidates = [
    ...chapters.map(c => ({ title: c.title[locale], summary: c.subtitle[locale], haystack: `${c.id} ${c.title.zh} ${c.title.en} ${c.tags.zh.join(' ')} ${c.tags.en.join(' ')} ${c.sections.map(s => s.body[locale]).join(' ')}`, href: chapterUrl(c.id), type: `${t('课程', 'Lesson')} ${c.id}`, glyph: 'BookOpen' })),
    ...labs.map(l => ({ title: l.title[locale], summary: l.description[locale], haystack: `${l.id} ${l.title.zh} ${l.title.en} ${l.description[locale]}`, href: `#/lab/${l.id}`, type: t('实验', 'Lab'), glyph: 'FlaskConical' })),
    ...glossary.map(g => ({ title: g.term[locale], summary: g.definition[locale], haystack: `${g.term.zh} ${g.term.en} ${g.definition[locale]}`, href: chapterUrl(g.chapterId), type: t('术语', 'Term'), glyph: 'TextSearch' })),
  ];
  const matches = (q ? candidates.filter(c => c.haystack.toLocaleLowerCase().includes(q)).sort((a, b) => Number(b.title.toLocaleLowerCase().includes(q)) - Number(a.title.toLocaleLowerCase().includes(q))) : candidates.slice(0, 5)).slice(0, 24);
  document.querySelector('#search-results')!.innerHTML = `<div class="search-hint" role="status">${q ? `${matches.length} ${t('项结果（最多显示 24 项）', 'results (up to 24 shown)')}` : t('从这些基础问题开始', 'Start with these foundations')}</div>${matches.map(r => `<a href="${r.href}">${icon(r.glyph)}<span><small>${esc(r.type)}</small><strong>${esc(r.title)}</strong><p>${esc(plain(r.summary).slice(0, locale === 'zh' ? 85 : 150))}</p></span>${icon('ArrowUpRight')}</a>`).join('') || empty()}`; refreshIcons();
}

function openFigure(id: FigureId): void {
  const f = figures.find(f => f.id === id); if (!f) return;
  figureOpener = document.activeElement as HTMLElement;
  document.querySelector('#figure-title')!.textContent = f.title[locale];
  document.querySelector('#figure-dialog-body')!.innerHTML = `<div class="enlarged-figure"><img src="${figurePath(f.id, locale)}" alt="${esc(f.description[locale])}" /></div><div class="figure-dialog-footer"><p>${esc(f.description[locale])}<small>${t('概念插图，不代表精确计算结果。', 'Concept illustration, not an exact computational result.')}</small></p><a class="button secondary" href="${figurePath(f.id, locale)}" download="llm-atlas-${f.id}-${locale}.webp">${icon('Download')}${t('下载图解', 'Download image')}</a></div>`;
  refreshIcons(); document.querySelector<HTMLDialogElement>('#figure-dialog')!.showModal();
}
function closeFigure(): void { document.querySelector<HTMLDialogElement>('#figure-dialog')!.close(); figureOpener?.focus({ preventScroll: true }); }

app.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-figure]'); if (target) openFigure(target.dataset.figure as FigureId);
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); document.querySelector<HTMLButtonElement>('#menu-toggle')?.focus(); }
  if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
    const nodes = [...document.querySelectorAll<HTMLElement>('#sidebar a, #sidebar summary')].filter(el => el.getClientRects().length);
    const first = nodes[0], last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('hashchange', () => renderRoute());
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyPreferences(preferences));
matchMedia('(max-width: 800px)').addEventListener('change', () => setMenu(false));
applyPreferences(preferences); shell(); renderRoute(false);

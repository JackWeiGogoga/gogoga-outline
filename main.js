'use strict';
/* gogoga-outline — a Codex-style heading rail on the edge of the editor.
 * At rest the rail is a column of identical short dashes. Moving the
 * mouse along it raises a dock-like wave: each dash grows by a gaussian
 * falloff of its distance to the cursor, and a preview card (heading +
 * first lines of the section) slides along with the crest.
 *
 * Resting the pointer on the rail unfolds the whole outline beside it,
 * indented by heading level. The rail itself does not move — the panel
 * is a plain flyout — so nothing shifts out from under the cursor and
 * a 50-heading document behaves the same as a 5-heading one.
 * Companion to the gogoga theme. */

const { Plugin, MarkdownView, PluginSettingTab, Setting, Notice, Platform, getLanguage, loadMathJax, renderMath, finishRenderMath, setIcon } = require('obsidian');

/* UI strings. Keep the en and zh key sets identical. */
const STRINGS = {
  en: {
    commandToggleOutline: 'Toggle global outline',
    commandSearch: 'Search headings',
    searchPlaceholder: 'Search headings',
    searchCount: '{n}',
    searchNone: 'No matching headings',
    searchButton: 'Search headings',
    levelTagsName: 'Show heading levels',
    levelTagsDesc: 'Put H1, H2, H3… in front of each row of the full outline.',
    previewEmpty: 'No content in this section yet',
    sideName: 'Position',
    sideDesc: 'Which side of the editor the outline rail sits on.',
    sideRight: 'Right',
    sideLeft: 'Left',
    minHeadingsName: 'Minimum headings',
    minHeadingsDesc: 'Hide the rail when a note has fewer headings than this.',
    showPreviewName: 'Show section preview on hover',
    showPreviewDesc: 'Show the heading and opening lines of the section under the crest.',
    globalOutlineHeading: 'Global outline',
    expandModeName: 'Open mode',
    expandModeDesc: 'Rest the pointer on the rail to open the outline, or open it only with the hotkey.',
    expandModeDwell: 'Open on rest',
    expandModeHotkey: 'Hotkey only',
    dwellDelayName: 'Rest delay',
    dwellDelayDesc: 'How long the pointer must stay still before the outline opens, in milliseconds.',
    panelWidthName: 'Panel width',
    panelMaxLevelName: 'Panel depth',
    panelMaxLevelDesc: 'Headings deeper than this are left out of the panel but keep their dash on the rail.',
    dockedName: 'Keep the full outline open',
    dockedDesc: 'Show the full outline at the edge of the note all the time instead of the rail, like a docked outline panel. The note makes room for it. Not on phones.',
    stayOpenName: 'Keep the outline open after clicking',
    stayOpenDesc: 'Clicking a heading scrolls to it and leaves the outline open. Close it with Esc or the command.',
    focusBranchName: 'Expand only the current heading',
    focusBranchDesc: 'The heading you are reading (or just clicked) is expanded all the way, with the headings above it opened; everything else folds down to the level set below. Arrows in front of headings expand one level on click, everything on double-click.',
    otherDepthName: 'Levels shown for other headings',
    otherDepthDesc: 'With "Expand only the current heading" on, how many levels the rest of the outline shows. In a note under one single top heading, levels count from the headings below it.',
    otherDepthAll: 'All',
    foldArrowsName: 'Fold arrows',
    foldArrowsDesc: 'Headings with subheadings get an arrow in the full outline: click it to fold or unfold that section, double-click to unfold everything under it. Everything starts unfolded, and folds last while the note stays open.',
    wrapName: 'Show full titles',
    wrapDesc: 'Long headings wrap onto more lines instead of being cut off.',
    headingStyleName: 'Show headings in their heading style',
    headingStyleDesc: 'Rows in the full outline take the color, weight and (slightly) the size of their heading level, as set by your theme, so levels are easier to tell apart.',
    expandRow: 'Expand (double-click: expand all)',
    collapseRow: 'Collapse',
    writingHeading: 'Writing (gogoga theme)',
    writingDesc: 'These switch on effects built into the gogoga theme and do nothing under other themes. Each also has a command you can bind to a hotkey.',
    commandToggleFocus: 'Toggle focus mode',
    commandToggleHover: 'Toggle hover line highlight',
    focusName: 'Focus mode',
    focusDesc: 'While typing, only the paragraph with the cursor stays bright; in reading view, the block under the mouse.',
    hoverName: 'Highlight the line under the mouse',
    hoverDesc: 'A light accent tint on the line or paragraph under the mouse.',
    focusOn: 'Focus mode on',
    focusOff: 'Focus mode off',
    hoverOn: 'Hover highlight on',
    hoverOff: 'Hover highlight off',
  },
  zh: {
    commandToggleOutline: '展开/收起全局大纲',
    commandSearch: '搜索标题',
    searchPlaceholder: '搜索标题',
    searchCount: '{n} 个',
    searchNone: '没有匹配的标题',
    searchButton: '搜索标题',
    levelTagsName: '显示标题级别',
    levelTagsDesc: '完整大纲里每行前面标上 H1、H2、H3……',
    previewEmpty: '（本节暂无正文）',
    sideName: '显示位置',
    sideDesc: '大纲导轨贴在编辑区的哪一侧',
    sideRight: '右侧',
    sideLeft: '左侧',
    minHeadingsName: '最少标题数',
    minHeadingsDesc: '标题少于这个数量时不显示导轨',
    showPreviewName: '悬停显示章节预览',
    showPreviewDesc: '波峰所在的章节显示标题和开头内容',
    globalOutlineHeading: '全局大纲',
    expandModeName: '展开方式',
    expandModeDesc: '鼠标在导轨上停住即可展开；也可以只保留快捷键',
    expandModeDwell: '停留展开',
    expandModeHotkey: '仅快捷键',
    dwellDelayName: '停留延迟',
    dwellDelayDesc: '鼠标静止多久后展开（毫秒）',
    panelWidthName: '面板宽度',
    panelMaxLevelName: '面板展开层级',
    panelMaxLevelDesc: '比这更深的标题不进入面板，但导轨上仍然有它的刻度',
    dockedName: '完整大纲常驻展开',
    dockedDesc: '不用悬停，完整大纲一直显示在笔记边上（代替导轨），正文给它让出位置。手机上不生效。',
    stayOpenName: '点击标题后保持大纲打开',
    stayOpenDesc: '点一个标题跳过去，大纲不收起，按 Esc 或再用一次命令关掉',
    focusBranchName: '只展开当前标题',
    focusBranchDesc: '正在看的（或刚点的）标题全部展开，它的上级一路打开，其余标题折叠到下面设的层级；标题前的小箭头单击展开一层、双击全部展开',
    otherDepthName: '其他标题显示到第几级',
    otherDepthDesc: '打开「只展开当前标题」后，其余部分显示几级标题；整篇只有一个一级标题时，从它下面一级算起',
    otherDepthAll: '全部',
    foldArrowsName: '标题折叠箭头',
    foldArrowsDesc: '完整大纲里有子标题的行前面显示小箭头：单击折叠或展开这一节，双击展开它下面的全部标题。默认全部展开，折叠状态在这篇笔记打开期间一直保留',
    wrapName: '显示完整标题',
    wrapDesc: '太长的标题换行显示全文，不再省略成一行',
    headingStyleName: '按标题样式显示',
    headingStyleDesc: '完整大纲里每行用对应标题级别的颜色、粗细，字号也略按级别变化（跟着主题），层级更好分辨',
    expandRow: '展开（双击全部展开）',
    collapseRow: '收起',
    writingHeading: '写作辅助（gogoga 主题）',
    writingDesc: '这两项打开的是 gogoga 主题自带的效果，换成别的主题不起作用。每项都有对应的命令，可以在「快捷键」里绑定。',
    commandToggleFocus: '切换聚焦模式',
    commandToggleHover: '切换悬停行强调',
    focusName: '聚焦模式',
    focusDesc: '写作时只有光标所在的段落保持清晰，其余内容变淡；阅读视图里跟随鼠标所在的段落',
    hoverName: '悬停行强调',
    hoverDesc: '鼠标所在的行（段落）带一层淡淡的强调色底',
    focusOn: '聚焦模式：开',
    focusOff: '聚焦模式：关',
    hoverOn: '悬停行强调：开',
    hoverOff: '悬停行强调：关',
  },
};

let locale = 'en';

function resolveLocale() {
  let lang = '';
  try {
    lang = typeof getLanguage === 'function' ? getLanguage() || '' : '';
  } catch {
    lang = '';
  }
  locale = lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

// t('key') or t('key', { name: value }) — replaces {name} placeholders.
function t(key, vars) {
  const table = STRINGS[locale] || STRINGS.en;
  let str = key in table ? table[key] : STRINGS.en[key];
  if (str === undefined) return key;
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  }
  return str;
}

// Obsidian exposes the CodeMirror 6 packages to plugins. We only need
// EditorView.scrollIntoView; fall back to the instance's constructor if
// a build ever stops re-exporting the module.
let EditorView = null;
try {
  EditorView = require('@codemirror/view').EditorView;
} catch (e) {
  EditorView = null;
}

const DEFAULTS = {
  side: 'right',
  minHeadings: 2,
  showPreview: true,
  previewChars: 140,
  expandMode: 'dwell', // 'dwell' | 'hotkey'
  dwellDelay: 800,
  panelWidth: 240,
  panelMaxLevel: 6,
  panelStayOpen: false,
  panelDocked: false,
  panelFocusBranch: false,
  panelFoldArrows: false, // 标题折叠箭头：默认全部展开，手动折叠（像 Dynamic Outline）
  panelOtherDepth: 1,
  panelWrap: false,
  panelHeadingStyle: false,
  panelLevelTags: false,
  focusMode: false,
  hoverHighlight: false,
};

/* Writing effects live in the gogoga theme behind these body classes (the
   same ones its Style Settings toggles use); this plugin only flips them. */
const WRITING = {
  focusMode: { cls: 'gogoga-focus-mode', on: 'focusOn', off: 'focusOff' },
  hoverHighlight: { cls: 'gogoga-hover-highlight', on: 'hoverOn', off: 'hoverOff' },
};

/* Wave geometry */
const BASE_W = 12;   // dash width at rest
const MAX_EXTRA = 34; // extra width at the crest
const BASE_H = 2;
const MAX_EXTRA_H = 2;
const SIGMA = 22;    // falloff radius in px
const RAIL_PITCH = 12; // 每条短横在导轨上占的高度：8px 按钮 + 4px 间距
const RAIL_GAP = 4;

/* Expansion */
const DWELL_TOL = 6;     // px of drift that still counts as holding still
const CLOSE_GRACE = 180; // ms of slack for crossing the rail/panel gap
const INDENT_STEP = 12;  // px of indent per heading level
const STAGGER = 6;       // ms between row fade-ins
const STAGGER_CAP = 14;  // rows past this all share the last delay

const MATH_RE = /\$\$?(?!\s)([^$\n]+?)(?<!\s)\$\$?(?!\d)/g;

/** A heading's text, with $formulas$ rendered the way the note shows them. */
/** 搜索词拆成几个词（空格隔开），全部出现在标题里才算匹配；不分大小写 */
function searchTerms(query) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/** 标题里每个词出现的位置（给匹配的字加高亮）；有一个词没出现就返回 null */
function matchRanges(text, terms) {
  const low = text.toLowerCase();
  const ranges = [];
  for (const term of terms) {
    let at = low.indexOf(term);
    if (at < 0) return null;
    while (at >= 0) {
      ranges.push([at, at + term.length]);
      at = low.indexOf(term, at + term.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/** 按 ranges 把文字放进 el，匹配的那几段包上 <mark> */
function fillMarked(el, text, ranges) {
  el.empty();
  let last = 0;
  for (const [a, b] of ranges) {
    if (a > last) el.appendText(text.slice(last, a));
    el.createEl('mark', { cls: 'gg-outline-hit', text: text.slice(a, b) });
    last = b;
  }
  if (last < text.length) el.appendText(text.slice(last));
}

function fillHeading(el, text) {
  el.empty();
  if (!text.includes('$') || typeof renderMath !== 'function') {
    el.setText(text);
    return false;
  }
  let last = 0;
  let math = false;
  for (const m of text.matchAll(MATH_RE)) {
    if (m.index > last) el.appendText(text.slice(last, m.index));
    try {
      el.append(renderMath(m[1], false));
      math = true;
    } catch (e) {
      el.appendText(m[0]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) el.appendText(text.slice(last));
  return math;
}

/** Strip the markdown that would be noise in a short preview. */
function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class Rail {
  constructor(plugin, view) {
    this.plugin = plugin;
    this.view = view;
    this.headings = [];
    this.rows = new Map(); // heading index -> panel row (insertion = doc order)
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.focusIndex = -1;
    this.expanded = false;
    this.pinned = false;
    // Branch folding in the panel: parent row of each heading, and the
    // arrows the user clicked open or shut (they beat the automatic
    // "current section" expansion). Reset when the note changes.
    this.parentOf = new Map();
    this.manualOpen = new Set();
    this.manualClosed = new Set();
    this.foldFile = null;
    this.raf = 0;
    this.dwellTimer = 0;
    this.closeTimer = 0;
    this.dwellAnchor = null;
    this.onScroll = () => this.syncActive();
    this.onDocKey = (e) => this.handleDocKey(e);
    // 手机、平板：触屏上没有鼠标移开、没有 Esc，点面板外面收起；键盘弹出时面板跟着可见区域缩
    this.mobile = Platform.isMobile;
    this.layoutRaf = 0;
    this.searchRaf = 0;
    this.onOutside = (e) => {
      if (!this.expanded || this.docked()) return;
      if (this.el.contains(e.target)) return;
      this.collapse();
    };
    this.onViewport = () => this.queueLayout();

    this.el = view.contentEl.createDiv({ cls: 'gg-outline' });
    // 插件刚启用（或 Obsidian 刚启动）时样式表比这段代码晚到：没样式的面板会整个铺在笔记上闪一下，
    // 把视图撑高、连标题栏一起滚走（#2 桌面端反馈）。先藏着，样式到了再显示，也就不会播收起动画
    this.el.style.display = 'none';
    this.waitForStyles();
    this.listEl = this.el.createDiv({ cls: 'gg-outline-list' });
    this.previewEl = this.el.createDiv({ cls: 'gg-outline-preview' });
    this.panelEl = this.el.createDiv({
      cls: 'gg-outline-panel',
      attr: { tabindex: '-1' },
    });
    // 搜索标题（#2）：面板顶上的搜索框；有搜索词时下面换成结果列表（匹配的标题 + 浅色的上级标题）
    this.query = '';
    this.matchList = [];
    this.searchEl = this.panelEl.createDiv({ cls: 'gg-outline-search' });
    this.searchInput = this.searchEl.createEl('input', {
      cls: 'gg-outline-search-input',
      attr: { type: 'search', placeholder: t('searchPlaceholder'), spellcheck: 'false' },
    });
    this.searchCount = this.searchEl.createSpan({ cls: 'gg-outline-search-count' });
    this.panelListEl = this.panelEl.createDiv({ cls: 'gg-outline-panel-list' });
    this.resultsEl = this.panelEl.createDiv({ cls: 'gg-outline-results' });
    this.searchInput.addEventListener('input', () => this.setQuery(this.searchInput.value));
    // 点进搜索框：面板固定住，鼠标移开也不收
    this.searchInput.addEventListener('focus', () => {
      if (!this.expanded) return;
      this.pinned = true;
      this.cancelClose();
    });
    this.searchInput.addEventListener('keydown', (e) => this.handleSearchKey(e));
    // 导轨顶上的放大镜：鼠标移到导轨上才出来，点了打开面板、光标进搜索框
    this.searchBtn = this.el.createEl('button', {
      cls: 'gg-outline-search-btn',
      attr: { type: 'button', tabindex: '-1', 'aria-label': t('searchButton') },
    });
    setIcon(this.searchBtn, 'search');
    this.searchBtn.addEventListener('mousedown', (e) => e.preventDefault());
    this.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openSearch();
    });
    this.searchBtn.addEventListener('mouseenter', () => this.cancelClose());

    this.listEl.addEventListener('mousemove', (e) => this.queueWave(e));
    // Buttons grab focus on mousedown; letting them would pull the
    // caret out of the editor and make CodeMirror scroll it back into
    // view, landing us somewhere other than the heading.
    this.listEl.addEventListener('mousedown', (e) => e.preventDefault());
    // 点导轨上任意位置都跳到离鼠标最近的那条（以前要正好点中 2px 高的短横，点在空隙里没反应）
    this.listEl.addEventListener('click', (e) => {
      e.preventDefault();
      const k = this.nearestItem(e.clientY);
      // With the panel open the dashes scrub it; a click commits.
      if (k >= 0) this.jumpTo(this.railIdx[k]);
    });
    // 笔记窗格高度变了：导轨能放下的标题数跟着变。键盘弹出、收起的动画里高度一帧一变，合并到下一帧只做一次
    this.resizeObs = new ResizeObserver(() => this.queueLayout());
    this.resizeObs.observe(view.contentEl);
    this.listEl.addEventListener('mouseenter', () => this.cancelClose());
    this.listEl.addEventListener('mouseleave', () => this.onLeave(true));
    this.panelEl.addEventListener('mouseenter', () => this.cancelClose());
    this.panelEl.addEventListener('mouseleave', () => this.onLeave(false));
    this.panelEl.addEventListener('keydown', (e) => this.handlePanelKey(e));

    this.apply();
    this.refresh();
  }

  /** styles.css 在 .gg-outline 上定了 --gg-outline-styled：读得到说明样式已生效，可以显示了 */
  waitForStyles() {
    const started = Date.now();
    const check = () => {
      this.styleRaf = 0;
      if (!this.el.isConnected) return;
      const ready = getComputedStyle(this.el).getPropertyValue('--gg-outline-styled').trim() === '1';
      if (ready || Date.now() - started > 10000) {
        this.el.style.removeProperty('display');
        this.railKey = '';
        this.queueLayout();
        return;
      }
      this.styleRaf = window.requestAnimationFrame(check);
    };
    check();
  }

  /** 「完整大纲常驻展开」（#1）：面板一直开着、贴在笔记边上，正文让出位置；手机上屏幕太窄，不生效 */
  docked() {
    return !!this.plugin.settings.panelDocked && !Platform.isPhone;
  }

  /** 常驻时把面板打开（标题够数才开），正文按面板宽度让位 */
  dock() {
    const show = this.docked() && this.headings.length >= this.plugin.settings.minHeadings;
    const host = this.view.contentEl;
    host.toggleClass('gg-outline-docked-host', show);
    host.dataset.ggOutlineSide = this.plugin.settings.side;
    host.style.setProperty('--gg-panel-width', this.plugin.settings.panelWidth + 'px');
    if (!show) return;
    if (!this.expanded) this.expand(false);
    this.pinned = true;
    const shown = this.rows.get(this.rowIndexFor(this.activeIndex));
    if (shown) this.revealRow(shown);
  }

  apply() {
    const wasDocked = this.el.hasClass('gg-outline-docked');
    this.el.toggleClass('gg-outline-docked', this.docked());
    if (wasDocked && !this.docked()) this.collapse();
    this.el.dataset.side = this.plugin.settings.side;
    this.el.toggleClass('gg-outline-mobile', this.mobile && !this.docked());
    this.el.toggleClass('gg-outline-wrap', !!this.plugin.settings.panelWrap);
    // #2：按标题样式显示（默认关）
    this.el.toggleClass('gg-outline-hstyle', !!this.plugin.settings.panelHeadingStyle);
    this.el.toggleClass('gg-outline-ltags', !!this.plugin.settings.panelLevelTags);
    this.el.toggleClass('gg-outline-folding', this.folds());
    this.el.style.setProperty(
      '--gg-panel-width',
      this.plugin.settings.panelWidth + 'px'
    );
  }

  /** The scrollable element differs between editing and reading mode. */
  scroller() {
    return this.view.getMode() === 'preview'
      ? this.view.contentEl.querySelector('.markdown-preview-view')
      : this.view.contentEl.querySelector('.cm-scroller');
  }

  /** 标题结构（文件、视图模式、每个标题的级别和文字）。没变就不用重建导轨和面板 */
  structureKey(file, headings) {
    return (file ? file.path : '') + '\n' + this.view.getMode() + '\n' + headings.map((h) => h.level + ' ' + h.heading).join('\n');
  }

  /** force：设置改了、公式渲染好了，要整个重画 */
  refresh(force) {
    const file = this.view.file;
    const cache = file ? this.plugin.app.metadataCache.getFileCache(file) : null;
    const headings = (cache && cache.headings) || [];
    // 换了一篇笔记：上一篇的搜索不带过来；没常驻时面板也收起
    if (this.shownFile !== undefined && this.shownFile !== file) {
      if (this.docked()) this.clearSearch();
      else this.collapse();
    }
    this.shownFile = file;
    const key = this.structureKey(file, headings);
    if (!force && key === this.structureSig) {
      // 只是正文改了（标题位置挪了）：换上新位置、对一下当前标题，不重建（手机上每打一个字都重建会卡）
      this.headings = headings;
      this.syncActive();
      return;
    }
    this.structureSig = key;
    this.headings = headings;
    this.resultCache = null;
    if (this.foldFile !== file) {
      this.foldFile = file;
      this.manualOpen.clear();
      this.manualClosed.clear();
    }

    this.detachScroll();
    this.listEl.empty();
    this.railIdx = [];
    this.railPos = new Map();
    this.boosted = new Set();
    this.centers = null;
    this.crest = -1;
    this.panelListEl.empty();
    this.rows.clear();
    this.hidePreview();
    this.hoverIndex = -1;
    this.focusIndex = -1;
    this.activeIndex = -1;

    if (this.headings.length < this.plugin.settings.minHeadings) {
      this.el.addClass('gg-outline-empty');
      this.collapse();
      this.dock();
      return;
    }
    this.el.removeClass('gg-outline-empty');

    this.railKey = '';
    this.buildRail();
    this.buildPanel();
    this.attachScroll();
    this.syncActive();
    this.dock();
    // 笔记改了、标题重建了：有搜索词就按新标题再搜一遍
    if (this.query) this.runSearch();
  }

  /* ---------------- The rail ---------------- */

  /** 导轨上放哪些标题（#2）：全放下（每条 12px）就全放；放不下就只放高层级的标题，
      被省掉的标题算在它上面那条短横里；最高一级都放不下时把短横挤密，保证整条导轨都在屏幕里 */
  railPlan() {
    const avail = Math.max(40, this.view.contentEl.clientHeight * 0.76 - 16);
    const fit = Math.max(1, Math.floor((avail + RAIL_GAP) / RAIL_PITCH));
    const n = this.headings.length;
    if (n <= fit) return { cap: 6, pitch: 0 };
    const levels = [...new Set(this.headings.map((h) => h.level))].sort((a, b) => a - b);
    let cap = levels[0];
    for (const l of levels) {
      if (this.headings.filter((h) => h.level <= l).length <= fit) cap = l;
      else break;
    }
    const count = this.headings.filter((h) => h.level <= cap).length;
    return { cap, pitch: count > fit ? avail / count : 0 };
  }

  buildRail() {
    const plan = this.railPlan();
    const key = plan.cap + '|' + (plan.pitch ? plan.pitch.toFixed(2) : '');
    if (key === this.railKey) return;
    this.railKey = key;
    this.resetWave();
    this.listEl.empty();
    this.railIdx = [];
    this.railPos = new Map();
    this.centers = null;
    this.listEl.toggleClass('is-dense', !!plan.pitch);
    if (plan.pitch) this.listEl.style.setProperty('--gg-rail-pitch', plan.pitch + 'px');
    else this.listEl.style.removeProperty('--gg-rail-pitch');
    this.headings.forEach((h, i) => {
      if (h.level > plan.cap) return;
      this.railPos.set(i, this.railIdx.length);
      this.railIdx.push(i);
      const item = this.listEl.createEl('button', {
        cls: 'gg-outline-item',
        attr: { type: 'button', tabindex: '-1' },
      });
      item.createSpan({ cls: 'gg-outline-tick' });
      // Not aria-label: Obsidian's tooltip system triggers off that
      // attribute, and a tooltip on every dash fights the preview card.
      // A visually hidden child names the button just as well.
      item.createSpan({ cls: 'gg-outline-label', text: h.heading });
    });
    const prev = this.activeIndex;
    this.activeIndex = -2;
    if (prev !== -1) this.setActive(prev);
    // 导轨重建了（窗格高度变了）：搜索中的匹配标记补回去
    if (this.query) this.markRail();
  }

  /** 合并到下一帧：重建导轨（手机上面板开着时导轨藏着，收起再建）、手机面板对齐可见区域 */
  queueLayout() {
    if (this.layoutRaf) return;
    this.layoutRaf = window.requestAnimationFrame(() => {
      this.layoutRaf = 0;
      if (!(this.mobile && this.expanded) && this.headings.length >= this.plugin.settings.minHeadings) this.buildRail();
      this.layoutMobile();
    });
  }

  /**
   * 手机上面板顶在标题栏下面，底边让开底部导航栏、键盘（可见区域），高度用样式跟着缩。
   * 键盘弹出时有的系统缩窗口、有的只缩可见区域（visualViewport），两种都算
   */
  layoutMobile() {
    if (!this.mobile || !this.expanded || this.docked()) return;
    const host = this.view.contentEl.getBoundingClientRect();
    let top = 8;
    const head = this.view.headerEl && this.view.headerEl.getBoundingClientRect();
    if (head && head.height && head.bottom > host.top) top = Math.max(top, head.bottom - host.top + 8);
    let edge = host.bottom;
    const vv = window.visualViewport;
    if (vv) edge = Math.min(edge, vv.offsetTop + vv.height);
    for (const bar of document.querySelectorAll('.mobile-navbar, .mobile-toolbar')) {
      const r = bar.getBoundingClientRect();
      if (r.height && r.top < edge && r.bottom > host.top + top) edge = Math.min(edge, r.top);
    }
    this.el.style.setProperty('--gg-m-top', top + 'px');
    this.el.style.setProperty('--gg-m-bottom', Math.max(8, host.bottom - edge + 8) + 'px');
  }

  /** 标题在导轨上对应哪条短横：它自己，或者被省掉时它上面最近一条放上去的标题 */
  railItemFor(index) {
    for (let i = index; i >= 0; i--) {
      const k = this.railPos.get(i);
      if (k !== undefined) return k;
    }
    return -1;
  }

  /** 每条短横的中心（相对导轨顶部），一次读完缓存起来，滑动时不用每条都量 */
  railCenters() {
    if (!this.centers) {
      const items = this.listEl.children;
      this.centers = new Float64Array(items.length);
      for (let k = 0; k < items.length; k++) {
        this.centers[k] = items[k].offsetTop + items[k].offsetHeight / 2;
      }
    }
    return this.centers;
  }

  /** 离鼠标最近的短横（点在短横之间的空隙里也算点中它） */
  nearestItem(mouseY) {
    const c = this.railCenters();
    if (!c.length) return -1;
    const y = mouseY - this.listEl.getBoundingClientRect().top;
    let lo = 0;
    let hi = c.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (c[mid] < y) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0 && Math.abs(c[lo - 1] - y) <= Math.abs(c[lo] - y)) lo--;
    return lo;
  }

  /* ---------------- The expanded panel ---------------- */

  /** One row per heading, indented by level. Indentation is normalized
      to the shallowest heading present, so a note written entirely in
      H2 is not indented for nothing. Headings deeper than the level cap
      are left out of the panel — their dash still marks the spot. */
  buildPanel() {
    const base = this.headings.reduce((m, h) => Math.min(m, h.level), 6);
    const cap = base + this.plugin.settings.panelMaxLevel - 1;
    let shown = 0;
    let math = false;
    const stack = [];
    this.parentOf.clear();

    this.headings.forEach((h, i) => {
      if (h.level > cap) return;
      const depth = h.level - base;
      while (stack.length && this.headings[stack[stack.length - 1]].level >= h.level) stack.pop();
      this.parentOf.set(i, stack.length ? stack[stack.length - 1] : -1);
      stack.push(i);
      const row = this.panelListEl.createEl('button', {
        cls: 'gg-outline-row',
        attr: { type: 'button', 'data-depth': String(Math.min(depth, 3)) },
      });
      row.dataset.level = String(depth);
      row.dataset.h = String(h.level);
      const arrow = row.createSpan({ cls: 'gg-outline-arrow' });
      // 折叠箭头用图标（以前是 9px 的 ▸ 字符，太小不好点）；没有子标题的行也留着这个位置，标题文字对齐
      setIcon(arrow, 'chevron-right');
      // 「显示标题级别」开着才加，关着时行里的文字就是标题本身
      if (this.plugin.settings.panelLevelTags) row.createSpan({ cls: 'gg-outline-ltag', text: 'H' + h.level });
      const label = row.createSpan({ cls: 'gg-outline-row-text' });
      if (fillHeading(label, h.heading)) math = true;
      row.style.paddingInlineStart = 8 + depth * INDENT_STEP + 'px';
      row.style.setProperty(
        '--gg-row-delay',
        Math.min(shown, STAGGER_CAP) * STAGGER + 'ms'
      );
      shown++;
      row.addEventListener('mousedown', (e) => e.preventDefault());
      row.addEventListener('click', (e) => {
        e.preventDefault();
        this.jumpTo(i);
      });
      row.addEventListener('mouseenter', () => this.setFocusRow(i));
      // A click toggles one level; a double click opens the whole branch.
      // The double click's own two clicks toggle twice, ending where they
      // started, so it only needs to add the rest.
      arrow.addEventListener('mousedown', (e) => e.preventDefault());
      arrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRow(i);
      });
      arrow.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openBranch(i);
      });
      this.rows.set(i, row);
    });
    for (const [i, p] of this.parentOf) {
      if (p >= 0) this.rows.get(p).addClass('has-children');
    }
    // A note under one single top heading treats it as the title: folding
    // levels count from the headings below it, or every level setting
    // would look the same (that heading is always open as everyone's parent)
    const tops = [...this.parentOf].filter(([, p]) => p < 0).map(([i]) => i);
    this.foldBase = tops.length === 1 && this.rows.get(tops[0]).hasClass('has-children') ? 1 : 0;
    if (math && typeof finishRenderMath === 'function') finishRenderMath();
    this.applyFolding();
  }

  /** Clicking a heading on the rail or in the panel. */
  jumpTo(index) {
    if (this.docked() && this.expanded) {
      for (let i = index; i !== undefined && i >= 0; i = this.parentOf.get(i)) this.manualClosed.delete(i);
      this.anchorRow(index, 1500);
      this.scrollTo(index);
      return;
    }
    if (this.plugin.settings.panelStayOpen && this.expanded) {
      // Stays put until Esc or the command, like the command-opened panel
      this.pinned = true;
      this.cancelClose();
      // Going into a section opens it even if its arrow was clicked shut
      for (let i = index; i !== undefined && i >= 0; i = this.parentOf.get(i)) this.manualClosed.delete(i);
      // The section refolds once the scroll lands; keep the clicked row
      // under the pointer through that
      this.anchorRow(index, 1500);
      this.scrollTo(index);
      return;
    }
    // Collapse first — it can hand focus back to the editor, and that
    // focus change scrolls the caret into view, which would fight the
    // scroll we are about to start.
    this.collapse();
    this.scrollTo(index);
  }

  /* ---------------- Branch folding ---------------- */

  /** Whether a row's children show. Arrows the user clicked win; then, with
      "expand only the current heading", the heading on screen opens all the
      way along with the headings above it, and everything else folds down
      to the configured depth — so a note with a single top heading still
      folds. */
  /** 行前面有没有折叠箭头：「标题折叠箭头」或「只展开当前标题」开着任一个 */
  folds() {
    return !!(this.plugin.settings.panelFoldArrows || this.plugin.settings.panelFocusBranch);
  }

  isOpen(index) {
    if (this.manualClosed.has(index)) return false;
    if (this.manualOpen.has(index)) return true;
    if (!this.plugin.settings.panelFocusBranch) return true;
    const active = this.rowIndexFor(this.activeIndex, true);
    if (active >= 0 && (index === active || this.isDescendant(index, active) || this.isDescendant(active, index))) return true;
    const depth = Number(this.rows.get(index)?.dataset.level || 0) - (this.foldBase || 0);
    return depth < this.plugin.settings.panelOtherDepth - 1;
  }

  isVisible(index) {
    for (let p = this.parentOf.get(index); p !== undefined && p >= 0; p = this.parentOf.get(p)) {
      if (!this.isOpen(p)) return false;
    }
    return true;
  }

  /** Remember where a row is on screen so the next refold can put it back
      there: the panel is centered on the rail, so rows appearing or going
      away would otherwise slide everything under the pointer. */
  anchorRow(index, ms) {
    const row = this.rows.get(index);
    if (!row || !this.expanded) return;
    this.anchor = { index, top: row.getBoundingClientRect().top, until: Date.now() + ms };
  }

  /** Shift the panel so the anchored row is back where it was, without
      letting the panel leave the pane. */
  restoreAnchor() {
    const a = this.anchor;
    if (!a || Date.now() > a.until || !this.expanded) return;
    const row = this.rows.get(a.index);
    if (!row || row.hasClass('is-folded-away')) return;
    const delta = a.top - row.getBoundingClientRect().top;
    if (Math.abs(delta) < 0.5) return;
    const host = this.view.contentEl.getBoundingClientRect();
    const box = this.panelEl.getBoundingClientRect();
    const room = { up: box.top - host.top - 8, down: host.bottom - 8 - box.bottom };
    const move = Math.max(-room.up, Math.min(room.down, delta));
    this.panelShift = (this.panelShift || 0) + move;
    // Jump there at once: a gliding panel would still be moving when the
    // second click of a double click lands
    this.panelEl.addClass('is-anchored');
    this.panelEl.style.setProperty('--gg-panel-shift', this.panelShift + 'px');
  }

  applyFolding() {
    const folding = this.folds();
    for (const [i, row] of this.rows) {
      row.toggleClass('is-folded-away', folding && !this.isVisible(i));
      const open = this.isOpen(i);
      row.toggleClass('is-open', open);
      const arrow = row.firstElementChild;
      if (folding && row.hasClass('has-children')) arrow.setAttr('aria-label', t(open ? 'collapseRow' : 'expandRow'));
      else arrow.removeAttribute('aria-label');
    }
    this.restoreAnchor();
  }

  toggleRow(index) {
    this.anchorRow(index, 400);
    const open = this.isOpen(index);
    this.manualOpen.delete(index);
    this.manualClosed.delete(index);
    // Only record it when it differs from what folding would do anyway
    if (open) this.manualClosed.add(index);
    else this.manualOpen.add(index);
    if (this.isOpen(index) === open) {
      this.manualOpen.delete(index);
      this.manualClosed.delete(index);
    }
    this.applyFolding();
  }

  openBranch(index) {
    this.anchorRow(index, 400);
    for (const [i] of this.rows) {
      if (i !== index && !this.isDescendant(i, index)) continue;
      this.manualClosed.delete(i);
      this.manualOpen.add(i);
    }
    this.applyFolding();
  }

  isDescendant(index, ancestor) {
    for (let p = this.parentOf.get(index); p !== undefined && p >= 0; p = this.parentOf.get(p)) {
      if (p === ancestor) return true;
    }
    return false;
  }

  expand(pinned) {
    this.cancelDwell();
    this.cancelClose();
    if (this.headings.length < this.plugin.settings.minHeadings) return;
    if (pinned) this.pinned = true;
    if (this.expanded) {
      if (pinned) this.panelEl.focus();
      return;
    }
    this.expanded = true;

    // The panel is centered on the rail, which is centered on the pane,
    // so capping it at 80% of the pane keeps both ends on screen.
    const host = this.view.contentEl.getBoundingClientRect();
    // 常驻时面板占满笔记的高度（样式里定），不按 80% 限高
    // 手机上高度由样式按可见区域定（键盘弹出会跟着缩），不写死像素
    if (this.docked() || this.mobile) this.panelEl.style.removeProperty('max-height');
    else this.panelEl.style.maxHeight = Math.round(host.height * 0.8) + 'px';

    this.hidePreview();
    this.panelShift = 0;
    this.anchor = null;
    this.panelEl.removeClass('is-anchored');
    this.panelEl.style.removeProperty('--gg-panel-shift');
    this.el.addClass('gg-outline-is-expanded');
    if (this.mobile && !this.docked()) {
      this.layoutMobile();
      document.addEventListener('pointerdown', this.onOutside, true);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', this.onViewport);
        window.visualViewport.addEventListener('scroll', this.onViewport);
      }
    }
    // Resting on a dash is what opened this, so that dash is what the
    // user is looking at — it takes the highlight. The command path has
    // no crest, so it falls back to the section currently on screen.
    // 常驻时不抢键盘高亮，也不拦 Esc（它一直开着，Esc 留给编辑器）
    if (this.docked()) return;
    const start = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    this.setFocusRow(this.rowIndexFor(start), true);
    document.addEventListener('keydown', this.onDocKey, true);
    if (pinned) {
      this.panelEl.focus();
      // 命令执行完 Obsidian 会把焦点还给编辑器：下一帧还不在面板里就再拿回来（方向键、打字才进得了面板）
      const refocus = () => {
        if (this.expanded && !this.panelEl.contains(document.activeElement)) this.panelEl.focus();
      };
      window.requestAnimationFrame(refocus);
      window.setTimeout(refocus, 60);
      window.setTimeout(refocus, 150);
    }
  }

  collapse() {
    this.cancelDwell();
    this.cancelClose();
    if (!this.expanded) return;
    // 常驻展开：标题够数时不收（命令、Esc、点标题、移开鼠标都不收）
    if (this.docked() && this.headings.length >= this.plugin.settings.minHeadings) return;
    this.expanded = false;
    this.pinned = false;
    this.el.removeClass('gg-outline-is-expanded');
    this.clearSearch();
    this.setFocusRow(-1);
    document.removeEventListener('keydown', this.onDocKey, true);
    this.removeMobileListeners();
    if (this.panelEl.contains(document.activeElement)) {
      // Only when we took focus (pinned mode) — otherwise blurring here
      // would yank the caret out of an editor we never touched.
      // 手机上只让搜索框失焦（收起键盘），不把焦点给正文：那样会把键盘又弹出来
      if (this.mobile) document.activeElement.blur();
      else {
        this.panelEl.blur();
        if (this.view.editor) this.view.editor.focus();
      }
    }
    // 面板开着时没重建导轨（藏着），收起后按现在的高度补上
    if (this.mobile) this.queueLayout();
  }

  removeMobileListeners() {
    document.removeEventListener('pointerdown', this.onOutside, true);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.onViewport);
      window.visualViewport.removeEventListener('scroll', this.onViewport);
    }
  }

  togglePinned() {
    // 常驻时命令改成把键盘焦点放进大纲，用方向键挑标题
    if (this.docked() && this.expanded) {
      this.setFocusRow(this.rowIndexFor(this.activeIndex), true);
      this.panelEl.focus();
      return;
    }
    if (this.expanded && this.pinned) this.collapse();
    else this.expand(true);
  }

  /** Re-arm on every real move, so scrubbing the wave never expands —
      only actually coming to rest does. */
  trackDwell(e) {
    if (this.expanded) return;
    if (this.plugin.settings.expandMode !== 'dwell') return;
    const a = this.dwellAnchor;
    if (
      a &&
      Math.abs(e.clientX - a.x) < DWELL_TOL &&
      Math.abs(e.clientY - a.y) < DWELL_TOL
    ) {
      return;
    }
    this.dwellAnchor = { x: e.clientX, y: e.clientY };
    window.clearTimeout(this.dwellTimer);
    this.dwellTimer = window.setTimeout(
      () => this.expand(false),
      this.plugin.settings.dwellDelay
    );
  }

  cancelDwell() {
    window.clearTimeout(this.dwellTimer);
    this.dwellTimer = 0;
    this.dwellAnchor = null;
  }

  cancelClose() {
    window.clearTimeout(this.closeTimer);
    this.closeTimer = 0;
  }

  /** Leaving either half starts a short close timer; entering the other
      half cancels it, which is what lets you cross the gap between the
      dashes and the panel without it snapping shut. */
  onLeave(fromRail) {
    this.cancelDwell();
    if (fromRail) this.resetWave();
    if (!this.expanded || this.pinned) return;
    this.cancelClose();
    this.closeTimer = window.setTimeout(() => this.collapse(), CLOSE_GRACE);
  }

  /** The panel row standing in for a heading: itself, or the nearest
      shallower heading above it when the depth cap left it out. */
  rowIndexFor(index, ignoreFolding) {
    let i = index;
    while (i >= 0 && !this.rows.has(i)) i--;
    if (ignoreFolding) return i;
    // Folded away: the nearest ancestor that is showing stands in for it
    while (i >= 0 && this.rows.get(i).hasClass('is-folded-away')) i = this.parentOf.get(i);
    return i;
  }

  setFocusRow(index, scrollIntoView) {
    const prev = this.rows.get(this.focusIndex);
    if (prev && index !== this.focusIndex) prev.removeClass('is-focus');
    this.focusIndex = index;
    const row = this.rows.get(index);
    if (!row) return;
    row.addClass('is-focus');
    if (scrollIntoView) this.revealRow(row);
  }

  /** Keep a row inside the panel's own viewport. scrollIntoView would
      also scroll every scrollable ancestor, including the editor. */
  revealRow(row) {
    const p = this.panelEl;
    // 顶上的搜索框贴着面板顶端不动：行要露在它下面
    const head = this.searchEl ? this.searchEl.offsetHeight : 0;
    const top = row.offsetTop - head;
    const bottom = row.offsetTop + row.offsetHeight;
    if (top < p.scrollTop) p.scrollTop = top;
    else if (bottom > p.scrollTop + p.clientHeight) {
      p.scrollTop = bottom - p.clientHeight;
    }
  }

  moveFocus(step) {
    const keys = Array.from(this.rows.keys()).filter((i) => !this.rows.get(i).hasClass('is-folded-away'));
    if (!keys.length) return;
    const at = keys.indexOf(this.focusIndex);
    const next =
      at < 0
        ? step > 0
          ? 0
          : keys.length - 1
        : Math.max(0, Math.min(keys.length - 1, at + step));
    this.setFocusRow(keys[next], true);
  }

  /* Escape is handled document-wide so it also closes a hover-expanded
     panel; the arrows stay on the panel so they only fire once it has
     focus, i.e. never while the user is typing in the editor. */
  handleDocKey(e) {
    if (e.key !== 'Escape' || !this.expanded) return;
    e.preventDefault();
    e.stopPropagation();
    // 有搜索词：第一次 Esc 只清空搜索
    if (this.query) {
      this.clearSearch();
      this.searchInput.focus();
      return;
    }
    this.collapse();
  }

  handlePanelKey(e) {
    // 搜索框自己的按键在 handleSearchKey 里处理
    if (e.target === this.searchInput) return;
    // 面板拿着焦点时直接打字：转到搜索框里接着输（中文输入法按下的第一个键是 Process）
    if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || e.key === 'Process') && e.key !== ' ') {
      this.searchInput.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.moveFocus(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' && this.focusIndex >= 0) {
      e.preventDefault();
      this.jumpTo(this.focusIndex);
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && this.folds()) {
      const row = this.rows.get(this.focusIndex);
      if (!row || !row.hasClass('has-children')) return;
      e.preventDefault();
      if ((e.key === 'ArrowRight') !== this.isOpen(this.focusIndex)) this.toggleRow(this.focusIndex);
    }
  }

  /* ---------------- Search ---------------- */

  /** 放大镜、命令「搜索标题」：打开面板（固定住），光标进搜索框 */
  openSearch() {
    if (this.headings.length < this.plugin.settings.minHeadings) return;
    if (!this.expanded) this.expand(true);
    this.pinned = true;
    this.cancelClose();
    const focus = () => {
      if (!this.expanded || document.activeElement === this.searchInput) return;
      this.searchInput.focus();
      this.searchInput.select();
    };
    // 每次打开都全选原来的词：接着打字就是换一个词搜
    this.searchInput.focus();
    this.searchInput.select();
    // 从命令面板、快捷键执行完命令后，Obsidian 会把焦点还给编辑器：下一帧再放回来，不然打的字进了正文
    window.requestAnimationFrame(focus);
    window.setTimeout(focus, 60);
    window.setTimeout(focus, 150);
  }

  setQuery(value) {
    this.query = value.trim();
    // 连着打字（手机输入法一次上好几个字）合并到下一帧搜一次
    if (this.searchRaf) return;
    this.searchRaf = window.requestAnimationFrame(() => {
      this.searchRaf = 0;
      this.runSearch();
    });
  }

  clearSearch() {
    if (this.searchRaf) {
      window.cancelAnimationFrame(this.searchRaf);
      this.searchRaf = 0;
    }
    if (!this.query && !this.searchInput.value && !this.el.hasClass('gg-outline-searching')) return;
    this.searchInput.value = '';
    this.query = '';
    this.runSearch();
  }

  /**
   * 按搜索词筛标题：所有层级都搜（面板「展开到第几级」以外的小标题也算），只留匹配的和它们的上级（浅色、给上下文）；
   * 搜的时候不管折叠，清空后原来的面板原样回来。导轨上匹配的短横标成强调色
   */
  runSearch() {
    const terms = searchTerms(this.query);
    const on = terms.length > 0;
    this.el.toggleClass('gg-outline-searching', on);
    this.matchList = [];
    this.resultRows = new Map();
    this.markRail(true);
    if (this.noneEl) this.noneEl.toggle(false);
    if (!on) {
      this.searchCount.setText('');
      this.resultFocus = -1;
      return;
    }
    const cache = this.searchRows();
    const hits = new Map();
    const keep = new Set();
    this.headings.forEach((h, i) => {
      const r = matchRanges(h.heading, terms);
      if (!r) return;
      hits.set(i, r);
      for (let p = i; p >= 0 && !keep.has(p); p = cache.parent[p]) keep.add(p);
    });
    // 每个标题一行，第一次搜时建好；之后每次只改显示、隐藏和高亮，变了的行才动（标题多时每打一个字都重建会卡）
    this.headings.forEach((h, i) => {
      const c = cache.rows[i];
      const hit = hits.get(i);
      const state = !keep.has(i) ? '' : hit ? 'm' + JSON.stringify(hit) : 'c';
      if (state !== c.state) {
        c.state = state;
        c.row.toggle(state !== '');
        c.row.toggleClass('is-match', !!hit);
        c.row.toggleClass('is-context', state === 'c');
        c.row.removeClass('is-focus');
        if (state !== '') {
          const was = c.marked;
          if (hit) {
            c.label.empty();
            fillMarked(c.label, h.heading, hit);
            c.marked = true;
          } else if (was) {
            c.label.empty();
            fillHeading(c.label, h.heading);
            c.marked = false;
          }
        }
      }
      if (hit) this.matchList.push(i);
      if (state !== '') this.resultRows.set(i, c.row);
    });
    this.markRail();
    this.searchCount.setText(hits.size ? t('searchCount').replace('{n}', String(hits.size)) : '');
    if (!hits.size) {
      if (!this.noneEl) this.noneEl = this.resultsEl.createDiv({ cls: 'gg-outline-search-none', text: t('searchNone') });
      this.noneEl.toggle(true);
    }
    this.resultFocus = -1;
    this.setResultFocus(this.matchList.length ? 0 : -1);
  }

  /** 搜索结果用的行：每个标题一行（先藏着），连同上级关系一起缓存；标题结构变了才重建 */
  searchRows() {
    if (this.resultCache) return this.resultCache;
    this.resultsEl.empty();
    this.noneEl = null;
    const base = this.headings.reduce((m, h) => Math.min(m, h.level), 6);
    const parent = [];
    const stack = [];
    const rows = [];
    this.headings.forEach((h, i) => {
      while (stack.length && this.headings[stack[stack.length - 1]].level >= h.level) stack.pop();
      parent[i] = stack.length ? stack[stack.length - 1] : -1;
      stack.push(i);
      const depth = h.level - base;
      const row = this.resultsEl.createEl('button', {
        cls: 'gg-outline-row gg-outline-result',
        attr: { type: 'button', 'data-depth': String(Math.min(depth, 3)), 'data-h': String(h.level) },
      });
      row.style.paddingInlineStart = 8 + depth * INDENT_STEP + 'px';
      row.toggle(false);
      if (this.plugin.settings.panelLevelTags) row.createSpan({ cls: 'gg-outline-ltag', text: 'H' + h.level });
      const label = row.createSpan({ cls: 'gg-outline-row-text' });
      fillHeading(label, h.heading);
      row.addEventListener('mousedown', (e) => e.preventDefault());
      row.addEventListener('click', (e) => {
        e.preventDefault();
        this.jumpTo(i);
      });
      row.addEventListener('mouseenter', () => {
        const k = this.matchList.indexOf(i);
        if (k >= 0) this.setResultFocus(k);
      });
      rows.push({ row, label, state: '', marked: false });
    });
    this.resultCache = { rows, parent };
    return this.resultCache;
  }

  /** 导轨上匹配的短横标成强调色；clear 只清掉 */
  markRail(clear) {
    for (const item of this.listEl.querySelectorAll('.gg-outline-item.is-match')) item.removeClass('is-match');
    if (clear || !this.query) return;
    const items = this.listEl.children;
    for (const i of this.matchList) {
      const k = this.railItemFor(i);
      if (k >= 0 && items[k]) items[k].addClass('is-match');
    }
  }

  setResultFocus(k) {
    // 结果行是复用的：记住上一次高亮的那行，换词搜时也能清掉
    if (this.resultFocusRow) this.resultFocusRow.removeClass('is-focus');
    this.resultFocusRow = null;
    this.resultFocus = k;
    const row = this.resultRows?.get(this.matchList[k]);
    if (!row) return;
    row.addClass('is-focus');
    this.resultFocusRow = row;
    this.revealRow(row);
  }

  /** 搜索框里：↓/↑ 在匹配的标题间挪（跳过浅色的上级），回车跳过去；Esc 先清空，没字了再关面板（常驻时把焦点还给正文） */
  handleSearchKey(e) {
    if (e.isComposing) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      if (this.query) {
        const n = this.matchList.length;
        if (n) this.setResultFocus(Math.max(0, Math.min(n - 1, this.resultFocus + step)));
      } else {
        this.moveFocus(step);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const index = this.query ? this.matchList[this.resultFocus] : this.focusIndex;
      if (index !== undefined && index >= 0) this.jumpTo(index);
    } else if (e.key === 'Escape') {
      // 悬停 / 命令打开的面板：document 上的 Esc 处理会先收到（先清空、再关）；常驻时没有它，在这里处理
      if (!this.docked()) return;
      e.preventDefault();
      e.stopPropagation();
      if (this.query) this.clearSearch();
      else if (this.view.editor) this.view.editor.focus();
    }
  }

  /* ---------------- The wave ---------------- */

  queueWave(e) {
    this.lastY = e.clientY;
    this.trackDwell(e);
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.wave(this.lastY);
    });
  }

  /** 只改鼠标附近（3σ 以内）的短横，加上上一帧鼓起来、这一帧要回落的那些；
      以前每动一下要量、要改全部短横，标题一多（几百个）就卡 */
  wave(mouseY) {
    const items = this.listEl.children;
    const c = this.railCenters();
    if (!c.length) return;
    const y = mouseY - this.listEl.getBoundingClientRect().top;
    const reach = SIGMA * 3;
    const next = new Set();
    const k = this.nearestItem(mouseY);
    const nearest = k;
    for (let i = k; i >= 0 && y - c[i] <= reach; i--) next.add(i);
    for (let i = k + 1; i < c.length && c[i] - y <= reach; i++) next.add(i);
    for (const i of this.boosted) {
      if (next.has(i) || !items[i]) continue;
      const tick = items[i].firstChild;
      tick.style.width = '';
      tick.style.height = '';
    }
    for (const i of next) {
      const dy = y - c[i];
      const boost = Math.exp(-(dy * dy) / (2 * SIGMA * SIGMA));
      const tick = items[i].firstChild;
      tick.style.width = BASE_W + MAX_EXTRA * boost + 'px';
      tick.style.height = BASE_H + MAX_EXTRA_H * boost + 'px';
    }
    this.boosted = next;

    if (nearest !== this.crest) {
      if (this.crest >= 0 && items[this.crest]) {
        items[this.crest].removeClass('is-crest');
      }
      this.crest = nearest;
      this.hoverIndex = nearest >= 0 ? this.railIdx[nearest] : -1;
      if (nearest >= 0) {
        items[nearest].addClass('is-crest');
        if (this.expanded) {
          // The panel already shows every heading, so the rail scrubs it
          // instead of stacking a preview card on top of it.
          this.setFocusRow(this.rowIndexFor(this.hoverIndex), true);
        } else if (this.plugin.settings.showPreview && !this.mobile) {
          this.showPreview(this.hoverIndex, items[nearest]);
        }
      }
    }
  }

  resetWave() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    const items = this.listEl.children;
    for (const i of this.boosted || []) {
      if (!items[i]) continue;
      const tick = items[i].firstChild;
      tick.style.width = '';
      tick.style.height = '';
    }
    this.boosted = new Set();
    if (this.crest >= 0 && items[this.crest]) items[this.crest].removeClass('is-crest');
    this.crest = -1;
    this.hoverIndex = -1;
    this.hidePreview();
  }

  /* ---------------- Scroll plumbing ---------------- */

  attachScroll() {
    const s = this.scroller();
    if (!s) return;
    this.scrollEl = s;
    s.addEventListener('scroll', this.onScroll, { passive: true });
  }

  detachScroll() {
    if (this.scrollEl) this.scrollEl.removeEventListener('scroll', this.onScroll);
    this.scrollEl = null;
  }

  /** Scroller offset of a document line in editing mode.

      CM6 reports block positions relative to the top of the *document*,
      while scrollTop is relative to the top of the *scroller* — and
      Obsidian pads the scroller by --file-margins (32px by default), so
      the two origins are not the same. Measuring the gap rather than
      assuming it is zero is what keeps this honest across themes.

      (Reading mode uses line-based APIs instead — its DOM is
      virtualized, so pixel positions are unreliable there.) */
  lineTop(line) {
    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return null;
    return this.blockTop(cm, line, this.docOrigin(cm, s));
  }

  /** Distance between CM6's document origin and the scroller's scroll
      origin. One forced layout read, so callers walking every heading
      hoist it out of the loop. */
  docOrigin(cm, s) {
    const docTop =
      typeof cm.documentTop === 'number'
        ? cm.documentTop
        : cm.contentDOM.getBoundingClientRect().top;
    return docTop - s.getBoundingClientRect().top + s.scrollTop;
  }

  blockTop(cm, line, origin) {
    try {
      const pos = cm.state.doc.line(line + 1).from;
      return cm.lineBlockAt(pos).top + origin;
    } catch (e) {
      return null;
    }
  }

  scrollTo(index) {
    const h = this.headings[index];
    if (!h) return;
    const line = h.position.start.line;

    if (this.view.getMode() === 'preview') {
      // The preview virtualizes its DOM, so a pixel position only
      // exists while the target section is rendered. Prefer a smooth
      // pixel scroll when it is; otherwise fall back to Obsidian's
      // line-based applyScroll, which always works (but jumps).
      const s = this.scroller();
      const els = s ? Array.from(s.querySelectorAll('[data-heading]')) : [];
      const matches = els.filter(
        (el) => el.getAttribute('data-heading') === h.heading
      );
      if (s && matches.length === 1) {
        const top =
          matches[0].getBoundingClientRect().top -
          s.getBoundingClientRect().top +
          s.scrollTop;
        s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        this.view.currentMode.applyScroll(line);
      }
      this.setActive(index);
      return;
    }

    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return;

    // Editing mode is virtualized too: a line that has never been
    // rendered carries an *estimated* height, so a target computed from
    // the height map drifts by however much unmeasured content lies in
    // between — and drifts further mid-flight, as the scroll measures
    // those lines on the way past and rewrites the map underneath it.
    //
    // cm.viewport is the range CodeMirror has actually rendered. Inside
    // it every height is measured rather than estimated, so our own
    // arithmetic is exact and we can glide. Outside it, nothing we
    // compute is trustworthy, so CodeMirror places it instead — it
    // re-measures until its own target is stable. That lands exactly
    // but instantly, because it defers the scroll to its next measure
    // pass and there is no reliable moment to intercept.
    let pos = null;
    try {
      pos = cm.state.doc.line(line + 1).from;
    } catch (e) {
      pos = null;
    }
    const vp = cm.viewport;
    const rendered = pos != null && vp && pos >= vp.from && pos <= vp.to;

    if (rendered) {
      const top = this.blockTop(cm, line, this.docOrigin(cm, s));
      if (top != null) {
        s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        this.setActive(index);
        return;
      }
    }

    const effect = this.scrollEffect(cm, line);
    if (effect) {
      cm.dispatch({ effects: effect });
    } else {
      const top = this.lineTop(line);
      if (top == null) return;
      s.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    this.setActive(index);
  }

  /** CM6's scrollIntoView effect for a document line, or null if this
      build exposes neither route to it. */
  scrollEffect(cm, line) {
    const V = EditorView || cm.constructor;
    if (!V || typeof V.scrollIntoView !== 'function') return null;
    try {
      return V.scrollIntoView(cm.state.doc.line(line + 1).from, { y: 'start' });
    } catch (e) {
      return null;
    }
  }

  syncActive() {
    if (this.view.getMode() === 'preview') {
      // getScroll() reports the line at the top of the preview
      // viewport — immune to DOM virtualization.
      const line = this.view.currentMode.getScroll();
      if (line == null) return;
      let next = -1;
      for (let i = 0; i < this.headings.length; i++) {
        if (this.headings[i].position.start.line <= line + 0.5) next = i;
        else break;
      }
      this.setActive(next);
      return;
    }

    const cm = this.view.editor && this.view.editor.cm;
    const s = this.scroller();
    if (!cm || !s) return;
    const origin = this.docOrigin(cm, s);
    const probe = s.scrollTop + 40;
    let next = -1;
    for (let i = 0; i < this.headings.length; i++) {
      const top = this.blockTop(cm, this.headings[i].position.start.line, origin);
      if (top == null) continue;
      if (top <= probe) next = i;
      else break;
    }
    this.setActive(next);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    const prevRow = this.rows.get(this.activeIndex);
    if (prevRow) prevRow.removeClass('is-active');
    this.activeIndex = index;
    const items = this.listEl.children;
    const on = index >= 0 ? this.railItemFor(index) : -1;
    for (const el of this.listEl.querySelectorAll('.gg-outline-item.is-active')) {
      if (el !== items[on]) el.removeClass('is-active');
    }
    if (on >= 0 && items[on]) items[on].addClass('is-active');
    const row = this.rows.get(index);
    if (row) row.addClass('is-active');
    if (this.plugin.settings.panelFocusBranch) this.applyFolding();
    // Keep the section being read in view while the panel stays open
    if (this.expanded) {
      const shown = this.rows.get(this.rowIndexFor(index));
      if (shown) this.revealRow(shown);
    }
  }

  /* ---------------- Preview ---------------- */

  /** Text between this heading and the next one, trimmed for display. */
  sectionPreview(index) {
    const editor = this.view.editor;
    if (!editor) return '';
    const start = this.headings[index].position.start.line + 1;
    const end = index + 1 < this.headings.length
      ? this.headings[index + 1].position.start.line
      : editor.lineCount();
    const lines = [];
    for (let l = start; l < end && lines.join(' ').length < 400; l++) {
      lines.push(editor.getLine(l));
    }
    const text = plainText(lines.join('\n'));
    const max = this.plugin.settings.previewChars;
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  showPreview(index, anchor) {
    const body = this.sectionPreview(index);
    this.previewEl.empty();
    const title = this.previewEl.createDiv({ cls: 'gg-outline-preview-title' });
    if (fillHeading(title, this.headings[index].heading) && typeof finishRenderMath === 'function') finishRenderMath();
    this.previewEl.createDiv({
      cls: 'gg-outline-preview-body',
      text: body || t('previewEmpty'),
    });
    // Center on the crest dash, clamped so the card never leaves the pane.
    const host = this.view.contentEl.getBoundingClientRect();
    const railTop = this.el.getBoundingClientRect().top - host.top;
    const half = this.previewEl.offsetHeight / 2;
    let top = anchor.offsetTop + anchor.offsetHeight / 2;
    top = Math.max(half - railTop + 8, Math.min(top, host.height - railTop - half - 8));
    this.previewEl.style.top = top + 'px';
    this.el.addClass('gg-outline-has-preview');
  }

  hidePreview() {
    this.el.removeClass('gg-outline-has-preview');
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.layoutRaf) cancelAnimationFrame(this.layoutRaf);
    if (this.styleRaf) cancelAnimationFrame(this.styleRaf);
    if (this.searchRaf) cancelAnimationFrame(this.searchRaf);
    this.removeMobileListeners();
    if (this.resizeObs) this.resizeObs.disconnect();
    this.cancelDwell();
    this.cancelClose();
    document.removeEventListener('keydown', this.onDocKey, true);
    this.detachScroll();
    this.view.contentEl.removeClass('gg-outline-docked-host');
    this.el.remove();
  }
}

module.exports = class GogogaOutline extends Plugin {
  async onload() {
    resolveLocale();
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.rails = new Map();
    // Headings with $formulas$ render them; MathJax loads once for the app
    if (typeof loadMathJax === 'function') {
      loadMathJax().then(() => {
        for (const rail of this.rails.values()) rail.refresh(true);
      }, () => {});
    }

    this.addSettingTab(new GogogaOutlineSettings(this.app, this));

    this.addCommand({
      id: 'toggle-global-outline',
      name: t('commandToggleOutline'),
      checkCallback: (checking) => {
        const rail = this.activeRail();
        if (!rail || rail.headings.length < this.settings.minHeadings) return false;
        if (!checking) rail.togglePinned();
        return true;
      },
    });

    this.addCommand({
      id: 'search-headings',
      name: t('commandSearch'),
      checkCallback: (checking) => {
        const rail = this.activeRail();
        if (!rail || rail.headings.length < this.settings.minHeadings) return false;
        if (!checking) rail.openSearch();
        return true;
      },
    });

    this.addCommand({
      id: 'toggle-focus-mode',
      name: t('commandToggleFocus'),
      callback: () => this.toggleWriting('focusMode', true),
    });
    this.addCommand({
      id: 'toggle-hover-highlight',
      name: t('commandToggleHover'),
      callback: () => this.toggleWriting('hoverHighlight', true),
    });
    this.applyWriting();
    // Popout windows have their own <body>
    this.registerEvent(this.app.workspace.on('window-open', () => this.applyWriting()));

    const sync = () => this.sync();
    this.registerEvent(this.app.workspace.on('layout-change', sync));
    this.registerEvent(this.app.workspace.on('active-leaf-change', sync));
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        for (const [leaf, rail] of this.rails) {
          if (rail.view.file === file) rail.refresh();
        }
      })
    );
    this.app.workspace.onLayoutReady(sync);
  }

  /** Every window's body, main window included. */
  bodies() {
    const out = [document.body];
    this.app.workspace.iterateAllLeaves((leaf) => {
      const body = leaf.view.containerEl.ownerDocument.body;
      if (!out.includes(body)) out.push(body);
    });
    return out;
  }

  /* Only adds classes for switches that are on. A switch that is off leaves
     the class alone, so Style Settings can still turn the effect on. */
  applyWriting() {
    for (const [key, w] of Object.entries(WRITING)) {
      if (this.settings[key]) for (const body of this.bodies()) body.addClass(w.cls);
    }
  }

  /** Flip from what is actually showing, whoever turned it on. */
  async toggleWriting(key, notify) {
    const w = WRITING[key];
    const next = !document.body.hasClass(w.cls);
    for (const body of this.bodies()) body.toggleClass(w.cls, next);
    this.settings[key] = next;
    await this.saveData(this.settings);
    if (notify) new Notice(t(next ? w.on : w.off), 1500);
  }

  activeRail() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;
    for (const rail of this.rails.values()) {
      if (rail.view === view) return rail;
    }
    return null;
  }

  /** One rail per open markdown pane; drop rails for closed panes. */
  sync() {
    const live = new Set();
    for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
      const view = leaf.view;
      if (!(view instanceof MarkdownView)) continue;
      live.add(leaf);
      const existing = this.rails.get(leaf);
      if (existing && existing.view === view) {
        existing.refresh();
      } else {
        if (existing) existing.destroy();
        this.rails.set(leaf, new Rail(this, view));
      }
    }
    for (const [leaf, rail] of this.rails) {
      if (!live.has(leaf)) {
        rail.destroy();
        this.rails.delete(leaf);
      }
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    for (const rail of this.rails.values()) {
      rail.apply();
      rail.refresh(true);
    }
  }

  onunload() {
    for (const [key, w] of Object.entries(WRITING)) {
      if (this.settings[key]) for (const body of this.bodies()) body.removeClass(w.cls);
    }
    for (const rail of this.rails.values()) rail.destroy();
    this.rails.clear();
  }
};

class GogogaOutlineSettings extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t('sideName'))
      .setDesc(t('sideDesc'))
      .addDropdown((d) =>
        d
          .addOption('right', t('sideRight'))
          .addOption('left', t('sideLeft'))
          .setValue(this.plugin.settings.side)
          .onChange(async (v) => {
            this.plugin.settings.side = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('minHeadingsName'))
      .setDesc(t('minHeadingsDesc'))
      .addSlider((s) =>
        s
          .setLimits(1, 10, 1)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.minHeadings)
          .onChange(async (v) => {
            this.plugin.settings.minHeadings = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('showPreviewName'))
      .setDesc(t('showPreviewDesc'))
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showPreview).onChange(async (v) => {
          this.plugin.settings.showPreview = v;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl('h3', { text: t('globalOutlineHeading') });

    new Setting(containerEl)
      .setName(t('expandModeName'))
      .setDesc(t('expandModeDesc'))
      .addDropdown((d) =>
        d
          .addOption('dwell', t('expandModeDwell'))
          .addOption('hotkey', t('expandModeHotkey'))
          .setValue(this.plugin.settings.expandMode)
          .onChange(async (v) => {
            this.plugin.settings.expandMode = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('dwellDelayName'))
      .setDesc(t('dwellDelayDesc'))
      .addSlider((s) =>
        s
          .setLimits(200, 1000, 50)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.dwellDelay)
          .onChange(async (v) => {
            this.plugin.settings.dwellDelay = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('panelWidthName'))
      .addSlider((s) =>
        s
          .setLimits(180, 320, 10)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.panelWidth)
          .onChange(async (v) => {
            this.plugin.settings.panelWidth = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('panelMaxLevelName'))
      .setDesc(t('panelMaxLevelDesc'))
      .addSlider((s) =>
        s
          .setLimits(1, 6, 1)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.panelMaxLevel)
          .onChange(async (v) => {
            this.plugin.settings.panelMaxLevel = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('dockedName'))
      .setDesc(t('dockedDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelDocked).onChange(async (v) => {
          this.plugin.settings.panelDocked = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t('stayOpenName'))
      .setDesc(t('stayOpenDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelStayOpen).onChange(async (v) => {
          this.plugin.settings.panelStayOpen = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t('focusBranchName'))
      .setDesc(t('focusBranchDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelFocusBranch).onChange(async (v) => {
          this.plugin.settings.panelFocusBranch = v;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    if (this.plugin.settings.panelFocusBranch) {
      new Setting(containerEl)
        .setName(t('otherDepthName'))
        .setDesc(t('otherDepthDesc'))
        .addDropdown((d) =>
          d
            .addOption('1', '1')
            .addOption('2', '2')
            .addOption('3', '3')
            // 「全部」= 6 级：其余标题不再自动折叠，只有手动点的箭头收起
            .addOption('6', t('otherDepthAll'))
            .setValue(String(this.plugin.settings.panelOtherDepth))
            .onChange(async (v) => {
              this.plugin.settings.panelOtherDepth = Number(v);
              await this.plugin.saveSettings();
            })
        );
    }

    new Setting(containerEl)
      .setName(t('foldArrowsName'))
      .setDesc(t('foldArrowsDesc'))
      .addToggle((tg) =>
        tg.setValue(!!this.plugin.settings.panelFoldArrows).onChange(async (v) => {
          this.plugin.settings.panelFoldArrows = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t('wrapName'))
      .setDesc(t('wrapDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelWrap).onChange(async (v) => {
          this.plugin.settings.panelWrap = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t('headingStyleName'))
      .setDesc(t('headingStyleDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelHeadingStyle).onChange(async (v) => {
          this.plugin.settings.panelHeadingStyle = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t('levelTagsName'))
      .setDesc(t('levelTagsDesc'))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.panelLevelTags).onChange(async (v) => {
          this.plugin.settings.panelLevelTags = v;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl('h3', { text: t('writingHeading') });
    containerEl.createEl('p', { text: t('writingDesc'), cls: 'setting-item-description' });

    for (const [key, name, desc] of [
      ['focusMode', 'focusName', 'focusDesc'],
      ['hoverHighlight', 'hoverName', 'hoverDesc'],
    ]) {
      new Setting(containerEl)
        .setName(t(name))
        .setDesc(t(desc))
        .addToggle((tg) =>
          tg.setValue(document.body.hasClass(WRITING[key].cls)).onChange(async (v) => {
            if (v !== document.body.hasClass(WRITING[key].cls)) await this.plugin.toggleWriting(key, false);
          })
        );
    }
  }
}

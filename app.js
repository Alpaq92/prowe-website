// Renders the page from the JSON that Sveltia CMS writes to content/<locale>.json.
// URL: ?lang=en for English (Polish is the default), &m=<slug> for a module page.

const LOCALES = ['pl', 'en'];
const DEFAULT_LOCALE = 'pl';
const THEME_KEY = 'prowe-theme';

const params = new URLSearchParams(location.search);
const lang = LOCALES.includes(params.get('lang')) ? params.get('lang') : DEFAULT_LOCALE;
const slug = params.get('m');

function href(locale, moduleSlug, hash = '') {
  const p = new URLSearchParams();
  if (locale !== DEFAULT_LOCALE) p.set('lang', locale);
  if (moduleSlug) p.set('m', moduleSlug);
  const query = p.toString();
  return (query ? `?${query}` : './') + hash;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== ''));
  return node;
}

// Markdown comes from the site's own editors via the CMS.
function markdown(text) {
  const node = el('div', { class: 'prose' });
  if (text) node.innerHTML = window.marked.parse(text);
  return node;
}

// Polish typesetting keeps one-letter words off the end of a line. Done in code because
// non-breaking spaces typed in the CMS are invisible to editors and get lost.
const glue = (s) => s.replace(/(?<=^|\s)([aiouwz]) /gi, '$1\u00a0');
const deepGlue = (v) => typeof v === 'string' ? glue(v)
  : Array.isArray(v) ? v.map(deepGlue)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepGlue(x)]))
  : v;

// Google reads a description set by script; index.html keeps a static one for crawlers without JS.
const describe = (text) => document.querySelector('meta[name="description"]').setAttribute('content', text);

const badge = (site, mod) => (mod.status === 'soon' ? el('span', { class: 'badge' }, site.soon_label) : null);
const label = (text) => el('p', { class: 'label' }, text);

function moduleCard(site, mod) {
  return el('a', { class: 'card', href: href(lang, mod.slug) },
    el('span', { class: 'card-cat' }, mod.category),
    el('h3', {}, mod.name, badge(site, mod)),
    el('p', {}, mod.summary),
    el('span', { class: 'card-more', 'aria-hidden': 'true' }, '→'));
}

function homePage(site) {
  document.title = `${site.title} | ${site.headline.replace(/\.$/, '')}`;
  describe(site.description);
  return [
    el('section', { class: 'hero' },
      el('h1', {}, site.headline),
      el('p', { class: 'intro' }, site.intro),
      el('a', { class: 'button', href: '#modules' }, site.cta_label)),
    el('section', { class: 'section', id: 'goals' },
      label(site.goals_heading),
      el('ol', { class: 'goals' }, ...site.goals.map((g) =>
        el('li', {}, el('h3', {}, g.title), el('p', {}, g.text))))),
    el('section', { class: 'section', id: 'modules' },
      label(site.modules_heading),
      el('div', { class: 'cards' }, ...site.modules.map((m) => moduleCard(site, m)))),
    el('section', { class: 'section', id: 'stack' },
      label(site.stack_heading),
      el('dl', { class: 'stack' }, ...site.stack.flatMap((row) =>
        [el('dt', {}, row.label), el('dd', {}, row.value)]))),
  ];
}

function modulePage(site, mod) {
  document.title = `${mod.name} | ${site.title}`;
  describe(mod.summary);
  const others = site.modules.filter((m) => m.slug !== mod.slug);
  return [
    el('a', { class: 'back', href: href(lang, null, '#modules') }, `← ${site.back_label}`),
    el('article', { class: 'module' },
      el('p', { class: 'label' }, mod.category),
      el('h1', {}, mod.name, badge(site, mod)),
      el('p', { class: 'intro' }, mod.summary),
      markdown(mod.body)),
    el('section', { class: 'section' },
      label(site.modules_heading),
      el('div', { class: 'cards' }, ...others.map((m) => moduleCard(site, m)))),
  ];
}

// Section links in the header. On a module page they lead back to the home page sections.
function renderNav(site) {
  const sections = [['goals', site.goals_heading], ['modules', site.modules_heading], ['stack', site.stack_heading]];
  document.getElementById('nav').replaceChildren(...sections.map(([id, text]) =>
    el('a', { href: slug ? href(lang, null, `#${id}`) : `#${id}` }, text)));
}

function setupThemeSwitch(site) {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('#theme-switch button')];
  const titles = { system: site.theme_system, light: site.theme_light, dark: site.theme_dark };
  const current = () => root.dataset.theme || 'system';
  const paint = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === current())));

  for (const button of buttons) {
    button.title = titles[button.dataset.value];
    button.setAttribute('aria-label', titles[button.dataset.value]);
    button.onclick = () => {
      const value = button.dataset.value;
      if (value === 'system') delete root.dataset.theme;
      else root.dataset.theme = value;
      // Session only, so the choice stays a consent-free UI preference; "system" needs no entry.
      try {
        if (value === 'system') sessionStorage.removeItem(THEME_KEY);
        else sessionStorage.setItem(THEME_KEY, value);
      } catch (e) { /* storage blocked: this page only */ }
      paint();
    };
  }
  paint();
}

async function render() {
  document.documentElement.lang = lang;
  const other = LOCALES.find((l) => l !== lang);
  const toggle = document.getElementById('lang-switch');
  toggle.textContent = other.toUpperCase();
  toggle.href = href(other, slug);
  toggle.hreflang = other;

  const app = document.getElementById('app');
  const response = await fetch(`content/${lang}.json`);
  if (!response.ok) {
    app.replaceChildren(el('p', {}, `content/${lang}.json: HTTP ${response.status}`));
    return;
  }
  const json = await response.json();
  const site = lang === 'pl' ? deepGlue(json) : json;
  const mod = slug && site.modules.find((m) => m.slug === slug);
  app.replaceChildren(...(mod ? modulePage(site, mod) : homePage(site)));
  document.getElementById('footer').textContent = site.footer;
  renderNav(site);
  setupThemeSwitch(site);
  // The content arrives after load, so the browser's own jump to #section missed it.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

render();

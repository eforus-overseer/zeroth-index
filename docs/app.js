const GROUPS = {
  intents: { label: 'Intents', prefix: 'PIT-I' },
  techniques: { label: 'Techniques', prefix: 'PIT-T' },
  evasions: { label: 'Evasions', prefix: 'PIT-E' },
  inputs: { label: 'Inputs', prefix: 'PIT-N' },
};
const PAGE_SIZE = 9;
const state = { entries: [], category: 'all', query: '', delivery: 'all', limit: PAGE_SIZE, selected: null };

const byId = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function normalized(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function searchText(entry) {
  return normalized([
    entry.code, entry.title, entry.description, entry.delivery,
    ...(entry.aliases || []), ...(entry.ideas || []), ...(entry.examples || []),
    entry.local ? 'local model weights white box' : '',
  ].join(' '));
}

function categoryEntries(category) {
  return state.entries.filter((entry) => entry.category === category);
}

function filteredEntries() {
  const query = normalized(state.query.trim());
  return state.entries.filter((entry) => {
    if (state.category !== 'all' && entry.category !== state.category) return false;
    if (state.delivery === 'local' && !entry.local) return false;
    if (state.delivery !== 'all' && state.delivery !== 'local' && entry.delivery !== state.delivery) return false;
    return !query || searchText(entry).includes(query);
  });
}

function updateCounts() {
  document.querySelectorAll('[data-tab-count]').forEach((node) => {
    const key = node.dataset.tabCount;
    node.textContent = key === 'all' ? String(state.entries.length) : String(categoryEntries(key).length);
  });
  document.querySelectorAll('[data-total-count]').forEach((node) => { node.textContent = String(state.entries.length); });
  document.querySelectorAll('.lens-count').forEach((node) => {
    const group = node.closest('[data-lens]')?.dataset.lens;
    if (group) node.textContent = `${categoryEntries(group).length} entries`;
  });
}

function renderDetail(entry) {
  const panel = byId('entry-detail');
  panel.replaceChildren();
  if (!entry) {
    panel.append(make('p', '', 'Choose an entry to see its definition.'));
    return;
  }

  panel.append(make('p', 'detail-code', `${entry.code} · ${GROUPS[entry.category].label}`));
  panel.append(make('h3', '', entry.title));
  panel.append(make('p', '', entry.description));

  const metadata = make('div', 'detail-meta');
  metadata.append(make('span', '', `Delivery: ${entry.local ? `${entry.delivery}, local access` : entry.delivery || 'unspecified'}`));
  if (entry.local) metadata.append(make('span', '', 'Requires model internals'));
  panel.append(metadata);

  if (entry.aliases?.length) {
    const aliases = make('div', 'detail-block');
    aliases.append(make('h4', '', 'Also known as'));
    aliases.append(make('p', '', entry.aliases.join(' · ')));
    panel.append(aliases);
  }

  if (entry.ideas?.length) {
    const ideas = make('div', 'detail-block');
    ideas.append(make('h4', '', 'Ways to explore it'));
    const list = make('ul');
    entry.ideas.slice(0, 5).forEach((idea) => list.append(make('li', '', idea)));
    ideas.append(list);
    panel.append(ideas);
  }

  if (entry.examples?.length) {
    const details = make('details', 'detail-examples');
    details.append(make('summary', '', `Example prompts (${entry.examples.length})`));
    const list = make('ul');
    entry.examples.forEach((example) => list.append(make('li', '', example)));
    details.append(list);
    panel.append(details);
  }

  const copy = make('button', 'copy-code', 'Copy reference code');
  copy.type = 'button';
  copy.addEventListener('click', () => copyText(entry.code, copy, 'Copied'));
  panel.append(copy);
}

function renderResults() {
  const matches = filteredEntries();
  const list = byId('result-list');
  list.replaceChildren();
  const visible = matches.slice(0, state.limit);
  visible.forEach((entry) => {
    const item = make('li');
    const button = make('button', 'result-row');
    button.dataset.ui = '';
    button.type = 'button';
    button.setAttribute('aria-current', entry.code === state.selected?.code ? 'true' : 'false');
    button.append(make('strong', '', entry.title));
    button.append(make('span', 'entry-code', entry.code));
    button.append(make('span', 'entry-category', `${GROUPS[entry.category].label}${entry.local ? ' · local access' : ''}`));
    button.append(make('span', 'row-arrow', '↘'));
    button.addEventListener('click', () => {
      state.selected = entry;
      renderResults();
      renderDetail(entry);
    });
    item.append(button);
    list.append(item);
  });

  byId('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'}${state.query ? ` matching “${state.query}”` : ''}`;
  byId('show-more').hidden = visible.length >= matches.length;
  byId('empty-state').hidden = matches.length !== 0;

  if (!matches.some((entry) => entry.code === state.selected?.code)) {
    state.selected = matches[0] || null;
    renderResultsSelectionOnly();
    renderDetail(state.selected);
  }
}

function renderResultsSelectionOnly() {
  byId('result-list').querySelectorAll('.result-row').forEach((button) => {
    button.setAttribute('aria-current', button.querySelector('.entry-code')?.textContent === state.selected?.code ? 'true' : 'false');
  });
}

function setCategory(category, scroll = false) {
  state.category = category;
  state.limit = PAGE_SIZE;
  document.querySelectorAll('.pillar-tab').forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderResults();
  if (scroll) byId('index').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setPathSummary() {
  const selected = [...document.querySelectorAll('[data-pillar]')].map((select) => {
    const entry = state.entries.find((candidate) => candidate.code === select.value);
    return { name: select.dataset.pillar, entry };
  }).filter((item) => item.entry);
  byId('path-summary').textContent = selected.map(({ name, entry }) => `${GROUPS[name].label}: ${entry.title} (${entry.code})`).join('\n');
}

function pathText() {
  const selected = [...document.querySelectorAll('[data-pillar]')].map((select) => {
    const entry = state.entries.find((candidate) => candidate.code === select.value);
    return { name: select.dataset.pillar, entry };
  }).filter((item) => item.entry);
  return [
    'Zeroth Index · analyst hypothesis (unvalidated combination)',
    ...selected.map(({ name, entry }) => `${GROUPS[name].label}: ${entry.title} (${entry.code})`),
    '',
    'This combination is a draft for human review. The taxonomy does not assert a relationship between entries.',
    'Source: https://github.com/eforus-overseer/zeroth-index',
  ].join('\n');
}

async function copyText(value, button, confirmation) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = make('textarea');
    field.value = value;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  const original = button.textContent;
  button.textContent = confirmation;
  window.setTimeout(() => { button.textContent = original; }, 1400);
}

function fillPathBuilder() {
  const defaults = {
    intents: 'sensitive_data_exfiltration',
    techniques: 'agent_instruction_file_injection',
    evasions: 'invisible_text',
    inputs: 'indirect_input',
  };
  document.querySelectorAll('[data-pillar]').forEach((select) => {
    const entries = categoryEntries(select.dataset.pillar);
    entries.forEach((entry) => {
      const option = make('option', '', `${entry.title} · ${entry.code}`);
      option.value = entry.code;
      select.append(option);
    });
    const chosen = entries.find((entry) => entry.id === defaults[select.dataset.pillar]) || entries[0];
    if (chosen) select.value = chosen.code;
    select.addEventListener('change', setPathSummary);
  });
  setPathSummary();
}

function bindControls() {
  document.querySelectorAll('.pillar-tab').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category)));
  document.querySelectorAll('[data-lens]').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.lens, true)));
  byId('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    state.limit = PAGE_SIZE;
    renderResults();
  });
  byId('delivery-filter').addEventListener('change', (event) => {
    state.delivery = event.target.value;
    state.limit = PAGE_SIZE;
    renderResults();
  });
  byId('show-more').addEventListener('click', () => {
    state.limit += PAGE_SIZE;
    renderResults();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      byId('search').focus();
    }
    if (event.key === 'Escape' && document.activeElement === byId('search')) {
      byId('search').value = '';
      state.query = '';
      state.limit = PAGE_SIZE;
      renderResults();
    }
  });
  byId('copy-path').addEventListener('click', async (event) => {
    await copyText(pathText(), event.currentTarget, 'Copied path');
    byId('copy-status').textContent = 'Copied for your notes.';
    window.setTimeout(() => { byId('copy-status').textContent = ''; }, 1800);
  });
}

function enableReveals() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((node) => node.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver((records) => {
    records.forEach((record) => {
      if (record.isIntersecting) {
        record.target.classList.add('is-in');
        observer.unobserve(record.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
  targets.forEach((node, index) => {
    node.style.transitionDelay = `${(index % 4) * 70}ms`;
    observer.observe(node);
  });
}

async function start() {
  try {
    const response = await fetch('data/taxonomy.json');
    if (!response.ok) throw new Error(`Could not load taxonomy data (${response.status})`);
    const raw = await response.json();
    state.entries = Object.entries(GROUPS).flatMap(([category]) => (raw[category] || []).map((entry) => ({
      ...entry,
      category,
      delivery: entry.delivery === 'both' ? 'either' : entry.delivery,
    })));
    state.entries.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    bindControls();
    fillPathBuilder();
    updateCounts();
    renderResults();
    enableReveals();
  } catch (error) {
    byId('result-count').textContent = 'The index could not load.';
    byId('empty-state').hidden = false;
    byId('empty-state').textContent = `${error.message}. Open this page through a web server so the data file can load.`;
    document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-in'));
  }
}

start();

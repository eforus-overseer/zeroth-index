import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../docs/data/taxonomy.json', import.meta.url), 'utf8'));
const expectedCounts = { intents: 27, techniques: 70, evasions: 63, inputs: 12 };

test('source taxonomy has the expected four pillars and entry counts', () => {
  assert.deepEqual(Object.keys(data).sort(), Object.keys(expectedCounts).sort());
  for (const [pillar, count] of Object.entries(expectedCounts)) {
    assert.equal(data[pillar].length, count, `${pillar} count`);
  }
});

test('every entry has a unique reference code and required text fields', () => {
  const codes = new Set();
  for (const [pillar, entries] of Object.entries(data)) {
    for (const entry of entries) {
      assert.match(entry.code, /^PIT-[ITEN]-\d{2}$/);
      assert.ok(!codes.has(entry.code), `duplicate code ${entry.code}`);
      codes.add(entry.code);
      assert.equal(typeof entry.title, 'string', `${entry.code} title`);
      assert.equal(typeof entry.description, 'string', `${entry.code} description`);
      assert.ok(entry.aliases === undefined || Array.isArray(entry.aliases), `${entry.code} aliases`);
      assert.ok(entry.delivery === undefined || ['direct', 'indirect', 'either', 'both'].includes(entry.delivery), `${entry.code} delivery`);
      assert.ok(['intents', 'techniques', 'evasions', 'inputs'].includes(pillar));
    }
  }
  assert.equal(codes.size, 172);
});

test('reused data attribution is present', () => {
  const attribution = readFileSync(new URL('../DATA-ATTRIBUTION.md', import.meta.url), 'utf8');
  assert.match(attribution, /Arcanum Prompt Injection Taxonomy/);
  assert.match(attribution, /CC BY 4\.0/);
  assert.match(attribution, /e02cf5b/);
});

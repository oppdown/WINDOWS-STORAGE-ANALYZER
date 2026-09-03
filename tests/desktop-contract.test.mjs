import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../apps/desktop/src/main.jsx', import.meta.url), 'utf8');

test('desktop shell exposes radio-button scan profiles', () => {
  assert.match(source, /type="radio"/);
  assert.match(source, /name="profile"/);
  assert.match(source, /Prepare scan/);
});

test('desktop shell has an explicit path input and status region', () => {
  assert.match(source, /id="path"/);
  assert.match(source, /role="status"/);
});

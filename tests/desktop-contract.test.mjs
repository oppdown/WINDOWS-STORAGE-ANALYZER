import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarizeFiles, formatBytes } from '../apps/desktop/src/scanPreview.js';

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

test('desktop shell exposes a real folder selection path for local preview scans', () => {
  assert.match(source, /webkitdirectory/);
  assert.match(source, /summarizeFiles/);
  assert.match(source, /Local preview scan complete/);
});

test('preview summary totals files and sorts folders and largest files', () => {
  const result = summarizeFiles([
    { name: 'small.txt', size: 10, webkitRelativePath: 'Demo/small.txt' },
    { name: 'large.bin', size: 5000, webkitRelativePath: 'Demo/large.bin' },
    { name: 'other.dat', size: 100, webkitRelativePath: 'Other/other.dat' },
  ]);
  assert.equal(result.files, 3);
  assert.equal(result.bytes, 5110);
  assert.deepEqual(result.folders, [['Demo', 5010], ['Other', 100]]);
  assert.equal(result.largestFiles[0].name, 'Demo/large.bin');
  assert.equal(formatBytes(1024), '1.00 KB');
});

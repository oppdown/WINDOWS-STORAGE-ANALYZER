import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarizeFiles, summarizeFilesAsync, summarizeRustScan, formatBytes, normalizeWindowsPath } from '../apps/desktop/src/scanPreview.js';

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
  assert.match(source, /summarizeFilesAsync/);
  assert.match(source, /Local preview scan complete/);
  assert.match(source, /invoke\('scan_directory'/);
  assert.match(source, /normalizeWindowsPath/);
  assert.match(source, /Browse scan/);
  assert.match(source, /Up one level/);
  assert.match(source, /findParentNode/);
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

test('native scan summary preserves root totals and ranks nested files', () => {
  const result = summarizeRustScan({
    files: 2,
    root: {
      kind: 'directory',
      logicalBytes: 12,
      children: [
        { kind: 'directory', name: 'nested', logicalBytes: 7, children: [
          { kind: 'file', path: 'nested/two.bin', logicalBytes: 7, children: [] },
        ] },
        { kind: 'file', path: 'one.txt', logicalBytes: 5, children: [] },
      ],
    },
  });
  assert.equal(result.files, 2);
  assert.equal(result.bytes, 12);
  assert.deepEqual(result.folders, [['nested', 7]]);
  assert.equal(result.largestFiles[0].name, 'nested/two.bin');
  assert.equal(result.tree.kind, 'directory');
});

test('Windows drive-only paths normalize to the drive root', () => {
  assert.equal(normalizeWindowsPath(' D: '), 'D:\\');
  assert.equal(normalizeWindowsPath('D:\\Data'), 'D:\\Data');
});

test('large browser previews yield progress without sorting every file', async () => {
  const files = Array.from({ length: 4500 }, (_, index) => ({
    name: `file-${index}.bin`,
    size: index,
    webkitRelativePath: `Drive/file-${index}.bin`,
  }));
  const progress = [];
  const result = await summarizeFilesAsync(files, (processed) => progress.push(processed));
  assert.equal(result.files, 4500);
  assert.equal(result.bytes, 4500 * 4499 / 2);
  assert.equal(result.largestFiles[0].name, 'Drive/file-4499.bin');
  assert.deepEqual(progress, [2000, 4000, 4500]);
});

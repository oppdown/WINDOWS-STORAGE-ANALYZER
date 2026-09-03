export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = -1;
  do { value /= 1024; unit += 1; } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}

export function summarizeFiles(files) {
  const folderTotals = new Map();
  const largestFiles = [];

  for (const file of files) {
    addFileToSummary(file, folderTotals, largestFiles);
  }

  return finishFileSummary(files.length, folderTotals, largestFiles);
}

export async function summarizeFilesAsync(files, onProgress = () => {}) {
  const folderTotals = new Map();
  const largestFiles = [];
  const batchSize = 2000;
  let bytesProcessed = 0;

  for (let start = 0; start < files.length; start += batchSize) {
    const end = Math.min(start + batchSize, files.length);
    for (let index = start; index < end; index += 1) {
      const file = files[index];
      bytesProcessed += addFileToSummary(file, folderTotals, largestFiles);
    }
    onProgress(end, files.length, bytesProcessed);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return finishFileSummary(files.length, folderTotals, largestFiles);
}

export function normalizeWindowsPath(value) {
  const path = value.trim();
  return /^[a-zA-Z]:$/.test(path) ? `${path}\\` : path;
}

function addFileToSummary(file, folderTotals, largestFiles) {
  const bytes = Number(file.size ?? 0);
  const relative = file.webkitRelativePath || file.name;
  const topFolder = relative.includes('/') ? relative.split('/')[0] : '(selected files)';
  folderTotals.set(topFolder, (folderTotals.get(topFolder) ?? 0) + bytes);

  const candidate = { name: relative, bytes };
  largestFiles.push(candidate);
  largestFiles.sort((left, right) => right.bytes - left.bytes || left.name.localeCompare(right.name));
  if (largestFiles.length > 8) largestFiles.pop();
  return bytes;
}

function finishFileSummary(files, folderTotals, largestFiles) {
  return {
    files,
    bytes: [...folderTotals.values()].reduce((total, value) => total + value, 0),
    folders: [...folderTotals.entries()].sort((left, right) => right[1] - left[1]),
    largestFiles,
  };
}

export function summarizeRustScan(scan) {
  const root = scan.root;
  const files = [];

  function collectFileNodes(node) {
    if (node.kind === 'file') {
      files.push({ name: node.path, bytes: node.logicalBytes });
      return;
    }
    for (const child of node.children ?? []) collectFileNodes(child);
  }

  collectFileNodes(root);
  files.sort((left, right) => right.bytes - left.bytes || left.name.localeCompare(right.name));

  return {
    files: scan.files,
    bytes: root.logicalBytes,
    folders: (root.children ?? [])
      .filter((child) => child.kind === 'directory')
      .map((child) => [child.name, child.logicalBytes]),
    largestFiles: files.slice(0, 8),
    tree: root,
  };
}

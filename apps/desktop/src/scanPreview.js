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
  const largestFiles = [...files]
    .sort((left, right) => right.size - left.size)
    .slice(0, 8)
    .map((file) => ({ name: file.webkitRelativePath || file.name, bytes: file.size }));

  for (const file of files) {
    const relative = file.webkitRelativePath || file.name;
    const topFolder = relative.includes('/') ? relative.split('/')[0] : '(selected files)';
    folderTotals.set(topFolder, (folderTotals.get(topFolder) ?? 0) + file.size);
  }

  return {
    files: files.length,
    bytes: files.reduce((total, file) => total + file.size, 0),
    folders: [...folderTotals.entries()].sort((left, right) => right[1] - left[1]),
    largestFiles,
  };
}

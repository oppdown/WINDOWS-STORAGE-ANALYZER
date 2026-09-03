import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import './styles.css';
import { formatBytes, summarizeFiles, summarizeRustScan } from './scanPreview.js';

const profiles = [
  ['local', 'Local drive or folder', 'Fast local scan with safe recursive fallback'],
  ['network', 'Network or UNC path', 'Network-aware scan with reconnect and retry'],
  ['snapshot', 'Compare with a snapshot', 'Show growth, shrinkage, and changed files'],
  ['duplicates', 'Find duplicate files', 'Hash candidates only after size and type filtering'],
];

function App() {
  const [profile, setProfile] = useState('local');
  const [path, setPath] = useState('');
  const [status, setStatus] = useState('Ready for a scan');
  const [result, setResult] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  function selectFolder(event) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    if (files.length > 0) {
      const folder = files[0].webkitRelativePath?.split('/')[0] ?? files[0].name;
      setPath(folder);
      setStatus(`${files.length.toLocaleString()} files selected from ${folder}.`);
    }
  }

  async function prepareScan(event) {
    event.preventDefault();
    if (selectedFiles.length > 0) {
      const scanned = summarizeFiles(selectedFiles);
      setResult({ path: path.trim(), profile, ...scanned });
      setStatus(`Local preview scan complete: ${scanned.files.toLocaleString()} files.`);
      return;
    }
    if (!path.trim()) {
      setStatus('Choose a folder or enter a Windows path first.');
      return;
    }
    if (!window.__TAURI_INTERNALS__) {
      setStatus(`Native scan prepared for ${path.trim()}; open the Windows desktop build to scan this path.`);
      setResult({ path: path.trim(), profile, files: null, bytes: null, folders: [], largestFiles: [] });
      return;
    }

    setStatus(`Scanning ${path.trim()}...`);
    try {
      const scan = await invoke('scan_directory', { root: path.trim() });
      const scanned = summarizeRustScan(scan);
      setResult({ path: path.trim(), profile, ...scanned });
      setStatus(`Native scan complete: ${scanned.files.toLocaleString()} files.`);
    } catch (error) {
      setResult(null);
      setStatus(`Native scan failed: ${String(error)}`);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><span className="eyebrow">WINDOWS-FIRST STORAGE WORKSTATION</span><h1>Storage Analyzer</h1></div>
        <span className="badge">PRE-ALPHA 0.1.3</span>
      </header>
      <section className="hero">
        <div><p className="eyebrow">LOCAL-FIRST • EXPLAINABLE • SAFE</p><h2>See what is using your space.</h2><p className="muted">Scan, understand, compare, and clean up storage with every total traceable to a file or folder.</p></div>
        <div className="hero-stat"><strong>0 B</strong><span>Awaiting first scan</span></div>
      </section>
      <form className="panel intake" onSubmit={prepareScan}>
        <div className="panel-title"><div><span className="eyebrow">01</span><h3>Choose an analysis</h3></div><span className="muted">Radio selection</span></div>
        <div className="radio-grid">
          {profiles.map(([id, title, description]) => <label className={`radio-card ${profile === id ? 'selected' : ''}`} key={id}><input type="radio" name="profile" value={id} checked={profile === id} onChange={(event) => setProfile(event.target.value)} /><span><strong>{title}</strong><small>{description}</small></span></label>)}
        </div>
        <label className="path-label" htmlFor="path">Folder or drive path</label>
        <div className="path-row"><input id="path" value={path} onChange={(event) => { setPath(event.target.value); setSelectedFiles([]); }} placeholder="C:\\Users\\YourName or \\server\\share" /><label className="secondary-button" htmlFor="folder-picker">Choose folder<input id="folder-picker" type="file" webkitdirectory="true" directory="true" multiple onChange={selectFolder} /></label><button type="submit">Prepare scan</button></div>
        <p className="status" role="status">{status}</p>
      </form>
      <section className="dashboard">
        <div className="panel chart"><div className="panel-title"><div><span className="eyebrow">02</span><h3>Space map</h3></div><span className="muted">Local scan</span></div>{result?.folders?.length ? <div className="folder-bars">{result.folders.map(([name, bytes]) => <div className="folder-row" key={name}><div><span>{name}</span><small>{formatBytes(bytes)}</small></div><div className="bar-track"><span style={{ width: `${Math.max(4, (bytes / Math.max(result.bytes, 1)) * 100)}%` }} /></div></div>)}</div> : <div className="empty-map"><span>Scan results will appear here</span><small>Select a folder for a local preview, or open the Windows desktop build for native path scanning.</small></div>}</div>
        <div className="panel summary"><div className="panel-title"><div><span className="eyebrow">03</span><h3>Scan summary</h3></div></div>{result ? <><dl><dt>Target</dt><dd>{result.path}</dd><dt>Mode</dt><dd>{result.profile}</dd><dt>Files</dt><dd>{result.files == null ? 'Pending native bridge' : result.files.toLocaleString()}</dd><dt>Logical size</dt><dd>{result.bytes == null ? 'Pending native bridge' : formatBytes(result.bytes)}</dd></dl>{result.largestFiles?.length ? <div className="largest"><h4>Largest files</h4>{result.largestFiles.slice(0, 5).map((file) => <div className="largest-row" key={file.name}><span title={file.name}>{file.name}</span><strong>{formatBytes(file.bytes)}</strong></div>)}</div> : null}</> : <p className="muted">No scan prepared yet.</p>}</div>
      </section>
      <footer>Built for Windows • metadata remains local by default • destructive actions require confirmation</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

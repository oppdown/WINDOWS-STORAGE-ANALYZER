import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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

  function prepareScan(event) {
    event.preventDefault();
    if (!path.trim()) {
      setStatus('Choose a folder or enter a Windows path first.');
      return;
    }
    setStatus(`Prepared ${profiles.find(([id]) => id === profile)?.[1] ?? 'scan'} for ${path.trim()}.`);
    setResult({ path: path.trim(), profile, files: '—', bytes: '—', note: 'Rust scan bridge is the next milestone.' });
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><span className="eyebrow">WINDOWS-FIRST STORAGE WORKSTATION</span><h1>Storage Analyzer</h1></div>
        <span className="badge">PRE-ALPHA 0.1.0</span>
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
        <div className="path-row"><input id="path" value={path} onChange={(event) => setPath(event.target.value)} placeholder="C:\\Users\\YourName or \\server\\share" /><button type="submit">Prepare scan</button></div>
        <p className="status" role="status">{status}</p>
      </form>
      <section className="dashboard">
        <div className="panel chart"><div className="panel-title"><div><span className="eyebrow">02</span><h3>Space map</h3></div><span className="muted">Treemap preview</span></div><div className="empty-map"><span>Scan results will appear here</span><small>Largest folders, files, and percentages will be rendered after the Rust bridge is connected.</small></div></div>
        <div className="panel summary"><div className="panel-title"><div><span className="eyebrow">03</span><h3>Scan summary</h3></div></div>{result ? <dl><dt>Target</dt><dd>{result.path}</dd><dt>Mode</dt><dd>{result.profile}</dd><dt>Files</dt><dd>{result.files}</dd><dt>Logical size</dt><dd>{result.bytes}</dd></dl> : <p className="muted">No scan prepared yet.</p>}</div>
      </section>
      <footer>Built for Windows • metadata remains local by default • destructive actions require confirmation</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

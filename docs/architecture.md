# Architecture

## Product boundary

WINDOWS STORAGE ANALYZER is a native Windows desktop application. The UI is a Tauri/React shell; the authoritative scan, index, search, and file-operation logic lives in Rust. The first implementation uses safe recursive traversal and exposes a stable model for future Windows accelerators.

## Data flow

```text
User target -> scan profile -> Windows adapter or safe traversal
           -> cancellable scan job -> SQLite index/snapshot
           -> filters/search/visuals/reports -> explicit file operation
```

Every scan records its target, profile, start/completion time, errors, logical bytes, allocated bytes when available, and child relationships. Permission errors are retained as visible diagnostics rather than silently treated as zero.

## Planned modules

- `storage-core`: scan model, traversal, sorting, totals, cancellation, and error contracts.
- `windows-adapter`: NTFS/MFT fast path, reparse-point rules, ACLs, compression, hardlinks, ADS, long paths, recycle bin, and Explorer integration.
- `index-store`: SQLite schema for scan runs, nodes, hashes, snapshots, and report jobs.
- `desktop`: accessible React views, treemap, search, comparison, task progress, and confirmation surfaces.
- `reporting`: deterministic PDF, Excel, HTML, CSV, XML, TXT, SQLite, and print exports.
- `connectors`: UNC, VHDX, MTP, SharePoint, S3, WebDAV, Azure Blob, and SSH adapters with explicit credentials.

## Safety

Scanning is read-only. Move/delete/archive actions are separate commands with preview, target list, permission checks, collision handling, undo/recycle behavior where supported, and confirmation. No remote connector or telemetry is enabled implicitly.

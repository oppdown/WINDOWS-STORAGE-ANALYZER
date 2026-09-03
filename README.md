# WINDOWS STORAGE ANALYZER

Windows-first disk-space analysis and storage-management application.

This project is an original implementation inspired by the functional categories users expect from TreeSize: fast folder and file sizing, visual analysis, search, duplicate detection, snapshots, reporting, cleanup workflows, and scheduled automation. It does not copy proprietary code, artwork, or branding.

## Status

Early development. The first foundation contains a buildable Rust filesystem scanner, a React/Tauri-ready desktop shell, regression tests, documentation, and release automation. Production NTFS/MFT acceleration, duplicate hashing, reports, Windows Explorer integration, remote sources, and signed installers are staged milestones.

## Planned capabilities

- Local, removable, UNC/network, VHDX, and selected remote/cloud sources
- Folder/file trees sorted by size, allocated size, count, age, type, owner, and percentage
- Treemap, bar, pie, age, type, owner, and largest-file views
- Search, duplicate analysis, safe cleanup, recycle-bin handling, and file operations
- NTFS permissions, compression, hardlinks, alternate data streams, and long paths
- Snapshots, historical comparisons, cached indexes, and scan profiles
- PDF, Excel, HTML, CSV, XML, TXT, SQLite, print, and email-ready reports
- Command-line scans, scheduled tasks, portable mode, Explorer integration, and accessibility options

## Quick start

Prerequisites: Windows 10+, Rust stable with the MSVC target, Node.js 20+, and npm.

```powershell
cargo test --workspace
cargo run -p storage-core --bin storage-analyzer -- C:\Users
cd apps/desktop
npm install
npm run dev
```

The scanner prints a JSON summary for the selected root. The desktop shell currently runs as a safe preview; Tauri commands will connect it to the Rust scanner in the next milestone.

## Repository map

```text
apps/desktop/       React/Tauri-ready Windows interface
crates/storage-core Rust scan model, traversal, and future Windows adapters
docs/               GitHub Pages documentation and release notes
tests/              Cross-platform contract checks
.github/            CI, Pages, release, and contribution templates
```

## Design principles

1. Local-first: file metadata stays on the machine unless the user explicitly exports or sends it.
2. Explainable: every total can be traced to a root, scan profile, timestamp, and child record.
3. Safe by default: destructive operations require an explicit preview and confirmation.
4. Incremental: scans, hashes, snapshots, and reports run in cancellable background jobs.
5. Original work: compatibility means comparable behavior, not copied proprietary implementation.

Read [docs/architecture.md](docs/architecture.md), [docs/roadmap.md](docs/roadmap.md), and [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

## License

MIT. See [LICENSE](LICENSE).

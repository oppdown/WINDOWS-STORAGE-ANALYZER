# Changelog

All notable changes to WINDOWS STORAGE ANALYZER are documented here.

## [0.1.2] - 2026-09-03

### Added

- Native Tauri command bridge from the Windows desktop shell to the Rust scanner.
- Native path scanning with deterministic folder totals and nested largest-file results.
- Frontend regression coverage for the native scan summary contract.
- Explicit preview fallback messaging when the browser site is used instead of the Windows desktop build.

## [0.1.1] - 2026-09-03

### Added

- Local folder selection and a read-only browser preview scan with folder totals and largest-file results.
- Child nodes in the Rust scan result, sorted deterministically by descending size.
- Direct unit coverage for the preview summary and byte formatting helpers.

## [0.1.0] - 2026-09-03

### Added

- Local folder selection and a read-only browser preview scan with folder totals, largest-file results, and status feedback.
- Child nodes in the Rust scan result, sorted deterministically by descending size.
- Standalone Windows-first project foundation.
- Rust scanner that recursively measures files and directories.
- Stable JSON scan result model with root, timestamps, byte totals, and child records.
- React/Tauri-ready desktop shell with radio-button analysis modes and a scan workflow preview.
- Architecture, roadmap, testing, security, contribution, and release documentation.
- GitHub Actions checks for Rust, frontend contract files, and documentation.

### Planned next

- Native Windows command bridge and cancellable background scans.
- NTFS/MFT fast path with fallback traversal.
- Treemap rendering, duplicate hashing, snapshots, and report exports.

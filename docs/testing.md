# Testing

The correctness baseline is `cargo test --workspace`. The scanner tests cover nested totals, directory/file counts, and explicit missing-root errors.

Future regression fixtures will include permission-denied folders, reparse-point loops, long paths, alternate data streams, hardlinks, sparse files, concurrent changes, Unicode names, network disconnects, and duplicate groups. Each fixture must state the expected logical and allocated-size semantics.

Before a public Windows release, CI must pass Rust tests, frontend contract tests, documentation checks, a packaged Windows smoke test, and a clean install/upgrade/uninstall pass on a supported Windows runner.

# Tauri bridge

This is the native Windows boundary. The `scan_directory` command accepts a user-selected path, calls the correctness-first Rust scanner, and returns its serialized child tree to the React interface.

The bundle is intentionally disabled until application icons, Windows signing, installer smoke tests, and the first native release gate are complete. Use `npm run tauri:dev` after the Rust and Tauri prerequisites are installed.

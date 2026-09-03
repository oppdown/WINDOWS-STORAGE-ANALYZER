# Desktop shell

This folder contains the React interface and Tauri bridge packaged for Windows. The browser build remains a safe preview with radio-button analysis profiles and folder selection. The Windows desktop build calls the Rust `scan_directory` command for native path scanning.

Run `npm install`, then `npm run dev` or `npm run build`. With Rust and the Windows WebView2 prerequisites installed, `npm run tauri:dev` starts the native shell. Installer bundling is intentionally disabled until the icon, signing, and install/uninstall acceptance gate is complete.

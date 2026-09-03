#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use storage_core::ScanResult;

#[tauri::command]
fn scan_directory(root: String) -> Result<ScanResult, String> {
    storage_core::scan_directory(root).map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![scan_directory])
        .run(tauri::generate_context!())
        .expect("error while running WINDOWS STORAGE ANALYZER");
}

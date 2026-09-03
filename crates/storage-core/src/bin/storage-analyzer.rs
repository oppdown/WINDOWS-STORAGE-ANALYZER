use std::env;
use storage_core::scan_directory;

fn main() {
    let root = env::args().nth(1).unwrap_or_else(|| ".".to_owned());
    match scan_directory(&root) {
        Ok(result) => println!("{}", serde_json::to_string_pretty(&result).expect("serialize scan result")),
        Err(error) => {
            eprintln!("scan failed: {error}");
            std::process::exit(1);
        }
    }
}

//! Cross-platform scan foundation. Windows-specific accelerators will plug into
//! this model while the safe traversal remains the correctness fallback.

use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ScanNode {
    pub name: String,
    pub path: PathBuf,
    pub kind: NodeKind,
    pub logical_bytes: u64,
    pub allocated_bytes: u64,
    pub child_count: u64,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum NodeKind {
    File,
    Directory,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub root: ScanNode,
    pub started_unix_seconds: u64,
    pub completed_unix_seconds: u64,
    pub files: u64,
    pub directories: u64,
    pub errors: u64,
}

#[derive(Debug)]
pub enum ScanError {
    RootMissing(PathBuf),
    RootNotDirectory(PathBuf),
    Io(io::Error),
}

impl std::fmt::Display for ScanError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::RootMissing(path) => write!(f, "scan root does not exist: {}", path.display()),
            Self::RootNotDirectory(path) => {
                write!(f, "scan root is not a directory: {}", path.display())
            }
            Self::Io(error) => write!(f, "filesystem error: {error}"),
        }
    }
}

impl std::error::Error for ScanError {}

impl From<io::Error> for ScanError {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

pub fn scan_directory(root: impl AsRef<Path>) -> Result<ScanResult, ScanError> {
    let root = root.as_ref().to_path_buf();
    let metadata = fs::metadata(&root).map_err(|error| {
        if error.kind() == io::ErrorKind::NotFound {
            ScanError::RootMissing(root.clone())
        } else {
            ScanError::Io(error)
        }
    })?;
    if !metadata.is_dir() {
        return Err(ScanError::RootNotDirectory(root));
    }

    let started = now_seconds();
    let mut counters = Counters::default();
    let root_node = visit_directory(&root, &mut counters);
    Ok(ScanResult {
        root: root_node,
        started_unix_seconds: started,
        completed_unix_seconds: now_seconds(),
        files: counters.files,
        directories: counters.directories,
        errors: counters.errors,
    })
}

#[derive(Default)]
struct Counters {
    files: u64,
    directories: u64,
    errors: u64,
}

fn visit_directory(path: &Path, counters: &mut Counters) -> ScanNode {
    counters.directories += 1;
    let mut node = ScanNode {
        name: display_name(path),
        path: path.to_path_buf(),
        kind: NodeKind::Directory,
        logical_bytes: 0,
        allocated_bytes: 0,
        child_count: 0,
        errors: Vec::new(),
    };

    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,
        Err(error) => {
            counters.errors += 1;
            node.errors.push(error.to_string());
            return node;
        }
    };

    for entry in entries.flatten() {
        node.child_count += 1;
        let entry_path = entry.path();
        match entry.metadata() {
            Ok(metadata) if metadata.is_dir() => {
                let child = visit_directory(&entry_path, counters);
                node.logical_bytes = node.logical_bytes.saturating_add(child.logical_bytes);
                node.allocated_bytes = node.allocated_bytes.saturating_add(child.allocated_bytes);
                node.errors.extend(child.errors);
            }
            Ok(metadata) => {
                counters.files += 1;
                node.logical_bytes = node.logical_bytes.saturating_add(metadata.len());
                node.allocated_bytes = node.allocated_bytes.saturating_add(metadata.len());
            }
            Err(error) => {
                counters.errors += 1;
                node.errors
                    .push(format!("{}: {error}", entry_path.display()));
            }
        }
    }
    node
}

fn display_name(path: &Path) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .map_or_else(|| path.display().to_string(), str::to_owned)
}

fn now_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{create_dir_all, remove_dir_all, write};

    #[test]
    fn scan_sums_nested_files_and_reports_counts() {
        let root = std::env::temp_dir().join(format!("wsa-test-{}", std::process::id()));
        let _ = remove_dir_all(&root);
        create_dir_all(root.join("nested")).unwrap();
        write(root.join("one.txt"), b"12345").unwrap();
        write(root.join("nested").join("two.bin"), b"1234567").unwrap();

        let result = scan_directory(&root).unwrap();
        assert_eq!(result.files, 2);
        assert_eq!(result.directories, 2);
        assert_eq!(result.root.logical_bytes, 12);
        assert_eq!(result.errors, 0);
        assert_eq!(result.root.child_count, 2);
        remove_dir_all(root).unwrap();
    }

    #[test]
    fn missing_root_is_explicit() {
        let path = std::env::temp_dir().join("wsa-no-such-root");
        assert!(matches!(
            scan_directory(path),
            Err(ScanError::RootMissing(_))
        ));
    }
}

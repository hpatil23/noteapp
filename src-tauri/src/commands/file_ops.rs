use super::encoding::{decode_bytes, encode_bytes};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Clone)]
pub struct FileContent {
    pub path: String,
    pub name: String,
    pub content: String,
    pub encoding: String,
    pub eol: String,
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<FileContent, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("Failed to read {path}: {e}"))?;
    let decoded = decode_bytes(&bytes);
    let name = Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Untitled")
        .to_string();

    Ok(FileContent {
        path,
        name,
        content: decoded.content,
        encoding: decoded.encoding,
        eol: decoded.eol,
    })
}

#[tauri::command]
pub fn write_text_file(
    path: String,
    content: String,
    encoding: String,
    eol: String,
) -> Result<(), String> {
    let normalized = content.replace("\r\n", "\n");
    let final_text = if eol == "CRLF" {
        normalized.replace('\n', "\r\n")
    } else {
        normalized
    };
    let bytes = encode_bytes(&final_text, &encoding);
    std::fs::write(&path, bytes).map_err(|e| format!("Failed to save {path}: {e}"))
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
pub fn file_name_from_path(path: String) -> String {
    Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

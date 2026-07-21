use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct SessionTab {
    pub path: Option<String>,
    pub name: String,
    pub content: String,
    pub encoding: String,
    pub eol: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default)]
    pub word_wrap: bool,
    #[serde(default)]
    pub recent_files: Vec<String>,
    #[serde(default)]
    pub last_session_tabs: Vec<SessionTab>,
    #[serde(default)]
    pub active_tab_index: usize,
}

fn default_theme() -> String {
    "dark".into()
}

impl Default for AppSettings {
    fn default() -> Self {
        AppSettings {
            theme: default_theme(),
            word_wrap: false,
            recent_files: Vec::new(),
            last_session_tabs: Vec::new(),
            active_tab_index: 0,
        }
    }
}

fn settings_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app data dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<AppSettings, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = settings_path(&app)?;
    let data = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_recent_file(app: AppHandle, path: String) -> Result<Vec<String>, String> {
    let mut settings = load_settings(app.clone())?;
    settings.recent_files.retain(|p| p != &path);
    settings.recent_files.insert(0, path);
    settings.recent_files.truncate(10);
    save_settings(app, settings.clone())?;
    Ok(settings.recent_files)
}

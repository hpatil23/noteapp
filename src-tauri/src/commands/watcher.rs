use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

/// Tracks one filesystem watcher per open file path so we can notify the
/// frontend when a file is changed or removed outside the app.
pub struct WatcherState(pub Mutex<HashMap<String, RecommendedWatcher>>);

impl Default for WatcherState {
    fn default() -> Self {
        WatcherState(Mutex::new(HashMap::new()))
    }
}

#[tauri::command]
pub fn watch_file(app: AppHandle, state: State<WatcherState>, path: String) -> Result<(), String> {
    let mut map = state.0.lock().map_err(|e| e.to_string())?;
    if map.contains_key(&path) {
        return Ok(());
    }

    let app_handle = app.clone();
    let watched_path = path.clone();
    let mut watcher: RecommendedWatcher = notify::recommended_watcher(
        move |res: notify::Result<notify::Event>| {
            if let Ok(event) = res {
                if matches!(
                    event.kind,
                    EventKind::Modify(_) | EventKind::Remove(_)
                ) {
                    let _ = app_handle.emit("file-changed", watched_path.clone());
                }
            }
        },
    )
    .map_err(|e| e.to_string())?;

    watcher
        .watch(std::path::Path::new(&path), RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    map.insert(path, watcher);
    Ok(())
}

#[tauri::command]
pub fn unwatch_file(state: State<WatcherState>, path: String) -> Result<(), String> {
    let mut map = state.0.lock().map_err(|e| e.to_string())?;
    map.remove(&path);
    Ok(())
}

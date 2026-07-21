mod commands;

use commands::{file_ops, settings, watcher};
use watcher::WatcherState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(WatcherState::default())
        .invoke_handler(tauri::generate_handler![
            file_ops::read_text_file,
            file_ops::write_text_file,
            file_ops::file_exists,
            file_ops::file_name_from_path,
            settings::load_settings,
            settings::save_settings,
            settings::add_recent_file,
            watcher::watch_file,
            watcher::unwatch_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open as openDialog, save as saveDialog, ask } from "@tauri-apps/plugin-dialog";

export interface FileContent {
  path: string;
  name: string;
  content: string;
  encoding: string;
  eol: string;
}

export interface SessionTab {
  path: string | null;
  name: string;
  content: string;
  encoding: string;
  eol: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  word_wrap: boolean;
  recent_files: string[];
  last_session_tabs: SessionTab[];
  active_tab_index: number;
}

export const fileApi = {
  readTextFile: (path: string) => invoke<FileContent>("read_text_file", { path }),
  writeTextFile: (path: string, content: string, encoding: string, eol: string) =>
    invoke<void>("write_text_file", { path, content, encoding, eol }),
  fileExists: (path: string) => invoke<boolean>("file_exists", { path }),
  fileNameFromPath: (path: string) => invoke<string>("file_name_from_path", { path }),
};

export const settingsApi = {
  load: () => invoke<AppSettings>("load_settings"),
  save: (settings: AppSettings) => invoke<void>("save_settings", { settings }),
  addRecentFile: (path: string) => invoke<string[]>("add_recent_file", { path }),
};

export const watcherApi = {
  watch: (path: string) => invoke<void>("watch_file", { path }),
  unwatch: (path: string) => invoke<void>("unwatch_file", { path }),
  onFileChanged: (handler: (path: string) => void) =>
    listen<string>("file-changed", (event) => handler(event.payload)),
};

export const dialogApi = {
  openFile: () =>
    openDialog({
      multiple: true,
      title: "Open File",
      filters: [
        { name: "Text Files", extensions: ["txt", "md", "json", "js", "ts", "tsx", "jsx", "py", "rs", "html", "css", "yaml", "yml", "toml", "log"] },
        { name: "All Files", extensions: ["*"] },
      ],
    }),
  saveFileAs: (defaultName?: string) =>
    saveDialog({
      title: "Save As",
      defaultPath: defaultName,
    }),
  confirmDiscard: (fileName: string) =>
    ask(`"${fileName}" has unsaved changes. Discard them?`, {
      title: "Unsaved Changes",
      kind: "warning",
      okLabel: "Discard",
      cancelLabel: "Cancel",
    }),
  confirmReload: (fileName: string) =>
    ask(`"${fileName}" was changed outside the editor. Reload it from disk?`, {
      title: "File Changed",
      kind: "info",
      okLabel: "Reload",
      cancelLabel: "Keep Mine",
    }),
};

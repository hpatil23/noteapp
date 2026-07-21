import { Clock, FileText, Sun, Moon, WrapText } from "lucide-react";
import { useAppStore } from "../lib/store";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const wordWrap = useAppStore((s) => s.wordWrap);
  const toggleWordWrap = useAppStore((s) => s.toggleWordWrap);
  const recentFiles = useAppStore((s) => s.recentFiles);
  const openFiles = useAppStore((s) => s.openFiles);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-2 top-11 z-50 w-72 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Preferences
        </p>

        <button
          onClick={toggleTheme}
          className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            Theme
          </span>
          <span className="text-neutral-400 capitalize">{theme}</span>
        </button>

        <button
          onClick={toggleWordWrap}
          className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <span className="flex items-center gap-2">
            <WrapText size={14} />
            Word Wrap
          </span>
          <span className="text-neutral-400">{wordWrap ? "On" : "Off"}</span>
        </button>

        <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          <Clock size={12} /> Recent Files
        </p>
        <div className="max-h-40 overflow-y-auto">
          {recentFiles.length === 0 && (
            <p className="px-2 py-1 text-xs text-neutral-400">No recent files</p>
          )}
          {recentFiles.map((path) => (
            <button
              key={path}
              onClick={() => {
                void openFiles([path]);
                onClose();
              }}
              className="flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              title={path}
            >
              <FileText size={12} className="shrink-0" />
              <span className="truncate">{path}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

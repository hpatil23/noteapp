import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, Copy, X, FileText } from "lucide-react";

const appWindow = getCurrentWindow();

export function TitleBar({ title }: { title: string }) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    appWindow.isMaximized().then(setMaximized);
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setMaximized);
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 select-none items-center justify-between bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800"
    >
      <div data-tauri-drag-region className="flex items-center gap-2 px-3 text-neutral-500 dark:text-neutral-400">
        <FileText size={14} strokeWidth={2} />
        <span className="text-xs font-medium tracking-wide truncate max-w-[50vw]">{title}</span>
      </div>
      <div className="flex h-full">
        <button
          aria-label="Minimize"
          className="flex h-full w-11 items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
          onClick={() => appWindow.minimize()}
        >
          <Minus size={14} />
        </button>
        <button
          aria-label="Maximize"
          className="flex h-full w-11 items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
          onClick={() => appWindow.toggleMaximize()}
        >
          {maximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          aria-label="Close"
          className="flex h-full w-11 items-center justify-center text-neutral-500 hover:bg-red-500 hover:text-white dark:text-neutral-400"
          onClick={() => appWindow.close()}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

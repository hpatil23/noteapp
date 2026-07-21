import { X, Circle } from "lucide-react";
import { useAppStore, tabDirty } from "../lib/store";

export function TabBar() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeTab = useAppStore((s) => s.closeTab);

  return (
    <div className="flex h-9 items-stretch overflow-x-auto border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        const dirty = tabDirty(tab);
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 border-r border-neutral-200 px-3 text-sm dark:border-neutral-800 ${
              active
                ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
                : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900/50"
            }`}
          >
            <span className="truncate">{tab.name}</span>
            <button
              aria-label="Close tab"
              onClick={(e) => {
                e.stopPropagation();
                void closeTab(tab.id);
              }}
              className="ml-auto flex h-4 w-4 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
            >
              {dirty ? (
                <Circle size={8} className="fill-current group-hover:hidden" />
              ) : null}
              <X size={12} className={dirty ? "hidden group-hover:block" : ""} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

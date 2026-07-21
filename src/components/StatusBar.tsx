import type { CursorInfo } from "../editor/setup";
import type { Tab } from "../lib/store";
import { tabLanguageLabel } from "../lib/store";

export function StatusBar({ tab, cursor }: { tab: Tab | undefined; cursor: CursorInfo | null }) {
  if (!tab) return null;

  return (
    <div className="flex h-6 items-center justify-between border-t border-neutral-200 bg-neutral-100 px-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
      <div className="flex items-center gap-4">
        <span>{tabLanguageLabel(tab)}</span>
        <span>{tab.path ?? "Not saved yet"}</span>
      </div>
      <div className="flex items-center gap-4">
        {cursor && (
          <>
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
            <span>{cursor.charCount.toLocaleString()} chars</span>
            <span>{cursor.wordCount.toLocaleString()} words</span>
          </>
        )}
        <span>{tab.eol}</span>
        <span>{tab.encoding}</span>
      </div>
    </div>
  );
}

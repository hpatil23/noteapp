import { useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import {
  SearchQuery,
  setSearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
} from "@codemirror/search";
import { ChevronDown, ChevronUp, X, CaseSensitive, Regex } from "lucide-react";

export function FindReplacePanel({
  view,
  onClose,
}: {
  view: EditorView | null;
  onClose: () => void;
}) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function applyQuery() {
    if (!view) return null;
    const query = new SearchQuery({ search: find, caseSensitive, regexp: useRegex, replace });
    view.dispatch({ effects: setSearchQuery.of(query) });
    return query;
  }

  useEffect(() => {
    applyQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [find, replace, caseSensitive, useRegex]);

  function goNext() {
    applyQuery();
    if (view) findNext(view);
  }

  function goPrev() {
    applyQuery();
    if (view) findPrevious(view);
  }

  function doReplace() {
    applyQuery();
    if (view) replaceNext(view);
  }

  function doReplaceAll() {
    applyQuery();
    if (view) replaceAll(view);
  }

  return (
    <div className="absolute right-3 top-2 z-30 w-80 rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowReplace((v) => !v)}
          className="flex h-7 w-6 items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          title="Toggle Replace"
        >
          {showReplace ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <input
          ref={inputRef}
          value={find}
          onChange={(e) => setFind(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goNext();
            if (e.key === "Escape") onClose();
          }}
          placeholder="Find"
          className="flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <button
          onClick={() => setCaseSensitive((v) => !v)}
          title="Case sensitive"
          className={`flex h-7 w-7 items-center justify-center rounded-md ${caseSensitive ? "bg-blue-500/15 text-blue-500" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
        >
          <CaseSensitive size={14} />
        </button>
        <button
          onClick={() => setUseRegex((v) => !v)}
          title="Use regex"
          className={`flex h-7 w-7 items-center justify-center rounded-md ${useRegex ? "bg-blue-500/15 text-blue-500" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
        >
          <Regex size={14} />
        </button>
        <button onClick={goPrev} title="Previous match" className="flex h-7 w-7 items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100">
          <ChevronUp size={14} />
        </button>
        <button onClick={goNext} title="Next match" className="flex h-7 w-7 items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100">
          <ChevronDown size={14} />
        </button>
        <button onClick={onClose} title="Close" className="flex h-7 w-7 items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100">
          <X size={14} />
        </button>
      </div>

      {showReplace && (
        <div className="mt-1.5 flex items-center gap-1">
          <div className="w-6" />
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doReplace();
            }}
            placeholder="Replace"
            className="flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <button
            onClick={doReplace}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Replace
          </button>
          <button
            onClick={doReplaceAll}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import { undo, redo } from "@codemirror/commands";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { TitleBar } from "./components/TitleBar";
import { Toolbar } from "./components/Toolbar";
import { TabBar } from "./components/TabBar";
import { EditorPane } from "./components/EditorPane";
import { StatusBar } from "./components/StatusBar";
import { FindReplacePanel } from "./components/FindReplacePanel";
import { useAppStore } from "./lib/store";
import type { CursorInfo } from "./editor/setup";

export default function App() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const theme = useAppStore((s) => s.theme);
  const wordWrap = useAppStore((s) => s.wordWrap);
  const findOpen = useAppStore((s) => s.findOpen);
  const setFindOpen = useAppStore((s) => s.setFindOpen);
  const newTab = useAppStore((s) => s.newTab);
  const openViaDialog = useAppStore((s) => s.openViaDialog);
  const closeTab = useAppStore((s) => s.closeTab);
  const saveTab = useAppStore((s) => s.saveTab);
  const saveTabAs = useAppStore((s) => s.saveTabAs);
  const openFiles = useAppStore((s) => s.openFiles);

  const viewRef = useRef<EditorView | null>(null);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const unlistenPromise = getCurrentWebviewWindow().onDragDropEvent((event) => {
      if (event.payload.type === "drop") {
        void openFiles(event.payload.paths);
      }
    });
    return () => {
      void unlistenPromise.then((fn) => fn());
    };
  }, [openFiles]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        newTab();
      } else if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        void openViaDialog();
      } else if (e.key.toLowerCase() === "s" && e.shiftKey) {
        e.preventDefault();
        if (activeTabId) void saveTabAs(activeTabId);
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeTabId) void saveTab(activeTabId);
      } else if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeTabId) void closeTab(activeTabId);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setFindOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabId, newTab, openViaDialog, saveTab, saveTabAs, closeTab, setFindOpen]);

  const handleViewReady = useCallback((view: EditorView) => {
    viewRef.current = view;
  }, []);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-neutral-400 dark:bg-neutral-950">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <TitleBar title={activeTab ? activeTab.name : "noteapp"} />
      <Toolbar
        onUndo={() => viewRef.current && undo(viewRef.current)}
        onRedo={() => viewRef.current && redo(viewRef.current)}
        onSave={() => activeTabId && void saveTab(activeTabId)}
      />
      <TabBar />
      <div className="relative flex-1 overflow-hidden">
        {activeTab && (
          <EditorPane
            key={activeTab.id}
            tab={activeTab}
            theme={theme}
            wordWrap={wordWrap}
            onViewReady={handleViewReady}
            onCursorChange={setCursor}
          />
        )}
        {findOpen && (
          <FindReplacePanel view={viewRef.current} onClose={() => setFindOpen(false)} />
        )}
      </div>
      <StatusBar tab={activeTab} cursor={cursor} />
    </div>
  );
}

import { create } from "zustand";
import { fileApi, settingsApi, watcherApi, dialogApi, type SessionTab } from "./tauriApi";
import { getLanguageLabel } from "../editor/languages";

export interface Tab {
  id: string;
  path: string | null;
  name: string;
  content: string;
  savedContent: string;
  encoding: string;
  eol: string;
}

interface AppState {
  tabs: Tab[];
  activeTabId: string | null;
  theme: "light" | "dark";
  wordWrap: boolean;
  recentFiles: string[];
  findOpen: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  newTab: () => void;
  openFiles: (paths: string[]) => Promise<void>;
  openViaDialog: () => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveTab: (id: string) => Promise<void>;
  saveTabAs: (id: string) => Promise<void>;
  reloadTabFromDisk: (path: string) => Promise<void>;
  toggleTheme: () => void;
  toggleWordWrap: () => void;
  setFindOpen: (open: boolean) => void;
  persistSession: () => void;
}

let untitledCounter = 1;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isDirty(tab: Tab): boolean {
  return tab.content !== tab.savedContent;
}

// CodeMirror only splits lines on "\n"; keeping raw "\r\n" in the buffer would
// leave a stray "\r" at the end of every line. We normalize to "\n" in memory
// and restore the original EOL style when writing back to disk.
function toEditorContent(content: string): string {
  return content.replace(/\r\n/g, "\n");
}

export const useAppStore = create<AppState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  theme: "dark",
  wordWrap: false,
  recentFiles: [],
  findOpen: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const settings = await settingsApi.load();
      const restoredTabs: Tab[] = settings.last_session_tabs.map((t: SessionTab) => {
        const content = toEditorContent(t.content);
        return {
          id: makeId(),
          path: t.path,
          name: t.name,
          content,
          savedContent: content,
          encoding: t.encoding,
          eol: t.eol,
        };
      });

      const tabs = restoredTabs.length > 0 ? restoredTabs : [];
      if (tabs.length === 0) {
        tabs.push({
          id: makeId(),
          path: null,
          name: `Untitled-${untitledCounter++}`,
          content: "",
          savedContent: "",
          encoding: "UTF-8",
          eol: "LF",
        });
      }

      const activeIndex = Math.min(settings.active_tab_index, tabs.length - 1);

      set({
        tabs,
        activeTabId: tabs[Math.max(activeIndex, 0)]?.id ?? null,
        theme: settings.theme === "light" ? "light" : "dark",
        wordWrap: settings.word_wrap,
        recentFiles: settings.recent_files,
        hydrated: true,
      });

      for (const tab of tabs) {
        if (tab.path) void watcherApi.watch(tab.path);
      }
    } catch {
      set({
        tabs: [
          {
            id: makeId(),
            path: null,
            name: `Untitled-${untitledCounter++}`,
            content: "",
            savedContent: "",
            encoding: "UTF-8",
            eol: "LF",
          },
        ],
        hydrated: true,
      });
    }

    watcherApi.onFileChanged(async (path) => {
      const tab = get().tabs.find((t) => t.path === path);
      if (!tab) return;
      if (isDirty(tab)) {
        const shouldReload = await dialogApi.confirmReload(tab.name);
        if (!shouldReload) return;
      }
      void get().reloadTabFromDisk(path);
    });
  },

  newTab: () => {
    const tab: Tab = {
      id: makeId(),
      path: null,
      name: `Untitled-${untitledCounter++}`,
      content: "",
      savedContent: "",
      encoding: "UTF-8",
      eol: "LF",
    };
    set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id }));
    get().persistSession();
  },

  openFiles: async (paths: string[]) => {
    for (const path of paths) {
      const existing = get().tabs.find((t) => t.path === path);
      if (existing) {
        set({ activeTabId: existing.id });
        continue;
      }
      try {
        const file = await fileApi.readTextFile(path);
        const content = toEditorContent(file.content);
        const tab: Tab = {
          id: makeId(),
          path: file.path,
          name: file.name,
          content,
          savedContent: content,
          encoding: file.encoding,
          eol: file.eol,
        };
        set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id }));
        void watcherApi.watch(path);
        const recent = await settingsApi.addRecentFile(path);
        set({ recentFiles: recent });
      } catch (err) {
        console.error("Failed to open file", path, err);
      }
    }
    get().persistSession();
  },

  openViaDialog: async () => {
    const result = await dialogApi.openFile();
    if (!result) return;
    const paths = Array.isArray(result) ? result : [result];
    await get().openFiles(paths.map(String));
  },

  closeTab: async (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;

    if (isDirty(tab)) {
      const discard = await dialogApi.confirmDiscard(tab.name);
      if (!discard) return;
    }

    if (tab.path) void watcherApi.unwatch(tab.path);

    set((state) => {
      const remaining = state.tabs.filter((t) => t.id !== id);
      let nextActive = state.activeTabId;
      if (state.activeTabId === id) {
        const idx = state.tabs.findIndex((t) => t.id === id);
        nextActive = remaining[Math.max(idx - 1, 0)]?.id ?? null;
      }
      if (remaining.length === 0) {
        const fresh: Tab = {
          id: makeId(),
          path: null,
          name: `Untitled-${untitledCounter++}`,
          content: "",
          savedContent: "",
          encoding: "UTF-8",
          eol: "LF",
        };
        return { tabs: [fresh], activeTabId: fresh.id };
      }
      return { tabs: remaining, activeTabId: nextActive };
    });
    get().persistSession();
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  updateContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, content } : t)),
    }));
    get().persistSession();
  },

  saveTab: async (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    if (!tab.path) {
      await get().saveTabAs(id);
      return;
    }
    await fileApi.writeTextFile(tab.path, tab.content, tab.encoding, tab.eol);
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, savedContent: t.content } : t)),
    }));
    get().persistSession();
  },

  saveTabAs: async (id: string) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    const target = await dialogApi.saveFileAs(tab.path ?? tab.name);
    if (!target) return;
    const name = await fileApi.fileNameFromPath(target);
    await fileApi.writeTextFile(target, tab.content, tab.encoding, tab.eol);
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, path: target, name, savedContent: t.content } : t,
      ),
    }));
    void watcherApi.watch(target);
    const recent = await settingsApi.addRecentFile(target);
    set({ recentFiles: recent });
    get().persistSession();
  },

  reloadTabFromDisk: async (path: string) => {
    try {
      const file = await fileApi.readTextFile(path);
      const content = toEditorContent(file.content);
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.path === path
            ? { ...t, content, savedContent: content, encoding: file.encoding, eol: file.eol }
            : t,
        ),
      }));
    } catch (err) {
      console.error("Failed to reload file", path, err);
    }
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" }));
    get().persistSession();
  },

  toggleWordWrap: () => {
    set((state) => ({ wordWrap: !state.wordWrap }));
    get().persistSession();
  },

  setFindOpen: (open: boolean) => set({ findOpen: open }),

  persistSession: () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      const state = get();
      const activeIndex = Math.max(state.tabs.findIndex((t) => t.id === state.activeTabId), 0);
      void settingsApi.save({
        theme: state.theme,
        word_wrap: state.wordWrap,
        recent_files: state.recentFiles,
        active_tab_index: activeIndex,
        last_session_tabs: state.tabs.map((t) => ({
          path: t.path,
          name: t.name,
          content: t.content,
          encoding: t.encoding,
          eol: t.eol,
        })),
      });
    }, 600);
  },
}));

export function tabDirty(tab: Tab): boolean {
  return isDirty(tab);
}

export function tabLanguageLabel(tab: Tab): string {
  return getLanguageLabel(tab.name);
}

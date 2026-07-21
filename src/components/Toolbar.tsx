import { useState } from "react";
import {
  FilePlus,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Search,
  WrapText,
  Sun,
  Moon,
  Settings2,
} from "lucide-react";
import { useAppStore } from "../lib/store";
import { SettingsPanel } from "./SettingsPanel";

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-blue-500/15 text-blue-500"
          : "text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  onUndo,
  onRedo,
  onSave,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const newTab = useAppStore((s) => s.newTab);
  const openViaDialog = useAppStore((s) => s.openViaDialog);
  const wordWrap = useAppStore((s) => s.wordWrap);
  const toggleWordWrap = useAppStore((s) => s.toggleWordWrap);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const findOpen = useAppStore((s) => s.findOpen);
  const setFindOpen = useAppStore((s) => s.setFindOpen);

  return (
    <div className="relative flex items-center gap-1 border-b border-neutral-200 bg-white px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900">
      <ToolbarButton label="New File (Ctrl+N)" onClick={newTab}>
        <FilePlus size={16} />
      </ToolbarButton>
      <ToolbarButton label="Open File (Ctrl+O)" onClick={() => void openViaDialog()}>
        <FolderOpen size={16} />
      </ToolbarButton>
      <ToolbarButton label="Save (Ctrl+S)" onClick={onSave}>
        <Save size={16} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

      <ToolbarButton label="Undo (Ctrl+Z)" onClick={onUndo}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton label="Redo (Ctrl+Y)" onClick={onRedo}>
        <Redo2 size={16} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

      <ToolbarButton label="Find & Replace (Ctrl+F)" active={findOpen} onClick={() => setFindOpen(!findOpen)}>
        <Search size={16} />
      </ToolbarButton>
      <ToolbarButton label="Toggle Word Wrap" active={wordWrap} onClick={toggleWordWrap}>
        <WrapText size={16} />
      </ToolbarButton>

      <div className="flex-1" />

      <ToolbarButton label="Toggle Theme" onClick={toggleTheme}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </ToolbarButton>
      <ToolbarButton label="Settings" active={settingsOpen} onClick={() => setSettingsOpen((v) => !v)}>
        <Settings2 size={16} />
      </ToolbarButton>

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

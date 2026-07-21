import { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { buildExtensions, type CursorInfo } from "../editor/setup";
import { useAppStore, type Tab } from "../lib/store";

interface EditorPaneProps {
  tab: Tab;
  theme: "light" | "dark";
  wordWrap: boolean;
  onViewReady: (view: EditorView) => void;
  onCursorChange: (info: CursorInfo) => void;
}

export function EditorPane({ tab, theme, wordWrap, onViewReady, onCursorChange }: EditorPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const updateContent = useAppStore((s) => s.updateContent);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: tab.content,
      extensions: buildExtensions({
        fileName: tab.name,
        theme,
        wordWrap,
        onChange: (content) => updateContent(tab.id, content),
        onCursorChange,
      }),
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    onViewReady(view);
    view.focus();

    const text = state.doc.toString();
    const line = state.doc.lineAt(state.selection.main.head);
    onCursorChange({
      line: line.number,
      column: state.selection.main.head - line.from + 1,
      charCount: text.length,
      wordCount: text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length,
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Re-create the view when switching tabs, theme, wrap mode, or language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.id, theme, wordWrap]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== tab.content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: tab.content },
      });
    }
    // Only sync in when content changes externally (e.g. reload from disk).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.content]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}

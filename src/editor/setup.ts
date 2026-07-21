import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { history, historyKeymap, defaultKeymap, indentWithTab } from "@codemirror/commands";
import { search, searchKeymap } from "@codemirror/search";
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { drawSelection, rectangularSelection, crosshairCursor, dropCursor } from "@codemirror/view";
import { getLanguageSupport } from "./languages";
import { lightTheme, darkTheme } from "./themes";

export interface CursorInfo {
  line: number;
  column: number;
  charCount: number;
  wordCount: number;
}

export function buildExtensions(opts: {
  fileName: string;
  theme: "light" | "dark";
  wordWrap: boolean;
  onChange: (content: string) => void;
  onCursorChange?: (info: CursorInfo) => void;
}): Extension[] {
  const language = getLanguageSupport(opts.fileName);

  // Drop CodeMirror's own "Mod-f" binding (opens its built-in search panel)
  // since we drive search/replace from our own FindReplacePanel component
  // and bind Ctrl+F to that instead. The rest of searchKeymap (F3, Mod-g,
  // Mod-d, etc.) stays intact.
  const editorSearchKeymap = searchKeymap.filter((binding) => binding.key !== "Mod-f");

  const extensions: Extension[] = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    search({ top: true }),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...editorSearchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        opts.onChange(update.state.doc.toString());
      }
      if ((update.docChanged || update.selectionSet) && opts.onCursorChange) {
        const state = update.state;
        const pos = state.selection.main.head;
        const line = state.doc.lineAt(pos);
        const text = state.doc.toString();
        const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        opts.onCursorChange({
          line: line.number,
          column: pos - line.from + 1,
          charCount: text.length,
          wordCount: words,
        });
      }
    }),
    opts.theme === "dark" ? darkTheme : lightTheme,
  ];

  if (opts.wordWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  if (language) {
    extensions.push(language);
  }

  return extensions;
}

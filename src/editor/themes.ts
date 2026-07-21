import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Extension } from "@codemirror/state";

const lightBase = EditorView.theme(
  {
    "&": {
      color: "#1f2430",
      backgroundColor: "#ffffff",
      height: "100%",
      fontSize: "13.5px",
    },
    ".cm-content": {
      caretColor: "#3b82f6",
      fontFamily:
        "'JetBrains Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#3b82f6" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "#dbeafe",
    },
    ".cm-activeLine": { backgroundColor: "#f8fafc" },
    ".cm-activeLineGutter": { backgroundColor: "#f1f5f9" },
    ".cm-gutters": {
      backgroundColor: "#ffffff",
      color: "#94a3b8",
      border: "none",
    },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 8px" },
    ".cm-scroller": { overflow: "auto" },
    "&.cm-focused": { outline: "none" },
    ".cm-searchMatch": { backgroundColor: "#fef08a" },
    ".cm-searchMatch-selected": { backgroundColor: "#fde047" },
  },
  { dark: false },
);

const lightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#7c3aed" },
  { tag: [t.string, t.special(t.string)], color: "#16a34a" },
  { tag: t.comment, color: "#94a3b8", fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null], color: "#ea580c" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#2563eb" },
  { tag: t.propertyName, color: "#0891b2" },
  { tag: t.typeName, color: "#0d9488" },
  { tag: t.definition(t.variableName), color: "#1f2430" },
  { tag: t.operator, color: "#475569" },
  { tag: t.tagName, color: "#dc2626" },
  { tag: t.attributeName, color: "#ca8a04" },
]);

export const lightTheme: Extension = [lightBase, syntaxHighlighting(lightHighlight)];

const darkExtras = EditorView.theme(
  {
    "&": { fontSize: "13.5px" },
    ".cm-content": {
      fontFamily:
        "'JetBrains Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
    ".cm-searchMatch": { backgroundColor: "#854d0e" },
    ".cm-searchMatch-selected": { backgroundColor: "#a16207" },
  },
  { dark: true },
);

export const darkTheme: Extension = [oneDark, darkExtras];

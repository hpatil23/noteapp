import type { LanguageSupport } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

const extensionMap: Record<string, () => LanguageSupport> = {
  js: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  mjs: () => javascript(),
  cjs: () => javascript(),
  ts: () => javascript({ typescript: true }),
  tsx: () => javascript({ typescript: true, jsx: true }),
  py: () => python(),
  rs: () => rust(),
  json: () => json(),
  md: () => markdown(),
  markdown: () => markdown(),
  html: () => html(),
  htm: () => html(),
  css: () => css(),
};

const languageLabels: Record<string, string> = {
  js: "JavaScript",
  jsx: "JavaScript (JSX)",
  mjs: "JavaScript",
  cjs: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript (JSX)",
  py: "Python",
  rs: "Rust",
  json: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
};

export function getExtensionFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function getLanguageSupport(name: string): LanguageSupport | null {
  const ext = getExtensionFromName(name);
  const factory = extensionMap[ext];
  return factory ? factory() : null;
}

export function getLanguageLabel(name: string): string {
  const ext = getExtensionFromName(name);
  return languageLabels[ext] ?? "Plain Text";
}

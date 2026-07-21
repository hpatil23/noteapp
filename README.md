# noteapp

[![CI](https://github.com/hpatil23/noteapp/actions/workflows/ci.yml/badge.svg)](https://github.com/hpatil23/noteapp/actions/workflows/ci.yml)

**noteapp** is a fast, minimalist desktop text editor for jotting down notes, editing config files, and writing small scripts — without the bloat of a full IDE. It opens instantly, stays out of your way, and looks clean and modern by default.

Built with a Rust backend for speed and a lightweight native webview UI, it runs natively on **Windows, macOS, and Linux**, with a single small installer per platform (no Electron, no Chromium bundle).

## Why noteapp?

- **Fast** — Rust handles file I/O, encoding detection, and settings; the UI is a lightweight native webview, not a bundled browser
- **Minimal, modern UI** — clean flat toolbar with [Lucide](https://lucide.dev/) icons, light/dark themes, no clutter
- **Cross-platform** — one codebase, native installers for Windows, macOS, and Linux
- **Just works** — multi-tab editing, recent files, session restore, and syntax highlighting out of the box

## Features

- Multi-tab editing with unsaved-changes indicators
- New / Open / Save / Save As, plus drag-and-drop files onto the window
- Recent files list, persisted across sessions
- Last-session restore (reopens your tabs on next launch)
- Find & Replace (case-sensitive / regex, next / previous / replace / replace all)
- Syntax highlighting for JS/TS, Python, Rust, JSON, Markdown, HTML, CSS (plain text otherwise)
- Light / dark theme toggle, word wrap toggle
- Status bar: line/column, character/word count, encoding, and line-ending (CRLF/LF)
- Detects when an open file changes on disk and offers to reload it
- Custom minimal title bar with native-feeling window controls

## Tech stack

- **Shell**: [Tauri v2](https://tauri.app) — Rust backend + OS-native webview
- **Frontend**: React + TypeScript + Tailwind CSS v4, bundled with Vite
- **Editor**: [CodeMirror 6](https://codemirror.net/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **State**: Zustand
- **Rust crates**: `tauri`, `tauri-plugin-dialog`, `tauri-plugin-window-state`, `encoding_rs`, `notify`, `serde`

## Development

Prerequisites: Node.js 18+, Rust (stable, `x86_64-pc-windows-msvc` on Windows), and the platform's native build tools:

- **Windows**: Visual Studio Build Tools (Desktop C++ workload) + Windows 10/11 SDK
- **macOS**: Xcode Command Line Tools
- **Linux**: `webkit2gtk`, `libayatana-appindicator3`, `librsvg2` dev packages (see [Tauri prerequisites](https://tauri.app/start/prerequisites/))

```bash
npm install
npm run tauri dev
```

## Building installers

```bash
npm run tauri build
```

This produces platform-native installers under `src-tauri/target/release/bundle/`:

- Windows: `.msi` and NSIS `.exe` setup
- macOS: `.dmg` / `.app`
- Linux: `.deb` / `.AppImage`

A verified Windows build's installers are included for reference in `dist-installers/` (not committed to version control).

## Project structure

```
src/                  React frontend
  components/         TitleBar, Toolbar, TabBar, EditorPane, StatusBar, FindReplacePanel, SettingsPanel
  editor/              CodeMirror language/theme/extension setup
  lib/                 Zustand store + typed Tauri IPC wrappers
src-tauri/            Rust backend
  src/commands/        file_ops, settings, encoding, watcher
```

## Downloads

Every push to `main` runs [CI](.github/workflows/ci.yml), which builds and verifies noteapp on Windows, macOS, and Linux (build artifacts are attached to each run, but require a GitHub login and expire after 14 days).

For a permanent, public download that anyone can grab without logging in, push a version tag (e.g. `git tag v0.1.0 && git push origin v0.1.0`) to trigger the [release workflow](.github/workflows/release.yml), which builds installers for all three platforms and attaches them to a draft [GitHub Release](https://github.com/hpatil23/noteapp/releases) — review and publish it from the Releases page when ready.

## License

[MIT](LICENSE) &copy; Harshal Anil Patil

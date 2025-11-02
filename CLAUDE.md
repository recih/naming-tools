# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese character radical lookup tool that allows users to search for characters by selecting one or more radicals (偏旁部首). Built with React 18, TypeScript, and modern web technologies.

## Essential Commands

```bash
# Development
pnpm install                          # Install dependencies (first time setup)
git submodule update --init --recursive  # Initialize chinese-xinhua data submodule
pnpm dev                              # Start dev server (http://localhost:5173)

# Code Quality
pnpm lint                             # Run Biome linting
pnpm format                           # Format code with Biome

# Build
pnpm build                            # Build for production (runs TypeScript check first)
pnpm preview                          # Preview production build
```

## Architecture

### Data Flow & Core Concepts

1. **Radical Detection with cnchar**: Uses the `cnchar` library to dynamically extract radicals from characters, NOT the static `radicals` field from chinese-xinhua data. This is critical - always use `cnchar.radical(char)` for radical operations.

2. **Data Sources**:
   - `chinese-xinhua` submodule: Provides character data (word, pinyin, explanation) via `/chinese-xinhua/data/word.json`
   - `cnchar`: Provides accurate radical detection at runtime
   - Data is fetched once and cached in module-level variables

3. **State Management** (Zustand):
   - `useSearchStore`: Manages radical selection, search mode (AND/OR), and search results. Auto-triggers search on radical toggle.
   - `useFavoritesStore`: Manages favorites with localStorage persistence via Zustand's `persist` middleware.

4. **Search Algorithm** (`src/data/loader.ts`):
   - Builds a `RadicalIndex` mapping radicals → characters using `cnchar.radical()`
   - OR mode: Returns characters matching ANY selected radical
   - AND mode: Returns characters where the character itself contains all selected radicals (Note: limited results since characters typically have one primary radical)

### Key Technical Decisions

- **Tailwind CSS v4**: Uses `@tailwindcss/vite` plugin (NOT PostCSS plugin). Configuration is in `src/index.css` using `@import "tailwindcss"` and `@theme` directive with `oklch` color values.

- **Path Aliases**: `@/` maps to `./src/` (configured in `vite.config.ts`)

- **Biome**: Configured for 2-space indentation, single quotes, and minimal semicolons. Ignores `tsconfig.*.json` files and `chinese-xinhua` submodule.

- **Component Structure**:
  - `src/components/ui/`: shadcn/ui base components (Button, Card, Badge, Switch, Tabs)
  - `src/components/`: Feature components that use stores and display character data

### Important Implementation Notes

- When adding new character display logic, always use `cnchar.radical(character.word)` for radical, never `character.radicals`
- Search is automatically triggered when users toggle radicals - don't add manual search buttons
- The `public/chinese-xinhua` is a symlink to the submodule; ensure it exists when setting up the project
- Favorites use the full `ChineseCharacter` object, not just the word string

## Development Workflow

1. Data changes require modifying `src/data/loader.ts`
2. UI state changes go through Zustand stores in `src/stores/`
3. New UI components should use shadcn/ui primitives from `src/components/ui/`
4. Always run `pnpm lint` before committing to catch Biome issues
5. Component styling uses Tailwind utility classes with the `cn()` helper from `src/lib/utils.ts`

## Submodule Management

The `chinese-xinhua` submodule must be initialized after cloning:
```bash
git submodule update --init --recursive
```

If the submodule is updated upstream:
```bash
git submodule update --remote chinese-xinhua
```

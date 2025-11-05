# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese character lookup tool that allows users to search for characters by:
- Selecting one or more radicals (偏旁部首)
- Filtering by five elements (五行: 金木水火土)
- Combining both radical and five element filters

Built with React 18, TypeScript, and modern web technologies. Commonly used for Chinese naming (起名) scenarios.

## Essential Commands

```bash
# Development
pnpm install                          # Install dependencies (includes cnchar, cnchar-radical, cnchar-poly, cnchar-info)
git submodule update --init --recursive  # Initialize chinese-xinhua data submodule
pnpm dev                              # Start dev server (http://localhost:5173)

# Code Quality
pnpm lint                             # Run Biome linting
pnpm format                           # Format code with Biome

# Build
pnpm build                            # Build for production (runs TypeScript check first)
pnpm preview                          # Preview production build
```

**Note**: cnchar plugins (`cnchar-radical`, `cnchar-poly`, `cnchar-info`) are auto-initialized in `src/main.tsx` via `cnchar.use()`.

## Architecture

### Data Flow & Core Concepts

1. **Radical Detection with cnchar**: Uses the `cnchar` library to dynamically extract radicals from characters, NOT the static `radicals` field from chinese-xinhua data. This is critical - always use `cnchar.radical(char)` for radical operations.

2. **Five Element Detection with cnchar-info**: Uses `cnchar.info(char)` to get five element (五行) properties. The `getFiveElement()` helper in `src/data/loader.ts` extracts the `fiveElement` field from the cnchar.info() result. Returns one of: 金, 木, 水, 火, 土.

3. **Data Sources**:
   - `chinese-xinhua` submodule: Provides character data (word, pinyin, explanation) via `/chinese-xinhua/word.json` (symlink points to data directory only)
   - `cnchar-radical`: Provides accurate radical detection at runtime
   - `cnchar-info`: Provides five element (五行) data at runtime
   - Data is fetched once and cached in module-level variables

4. **State Management** (Zustand):
   - `useSearchStore`: Manages radical selection, five element selection, search mode (AND/OR), and search results. Auto-triggers search on radical/five element toggle.
   - `useFavoritesStore`: Manages favorites with localStorage persistence via Zustand's `persist` middleware.

5. **Search Algorithm** (`src/data/loader.ts`):
   - Builds a `RadicalIndex` mapping radicals → characters using `cnchar.radical()`
   - Provides `getFiveElement(char)` using `cnchar.info()` for five element lookup
   - Provides `filterByFiveElements()` to filter characters by 五行 with deduplication
   - **Supports three search modes**:
     - **Radical only**: OR/AND mode for radical matching
     - **Five element only**: Searches all characters, filters by selected elements (金木水火土)
     - **Combined**: Applies five element filter after radical search
   - **Data deduplication**: `loadCharacters()` removes duplicate entries from chinese-xinhua data to prevent React key warnings

### Key Technical Decisions

- **Tailwind CSS v4**: Uses `@tailwindcss/vite` plugin (NOT PostCSS plugin). Configuration is in `src/index.css` using `@import "tailwindcss"` and `@theme` directive with `oklch` color values.

- **Path Aliases**: `@/` maps to `./src/` (configured in `vite.config.ts`)

- **Biome**: Configured for 2-space indentation, single quotes, and minimal semicolons. Ignores `tsconfig.*.json` files and `chinese-xinhua` submodule.

- **Component Structure**:
  - `src/components/ui/`: shadcn/ui base components (Button, Card, Badge, Switch, Tabs)
  - `src/components/`: Feature components that use stores and display character data
    - `RadicalSelector.tsx`: Radical selection with pinyin filter
    - `FiveElementSelector.tsx`: Five element filter UI with color-coded buttons (金木水火土)
    - `CharacterCard.tsx`: Displays character with ruby pinyin, five element badge, and hover tooltip
    - `SearchResults.tsx`: Grid display of matching characters
    - `FavoritesView.tsx`: Saved favorites display

### Important Implementation Notes

- **Radical detection**: Always use `cnchar.radical(character.word)` for radical, never `character.radicals` from chinese-xinhua data
- **Five element detection**: Always use `getFiveElement(character.word)` which calls `cnchar.info()`, never a static field
- **Character cards**: Use HTML `<ruby>` tags for pinyin display above characters (semantic and accessible)
- **Five element colors**: Color-coded badges follow traditional associations:
  - 金 (Metal): amber/gold background
  - 木 (Wood): green background
  - 水 (Water): blue background
  - 火 (Fire): red background
  - 土 (Earth): yellow/brown background
- **Search behavior**: Automatically triggered on radical/five element toggle - don't add manual search buttons
- **Five-element-only searches**: Users can search by five elements without selecting any radicals
- **Data deduplication**: Both `loadCharacters()` and `filterByFiveElements()` use Set-based deduplication to prevent duplicate character warnings
- **Symlink structure**: `public/chinese-xinhua` is a symlink to `chinese-xinhua/data` directory (not the entire submodule), exposing only JSON data files
- **Favorites persistence**: Uses the full `ChineseCharacter` object, not just the word string, persisted to localStorage

## Development Workflow

1. Data changes require modifying `src/data/loader.ts`
2. UI state changes go through Zustand stores in `src/stores/`
3. New UI components should use shadcn/ui primitives from `src/components/ui/`
4. Always run `pnpm lint` before committing to catch Biome issues
5. Component styling uses Tailwind utility classes with the `cn()` helper from `src/lib/utils.ts`

## Type Definitions

Key types defined in `src/types/index.ts`:

- **`FiveElement`**: Union type for five elements

  ```typescript
  type FiveElement = '金' | '木' | '水' | '火' | '土'
  ```

- **`SearchMode`**: Union type for radical search modes

  ```typescript
  type SearchMode = 'AND' | 'OR'
  ```

- **`ChineseCharacter`**: Main character data type

  ```typescript
  interface ChineseCharacter {
    word: string
    pinyin: string
    explanation: string
    // Note: fiveElement field is computed on-demand via getFiveElement(), not stored
  }
  ```

- **`RadicalIndex`**: Mapping from radicals to characters

  ```typescript
  interface RadicalIndex {
    [radical: string]: ChineseCharacter[]
  }
  ```

## Submodule Management

The `chinese-xinhua` submodule must be initialized after cloning:

```bash
git submodule update --init --recursive
```

If the submodule is updated upstream:

```bash
git submodule update --remote chinese-xinhua
```

## About Context7

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## shadcn/ui Component Builder Assistant

You are a Senior UI/UX Engineer and expert in ReactJS, TypeScript, component design systems, and accessibility. You specialize in building, extending, and customizing shadcn/ui components with deep knowledge of Radix UI primitives and advanced Tailwind CSS patterns.

Always use shadcn mcp to install components instead of create components by yoursself.

### Core Responsibilities

* Follow user requirements precisely and to the letter
* Think step-by-step: describe your component architecture plan in detailed pseudocode first
* Confirm approach, then write complete, working component code
* Write correct, best practice, DRY, bug-free, fully functional components
* Prioritize accessibility and user experience over complexity
* Implement all requested functionality completely
* Leave NO todos, placeholders, or missing pieces
* Include all required imports, types, and proper component exports
* Be concise and minimize unnecessary prose

### Technology Stack Focus

* **shadcn/ui**: Component patterns, theming, and customization
* **Radix UI**: Primitive components and accessibility patterns
* **TypeScript**: Strict typing with component props and variants
* **Tailwind CSS**: Utility-first styling with shadcn design tokens
* **Class Variance Authority (CVA)**: Component variant management
* **React**: Modern patterns with hooks and composition

### Code Implementation Rules

#### Component Architecture

* Use forwardRef for all interactive components
* Implement proper TypeScript interfaces for all props
* Use CVA for variant management and conditional styling
* Follow shadcn/ui naming conventions and file structure
* Create compound components when appropriate (Card.Header, Card.Content)
* Export components with proper display names

#### Styling Guidelines

* Always use Tailwind classes with shadcn design tokens
* Use CSS variables for theme-aware styling (hsl(var(--primary)))
* Implement proper focus states and accessibility indicators
* Follow shadcn/ui spacing and typography scales
* Use conditional classes with cn() utility function
* Support dark mode through CSS variables

#### Accessibility Standards

* Implement ARIA labels, roles, and properties correctly
* Ensure keyboard navigation works properly
* Provide proper focus management and visual indicators
* Include screen reader support with appropriate announcements
* Test with assistive technologies in mind
* Follow WCAG 2.1 AA guidelines

#### shadcn/ui Specific

* Extend existing shadcn components rather than rebuilding from scratch
* Use Radix UI primitives as the foundation when building new components
* Follow the shadcn/ui component API patterns and conventions
* Implement proper variant systems with sensible defaults
* Support theming through CSS custom properties
* Create components that integrate seamlessly with existing shadcn components

#### Component Patterns

* Use composition over complex prop drilling
* Implement proper error boundaries where needed
* Create reusable sub-components for complex UI patterns
* Use render props or compound components for flexible APIs
* Implement proper loading and error states
* Support controlled and uncontrolled component modes

### Response Protocol

1. If uncertain about shadcn/ui patterns, state so explicitly
2. If you don't know a specific Radix primitive, admit it rather than guessing
3. Search for latest shadcn/ui and Radix documentation when needed
4. Provide component usage examples only when requested
5. Stay focused on component implementation over general explanations

### Knowledge Updates

When working with shadcn/ui, Radix UI, or component design patterns, search for the latest documentation and community best practices to ensure components follow current standards and accessibility guidelines.

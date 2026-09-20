# Task: Redesign all screens of PageTurner with Material Design 3, preserving content & behavior

## Context

You are working on **PageTurner**, a gamified EPUB reader mobile app. It is a React Native app built with:

- **Expo SDK 53**, React Native 0.79, React 19, TypeScript
- **expo-router** v5 file-based routing (`app/` directory) — do NOT move or rename routes
- **NativeWind v4 + Tailwind** for styling (utility classes in `className`), with custom color palette tokens in `src/constants/index.ts` (`graphite`, `faded-copper`, `khaki-beige`, `soft-linen`, `golden-apricot`, plus more) and custom fonts (`font-heading`/Lora, `font-body`/`font-lato-*`)
- **gluestack-ui** wrappers already present under `components/ui/`
- **Zustand** stores (`src/store/`) + **WatermelonDB** + **MMKV** — do NOT change any state/data logic
- Path alias `@/` → project root

## Design language

Redesign using **Google Material 3 (Material You)**: elevation/tonal surfaces, M3 color roles (primary/surface/on-surface/surface-container, etc.), rounded-corner shapes (M3 shape scale: extra-small 4dp → extra-large 28dp), soft shadows, generous motion spacing. Apply a calm warm "coffee & reading" Material theme that fits the existing palette (khaki-beige, golden-apricot, deep-mocha/graphite) and supports both light and dark themes.

- Keep using NativeWind utility classes / Tailwind tokens (extend `tailwind.config.js` if needed, e.g. new `surface`, `surfaceContainer`, `onSurface`, `elevation` tokens). Do NOT add a new styling system.
- If implementing Material components is impractical, restyle existing ones to *look* M3, but prefer gluestack-ui components where they already exist.

## Hard constraints (do not break)

1. **Content is sacred**: every piece of text, stat, button, list, image, and empty-state currently shown MUST remain visible and functional. Do not remove, rename, or repurpose content.
2. **Behavior is sacred**: navigation, state stores, services, DB calls, document picker, bookmarks, favorites, session tracking, epubjs reader, notifications — all keep working. You are restyling and re-laying-out, not rewriting logic.
3. **Do not move/rename route files** in `app/`. Keep the bottom tab structure.
4. Keep TypeScript types intact and pass `npm run validate` (type-check + lint + format:check) before finishing.

## Screens to redesign (current layout → target)

### 1. Home — `app/(main)/index.tsx` → `src/screens/HomeScreen.tsx`
Currently a stacked ScrollView. Preserve this content in a cohesive M3 dashboard layout:
- Greeting: "Good Morning/Afternoon/Evening Natasha" + "What are we reading today?"
- SearchBox (currently a no-op — keep a no-op or hide it if it clutters; if hidden, note it)
- StreakSummary card: big streak number + "Daily Streak" + fire accent
- MinutesReadToday card: today's minutes + "X Min To Your Daily Goal (5)" or "Goal reached 🏆"
- XPSummary card: "N XP"
- "Currently Reading" horizontal wide tiles with progress
- "Newly Added" horizontal cover tiles (max 5)
- Empty state (library empty): illustration + "Your Library is empty..." + "Start Reading" button → navigates to Library tab

Target: unmistakably Material — e.g. a greeting header, a tonal stats row (streak + goal + XP as M3 cards), then sections with M3 section headers. Keep the two stat cards and streak card visually balanced.

### 2. Library — `app/(main)/(library)/index.tsx` → `src/screens/LibraryScreen.tsx`
Currently: "Library" title + "Add books" link; search box; 2-column grid of `BookTile`s; pull-to-refresh; loading pulse; empty state.
Target: M3 top app bar with "Add books" as an Icon/FAB-style action, M3 search field, 2-column book grid with tonal tiles, M3 empty state / loading shimmer.

### 3. Book Details — `app/(main)/(library)/book/[uri].tsx` → `src/screens/BookDetailsScreen.tsx`
Currently: back arrow + favorite toggle; centered large cover; title, subtitle, author; thin progress bar + "% completed"; pill "Read Book" button; "Summary" description from metadata.
Target: M3 details screen — large rounded cover elevation, title/subtitle/author as M3 typography, progress as M3 LinearProgressIndicator, prominent FilledButton "Read Book", description in surface-container card.

### 4. Bookmarks — `app/(main)/bookmarks.tsx` → `src/screens/BookmarksScreen.tsx`
Currently: FavoritesList (favorited books) + "Bookmarks" title + BookmarkList.
Target: M3 top app bar + tabs or segmented control ("Favorites" / "Bookmarks") if appropriate, tonal list cards.

### 5. Profile — `app/(main)/profile/index.tsx` (inline component)
Currently: "Profile" title + raw flat list of every reading session (id, date, minutes). This is the weakest screen.
Target: a real M3 profile/stats screen — header with avatar/initials + name, stat summary, and session history rendered as readable M3 list items. **Keep all the same data visible** (date + minutes per session); you may organize it better (e.g. grouped by day), but do not drop sessions.
Add a note: user name "Natasha" is hardcoded; don't invent a real auth system.

### 6. Reader — `app/reader/[uri].tsx` + related components
- `ReaderContent` (epubjs scrolled reader)
- `ReaderOptionsFAB` (bookmark / theme toggle / TOC / settings)
- `TOCActionSheet` (chapter list bottom sheet)
- `ReaderSettingsSheet` (in-book search, font size, brightness sliders)
Target: keep the reading surface itself clean; restyle the overlay chrome (FAB, bottom sheets, settings sliders/segmented options) in M3 style with proper elevation, rounded corners, and dark/light awareness. Do not change reader engine, theme switching, or session logic.

### 7. Tab bar — `app/(main)/_layout.tsx`
Currently: floating pill bottom bar, Feather icons, no labels, `home_tab_items` config.
Target: M3-style navigation bar — tonal active indicator ("active pill" in M3 = the active icon in an elevated/tonal container), proper contrast, safe-area handling. Keep icons + routes identical.

## Workflow

1. Read the existing screens & their components under `src/screens/`, `src/components/`, `app/`, `src/constants/`.
2. Redesign one screen at a time, screens 1→7, verifying imports and types after each.
3. Keep every TSX file where expected; extract shared M3 primitives (Card, SectionHeader, StatCard, LinearProgress, EmptyState, FAB) into `src/components/` if that reduces duplication across screens, and reuse them consistently.
4. Ensure light + dark theme both look right (check `userInterfaceStyle: automatic` in `app.json`).
5. Run `npm run validate` and fix any type-check, lint, or format errors. Also confirm `npm run start` boots via `npx expo export` or an equivalent quick check if feasible.

## Definition of done

- All screens redesigned in a consistent Material 3 style
- Every piece of existing content still present and functional
- Light & dark themes supported, tab bar + navigation unchanged
- `npm run validate` passes
- No logic, store, service, or DB changes
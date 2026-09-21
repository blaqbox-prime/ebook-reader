# Design Guide for Ebook Reader App

This guide outlines the color theme, fonts, and common styles used in the Ebook
Reader mobile application. It serves as a reference for maintaining design
consistency when generating new screens or components using Google Stitch or
other design tools.

## Color Palette

The app uses a warm, earthy color scheme inspired by book aesthetics, with
custom color palettes defined in Tailwind CSS. Colors are available in light and
dark modes via CSS variables.

### Custom App Colors

These are the primary brand colors used throughout the app:

- **app-taupe-grey**: A neutral taupe grey palette ranging from light (#f4f2f1)
  to dark (#141110). Used for text and subtle backgrounds.
- **app-deep-mocha**: A rich mocha brown palette from light beige (#f4f2f0) to
  deep brown (#15110f). Commonly used for buttons and UI elements.
- **app-ash-brown**: A muted ash brown palette similar to deep-mocha but
  slightly different shades.
- **app-khaki-beige**: A warm khaki beige palette for progress indicators and
  accents.
- **app-golden-apricot**: A vibrant golden apricot palette (#fcf3e9 to #1f1205)
  used for highlights and achievements.

### Semantic Colors

The app uses semantic color tokens that adapt to light/dark themes:

- **Primary**: Grays from light (#b3b3b3) to dark (#080808) in light mode.
- **Secondary**: Light grays in light mode, dark grays in dark mode.
- **Tertiary**: Warm orange tones.
- **Error**: Red tones for errors.
- **Success**: Green tones for success states.
- **Warning**: Orange tones for warnings.
- **Info**: Blue tones for information.
- **Typography**: Text colors ranging from white to black.
- **Background**: Background colors from white to black.
- **Outline**: Border colors.

### Common Color Usage

- **Backgrounds**:
  - Main backgrounds: `bg-white` or `bg-background-0`
  - Modal overlays: `bg-black/95`
  - Cards: `bg-stone-50` or `bg-app-ash-brown-800`
  - Buttons: `bg-app-deep-mocha-700`, `bg-app-golden-apricot-600`
  - Progress bars: `bg-app-khaki-beige-700`
  - Settings panels: `bg-app-ash-brown-800`

- **Text Colors**:
  - Primary text: `text-primary` or `text-typography-900`
  - Secondary text: `text-secondary-500`, `text-gray-600`,
    `text-app-taupe-grey-500`
  - White text: `text-white`
  - Accent text: `text-app-khaki-beige-700`, `text-amber-700`

- **Reader Background**: The ebook reader uses a warm beige background
  (`#fdfaf3`) for eye-friendly reading.

## Typography

The app uses two main font families: Lato for body text and UI elements, Lora
for headings and titles.

### Fonts

- **Lato**: Sans-serif font used for body text, buttons, and UI elements.
  - Available weights: Thin, Light, Regular, Bold, Black, Italic
  - Tailwind classes: `font-lato-thin`, `font-lato-light`, `font-lato-regular`,
    `font-lato-bold`, `font-lato-black`

- **Lora**: Serif font used for headings and book titles.
  - Variable font with weight range
  - Tailwind classes: `font-lora`, `font-heading`

### Font Usage

- **Headings**: `font-lora` or `font-heading` (Lora)
- **Body Text**: `font-lato-regular` or `font-body` (Lato)
- **Bold Text**: `font-lato-bold`
- **Button Text**: `font-lato-bold`
- **Book Titles**: `font-lato-black`

### Text Sizes

- Large headings: `text-5xl`
- Medium headings: `text-3xl`, `text-2xl`
- Body text: `text-xl`, `text-lg`, `text-base`
- Small text: `text-sm`

## Common Styles

### Layout Patterns

- **Cards**: Rounded corners (`rounded-xl`, `rounded-2xl`), padding (`p-4`,
  `p-6`), shadows (`shadow-hard-1` to `shadow-hard-5`)
- **Buttons**: Rounded full (`rounded-full`), padding (`py-4 px-6`), centered
  content with flexbox
- **Lists**: Margin bottom (`mb-4`), padding (`p-1`)
- **Modals/Sheets**: Dark backgrounds (`bg-app-ash-brown-800`), white text, drag
  indicators

### Component Patterns

- **Book Tiles**: Image with rounded corners (`rounded-xl`), title in
  `font-lato-black`, author in smaller gray text
- **Progress Bars**: Thin bars (`h-1`, `h-[4px]`) with rounded ends, progress in
  accent colors
- **Settings Panels**: Dark backgrounds, white text, centered titles
- **Achievement Modals**: Light backgrounds (`bg-stone-50`), amber accents
  (`bg-amber-200`, `text-amber-700`)

### Spacing

- Consistent use of Tailwind spacing: `gap-4`, `mt-2`, `mb-4`, `p-4`, `px-6`,
  `py-4`
- Line heights: `leading-snug`, `leading-relaxed`
- Letter spacing: `tracking-wide`

### Shadows

- Hard shadows for depth: `shadow-hard-1` (subtle) to `shadow-hard-5` (stronger)
- Soft shadows: `shadow-soft-1` to `shadow-soft-4`

### Borders and Outlines

- Rounded corners: `rounded-full`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Borders: `border-4`, `border-amber-700`

## Design Principles

1. **Warm and Book-like**: Use earthy tones and serif fonts for a literary feel
2. **High Contrast**: Ensure text readability with appropriate color
   combinations
3. **Consistent Spacing**: Use standard Tailwind spacing units
4. **Rounded Elements**: Prefer rounded corners for a modern, friendly
   appearance
5. **Dark Mode Support**: All colors adapt to light/dark themes via CSS
   variables

## Usage in Google Stitch

When generating new designs:

- Use the custom app colors (app-taupe-grey, app-deep-mocha, etc.) as primary
  colors
- Apply Lato for UI text and Lora for headings
- Maintain the warm beige reader background for reading interfaces
- Use rounded corners and consistent spacing
- Ensure designs work in both light and dark modes

This guide ensures all new screens maintain visual consistency with the existing
app design.

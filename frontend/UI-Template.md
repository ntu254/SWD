# GreenLoop - UI/UX Design System & Specification

This document serves as the "Source of Truth" for the visual style of the GreenLoop application. All new UI components must strictly adhere to these guidelines to maintain consistency.

---

## 1. Design System Core (Design Tokens)

### 1.1. Typography
*   **Headings (`font-display`):** `Fredoka`
    *   Used for: Titles, Huge stats, Marketing headers.
    *   Characteristics: Rounded, friendly, "Eco" vibe.
*   **Body (`font-sans`):** `Nunito`
    *   Used for: Paragraphs, Inputs, Labels, Button text.
    *   Characteristics: Highly readable, rounded sans-serif.

### 1.2. Color Palette (Tailwind Config)
*   **Brand (Primary - Emerald/Green):**
    *   `bg-brand-600`: Primary buttons, gradients (`from-brand-600`).
    *   `text-brand-600`: Links, primary icons, highlights.
    *   `bg-brand-50`: Backgrounds for subtle sections.
    *   `border-brand-200/300`: Subtle borders.
*   **Accent (Secondary - Amber/Orange):**
    *   `text-accent-500`: Stars, warnings, gamification points.
    *   `bg-accent-100`: Highlight backgrounds.
*   **Neutral:**
    *   `bg-gray-50`: App background.
    *   `text-gray-800`: Primary text.
    *   `text-gray-500/600`: Secondary text/descriptions.

### 1.3. Shapes & Spacing
*   **Border Radius:**
    *   **Buttons/Inputs:** `rounded-xl` (12px) - Soft but structured.
    *   **Cards:** `rounded-2xl` (16px) or `rounded-3xl` (24px) - Very friendly/modern.
    *   **Icons/Actions:** `rounded-full`.
*   **Shadows:**
    *   **Cards:** `shadow-xl`, `shadow-sm`.
    *   **Buttons:** `shadow-lg`, `shadow-brand-500/30` (Colored shadows).

### 1.4. Visual Effects
*   **Glassmorphism (Frosted Glass):**
    *   Usage: Overlays on gradients, sticky headers, floating elements.
    *   Classes: `bg-white/20 backdrop-blur-md` or `bg-white/80 backdrop-blur-xl`.
*   **Gradients:**
    *   Primary Background: `bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700`.

---

## 2. Component Standards (Copy-Paste Ready)

### 2.1. Buttons
**Primary Button:**
```tsx
<button className="
    w-full py-3.5 px-6 rounded-xl font-bold text-lg
    bg-brand-600 text-white
    shadow-lg shadow-brand-500/30
    hover:bg-brand-700 hover:shadow-brand-500/50 hover:scale-[1.02]
    transition-all duration-300
    disabled:opacity-70 disabled:cursor-not-allowed
">
    Label
</button>
```

**Secondary/Outline Button:**
```tsx
<button className="
    py-3 px-6 rounded-xl font-medium
    bg-white border border-gray-200 text-gray-700
    hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900
    transition-colors duration-200
">
    Cancel
</button>
```

**Icon Button (Glass):**
```tsx
<button className="
    p-2 rounded-full
    bg-white/80 backdrop-blur-md
    text-gray-600 hover:text-brand-600 hover:bg-white
    shadow-sm transition-all hover:scale-105
">
    <Icon size={24} />
</button>
```

### 2.2. Form Inputs
**Standard Input:**
```tsx
<div className="group space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 ml-1">Label</label>
    <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
        <input 
            className="
                w-full pl-10 pr-4 py-3 
                bg-gray-50 border border-gray-200 rounded-xl
                font-medium text-gray-800
                focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none
                transition-all duration-200
                placeholder:text-gray-400
            "
        />
    </div>
</div>
```

**Error State:**
*   Add: `border-red-300 focus:border-red-500 focus:ring-red-500/10`
*   Icon: `text-red-400`

### 2.3. Cards & Containers
**Main Content Card:**
```tsx
<div className="
    bg-white rounded-2xl shadow-xl p-8 
    border border-gray-100
    animate-in fade-in zoom-in-95 duration-500
">
    {/* Content */}
</div>
```

**Glass Card (Dark/Gradient Background):**
```tsx
<div className="
    bg-white/10 backdrop-blur-xl p-6 rounded-3xl 
    border border-white/10 shadow-2xl
">
    {/* Content */}
</div>
```

---

## 3. Animations (`tailwind.config.js`)

*   `animate-in fade-in zoom-in-95`: Used for page loads, modals appearing.
*   `animate-float`: `float 6s ease-in-out infinite` (Used for decorative elements).
*   `animate-bounce-slow`: `bounce 3s infinite` (Used for attention grabbers).
*   `hover:scale-[1.02]` or `hover:scale-105`: Micro-interactions on clickable elements.

---

## 4. UI Patterns & Layouts

### 4.1. Page Layout (Auth/Landing)
*   **Split Screen:** 
    *   Left/Top (Decor): Gradient background (`from-brand-600 to-brand-700`) + Glass cards + Illustrations.
    *   Right/Bottom (Action): Clean `bg-gray-50` background + White shadow cards for forms.
    
### 4.2. Icons
*   Library: `lucide-react`
*   Size: Standard `20px` (sm) or `24px` (md).
*   Color: `text-brand-600` for primary actions, `text-gray-400` for inactive.

---

## 5. Feature Implementation Notes (Updated)

### 5.1. Hero Section
*   **Style:** Gradient background with Floating 3D elements (Glassmorphism).
*   **Typography:** Giant `Fredoka` font for headlines.

### 5.2. Dashboard / Role Features
*   **Cards:** Use the "Main Content Card" style (White, Shadow-XL, Rounded-2xl).
*   **Tabs:** Rounded-full styles, smooth sliding backgrounds using `framer-motion` or CSS transitions.

### 5.3. Leaderboards
*   **Rows:** Alternating `bg-gray-50` and `bg-white`.
*   **Top 3:** distinct styling (Gold/Silver/Bronze accents) using `ring` or `border` colors.

---

*Use this document as a prompt context when generating new UI components to ensure visual consistency.*
